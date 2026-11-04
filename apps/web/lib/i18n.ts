/**
 * Sitenin ortak parçalarındaki (menü, arama, alt bilgi, çerez bildirimi, İçindekiler) kısa metinler, dil başına.
 * Sayfa içerikleri burada değil: her dilin sayfası kendi metniyle, o dilin aramalarına göre sıfırdan yazılır
 * (makine çevirisi yok, bkz. CLAUDE.md kırmızı çizgi 9). Bu dosya istemci bileşenlerinde de kullanılır.
 */

export type Lang = "tr" | "en";

export interface UiStrings {
  /** Büyük harfe çevirirken kullanılacak yerel ayar (Türkçede "i" → "İ"). */
  upperLocale: string;
  homeLabel: (site: string) => string;
  search: string;
  searchShort: string;
  searchLong: string;
  noResults: string;
  openMenu: string;
  closeMenu: string;
  openSearch: string;
  closeSearch: string;
  mainMenu: string;
  sections: string;
  language: string;
  /** Üst menüdeki canlı ay göstergesi: "%42" / "42%". */
  percent: (n: number) => string;
  liveMoonTitle: (phase: string, pct: number) => string;
  toc: string;
  hideToc: string;
  hide: string;
  close: string;
  tocCount: (n: number) => string;
  showTocAgain: string;
  related: string;
  cookieDialog: string;
  cookieText: string;
  cookiePolicy: string;
  reject: string;
  accept: string;
  cookieSettings: string;
  featuredPages: string;
  allPages: string;
  howWeCalculate: string;
  /** Alt bilgideki görsel künyesi ve saat notu. */
  footerCredit: string;
}

export const UI: Record<Lang, UiStrings> = {
  tr: {
    upperLocale: "tr-TR",
    homeLabel: (site) => `${site} ana sayfa`,
    search: "Sitede ara",
    searchShort: "Ara…",
    searchLong: "Ara: dolunay, tutulma, ay burcu…",
    noResults: "Sonuç bulunamadı.",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    openSearch: "Sitede ara",
    closeSearch: "Aramayı kapat",
    mainMenu: "Ana menü",
    sections: "Bölümler",
    language: "Dil",
    percent: (n) => `%${n}`,
    liveMoonTitle: (phase, pct) => `Şu an: ${phase}, yüzde ${pct} aydınlık`,
    toc: "İçindekiler",
    hideToc: "İçindekileri gizle",
    hide: "Gizle",
    close: "Kapat",
    tocCount: (n) => `${n} bölüm`,
    showTocAgain: "Kenar kutusunu yeniden göster",
    related: "İlgili sayfalar",
    cookieDialog: "Çerez bildirimi",
    cookieText:
      "Hangi sayfaların okunduğunu görmek için Google Analytics çerezlerini kullanmak istiyoruz. İzin vermezseniz site aynen çalışır ve Google'a hiçbir ziyaret bilgisi gönderilmez.",
    cookiePolicy: "Çerez Politikası",
    reject: "Reddet",
    accept: "Kabul et",
    cookieSettings: "Çerez tercihleri",
    featuredPages: "Öne çıkan sayfalar",
    allPages: "Bütün sayfalar",
    howWeCalculate: "Nasıl hesaplıyoruz?",
    footerCredit:
      "Ay fotoğrafları: NASA Scientific Visualization Studio ve NASA görsel arşivi (kamu malı). Lunatlas, NASA ile bağlantılı değildir ve NASA tarafından onaylanmamıştır. Aksi belirtilmedikçe saatler Türkiye saatine (UTC+3) göredir.",
  },
  en: {
    upperLocale: "en-US",
    homeLabel: (site) => `${site} home`,
    search: "Search the site",
    searchShort: "Search…",
    searchLong: "Search: full moon, eclipse, sunrise…",
    noResults: "No results.",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    openSearch: "Search the site",
    closeSearch: "Close search",
    mainMenu: "Main menu",
    sections: "Sections",
    language: "Language",
    percent: (n) => `${n}%`,
    liveMoonTitle: (phase, pct) => `Right now: ${phase}, ${pct}% illuminated`,
    toc: "Contents",
    hideToc: "Hide contents",
    hide: "Hide",
    close: "Close",
    tocCount: (n) => `${n} sections`,
    showTocAgain: "Show the side panel again",
    related: "Related pages",
    cookieDialog: "Cookie notice",
    cookieText:
      "We'd like to use Google Analytics cookies to see which pages people read. If you decline, the site works exactly the same and no visit data is sent to Google.",
    cookiePolicy: "Cookie Policy",
    reject: "Decline",
    accept: "Accept",
    cookieSettings: "Cookie settings",
    featuredPages: "Featured pages",
    allPages: "All pages",
    howWeCalculate: "How we calculate",
    footerCredit:
      "Moon photographs: NASA Scientific Visualization Studio and the NASA Image Library (public domain). Lunatlas is not affiliated with or endorsed by NASA. Times are shown for the selected place unless stated otherwise.",
  },
};
