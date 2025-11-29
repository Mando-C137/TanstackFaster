/* eslint-disable @next/next/no-img-element */
import { Link } from "@/components/ui/link";
import { Product } from "@/db/schema";
import { useEffect } from "react";

export function getProductLinkImageProps(
  imageUrl: string,
  productName: string,
) {
  return {
    width: 48,
    height: 48,
    quality: 65,
    src: imageUrl,
    alt: `A small picture of ${productName}`,
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
  useEffect(() => {
    const prefetchProps = {
      height: 256,
      quality: 80,
      width: 256,
      src: imageUrl ?? "/placeholder.svg?height=64&width=64",
      alt: `A small picture of ${product.name}`,
    };
    try {
      const iprops = prefetchProps;
      const img = new Image();
      // Don't interfer with important requests
      img.fetchPriority = "low";
      // Don't block the main thread with prefetch images
      img.decoding = "async";
      // Order is important here, sizes must be set before srcset, srcset must be set before src
      // if (iprops.sizes) img.sizes = iprops.sizes;
      // if (iprops.srcSet) img.srcset = iprops.srcSet;
      if (iprops.src) img.src = iprops.src;
    } catch (e) {
      console.error("failed to preload", prefetchProps.src, e);
    }
  }, [imageUrl, product.name]);
  return (
    <Link
      preload={"viewport"}
      className="group flex h-[130px] w-full flex-row border px-4 py-2 hover:bg-gray-100 sm:w-[250px]"
      to={"/products/$category/$subcategory/$product"}
      params={{
        category: category_slug,
        subcategory: subcategory_slug,
        product: product.slug,
      }}
    >
      <div className="py-2">
        <img
          loading={props.loading}
          decoding="sync"
          src={imageUrl ?? "/placeholder.svg?height=48&width=48"}
          alt={`A small picture of ${product.name}`}
          width={48}
          height={48}
          // quality={65}
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
