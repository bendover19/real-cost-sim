import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "US Cost of Working Calculator – Healthcare, Commute & Rent",
  description:
    "A US-focused guide to calculating the real cost of working when you factor in healthcare, commute, rent and debt.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
              US cost of working calculator
            </h1>
            <p className="text-base md:text-lg text-zinc-700">
              In the US, your &quot;cost of working&quot; isn&apos;t just tax. It&apos;s
              healthcare, commute, rent, childcare, and debt. This page explains how to use the{" "}
              <a href="/sim" className="underline text-rose-600 font-medium">
                Real Cost Simulator
              </a>{" "}
              to see the real cost of your job.
            </p>

            <div className="space-y-4 text-sm md:text-base text-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900">
                1. Choose &quot;United States&quot; as your region
              </h2>
              <p>
                The simulator uses US‑specific assumptions for tax and healthcare, depending on
                whether you:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Have employer‑provided health insurance</li>
                <li>Buy a marketplace plan</li>
                <li>Are currently uninsured</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                2. Add healthcare premiums and out‑of‑pocket costs
              </h2>
              <p>
                Healthcare is one of the biggest hidden costs of working in the US. In the
                simulator you can:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Select your typical plan type (employer, marketplace, none)</li>
                <li>Override with your real monthly premiums and out‑of‑pocket spend</li>
                <li>See how that affects your leftover money and hourly rate</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                3. Include US‑style housing, commute and debt
              </h2>
              <p>
                Combine US rent or mortgage costs with:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Car‑heavy commutes (fuel, insurance, maintenance, parking)</li>
                <li>Public transport season passes where available</li>
                <li>Student loans, credit cards and other debt payments</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                4. See what you really keep per hour
              </h2>
              <p>
                Once everything is in, the simulator shows how much of your income survives
                after the real costs of working in the US. It also reveals your{" "}
                <strong>real hourly wage</strong> – what you actually keep per hour of life,
                after rent, healthcare, commute, debt and lifestyle costs.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/sim"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Run the US cost of working calculator →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
