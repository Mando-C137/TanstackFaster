import { createFileRoute } from "@tanstack/react-router";
import { getSearchResults } from "@/lib/queries";

export const Route = createFileRoute("/api/search/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // format is /api/search?q=term
        const url = new URL(request.url).searchParams;
        const searchTerm = url.get("q");
        if (!searchTerm || !searchTerm.length) {
          return Response.json([]);
        }

        const results = await getSearchResults({ data: searchTerm });

        const searchResults: ProductSearchResult = results.map((item) => {
          const href = `/products/${item.categories.slug}/${item.subcategories.slug}/${item.products.slug}`;
          return {
            ...item.products,
            href,
          };
        });
        const response = Response.json(searchResults);
        // cache for 10 minutes
        response.headers.set("Cache-Control", "public, max-age=600");
        return response;
      },
    },
  },
});

export type ProductSearchResult = {
  href: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string;
  price: string;
  subcategory_slug: string;
}[];
