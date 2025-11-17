// app/page.tsx — modern landing page (server component)
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      {/* HERO SECTION */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative mx-auto max-w-3xl bg-white/80 backdrop-blur-md border border-white/80 shadow-xl rounded-3xl p-8 md:p-10 space-y-6">
            {/* glow */}
            <div className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 bg-rose-300/40 blur-[100px] rounded-full -z-10" />

            <h1 className="text-4xl md:text-5xl font-semibold text-zinc-900 leading-tight">
              See your real earnings{" "}
              <span className="text-rose-600">after rent, commute, and life costs.</span>
            </h1>

            <p className="text-base md:text-lg text-zinc-700 max-w-xl">
              Your payslip doesn&apos;t show the true cost of staying employable. The{" "}
              <span className="font-semibold">Real Cost Simulator</span> reveals what you
              actually keep each month and your real hourly rate once your time and
              work-related costs are included & then most importantly, <span className="font-semibold">how to fix it</span>.
            </p>

            {/* CTA */}
            <div className="pt-4 space-y-2">
              <Link
                href="/sim"
                style={{ color: "#ffffff", textDecoration: "none" }}
                className="inline-flex w-full items-center justify-center rounded-full
                           bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-4 text-lg font-semibold
                           text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500
                           focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Start my month →
              </Link>
              <p className="text-[11px] text-zinc-600">
                Under 1 minute. No login.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-md border border-zinc-100 p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-900">How it works</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm md:text-base text-zinc-700">
            <li>Enter your income and rent or mortgage costs.</li>
            <li>Add commute time, transport mode, and monthly lifestyle expenses.</li>
            <li>The simulator calculates how much you actually keep per month.</li>
            <li>It also shows your real hourly rate, including time spent commuting.</li>
            <li>Adjust sliders to compare rents, remote days, and life changes.</li>
          </ol>
        </div>
      </section>

      {/* WHY THIS MATTERS */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-md border border-zinc-100 p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-900">Why this matters</h2>

          <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
            Payslips don&apos;t include the hidden costs of working: long commutes, high rent,
            debt repayments, childcare, and ongoing &quot;maintenance&quot; spending to stay
            employable. These can quietly erase most of your income.
          </p>

          <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
            The Real Cost Simulator gives you one clear number: your{" "}
            <strong>hour of freedom</strong>. How much you keep per hour once work-related
            time and costs are accounted for.
          </p>

          <ul className="list-disc pl-6 text-sm md:text-base text-zinc-700 space-y-1">
            <li>“Should I move closer or go fully remote?”</li>
            <li>“Is this promotion worth the extra hours and travel?”</li>
            <li>“Would I keep more if I lived somewhere cheaper?”</li>
          </ul>
        </div>
      </section>

      <footer className="text-center text-xs text-zinc-600 pb-10">
        Estimates only. This tool is for reflection, not formal financial advice.
      </footer>
    </main>
  );
}
