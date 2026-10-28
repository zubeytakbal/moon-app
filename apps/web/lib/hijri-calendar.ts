/**
 * Hicri takvim çevirileri, Ümmülkurâ takvimine göre (Intl). Bu dosya astronomi kütüphanesine
 * bağlı değildir; bu yüzden tarayıcıda çalışan çeviricide de kullanılır.
 *
 * Ümmülkurâ, Diyanet'in 2027 dinî günleri listesindeki 9 tarihle (Miraç, Berat, Ramazan, Kadir,
 * iki bayram, Hicri yılbaşı, Aşure, Mevlid) birebir örtüştü (27 Ekim 2026). Resmî tarihler için
 * yine de Diyanet esas alınmalıdır.
 */
export const HIJRI_MONTHS = [
  "Muharrem",
  "Safer",
  "Rebiülevvel",
  "Rebiülahir",
  "Cemaziyelevvel",
  "Cemaziyelahir",
  "Recep",
  "Şaban",
  "Ramazan",
  "Şevval",
  "Zilkade",
  "Zilhicce",
];

/** Ümmülkurâ tablosunun kapsadığı yıllar; dışında tarayıcılar yaklaşık hesaba döner. */
export const HIJRI_MIN_YEAR = 1300;
export const HIJRI_MAX_YEAR = 1500;

export interface HijriDate {
  year: number;
  /** 1 Muharrem ... 12 Zilhicce. */
  month: number;
  monthName: string;
  day: number;
}

const DAY_MS = 86_400_000;

/**
 * Verilen anın, `timeZone` saat dilimindeki günün Hicri karşılığı. Ay numarası sayı olarak
 * okunur; böylece tarayıcıların ay adı yazımı farklı olsa da sonuç değişmez.
 */
export function toHijri(date: Date, timeZone: string): HijriDate {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
    timeZone,
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);
  const get = (t: string) => Number((parts.find((p) => p.type === t)?.value ?? "").replace(/\D/g, ""));
  const month = get("month");
  return { year: get("year"), month, monthName: HIJRI_MONTHS[month - 1], day: get("day") };
}

/**
 * Hicri tarihin Miladi karşılığı (o günün öğle vakti, UTC). Tarih yoksa (örneğin 29 gün çeken
 * bir ayın 30'u) null döner. Hicri gün bir önceki akşam gün batımında başlar.
 */
export function fromHijri(year: number, month: number, day: number): Date | null {
  // Yaklaşık tahmin: 16 Temmuz 622'den bu yana geçen ortalama Hicri yıl ve ay uzunlukları.
  const days = Math.round((year - 1) * 354.36667 + (month - 1) * 29.5306 + (day - 1));
  const estimate = Date.UTC(622, 6, 16, 12) + days * DAY_MS;
  for (let offset = 0; offset <= 45; offset++) {
    for (const sign of offset === 0 ? [1] : [1, -1]) {
      const date = new Date(estimate + sign * offset * DAY_MS);
      const h = toHijri(date, "UTC");
      if (h.year === year && h.month === month && h.day === day) return date;
    }
  }
  return null;
}

/** Hicri ayın gün sayısı (29 ya da 30). */
export function hijriMonthLength(year: number, month: number): number {
  return fromHijri(year, month, 30) ? 30 : 29;
}
