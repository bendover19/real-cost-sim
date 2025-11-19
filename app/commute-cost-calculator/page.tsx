import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commute Cost Calculator – Time & Money You Spend Getting to Work",
  description:
    "Estimate the real monthly cost of your commute in time and money, then plug the numbers into the Real Cost Simulator.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
              Commute cost calculator
            </h1>
            <p className="text-base md:text-lg text-zinc-700">
              Your commute isn&apos;t just the price of a ticket or the fuel in your car.
              It&apos;s also hours of your life, wear and tear on your body, and small costs
              that add up over a month. This page shows you how to estimate it properly and
              then plug it into the{" "}
              <a href="/sim" className="underline text-rose-600 font-medium">
                Real Cost Simulator
              </a>
              .
            </p>

            <div className="space-y-4 text-sm md:text-base text-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900">
                1. Work out your time spent commuting
              </h2>
              <p>
                Start with a simple question: <strong>How many minutes does it take</strong>{" "}
                to get from home to work and back on a typical day? Include:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Walking to the station, stop or car park</li>
                <li>Waiting time for trains, buses or rideshares</li>
                <li>Transfers or traffic jams</li>
                <li>Any &quot;buffer&quot; time you leave so you&apos;re not late</li>
              </ul>
              <p>
                On the simulator, you can enter this as{" "}
                <strong>&quot;Time spent commuting on a working day (there &amp; back)&quot;</strong>.
                We then convert it into hours per week and factor it into your total job time.
              </p>

              <h2 className="text-xl font-semibold text-zinc-900">
                2. Add your direct money costs
              </h2>
              <p>Depending on how you travel, this might include:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Season tickets, travel cards or pay‑as‑you‑go fares</li>
                <li>Fuel, tolls, congestion charges and parking</li>
                <li>Taxi / rideshare costs for late nights or unsafe journeys</li>
                <li>Bike maintenance or rental fees</li>
              </ul>
              <p>
                In the simulator we estimate this automatically from your region, city type and
                commute time, but you can also add an{" "}
                <strong>exact monthly commute cost</strong> if you know it.
              </p>

              <h2 className="text-xl font-semibold text-zinc-900">
                3. Don&apos;t forget the &quot;hidden&quot; commute spend
              </h2>
              <p>
                Many commute calculators stop at tickets and fuel. Real life adds more:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Coffees and snacks at the station</li>
                <li>Buying extra work clothes and shoes that survive the commute</li>
                <li>Takeaways because you&apos;re home late and exhausted</li>
                <li>Childcare wrap‑around hours so you can travel</li>
              </ul>
              <p>
                These show up in the simulator in categories like &quot;Time trade&quot;,
                &quot;Comfort&quot; and &quot;Belonging&quot; – because they&apos;re all part
                of the total cost of keeping your job going.
              </p>

              <h2 className="text-xl font-semibold text-zinc-900">
                4. Compare remote, hybrid and office‑only setups
              </h2>
              <p>
                Once your commute is in the system, you can play with different setups:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Set your transport mode to remote, walk/bike, public transport or driving</li>
                <li>Use the &quot;What if&quot; sliders to add remote days per week</li>
                <li>
                  See how your leftover money and real hourly rate change as the commute shrinks
                </li>
              </ul>
              <p>
                Sometimes, a small drop in salary for more remote days leaves you{" "}
                <strong>better off per hour</strong> than a higher‑paying, office‑only job.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/sim"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Estimate your real commute cost in the simulator →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
