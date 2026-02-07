import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { GEIST_FONT_BASE64 } from "./font-data";

interface GenerateOGImageOptions {
  element: React.ReactNode;
  width?: number;
  height?: number;
}

function decodeBase64Font(): ArrayBuffer {
  const binaryString = atob(GEIST_FONT_BASE64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateOGImage({
  element,
  width = 1200,
  height = 630,
}: GenerateOGImageOptions): Promise<Response> {
  const fontData = decodeBase64Font();

  const svg = await satori(element, {
    width,
    height,
    fonts: [
      {
        name: "Geist",
        data: fontData,
        style: "normal",
        weight: 400,
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: width,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
