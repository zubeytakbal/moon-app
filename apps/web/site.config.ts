import { findProvince, type Province } from "@moon-app/moon";

/**
 * Sitenin marka ve genel ayarları. Site adı, domain vb. sadece buradan okunur.
 * Marka adı kesinleşince tek değişiklik burada yapılır.
 */
export const siteConfig = {
  name: "Moon App",
  /** Sitenin tam adresi. Domain belli olunca güncellenmeli (canonical adresler buna göre üretilir). */
  url: "http://localhost:3000",
  /** Yayına alınana kadar false kalmalı: robots.txt tüm taramayı engeller. */
  allowIndexing: false,
  locale: "tr-TR",
  /** Sitenin dilleri. Yeni dil, içeriği hazır olunca buraya eklenir (makine çevirisi yok, bkz. CLAUDE.md). */
  languages: [{ code: "tr", label: "Türkçe", home: "/tr" }],
  defaultLocation: findProvince("istanbul") as Province,
} as const;
