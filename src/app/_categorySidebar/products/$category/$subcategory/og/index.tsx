import { createFileRoute, notFound } from "@tanstack/react-router";
import { cacheHeadersFn } from "@/lib/cache";
import { getSubcategory } from "@/lib/queries";
import { generateOGImage } from "@/lib/og-image";

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
      GET: async ({ params, request }) => {
        const { subcategory: subcategoryParam } = params;
        const urlDecodedCategory = decodeURIComponent(subcategoryParam);

        const subcategory = await getSubcategory({
          data: { subcategorySlug: urlDecodedCategory },
        });

        if (!subcategory) {
          throw notFound();
        }

        const description = `Choose from our selection of ${subcategory.name}. In stock and ready to ship.`;

        const url = new URL(request.url);
        const schemaHost = `${url.protocol}//${url.host}`;

        if (!process.env.VERCEL) {
          return Response.redirect(`${schemaHost}/opengraph-image.png`, 302);
        }

        // TODO: Change design to add subcategory images that blur out
        return generateOGImage({
          element: (
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
                  fontWeight: 400,
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
            </div>
          ),
        });
      },
    },
  },
});
