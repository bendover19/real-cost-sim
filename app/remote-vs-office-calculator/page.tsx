import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remote vs Office Calculator – Is Going Remote Worth It?",
  description:
    "Compare remote, hybrid and office-only work by real hourly pay, commute time and cost of living using the Real Cost Simulator.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
              Remote vs office pay calculator
            </h1>
            <p className="text-base md:text-lg text-zinc-700">
              A &quot;work from home&quot; offer is more than just a change of scenery. It can
              completely reshape your real hourly wage, commute time and cost of living. This
              page explains what to compare – then points you to the{" "}
              <a href="/sim" className="underline text-rose-600 font-medium">
                Real Cost Simulator
              </a>{" "}
              to model your own setup.
            </p>

            <div className="space-y-4 text-sm md:text-base text-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900">
                1. Compare total job time, not just contract hours
              </h2>
              <p>
                Office roles usually come with a hidden tax: commuting, getting ready, and
                staying late for in‑person culture. Remote roles may have fewer hidden hours,
                even if the official schedule is the same. In the simulator you can:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enter your weekly working hours</li>
                <li>Set commute time for the office scenario</li>
                <li>Set &quot;Remote / no commute&quot; for the remote scenario</li>
                <li>See how your total job hours per month change</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                2. Factor in housing and location costs
              </h2>
              <p>
                Being required in the office often means paying more for housing and general
                cost of living. Going remote can open up cheaper areas or even new countries.
                With the simulator you can:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Adjust your rent up or down for each scenario</li>
                <li>
                  Use the &quot;What if I moved?&quot; city comparison to test cheaper locations
                </li>
                <li>See how much extra you keep each month after housing</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                3. Compare &quot;hour of freedom&quot;, not just salary
              </h2>
              <p>
                A remote role might pay slightly less on paper but leave you with more{" "}
                <strong>money per hour of life</strong> once everything&apos;s included. The
                simulator gives you a head‑to‑head comparison by showing:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Leftover money per month after costs of working</li>
                <li>Real hourly rate (leftover ÷ total job hours)</li>
                <li>How this changes as you add remote days or tweak rent</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                4. Don&apos;t ignore wellbeing and risk
              </h2>
              <p>
                The calculator is focused on numbers, but those numbers point to quality of
                life: shorter commutes, more family time, fewer stress‑driven purchases, and
                more flexibility. You can use the tool to make those trade‑offs visible instead
                of guessing.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/sim"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Compare your remote vs office scenarios →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
