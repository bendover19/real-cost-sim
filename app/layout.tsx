// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/header.tsx";

export const metadata: Metadata = {
  title: "Real Cost of Working Calculator | Commute, Rent & Remote Work",
  description:
    "Free calculator that shows your real hourly income after rent, commute, childcare, debt and ‘maintenance’ costs. See if remote work or moving is actually worth it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ---- Run BEFORE any third-party scripts ---- */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  const isBadIframe = (el) => {
    try {
      if (!el) return false;
      const n = (el.getAttribute('name') || '').toLowerCase();
      const s = (el.getAttribute('src') || '').toLowerCase();
      return (
        n === 'googlefcpresent' ||
        s.includes('fundingchoicesmessages.google.com') ||
        s.includes('fundingchoices')
      );
    } catch { return false; }
  };

  const origFocus = HTMLIFrameElement.prototype.focus;
  HTMLIFrameElement.prototype.focus = function(...args){
    if (isBadIframe(this)) return;
    return origFocus.apply(this, args);
  };

  const tameRoot = (root=document) => {
    root.querySelectorAll?.('iframe').forEach((f)=>{
      if (!isBadIframe(f)) return;
      try {
        f.tabIndex = -1;
        f.setAttribute('aria-hidden','true');
        const st = f.style;
        st.pointerEvents = 'none';
        st.opacity = '0';
        st.width = '0';
        st.height = '0';
        st.position = 'absolute';
        st.left = '-99999px';
        st.top = '-99999px';
      } catch {}
    });
  };

  tameRoot(document);
  const mo = new MutationObserver(muts => muts.forEach(m => {
    m.addedNodes.forEach(n => {
      if (n instanceof HTMLElement || n instanceof DocumentFragment) tameRoot(n);
    });
  }));
  mo.observe(document.documentElement, { childList: true, subtree: true });

  const kill = (e) => {
    const t = e.target;
    if (t instanceof HTMLIFrameElement && isBadIframe(t)) {
      try { t.blur?.(); } catch {}
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };
  window.addEventListener('focusin', kill, true);
  window.addEventListener('pointerdown', kill, true);
  window.addEventListener('mousedown', kill, true);
  window.addEventListener('touchstart', kill, true);
})();
          `,
          }}
        />

        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5496446780439803"
          crossOrigin="anonymous"
        />

        {/* Funding Choices */}
        <script
          async
          src="https://fundingchoicesmessages.google.com/i/pub-5496446780439803?ers=1"
        />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FinancialCalculator",
              name: "Real Cost Simulator",
              description:
                "Calculate your real hourly income after the true costs of work, commute, and lifestyle.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "All",
              url: "https://real-cost-sim.vercel.app", // fixed domain
              patchNotes:
                "Supports UK cities, remote work, commute time, and cost-of-living comparisons.",
            }),
          }}
        />
      </head>

      <body className="min-h-screen flex flex-col">
        {/* -------------- HEADER (Apple-minimal nav) -------------- */}
        <Header />

        {/* -------------- MAIN CONTENT -------------- */}
        <main className="flex-grow">{children}</main>

        {/* -------------- FOOTER -------------- */}
        <footer className="text-center text-sm text-zinc-500 py-8 border-t border-zinc-800">
          <p>
            © {new Date().getFullYear()} Real Cost Simulator —{" "}
            <a href="/privacy" className="underline hover:text-zinc-300">
              Privacy & Cookies Policy
            </a>
          </p>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
