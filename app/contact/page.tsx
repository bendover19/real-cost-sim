// app/contact/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Real Cost Sim",
  description:
    "Get in touch about Real Cost Sim – feedback, bugs, press and collaboration enquiries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-sky-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">
            Real Cost Sim
          </p>
          <h1 className="mt-2 text-3xl md:text-[2.2rem] font-semibold tracking-tight text-zinc-900">
            Contact
          </h1>
          <p className="mt-3 text-sm md:text-[15px] text-zinc-600 leading-relaxed max-w-2xl">
            If you&apos;ve found a bug, want to suggest a feature, or you&apos;re
            using Real Cost Sim for research, media or content, you can reach
            out directly by email.
          </p>
        </div>

        <div className="rounded-3xl bg-white/90 shadow-xl border border-zinc-100 px-6 py-7 md:px-9 md:py-8">
          <div className="space-y-6 text-sm md:text-[15px] text-zinc-700">
            <section>
              <h2 className="text-sm font-semibold text-zinc-900 mb-1">
                Email
              </h2>
              <p className="text-zinc-600">
                For all enquiries, please email:
              </p>
              <p className="mt-2">
                <a
                  href="mailto:jack@energy-outcomes.org.uk"
                  className="inline-flex items-center rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold px-4 py-2 transition-colors"
                >
                  jack@energy-outcomes.org.uk
                </a>
              </p>
            </section>

            <section className="pt-2 border-t border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900 mb-1">
                What to contact about
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                <li>• Reporting bugs or incorrect numbers for a city or country</li>
                <li>• Suggestions for new calculators or scenarios</li>
                <li>• Requests to support additional regions or currencies</li>
                <li>• Media, research or collaboration enquiries</li>
                <li>• Questions about the methodology or assumptions</li>
              </ul>
            </section>

            <section className="pt-2 border-t border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900 mb-1">
                Response time
              </h2>
              <p className="text-sm text-zinc-600">
                Messages are read personally and replies are prioritised based
                on urgency and complexity. If you&apos;re reporting a bug,
                including your browser, device and a link to the scenario
                you were using (for example, an <code>/enough/uk/city/salary</code>{" "}
                URL) helps a lot.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
