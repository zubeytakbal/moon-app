import { cacheLife } from "next/cache";
import Link from "next/link";
import { UI, type Lang } from "@/lib/i18n";
import { getShell } from "@/lib/shell";
import { siteConfig } from "@/site.config";
import { CookieSettingsButton } from "./CookieConsent";
import { Emblem } from "./Emblem";

/**
 * Üç katlı alt bilgi: marka ve seçili sayfalar, görsel künyesi, telif ve kurumsal bağlantılar.
 * Her bölümün yalnız en önemli sayfaları listelenir (seçim `lib/shell.ts` içinde, dil başına). Bütün sayfalar
 * üst menüde ve ana sayfanın "Bütün sayfalar" bölümünde zaten var.
 */
export async function SiteFooter({ lang }: { lang: Lang }) {
  "use cache";
  cacheLife("days");
  const year = new Date().getFullYear();
  const shell = getShell(lang);
  const ui = UI[lang];

  return (
    <footer className="mt-20 bg-[#05070d] text-zinc-300">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-10 pt-14 lg:grid-cols-[1fr_2.6fr] lg:gap-14">
        <div>
          <Link href={shell.home} className="inline-flex items-center gap-3" aria-label={ui.homeLabel(siteConfig.name)}>
            <Emblem size={44} glow />
            <span className="flex flex-col" style={{ fontFamily: "var(--font-brand)" }}>
              <span className="text-xl font-light leading-none tracking-[0.38em] text-white">
                {siteConfig.name.toLocaleUpperCase(ui.upperLocale)}
              </span>
              <span className="mt-1.5 text-[0.625rem] leading-none tracking-[0.5em] text-indigo-200/80">
                {shell.tagline.toLocaleUpperCase(ui.upperLocale)}
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-400">{shell.footerBlurb}</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li>
              <a href={`mailto:${shell.contactEmail}`} className="text-zinc-300 hover:text-white hover:underline">
                {shell.contactEmail}
              </a>
            </li>
            {shell.methodPath && (
              <li>
                <Link href={shell.methodPath} className="text-indigo-300 hover:text-indigo-200 hover:underline">
                  {ui.howWeCalculate} →
                </Link>
              </li>
            )}
          </ul>
        </div>

        <nav aria-label={ui.featuredPages}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {shell.footerSections.map(({ name, pages }) => (
              <div key={name}>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{name}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {pages.map((p) => (
                    <li key={p.path}>
                      <Link href={p.path} className="text-zinc-300 hover:text-white hover:underline">
                        {p.navLabel}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link
            href={`${shell.home}#kesfet`}
            className="mt-8 inline-block text-sm font-medium text-indigo-300 hover:text-indigo-200 hover:underline"
          >
            {ui.allPages} →
          </Link>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs leading-relaxed text-zinc-500">{ui.footerCredit}</p>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-500">
            © {year} {siteConfig.name}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {shell.corporate.map((p) => (
              <li key={p.path}>
                <Link href={p.path} className="text-zinc-400 hover:text-white hover:underline">
                  {p.navLabel}
                </Link>
              </li>
            ))}
            <li>
              <CookieSettingsButton
                label={ui.cookieSettings}
                className="cursor-pointer text-zinc-400 hover:text-white hover:underline"
              />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
