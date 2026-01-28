import { createServerOnlyFn } from "@tanstack/react-start";
import fs from "node:fs/promises";
import path from "node:path";

export const loadFont = createServerOnlyFn(
  (name: "geist-sans-latin-400-normal.ttf") => {
    return fs.readFile(path.join(process.cwd(), "src/assets/fonts", name));
  },
);
