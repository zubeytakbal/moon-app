export const WEEKDAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
export const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

/** Takvim sayfalarında seçilebilen yıl aralığı. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

/** "2026-11" biçimindeki ay parametresini çözer; geçersizse null döner. */
export function parseMonth(value: string | string[] | undefined): { year: number; month: number } | null {
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12) return null;
  return { year, month };
}

export function monthParam(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function adjacentMonths(year: number, month: number) {
  return {
    prev: month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 },
    next: month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 },
  };
}

/** Verilen saat dilimine göre içinde bulunulan yıl ve ay. */
export function currentMonth(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "numeric" }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get("year"), month: get("month") };
}
