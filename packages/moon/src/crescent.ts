import * as Astronomy from "astronomy-engine";
import type { GeoLocation } from "./location.ts";
import { getMoonAltitude } from "./rise-set.ts";
import { localDateParts, zonedTimeToUtc } from "./time.ts";

/**
 * Hilalin görülmesinin astronomik olarak mümkün sayıldığı alt sınır: gün batımında ayın ufuktan
 * yüksekliği ve Güneş ile arasındaki açı. Eşiğin karşılanması hilalin çıplak gözle kolayca görüleceği
 * anlamına gelmez; çok genç hilal genellikle ertesi akşam görülür. Resmî bir ölçüt olarak kullanılmaz.
 */
export const CRESCENT_MIN_ALTITUDE = 5;
export const CRESCENT_MIN_ELONGATION = 8;

export interface CrescentEvening {
  /** O akşamki gün batımı. */
  sunset: Date;
  /** Gün batımında ayın ufuktan yüksekliği (derece). */
  moonAltitude: number;
  /** Gün batımında ay ile Güneş arasındaki açı (derece). */
  elongation: number;
  /** Yeni aydan gün batımına geçen süre (saat). Negatifse yeni ay henüz olmamıştır. */
  ageHours: number;
  /** Ay, Güneş'ten sonra mı batıyor? (Önce batarsa hilal görülemez.) */
  moonSetsAfterSun: boolean;
  /** Yükseklik ve açı eşikleri karşılanıyor mu? */
  meetsCriteria: boolean;
}

/** Yeni ayın düştüğü günden başlayarak `days` akşam boyunca gün batımındaki hilal koşulları. */
export function getCrescentEvenings(newMoon: Date, location: GeoLocation, days = 4): CrescentEvening[] {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const first = localDateParts(newMoon, location.timeZone);
  const evenings: CrescentEvening[] = [];

  for (let i = 0; i < days; i++) {
    const noon = zonedTimeToUtc(first.year, first.month, first.day + i, 12, location.timeZone);
    const sunsetTime = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, noon, 1);
    if (!sunsetTime) continue;
    const sunset = sunsetTime.date;
    const moonSet = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, noon, 1);
    const moonAltitude = getMoonAltitude(sunset, location);
    const elongation = Astronomy.AngleFromSun(Astronomy.Body.Moon, sunset);
    const ageHours = (sunset.getTime() - newMoon.getTime()) / 3_600_000;
    const moonSetsAfterSun = !!moonSet && moonSet.date > sunset;
    evenings.push({
      sunset,
      moonAltitude,
      elongation,
      ageHours,
      moonSetsAfterSun,
      meetsCriteria:
        ageHours > 0 &&
        moonSetsAfterSun &&
        moonAltitude >= CRESCENT_MIN_ALTITUDE &&
        elongation >= CRESCENT_MIN_ELONGATION,
    });
  }
  return evenings;
}
