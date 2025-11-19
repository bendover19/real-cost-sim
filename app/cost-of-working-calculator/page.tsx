import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cost of Working Calculator – Rent, Commute, Kids & Debt",
  description:
    "See how much it really costs you to stay employable each month, beyond tax. Then run the interactive Real Cost Simulator.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
              Cost of working calculator
            </h1>
            <p className="text-base md:text-lg text-zinc-700">
              Most people know what they earn. Very few know what it{" "}
              <em>costs</em> to keep earning. This page walks through the
              main costs of working – then lets you plug everything into the{" "}
              <a href="/sim" className="underline text-rose-600 font-medium">
                Real Cost Simulator
              </a>{" "}
              to see the true bottom line.
            </p>

            <div className="space-y-4 text-sm md:text-base text-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900">
                1. Housing tied to your job
              </h2>
              <p>
                If you live in an expensive city mainly{" "}
                <strong>because your job is there</strong>, part of your rent or mortgage is
                really a cost of employment. In the simulator you can:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enter your monthly rent or mortgage (your share)</li>
                <li>Choose whether bills are included</li>
                <li>
                  Compare with &quot;typical&quot; local housing costs based on country and city
                  type
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                2. Commute time and money
              </h2>
              <p>
                Your commute has both a <strong>cash cost</strong> and a{" "}
                <strong>time cost</strong>. The simulator turns your daily commute minutes into
                hours per month, and estimates typical costs for public transport or driving in
                your region. You can override this with your exact monthly commute spend.
              </p>

              <h2 className="text-xl font-semibold text-zinc-900">
                3. Children and dependants
              </h2>
              <p>
                Work often drives childcare and family expenses: nursery, after‑school clubs,
                tutors, and support for relatives. You can quickly estimate:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>How many children you have and their age band</li>
                <li>Typical child‑related costs by region</li>
                <li>How much of your income is effectively tied to being able to work</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                4. Health, debt and &quot;maintenance&quot; spending
              </h2>
              <p>
                This includes anything you wouldn&apos;t need (or wouldn&apos;t need as much
                of) if you weren&apos;t working this job in this way:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Therapy and coaching to cope with stress or burnout</li>
                <li>Health costs, medication, dental and vision care</li>
                <li>Debt repayments and student loans from &quot;getting qualified&quot;</li>
                <li>
                  Clothes, cosmetics, grooming, socialising and &quot;little treats&quot; needed
                  to stay presentable and upright
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                5. See your &quot;hour of freedom&quot;
              </h2>
              <p>
                When you subtract all these costs from your income, what&apos;s left is what you
                truly keep. Dividing that by your total job hours gives your{" "}
                <strong>hour of freedom</strong>: the amount of money you have left per hour of
                life spent working and commuting.
              </p>
              <p>
                The simulator shows this as a simple number, plus a visual breakdown of where
                your money goes each month and how changes – like going remote or moving city –
                would impact it.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/sim"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Work out your true cost of working →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
