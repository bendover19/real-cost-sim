// app/page.tsx  (NO "use client" here)
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-zinc-900">
            The Real Cost of Working
          </h1>
          <p className="text-zinc-700">
            Most people never see how much of their paycheck quietly disappears
            into rent, transport, debt, and time spent commuting. Your payslip ≠ your pay.
          </p>
          <p className="text-zinc-700">
            The <strong>Real Cost Simulator</strong> shows your true{" "}
            <em>“hour of freedom”</em> — how much money you actually keep after
            the hidden costs of staying employable and functional.
          </p>
        </header>

        <section className="space-y-3 text-zinc-700">
          <h2 className="text-xl font-semibold">What the simulator does</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Combines income, rent, commute, debt, savings, and lifestyle costs.</li>
            <li>Calculates how much you really keep each month after all obligations.</li>
            <li>Shows your effective pay per hour, including commute time.</li>
            <li>Lets you test “what if” scenarios for rent, remote days, and income changes.</li>
          </ul>
        </section>

        <section className="space-y-3 text-zinc-700">
          <h2 className="text-xl font-semibold">Who it’s for</h2>
          <p>
            • People in expensive cities wondering if their job is actually worth it. <br />
            • Remote workers deciding whether to move somewhere cheaper. <br />
            • Anyone comparing different housing, commute, or job options.
          </p>
        </section>

        <section className="space-y-3 text-zinc-700">
          <h2 className="text-xl font-semibold">How it works</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Enter your monthly income and rent or mortgage.</li>
            <li>Add commute time, transport mode, and major recurring costs.</li>
            <li>See how much of every £1 you actually keep — and your real hourly rate.</li>
            <li>Play with sliders to see how remote days or new cities change the picture.</li>
          </ol>
        </section>

        <section className="space-y-3 text-zinc-700">
          <h2 className="text-xl font-semibold">Start the simulator</h2>
          <p>
            The tool runs in your browser. No login required. Numbers stay on your device unless
            you choose to share them.
          </p>
          <Link
            href="/sim"
            className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-5 py-3 text-white font-semibold hover:bg-rose-700"
          >
            Start my month →
          </Link>
        </section>

        <footer className="pt-10 text-xs text-zinc-500">
          Estimates only. This is not financial advice.
        </footer>
      </div>
    </main>
  );
}
