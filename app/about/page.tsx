// app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Real Cost Sim",
  description:
    "Learn why Real Cost Sim was created and how it helps you understand the real value of your salary after housing, commute and life costs.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">
            Real Cost Sim
          </p>
          <h1 className="mt-2 text-3xl md:text-[2.2rem] font-semibold tracking-tight text-zinc-900">
            About
          </h1>
        </div>

        {/* Content card */}
        <div className="rounded-3xl bg-white/90 shadow-xl border border-zinc-100 px-6 py-7 md:px-9 md:py-8 text-sm md:text-[15px] text-zinc-700 leading-relaxed space-y-6">

          <p>
            <strong>Real Cost Sim was created to answer a simple question many people struggle with:</strong><br />
            “Is my salary actually giving me a good life-or am I treading water?”
          </p>

          <p>
            News stories about young people leaving the UK in record numbers, rising housing pressure,
            long commutes, and “brain drain” trends raised the same theme again and again:
            people don’t have a clear picture of the <strong>real</strong> cost of staying where they are.
          </p>

          <p>
            Reporting on the widening cost-of-living gap makes it clear that the traditional payslip
            no longer tells the full story of working life. Tools like{" "}
            <a
              href="https://nicksimulator.com/"
              className="text-rose-600 hover:text-rose-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              NickSimulator
            </a>
            , which went viral for exposing how much of people’s income is consumed by modern life
            overheads, showed that people are looking for deeper, more transparent numbers, not
            surface-level salary calculators.
          </p>

          <p><strong>Real Cost Sim builds on that idea.</strong></p>

          <p>It combines:</p>

          <ul className="list-disc list-inside space-y-1">
            <li>take-home pay</li>
            <li>rent & housing pressure</li>
            <li>commute time & cost</li>
            <li>childcare & dependents</li>
            <li>life “maintenance”</li>
            <li>psychological drivers (belonging, fatigue, trade-offs)</li>
            <li>“hour of freedom” metrics</li>
          </ul>

          <p>
            …into one simple model that shows what your work <strong>truly</strong> buys you.
            It isn’t financial advice; it’s a clarity tool.
          </p>

          <p>The goal is to help people answer questions like:</p>

          <ul className="list-disc list-inside space-y-1">
            <li>Should I move city?</li>
            <li>Is this job actually worth the commute?</li>
            <li>Would a pay rise, relocation, or remote work genuinely improve my life?</li>
            <li>Am I trading all my energy for very little leftover?</li>
          </ul>

          <p>
            <strong>
              The mission is simple: give people transparent numbers so they can make better decisions
              about where they live, how they work, and what their time is worth.
            </strong>
          </p>

          <h2 className="text-lg font-semibold text-zinc-900 mt-4">
            What Real Cost Sim is not
          </h2>

          <ul className="list-disc list-inside space-y-1">
            <li>It’s not an investment tool</li>
            <li>It’s not a budgeting app</li>
            <li>It’s not personalised financial advice</li>
          </ul>

          <p>
            It’s a lens, a framework, to reveal the hidden forces that shape your working life.
            If it helps even a few people realise they could live better elsewhere, negotiate differently,
            or reclaim some time, then it has done its job.
          </p>

        </div>
      </div>
    </main>
  );
}
