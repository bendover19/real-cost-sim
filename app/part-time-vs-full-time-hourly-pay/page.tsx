import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Part-Time vs Full-Time Hourly Pay – Which Leaves You Better Off?",
  description:
    "Compare part-time and full-time work by real hourly pay, not just salary, using the Real Cost Simulator.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
              Part‑time vs full‑time hourly pay
            </h1>
            <p className="text-base md:text-lg text-zinc-700">
              A part‑time role can sometimes leave you with{" "}
              <em>more</em> money and freedom per hour than a full‑time job. The key is to look
              at real hourly pay after rent, commute, kids, debt and &quot;maintenance&quot;
              costs. This guide shows you how to compare them using the{" "}
              <a href="/sim" className="underline text-rose-600 font-medium">
                Real Cost Simulator
              </a>
              .
            </p>

            <div className="space-y-4 text-sm md:text-base text-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900">
                1. Set up your full‑time scenario
              </h2>
              <p>
                First, enter your current or potential full‑time role:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Monthly income (or gross if you only know the salary)</li>
                <li>Actual working hours per week</li>
                <li>Commute time and transport mode</li>
                <li>Rent, childcare, debt and lifestyle costs</li>
              </ul>
              <p>
                Note your leftover money per month and real hourly rate from the simulator.
              </p>

              <h2 className="text-xl font-semibold text-zinc-900">
                2. Clone it as a part‑time variant
              </h2>
              <p>
                Now tweak the same setup as if you moved to part‑time:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Reduce your weekly hours</li>
                <li>Cut commute days if you&apos;d travel less often</li>
                <li>Adjust income down based on what the employer is offering</li>
                <li>
                  See if any costs fall – e.g. less childcare, fewer takeaway dinners, less
                  need for &quot;time trade&quot; spending
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                3. Compare real hourly pay and leftover
              </h2>
              <p>
                The simulator shows you two crucial numbers for each setup:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>How much you keep per month after all costs</li>
                <li>How much you keep per hour of life spent working and commuting</li>
              </ul>
              <p>
                This can reveal that a modest pay cut for fewer hours leaves you{" "}
                <strong>better off per hour</strong> and with more free time.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/sim"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Compare your part‑time vs full‑time scenarios →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
