import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import fs from "node:fs/promises";
import path from "node:path";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function loadFont(name: "geist-sans-latin-400-normal.ttf") {
  return fs.readFile(path.join(process.cwd(), "src/assets/fonts", name));
}
