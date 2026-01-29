import { Link } from "@/components/ui/link";
import { getCollectionDetails } from "@/lib/queries";
import { createFileRoute } from "@tanstack/react-router";
import { cacheHeadersFn } from "@/lib/cache";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

// export async function generateStaticParams() {
//   return await db.collect({ collection: collections.slug }).from(collections);
// }

const loader = createServerFn()
  //  .middleware([staticFunctionMiddleware])
  .inputValidator((data) => data as { params: { collection: string } })
  .handler(async ({ data: { params } }) => {
    const collectionName = decodeURIComponent(params.collection);
    const collections = await getCollectionDetails({ data: collectionName });
    return collections;
  });

export const Route = createFileRoute("/_categorySidebar/$collection/")({
  loader: async ({ params }) => await loader({ data: { params } }),
  headers: cacheHeadersFn("hours"),
  component: Home,
});

function Home() {
  let imageCount = 0;
  const collections = Route.useLoaderData();

  return (
    <div className="w-full p-4">
      {collections.map((collection) => (
        <div key={collection.name}>
          <h2 className="text-xl font-semibold">{collection.name}</h2>
          <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
            {collection.categories.map((category) => (
              <Link
                preload={"intent"}
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
