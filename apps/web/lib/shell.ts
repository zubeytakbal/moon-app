import type { NavItem, NavSection } from "@/components/HeaderNav";
import type { SearchItem } from "@/components/SiteSearch";
import { EN_ALL_PAGES, EN_GROUP_NAMES, EN_HOME_PATH, EN_PAGES, EN_RELATED, type EnPageGroup } from "@/lib/en/pages";
import type { Lang } from "@/lib/i18n";
import { ALL_PAGES, GROUP_NAMES, HOME_PATH, pagesByGroup, PAGES, relatedPages, SEARCH_ITEMS } from "@/lib/pages";
import { siteConfig } from "@/site.config";

/**
 * Sitenin ortak parçalarının (üst menü, arama, alt bilgi, ilgili sayfalar) dil başına verisi. Tasarım her dilde
 * aynıdır; değişen yalnız hangi sayfaların, hangi adla listelendiğidir.
 */

/** Kartta ya da listede gösterilen sayfa: her iki dilin sayfa kayıtları bu şekle uyar. */
export interface ShellPage {
  path: string;
  title: string;
  navLabel: string;
  description: string;
  cardPhaseAngle: number;
}

export interface ShellData {
  lang: Lang;
  home: string;
  /** Tarih ve saatleri biçimlendirirken kullanılan yerel ayar. */
  locale: string;
  tagline: string;
  /** Üst menüdeki canlı ay göstergesinin bağlandığı sayfa ve evre adının hesaplandığı saat dilimi. */
  liveMoon: { path: string; timeZone: string };
  sections: NavSection[];
  search: SearchItem[];
  /** Alt bilgide marka altındaki kısa tanım. */
  footerBlurb: string;
  footerSections: { name: string; pages: ShellPage[] }[];
  corporate: ShellPage[];
  /** Alt bilgide gösterilen iletişim adresi. */
  contactEmail: string;
  methodPath?: string;
  cookiePolicyPath?: string;
  /** Sayfa yolu → ilgili sayfalar. */
  related: Record<string, ShellPage[]>;
  /** Bu dildeki sayfa yolu → diğer dildeki karşılığı (dil seçici için). */
  counterparts: Partial<Record<Lang, Record<string, string>>>;
}

function language(code: Lang) {
  return siteConfig.languages.find((l) => l.code === code)!;
}

/** Hazırlanan (yayında olmayan) diller geliştirmede ya da LUNATLAS_DRAFTS=1 ile seçicide görünür. */
export const SHOW_DRAFT_LANGUAGES = process.env.NODE_ENV === "development" || process.env.LUNATLAS_DRAFTS === "1";

/** Dil seçicide gösterilecek diller: yayındakiler, bulunulan dil ve (geliştirmede) hazırlananlar. */
export function visibleLanguages(current: Lang) {
  return siteConfig.languages.filter((l) => l.published || l.code === current || SHOW_DRAFT_LANGUAGES);
}

/** Dil yayında mı? Yayında değilse sayfaları `noindex`, site haritasında ve hreflang'da yok. */
export function isLanguagePublished(code: Lang) {
  return language(code).published;
}

/**
 * Ay Evreleri menüsü sekiz evreyi gökyüzündeki sırasıyla gösterir. İki hilal aynı sayfada
 * anlatıldığı için Büyüyen ve Küçülen Hilal, Hilal sayfasının ilgili bölümüne gider.
 * En altta evre aracı "Doğduğum Gün Ay Nasıldı?" durur.
 */
const TR_PHASE_MENU: NavItem[] = [
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

function trShell(): ShellData {
  const sections: NavSection[] = pagesByGroup()
    .filter((g) => g.group !== "kurumsal")
    .map((g) => ({
      label: g.name,
      items:
        g.group === "evreler"
          ? TR_PHASE_MENU
          : g.pages.map((p) => ({
              path: p.path,
              label: g.group === "bugun" ? g.name : p.navLabel,
              description: p.description,
              phaseAngle: p.cardPhaseAngle,
            })),
    }));

  // Türkçe sayfa → İngilizce karşılığı, İngilizce kayıtlarındaki `tr` alanından.
  const toEn = Object.fromEntries(EN_ALL_PAGES.filter((p) => p.tr).map((p) => [p.tr!, p.path]));

  return {
    lang: "tr",
    home: HOME_PATH,
    locale: language("tr").locale,
    tagline: language("tr").tagline,
    liveMoon: { path: PAGES.bugunAy.path, timeZone: siteConfig.defaultLocation.timeZone },
    sections,
    search: SEARCH_ITEMS,
    footerBlurb:
      "Ayın evresi, doğuş-batış saatleri, dolunaylar ve tutulmalar. Hepsi Türkiye saatine göre, astronomik hesapla.",
    footerSections: [
      { name: GROUP_NAMES.evreler, pages: [PAGES.ayEvreleri, PAGES.dolunay, PAGES.yeniAy, PAGES.hilal, PAGES.dogdugumGun] },
      { name: GROUP_NAMES.takvim, pages: [PAGES.bugunAy, PAGES.ayTakvimi, PAGES.dolunayTarihleri, PAGES.superAy] },
      { name: GROUP_NAMES.tutulmalar, pages: [PAGES.ayTutulmalari, PAGES.kanliAy, PAGES.gunesTutulmasi] },
      { name: GROUP_NAMES.hicri, pages: [PAGES.hicriTakvim, PAGES.hilalGozlemi, PAGES.eyyamiBiyz] },
      { name: GROUP_NAMES["gelenek-burclar"], pages: [PAGES.ayHangiBurcta, PAGES.ayBurcu, PAGES.sacKesim, PAGES.aybosluk] },
    ],
    corporate: [PAGES.hakkimizda, PAGES.yazar, PAGES.iletisim, PAGES.yontem, PAGES.kaynaklar, PAGES.gizlilik, PAGES.cerez],
    contactEmail: siteConfig.contactEmail,
    methodPath: PAGES.yontem.path,
    cookiePolicyPath: PAGES.cerez.path,
    related: Object.fromEntries(ALL_PAGES.map((p) => [p.path, relatedPages(p.path)])),
    counterparts: { en: { [HOME_PATH]: EN_HOME_PATH, ...toEn } },
  };
}

function enShell(): ShellData {
  const groups = (Object.keys(EN_GROUP_NAMES) as EnPageGroup[])
    .map((group) => ({ group, name: EN_GROUP_NAMES[group], pages: EN_ALL_PAGES.filter((p) => p.group === group) }))
    .filter((g) => g.pages.length > 0);
  const pages = EN_PAGES as Record<string, (typeof EN_ALL_PAGES)[number]>;
  const related = EN_RELATED as Record<string, string[]>;

  return {
    lang: "en",
    home: EN_HOME_PATH,
    locale: language("en").locale,
    tagline: language("en").tagline,
    // İngilizce menüdeki canlı ay: varsayılan şehir New York (en büyük kitle ABD; bkz. CLAUDE.md).
    liveMoon: { path: EN_HOME_PATH, timeZone: "America/New_York" },
    sections: groups
      .filter((g) => g.group !== "about")
      .map((g) => ({
        label: g.name,
        items: g.pages.map((p) => ({
          path: p.path,
          label: p.navLabel,
          description: p.description,
          phaseAngle: p.cardPhaseAngle,
        })),
      })),
    search: EN_ALL_PAGES.map((p) => ({
      path: p.path,
      title: p.title,
      description: p.description,
      group: EN_GROUP_NAMES[p.group],
    })),
    footerBlurb:
      "Moon phases, sunrise and sunset, full moons and eclipses, calculated for wherever you are on Earth.",
    footerSections: groups.filter((g) => g.group !== "about").map((g) => ({ name: g.name, pages: g.pages.slice(0, 5) })),
    corporate: groups.find((g) => g.group === "about")?.pages ?? [],
    contactEmail: siteConfig.contactEmailEn,
    methodPath: EN_PAGES.methodology.path,
    cookiePolicyPath: EN_PAGES.cookiePolicy.path,
    related: Object.fromEntries(Object.keys(pages).map((k) => [pages[k].path, (related[k] ?? []).map((r) => pages[r])])),
    counterparts: {
      tr: {
        [EN_HOME_PATH]: HOME_PATH,
        ...Object.fromEntries(EN_ALL_PAGES.filter((p) => p.tr).map((p) => [p.path, p.tr!])),
      },
    },
  };
}

export function getShell(lang: Lang): ShellData {
  return lang === "en" ? enShell() : trShell();
}
