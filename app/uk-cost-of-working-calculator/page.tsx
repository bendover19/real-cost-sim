import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UK Cost of Working Calculator – Commute, Rent & Bills",
  description:
    "A UK-focused guide to calculating the real cost of working in London and other UK cities using the Real Cost Simulator.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
              UK cost of working calculator
            </h1>
            <p className="text-base md:text-lg text-zinc-700">
              London rent, rail season tickets, childcare, student loans… the UK adds a lot of
              extra costs to your payslip. This page explains how to use the{" "}
              <a href="/sim" className="underline text-rose-600 font-medium">
                Real Cost Simulator
              </a>{" "}
              to see the real cost of working in the UK.
            </p>

            <div className="space-y-4 text-sm md:text-base text-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900">
                1. Choose &quot;United Kingdom&quot; as your region
              </h2>
              <p>
                The simulator has UK‑specific defaults for rent, commute and childcare. Choose:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>&quot;United Kingdom&quot; in the country selector</li>
                <li>Your area type – city centre, urban/metro, suburban or rural</li>
                <li>Your commute context – transit‑efficient, mixed, or car‑dependent</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                2. Include your student loan and debt repayments
              </h2>
              <p>
                Many UK workers are still paying student loans alongside other debts.
                The simulator lets you:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Set a monthly student loan payment</li>
                <li>Add other credit card, overdraft or loan repayments</li>
                <li>See how much of your income these eat each month</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                3. Capture UK commute realities
              </h2>
              <p>
                Whether you&apos;re squeezing onto the Tube or driving across a rural county,
                commute time and money add up. In the simulator you can:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enter your door‑to‑door commute time in minutes per day</li>
                <li>Let the tool estimate typical UK monthly commute costs</li>
                <li>Override it with your exact rail, bus or fuel spend</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                4. See what you really keep after UK living costs
              </h2>
              <p>
                Once your rent, commute, bills, kids and debts are in, the simulator shows how
                much you actually keep per month and per hour of life. That can help with
                decisions like:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>&quot;Is moving closer to London for this role actually worth it?&quot;</li>
                <li>&quot;Would I keep more if I stayed in a cheaper UK city and earned less?&quot;</li>
                <li>&quot;Is this promotion worth the extra commute and hours?&quot;</li>
              </ul>
            </div>

            <div className="pt-4">
              <a
                href="/sim"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Run the UK cost of working calculator →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
