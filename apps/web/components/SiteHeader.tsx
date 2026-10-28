import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonPhase } from "@moon-app/moon";
import { HOME_PATH, pagesByGroup, PAGES, SEARCH_ITEMS } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { BrandLockup } from "./Emblem";
import { DesktopNav, MobileNav, MobileSearch, type NavItem, type NavSection } from "./HeaderNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MoonPhaseIcon } from "./MoonPhaseIcon";
import { SiteSearch } from "./SiteSearch";

/**
 * Ay Evreleri menüsü sekiz evreyi gökyüzündeki sırasıyla gösterir. İki hilal aynı sayfada
 * anlatıldığı için Büyüyen ve Küçülen Hilal, Hilal sayfasının ilgili bölümüne gider.
 * En altta evre aracı "Doğduğum Gün Ay Nasıldı?" durur.
 */
const PHASE_MENU: NavItem[] = [
  { page: PAGES.ayEvreleri, label: "Ay Evreleri Nedir?", angle: 90 },
  { page: PAGES.yeniAy, label: "Yeni Ay", angle: 4 },
  { page: PAGES.hilal, label: "Büyüyen Hilal", angle: 45, hash: "#buyuyen-hilal" },
  { page: PAGES.ilkDordun, label: "İlk Dördün", angle: 90 },
  { page: PAGES.buyuyenSiskinAy, label: "Büyüyen Şişkin Ay", angle: 135 },
  { page: PAGES.dolunay, label: "Dolunay", angle: 180 },
  { page: PAGES.kuculenSiskinAy, label: "Küçülen Şişkin Ay", angle: 225 },
  { page: PAGES.sonDordun, label: "Son Dördün", angle: 270 },
  { page: PAGES.hilal, label: "Küçülen Hilal", angle: 315, hash: "#kuculen-hilal" },
  { page: PAGES.dogdugumGun, label: "Doğduğum Gün Ay Nasıldı?", angle: 160 },
].map(({ page, label, angle, hash }, i, all) => ({
  path: `${page.path}${hash ?? ""}`,
  label,
  description: page.description,
  phaseAngle: angle,
  wide: i === 0 || i === all.length - 1,
}));

/**
 * İki katlı üst menü (NASA tarzı). Üst kat: solda arama, ortada amblem, sağda canlı ay göstergesi ve dil.
 * Alt kat: bölümler. Bölümler `lib/pages.ts` gruplarından gelir; boş bölüm gösterilmez.
 */
export function SiteHeader() {
  const sections: NavSection[] = pagesByGroup()
    .filter((g) => g.group !== "kurumsal")
    .map((g) => ({
      label: g.name,
      items:
        g.group === "evreler"
          ? PHASE_MENU
          : g.pages.map((p) => ({
              path: p.path,
              label: g.group === "bugun" ? g.name : p.navLabel,
              description: p.description,
              phaseAngle: p.cardPhaseAngle,
            })),
    }));

  return (
    <header className="sticky top-0 z-50 bg-[#05070d] text-white">
      <div className="relative border-b border-white/10">
        <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:h-[4.5rem]">
          <div className="flex items-center">
            <div className="hidden w-full max-w-56 md:block">
              <SiteSearch items={SEARCH_ITEMS} variant="header" />
            </div>
            <MobileSearch items={SEARCH_ITEMS} />
          </div>
          <Link href={HOME_PATH} aria-label={`${siteConfig.name} ana sayfa`} className="justify-self-center">
            <BrandLockup />
          </Link>
          <div className="flex items-center justify-end gap-2">
            <MoonNow />
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <MobileNav sections={sections} />
          </div>
        </div>
      </div>
      <div className="hidden border-b border-white/10 bg-[#0a0d16] md:block">
        <div className="mx-auto w-full max-w-6xl px-4">
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
