import { createRouter, ErrorComponent } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import NotFound from "@/app/not-found";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

export function getRouter() {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: { queryClient },
    defaultPreload: "intent",
    defaultErrorComponent: ({ error, reset }) => (
      <ErrorComponent error={error} />
    ),
    defaultNotFoundComponent: () => <NotFound />,
  });
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
