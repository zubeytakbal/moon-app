import Link from "next/link";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { EN_ALL_PAGES, EN_HOME_PATH } from "@/lib/en/pages";
import type { Lang } from "@/lib/i18n";
import { ALL_PAGES, HOME_PATH } from "@/lib/pages";

const TEXT = {
  tr: {
    title: "Bu sayfa yeni ay gibi: görünmüyor",
    body: "Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir. Belki şunlardan biri işinize yarar:",
    home: "Ana sayfaya dön",
    moon: "Yeni ay",
  },
  en: {
    title: "Like a new moon, this page is nowhere to be seen",
    body: "The page you're looking for may have moved, or it never existed. One of these might help:",
    home: "Back to the home page",
    moon: "New moon",
  },
} as const;

/** 404 içeriği ("bulunamadı"). Her dilin `not-found.tsx` dosyası ve eşleşmeyen adresler için `global-not-found.tsx` kullanır. */
export function NotFoundContent({ lang }: { lang: Lang }) {
  const t = TEXT[lang];
  const home = lang === "en" ? EN_HOME_PATH : HOME_PATH;
  const pages = lang === "en" ? EN_ALL_PAGES : ALL_PAGES;
  const suggested = pages.filter((p) => p.featured).slice(0, 6);

  return (
    <main className="starfield bg-[#05070d] text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center">
        <MoonPhaseIcon phaseAngle={4} size={160} glow title={t.moon} />
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t.title}</h1>
        {suggested.length > 0 && (
          <>
            <p className="mt-4 max-w-lg text-lg text-zinc-300">{t.body}</p>
            <ul className="mt-8 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
              {suggested.map((p) => (
                <li key={p.path}>
                  <Link
                    href={p.path}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-white/25 hover:bg-white/10"
                  >
                    <MoonPhaseIcon phaseAngle={p.cardPhaseAngle} size={36} title="" />
                    <span className="font-medium">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <Link
          href={home}
          className="mt-10 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#05070d] hover:bg-zinc-200"
        >
          {t.home}
        </Link>
      </div>
    </main>
  );
}
