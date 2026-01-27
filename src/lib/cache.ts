import { setResponseHeaders } from "@tanstack/react-start/server";

export type CacheDuration = "hours" | "days" | "short" | "long";

const headerValues = {
  hours: "public, s-maxage=3600, stale-while-revalidate=86400",
  days: "public, s-maxage=86400, stale-while-revalidate=604800",
  short: "public, max-age=600, stale-while-revalidate=3600",
  long: "public, s-maxage=86400, stale-while-revalidate=604800",
};

export function cacheLife(duration: CacheDuration = "hours"): void {
  setResponseHeaders(
    new Headers({
      "Cache-Control": headerValues[duration],
    }),
  );
}

export function cacheHeadersFn(
  duration: CacheDuration = "hours",
): () => Record<string, string> {
  return () => ({
    "Cache-Control": headerValues[duration],
  });
}
