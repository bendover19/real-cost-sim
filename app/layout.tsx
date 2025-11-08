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
      </head>
      <body>
        {children}

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
                  palette: { popup: { background: "#000" }, button: { background: "#f1d600" } },
                  theme: "classic",
                  content: {
                    message: "We use cookies to analyze traffic and show ads.",
                    dismiss: "Got it!",
                    link: "Learn more",
                    href: "/privacy"
                  }
                });
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
