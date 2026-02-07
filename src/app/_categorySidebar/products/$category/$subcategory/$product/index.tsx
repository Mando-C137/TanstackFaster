import { createFileRoute, notFound } from "@tanstack/react-router";
import { alt, contentType, size } from "./og";
import { ProductLink } from "@/components/ui/product-card";
import { AddToCartForm } from "@/components/add-to-cart-form";

import { getProductDetails, getProductsForSubcategory } from "@/lib/queries";
import { cacheHeadersFn } from "@/lib/cache";
import { getURL } from "@/lib/utils";

export const Route = createFileRoute(
  "/_categorySidebar/products/$category/$subcategory/$product/",
)({
  loader: async ({ params }) => {
    const urlDecodedProduct = decodeURIComponent(params.product);
    const urlDecodedSubcategory = decodeURIComponent(params.subcategory);
    const [productData, relatedUnshifted] = await Promise.all([
      getProductDetails({ data: urlDecodedProduct }),
      getProductsForSubcategory({ data: urlDecodedSubcategory }),
    ]);

    if (!productData) {
      throw notFound();
    }

    return { productData, relatedUnshifted };
  },
  headers: cacheHeadersFn("hours"),
  head: ({ loaderData, match: { pathname } }) => {
    const product = loaderData?.productData;
    if (!product) {
      throw notFound();
    }

    const url = `${getURL()}${pathname}`;

    return {
      meta: [
        { title: `${product.name} | TanstackFaster` },
        { name: "og:title", content: product.name },
        { name: "og:description", content: product.description },
        { name: "og:url", content: url },
        { name: "og:image:url", content: `${url}/og` },
        { name: "og:image:type", content: contentType },
        { name: "og:image:width", content: `${size.width}` },
        { name: "og:image:height", content: `${size.height}` },
        { name: "og:image:alt", content: alt },
      ],
    };
  },
  component: Page,
});

// import { db } from "@/db";

// export async function generateStaticParams() {
//   const results = await db.query.products.findMany({
//     with: {
//       subcategory: {
//         with: {
//           subcollection: {
//             with: {
//               category: true,
//             },
//           },
//         },
//       },
//     },
//   });
//   return results.map((s) => ({
//     category: s.subcategory.subcollection.category.slug,
//     subcategory: s.subcategory.slug,
//     product: s.slug,
//   }));
// }

function Page() {
  const { category, subcategory } = Route.useParams();
  const { productData, relatedUnshifted } = Route.useLoaderData();
  const currentProductIndex = relatedUnshifted.findIndex(
    (p) => p.slug === productData.slug,
  );
  const related = [
    ...relatedUnshifted.slice(currentProductIndex + 1),
    ...relatedUnshifted.slice(0, currentProductIndex),
  ];

  return (
    <div className="container p-4">
      <h1 className="text-accent1 border-t-2 pt-1 text-xl font-bold">
        {productData.name}
      </h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <img
            loading="eager"
            decoding="sync"
            src={productData.image_url ?? "/placeholder.svg?height=64&width=64"}
            alt={`A small picture of ${productData.name}`}
            height={256}
            // quality={80}
            width={256}
            className="h-56 w-56 shrink-0 border-2 md:h-64 md:w-64"
          />
          <p className="grow text-base">{productData.description}</p>
        </div>
        <p className="text-xl font-bold">
          ${parseFloat(productData.price).toFixed(2)}
        </p>
        <AddToCartForm productSlug={productData.slug} />
      </div>
      <div className="pt-8">
        {related.length > 0 && (
          <h2 className="text-accent1 text-lg font-bold">
            Explore more products
          </h2>
        )}
        <div className="flex flex-row flex-wrap gap-2">
          {related.map((product) => (
            <ProductLink
              key={product.name}
              loading="lazy"
              category_slug={category}
              subcategory_slug={subcategory}
              product={product}
              imageUrl={product.image_url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
