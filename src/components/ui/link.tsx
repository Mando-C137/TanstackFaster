import { Link as TanstackStartLink, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import type { LinkProps } from "@tanstack/react-router";

type PrefetchImage = {
  srcset: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function prefetchImages(href: string) {
  if (!href.startsWith("/") || href.startsWith("/order") || href === "/") {
    return [];
  }
  const url = new URL(href, window.location.href);
  const imageResponse = await fetch(`/api/prefetch-images${url.pathname}`, {
    priority: "low",
  });
  // only throw in dev
  if (!imageResponse.ok && import.meta.env.DEV) {
    throw new Error("Failed to prefetch images");
  }
  const { images } = await imageResponse.json();
  return images as Array<PrefetchImage>;
}

const seen = new Set<string>();
const imageCache = new Map<string, Array<PrefetchImage>>();

export const Link = (({ children, ...props }: LinkProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const prefetchTimeout = useRef<NodeJS.Timeout | null>(null);

  const href = router.buildLocation({
    to: props.to,
    params: props.params,
  }).href;

  useEffect(() => {
    if (!props.preload) return;

    const linkElement = linkRef.current;
    if (!linkElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          prefetchTimeout.current = setTimeout(async () => {
            router.preloadRoute({ to: props.to, params: props.params });
            await sleep(0);

            if (!imageCache.has(href)) {
              void prefetchImages(href).then((images) => {
                imageCache.set(href, images);
              }, console.error);
            }

            observer.unobserve(entry.target);
          }, 300);
        } else if (prefetchTimeout.current) {
          clearTimeout(prefetchTimeout.current);
          prefetchTimeout.current = null;
        }
      },
      { rootMargin: "0px", threshold: 0.1 },
    );

    observer.observe(linkElement);

    return () => {
      observer.disconnect();
      if (prefetchTimeout.current) {
        clearTimeout(prefetchTimeout.current);
      }
    };
  }, [href, props.params, props.preload, props.to, router]);

  return (
    <TanstackStartLink
      ref={linkRef}
      onMouseEnter={() => {
        router.preloadRoute({ to: props.to, params: props.params });
        const images = imageCache.get(href) || [];
        for (const image of images) {
          prefetchImage(image);
        }
      }}
      onMouseDown={(e) => {
        const url = new URL(href, window.location.href);
        if (
          url.origin === window.location.origin &&
          e.button === 0 &&
          !e.altKey &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          e.preventDefault();
          router.navigate({ to: props.to, params: props.params });
        }
      }}
      {...props}
    >
      {children}
    </TanstackStartLink>
  );
}) as typeof TanstackStartLink;

function prefetchImage(image: PrefetchImage) {
  if (image.loading === "lazy" || seen.has(image.srcset)) {
    return;
  }
  const img = new Image();
  img.decoding = "async";
  img.fetchPriority = "low";
  img.sizes = image.sizes;
  seen.add(image.srcset);
  img.srcset = image.srcset;
  console.log(image.src);
  img.src = image.src;
  img.alt = image.alt;
}
