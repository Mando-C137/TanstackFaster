import * as schema from "./schema";
import { drizzle } from "drizzle-orm/libsql";

const sql = "file:./dev.db";
export const db = drizzle({
  connection: {
    url: sql,
  },
  schema,
});
