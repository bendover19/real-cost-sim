// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Real Cost Simulator",
  description: "See your hour of freedom after the real costs of work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Cookie Consent CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css"
        />

        {/* Google AdSense (once per site) */}
        <Script
          id="adsense-init"
          strategy="afterInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5496446780439803"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Page content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="text-center text-sm text-zinc-500 py-8 border-t border-zinc-800">
          <p>
            © {new Date().getFullYear()} Real Cost Simulator —{" "}
            <a href="/privacy" className="underline hover:text-zinc-300">
              Privacy & Cookies Policy
            </a>
          </p>
        </footer>

        {/* Cookie Consent JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js"
          strategy="afterInteractive"
        />
        <Script id="cookieconsent-init" strategy="afterInteractive">
          {`
            window.addEventListener('load', function () {
              if (window.cookieconsent) {
                window.cookieconsent.initialise({
                  type: "opt-in",
                  palette: { popup: { background: "#000" }, button: { background: "#f1d600" } },
                  theme: "classic",
                  content: {
                    message: "We use cookies to analyze traffic and show ads.",
                    dismiss: "Got it!",
                    allow: "Allow cookies",
                    deny: "Decline",
                    link: "Learn more",
                    href: "/privacy"
                  },
                  law: { regionalLaw: true },
                  location: true
                });
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
