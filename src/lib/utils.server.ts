import { createServerOnlyFn } from "@tanstack/react-start";
import { GEIST_FONT_BASE64 } from "./font-data";

export const loadFont = createServerOnlyFn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (_name: "geist-sans-latin-400-normal.ttf") => {
    // Use embedded base64 font - 100% reliable, no file system or network needed
    const binaryString = atob(GEIST_FONT_BASE64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },
);
