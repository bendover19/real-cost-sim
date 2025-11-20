// app/components/header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/sim", label: "Start Simulator" },
  { href: "/real-hourly-wage-calculator", label: "Real Hourly Wage Calculator" },
  { href: "/commute-cost-calculator", label: "True Cost of Commuting" },
  { href: "/remote-vs-office-calculator", label: "Remote vs Office Pay Calculator" },
  { href: "/move-city-cost-of-living-calculator", label: "Cost of Moving City" },
  { href: "/uk-cost-of-working-calculator", label: "UK–EU–US Salary Comparison" },
  { href: "/part-time-vs-full-time-hourly-pay", label: "Part-time vs Full-time hourly pay" },
  { href: "/privacy", label: "Privacy Policy" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Close when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-end px-4 pt-3 sm:px-6">
      {/* Tiny transparent area so the button is clickable but header itself doesn't block the UI */}
      <div className="pointer-events-auto">
        {/* Hamburger button, no text, minimal Apple-y */}
        <button
          ref={buttonRef}
          type="button"
          aria-label="Open navigation"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300/70 
                     bg-white/40 backdrop-blur-sm shadow-sm hover:bg-white/70 
                     transition focus-visible:outline-none focus-visible:ring-2 
                     focus-visible:ring-zinc-800"
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="flex flex-col gap-[3px]">
            <span className="block h-[1.5px] w-4 rounded-full bg-zinc-900" />
            <span className="block h-[1.5px] w-4 rounded-full bg-zinc-900" />
            <span className="block h-[1.5px] w-4 rounded-full bg-zinc-900" />
          </span>
        </button>

        {/* Dropdown panel */}
        {open && (
          <div
            ref={panelRef}
            className="mt-2 w-64 rounded-2xl border border-zinc-200/80 bg-white/95 
                       shadow-lg backdrop-blur-md text-sm"
          >
            <nav className="py-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2.5 transition ${
                      active
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
