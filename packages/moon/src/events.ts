import * as Astronomy from "astronomy-engine";
import type { GeoLocation } from "./location.ts";
import { getUpcomingPrincipalPhases, type PrincipalPhase } from "./phase.ts";

/** Verilen anda ayın merkezinin Dünya'nın merkezine uzaklığı (km). */
export function getMoonDistanceKm(date: Date): number {
  return Astronomy.GeoMoon(date).Length() * Astronomy.KM_PER_AU;
}

export type LunarEclipseKind = "penumbral" | "partial" | "total";

export interface LunarEclipse {
  kind: LunarEclipseKind;
  /** Tutulmanın en derin anı. */
  peak: Date;
  /** Evrelerin yarı süreleri (dakika). Gerçekleşmeyen evre için 0. */
  semiDurationMinutes: { penumbral: number; partial: number; total: number };
}

/** Verilen andan sonraki `count` adet ay tutulması. */
export function getUpcomingLunarEclipses(date: Date, count: number): LunarEclipse[] {
  const result: LunarEclipse[] = [];
  let e = Astronomy.SearchLunarEclipse(date);
  for (let i = 0; i < count; i++) {
    result.push({
      kind: e.kind as LunarEclipseKind,
      peak: e.peak.date,
      semiDurationMinutes: { penumbral: e.sd_penum, partial: e.sd_partial, total: e.sd_total },
    });
    e = Astronomy.NextLunarEclipse(e.peak);
  }
  return result;
}

/** Bir yılın ekinoks ve gündönümü anları. */
export function getSeasons(year: number): {
  marchEquinox: Date;
  juneSolstice: Date;
  septemberEquinox: Date;
  decemberSolstice: Date;
} {
  const s = Astronomy.Seasons(year);
  return {
    marchEquinox: s.mar_equinox.date,
    juneSolstice: s.jun_solstice.date,
    septemberEquinox: s.sep_equinox.date,
    decemberSolstice: s.dec_solstice.date,
  };
}

/** Bir yıl içindeki (UTC'ye göre) bütün dolunaylar. */
export function getFullMoonsOfYear(year: number): PrincipalPhase[] {
  return getUpcomingPrincipalPhases(new Date(Date.UTC(year, 0, 1) - 2 * 86_400_000), 60).filter(
    (p) =>
      p.key === "full-moon" &&
      p.date >= new Date(Date.UTC(year, 0, 1) - 3 * 3_600_000) &&
      p.date < new Date(Date.UTC(year + 1, 0, 1) - 3 * 3_600_000),
  );
}

export type SolarEclipseKind = "partial" | "annular" | "total";

export interface SolarEclipse {
  kind: SolarEclipseKind;
  /** Dünya genelinde tutulmanın en derin anı. */
  peak: Date;
  /** Tam ya da halkalı tutulmada, en derin anda gölgenin merkezinin düştüğü yer. */
  centerLatitude?: number;
  centerLongitude?: number;
}

/** Verilen andan sonraki `count` adet güneş tutulması (Dünya geneli). */
export function getUpcomingSolarEclipses(date: Date, count: number): SolarEclipse[] {
  const result: SolarEclipse[] = [];
  let e = Astronomy.SearchGlobalSolarEclipse(date);
  for (let i = 0; i < count; i++) {
    result.push({
      kind: e.kind as SolarEclipseKind,
      peak: e.peak.date,
      centerLatitude: e.latitude,
      centerLongitude: e.longitude,
    });
    e = Astronomy.NextGlobalSolarEclipse(e.peak);
  }
  return result;
}

export interface LocalSolarEclipse {
  kind: SolarEclipseKind;
  /** Güneş diskinin örtülen alan oranı (0-1), en derin anda. */
  obscuration: number;
  begin: Date;
  peak: Date;
  end: Date;
  /** En derin anda Güneş'in ufuktan yüksekliği (derece). Negatifse Güneş batmıştır. */
  peakSunAltitude: number;
  beginSunAltitude: number;
  endSunAltitude: number;
  /** En derin anda ay ile Güneş merkezleri arasındaki açı, Güneş'in görünen yarıçapı cinsinden. */
  peakSeparation: number;
  /** Ayın görünen yarıçapının Güneş'inkine oranı (1'den büyükse ay Güneş'i tamamen örtebilir). */
  moonToSunRadius: number;
}

/**
 * Bir gözlem yerinden görülen, verilen andan sonraki ilk güneş tutulması.
 * Güneş tutulmanın tamamı boyunca ufkun altındaysa da sonuç döner; görünürlüğü yükseklik değerleri gösterir.
 */
export function getLocalSolarEclipse(date: Date, location: GeoLocation): LocalSolarEclipse {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const e = Astronomy.SearchLocalSolarEclipse(date, observer);
  const peak = e.peak.time;
  const sun = Astronomy.Equator(Astronomy.Body.Sun, peak, observer, true, true);
  const moon = Astronomy.Equator(Astronomy.Body.Moon, peak, observer, true, true);
  const sunRadius = Math.atan(695_700 / (sun.dist * Astronomy.KM_PER_AU));
  const moonRadius = Math.atan(1_737.4 / (moon.dist * Astronomy.KM_PER_AU));
  const separation = (Astronomy.AngleBetween(sun.vec, moon.vec) * Math.PI) / 180;
  return {
    kind: e.kind as SolarEclipseKind,
    obscuration: e.obscuration,
    begin: e.partial_begin.time.date,
    peak: e.peak.time.date,
    end: e.partial_end.time.date,
    peakSunAltitude: e.peak.altitude,
    beginSunAltitude: e.partial_begin.altitude,
    endSunAltitude: e.partial_end.altitude,
    peakSeparation: separation / sunRadius,
    moonToSunRadius: moonRadius / sunRadius,
  };
}
