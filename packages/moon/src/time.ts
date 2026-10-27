const MS_PER_DAY = 86_400_000;

function partsIn(date: Date, timeZone: string, withTime: boolean): Record<string, number> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "numeric", second: "numeric" } : {}),
  }).formatToParts(date);
  const result: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") result[p.type] = Number(p.value);
  return result;
}

/** Verilen anda, saat diliminin UTC'den farkı (milisaniye). */
function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const p = partsIn(date, timeZone, true);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Verilen anın, o saat dilimindeki takvim günü (ay 1-12). */
export function localDateParts(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const p = partsIn(date, timeZone, false);
  return { year: p.year, month: p.month, day: p.day };
}

/** Bir saat dilimindeki yerel gece yarısını UTC anına çevirir. */
function zonedMidnightToUtc(year: number, month: number, day: number, timeZone: string): Date {
  const guess = Date.UTC(year, month - 1, day);
  // Yaz saati geçişlerinde ilk tahmin kayabilir, iki tur düzeltme yeterli.
  let utc = guess - timeZoneOffsetMs(new Date(guess), timeZone);
  utc = guess - timeZoneOffsetMs(new Date(utc), timeZone);
  return new Date(utc);
}

/** Verilen anın düştüğü yerel günün başlangıcı ve bitişi (UTC anları). */
export function localDayRange(date: Date, timeZone: string): { start: Date; end: Date } {
  const { year, month, day } = localDateParts(date, timeZone);
  const start = zonedMidnightToUtc(year, month, day, timeZone);
  // Date.UTC taşan günleri bir sonraki aya/yıla kendisi aktarır.
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const end = zonedMidnightToUtc(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), timeZone);
  return { start, end };
}

export function daysBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / MS_PER_DAY;
}
