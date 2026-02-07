import { useEffect } from "react";
import type { Product } from "@/db/schema";
import { Link } from "@/components/ui/link";

interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  quality?: number;
  loading?: "eager" | "lazy";
  decoding?: "sync" | "async" | "auto";
  className?: string;
}

export function getProductLinkImageProps(
  imageUrl: string,
  productName: string,
): ImageProps {
  return {
    width: 48,
    height: 48,
    quality: 65,
    src: imageUrl,
    alt: `A small picture of ${productName}`,
    loading: "lazy",
    decoding: "async",
  };
}

export function ProductLink(props: {
  imageUrl?: string | null;
  category_slug: string;
  subcategory_slug: string;
  loading: "eager" | "lazy";
  product: Product;
}) {
  const { category_slug, subcategory_slug, product, imageUrl } = props;

  // prefetch the main image for the product page, if this is too heavy
  // we could only prefetch the first few cards, then prefetch on hover
  const prefetchImageProps: ImageProps = {
    height: 256,
    quality: 80,
    width: 256,
    src: imageUrl ?? "/placeholder.svg?height=64&width=64",
    alt: `A small picture of ${product.name}`,
    loading: "lazy",
    decoding: "async",
  };

  useEffect(() => {
    try {
      const img = new Image();
      // Don't interfer with important requests
      img.fetchPriority = "low";
      // Don't block the main thread with prefetch images
      img.decoding = "async";
      img.src = prefetchImageProps.src;
    } catch (e) {
      console.error("failed to preload", prefetchImageProps.src, e);
    }
  }, [prefetchImageProps.src]);

  const displayImageSrc = imageUrl ?? "/placeholder.svg?height=48&width=48";

  return (
    <Link
      preload="intent"
      className="group flex h-[130px] w-full flex-row border px-4 py-2 hover:bg-gray-100 sm:w-[250px]"
      to="/products/$category/$subcategory/$product"
      params={{
        category: category_slug,
        product: product.slug,
        subcategory: subcategory_slug,
      }}
    >
      <div className="py-2">
        <img
          loading={props.loading}
          decoding="sync"
          src={displayImageSrc}
          alt={`A small picture of ${product.name}`}
          width={48}
          height={48}
          className="h-auto w-12 flex-shrink-0 object-cover"
        />
      </div>
      <div className="px-2" />
      <div className="flex h-26 flex-grow flex-col items-start py-2">
        <div className="text-sm font-medium text-gray-700 group-hover:underline">
          {product.name}
        </div>
        <p className="overflow-hidden text-xs">{product.description}</p>
      </div>
    </Link>
  );
}
