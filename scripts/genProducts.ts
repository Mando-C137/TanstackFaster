import { db } from "../src/db";
import { Effect, Schedule, Console, Cause } from "effect";
import {
  products as products_table,
  categories,
  subcategories as subcategories_table,
  subcategories,
  products,
  subcollections,
} from "../src/db/schema";
import { eq, sql, lt } from "drizzle-orm";
import { openai } from '@ai-sdk/openai';

import { z } from "zod";
import slugify from "slugify";
import { generateText } from "ai";

const productValidator = z.object({
  products: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
    }),
  ),
});

const categoryValidator = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
    }),
  ),
});


const makeProductPrompt = (categoryName: string) => `
  You are given the name of a product category for products in an art supply store.
  Your task is to generate 10 products. Each product has a name, description, and price.

  YOU MUST OUTPUT IN ONLY JSON.

  EXAMPLE:

  INPUT:
  Category Name: Painting Supplies

  OUTPUT:
  {
    "products": [
      {
        "name": "Acrylic Paints (Basic and Professional Grades)",
        "description": "High-quality, student-grade acrylic paint with smooth consistency.",
        "price": 19.99,
      }, 
    ...
  }

  NOW YOUR TURN,

  INPUT:
  Category Name: ${categoryName}

  OUTPUT:`;

const makeCategoryPrompt = (categoryName: string) => `
  You are given the name of a product category for products in an art supply store.
  Your task is to generate 10 sub-categories. Each sub-category has a name.

  YOU MUST OUTPUT IN ONLY JSON.

  EXAMPLE:

  INPUT:
  Category Name: Sketching Pencils

  OUTPUT:
  {
    "categories": [
      {
        "name": "Colored Pencils",
      }, 
      {
        "name": "Charcoal Pencils",
      }, 
    ...
  }

  NOW YOUR TURN,

  INPUT:
  Category Name: ${categoryName}

  OUTPUT:`;

const mainEffect = Effect.gen(function* () {
  // find subcollections with less than 5 subcategories
  // const subcollectionsWithLessThan5Subcategories = yield* Effect.tryPromise(
  //   () =>
  //     db
  //       .select({
  //         subcollectionId: subcollection.id,
  //         subcollectionName: subcollection.name,
  //         subcategoryCount: sql<number>`COUNT(${subcategories.slug})`,
  //       })
  //       .from(subcollection)
  //       .leftJoin(
  //         subcategories,
  //         eq(subcollection.id, subcategories.subcollection_id),
  //       )
  //       .groupBy(subcollection.id, subcollection.name)
  //       .having(eq(sql<number>`COUNT(${subcategories.slug})`, 0)),
  // );
  // console.log(
  //   `found ${subcollectionsWithLessThan5Subcategories.length} subcollections with no subcategories`,
  // );
  // let counter1 = 0;
  // yield* Effect.all(
  //   subcollectionsWithLessThan5Subcategories.map((coll) =>
  //     Effect.gen(function* () {
  //       console.log(
  //         `starting ${counter1++} of ${subcollectionsWithLessThan5Subcategories.length}`,
  //       );
  //       console.log("starting", coll.subcollectionName);
  //       const res = yield* Effect.tryPromise(() =>
  //         openai.chat.completions.create({
  //           model: "gpt-5-nano",
  //           messages: [
  //             {
  //               role: "user",
  //               content: makeCategoryPrompt(coll.subcollectionName),
  //             },
  //           ],
  //         }),
  //       ).pipe(Effect.tapErrorCause((e) => Console.error("hi", e)));
  //       const text = res.choices[0].message.content;
  //       if (!text) {
  //         return yield* Effect.fail("no json");
  //       }
  //       const json = yield* Effect.try(() => JSON.parse(text));
  //       const res2 = categoryValidator.safeParse(json);
  //       if (!res2.success) {
  //         return yield* Effect.fail("invalid json");
  //       }
  //       yield* Effect.all(
  //         res2.data.categories
  //           .map(
  //             (category) =>
  //               ({
  //                 ...category,
  //                 slug: slugify(category.name),
  //                 subcollection_id: coll.subcollectionId,
  //               }) as const,
  //           )
  //           .map((x) =>
  //             Effect.tryPromise(() => db.insert(subcategories).values(x)).pipe(
  //               Effect.catchAll((e) => Effect.void),
  //             ),
  //           ),
  //       );
  //       console.log("data inserted");
  //     }),
  //   ),
  //   { mode: "either", concurrency: 4 },
  // );
  // // find subcategories withless than 5 products
  const subcategoriesWithLessThan5Products = yield* Effect.tryPromise(() =>
    db
      .select({
        subcategorySlug: subcategories.slug,
        subcategoryName: subcategories.name,
        productCount: sql<number>`COUNT(${products.slug})`,
      })
      .from(subcategories)
      .leftJoin(products, eq(subcategories.slug, products.subcategory_slug))
      .groupBy(subcategories.slug, subcategories.name)
      .having(eq(sql<number>`COUNT(${products.slug})`, 0)),
  );
  console.log(
    `found ${subcategoriesWithLessThan5Products.length} subcategories with no products`,
  );
  let counter2 = 0;
  yield* Effect.all(
    subcategoriesWithLessThan5Products.map((cat) =>
      Effect.gen(function* () {
        console.log(
          `starting ${counter2++} of ${subcategoriesWithLessThan5Products.length}`,
        );
        console.log("starting", cat.subcategoryName);
        const res = yield* Effect.tryPromise(() =>
          generateText({
            model: openai("gpt-5-nano"),
            messages: [
              {
                role: "user",
                content: makeProductPrompt(cat.subcategoryName),
              },
            ],
          }),
        );
        const json = res.text
        if (!json) {
          return yield* Effect.fail("no json");
        }
        const res2 = productValidator.safeParse(JSON.parse(json));
        if (!res2.success) {
          return yield* Effect.fail("invalid json");
        }
        yield* Effect.all(
          res2.data.products
            .map((product) => ({
              ...product,
              price: product.price.toString(),
              subcategory_slug: cat.subcategorySlug,
              slug: slugify(product.name),
            }))
            .map((x) =>
              Effect.tryPromise(() => db.insert(products).values(x)).pipe(
                Effect.catchAll((e) => Effect.void),
              ),
            ),
          {
            concurrency: 5,
          },
        );
      }),
    ),
    { concurrency: 3 },
  );
});


async function main() {
  const exit = await Effect.runPromiseExit(
    mainEffect.pipe(Effect.retry({ schedule: Schedule.spaced("1 seconds") })),
  );
  console.log(exit.toString());

}
main()
