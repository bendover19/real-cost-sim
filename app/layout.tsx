// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Real Cost Simulator",
  description: "See your hour of freedom after the real costs of work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5496446780439803"
          crossOrigin="anonymous"
        ></script>

        {/* Google Funding Choices CMP (Consent Mode v2) */}
        <script
          async
          src="https://fundingchoicesmessages.google.com/i/pub-5496446780439803?ers=1"
        ></script>
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

        {/* Footer */}
        <footer className="text-center text-sm text-zinc-500 py-8 border-t border-zinc-800">
          <p>
            © {new Date().getFullYear()} Real Cost Simulator —{" "}
            <a href="/privacy" className="underline hover:text-zinc-300">
              Privacy & Cookies Policy
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
