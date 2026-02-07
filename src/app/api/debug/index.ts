import { createFileRoute } from "@tanstack/react-router";
import { getCookies, getRequestHeaders } from "@tanstack/react-start/server";

export const Route = createFileRoute("/api/debug/")({
  server: {
    handlers: {
      GET: () => {
        const headers = getRequestHeaders();
        const cookieStore = getCookies();
        const stringifyCookies = JSON.stringify(cookieStore, null, 2);
        const stringifyHeaders = JSON.stringify(
          Object.fromEntries(headers),
          null,
          2,
        );

        console.log("headers", stringifyHeaders);
        console.log("cookies", stringifyCookies);

        const responseObj = {
          headers: stringifyHeaders,
          cookies: stringifyCookies,
        };

        return Response.json(responseObj);
      },
    },
  },
});
