import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonPhase } from "@moon-app/moon";
import { HOME_PATH, pagesByGroup, PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { DesktopNav, MobileNav, type NavSection } from "./HeaderNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MoonPhaseIcon } from "./MoonPhaseIcon";

/**
 * İki katlı üst menü. Üst kat: logo, canlı ay göstergesi, dil. Alt kat: bölümler.
 * Bölümler `lib/pages.ts` gruplarından gelir; boş bölüm gösterilmez.
 */
export function SiteHeader() {
  const sections: NavSection[] = pagesByGroup()
    .filter((g) => g.group !== "kurumsal")
    .map((g) => ({
      label: g.name,
      items: g.pages.map((p) => ({ path: p.path, label: p.navLabel, description: p.description })),
    }));

  return (
    <header className="sticky top-0 z-50 bg-[#05070d] text-white">
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4">
          <Link href={HOME_PATH} className="flex items-center gap-2.5" aria-label={`${siteConfig.name} ana sayfa`}>
            <MoonPhaseIcon phaseAngle={140} size={32} title="" />
            <span className="text-lg font-bold tracking-tight">{siteConfig.name}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <MoonNow />
            <LanguageSwitcher />
            <MobileNav sections={sections} />
          </div>
        </div>
      </div>
      <div className="hidden border-b border-white/10 bg-[#0a0d16] md:block">
        <div className="mx-auto w-full max-w-5xl px-4">
          <DesktopNav sections={sections} />
        </div>
      </div>
    </header>
  );
}

/** Menüdeki canlı ay göstergesi. Saatte bir yenilenir. */
async function MoonNow() {
  "use cache";
  cacheLife("hours");

  const phase = getMoonPhase(new Date(), siteConfig.defaultLocation.timeZone);
  const illumination = Math.round(phase.illumination * 100);

  return (
    <Link
      href={PAGES.bugunAy.path}
      className="hidden items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3 text-sm text-zinc-200 transition hover:border-white/30 hover:text-white sm:flex"
      title={`Şu an: ${phase.name}, yüzde ${illumination} aydınlık`}
    >
      <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={24} title={phase.name} />
      <span className="font-medium tabular-nums">%{illumination}</span>
      <span className="hidden text-zinc-400 lg:inline">{phase.name}</span>
    </Link>
  );
}
