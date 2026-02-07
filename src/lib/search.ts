import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { getSearchResults } from "@/lib/queries";

export const search = createServerFn({ method: "GET" })
  .inputValidator((searchTerm: string) => ({ searchTerm }))
  .handler(async ({ data: { searchTerm } }) => {
    if (!searchTerm || !searchTerm.length) {
      return [];
    }

    const results = await getSearchResults({ data: searchTerm });

    const searchResults: ProductSearchResult = results.map((item) => {
      const href = `/products/${item.categories.slug}/${item.subcategories.slug}/${item.products.slug}`;
      return {
        ...item.products,
        href,
      };
    });
    // cache for 10 minutes
    setResponseHeader("Cache-Control", "public, max-age=600");
    return searchResults;
  });

export type ProductSearchResult = Array<{
  href: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string;
  price: string;
  subcategory_slug: string;
}>;

export const getSearchQueryOptions = (searchTerm: string) =>
  queryOptions({
    queryKey: ["search", searchTerm],
    queryFn: async () => {
      const results = await search({ data: searchTerm });
      return results;
    },
    enabled: searchTerm.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
