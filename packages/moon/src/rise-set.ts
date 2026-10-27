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
