import { notFound } from "@tanstack/react-router";
import { getCategory } from "@/lib/queries";
import { loadFont } from "@/lib/utils.server";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "About the category";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image(props: {
  params: Promise<{
    category: string;
  }>;
}) {
  const { category: categoryParam } = await props.params;
  const urlDecodedCategory = decodeURIComponent(categoryParam);

  const category = await getCategory({ data: urlDecodedCategory });

  if (!category) {
    throw notFound();
  }

  const examples = category.subcollections
    .slice(0, 2)
    .map((s) => s.name)
    .join(", ");

  const description = `Choose from our selection of ${category.name}, including ${examples + (category.subcollections.length > 1 ? "," : "")} and more. In stock and ready to ship.`;

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
          <img
            style={{
              width: "300px",
              marginBottom: "30px",
            }}
            src={category.image_url ?? "/placeholder.svg"}
            alt={category.name}
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
        {category.name}
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", display: "flex", fontSize: "24px" }}>
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
}
