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

/** Dinî günün türü: kandiller ve Kadir Gecesi listede yazan günün akşamıdır, ötekiler gündüzdür. */
export type ReligiousDayKind = "gece" | "gun";

export interface ReligiousDay {
  id: string;
  name: string;
  kind: ReligiousDayKind;
  /** Hicri tarih (bayramlarda ilk gün). */
  hijri: { year: number; month: number; day: number };
  /** Miladi gün, günün ortası (UTC). Gecelerde bu günün akşamı. */
  date: Date;
  /** Kaç gün sürdüğü (bayramlar 3-4 gün, ötekiler 1). */
  days: number;
}

/**
 * Bir Hicri yılın dinî günleri, Diyanet'in dinî günler listesindeki adlar ve kurallarla:
 * kandil geceleri listede yazan günün akşamıdır (Miraç 26 Recep, Berat 14 Şaban, Kadir 26 Ramazan,
 * Mevlid 11 Rebiülevvel; Regaip, Recep'in ilk Cuma'sından önceki Perşembe). Ramazan arefesi Ramazan'ın son
 * günüdür (29 ya da 30). Diyanet'in 2026 ve 2027 listeleriyle 16 günün hepsi aynı çıktı (6 Kasım 2026).
 */
export function religiousDaysOfYear(year: number): ReligiousDay[] {
  const out: ReligiousDay[] = [];
  const add = (id: string, name: string, kind: ReligiousDayKind, month: number, day: number, days = 1) => {
    const date = fromHijri(year, month, day);
    if (date) out.push({ id: `${id}-${year}`, name, kind, hijri: { year, month, day }, date, days });
  };
  add("hicri-yilbasi", "Hicri yılbaşı", "gun", 1, 1);
  add("asure", "Aşure Günü", "gun", 1, 10);
  add("mevlid", "Mevlid Kandili", "gece", 3, 11);
  add("uc-aylar", "Üç Ayların başlangıcı", "gun", 7, 1);
  // Regaip: Recep'in ilk Cuma'sını bağlayan gece, yani ondan önceki Perşembe akşamı. 1 Recep Cuma ise bu akşam
  // Cemaziyelahir'in son gününe düşer (Hicri gün akşam başladığı için Recep'in ilk gecesidir).
  for (let d = 1; d <= 7; d++) {
    const friday = fromHijri(year, 7, d);
    if (friday && friday.getUTCDay() === 5) {
      const thursday = new Date(friday.getTime() - DAY_MS);
      const h = toHijri(thursday, "UTC");
      out.push({ id: `regaip-${year}`, name: "Regaip Kandili", kind: "gece", hijri: h, date: thursday, days: 1 });
      break;
    }
  }
  add("mirac", "Miraç Kandili", "gece", 7, 26);
  add("berat", "Berat Kandili", "gece", 8, 14);
  add("ramazan", "Ramazan'ın başlangıcı", "gun", 9, 1);
  add("kadir", "Kadir Gecesi", "gece", 9, 26);
  add("ramazan-arefe", "Ramazan Bayramı arefesi", "gun", 9, hijriMonthLength(year, 9));
  add("ramazan-bayrami", "Ramazan Bayramı", "gun", 10, 1, 3);
  add("kurban-arefe", "Kurban Bayramı arefesi", "gun", 12, 9);
  add("kurban-bayrami", "Kurban Bayramı", "gun", 12, 10, 4);
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** `timeZone` saat dilimindeki bugünün ortası (UTC), `fromHijri` tarihleriyle karşılaştırmak için. */
export function todayNoonUtc(now: Date, timeZone: string): number {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(now)
    .split("-")
    .map(Number);
  return Date.UTC(y, m - 1, d, 12);
}

/** Bugünden (sürmekte olan bayram dahil) sonraki `spanDays` gün içindeki dinî günler, tarih sırasıyla. */
export function getUpcomingReligiousDays(now: Date, timeZone: string, spanDays = 365): ReligiousDay[] {
  const today = todayNoonUtc(now, timeZone);
  const end = today + spanDays * DAY_MS;
  const y = toHijri(now, timeZone).year;
  return [y - 1, y, y + 1]
    .flatMap(religiousDaysOfYear)
    .filter((r) => r.date.getTime() + (r.days - 1) * DAY_MS >= today && r.date.getTime() < end);
}
