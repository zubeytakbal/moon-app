import {
  getLocalSolarEclipse,
  getMoonAltitude,
  getMoonDistanceKm,
  getNextBlueMoon,
  getUpcomingLunarEclipses,
  getUpcomingPrincipalPhases,
  type GeoLocation,
} from "@moon-app/moon";
import { getUpcomingEyyamiBiyz } from "@/lib/hijri";
import { PAGES } from "@/lib/pages";
import { SUPERMOON_KM } from "@/lib/supermoon";

export type SkyEventKind = "supermoon" | "lunar-eclipse" | "blood-moon" | "solar-eclipse" | "blue-moon" | "eyyam";

export interface SkyEvent {
  kind: SkyEventKind;
  date: Date;
  title: string;
  detail: string;
  href: string;
}

const DAY_MS = 86_400_000;
const SOLAR_KIND_TR = { partial: "Parçalı", annular: "Halkalı", total: "Tam" } as const;
const NF = new Intl.NumberFormat("tr-TR");

/**
 * Önümüzdeki `years` yıl içindeki öne çıkan gökyüzü olayları, tarih sırasıyla.
 * Görünürlük `location` (varsayılan il) için hesaplanır.
 */
export function getUpcomingSkyEvents(now: Date, location: GeoLocation, years = 3): SkyEvent[] {
  const until = now.getTime() + years * 365.25 * DAY_MS;
  const events: SkyEvent[] = [];

  for (const p of getUpcomingPrincipalPhases(now, Math.ceil(years * 50))) {
    if (p.key !== "full-moon" || p.date.getTime() > until) continue;
    const km = getMoonDistanceKm(p.date);
    if (km < SUPERMOON_KM) {
      events.push({
        kind: "supermoon",
        date: p.date,
        title: "Süper ay",
        detail: `Dolunay Dünya'ya ${NF.format(Math.round(km))} km yakında`,
        href: PAGES.superAy.path,
      });
    }
  }

  for (const e of getUpcomingLunarEclipses(now, 8)) {
    if (e.peak.getTime() > until) break;
    const visible = getMoonAltitude(e.peak, location) > 0;
    const total = e.kind === "total";
    events.push({
      kind: total ? "blood-moon" : "lunar-eclipse",
      date: e.peak,
      title: total
        ? "Kanlı ay (tam ay tutulması)"
        : e.kind === "partial"
          ? "Parçalı ay tutulması"
          : "Yarı gölge ay tutulması",
      detail: `${location.name}: ${visible ? "görülür" : "görülmez"}`,
      href: total ? PAGES.kanliAy.path : PAGES.ayTutulmalari.path,
    });
  }

  let t = now;
  for (let i = 0; i < 4; i++) {
    const e = getLocalSolarEclipse(t, location);
    if (e.peak.getTime() > until) break;
    events.push({
      kind: "solar-eclipse",
      date: e.peak,
      title: `${SOLAR_KIND_TR[e.kind]} güneş tutulması`,
      detail: `${location.name}: Güneş'in %${Math.round(e.obscuration * 100)} kadarı örtülür`,
      href: PAGES.gunesTutulmasi.path,
    });
    t = new Date(e.peak.getTime() + DAY_MS);
  }

  const blue = getNextBlueMoon(now, location.timeZone);
  if (blue && blue.date.getTime() <= until) {
    events.push({
      kind: "blue-moon",
      date: blue.date,
      title: "Mavi ay",
      detail: "Aynı takvim ayındaki ikinci dolunay",
      href: PAGES.ayTakvimi.path,
    });
  }

  const [biyz] = getUpcomingEyyamiBiyz(now, 1, location.timeZone);
  if (biyz) {
    events.push({
      kind: "eyyam",
      date: biyz.days[0].date,
      title: "Eyyam-ı biyz",
      detail: `${biyz.monthName} ayının 13, 14 ve 15. günleri`,
      href: PAGES.eyyamiBiyz.path,
    });
  }

  return events.filter((e) => e.date >= now).sort((a, b) => a.date.getTime() - b.date.getTime());
}
