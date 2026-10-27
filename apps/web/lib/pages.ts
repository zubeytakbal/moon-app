/**
 * Sitedeki sayfaların elle tutulan listesi. Menü, alt bilgi, breadcrumb ve ileride
 * sitemap buradan okunur. Kural: sayfa ancak içeriği tamamlanınca buraya eklenir
 * (bkz. CLAUDE.md, kırmızı çizgiler). Hiçbir sayfa döngüyle üretilmez.
 */

export type PageGroup = "araclar" | "evreler" | "tarihler" | "hicri-gelenek" | "bilgi" | "kurumsal";

export const GROUP_NAMES: Record<PageGroup, string> = {
  araclar: "Araçlar",
  evreler: "Ay Evreleri",
  tarihler: "Tarihler",
  "hicri-gelenek": "Hicri ve Gelenek",
  bilgi: "Bilgi",
  kurumsal: "Kurumsal",
};

export interface SitePage {
  path: string;
  /** Menüde ve breadcrumb'da görünen kısa ad. */
  title: string;
  group: PageGroup;
  /** Ana sayfadaki kartta görünen tek cümlelik açıklama. */
  description: string;
  /** Kart görselindeki ayın evre açısı (0 yeni ay, 180 dolunay). */
  cardPhaseAngle: number;
  /** Üst menüde gösterilsin mi? */
  inHeader?: boolean;
}

/** Türkçe ana sayfa. Sayfa listesinin dışında tutulur, çünkü breadcrumb'ın kökü odur. */
export const HOME_PATH = "/tr";

export const PAGES = {
  bugunAy: {
    path: "/tr/bugun-ay",
    title: "Bugün Ay Nasıl?",
    group: "araclar",
    inHeader: true,
    description: "Ayın bugünkü evresi, aydınlık oranı ve 81 il için doğuş-batış saatleri.",
    cardPhaseAngle: 120,
  },
  ayEvreleri: {
    path: "/tr/ay-evreleri",
    title: "Ay Evreleri Nedir?",
    group: "evreler",
    inHeader: true,
    description: "Ay neden şekil değiştirir? Yeni aydan dolunaya 8 evrenin adı, sırası ve anlamı.",
    cardPhaseAngle: 90,
  },
} as const satisfies Record<string, SitePage>;

export const ALL_PAGES: SitePage[] = Object.values(PAGES);

/** Sayfaları gruplarına göre, GROUP_NAMES sırasıyla döner. Boş gruplar atlanır. */
export function pagesByGroup(): { group: PageGroup; name: string; pages: SitePage[] }[] {
  return (Object.keys(GROUP_NAMES) as PageGroup[])
    .map((group) => ({ group, name: GROUP_NAMES[group], pages: ALL_PAGES.filter((p) => p.group === group) }))
    .filter((g) => g.pages.length > 0);
}
