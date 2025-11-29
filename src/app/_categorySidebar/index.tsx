import { Link } from "@/components/ui/link";
import { getCollections, getProductCount } from "@/lib/queries";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_categorySidebar/")({
  component: Home,
  loader: async () => {
    const [collections, productCount] = await Promise.all([
      getCollections(),
      getProductCount(),
    ]);
    return { collections, productCount };
  },
});

export default function Home() {
  let imageCount = 0;
  const { collections, productCount } = Route.useLoaderData();

  return (
    <div className="w-full p-4">
      <div className="border-accent1 mb-2 w-full flex-grow border-b-[1px] text-sm font-semibold text-black">
        Explore {productCount.at(0)?.count.toLocaleString()} products
      </div>
      {collections.map((collection) => (
        <div key={collection.name}>
          <h2 className="text-xl font-semibold">{collection.name}</h2>
          <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
            {collection.categories.map((category) => (
              <Link
                preload={"viewport"}
                key={category.name}
                className="flex w-[125px] flex-col items-center text-center"
                to={"/products/$category"}
                params={{ category: category.slug }}
              >
                {/* eslint-disable @next/next/no-img-element */}
                <img
                  loading={imageCount++ < 15 ? "eager" : "lazy"}
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
