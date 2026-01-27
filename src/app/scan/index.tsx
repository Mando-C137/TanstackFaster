import { scan } from "react-scan"; // import this BEFORE react
import React from "react";
import { Link } from "@/components/ui/link";
import { createFileRoute } from "@tanstack/react-router";

if (typeof window !== "undefined") {
  scan({
    enabled: true,
  });
}
export const Route = createFileRoute("/scan/")({
  component: ScanPage,
});

function ScanPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <p className="mb-4 text-lg">
        React Scan has loaded, you can now start exploring the site
      </p>
      <Link to="/" className="text-blue-500 underline hover:text-blue-700">
        Back to home
      </Link>
    </div>
  );
}
