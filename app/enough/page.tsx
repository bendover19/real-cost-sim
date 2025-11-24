// app/enough/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import EnoughClient from "./EnoughClient";

export const metadata: Metadata = {
  title: "Is this salary enough?",
  description:
    "Rough estimate of what's left after rent, bills and commute for a single renter in a UK city.",
};

export default function EnoughPage() {
  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <Suspense
        fallback={
          <div className="mt-16 text-sm text-zinc-500">Loading the calculator…</div>
        }
      >
        <EnoughClient />
      </Suspense>
    </main>
  );
}
