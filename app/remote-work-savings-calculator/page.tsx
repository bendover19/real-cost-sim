import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remote Work Savings Calculator – How Much Does WFH Really Save?",
  description:
    "Estimate how much remote work saves you on commuting, rent and lifestyle, using the Real Cost Simulator.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-200 to-rose-100">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur border border-white/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight">
              Remote work savings calculator
            </h1>
            <p className="text-base md:text-lg text-zinc-700">
              Working from home can save you thousands a year – but only if you look at the
              full picture: rent, commute, childcare, food, and time. Use this guide together
              with the{" "}
              <a href="/sim" className="underline text-rose-600 font-medium">
                Real Cost Simulator
              </a>{" "}
              to estimate your real remote‑work savings.
            </p>

            <div className="space-y-4 text-sm md:text-base text-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900">
                1. Savings from commute and &quot;getting ready&quot;
              </h2>
              <p>
                Remote work can reduce or eliminate daily travel. In the simulator you can:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Switch your transport mode to &quot;Remote / no commute&quot;</li>
                <li>Set remote days per week with the &quot;What if&quot; slider</li>
                <li>
                  Watch your monthly commute cost and total job hours drop as you add remote
                  time
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                2. Housing and location flexibility
              </h2>
              <p>
                Going remote often unlocks cheaper housing – either in the same city or
                somewhere entirely different. The simulator lets you:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Decrease your rent to model moving slightly further out</li>
                <li>
                  Use the city comparison card to test &quot;what if I lived in Lisbon, Bali,
                  Valencia…&quot;
                </li>
                <li>See the combined effect of lower rent and less commuting</li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                3. Lifestyle, family and health savings
              </h2>
              <p>
                Remote work can mean fewer takeaways, less paid childcare, and more control over
                your health:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cut &quot;Time trade&quot; spending like taxis and last‑minute deliveries</li>
                <li>
                  Reduce childcare estimates if you or a partner are more available at home
                </li>
                <li>
                  Decrease &quot;Belonging&quot; and &quot;Identity&quot; spend on clothes and
                  socialising that are mostly for the office
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-zinc-900">
                4. Turn it into a decision, not a vibe
              </h2>
              <p>
                The goal isn&apos;t to say &quot;remote is always better&quot; – it&apos;s to
                put numbers on the trade‑offs so you can negotiate, change roles, or move with
                your eyes open. After you&apos;ve played with the sliders, you&apos;ll know:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>How much more (or less) you keep per month if you go remote</li>
                <li>Your new real hourly rate after remote‑related changes</li>
                <li>Whether you&apos;d accept a lower headline salary for a better life</li>
              </ul>
            </div>

            <div className="pt-4">
              <a
                href="/sim"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                Model your remote work savings now →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
