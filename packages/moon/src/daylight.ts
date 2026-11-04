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

export interface SunDay extends DayLength {
  /** Güneş'in en yüksekte olduğu an (öğle vakti) ve o anki yüksekliği (derece). */
  transit: Date;
  transitAltitude: number;
  /** Doğuş ve batış yönü (azimut, derece; kuzey 0, doğu 90, güney 180, batı 270). */
  riseAzimuth: number | null;
  setAzimuth: number | null;
  /** Sivil alacakaranlık: Güneş ufkun 6° altında. Sabah gökyüzü bu saatte ağarır, akşam bu saatte kararır. */
  civilDawn: Date | null;
  civilDusk: Date | null;
  /**
   * Altın saat (fotoğrafçıların yaygın tanımı): Güneş ufkun 6° üstündeyken gün doğumuna/batımına kadar.
   * Sabah: doğuştan Güneş 6°'ye yükselene kadar; akşam: Güneş 6°'ye inince batışa kadar.
   */
  goldenMorningEnd: Date | null;
  goldenEveningStart: Date | null;
}

/** Bir yerel günün Güneş ayrıntıları: doğuş, batış, yönleri, öğle vakti, alacakaranlık ve altın saat. */
export function getSunDay(date: Date, location: GeoLocation): SunDay {
  const base = getDayLength(date, location);
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const p = localDateParts(date, location.timeZone);
  const dayStart = zonedTimeToUtc(p.year, p.month, p.day, 0, location.timeZone);
  const within = (t: Astronomy.AstroTime | null) =>
    t && t.date >= dayStart && t.date.getTime() < dayStart.getTime() + DAY_MS ? t.date : null;
  const altitudeSearch = (direction: 1 | -1, altitude: number) =>
    within(Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, direction, dayStart, 1, altitude));
  const azimuthAt = (t: Date | null) => {
    if (!t) return null;
    const eq = Astronomy.Equator(Astronomy.Body.Sun, t, observer, true, true);
    return Astronomy.Horizon(t, observer, eq.ra, eq.dec, "normal").azimuth;
  };
  const transitEvent = Astronomy.SearchHourAngle(Astronomy.Body.Sun, observer, 0, dayStart);
  return {
    ...base,
    transit: transitEvent.time.date,
    transitAltitude: transitEvent.hor.altitude,
    riseAzimuth: azimuthAt(base.rise),
    setAzimuth: azimuthAt(base.set),
    civilDawn: altitudeSearch(1, -6),
    civilDusk: altitudeSearch(-1, -6),
    goldenMorningEnd: altitudeSearch(1, 6),
    goldenEveningStart: altitudeSearch(-1, 6),
  };
}

/** Bir ayın her günü için Güneş doğuşu, batışı ve gündüz süresi (aylık tablo). */
export function getMonthSunDays(year: number, month: number, location: GeoLocation): DayLength[] {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: days }, (_, i) => getDayLength(new Date(Date.UTC(year, month - 1, i + 1, 12)), location));
}

/** Güneş'in verilen andaki yüksekliği (derece; ufkun altı eksi, ışığın kırılması dahil). */
export function getSunAltitude(date: Date, location: GeoLocation): number {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const eq = Astronomy.Equator(Astronomy.Body.Sun, date, observer, true, true);
  return Astronomy.Horizon(date, observer, eq.ra, eq.dec, "normal").altitude;
}

/** Bir yerel gün boyunca Güneş'in yüksekliği, `stepMinutes` aralıkla (gece yarısından gece yarısına; grafik için). */
export function getSunPath(date: Date, location: GeoLocation, stepMinutes = 10): { time: Date; altitude: number }[] {
  const p = localDateParts(date, location.timeZone);
  const start = zonedTimeToUtc(p.year, p.month, p.day, 0, location.timeZone).getTime();
  const end = zonedTimeToUtc(p.year, p.month, p.day + 1, 0, location.timeZone).getTime();
  const out: { time: Date; altitude: number }[] = [];
  for (let t = start; t <= end; t += stepMinutes * 60_000) {
    const time = new Date(t);
    out.push({ time, altitude: getSunAltitude(time, location) });
  }
  return out;
}

export interface Twilights {
  /** Sivil (Güneş −6°), denizci (−12°) ve astronomik (−18°) alacakaranlığın sabah başı ve akşam sonu. */
  civil: { dawn: Date | null; dusk: Date | null };
  nautical: { dawn: Date | null; dusk: Date | null };
  astronomical: { dawn: Date | null; dusk: Date | null };
}

/** Bir yerel günün üç alacakaranlık türü. Yüksek enlemde yazın Güneş yeterince inmezse o tür `null` olur. */
export function getTwilights(date: Date, location: GeoLocation): Twilights {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const p = localDateParts(date, location.timeZone);
  const dayStart = zonedTimeToUtc(p.year, p.month, p.day, 0, location.timeZone);
  const within = (t: Astronomy.AstroTime | null) =>
    t && t.date >= dayStart && t.date.getTime() < dayStart.getTime() + DAY_MS ? t.date : null;
  const pair = (altitude: number) => ({
    dawn: within(Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, 1, dayStart, 1, altitude)),
    dusk: within(Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, -1, dayStart, 1, altitude)),
  });
  return { civil: pair(-6), nautical: pair(-12), astronomical: pair(-18) };
}
