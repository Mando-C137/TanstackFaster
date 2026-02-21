import { ErrorComponent, createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } }, // do not use queries in loader and only invalidate manually
  });

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultStaleTime: Infinity, // all loaderData is static
    context: { queryClient },
    defaultPreload: "intent",
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    defaultNotFoundComponent: () => <div>404 - Not Found</div>,
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
