import * as Astronomy from "astronomy-engine";
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
