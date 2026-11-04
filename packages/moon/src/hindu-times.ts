/**
 * Gün doğumu ve batımından hesaplanan geleneksel Hindu zamanları. Astronomi değil, gelenektir: hesap yalnız
 * doğuş/batış saatini kullanır; anlamı ve uygulaması geleneklere göre değişir (sayfada açıkça yazılır).
 *
 * Rahu Kalam (Rahu Kaal): gün doğumundan batımına kadarki gündüz 8 eşit parçaya bölünür; haftanın gününe göre bir
 * parça Rahu Kalam'dır. Yaygın sıra (Pazar 8., Pazartesi 2., Salı 7., Çarşamba 5., Perşembe 6., Cuma 4.,
 * Cumartesi 3.); kaynaklarda tutarlı.
 *
 * Brahma Muhurta: en yaygın modern tanımla gün doğumundan iki muhurta (2 × 48 dk = 96 dk) önce başlar, bir muhurta
 * (48 dk) önce biter. Bazı gelenekler muhurtayı gecenin 1/15'i olarak alır ya da farklı sınırlar kullanır.
 */

/** Haftanın günü (0 Pazar … 6 Cumartesi) → Rahu Kalam'ın gündüzdeki sırası (1-8). */
export const RAHU_KAAL_PART = [8, 2, 7, 5, 6, 4, 3] as const;

/** Bir muhurta, dakika (gün-gecenin 1/30'u, 24 saat üzerinden). */
export const MUHURTA_MINUTES = 48;

export interface TimeRange {
  start: Date;
  end: Date;
}

/** Rahu Kalam. `weekday` yerin yerel haftanın günüdür (0 Pazar). Doğuş/batış yoksa (kutup) null. */
export function getRahuKaal(rise: Date | null, set: Date | null, weekday: number): TimeRange | null {
  if (!rise || !set || set <= rise) return null;
  const part = (set.getTime() - rise.getTime()) / 8;
  const index = RAHU_KAAL_PART[weekday] - 1;
  return { start: new Date(rise.getTime() + part * index), end: new Date(rise.getTime() + part * (index + 1)) };
}

/** Brahma Muhurta: gün doğumundan 96 dk önce başlar, 48 dk önce biter. Doğuş yoksa null. */
export function getBrahmaMuhurta(rise: Date | null): TimeRange | null {
  if (!rise) return null;
  const m = MUHURTA_MINUTES * 60_000;
  return { start: new Date(rise.getTime() - 2 * m), end: new Date(rise.getTime() - m) };
}
