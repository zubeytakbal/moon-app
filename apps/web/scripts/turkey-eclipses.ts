/**
 * Tutulma Zaman Makinesi'nin veri dosyasını üretir: 1900-2100 arasında Türkiye'den önemli ölçüde görülen
 * güneş tutulmaları ve her birinin 81 ildeki görünüşü.
 *
 * Çalıştırma (kökten): node apps/web/scripts/turkey-eclipses.ts
 * Çıktı: apps/web/lib/data/turkey-eclipses.json (elle değiştirilmez, gerekirse bu betik yeniden çalıştırılır).
 *
 * Bir tutulma listeye, en az bir ilde Güneş en derin anda ufkun üzerindeyken örtülme %40'ı geçiyorsa ya da
 * tam/halkalı evre görülüyorsa girer. Her il için o ildeki görünüş saklanır (görülmüyorsa 0).
 */
import { writeFileSync } from "node:fs";
import {
  getLocalSolarEclipse,
  getUpcomingSolarEclipses,
  TURKEY_PROVINCES,
  type LocalSolarEclipse,
} from "../../../packages/moon/src/index.ts";

const FROM = new Date(Date.UTC(1900, 0, 1));
const UNTIL = new Date(Date.UTC(2101, 0, 1));
const DAY = 86_400_000;
/** Ön eleme için Türkiye'nin uç illeri: hiçbirinden görülmeyen tutulma atlanır. */
const PROBES = ["edirne", "hakkari", "sinop", "hatay", "mugla", "kars", "kirsehir"];

function localFor(peak: Date, slug: string): LocalSolarEclipse | null {
  const p = TURKEY_PROVINCES.find((x) => x.slug === slug)!;
  const e = getLocalSolarEclipse(new Date(peak.getTime() - 2 * DAY), p);
  // Yerel arama bir sonraki tutulmayı bulur; bu tutulma değilse burada görülmüyordur.
  return Math.abs(e.peak.getTime() - peak.getTime()) < DAY ? e : null;
}

const notable = (e: LocalSolarEclipse | null) =>
  !!e && e.peakSunAltitude > 0 && (e.obscuration >= 0.4 || e.centralSeconds > 0);

const all = getUpcomingSolarEclipses(FROM, 520).filter((e) => e.peak < UNTIL);
const eclipses: unknown[] = [];
for (const g of all) {
  if (!PROBES.some((slug) => notable(localFor(g.peak, slug)))) continue;
  const local = TURKEY_PROVINCES.map((p) => localFor(g.peak, p.slug));
  if (!local.some(notable)) continue;
  eclipses.push({
    peak: g.peak.toISOString(),
    kind: g.kind,
    // İl başına: [örtülme ‰, tür (p/t/a), başlangıç, en derin, bitiş (Unix saniye), merkez ayrılığı ×1000,
    //             ay/Güneş yarıçap oranı ×1000, tam/halkalı süre (sn), en derin anda Güneş yüksekliği (°)]; görülmüyorsa 0.
    local: local.map((e) =>
      e && e.peakSunAltitude > -1
        ? [
            Math.round(e.obscuration * 1000),
            e.kind[0],
            Math.round(e.begin.getTime() / 1000),
            Math.round(e.peak.getTime() / 1000),
            Math.round(e.end.getTime() / 1000),
            Math.round(e.peakSeparation * 1000),
            Math.round(e.moonToSunRadius * 1000),
            Math.round(e.centralSeconds),
            Math.round(e.peakSunAltitude),
          ]
        : 0,
    ),
  });
  process.stdout.write(`${g.peak.toISOString().slice(0, 10)} `);
}

const out = { generated: new Date().toISOString().slice(0, 10), provinces: TURKEY_PROVINCES.map((p) => p.slug), eclipses };
writeFileSync(new URL("../lib/data/turkey-eclipses.json", import.meta.url), JSON.stringify(out));
console.log(`\n${eclipses.length} tutulma yazıldı.`);
