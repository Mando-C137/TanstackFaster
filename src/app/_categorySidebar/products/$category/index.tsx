import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { alt, contentType, size } from "./og";
import { getCategory, getCategoryProductCount } from "@/lib/queries";
import { cacheHeadersFn } from "@/lib/cache";
import { Link } from "@/components/ui/link";
import { getURL } from "@/lib/utils";

const loader = createServerFn()
  .inputValidator((data) => data as { params: { category: string } })
  .handler(async ({ data: { params } }) => {
    const urlDecoded = decodeURIComponent(params.category);
    const cat = await getCategory({ data: urlDecoded });
    if (!cat) {
      return null;
    }
    const countRes = await getCategoryProductCount({ data: urlDecoded });
    return { countRes, cat };
  });

export const Route = createFileRoute("/_categorySidebar/products/$category/")({
  loader: async ({ params }) => {
    const data = await loader({ data: { params } });
    if (!data) {
      throw notFound();
    }
    return data;
  },
  component: Page,
  head: ({ loaderData, match: { pathname } }) => {
    const url = `${getURL()}${pathname}`;

    const category = loaderData?.cat;
    const examples = loaderData?.cat.subcollections
      .slice(0, 2)
      .map((s) => s.name)
      .join(", ");

    const description = `Choose from our selection of ${category?.name}, including ${examples + (!!category && category.subcollections.length > 1 ? `,` : ``)} and more. In stock and ready to ship.`;

    return {
      meta: [
        { title: `${loaderData?.cat.name} | TanstackFaster` },
        { name: "description", content: description },
        {
          name: "og:description",
          content: description,
        },

        { name: "og:title", content: loaderData?.cat.name },
        { name: "og:url", content: url },
        { name: "og:description", content: description },
        { name: "og:image:url", content: `${url}og` },
        { name: "og:image:type", content: contentType },
        { name: "og:image:width", content: `${size.width}` },
        { name: "og:image:height", content: `${size.height}` },
        { name: "og:image:alt", content: alt },
      ],
    };
  },
  headers: cacheHeadersFn("hours"),
});

// export async function generateStaticParams() {
//   return await db.select({ category: categories.slug }).from(categories);
// }

function Page() {
  const { cat, countRes } = Route.useLoaderData();
  const { category } = Route.useParams();

  const finalCount = countRes[0]?.count;

  return (
    <div className="container p-4">
      {finalCount && (
        <h1 className="mb-2 border-b-2 text-sm font-bold">
          {finalCount} {finalCount === 1 ? "Product" : "Products"}
        </h1>
      )}
      <div className="space-y-4">
        {cat.subcollections.map((subcollection, index) => (
          <div key={index}>
            <h2 className="mb-2 border-b-2 text-lg font-semibold">
              {subcollection.name}
            </h2>
            <div className="flex flex-row flex-wrap gap-2">
              {subcollection.subcategories.map(
                (subcategory, subcategoryIndex) => (
                  <Link
                    preload={"intent"}
                    key={subcategoryIndex}
                    className="group flex h-full w-full flex-row gap-2 border px-4 py-2 hover:bg-gray-100 sm:w-[200px]"
                    to={"/products/$category/$subcategory"}
                    params={{ category, subcategory: subcategory.slug }}
                  >
                    <div className="py-2">
                      <img
                        loading="eager"
                        decoding="sync"
                        src={subcategory.image_url ?? "/placeholder.svg"}
                        alt={`A small picture of ${subcategory.name}`}
                        width={48}
                        height={48}
                        // quality={65}
                        className="h-12 w-12 shrink-0 object-cover"
                      />
                    </div>
                    <div className="flex h-16 grow flex-col items-start py-2">
                      <div className="text-sm font-medium text-gray-700 group-hover:underline">
                        {subcategory.name}
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
