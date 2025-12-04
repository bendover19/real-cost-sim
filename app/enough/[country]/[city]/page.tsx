import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "../../EnoughClient";

// 1) Define the props type
type Props = {
  params: {
    country?: string;
    city?: string;
  };
};

// 2) (Optional) if you use generateMetadata, it already takes { params }: Props

export function generateMetadata({ params }: Props): Metadata {
  // ... your existing metadata logic ...
  return {
    title: "…",
    description: "…",
  };
}

// 3) Accept params in the page component
export default function EnoughCityPage({ params }: Props) {
  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <Suspense
        fallback={
          <div className="mt-16 text-sm text-zinc-500">
            Loading the calculator…
          </div>
        }
      >
        <EnoughClient />
      </Suspense>

      {/* DEBUG: this now has access to params */}
    </main>
  );
}
