import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCart } from "@/lib/cart";

export function Cart() {
  const getCartFn = useServerFn(getCart);

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCartFn(),
  });
  if (!cart || cart.length == 0) {
    return null;
  }
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  return (
    <div className="bg-accent2 text-accent1 absolute -top-1 -right-3 rounded-full px-1 text-xs">
      {totalQuantity}
    </div>
  );
}
