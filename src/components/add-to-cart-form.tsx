import { mutationOptions, useMutation } from "@tanstack/react-query";
import { addToCart } from "@/lib/actions";

export function AddToCartForm({ productSlug }: { productSlug: string }) {
  const {
    mutate: addToCartFn,
    isPending,
    data,
  } = useMutation(
    mutationOptions({
      mutationFn: addToCart,
      onSettled: (_1, _2, _3, _4, context) => {
        context.client.invalidateQueries({ queryKey: ["cart"] });
        context.client.invalidateQueries({ queryKey: ["cart", "detailed"] });
      },
    }),
  );

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => addToCartFn({ data: productSlug })}
        className="bg-accent1 max-w-[150px] rounded-[2px] px-5 py-1 text-sm font-semibold text-white"
      >
        Add to cart
      </button>
      {isPending && <p>Adding to cart...</p>}
      {!isPending && data && <p>{data}</p>}
    </div>
  );
}
