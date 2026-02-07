import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useParams,
} from "@tanstack/react-router";
// import { Analytics } from "@vercel/analytics/react";
// import { SpeedInsights } from "@vercel/speed-insights/next";
import { MenuIcon } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Toaster } from "sonner";
import appCss from "./globals.css?url";
import { WelcomeToast } from "./welcome-toast";
import { AuthServer } from "./-auth.client";
import type { QueryClient } from "@tanstack/react-query";
import { SearchDropdownComponent } from "@/components/search-dropdown";
import { Cart } from "@/components/cart";
import { Link } from "@/components/ui/link";

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
        {
          rel: "icon",
          href: "/favicon.ico",
        },
      ],
    }),
    component: RootLayout,
  },
);

function RootLayout() {
  const params = useParams({ strict: false });
  const subcategoryKey =
    typeof params.subcategory === "string" ? params.subcategory : "root";

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
                {/* <NextToTanstack /> */}
                <NextToTanstack />
                <div className="flex w-full flex-row items-center justify-between gap-4">
                  <div className="mx-0 flex-grow sm:mx-auto sm:flex-grow-0">
                    <SearchDropdownComponent key={subcategoryKey} />
                  </div>
                  <div className="flex flex-row justify-between space-x-4">
                    <div className="relative">
                      <Link
                        preload={"intent"}
                        to="/order"
                        className="text-accent1 text-lg hover:underline"
                      >
                        ORDER
                      </Link>
                      <Suspense>
                        <Cart />
                      </Suspense>
                    </div>
                    <Link
                      preload={"intent"}
                      to="/order-history"
                      className="text-accent1 hidden text-lg hover:underline md:block"
                    >
                      ORDER HISTORY
                    </Link>
                    <Link
                      preload={"intent"}
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
        {/* <Analytics scriptSrc="/insights/events.js" endpoint="/hfi/events" />
        <SpeedInsights /> */}

        <Scripts />
      </body>
    </html>
  );
}

function NextToTanstack() {
  return (
    <a
      href="https://next-faster.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent1 group flex items-center text-4xl font-bold"
    >
      <div className="logo-cube-container">
        <div className="logo-cube">
          {/* Front face: TanstackFaster (default) */}
          <span className="logo-face logo-face-front">TanstackFaster</span>
          {/* Bottom face: NextFaster (shown on hover) */}
          <span className="logo-face logo-face-bottom">NextFaster</span>
        </div>
      </div>
    </a>
  );
}

export default function CylinderLink() {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-accent1 flex items-center justify-center overflow-hidden">
      {/* Centered wrapper with equal perspective from center */}
      <div className="relative flex justify-center perspective-[1000px]">
        <Link
          to="/"
          className="relative inline-block h-10 w-[15ch] text-center text-4xl font-bold"
        >
          <div
            className={`relative h-full w-full transition-transform duration-1000 transform-3d ${
              flipped ? "transform-[rotateX(90deg)]" : ""
            }`}
          >
            {/* Front Face */}
            <span className="absolute inset-0 flex h-full w-full transform-[translateZ(1.25rem)] items-center justify-center rounded-md backface-hidden">
              NextFaster
            </span>

            {/* Bottom Face */}
            <span className="absolute inset-0 flex h-full w-full transform-[rotateX(-90deg)_translateZ(1.25rem)] items-center justify-center rounded-md backface-hidden">
              TanstackFaster
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
