import { verifyToken } from "./session";
import {
  categories,
  products,
  subcategories,
  subcollections,
  users,
} from "@/db/schema";
import { db } from "@/db";
import { eq, and, count } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { sql } from "drizzle-orm";
import { cacheLife } from "./cache";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

export const getUser = createServerFn().handler(async () => {
  const sessionCookie = getCookie("session");
  if (!sessionCookie) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie);
  if (
    !sessionData ||
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
  .middleware([staticFunctionMiddleware])
  .inputValidator((subcategorySlug: string) => ({
    subcategorySlug,
  }))
  .handler(async ({ data: { subcategorySlug } }) => {
    cacheLife("hours");

    return db.query.products.findMany({
      where: (products, { eq, and }) =>
        and(eq(products.subcategory_slug, subcategorySlug)),
      orderBy: (products, { asc }) => asc(products.slug),
    });
  });

export const getCollections = createServerFn()
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    cacheLife("hours");

    return db.query.collections.findMany({
      with: {
        categories: true,
      },
      orderBy: (collections, { asc }) => asc(collections.name),
    });
  });

export const getProductDetails = createServerFn()
  .middleware([staticFunctionMiddleware])
  .inputValidator((productSlug: string) => ({
    productSlug,
  }))
  .handler(async ({ data: { productSlug } }) => {
    cacheLife("hours");
    return db.query.products.findFirst({
      where: (products, { eq }) => eq(products.slug, productSlug),
    });
  });

export const getSubcategory = createServerFn()
  .inputValidator(({ subcategorySlug }: { subcategorySlug: string }) => ({
    subcategorySlug,
  }))
  .handler(async ({ data: { subcategorySlug } }) => {
    cacheLife("hours");
    return db.query.subcategories.findFirst({
      where: (subcategories, { eq }) => eq(subcategories.slug, subcategorySlug),
    });
  });

export const getCategory = createServerFn()
  .middleware([staticFunctionMiddleware])
  .inputValidator((categorySlug: string) => ({
    categorySlug,
  }))
  .handler(async ({ data: { categorySlug } }) => {
    cacheLife("hours");
    return db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.slug, categorySlug),
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
  .middleware([staticFunctionMiddleware])
  .inputValidator((collectionSlug: string) => ({
    collectionSlug,
  }))
  .handler(async ({ data: { collectionSlug } }) => {
    cacheLife("hours");
    return db.query.collections.findMany({
      with: {
        categories: true,
      },
      where: (collections, { eq }) => eq(collections.slug, collectionSlug),
      orderBy: (collections, { asc }) => asc(collections.slug),
    });
  });

export const getProductCount = createServerFn().handler(async () => {
  cacheLife("hours");
  return db.select({ count: count() }).from(products);
});

// // could be optimized by storing category slug on the products table
export const getCategoryProductCount = createServerFn()
  .middleware([staticFunctionMiddleware])
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
      .leftJoin(products, eq(subcategories.slug, products.subcategory_slug))
      .where(eq(categories.slug, categorySlug));
  });

export const getSubcategoryProductCount = createServerFn()
  .middleware([staticFunctionMiddleware])
  .inputValidator((subcategorySlug: string) => ({ subcategorySlug }))
  .handler(async ({ data: { subcategorySlug } }) => {
    cacheLife("hours");
    return db
      .select({ count: count() })
      .from(products)
      .where(eq(products.subcategory_slug, subcategorySlug));
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
        .from(products)
        .where(sql`${products.name} ILIKE ${searchTerm + "%"}`) // Prefix match
        .limit(5)
        .innerJoin(
          subcategories,
          sql`${products.subcategory_slug} = ${subcategories.slug}`,
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
        .from(products)
        .where(
          sql`to_tsvector('english', ${products.name}) @@ to_tsquery('english', ${formattedSearchTerm})`,
        )
        .limit(5)
        .innerJoin(
          subcategories,
          sql`${products.subcategory_slug} = ${subcategories.slug}`,
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
