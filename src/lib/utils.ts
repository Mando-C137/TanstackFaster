import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";
import { env } from "@/env";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export const getURL = () => {
  const schema = import.meta.env.DEV ? "http" : "https";
  const host = import.meta.env.DEV ? "localhost:3000" : env.VITE_VERCEL_URL;
  return `${schema}://${host}`;
};
