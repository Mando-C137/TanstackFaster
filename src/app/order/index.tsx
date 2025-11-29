import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { PlaceOrderAuth } from "../-auth.client";
import { CartItems, TotalCost } from "./-dynamic";
import { detailedCart } from "@/lib/cart";

export const Route = createFileRoute("/order/")({
  head: () => ({
    meta: [
      {
        title: "Order",
      },
    ],
  }),
  loader: async () => {
    const cart = await detailedCart();
    return { cart };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { cart } = Route.useLoaderData();
  return (
    <main className="min-h-screen sm:p-4">
      <div className="container mx-auto p-1 sm:p-3">
        <div className="flex items-center justify-between border-b border-gray-200">
          <h1 className="text-accent1 text-2xl">Order</h1>
        </div>

        <div className="flex grid-cols-3 flex-col gap-8 pt-4 lg:grid">
          <div className="col-span-2">
            <Suspense>
              <CartItems cart={cart} />
            </Suspense>
          </div>

          <div className="space-y-4">
            <div className="rounded bg-gray-100 p-4">
              <p className="font-semibold">
                Merchandise{" "}
                <Suspense>
                  <TotalCost cart={cart} />
                </Suspense>
              </p>
              <p className="text-sm text-gray-500">
                Applicable shipping and tax will be added.
              </p>
            </div>
            <Suspense>
              <PlaceOrderAuth />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
