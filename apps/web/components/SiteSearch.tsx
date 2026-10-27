"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

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

/** Site içi arama: sayfa listesinde başlık ve açıklamaya göre anında süzer. */
export function SiteSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const id = useId();
  const indexed = useMemo(
    () => items.map((item) => ({ item, text: normalize(`${item.title} ${item.description} ${item.group}`) })),
    [items],
  );
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const results = words.length ? indexed.filter(({ text }) => words.every((w) => text.includes(w))).slice(0, 6) : [];

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor={id} className="sr-only">
        Sitede ara
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 backdrop-blur-sm focus-within:border-white/35">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-zinc-400"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          id={id}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ara: dolunay, tutulma, ay burcu…"
          autoComplete="off"
          className="w-full bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none"
        />
      </div>
      {words.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0d111c] shadow-2xl">
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
