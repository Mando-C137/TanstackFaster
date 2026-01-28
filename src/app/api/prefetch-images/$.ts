import { parseHTML } from "linkedom";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/prefetch-images/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const schema = import.meta.env.DEV ? "http" : "https";
        const host = new URL(request.url).host;
        if (!host) {
          return new Response("Failed to get hostname from env", {
            status: 500,
          });
        }
        const href = params._splat;
        if (!href) {
          return new Response("Missing url parameter", { status: 400 });
        }
        const url = `${schema}://${host}/${href}`;
        const response = await fetch(url);
        if (!response.ok) {
          return new Response("Failed to fetch", { status: response.status });
        }
        const body = await response.text();
        const { document } = parseHTML(body);
        const images = Array.from(document.querySelectorAll("main img"))
          .map((img) => ({
            srcset: img.getAttribute("srcset") || img.getAttribute("srcSet"), // Linkedom is case-sensitive
            sizes: img.getAttribute("sizes"),
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            loading: img.getAttribute("loading"),
          }))
          .filter((img) => img.src);
        return Response.json(
          { images },
          {
            headers: {
              "Cache-Control": "public, max-age=3600",
            },
          },
        );
      },
    },
  },
});
