import { getCategory } from "@/lib/queries";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

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
  head: async ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }
    const { category } = loaderData;

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
          content: `/opengraph-image.png`,
        },
        {
          name: "og::image:url",
          content: `/opengraph-image.png`,
        },
      ],
    };
  },
});

function Layout() {
  return <Outlet />;
}
