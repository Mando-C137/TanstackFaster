import { cookies } from "next/headers";
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
import { sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
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
}

export const getProductsForSubcategory = async (subcategorySlug: string) => {
  "use cache";
  cacheTag("subcategory-products");
  cacheLife("hours");

  return db.query.products.findMany({
    where: (products, { eq, and }) =>
      and(eq(products.subcategory_slug, subcategorySlug)),
    orderBy: (products, { asc }) => asc(products.slug),
  });
};

export const getCollections = async () => {
  "use cache";
  cacheTag("collections");
  cacheLife("hours");

  return db.query.collections.findMany({
    with: {
      categories: true,
    },
    orderBy: (collections, { asc }) => asc(collections.name),
  });
};

export const getProductDetails = async (productSlug: string) => {
  "use cache";
  cacheTag("product");
  cacheLife("hours");
  return db.query.products.findFirst({
    where: (products, { eq }) => eq(products.slug, productSlug),
  });
};

export const getSubcategory = async (subcategorySlug: string) => {
  "use cache";
  cacheTag("subcategory");
  cacheLife("hours");
  return db.query.subcategories.findFirst({
    where: (subcategories, { eq }) => eq(subcategories.slug, subcategorySlug),
  });
};

export const getCategory = async (categorySlug: string) => {
  "use cache";
  cacheTag("category");
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
};

export const getCollectionDetails = async (collectionSlug: string) => {
  "use cache";
  cacheTag("collection");
  cacheLife("hours");
  return db.query.collections.findMany({
    with: {
      categories: true,
    },
    where: (collections, { eq }) => eq(collections.slug, collectionSlug),
    orderBy: (collections, { asc }) => asc(collections.slug),
  });
};

export const getProductCount = async () => {
  "use cache";
  cacheTag("total-product-count");
  cacheLife("hours");
  return db.select({ count: count() }).from(products);
};

// could be optimized by storing category slug on the products table
export const getCategoryProductCount = async (categorySlug: string) => {
  "use cache";
  cacheTag("category-product-count");
  cacheLife("hours");

  return db.select({ count: count() })
    .from(categories)
    .leftJoin(subcollections, eq(categories.slug, subcollections.category_slug))
    .leftJoin(
      subcategories,
      eq(subcollections.id, subcategories.subcollection_id),
    )
    .leftJoin(products, eq(subcategories.slug, products.subcategory_slug))
    .where(eq(categories.slug, categorySlug));
};

export const getSubcategoryProductCount = async (subcategorySlug: string) => {
  "use cache";

  cacheTag("subcategory-product-count");
  cacheLife("hours");
  return db
    .select({ count: count() })
    .from(products)
    .where(eq(products.subcategory_slug, subcategorySlug));
};

export const getSearchResults = async (searchTerm: string) => {
  "use cache";
  cacheTag("search-results");
  cacheLife("hours");
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
};
