import { cacheLife } from "next/cache";
import { siteConfig } from "@/site.config";

/**
 * Sayfa başlıklarında kendiliğinden güncellenen tarih parçaları (arama sonucunda güncel tarih görmek tıklamayı artırır).
 * `new Date()` yalnız "use cache" içinde okunur (Next kuralı).
 */

/** İçinde bulunulan ay, Türkiye saatine göre: "Kasım 2026". Saatte bir yenilenir. */
export async function currentMonthLabel(): Promise<string> {
  "use cache";
  cacheLife("hours");
  return new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: siteConfig.defaultLocation.timeZone,
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/** Yılın bulunma ekiyle yazımı: 2027'de, 2029'da, 2030'da, 2100'de. */
export function yearLocative(year: number): string {
  // Okunuştaki son kelimenin ünlüsüne ve sonundaki sessize göre (bir, iki, üç, ... on, yirmi, ... yüz, bin).
  const ones = ["", "de", "de", "te", "te", "te", "da", "de", "de", "da"];
  const tens = ["", "da", "de", "da", "ta", "de", "ta", "te", "de", "da"];
  const suffix =
    year % 10 !== 0 ? ones[year % 10] : year % 100 !== 0 ? tens[(year % 100) / 10] : "de"; // yüz, bin → de
  return `${year}'${suffix}`;
}
