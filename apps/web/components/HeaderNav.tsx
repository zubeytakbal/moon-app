"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MoonPhaseIcon } from "./MoonPhaseIcon";
import { SiteSearch, type SearchItem } from "./SiteSearch";

export interface NavItem {
  path: string;
  label: string;
  description: string;
  /** Menüde gösterilecek ay ikonunun evre açısı. */
  phaseAngle: number;
  /** İki sütunlu menüde satırın tamamını kaplasın mı (bölümün genel sayfası için). */
  wide?: boolean;
}

/** Menüdeki bir bölüm. Tek sayfası olan bölüm doğrudan bağlantı, birden çok sayfası olan açılır menü olur. */
export interface NavSection {
  label: string;
  items: NavItem[];
}

function isActive(pathname: string, path: string) {
  const base = path.split("#")[0];
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Uzun bölümler açılır menüde iki sütun ve kısa satırlarla gösterilir; böylece ekrana sığar. */
const COMPACT_FROM = 5;

const linkBase = "flex h-12 items-center gap-1 border-b-2 px-3 text-[0.9375rem] font-semibold transition";
const linkState = (active: boolean) =>
  active ? "border-indigo-400 text-white" : "border-transparent text-zinc-300 hover:text-white";

/** Masaüstü bölüm menüsü (ikinci kat). Bulunulan bölümün altı çizilir. */
export function DesktopNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Bölümler" className="hidden md:block">
      <ul className="flex items-center justify-center gap-2">
        {sections.map((section) => {
          const active = section.items.some((i) => isActive(pathname, i.path));
          if (section.items.length === 1) {
            const item = section.items[0];
            return (
              <li key={section.label}>
                <Link
                  href={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`${linkBase} ${linkState(active)}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          }
          return (
            <li key={section.label} className="group relative">
              <button type="button" aria-haspopup="true" className={`${linkBase} ${linkState(active)}`}>
                {section.label}
                <svg
                  viewBox="0 0 12 12"
                  width="11"
                  height="11"
                  aria-hidden="true"
                  className="transition group-focus-within:rotate-180 group-hover:rotate-180"
                >
                  <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
              <div
                className={`invisible absolute left-1/2 top-full z-30 -translate-x-1/2 pt-1 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 ${
                  section.items.length >= COMPACT_FROM ? "w-[34rem]" : "w-80"
                }`}
              >
                <ul
                  className={`max-h-[75vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d111c] p-2 shadow-2xl ${
                    section.items.length >= COMPACT_FROM ? "grid grid-cols-2 gap-1" : ""
                  }`}
                >
                  {section.items.map((item) => (
                    <li key={item.path} className={item.wide ? "col-span-2 border-b border-white/10 pb-1" : undefined}>
                      <Link
                        href={item.path}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5"
                      >
                        <span className="shrink-0">
                          <MoonPhaseIcon phaseAngle={item.phaseAngle} size={30} title="" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-white">{item.label}</span>
                          {section.items.length < COMPACT_FROM && (
                            <span className="mt-0.5 block text-sm text-zinc-400">{item.description}</span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Telefon menüsü: ☰ ile açılır, sayfa değişince kendiliğinden kapanır. */
export function MobileNav({ sections }: { sections: NavSection[] }) {
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
          className="absolute inset-x-0 top-full max-h-[80vh] overflow-y-auto border-b border-white/10 bg-[#05070d]"
        >
          <div className="mx-auto max-w-5xl px-4 py-3">
            {sections.map((section) => (
              <div key={section.label} className="py-2">
                <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {section.label}
                </p>
                <ul>
                  {section.items.map((item) => {
                    const active = isActive(pathname, item.path);
                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${active ? "bg-white/10" : "hover:bg-white/5"}`}
                        >
                          <MoonPhaseIcon phaseAngle={item.phaseAngle} size={28} title="" />
                          <span className="font-medium text-white">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

/** Telefonda arama: büyüteçle açılır, menünün altında tam genişlikte kutu gösterir. */
export function MobileSearch({ items }: { items: SearchItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobil-arama"
        aria-label={open ? "Aramayı kapat" : "Sitede ara"}
        className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-200 hover:bg-white/10"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </>
          )}
        </svg>
      </button>
      {open && (
        <div id="mobil-arama" className="absolute inset-x-0 top-full border-b border-white/10 bg-[#05070d] px-4 py-3">
          <SiteSearch items={items} variant="header" autoFocus />
        </div>
      )}
    </div>
  );
}
