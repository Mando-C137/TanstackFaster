import { createFileRoute } from "@tanstack/react-router";
import { OrderHistoryDynamic } from "./-dynamic";
import { Suspense } from "react";

export const Route = createFileRoute("/order-history/")({
  head: () => ({
    meta: [
      {
        title: "Order History | TanstackFaster",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="border-accent1 text-accent1 w-full border-b-2 text-left text-2xl">
        Order History
      </h1>
      <div className="mx-auto flex max-w-md flex-col gap-4 text-black">
        <Suspense>
          <OrderHistoryDynamic />
        </Suspense>
      </div>
    </main>
  );
}
