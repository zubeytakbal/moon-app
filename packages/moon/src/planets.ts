import * as Astronomy from "astronomy-engine";
import type { GeoLocation } from "./location.ts";
import { localDateParts, zonedTimeToUtc } from "./time.ts";

/** Çıplak gözle kolay görülen gezegenler (Merkür ufka çok yakın kaldığı için dahil değil). */
export const NAKED_EYE_PLANETS = [
  { body: Astronomy.Body.Venus, name: "Venüs" },
  { body: Astronomy.Body.Mars, name: "Mars" },
  { body: Astronomy.Body.Jupiter, name: "Jüpiter" },
  { body: Astronomy.Body.Saturn, name: "Satürn" },
] as const;

/** Bir gezegenin görünür sayılması için ufuktan en az yüksekliği (derece) ve gökyüzünün kararmış olması (Güneş −6°). */
const MIN_ALTITUDE = 10;
const SKY_DARK_SUN = -6;
const STEP_MS = 20 * 60_000;

export interface VisiblePlanet {
  name: string;
  /** Gecenin hangi kısmında görülür: akşam (ilk yarı), sabah (son yarı) ya da gece boyu. */
  when: "aksam" | "sabah" | "gece-boyu";
  /** En yüksekte olduğu an ve o anki yönü (azimut, derece). */
  bestTime: Date;
  bestAzimuth: number;
  bestAltitude: number;
  /** Parlaklık (kadir; küçük sayı daha parlak). */
  magnitude: number;
}

/**
 * Verilen yerel günün akşamından ertesi sabaha, gökyüzü karardığında (Güneş −6°'nin altında) ufuktan en az 10°
 * yükselen gezegenler, parlaklığa göre sıralı.
 */
export function getVisiblePlanets(date: Date, location: GeoLocation): VisiblePlanet[] {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const p = localDateParts(date, location.timeZone);
  const noon = zonedTimeToUtc(p.year, p.month, p.day, 12, location.timeZone);
  const dusk = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, -1, noon, 1, SKY_DARK_SUN);
  const dawn = dusk && Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, +1, dusk, 1, SKY_DARK_SUN);
  if (!dusk || !dawn) return [];
  const start = dusk.date.getTime();
  const end = dawn.date.getTime();
  const middle = (start + end) / 2;

  const result: VisiblePlanet[] = [];
  for (const planet of NAKED_EYE_PLANETS) {
    let best: { t: number; alt: number; az: number } | null = null;
    let firstHalf = false;
    let secondHalf = false;
    for (let t = start; t <= end; t += STEP_MS) {
      const time = new Date(t);
      const eq = Astronomy.Equator(planet.body, time, observer, true, true);
      const hor = Astronomy.Horizon(time, observer, eq.ra, eq.dec, "normal");
      if (hor.altitude < MIN_ALTITUDE) continue;
      if (t < middle) firstHalf = true;
      else secondHalf = true;
      if (!best || hor.altitude > best.alt) best = { t, alt: hor.altitude, az: hor.azimuth };
    }
    if (!best) continue;
    result.push({
      name: planet.name,
      when: firstHalf && secondHalf ? "gece-boyu" : firstHalf ? "aksam" : "sabah",
      bestTime: new Date(best.t),
      bestAzimuth: best.az,
      bestAltitude: best.alt,
      magnitude: Astronomy.Illumination(planet.body, new Date(best.t)).mag,
    });
  }
  return result.sort((a, b) => a.magnitude - b.magnitude);
}
