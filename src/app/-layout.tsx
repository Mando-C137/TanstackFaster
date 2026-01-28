// import type { Metadata } from "next";
import "./globals.css";
import { SearchDropdownComponent } from "@/components/search-dropdown";
import { MenuIcon } from "lucide-react";
import React, { Suspense } from "react";
import { Cart } from "@/components/cart";
import { AuthServer } from "./-auth.client";
import { Link } from "@/components/ui/link";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { WelcomeToast } from "./welcome-toast";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata /*:Metadata*/ = {
  title: {
    template: "%s | NextFaster",
    default: "NextFaster",
  },
  description: "A performant site built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CachedLayout
      authComponent={<AuthServer />}
      cartComponent={
        null
        //< Cart />
      }
    >
      {children}
    </CachedLayout>
  );
}

async function CachedLayout({
  children,
  authComponent,
  cartComponent,
}: {
  children: React.ReactNode;
  authComponent: React.ReactNode;
  cartComponent: React.ReactNode;
}) {
  "use cache";
  return (
    <html lang="en" className="h-full">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} flex flex-col overflow-x-hidden overflow-y-auto antialiased`}
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
                  {authComponent}
                </Suspense>
              </div>
              <div className="flex w-full flex-col items-start justify-center sm:w-auto sm:flex-row sm:items-center sm:gap-2">
                <a
                  // prefetch={true}
                  href="/"
                  className="text-accent1 text-4xl font-bold"
                >
                  NextFaster
                </a>
                <div className="items flex w-full flex-row items-center justify-between gap-4">
                  <div className="mx-0 flex-grow sm:mx-auto sm:flex-grow-0">
                    <SearchDropdownComponent />
                  </div>
                  <div className="flex flex-row justify-between space-x-4">
                    <div className="relative">
                      <a
                        // prefetch={true}
                        href="/order"
                        className="text-accent1 text-lg hover:underline"
                      >
                        ORDER
                      </a>
                      <Suspense>{cartComponent}</Suspense>
                    </div>
                    <a
                      // prefetch={true}
                      href="/order-history"
                      className="text-accent1 hidden text-lg hover:underline md:block"
                    >
                      ORDER HISTORY
                    </a>
                    <a
                      // prefetch={true}
                      href="/order-history"
                      aria-label="Order History"
                      className="text-accent1 block text-lg hover:underline md:hidden"
                    >
                      <MenuIcon />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className="pt-[85px] sm:pt-[70px]">{children}</div>
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
      </body>
    </html>
  );
}
