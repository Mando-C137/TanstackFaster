import { createFileRoute, notFound } from "@tanstack/react-router";
import { alt, contentType, size } from "./og";
import { ProductLink } from "@/components/ui/product-card";
import {
  getProductsForSubcategory,
  getSubcategory,
  getSubcategoryProductCount,
} from "@/lib/queries";
import { cacheHeadersFn } from "@/lib/cache";
import { getURL } from "@/lib/utils";

// export async function generateStaticParams() {
//   const results = await db.query.subcategories.findMany({
//     with: {
//       subcollection: {
//         with: {
//           category: true,
//         },
//       },
//     },
//   });
//   return results.map((s) => ({
//     category: s.subcollection.category.slug,
//     subcategory: s.slug,
//   }));
// }

export const Route = createFileRoute(
  "/_categorySidebar/products/$category/$subcategory/",
)({
  loader: async ({ params }) => {
    const urlDecodedSubcategory = decodeURIComponent(params.subcategory);
    const [products, countRes] = await Promise.all([
      getProductsForSubcategory({ data: urlDecodedSubcategory }),
      getSubcategoryProductCount({ data: urlDecodedSubcategory }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!products) {
      throw notFound();
    }
    return { products, countRes };
  },
  component: Page,
  headers: cacheHeadersFn("hours"),
  head: async ({ loaderData, params, match: { pathname } }) => {
    if (!loaderData) return {};

    const { subcategory: subcategoryParam } = params;
    const urlDecodedCategory = decodeURIComponent(subcategoryParam);

    const [subcategory, rows] = await Promise.all([
      getSubcategory({ data: { subcategorySlug: urlDecodedCategory } }),
      getSubcategoryProductCount({ data: urlDecodedCategory }),
    ]);

    if (!subcategory) {
      throw notFound();
    }

    const description = rows[0]?.count
      ? `Choose from over ${rows[0]?.count - 1} products in ${subcategory.name}. In stock and ready to ship.`
      : undefined;

    const url = `${getURL()}${pathname}`;

    return {
      meta: [
        { title: `${subcategory.name} | TanstackFaster` },
        { name: "description", content: description },
        { name: "og:title", content: subcategory.name },
        { name: "og:url", content: url },
        { name: "og:description", content: subcategory.name },
        { name: "og:image:url", content: `${url}og` },
        { name: "og:image:type", content: contentType },
        { name: "og:image:width", content: `${size.width}` },
        { name: "og:image:height", content: `${size.height}` },
        { name: "og:image:alt", content: alt },
      ],
    };
  },
});

function Page() {
  const { subcategory, category } = Route.useParams();
  // const urlDecodedCategory = decodeURIComponent(category);
  const { products, countRes } = Route.useLoaderData();

  const finalCount = countRes[0]?.count;
  return (
    <div className="container mx-auto p-4">
      {finalCount > 0 ? (
        <h1 className="mb-2 border-b-2 text-sm font-bold">
          {finalCount} {finalCount === 1 ? "Product" : "Products"}
        </h1>
      ) : (
        <p>No products for this subcategory</p>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        {products.map((product) => (
          <ProductLink
            key={product.name}
            loading="eager"
            category_slug={category}
            subcategory_slug={subcategory}
            product={product}
            imageUrl={product.image_url}
          />
        ))}
      </div>
    </div>
  );
}
