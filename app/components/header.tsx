"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <header className="w-full border-b border-zinc-200/50 backdrop-blur-md bg-white/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-sm font-medium text-zinc-900">
          Real Cost Simulator
        </Link>

        {/* Burger */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex flex-col gap-[5px] p-2 hover:opacity-70 transition"
        >
          <span className="w-6 h-[2px] bg-zinc-900"></span>
          <span className="w-6 h-[2px] bg-zinc-900"></span>
          <span className="w-6 h-[2px] bg-zinc-900"></span>
        </button>
      </div>

      {/* Slide-in panel */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity">
          <div
            ref={panelRef}
            className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl border-l border-zinc-200 p-6 space-y-4 transform translate-x-0 transition-transform"
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 p-2 hover:opacity-60 transition"
            >
              <span className="block w-5 h-[2px] bg-zinc-900 rotate-45 absolute"></span>
              <span className="block w-5 h-[2px] bg-zinc-900 -rotate-45 absolute"></span>
            </button>

            <nav className="mt-10 text-sm space-y-3">
              <MenuLink href="/" setOpen={setOpen}>Home</MenuLink>
              <MenuLink href="/sim" setOpen={setOpen}>Start Simulator</MenuLink>
              <MenuLink href="/real-hourly-wage-calculator" setOpen={setOpen}>
                Real Hourly Wage Calculator
              </MenuLink>
              <MenuLink href="/true-cost-of-commuting-calculator" setOpen={setOpen}>
                True Cost of Commuting
              </MenuLink>
              <MenuLink href="/remote-work-salary-comparison" setOpen={setOpen}>
                Remote vs Office Pay Calculator
              </MenuLink>
              <MenuLink href="/moving-city-cost-of-living-calculator" setOpen={setOpen}>
                Cost of Moving City
              </MenuLink>
              <MenuLink href="/uk-vs-eu-vs-us-salary-comparison" setOpen={setOpen}>
                UK–EU–US Salary Comparison
              </MenuLink>
              <MenuLink href="/parent-childcare-cost-of-working" setOpen={setOpen}>
                Parent / Childcare Cost of Working
              </MenuLink>
              <MenuLink href="/privacy" setOpen={setOpen}>
                Privacy Policy
              </MenuLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ href, children, setOpen }: any) {
  return (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className="block text-zinc-800 hover:text-rose-600 transition"
    >
      {children}
    </Link>
  );
}
