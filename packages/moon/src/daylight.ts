import * as Astronomy from "astronomy-engine";
import type { GeoLocation } from "./location.ts";
import { getSunRiseSet } from "./rise-set.ts";
import { localDateParts, zonedTimeToUtc } from "./time.ts";

const DAY_MS = 86_400_000;

export interface DayLength {
  /** O yerel günün öğle vakti (12:00, yerin saat dilimiyle). */
  noon: Date;
  rise: Date | null;
  set: Date | null;
  /**
   * Gündüz süresi (dakika): gün doğumundan gün batımına. Güneş hiç batmıyorsa 1440, hiç doğmuyorsa 0.
   * Doğuş ve batış, Güneş'in üst kenarının ufka değdiği andır (ışığın kırılması dahil).
   */
  minutes: number;
  /** Kutup günü (Güneş batmıyor) ya da kutup gecesi (doğmuyor). */
  polar: "day" | "night" | null;
}

/** Verilen yerel günün (date'in o yerdeki günü) gündüz süresi. */
export function getDayLength(date: Date, location: GeoLocation): DayLength {
  const p = localDateParts(date, location.timeZone);
  const noon = zonedTimeToUtc(p.year, p.month, p.day, 12, location.timeZone);
  const { rise, set } = getSunRiseSet(noon, location);
  if (rise && set && set > rise) {
    return { noon, rise, set, minutes: (set.getTime() - rise.getTime()) / 60_000, polar: null };
  }
  if (!rise && !set) {
    // Doğuş da batış da yoksa: öğlen Güneş ufkun üzerindeyse kutup günü, altındaysa kutup gecesi.
    const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
    const eq = Astronomy.Equator(Astronomy.Body.Sun, noon, observer, true, true);
    const up = Astronomy.Horizon(noon, observer, eq.ra, eq.dec, "normal").altitude > 0;
    return { noon, rise, set, minutes: up ? 1440 : 0, polar: up ? "day" : "night" };
  }
  // Yalnız biri varsa (kutup gününe/gecesine geçiş günleri): o günün içindeki kısmı say.
  const dayStart = zonedTimeToUtc(p.year, p.month, p.day, 0, location.timeZone).getTime();
  const dayEnd = dayStart + DAY_MS;
  const from = rise ? rise.getTime() : dayStart;
  const to = set && (!rise || set > rise) ? set.getTime() : dayEnd;
  return { noon, rise, set, minutes: Math.max(0, (to - from) / 60_000), polar: null };
}

/** Bir yıl boyunca her `stepDays` günde bir gündüz süresi (grafik için). */
export function getYearDayLengths(year: number, location: GeoLocation, stepDays = 1): DayLength[] {
  const result: DayLength[] = [];
  for (let t = Date.UTC(year, 0, 1, 12); t < Date.UTC(year + 1, 0, 1); t += stepDays * DAY_MS) {
    result.push(getDayLength(new Date(t), location));
  }
  return result;
}

/** Bir anın çevresindeki günler arasında gündüzü en uzun (max) ya da en kısa (min) olan gün. */
export function getExtremeDay(around: Date, location: GeoLocation, kind: "max" | "min", spanDays = 4): DayLength {
  let best: DayLength | null = null;
  for (let d = -spanDays; d <= spanDays; d++) {
    const dl = getDayLength(new Date(around.getTime() + d * DAY_MS), location);
    if (!best || (kind === "max" ? dl.minutes > best.minutes : dl.minutes < best.minutes)) best = dl;
  }
  return best!;
}

/**
 * Gece ile gündüzün gerçekten en eşit olduğu gün (gündüz 12 saate en yakın), bir ekinoksun çevresinde.
 * Işığın kırılması ve Güneş'in diski yüzünden ekinoks günü gündüz 12 saatten birkaç dakika uzundur;
 * eşit gün kuzey yarımkürede Mart ekinoksundan birkaç gün önce, Eylül ekinoksundan birkaç gün sonradır.
 */
export function getEquiluxDay(equinox: Date, location: GeoLocation, spanDays = 8): DayLength {
  let best: DayLength | null = null;
  for (let d = -spanDays; d <= spanDays; d++) {
    const dl = getDayLength(new Date(equinox.getTime() + d * DAY_MS), location);
    if (!best || Math.abs(dl.minutes - 720) < Math.abs(best.minutes - 720)) best = dl;
  }
  return best!;
}
