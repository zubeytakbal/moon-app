/**
 * Giriş alanının hemen altındaki "Hızlı bağlantılar" şeridi (Feriatlas / timeanddate düzeni): sayfanın içindeki
 * önemli bölümlere tek dokunuşla gitmek için. Telefonda tek satırda yana kayar.
 * Bağlantılar sayfadaki başlıkların `id`'lerine gider; başlıklarda `scroll-mt-32` olmalı (üst menü sabit).
 */
import type { Lang } from "@/lib/i18n";

export function QuickLinks({ links, lang = "tr" }: { links: { href: string; label: string }[]; lang?: Lang }) {
  const label = lang === "en" ? "Jump to" : "Hızlı bağlantılar";
  return (
    <nav
      aria-label={label}
      className="border-b border-zinc-200 bg-[#f4f5f9] text-[0.9375rem] dark:border-zinc-800 dark:bg-zinc-900"
    >
      <p className="mx-auto flex w-full max-w-5xl items-center gap-x-1 overflow-x-auto whitespace-nowrap px-4 py-2.5 sm:flex-wrap sm:whitespace-normal">
        <span className="mr-1 font-semibold text-zinc-900 dark:text-white">{`${label}:`}</span>
        {links.map((l, i) => (
          <span key={l.href} className="inline-flex items-center">
            {i > 0 && (
              <span aria-hidden="true" className="px-1.5 text-zinc-300 dark:text-zinc-600">
                |
              </span>
            )}
            <a href={l.href} className="text-indigo-700 hover:underline dark:text-indigo-300">
              {l.label}
            </a>
          </span>
        ))}
      </p>
    </nav>
  );
}
