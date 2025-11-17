import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Hero */}
        <section className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 max-w-xl leading-tight">
            Find out how much of your salary you actually keep after rent, commute, and work-life costs.
          </h1>

          <ul className="space-y-2 text-sm text-zinc-700">
            <li>• See your real take-home pay after essentials</li>
            <li>• Calculate your true hourly rate including commute time</li>
            <li>• Test different rents, remote days, or job offers</li>
          </ul>

          <div className="space-y-2 pt-2">
            <Link
              href="/sim"
              className="inline-flex w-full items-center justify-center rounded-xl 
                         bg-rose-600 px-6 py-3 text-base font-semibold text-white shadow-sm 
                         hover:bg-rose-700 transition"
            >
              Start my month →
            </Link>
            <p className="text-[12px] text-zinc-500">
              Takes under a minute. No login.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">How it works</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-zinc-700">
            <li>Enter your income and rent or mortgage costs.</li>
            <li>Add commute time and typical monthly expenses.</li>
            <li>The simulator calculates how much you actually keep per month.</li>
            <li>You also see your real hourly pay — including time spent commuting.</li>
            <li>Adjust sliders to compare rents, remote days, and lifestyle changes.</li>
          </ol>
        </section>

        {/* Why this matters */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Why this matters</h2>
          <p className="text-sm text-zinc-700">
            Payslips don’t show the hidden costs of working: long commutes, high rent,
            debt repayments, childcare, “maintenance” spending, and the hours required
            to stay employable. These can erase most of your income.
          </p>

          <p className="text-sm text-zinc-700">
            The Real Cost Simulator combines these into one clear number:
            your <strong>hour of freedom</strong> — how much you keep per hour after
            everything it takes to maintain your working life.
          </p>

          <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700">
            <li>“Should I move closer or go fully remote?”</li>
            <li>“Is a promotion worth extra hours and travel?”</li>
            <li>“Would I keep more if I left my city for a cheaper area?”</li>
          </ul>
        </section>

        {/* Placeholder for future ads (AFTER approval) */}
        <section className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-xs text-zinc-500">
          Placeholder for future on-page ad position (after AdSense approval).
        </section>

        <footer className="text-xs text-zinc-500 pt-4">
          Estimates only. Not financial advice.
        </footer>

      </div>
    </main>
  );
}
