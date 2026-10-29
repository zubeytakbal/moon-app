"use client";

import { useEffect, useState } from "react";
import { goToHeading, usePageHeadings } from "@/lib/use-page-headings";

/**
 * Sayfanın başında ("Kısaca" kutusunun altında) kapalı duran içindekiler; dokununca açılır. Yalnızca dar
 * ekranda görünür, geniş ekranda sol kenardaki kutu aynı işi yapar. Üçten az bölümü olan sayfada görünmez.
 */
export function InlineToc() {
  const headings = usePageHeadings();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Kapalı kutu baştan çizilir ki sonradan belirip metni aşağı itmesin (düzen kayması); bölüm sayısı sonra gelir.
  if (mounted && headings.length < 3) return null;

  return (
    <nav
      aria-label="İçindekiler"
      className="mt-4 rounded-2xl border border-zinc-200 bg-white lg:hidden dark:border-zinc-800 dark:bg-zinc-900"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2.5 font-semibold">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-indigo-500">
            <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" strokeLinecap="round" />
          </svg>
          İçindekiler
          {headings.length > 0 && <span className="text-sm font-normal text-zinc-500">{headings.length} bölüm</span>}
        </span>
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" className={`text-zinc-500 transition ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open && (
        <ol className="border-t border-zinc-200 px-2 py-2 text-[0.9375rem] dark:border-zinc-800">
          {headings.map((h, i) => (
            <li key={h.key}>
              <a
                href={h.el.id ? `#${h.el.id}` : "#"}
                onClick={(e) => {
                  e.preventDefault();
                  goToHeading(h);
                }}
                className="flex gap-3 rounded-xl px-3 py-2.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <span className="w-5 shrink-0 text-right tabular-nums text-zinc-400">{i + 1}</span>
                <span>{h.text}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
