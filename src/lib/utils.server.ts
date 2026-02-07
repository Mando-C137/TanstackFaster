import { createServerOnlyFn } from "@tanstack/react-start";

export const loadFont = createServerOnlyFn(
  async (name: "geist-sans-latin-400-normal.ttf") => {
    const baseUrl = process.env.VERCEL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const r = await fetch(`${baseUrl}/fonts/${name}`);
    return await r.arrayBuffer();
  },
);
