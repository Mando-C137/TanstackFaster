import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import { getCategory } from "@/lib/queries";
import { getURL } from "@/lib/utils";

export const Route = createFileRoute("/_categorySidebar/products/$category")({
  component: Layout,
  loader: async ({ params }) => {
    const { category: categoryParam } = params;
    const urlDecoded = decodeURIComponent(categoryParam);
    const category = await getCategory({ data: urlDecoded });

    if (!category) {
      throw notFound();
    }
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }
    const { category } = loaderData;

    const url = getURL();

    const examples = category.subcollections
      .slice(0, 2)
      .map((s) => s.name)
      .join(", ")
      .toLowerCase();

    return {
      meta: [
        {
          title: `${category.name} | TanstackFaster`,
        },
        { name: "og:title", content: category.name },
        {
          name: "og:description",
          content: `Choose from our selection of ${category.name.toLowerCase()}, including ${examples + (category.subcollections.length > 1 ? `,` : ``)} and more. In stock and ready to ship.`,
        },
        {
          name: "og:url",
          content: `${url}/opengraph-image.png`,
        },
        {
          name: "og:image:url",
          content: `${url}/opengraph-image.png`,
        },
      ],
    };
  },
});

function Layout() {
  return <Outlet />;
}
