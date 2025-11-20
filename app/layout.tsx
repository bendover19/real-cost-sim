"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      <div
        ref={wrapperRef}
        className="mx-auto max-w-5xl px-4 pt-4 flex justify-end pointer-events-auto"
      >
        <div className="relative">
          {/* Burger button only */}
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="
              inline-flex flex-col justify-center items-center
              w-9 h-9 rounded-full
              bg-black/5 dark:bg-white/10
              backdrop-blur
              hover:bg-black/10 dark:hover:bg-white/20
              transition
              border border-white/40 shadow-sm
            "
          >
            <span className="block w-4 h-[1.5px] bg-zinc-900 dark:bg-zinc-100 rounded-full" />
            <span className="block w-4 h-[1.5px] bg-zinc-900 dark:bg-zinc-100 rounded-full my-[3px]" />
            <span className="block w-4 h-[1.5px] bg-zinc-900 dark:bg-zinc-100 rounded-full" />
          </button>

          {/* Floating menu */}
          <nav
            className={classNames(
              "absolute right-0 mt-3 w-64 rounded-2xl",
              "bg-white/10 dark:bg-zinc-900/80",
              "backdrop-blur-xl border border-white/30 dark:border-zinc-700",
              "shadow-lg shadow-black/20 ring-1 ring-black/5",
              "px-3 py-3 text-sm text-zinc-900 dark:text-zinc-100",
              "origin-top-right transition-all duration-180 ease-out",
              open
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
            )}
          >
            <MenuLink href="/">Home</MenuLink>
            <MenuLink href="/sim">Start Simulator</MenuLink>

            <div className="mt-2 border-t border-white/40 dark:border-zinc-700 pt-2 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Calculators
            </div>
            <MenuLink href="/real-hourly-wage-calculator">
              Real Hourly Wage Calculator
            </MenuLink>
            <MenuLink href="/commute-cost-calculator">
              True Cost of Commuting
            </MenuLink>
            <MenuLink href="/remote-vs-office-calculator">
              Remote vs Office Pay Calculator
            </MenuLink>
            <MenuLink href="/move-city-cost-of-living-calculator">
              Cost of Moving City
            </MenuLink>
            <MenuLink href="/uk-cost-of-working-calculator">
              UK–EU–US Salary Comparison
            </MenuLink>
            {/* If your parent/childcare page has a different slug, just change the href */}
            <MenuLink href="/parent-childcare-cost-of-working">
              Parent / Childcare Cost of Working
            </MenuLink>

            <div className="mt-2 border-t border-white/40 dark:border-zinc-700 pt-2">
              <MenuLink href="/privacy">Privacy Policy</MenuLink>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

interface MenuLinkProps {
  href: string;
  children: React.ReactNode;
}

function MenuLink({ href, children }: MenuLinkProps) {
  return (
    <Link
      href={href}
      className="
        block px-2 py-1.5 rounded-md
        hover:bg-white/40 dark:hover:bg-zinc-800
        transition-colors
      "
    >
      {children}
    </Link>
  );
}
