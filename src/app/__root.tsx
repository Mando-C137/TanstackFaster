import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Link } from "@/components/ui/link";
import appCss from "./globals.css?url";
import { SearchDropdownComponent } from "@/components/search-dropdown";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MenuIcon } from "lucide-react";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { WelcomeToast } from "./welcome-toast";
import { Cart } from "@/components/cart";
import { AuthServer } from "./-auth.client";
import { getCart } from "@/lib/cart";
import type { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "TanStackFaster",
          description: "A performant site built with TanstackStart",
        },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }),
    loader: async () => ({ cart: await getCart() }),
    component: RootLayout,
  },
);

function RootLayout() {
  const { cart } = Route.useLoaderData();
  return (
    <html lang="en" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body
        className={`flex flex-col overflow-x-hidden overflow-y-auto antialiased`}
      >
        <div>
          <header className="border-accent2 bg-background fixed top-0 z-10 flex h-[90px] w-[100vw] flex-grow items-center justify-between border-b-2 p-2 pt-2 pb-[4px] sm:h-[70px] sm:flex-row sm:gap-4 sm:p-4 sm:pt-0 sm:pb-[4px]">
            <div className="flex flex-grow flex-col">
              <div className="absolute top-2 right-2 flex justify-end pt-2 font-sans text-sm hover:underline sm:relative sm:top-0 sm:right-0">
                <Suspense
                  fallback={
                    <button className="flex flex-row items-center gap-1">
                      <div className="h-[20px]" />
                      <svg viewBox="0 0 10 6" className="h-[6px] w-[10px]">
                        <polygon points="0,0 5,6 10,0"></polygon>
                      </svg>
                    </button>
                  }
                >
                  <AuthServer />
                </Suspense>
              </div>
              <div className="flex w-full flex-col items-start justify-center sm:w-auto sm:flex-row sm:items-center sm:gap-2">
                <Link
                  preload={"viewport"}
                  to="/"
                  className="text-accent1 text-4xl font-bold"
                >
                  TanstackFaster
                </Link>
                <div className="items flex w-full flex-row items-center justify-between gap-4">
                  <div className="mx-0 flex-grow sm:mx-auto sm:flex-grow-0">
                    <SearchDropdownComponent />
                  </div>
                  <div className="flex flex-row justify-between space-x-4">
                    <div className="relative">
                      <Link
                        preload={"viewport"}
                        to="/order"
                        className="text-accent1 text-lg hover:underline"
                      >
                        ORDER
                      </Link>
                      <Suspense>
                        <Cart cart={cart} />
                      </Suspense>
                    </div>
                    <Link
                      preload={"viewport"}
                      to="/order-history"
                      className="text-accent1 hidden text-lg hover:underline md:block"
                    >
                      ORDER HISTORY
                    </Link>
                    <Link
                      preload={"viewport"}
                      to="/order-history"
                      aria-label="Order History"
                      className="text-accent1 block text-lg hover:underline md:hidden"
                    >
                      <MenuIcon />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className="pt-[85px] sm:pt-[70px]">
            <Outlet />
          </div>
        </div>
        <footer className="bg-background fixed bottom-0 flex h-12 w-screen flex-col items-center justify-between space-y-2 border-t border-gray-400 px-4 font-sans text-[11px] sm:h-6 sm:flex-row sm:space-y-0">
          <div className="flex flex-wrap justify-center space-x-2 pt-2 sm:justify-start">
            <span className="hover:bg-accent2 hover:underline">Home</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">FAQ</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">Returns</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">Careers</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">Contact</span>
          </div>
          <div className="text-center sm:text-right">
            By using this website, you agree to check out the{" "}
            <a
              href="https://github.com/ethanniser/NextFaster"
              className="text-accent1 font-bold hover:underline"
              target="_blank"
            >
              Source Code
            </a>
          </div>
        </footer>
        {/* does putting this in suspense do anything? */}
        <Suspense fallback={null}>
          <Toaster closeButton />
          <WelcomeToast />
        </Suspense>
        <Analytics scriptSrc="/insights/events.js" endpoint="/hfi/events" />
        <SpeedInsights />

        <Scripts />
      </body>
    </html>
  );
}
