import { getMoonPhase, zonedTimeToUtc } from "@moon-app/moon";
import { toHijri } from "./hijri-calendar";

export { HIJRI_MONTHS, toHijri, type HijriDate } from "./hijri-calendar";

const DAY_MS = 86_400_000;

export interface BiyzMonth {
  hijriYear: number;
  monthName: string;
  /** Hicri 13, 14 ve 15. günlerin Miladi karşılıkları (öğle vakti). */
  days: { date: Date; hijriDay: number; illumination: number; phaseAngle: number }[];
}

/** Bugünden başlayarak önümüzdeki `count` Hicri ayın eyyam-ı biyz günleri. */
export function getUpcomingEyyamiBiyz(from: Date, count: number, timeZone: string): BiyzMonth[] {
  const result: BiyzMonth[] = [];
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(from);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  // Bugünün tarihinden itibaren gün gün ilerle; içinde bulunulan ayın biyz günleri geçmediyse onlar da dahil.
  // Başta geçmişte kalmış bir ay olabilir, sonda da yarım kalmış bir ay; ikisini de karşılamak için iki fazlasını topla.
  for (let i = -2; i < 31 * (count + 3) && result.length < count + 2; i++) {
    const noon = zonedTimeToUtc(get("year"), get("month"), get("day") + i, 12, timeZone);
    const h = toHijri(noon, timeZone);
    if (h.day < 13 || h.day > 15) continue;
    let entry = result.at(-1);
    if (!entry || entry.monthName !== h.monthName || entry.hijriYear !== h.year) {
      entry = { hijriYear: h.year, monthName: h.monthName, days: [] };
      result.push(entry);
    }
    // Ay, o günün akşamına göre gösterilir (21:00).
    const evening = new Date(noon.getTime() + 9 * 3_600_000);
    const phase = getMoonPhase(evening, timeZone);
    entry.days.push({ date: noon, hijriDay: h.day, illumination: phase.illumination, phaseAngle: phase.phaseAngle });
  }
  // Başında bugünden önce bitmiş bir ay kaldıysa çıkar.
  return result.filter((m) => m.days.at(-1)!.date.getTime() >= from.getTime() - DAY_MS).slice(0, count);
}

/** Bazı ayların eyyam-ı biyz günleri için açıklama (sayfa ve takvim aboneliği kullanır). */
export function biyzNote(m: BiyzMonth): string | null {
  if (m.monthName === "Ramazan") return "Ramazan ayı içinde: bu günler zaten oruçla geçer.";
  if (m.monthName === "Zilhicce")
    return "13 Zilhicce, Kurban Bayramı'nın dördüncü günüdür; bayram günlerinde oruç tutulmaz.";
  return null;
}
