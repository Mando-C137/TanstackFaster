import * as schema from "./schema";
import { drizzle } from "drizzle-orm/libsql";

const sql = process.env.DATABASE_URL!;
export const db = drizzle({
    connection: {
        url: sql,
    },
    schema
},);
