// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import Header from "./components/header"; // relative import to app/components/header.tsx

export const metadata: Metadata = {
  title: "Real Cost of Working Calculator | Commute, Rent & Remote Work",
  description:
    "Free calculator that shows your real hourly income after rent, commute, childcare, debt and ‘maintenance’ costs. See if remote work or moving is actually worth it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ---- Run BEFORE any third-party scripts: block focus thieves ---- */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  // Helpers
  const isBadIframe = (el) => {
    try {
      if (!el) return false;
      const n = (el.getAttribute('name') || '').toLowerCase();
      const s = (el.getAttribute('src') || '').toLowerCase();

      // Only treat Funding Choices consent iframe as "bad"
      // (googlefcPresent / fundingchoicesmessages)
      return (
        n === 'googlefcpresent' ||
        s.includes('fundingchoicesmessages.google.com') ||
        s.includes('fundingchoices')
      );
    } catch {
      return false;
    }
  };

  // 1) Patch iframe.focus to ignore bad iframes
  const origFocus = HTMLIFrameElement.prototype.focus;
  HTMLIFrameElement.prototype.focus = function(...args){
    if (isBadIframe(this)) return;
    return origFocus.apply(this, args);
  };

  // 2) Whenever DOM changes, neuter new bad iframes immediately
  const tameRoot = (root=document) => {
    root.querySelectorAll?.('iframe').forEach((f)=>{
      if (!isBadIframe(f)) return;
      try{
        f.tabIndex = -1;
        f.setAttribute('aria-hidden','true');
        const st = f.style;
        st.pointerEvents='none';
        st.opacity='0';
        st.width='0';
        st.height='0';
        st.position='absolute';
        st.left='-99999px';
        st.top='-99999px';
      }catch{}
    });
  };
  tameRoot(document);
  const mo = new MutationObserver(muts => muts.forEach(m=>{
    m.addedNodes.forEach(n=>{
      if (n instanceof HTMLElement || n instanceof DocumentFragment) tameRoot(n as any);
    });
  }));
  mo.observe(document.documentElement,{childList:true,subtree:true});

  // 3) Block focus events bubbling from those iframes (belt & braces)
  const kill = (e)=>{ const t=e.target; if (t instanceof HTMLIFrameElement && isBadIframe(t)) { try{t.blur?.()}catch{} e.stopImmediatePropagation(); e.preventDefault(); } };
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
        ></script>

        {/* Google Funding Choices loader */}
        <script async src="https://fundingchoicesmessages.google.com/i/pub-5496446780439803?ers=1"></script>

        {/* Structured data */}
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
              url: "https://real-cost-sim.com",
              patchNotes:
                "Supports UK cities, remote work, commute time, and cost-of-living comparisons.",
            }),
          }}
        />
      </head>

      <body className="min-h-screen flex flex-col">
        {/* Tiny global header with burger nav */}
        <Header />

        <main className="flex-grow">{children}</main>

        <footer className="mt-20 mb-10 text-center text-[13px] text-zinc-500">
  <p>© {new Date().getFullYear()} Real Cost Simulator</p>

  <div className="mt-2 flex justify-center gap-4">
    <a
      href="/about"
      className="hover:text-zinc-700 transition"
    >
      About
    </a>

    <a
      href="/contact"
      className="hover:text-zinc-700 transition"
    >
      Contact
    </a>

    <a
      href="/privacy"
      className="hover:text-zinc-700 transition"
    >
      Privacy & Cookies
    </a>
  </div>
</footer>


        <Analytics />
      </body>
    </html>
  );
}
