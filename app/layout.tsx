// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Real Cost Simulator",
  description: "See your hour of freedom after the real costs of work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ---- HARDEN FOCUS (runs before any third-party script) ---- */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  // 1) Block focus() on known CMP/ads iframes
  const ifrCanGrab = (el) => {
    if (!el) return false;
    const n = (el.getAttribute('name')||'').toLowerCase();
    const s = (el.getAttribute('src')||'').toLowerCase();
    return n==='googlefcpresent' || s.includes('fundingchoices') || s.includes('google.com');
  };
  const origFocus = HTMLIFrameElement.prototype.focus;
  HTMLIFrameElement.prototype.focus = function(...args){
    try { if (ifrCanGrab(this)) return; } catch {}
    return origFocus.apply(this, args);
  };

  // 2) Immediately neuter iframes when added
  const tame = (root=document) => {
    const q = 'iframe[name="googlefcPresent"],iframe[src*="fundingchoices"]';
    root.querySelectorAll?.(q).forEach((f)=>{
      try{
        f.tabIndex = -1;
        f.setAttribute('aria-hidden','true');
        const st = f.style;
        st.pointerEvents='none'; st.opacity='0'; st.width='0'; st.height='0'; st.position='absolute';
      }catch{}
    });
  };
  tame(document);
  const mo = new MutationObserver(muts => muts.forEach(m=>{
    m.addedNodes.forEach(n=>{
      if (n instanceof HTMLElement || n instanceof DocumentFragment) tame(n as any);
    });
  }));
  mo.observe(document.documentElement,{childList:true,subtree:true});

  // 3) If a hostile iframe somehow becomes active, blur it instantly
  window.addEventListener('focusin', (e)=>{
    const t = e.target;
    try{
      if (t instanceof HTMLIFrameElement && ifrCanGrab(t)) {
        t.blur?.();
      }
    }catch{}
  }, true);
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

        {/* Google Funding Choices CMP (Consent Mode v2) */}
        <script async src="https://fundingchoicesmessages.google.com/i/pub-5496446780439803?ers=1"></script>

        {/* Their helper that injects googlefcPresent */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function signalGooglefcPresent() {
                  if (!window.frames['googlefcPresent']) {
                    if (document.body) {
                      const iframe = document.createElement('iframe');
                      iframe.style.cssText = 'display:none';
                      iframe.name = 'googlefcPresent';
                      // neuter immediately
                      iframe.tabIndex = -1;
                      iframe.setAttribute('aria-hidden','true');
                      try {
                        iframe.style.pointerEvents='none';
                        iframe.style.opacity='0';
                        iframe.style.width='0';
                        iframe.style.height='0';
                      } catch {}
                      document.body.appendChild(iframe);
                    } else {
                      setTimeout(signalGooglefcPresent, 0);
                    }
                  }
                }
                signalGooglefcPresent();
              })();
            `,
          }}
        />
      </head>

      <body className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>

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
