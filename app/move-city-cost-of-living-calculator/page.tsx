import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Move City Cost of Living Calculator – Should You Relocate?",
  description:
    "Test whether moving city would leave you with more money and time using the Real Cost Simulator.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
              Move city cost of living calculator
            </h1>
            <p className="text-base md:text-lg text-zinc-700">
              Thinking about leaving an expensive city for somewhere calmer – or the other way
              round? This page shows you how to estimate the impact on your leftover money and
              time using the{" "}
              <a href="/sim" className="underline text-rose-600 font-medium">
                Real Cost Simulator
              </a>
              .
            </p>

            <div className="space-y-4 text-sm md:text-base text-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900">
                1. Capture your current baseline
              </h2>
              <p>
                First, set up your current situation in the simulator:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your country / region and city type (inner city, suburban, rural)</li>
                <li>Your income, rent or mortgage, and monthly bills</li>
                <li>Commute time and mode of transport</li>
                <li>Children, health costs, and debt repayments</li>
              </ul>
              <p>
                This gives you a baseline &quot;hour of freedom&quot; and leftover per month in
                your current city.
              </p>

              <h2 className="text-xl font-semibold text-zinc-900">
                2. Choose a target city or region
              </h2>
              <p>
                The simulator includes presets for popular relocation cities like Lisbon, Bali,
                Valencia, Mexico City and more. These come with typical:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Rent levels (for similar quality housing)</li>
                <li>Childcare costs</li>
                <li>Commute costs (if you&apos;re not fully remote)</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                3. Compare leftover money and hourly freedom
              </h2>
              <p>
                With one click, you can see how your leftover money and real hourly rate would
                change if you lived in the new city while keeping the same income. You&apos;ll
                see:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Change in housing cost per month</li>
                <li>Change in childcare and commute costs</li>
                <li>Difference in leftover money and real hourly pay</li>
                <li>Rough estimate of commute hours saved per month</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                4. Turn &quot;maybe one day&quot; into concrete numbers
              </h2>
              <p>
                Instead of vaguely dreaming about moving somewhere cheaper, you can see
                estimates like: &quot;Moving here would give me {`$`}800 more per month and 10
                hours of my life back&quot;. That makes decisions – and negotiations with
                employers – much easier.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/sim"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Test a move to a new city →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
