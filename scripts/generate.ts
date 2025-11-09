import OpenAI from "openai";
import slugify from "slugify";
import { db } from "../src/db";
import {
  categories,
  collections,
  subcategories,
  subcollections,
} from "../src/db/schema";
import { eq, isNull } from "drizzle-orm";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import fs from "fs";

const openai = new OpenAI();
const client = createOpenAI();

const system = `
You are given the name of a collection for products in an art supply store.
Your task is to generate 20 unique categories for this collection. Make sure the
category names are broad.

YOU MUST OUTPUT IN ONLY JSON.

EXAMPLE:

INPUT:
Collection Name: Sketching Pencils

OUTPUT:
{ categories: ["Colored Pencils", "Charcoal Pencils", ...] }

Remember, ONLY RETURN THE JSON of 20 unique categories and nothing else.
  
MAKE SURE THERE ARE 20 CATEGORIES IN THE OUTPUT.`;

const generateCollections = async () => {
  const names = [
    "Drawing and Sketching",
    "Painting Supplies",
    "Ink and Calligraphy",
    "Craft Supplies",
    "Printmaking and Stamping",
    "Sculpting and Model Making",
    "Tools and Accessories",
    "Canvas and Surfaces",
    "Paper and Pads",
    "Digital Art Supplies",
    "Framing and Display",
    "Photography and Film",
    "Textile and Fiber Arts",
    "Jewelry Making",
    "Ceramics and Pottery",
    "Woodworking and Carving",
    "Mosaic and Glass Art",
    "Art Books and Educational Materials",
    "Mixed Media and Collage Supplies",
  ]; //copied from data.sql

  const data = names.map((name) => ({
    name,
    slug: slugify(name, { lower: true }),
  }));

  // insert into DB, ignore conflicts to be idempotent
  await db.insert(collections).values(data).onConflictDoNothing();

  return data;
};

const getCollections = async () => {
  return await db.select().from(collections);
};

// generate 20 categories per each collection
const generateCategories = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = [] as any;
  const c = await getCollections();
  console.log(c.length);

  const promises = c.map(async (col) => {
    const { object } = await generateObject({
      model: client.languageModel("gpt-5-mini"),
      schema: z.object({
        categories: z.array(z.string()),
      }),
      system,
      prompt: `Collection Name: ${col.name}`,
    });

    const { categories: cats } = object;
    console.log(`Categories generated: ${cats.length}`);

    const categoriesToAdd = cats.map((category: string) => ({
      name: category,
      collection_id: col.id,
      slug: slugify(category, { lower: true }),
    }));
    data.push(...categoriesToAdd);
  });

  await Promise.all(promises);
  await db.insert(categories).values(data).onConflictDoNothing();
};

const getCategories = async () => {
  return await db.select().from(categories);
};

// generate 10 subcollections per each category
const generateSubCollections = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = [] as any;
  const c = await getCategories();

  const promises = c.map(async (cat) => {
    const { object } = await generateObject({
      model: client.languageModel("gpt-5-mini"),
      schema: z.object({
        subcollections: z.array(z.string()),
      }),
      system: `You are given the name of a category for products in an art supply store.
                Your task is to generate 10 unique subcollections for this category. Make sure the
                subcollection names are broad.

                YOU MUST OUTPUT IN ONLY JSON.
                
                EXAMPLE:

                INPUT:
                Category Name: Art Hitory

                OUTPUT:
                { subcollections: ["Art History Books", "Art History CDs", ...] }
                
                Remember, ONLY RETURN THE JSON of 10 unique subcollections and nothing else.
                  
                MAKE SURE THERE ARE 10 SUBCOLLECTIONS IN THE OUTPUT.`,
      prompt: `Category Name: ${cat.name}`,
    });

    const { subcollections: sc } = object;
    console.log(`Subcollections generated: ${sc.length}`);

    const categoriesToAdd = sc.map((subcol: string) => ({
      name: subcol,
      category_slug: cat.slug,
    }));
    data.push(...categoriesToAdd);
  });

  await Promise.all(promises);
  await db.insert(subcollections).values(data).onConflictDoNothing();
};

const getSubcollections = async () => {
  // only get subcollections that have no subcategories
  const result = await db
    .select()
    .from(subcollections)
    .leftJoin(
      subcategories,
      eq(subcollections.id, subcategories.subcollection_id),
    )
    .where(isNull(subcategories.subcollection_id));
  return result;
};

const generateSubcategories = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = [] as any;
  const subcollections = (await getSubcollections()).map(
    (c) => c.subcollections,
  );

  const promises = subcollections.map(async (subcol) => {
    const { object } = await generateObject({
      model: client.languageModel("gpt-5-nano"),
      schema: z.object({
        subcategories: z.array(z.string()),
      }),
      system: `You are given the name of a subcollection of products in an art supply store.
                Your task is to generate 10 unique subcategories that belong to this subcollection.
                Make sure the subcategory names are broad.

                YOU MUST OUTPUT IN ONLY JSON.

                EXAMPLE:

                INPUT:
                Subcollection Name: Art Hitory

                OUTPUT:
                { subcategories: ["Art History Books", "Art History CDs", ...] }

                Remember, ONLY RETURN THE JSON of 10 unique subcategories and nothing else.

                MAKE SURE THERE ARE 10 SUBCATEGORIES IN THE OUTPUT.`,
      prompt: `Subcollection Name: ${subcol}`,
    });

    const { subcategories: sc } = object;
    console.log(`Subcategories generated: ${sc.length}`);

    const subcategoriesToAdd = sc.map((subcat: string) => ({
      name: subcat,
      slug: slugify(subcat, { lower: true }),
      subcollection_id: subcol.id,
    }));
    data.push(...subcategoriesToAdd);
  });

  await Promise.all(promises);
  await db.insert(subcategories).values(data).onConflictDoNothing();
};

const productSystemMessage = `
You are given the name of a category of products in an art supply store.
Your task is to generate 25 unique products that belong to this category.
Ensure each product has a name and brief description.

YOU MUST OUTPUT IN ONLY JSON.

EXAMPLE:

INPUT:
Category Name: Paint Markers

OUTPUT:
{ products: [{ name: "Expo Paint Marker", description: "..." }, { name: "Paint Marker Set", description:"..." }] }

Remember, ONLY RETURN THE JSON of 30 unique products and nothing else.
MAKE SURE YOUR JSON IS VALID. ALL JSON MUST BE CORRECT.
`;

const generateBatchFile = async () => {
  const arr = await db.select().from(subcategories);

  arr.forEach((subcat) => {
    const custom_id = subcat.slug;
    const method = "POST";
    const url = "/v1/chat/completions";
    const body = {
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: productSystemMessage },
        { role: "user", content: `Category name: ${subcat.name}` },
      ],
    };

    const line = `{"custom_id": "${custom_id}", "method": "${method}", "url": "${url}", "body": ${JSON.stringify(body)}}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fs.appendFile("scripts/req.jsonl", line + "\n", (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
};

// generateBatchFile();

const uploadBatchFile = async () => {
  const file = await openai.files.create({
    file: fs.createReadStream("scripts/req.jsonl"),
    purpose: "batch",
  });

  console.log(file);
};

// uploadBatchFile();

const createBatch = async () => {
  const batch = await openai.batches.create({
    input_file_id: "",
    endpoint: "/v1/chat/completions",
    completion_window: "24h",
  });

  console.log(batch);
};

// createBatch();

const checkBatchStatus = async () => {
  const batch = await openai.batches.retrieve("");
  console.log(batch);
};

// checkBatchStatus();

const downloadBatch = async () => {
  const fileResponse = await openai.files.content("");
  const fileContents = await fileResponse.text();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fs.appendFile("scripts/out.jsonl", fileContents, (err: any) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("File has been saved");
  });
};

// downloadBatch();

// Remove the previous ad-hoc top-level calls and orchestrate execution so inserts happen in order.
// Replace direct calls with a single orchestrator
async function main() {
  try {
    // await generateCollections();
    // await generateCategories();
    // await generateSubCollections();
    await generateSubcategories();
  } catch (err) {
    console.error("Error in generation pipeline:", err);
    process.exitCode = 1;
  }
}

main();
