import { createServerFn } from "@tanstack/react-start";
import { getCart, updateCart } from "./cart";

export const addToCart = createServerFn({ method: "POST" })
  .inputValidator((productSlug: string) => {
    return productSlug;
  })
  .handler(async ({ data: productSlug }) => {
    const prevCart = await getCart();
    if (typeof productSlug !== "string") {
      return;
    }
    const itemAlreadyExists = prevCart.find(
      (item) => item.productSlug === productSlug,
    );
    if (itemAlreadyExists) {
      const newQuantity = itemAlreadyExists.quantity + 1;
      const newCart = prevCart.map((item) => {
        if (item.productSlug === productSlug) {
          return {
            ...item,
            quantity: newQuantity,
          };
        }
        return item;
      });
      await updateCart({ data: newCart });
    } else {
      const newCart = [
        ...prevCart,
        {
          productSlug,
          quantity: 1,
        },
      ];
      await updateCart({ data: newCart });
    }

    return "Item added to cart";
  });

export const removeFromCart = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    const prevCart = await getCart();
    const productSlug = formData.get("productSlug");
    if (typeof productSlug !== "string") {
      return;
    }
    const itemAlreadyExists = prevCart.find(
      (item) => item.productSlug === productSlug,
    );
    if (!itemAlreadyExists) {
      return;
    }
    const newCart = prevCart.filter((item) => item.productSlug !== productSlug);
    await updateCart({ data: newCart });
  });
