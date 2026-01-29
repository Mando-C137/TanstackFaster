import { Link } from "@/components/ui/link";
import { cacheHeadersFn, cacheLife } from "@/lib/cache";
import { getCollections, getProductCount } from "@/lib/queries";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

const loader = createServerFn()
  //  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    cacheLife("hours");
    const [collections, productCount] = await Promise.all([
      getCollections(),
      getProductCount(),
    ]);
    return { collections, productCount };
  });

export const Route = createFileRoute("/_categorySidebar/")({
  component: Home,
  pendingComponent: () => <div>Loading...</div>,
  headers: cacheHeadersFn("hours"),
  loader: async () => await loader(),
});

function Home() {
  const { collections, productCount } = Route.useLoaderData();

  return (
    <div className="w-full p-4">
      <div className="border-accent1 mb-2 w-full flex-grow border-b-[1px] text-sm font-semibold text-black">
        Explore {productCount.at(0)?.count.toLocaleString()} products
      </div>
      {collections.map((collection, collectionIndex) => {
        let categoryOffset = 0;
        for (let i = 0; i < collectionIndex; i++) {
          categoryOffset += collections[i].categories.length;
        }

        return (
          <div key={collection.name}>
            <h2 className="text-xl font-semibold">{collection.name}</h2>
            <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
              {collection.categories.map((category, categoryIndex) => {
                const imageIndex = categoryOffset + categoryIndex;
                return (
                  <Link
                    preload={"intent"}
                    key={category.name}
                    className="flex w-[125px] flex-col items-center text-center"
                    to={"/products/$category"}
                    params={{ category: category.slug }}
                  >
                    {/* eslint-disable @next/next/no-img-element */}
                    <img
                      loading={imageIndex < 15 ? "eager" : "lazy"}
                      decoding="sync"
                      src={category.image_url ?? "/placeholder.svg"}
                      alt={`A small picture of ${category.name}`}
                      className="hover:bg-accent2 mb-2 h-14 w-14 border"
                      width={48}
                      height={48}
                      // quality={65}
                    />
                    <span className="text-xs">{category.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
