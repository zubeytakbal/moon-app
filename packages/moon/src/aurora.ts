import * as Astronomy from "astronomy-engine";
import type { GeoLocation } from "./location.ts";
import { localDateParts, zonedTimeToUtc } from "./time.ts";

/**
 * Kuzey ışıkları için gece koşulları: gökyüzü yeterince karanlık mı, ay ışığı engelliyor mu?
 * Işıkların kendisi (uzay havası) önceden hesaplanamaz; burada yalnız gözlemi belirleyen karanlık ve ay hesaplanır.
 */

/** Gökyüzü bu yükseklikten sonra kuzey ışıklarını görecek kadar karanlıktır (deniz alacakaranlığı sonu). */
export const AURORA_SUN_DEG = -12;
const STEP_MS = 20 * 60_000;

/** Jeomanyetik kuzey kutbu (dipol), WMM2025 / IGRF-14, 2025.0: 80,85° K, 72,76° B (NOAA NCEI, BGS). */
const GEOMAGNETIC_POLE = { latitude: 80.85, longitude: -72.76 };

/** Bir yerin jeomanyetik enlemi (dipol yaklaşımı, derece). NOAA fırtına ölçeği bu enlemle verilir. */
export function geomagneticLatitude(location: { latitude: number; longitude: number }): number {
  const rad = Math.PI / 180;
  const f = location.latitude * rad;
  const fp = GEOMAGNETIC_POLE.latitude * rad;
  const dl = (location.longitude - GEOMAGNETIC_POLE.longitude) * rad;
  return Math.asin(Math.sin(f) * Math.sin(fp) + Math.cos(f) * Math.cos(fp) * Math.cos(dl)) / rad;
}

export interface AuroraNight {
  /** Gecenin başladığı akşamın tarihi (yerel öğle). */
  evening: Date;
  /** Karanlığın başlangıcı ve sonu (Güneş −12°). Hiç kararmıyorsa null. */
  darkStart: Date | null;
  darkEnd: Date | null;
  darkMinutes: number;
  /** Ayın aydınlık oranı (0-1), gece ortasında. */
  moonIllumination: number;
  /** Karanlık süresince ayın ufkun üzerinde kaldığı dakika. */
  moonUpMinutes: number;
  /** Ay ışığının etkisi: (ayın gökyüzünde kaldığı pay) × (aydınlık oranı), 0-1. */
  moonImpact: number;
  rating: "karanlik-yok" | "cok-iyi" | "iyi" | "ay-isigi";
}

/** Verilen yerel günün akşamından başlayan gece için koşullar (karanlık ve ay). */
export function getAuroraNight(date: Date, location: GeoLocation): AuroraNight {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const p = localDateParts(date, location.timeZone);
  const evening = zonedTimeToUtc(p.year, p.month, p.day, 12, location.timeZone);
  const nextNoon = new Date(evening.getTime() + 86_400_000);

  const sunAltitude = (t: Date) => {
    const eq = Astronomy.Equator(Astronomy.Body.Sun, t, observer, true, true);
    return Astronomy.Horizon(t, observer, eq.ra, eq.dec, "normal").altitude;
  };
  const moonAltitude = (t: Date) => {
    const eq = Astronomy.Equator(Astronomy.Body.Moon, t, observer, true, true);
    return Astronomy.Horizon(t, observer, eq.ra, eq.dec, "normal").altitude;
  };

  // Öğleden ertesi öğleye 15 dakikada bir: karanlık aralığı ve ay. (Kutup gecesinde Güneş hiç doğmasa da
  // −12°'nin altına yalnız gecenin bir kısmında iner; aralık yine böyle bulunur.)
  let darkStart: Date | null = null;
  let darkEnd: Date | null = null;
  let dark = 0;
  let moonUp = 0;
  for (let t = evening.getTime(); t < nextNoon.getTime(); t += STEP_MS) {
    const time = new Date(t);
    if (sunAltitude(time) > AURORA_SUN_DEG) continue;
    if (!darkStart) darkStart = time;
    darkEnd = new Date(t + STEP_MS);
    dark += STEP_MS / 60_000;
    if (moonAltitude(time) > 0) moonUp += STEP_MS / 60_000;
  }
  const middle = darkStart && darkEnd ? new Date((darkStart.getTime() + darkEnd.getTime()) / 2) : nextNoon;
  const moonIllumination = Astronomy.Illumination(Astronomy.Body.Moon, middle).phase_fraction;
  const moonImpact = dark ? (moonUp / dark) * moonIllumination : 0;
  const rating =
    dark < 90 ? "karanlik-yok" : moonImpact < 0.08 ? "cok-iyi" : moonImpact < 0.35 ? "iyi" : "ay-isigi";
  return { evening, darkStart, darkEnd, darkMinutes: dark, moonIllumination, moonUpMinutes: moonUp, moonImpact, rating };
}

/**
 * Yalnız karanlık süresi (dakika): akşam Güneş'in −12°'ye inmesinden sabah çıkmasına. Ay hesaplanmaz; mevsim
 * tablosu gibi çok sayıda yer × ay için hafif yol. Gece hiç o kadar kararmıyorsa 0.
 */
export function getDarkMinutes(date: Date, location: GeoLocation): number {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const p = localDateParts(date, location.timeZone);
  const noon = zonedTimeToUtc(p.year, p.month, p.day, 12, location.timeZone);
  const dusk = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, -1, noon, 1, AURORA_SUN_DEG);
  if (!dusk) return 0;
  const dawn = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, +1, dusk, 1, AURORA_SUN_DEG);
  return dawn ? (dawn.date.getTime() - dusk.date.getTime()) / 60_000 : 0;
}

export interface AuroraDestination extends GeoLocation {
  slug: string;
  country: string;
}

/** Kuzey ışıkları gezilerinin bilinen yerleri (elle seçildi; çoğu 65-70° K, ışık halkasının altında). */
export const AURORA_DESTINATIONS: readonly AuroraDestination[] = [
  { slug: "tromso", name: "Tromsø", country: "Norveç", latitude: 69.65, longitude: 18.96, elevation: 0, timeZone: "Europe/Oslo" },
  { slug: "lofoten", name: "Lofoten (Svolvær)", country: "Norveç", latitude: 68.23, longitude: 14.57, elevation: 0, timeZone: "Europe/Oslo" },
  { slug: "abisko", name: "Abisko", country: "İsveç", latitude: 68.35, longitude: 18.83, elevation: 0, timeZone: "Europe/Stockholm" },
  { slug: "kiruna", name: "Kiruna", country: "İsveç", latitude: 67.86, longitude: 20.23, elevation: 0, timeZone: "Europe/Stockholm" },
  { slug: "rovaniemi", name: "Rovaniemi", country: "Finlandiya", latitude: 66.5, longitude: 25.72, elevation: 0, timeZone: "Europe/Helsinki" },
  { slug: "levi", name: "Levi", country: "Finlandiya", latitude: 67.8, longitude: 24.81, elevation: 0, timeZone: "Europe/Helsinki" },
  { slug: "saariselka", name: "Saariselkä", country: "Finlandiya", latitude: 68.42, longitude: 27.41, elevation: 0, timeZone: "Europe/Helsinki" },
  { slug: "reykjavik", name: "Reykjavik", country: "İzlanda", latitude: 64.15, longitude: -21.94, elevation: 0, timeZone: "Atlantic/Reykjavik" },
  { slug: "murmansk", name: "Murmansk", country: "Rusya", latitude: 68.97, longitude: 33.07, elevation: 0, timeZone: "Europe/Moscow" },
  { slug: "yellowknife", name: "Yellowknife", country: "Kanada", latitude: 62.45, longitude: -114.37, elevation: 0, timeZone: "America/Edmonton" },
  { slug: "fairbanks", name: "Fairbanks", country: "ABD (Alaska)", latitude: 64.84, longitude: -147.72, elevation: 0, timeZone: "America/Anchorage" },
];
