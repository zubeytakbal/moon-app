import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonPhase, PHASE_NAMES_EN } from "@moon-app/moon";
import { UI, type Lang } from "@/lib/i18n";
import { getShell, visibleLanguages } from "@/lib/shell";
import { siteConfig } from "@/site.config";
import { BrandLockup } from "./Emblem";
import { DesktopNav, MobileNav, MobileSearch } from "./HeaderNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MoonPhaseIcon } from "./MoonPhaseIcon";
import { SiteSearch } from "./SiteSearch";

/**
 * İki katlı üst menü (NASA tarzı). Üst kat: solda arama, ortada amblem, sağda canlı ay göstergesi ve dil.
 * Alt kat: bölümler. Bölümler dilin sayfa listesinden gelir (`lib/shell.ts`); boş bölüm gösterilmez.
 */
export function SiteHeader({ lang }: { lang: Lang }) {
  const shell = getShell(lang);
  const ui = UI[lang];
  const languages = visibleLanguages(lang).map((l) => ({ code: l.code, label: l.label, home: l.home }));

  return (
    <header className="sticky top-0 z-50 bg-[#05070d] text-white">
      <div className="relative border-b border-white/10">
        <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:h-[4.5rem]">
          <div className="flex items-center">
            <div className="hidden w-full max-w-56 md:block">
              <SiteSearch items={shell.search} variant="header" lang={lang} />
            </div>
            <MobileSearch items={shell.search} lang={lang} />
          </div>
          <Link href={shell.home} aria-label={ui.homeLabel(siteConfig.name)} className="justify-self-center">
            <BrandLockup tagline={shell.tagline} upperLocale={ui.upperLocale} />
          </Link>
          <div className="flex items-center justify-end gap-2">
            <MoonNow lang={lang} path={shell.liveMoon.path} timeZone={shell.liveMoon.timeZone} />
            <div className="hidden sm:block">
              <LanguageSwitcher current={lang} languages={languages} counterparts={shell.counterparts} label={ui.language} />
            </div>
            <MobileNav sections={shell.sections} lang={lang} />
          </div>
        </div>
      </div>
      <div className="hidden border-b border-white/10 bg-[#0a0d16] md:block">
        <div className="mx-auto w-full max-w-6xl px-4">
          <DesktopNav sections={shell.sections} label={ui.sections} />
        </div>
      </div>
    </header>
  );
}

/** Menüdeki canlı ay göstergesi. Saatte bir yenilenir. */
async function MoonNow({ lang, path, timeZone }: { lang: Lang; path: string; timeZone: string }) {
  "use cache";
  cacheLife("hours");

  const ui = UI[lang];
  const phase = getMoonPhase(new Date(), timeZone);
  const name = lang === "en" ? PHASE_NAMES_EN[phase.key] : phase.name;
  const illumination = Math.round(phase.illumination * 100);

  return (
    <Link
      href={path}
      className="hidden items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3 text-sm text-zinc-200 transition hover:border-white/30 hover:text-white sm:flex"
      title={ui.liveMoonTitle(name, illumination)}
    >
      <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={24} title={name} />
      <span className="font-medium tabular-nums">{ui.percent(illumination)}</span>
      <span className="hidden text-zinc-400 lg:inline">{name}</span>
    </Link>
  );
}
