import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProductDetails } from "@/lib/queries";
import { loadFont } from "@/lib/utils.server";

// Image metadata
export const alt = "About the product";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export const Route = createFileRoute(
  "/_categorySidebar/products/$category/$subcategory/$product/og/",
)({
  headers: () => ({
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  }),
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { product } = params;
        const urlDecodedProduct = decodeURIComponent(product);
        const productData = await getProductDetails({
          data: urlDecodedProduct,
        });

        if (!productData) {
          throw notFound();
        }

        if (!process.env.VERCEL) {
          return Response.redirect("/opengraph-image", 302);
        }

        const { ImageResponse } = await import("@vercel/og");
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
                <img
                  style={{
                    width: "300px",
                    marginBottom: "30px",
                  }}
                  src={productData.image_url ?? "/placeholder.svg"}
                  alt={productData.name}
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
              {productData.name}
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
                {productData.description}
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                display: "flex",
                fontSize: "24px",
                marginTop: "10px",
              }}
            >
              ${productData.price}
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
