import { addToCart } from "@/lib/actions";
import { mutationOptions, useMutation } from "@tanstack/react-query";

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
      },
    }),
  );

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={() => addToCartFn({ data: productSlug })}
    >
      {/* <input type="hidden" name="productSlug" value={productSlug} /> */}
      <button
        type="submit"
        className="bg-accent1 max-w-[150px] rounded-[2px] px-5 py-1 text-sm font-semibold text-white"
      >
        Add to cart
      </button>
      {isPending && <p>Adding to cart...</p>}
      {!isPending && data && <p>{data}</p>}
    </form>
  );
}
