import { and, count, eq, sql } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { verifyToken } from "./session";
import { cacheLife } from "./cache";
import {
  categories,
  products as productsDrizzle,
  subcategories,
  subcollections,
  users,
} from "@/db/schema";
import { db } from "@/db";

export const getUser = createServerFn().handler(async () => {
  const sessionCookie = getCookie("session");
  if (!sessionCookie) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie);
  if (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !sessionData ||
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
});

export const getProductsForSubcategory = createServerFn()
  .inputValidator((subcategorySlug: string) => ({
    subcategorySlug,
  }))
  .handler(async ({ data: { subcategorySlug } }) => {
    cacheLife("hours");

    return db.query.products.findMany({
      where: (products, { eq: equal, and: andP }) =>
        andP(equal(products.subcategory_slug, subcategorySlug)),
      orderBy: (productsB, { asc }) => asc(productsB.slug),
    });
  });

export const getCollections = createServerFn().handler(async () => {
  cacheLife("hours");

  return db.query.collections.findMany({
    with: {
      categories: true,
    },
    orderBy: (collections, { asc }) => asc(collections.name),
  });
});

export const getProductDetails = createServerFn()
  .inputValidator((productSlug: string) => ({
    productSlug,
  }))
  .handler(async ({ data: { productSlug } }) => {
    cacheLife("hours");
    return db.query.products.findFirst({
      where: (products, { eq: equal }) => equal(products.slug, productSlug),
    });
  });

export const getSubcategory = createServerFn()
  .inputValidator(({ subcategorySlug }: { subcategorySlug: string }) => ({
    subcategorySlug,
  }))
  .handler(async ({ data: { subcategorySlug } }) => {
    cacheLife("hours");
    return db.query.subcategories.findFirst({
      where: (subcategoriesB, { eq: equal }) =>
        equal(subcategoriesB.slug, subcategorySlug),
    });
  });

export const getCategory = createServerFn()
  .inputValidator((categorySlug: string) => ({
    categorySlug,
  }))
  .handler(async ({ data: { categorySlug } }) => {
    cacheLife("hours");
    return db.query.categories.findFirst({
      where: (categoriesB, { eq: equal }) =>
        equal(categoriesB.slug, categorySlug),
      with: {
        subcollections: {
          with: {
            subcategories: true,
          },
        },
      },
    });
  });

export const getCollectionDetails = createServerFn()
  .inputValidator((collectionSlug: string) => ({
    collectionSlug,
  }))
  .handler(async ({ data: { collectionSlug } }) => {
    cacheLife("hours");
    return db.query.collections.findMany({
      with: {
        categories: true,
      },
      where: (collections, { eq: equal }) =>
        equal(collections.slug, collectionSlug),
      orderBy: (collections, { asc }) => asc(collections.slug),
    });
  });

export const getProductCount = createServerFn().handler(async () => {
  cacheLife("hours");
  return db.select({ count: count() }).from(productsDrizzle);
});

// // could be optimized by storing category slug on the products table
export const getCategoryProductCount = createServerFn()
  .inputValidator((categorySlug: string) => ({ categorySlug }))
  .handler(async ({ data: { categorySlug } }) => {
    cacheLife("hours");
    return db
      .select({ count: count() })
      .from(categories)
      .leftJoin(
        subcollections,
        eq(categories.slug, subcollections.category_slug),
      )
      .leftJoin(
        subcategories,
        eq(subcollections.id, subcategories.subcollection_id),
      )
      .leftJoin(
        productsDrizzle,
        eq(subcategories.slug, productsDrizzle.subcategory_slug),
      )
      .where(eq(categories.slug, categorySlug));
  });

export const getSubcategoryProductCount = createServerFn()
  .inputValidator((subcategorySlug: string) => ({ subcategorySlug }))
  .handler(async ({ data: { subcategorySlug } }) => {
    cacheLife("hours");
    return db
      .select({ count: count() })
      .from(productsDrizzle)
      .where(eq(productsDrizzle.subcategory_slug, subcategorySlug));
  });

export const getSearchResults = createServerFn()
  .inputValidator((searchTerm: string) => searchTerm)
  .handler(async ({ data: searchTerm }) => {
    cacheLife("short");
    let results;

    // do we really need to do this hybrid search pattern?

    if (searchTerm.length <= 2) {
      // If the search term is short (e.g., "W"), use ILIKE for prefix matching
      results = await db
        .select()
        .from(productsDrizzle)
        .where(sql`${productsDrizzle.name} ILIKE ${searchTerm + "%"}`) // Prefix match
        .limit(5)
        .innerJoin(
          subcategories,
          sql`${productsDrizzle.subcategory_slug} = ${subcategories.slug}`,
        )
        .innerJoin(
          subcollections,
          sql`${subcategories.subcollection_id} = ${subcollections.id}`,
        )
        .innerJoin(
          categories,
          sql`${subcollections.category_slug} = ${categories.slug}`,
        );
    } else {
      // For longer search terms, use full-text search with tsquery
      const formattedSearchTerm = searchTerm
        .split(" ")
        .filter((term) => term.trim() !== "") // Filter out empty terms
        .map((term) => `${term}:*`)
        .join(" & ");

      results = await db
        .select()
        .from(productsDrizzle)
        .where(
          sql`to_tsvector('english', ${productsDrizzle.name}) @@ to_tsquery('english', ${formattedSearchTerm})`,
        )
        .limit(5)
        .innerJoin(
          subcategories,
          sql`${productsDrizzle.subcategory_slug} = ${subcategories.slug}`,
        )
        .innerJoin(
          subcollections,
          sql`${subcategories.subcollection_id} = ${subcollections.id}`,
        )
        .innerJoin(
          categories,
          sql`${subcollections.category_slug} = ${categories.slug}`,
        );
    }

    return results;
  });
