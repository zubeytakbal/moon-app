"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface NavItem {
  path: string;
  label: string;
  description: string;
}

function isActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

/** Masaüstü menü bağlantıları; bulunulan sayfa altı çizili gösterilir. */
export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Ana menü" className="hidden md:block">
      <ul className="flex items-center gap-1 text-sm">
        {items.map((item) => {
          const active = isActive(pathname, item.path);
          return (
            <li key={item.path}>
              <Link
                href={item.path}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-full px-3.5 py-2 transition ${
                  active ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Telefon menüsü: ☰ ile açılır, sayfa değişince kendiliğinden kapanır. */
export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Başka sayfaya geçilince menüyü kapat.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobil-menu"
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-200 hover:bg-white/10"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <nav
          id="mobil-menu"
          aria-label="Ana menü"
          className="absolute inset-x-0 top-full border-b border-white/10 bg-[#05070d]/95 backdrop-blur-md"
        >
          <ul className="mx-auto max-w-5xl px-4 py-3">
            {items.map((item) => {
              const active = isActive(pathname, item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-xl px-4 py-3 ${active ? "bg-white/10" : "hover:bg-white/5"}`}
                  >
                    <span className="block font-medium text-white">{item.label}</span>
                    <span className="mt-0.5 block text-sm text-zinc-400">{item.description}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
