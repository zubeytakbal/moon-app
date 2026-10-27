import { ISTANBUL } from "@moon-app/moon";

/**
 * Sitenin marka ve genel ayarları. Site adı, domain vb. sadece buradan okunur.
 * Marka adı kesinleşince tek değişiklik burada yapılır.
 */
export const siteConfig = {
  name: "Moon App",
  /** Yayına alınana kadar false kalmalı: robots.txt tüm taramayı engeller. */
  allowIndexing: false,
  locale: "tr-TR",
  defaultLocation: ISTANBUL,
} as const;
