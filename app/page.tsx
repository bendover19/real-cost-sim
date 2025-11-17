// app/page.tsx — modern 2025 landing page (NO "use client")
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      
      {/* HERO SECTION */}
      <section className="relative py-16 md:py-24">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-rose-100/60 to-rose-50 -z-10" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          
          {/* Glow behind the card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-300/20 blur-[160px] rounded-full -z-10"></div>
          
          {/* Main hero card */}
          <div className="mx-auto max-w-3xl bg-white/70 backdrop-blur-sm border border-white shadow-xl rounded-3xl p-10 space-y-6">
            
            <h1 className="text-4xl md:text-5xl font-semibold text-zinc-900 leading-tight">
              See your real earnings <span className="text-rose-600">after rent, commute, and life costs.</span>
            </h1>

            <p className="text-lg text-zinc-700 max-w-xl mx-auto">
              Your payslip doesn’t show the <em>true</em> cost of staying employable. 
              The Real Cost Simulator reveals what you actually keep — and your real hourly rate.
            </p>

            {/* Quick highlights */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <div className="bg-white/70 border backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm text-sm text-zinc-800">
                ✔ Real take-home picture
              </div>
              <div className="bg-white/70 border backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm text-sm text-zinc-800">
                ✔ Commute time included
              </div>
              <div className="bg-white/70 border backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm text-sm text-zinc-800">
                ✔ What-if scenarios in seconds
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 space-y-2">
              <Link
                href="/sim"
                className="inline-flex w-full items-center justify-center rounded-full 
                  bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-4 text-lg font-semibold 
                  text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Start my month →
              </Link>
              <p className="text-xs text-zinc-500">
                Under 1 minute. No login. Numbers stay on your device.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-md border border-zinc-100 p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-900">How it works</h2>
          <ol className="list-decimal pl-5 space-y-2 text-zinc-700 text-sm md:text-base">
            <li>Enter your income and rent/mortgage costs.</li>
            <li>Add commute time and monthly lifestyle expenses.</li>
            <li>The simulator calculates your true monthly leftover.</li>
            <li>It also shows your real hourly rate — including commute time.</li>
            <li>Test rents, remote days, and other life changes in seconds.</li>
          </ol>
        </div>
      </section>

      {/* WHY THIS MATTERS */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-md border border-zinc-100 p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-900">Why this matters</h2>

          <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
            Your payslip doesn’t include the hidden costs of working: long commutes, high rent,
            debt repayments, childcare, and ongoing “maintenance” spending to stay employable.
            These can erase most of your income.
          </p>

          <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
            The Real Cost Simulator gives you one clear number: your{" "}
            <strong>hour of freedom</strong> — how much you keep per hour once work-related
            costs and time are accounted for.
          </p>

          <ul className="list-disc pl-6 text-sm md:text-base text-zinc-700 space-y-1">
            <li>“Should I move closer or go fully remote?”</li>
            <li>“Is this promotion worth extra hours and travel?”</li>
            <li>“Would I keep more if I lived somewhere cheaper?”</li>
          </ul>
        </div>
      </section>

      <footer className="text-center text-xs text-zinc-500 pb-10">
        Estimates only. Not financial advice.
      </footer>
    </main>
  );
}
