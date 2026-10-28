"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface SearchItem {
  path: string;
  title: string;
  description: string;
  group: string;
}

/** Türkçe karakterleri sadeleştirir: aramada "gunes" ile "güneş" eşleşsin. */
function normalize(text: string) {
  const map: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    i: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    â: "a",
    î: "i",
    û: "u",
  };
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıiöşüâîû]/g, (ch) => map[ch] ?? ch)
    .replace(/[^a-z0-9 ]/g, " ");
}

/**
 * Site içi arama: sayfa listesinde başlık ve açıklamaya göre anında süzer.
 * `hero` ana sayfadaki büyük kutu, `header` üst menüdeki küçük kutudur.
 */
export function SiteSearch({
  items,
  variant = "hero",
  autoFocus = false,
}: {
  items: SearchItem[];
  variant?: "hero" | "header";
  autoFocus?: boolean;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();

  // Başka sayfaya geçilince aramayı temizle (üst menü sayfalar arasında kalıcıdır).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setQuery("");
    setOpen(false);
  }

  // Kutunun dışına tıklanınca ya da Esc ile sonuçları kapat.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const indexed = useMemo(
    () =>
      items.map((item) => ({
        item,
        title: normalize(item.title),
        text: normalize(`${item.title} ${item.description} ${item.group}`),
      })),
    [items],
  );
  const words = normalize(query).split(/\s+/).filter(Boolean);
  // Başlığında aranan kelimeler geçen sayfalar öne, kısa başlık (konunun kendisi, ör. "Dolunay") en öne.
  const results = words.length
    ? indexed
        .filter(({ text }) => words.every((w) => text.includes(w)))
        .map((r) => ({ ...r, score: words.filter((w) => r.title.includes(w)).length * 100 - r.title.length }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
    : [];
  const header = variant === "header";

  return (
    <div ref={box} className={`relative w-full ${header ? "" : "max-w-md"}`}>
      <label htmlFor={id} className="sr-only">
        Sitede ara
      </label>
      <div
        className={`flex items-center gap-2 border border-white/15 focus-within:border-white/35 ${
          header ? "rounded-full px-3.5 py-1.5 hover:border-white/30" : "rounded-2xl bg-black/40 px-4 py-3 backdrop-blur-sm"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          width={header ? 16 : 18}
          height={header ? 16 : 18}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 text-zinc-400"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          id={id}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          autoFocus={autoFocus}
          placeholder={header ? "Ara…" : "Ara: dolunay, tutulma, ay burcu…"}
          autoComplete="off"
          className={`w-full bg-transparent text-white placeholder:text-zinc-500 focus:outline-none ${
            header ? "text-base md:text-sm" : "text-base"
          }`}
        />
      </div>
      {open && words.length > 0 && (
        <ul
          className={`absolute top-full z-40 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0d111c] text-left shadow-2xl ${
            header ? "left-0 w-full md:w-[24rem]" : "inset-x-0"
          }`}
        >
          {results.length ? (
            results.map(({ item }) => (
              <li key={item.path}>
                <Link href={item.path} className="block px-4 py-3 hover:bg-white/5">
                  <span className="block font-medium text-white">{item.title}</span>
                  <span className="mt-0.5 block text-sm text-zinc-400">{item.description}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-zinc-400">Sonuç bulunamadı.</li>
          )}
        </ul>
      )}
    </div>
  );
}
