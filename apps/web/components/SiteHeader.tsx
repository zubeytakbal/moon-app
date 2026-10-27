import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonPhase } from "@moon-app/moon";
import { ALL_PAGES, HOME_PATH, PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { DesktopNav, MobileNav, type NavItem } from "./HeaderNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MoonPhaseIcon } from "./MoonPhaseIcon";

export function SiteHeader() {
  const items: NavItem[] = ALL_PAGES.filter((p) => p.inHeader).map((p) => ({
    path: p.path,
    label: p.navLabel,
    description: p.description,
  }));

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070d] text-white">
      <div className="relative mx-auto flex h-16 w-full max-w-5xl items-center gap-4 px-4">
        <Link href={HOME_PATH} className="flex items-center gap-2.5" aria-label={`${siteConfig.name} ana sayfa`}>
          <MoonPhaseIcon phaseAngle={140} size={30} title="" />
          <span className="text-[1.0625rem] font-semibold tracking-tight">{siteConfig.name}</span>
        </Link>

        <div className="ml-auto flex items-center gap-2 md:ml-6 md:flex-1">
          <DesktopNav items={items} />
          <div className="flex items-center gap-2 md:ml-auto">
            <MoonNow />
            <LanguageSwitcher />
            <MobileNav items={items} />
          </div>
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
      <span className="tabular-nums">%{illumination}</span>
      <span className="hidden text-zinc-400 lg:inline">{phase.name}</span>
    </Link>
  );
}
