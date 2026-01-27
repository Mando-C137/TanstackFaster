import { cacheHeadersFn } from "@/lib/cache";
import { getSubcategory } from "@/lib/queries";
import { loadFont } from "@/lib/utils";
import { createFileRoute, notFound } from "@tanstack/react-router";

// Image metadata
export const alt = "About the subcategory";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export const Route = createFileRoute(
  "/_categorySidebar/products/$category/$subcategory/og/",
)({
  headers: cacheHeadersFn("hours"),
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { subcategory: subcategoryParam } = params;
        const urlDecodedCategory = decodeURIComponent(subcategoryParam);

        const subcategory = await getSubcategory({
          data: { subcategorySlug: urlDecodedCategory },
        });

        if (!subcategory) {
          throw notFound();
        }

        const description = `Choose from our selection of ${subcategory.name}. In stock and ready to ship.`;

        if (!process.env.VERCEL) {
          return Response.redirect("/opengraph-image", 302);
        }
        const { ImageResponse } = await import("@vercel/og");

        // TODO: Change design to add subcategory images that blur out
        return new ImageResponse(
          <div
            style={{
              fontFamily: "Geist",
              fontWeight: 400,
              width: "100%",
              height: "100%",
              display: "flex",
              backgroundColor: "#fff",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  style={{
                    width: "300px",
                    marginBottom: "30px",
                  }}
                  src={subcategory.image_url ?? "/placeholder.svg"}
                  alt={subcategory.name}
                />
              </div>
            </div>
            <h1
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "20px",
              }}
            >
              {subcategory.name}
            </h1>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                width: "100%",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  fontSize: "24px",
                }}
              >
                {description}
              </div>
            </div>
          </div>,
          {
            width: 1200,
            height: 630,
            fonts: [
              {
                name: "Geist",
                data: await loadFont("geist-sans-latin-400-normal.ttf"),
                style: "normal",
              },
            ],
          },
        );
      },
    },
  },
});
