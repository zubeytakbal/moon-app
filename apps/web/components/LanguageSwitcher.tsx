import Link from "next/link";
import { siteConfig } from "@/site.config";

/**
 * Dil seçici. JavaScript gerektirmez (<details> ile açılır).
 * Şimdilik tek dil var; yeni dil `siteConfig.languages` listesine eklenince burada kendiliğinden görünür.
 */
export function LanguageSwitcher({ current = "tr" }: { current?: string }) {
  const active = siteConfig.languages.find((l) => l.code === current) ?? siteConfig.languages[0];

  return (
    <details className="group relative">
      <summary
        className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:border-white/30 hover:text-white [&::-webkit-details-marker]:hidden"
        aria-label={`Dil: ${active.label}`}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
        <span className="font-medium uppercase">{active.code}</span>
        <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" className="transition group-open:rotate-180">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </summary>
      <ul className="absolute right-0 z-20 mt-2 min-w-40 overflow-hidden rounded-xl border border-white/10 bg-[#0d111c] py-1 text-sm shadow-xl">
        {siteConfig.languages.map((lang) => (
          <li key={lang.code}>
            <Link
              href={lang.home}
              hrefLang={lang.code}
              lang={lang.code}
              aria-current={lang.code === active.code ? "true" : undefined}
              className="flex items-center justify-between gap-4 px-4 py-2 text-zinc-200 hover:bg-white/5 hover:text-white"
            >
              {lang.label}
              {lang.code === active.code && <span aria-hidden="true">✓</span>}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
