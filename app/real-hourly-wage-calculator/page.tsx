import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Hourly Wage Calculator – See What You Really Earn",
  description:
    "Work out your real hourly wage after rent, commute, debt, and life costs. Use this guide then run the interactive Real Cost Simulator.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
              Real hourly wage calculator
            </h1>
            <p className="text-base md:text-lg text-zinc-700">
              Your salary doesn&apos;t tell you what you actually earn per hour. Commute time,
              rent to be near the office, childcare, and &quot;maintenance&quot; spending all
              eat into your real hourly wage. This page walks you through the logic – then
              lets you run the full{" "}
              <a href="/sim" className="underline text-rose-600 font-medium">
                Real Cost Simulator
              </a>{" "}
              to see your own numbers.
            </p>

            <div className="space-y-4 text-sm md:text-base text-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900">
                1. Start with what actually lands in your account
              </h2>
              <p>
                To calculate a meaningful hourly rate, ignore the sticker salary and use your{" "}
                <strong>net pay</strong> (after tax and payroll deductions). If you only know
                your gross, divide it by 12 and then subtract income tax, social security /
                NI, and pension contributions – or just use the &quot;Gross&quot; option in
                the simulator, which approximates take‑home for you.
              </p>

              <h2 className="text-xl font-semibold text-zinc-900">
                2. Add the time you spend on the job – including commute
              </h2>
              <p>
                Your job isn&apos;t just the hours in your contract. It&apos;s also time spent
                getting ready, commuting, and recovering from late nights or extra days. On the
                simulator, you can:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Set your <strong>actual working hours per week</strong></li>
                <li>Add your <strong>daily commute time</strong> (there &amp; back)</li>
                <li>See your total job time per week, including commute</li>
              </ul>
              <p>
                Your real hourly wage is calculated using this total time – not just what&apos;s
                written in your contract.
              </p>

              <h2 className="text-xl font-semibold text-zinc-900">
                3. Subtract the real costs of staying employable
              </h2>
              <p>
                Most &quot;hourly wage&quot; calculators stop at tax. The Real Cost Simulator
                goes further and subtracts:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Rent / mortgage (especially if you pay more to live near work)</li>
                <li>Commute costs (transport, fuel, parking, taxis)</li>
                <li>Debt repayments and student loans</li>
                <li>Childcare and support for dependants</li>
                <li>
                  Ongoing &quot;maintenance&quot; spending: clothes for work, lunches out,
                  takeaways when you&apos;re exhausted, dating / socialising to stay connected
                </li>
              </ul>
              <p>
                When these are deducted from your monthly income, you&apos;re left with{" "}
                <strong>money you actually keep</strong>. Divide that by your total job hours
                and you get your real hourly wage.
              </p>

              <h2 className="text-xl font-semibold text-zinc-900">
                4. What a good &quot;real hourly wage&quot; looks like
              </h2>
              <p>
                There&apos;s no universal &quot;good&quot; number – it depends on your
                country, family situation, and what you value. But as a rough guide:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  If your <strong>real hourly wage is negative</strong>, your costs of working
                  are higher than your income – something may have to change soon.
                </li>
                <li>
                  If you&apos;re keeping <strong>less than {`$`}5–{`$`}10 per hour</strong>{" "}
                  after everything, you&apos;re probably feeling permanently squeezed.
                </li>
                <li>
                  When you keep a <strong>healthy margin per hour</strong>, you can save,
                  take time off, or say no to bad offers.
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                5. Try your own numbers in the simulator
              </h2>
              <p>
                The Real Cost Simulator is built to answer questions like:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>&quot;What happens if I go fully remote?&quot;</li>
                <li>&quot;Is a higher salary with a brutal commute actually worth it?&quot;</li>
                <li>&quot;Would I keep more if I moved somewhere cheaper?&quot;</li>
              </ul>
              <p>
                It gives you a simple headline:{" "}
                <strong>how much you keep per hour of your life</strong>, after rent, commute,
                kids, debt, healthcare and lifestyle costs.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/sim"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Open the interactive real hourly wage calculator →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
