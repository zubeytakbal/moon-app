import * as Astronomy from "astronomy-engine";
import type { GeoLocation } from "./location.ts";
import { daysBetween, localDayRange } from "./time.ts";

export interface MoonRiseSet {
  /** Ayın doğuş anı. O gün ay doğmuyorsa null. */
  rise: Date | null;
  /** Ayın batış anı. O gün ay batmıyorsa null. */
  set: Date | null;
}

/**
 * Verilen anın düştüğü yerel günde ayın doğuş ve batış saatleri.
 *
 * Ay her gün ortalama ~50 dakika geç doğar. Bu yüzden ayda bir gün doğuş,
 * bir gün de batış olmaz; bu durumda ilgili alan null döner.
 */
export function getMoonRiseSet(date: Date, location: GeoLocation): MoonRiseSet {
  const { start, end } = localDayRange(date, location.timeZone);
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const limitDays = daysBetween(start, end);

  const find = (direction: 1 | -1): Date | null => {
    const time = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, direction, start, limitDays);
    return time && time.date < end ? time.date : null;
  };

  return { rise: find(1), set: find(-1) };
}

/** Verilen anda ayın ufuktan yüksekliği (derece, atmosferik kırılma dahil). Negatifse ay ufkun altındadır. */
export function getMoonAltitude(date: Date, location: GeoLocation): number {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const eq = Astronomy.Equator(Astronomy.Body.Moon, date, observer, true, true);
  return Astronomy.Horizon(date, observer, eq.ra, eq.dec, "normal").altitude;
}

export interface MoonPosition {
  /** Pusula yönü (derece): 0 kuzey, 90 doğu, 180 güney, 270 batı. */
  azimuth: number;
  /** Ufuktan yükseklik (derece, atmosferik kırılma dahil). Negatifse ay ufkun altındadır. */
  altitude: number;
}

/** Verilen anda ayın gökyüzündeki yeri: yönü ve ufuktan yüksekliği. */
export function getMoonPosition(date: Date, location: GeoLocation): MoonPosition {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const eq = Astronomy.Equator(Astronomy.Body.Moon, date, observer, true, true);
  const hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec, "normal");
  return { azimuth: hor.azimuth, altitude: hor.altitude };
}

/** Verilen andan sonraki ilk ay doğuşu ya da batışı (gün sınırına bakmadan). */
export function getNextMoonEvent(date: Date, location: GeoLocation, direction: "rise" | "set"): Date | null {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const time = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, direction === "rise" ? 1 : -1, date, 2);
  return time ? time.date : null;
}

/** Güneş'in ufkun bu kadar altına inince gökyüzü tamamen kararır (astronomik gece). */
export const ASTRONOMICAL_TWILIGHT_DEG = -18;

export interface DarkNight {
  /** Astronomik gecenin başlangıcı (akşam alacakaranlığının sonu). Gece tam kararmıyorsa null. */
  dusk: Date | null;
  /** Astronomik gecenin sonu (sabah alacakaranlığının başı). */
  dawn: Date | null;
  /** Gökyüzünün tamamen karanlık ve ayın ufkun altında olduğu aralıklar. */
  dark: { start: Date; end: Date }[];
  /** Karanlık aralıkların toplamı (dakika). */
  minutes: number;
}

/**
 * Verilen anın düştüğü yerel günün akşamından başlayan gecede, yıldız gözlemi için tam karanlık
 * aralıklar: Güneş ufkun 18° altında ve ay ufkun altında.
 */
export function getDarkNight(date: Date, location: GeoLocation): DarkNight {
  const { start } = localDayRange(date, location.timeZone);
  const noon = new Date(start.getTime() + 12 * 3_600_000);
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const dusk = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, -1, noon, 1, ASTRONOMICAL_TWILIGHT_DEG);
  const dawn = dusk
    ? Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, +1, dusk, 1, ASTRONOMICAL_TWILIGHT_DEG)
    : null;
  if (!dusk || !dawn) return { dusk: null, dawn: null, dark: [], minutes: 0 };

  const a = dusk.date.getTime();
  const b = dawn.date.getTime();
  // Gece boyunca ayın doğuş ve batışları; gece 12 saatten kısa olduğu için en fazla birer tane olur.
  const events: { t: number; up: boolean }[] = [];
  let t = new Date(a);
  for (;;) {
    const rise = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, t, 1);
    const set = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, t, 1);
    const next = [rise && { t: rise.date.getTime(), up: true }, set && { t: set.date.getTime(), up: false }]
      .filter((e): e is { t: number; up: boolean } => !!e && e.t < b)
      .sort((x, y) => x.t - y.t)[0];
    if (!next) break;
    events.push(next);
    t = new Date(next.t + 60_000);
  }
  // Akşam ay ufkun üzerinde mi? İlk olay batışsa evet; olay yoksa yüksekliğe bakılır.
  let up = events.length ? !events[0].up : getMoonAltitude(dusk.date, location) > 0;
  const dark: { start: Date; end: Date }[] = [];
  let cursor = a;
  for (const e of events) {
    if (!up && e.t > cursor) dark.push({ start: new Date(cursor), end: new Date(e.t) });
    up = e.up;
    cursor = e.t;
  }
  if (!up && b > cursor) dark.push({ start: new Date(cursor), end: new Date(b) });
  const minutes = Math.round(dark.reduce((sum, d) => sum + (d.end.getTime() - d.start.getTime()), 0) / 60_000);
  return { dusk: dusk.date, dawn: dawn.date, dark, minutes };
}
