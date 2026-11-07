import { getMoonAltitude, type GeoLocation, type LunarEclipse } from "@moon-app/moon";

/**
 * Ay tutulmasının evreleri ve bir yerden görünürlüğü. Astronomi paketinden başka bir şeye bağlı değildir; tarayıcıda da
 * (İngilizce araç) sunucuda da kullanılır.
 */

const MINUTE = 60_000;

export type LunarPhaseKey = "penumbral" | "partial" | "total";

export interface LunarPhase {
  key: LunarPhaseKey;
  start: number;
  end: number;
}

/** Evreler dıştan içe: yarı gölge, (varsa) parçalı, (varsa) tam. */
export function lunarPhases(e: LunarEclipse): LunarPhase[] {
  const p = e.peak.getTime();
  const sd = e.semiDurationMinutes;
  const list: LunarPhase[] = [{ key: "penumbral", start: p - sd.penumbral * MINUTE, end: p + sd.penumbral * MINUTE }];
  if (sd.partial > 0) list.push({ key: "partial", start: p - sd.partial * MINUTE, end: p + sd.partial * MINUTE });
  if (sd.total > 0) list.push({ key: "total", start: p - sd.total * MINUTE, end: p + sd.total * MINUTE });
  return list;
}

export interface LunarVisibility {
  /** Gözle fark edilen evrenin (parçalı varsa o, yoksa yarı gölge) ay ufkun üstündeyken geçen oranı (0-1). */
  share: number;
  /** Tam evrenin ay ufkun üstündeyken geçen oranı (tam tutulma yoksa 0). */
  totalShare: number;
  /** Tutulma boyunca ayın ufkun üstünde olduğu aralıklar (ms). */
  above: [number, number][];
}

/** 2 dakikalık adımlarla ayın yüksekliğine bakarak tutulmanın bu yerden ne kadarının görüleceği. */
export function lunarVisibility(e: LunarEclipse, location: GeoLocation): LunarVisibility {
  const phases = lunarPhases(e);
  const outer = phases[0];
  const main = phases.find((ph) => ph.key === "partial") ?? outer;
  const total = phases.find((ph) => ph.key === "total");
  const step = 2 * MINUTE;
  let mainUp = 0;
  let mainAll = 0;
  let totalUp = 0;
  let totalAll = 0;
  const above: [number, number][] = [];
  let open: number | null = null;
  for (let t = outer.start; t <= outer.end; t += step) {
    const up = getMoonAltitude(new Date(t), location) > 0;
    if (t >= main.start && t <= main.end) {
      mainAll++;
      if (up) mainUp++;
    }
    if (total && t >= total.start && t <= total.end) {
      totalAll++;
      if (up) totalUp++;
    }
    if (up && open === null) open = t;
    if (!up && open !== null) {
      above.push([open, t]);
      open = null;
    }
  }
  if (open !== null) above.push([open, outer.end]);
  return { share: mainAll ? mainUp / mainAll : 0, totalShare: totalAll ? totalUp / totalAll : 0, above };
}
