// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Real Cost Simulator",
  description: "See your hour of freedom after the real costs of work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const year =  new Date().getFullYear(); // server-only; stable

  return (
    <html lang="en">
      <head>
        {/* --- Google AdSense (defer until after hydrate) --- */}
        <Script
          id="adsense"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5496446780439803"
          crossOrigin="anonymous"
        />

        {/* --- Funding Choices (Consent Mode v2) --- */}
        <Script
          id="funding-choices"
          strategy="afterInteractive"
          src="https://fundingchoicesmessages.google.com/i/pub-5496446780439803?ers=1"
        />

        {/* --- Single-run shim to signal googlefcPresent (no tight loop) --- */}
        <Script
          id="googlefc-present-shim"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  if (!window.frames['googlefcPresent']) {
                    var iframe = document.createElement('iframe');
                    iframe.style.cssText = 'display:none';
                    iframe.name = 'googlefcPresent';
                    document.body && document.body.appendChild(iframe);
                  }
                } catch (e) {
                  // swallow
                }
              })();
            `,
          }}
        />
      </head>

      <body className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>

        <footer className="text-center text-sm text-zinc-500 py-8 border-t border-zinc-800">
          <p>
            © {year} Real Cost Simulator —{" "}
            <a href="/privacy" className="underline hover:text-zinc-300">
              Privacy & Cookies Policy
            </a>
          </p>
        </footer>

        {/* Vercel Analytics (safe) */}
        <Analytics />
      </body>
    </html>
  );
}
