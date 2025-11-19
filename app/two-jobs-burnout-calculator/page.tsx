import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Two Jobs & Burnout Calculator – Are Your Extra Hours Worth It?",
  description:
    "See whether working multiple jobs or constant overtime actually leaves you ahead once time and costs are included.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
              Two jobs &amp; burnout calculator
            </h1>
            <p className="text-base md:text-lg text-zinc-700">
              Side hustles, overtime and second jobs can boost your income – but they can also
              wipe out your energy and increase your costs. Use the{" "}
              <a href="/sim" className="underline text-rose-600 font-medium">
                Real Cost Simulator
              </a>{" "}
              to see whether the extra hours are actually worth it.
            </p>

            <div className="space-y-4 text-sm md:text-base text-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900">
                1. Capture your main job properly
              </h2>
              <p>
                Set up your main job first – income, hours, commute, rent, kids, debt and
                maintenance spending. This gives you a baseline real hourly wage and leftover
                per month.
              </p>

              <h2 className="text-xl font-semibold text-zinc-900">
                2. Add extra income as &quot;other income&quot;
              </h2>
              <p>
                Instead of building a second full model, you can add your side income under{" "}
                <strong>&quot;Other income&quot;</strong> in the simulator. Then:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Increase your weekly working hours to include the second job</li>
                <li>
                  Add any extra commute time or costs if the side work isn&apos;t remote
                </li>
                <li>
                  Increase &quot;maintenance&quot; spends if burnout makes you spend more on
                  convenience
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                3. See if the extra work actually pays off
              </h2>
              <p>
                Now compare your &quot;before&quot; and &quot;after&quot;:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>How much extra do you actually keep each month?</li>
                <li>What happens to your real hourly rate when you add those hours?</li>
                <li>
                  Are you trading {`$`}X of real money per hour for sleep, health and family
                  time?
                </li>
              </ul>
              <p>
                Sometimes the answer is &quot;yes, this pushes me ahead&quot;. Sometimes it&apos;s
                &quot;I&apos;m working myself into the ground for very little gain&quot; – and
                that&apos;s useful to see clearly.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/sim"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Check if your extra hours are really worth it →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
