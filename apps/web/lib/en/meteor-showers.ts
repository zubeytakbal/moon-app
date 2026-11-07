import type { MeteorShower } from "@moon-app/moon";

/**
 * Meteor yağmurlarının İngilizce adları, kaynak cisimleri ve kısa notları (elle yazıldı; IMO 2026 takvimi Tablo 5 ve
 * NASA sayfalarındaki bilgilerden). Sayılar pakette (`METEOR_SHOWERS`), burada yalnız metin.
 */
export const EN_SHOWERS: Record<string, { name: string; parent: string; note: string }> = {
  QUA: {
    name: "Quadrantids",
    parent: "asteroid 2003 EH1",
    note: "Can rival the Geminids, but the peak lasts only a few hours, so it is easy to miss. Cold January nights, best before dawn.",
  },
  LYR: {
    name: "Lyrids",
    parent: "comet Thatcher",
    note: "A modest spring shower with fast, bright meteors; the oldest recorded shower, watched for more than 2,500 years.",
  },
  ETA: {
    name: "Eta Aquariids",
    parent: "Halley's Comet",
    note: "Best from the Southern Hemisphere and the tropics, in the last hours before dawn. Debris from Halley's Comet.",
  },
  SDA: {
    name: "Southern Delta Aquariids",
    parent: "comet 96P/Machholz (probably)",
    note: "Faint meteors in late July, better from the south; it overlaps with the early Perseids.",
  },
  PER: {
    name: "Perseids",
    parent: "comet Swift-Tuttle",
    note: "The favorite of the Northern Hemisphere: warm August nights and many bright meteors. Weak from Australia.",
  },
  DRA: {
    name: "Draconids",
    parent: "comet Giacobini-Zinner",
    note: "Usually only a handful of slow meteors, but it has produced rare outbursts. Unusually, best in the evening.",
  },
  ORI: {
    name: "Orionids",
    parent: "Halley's Comet",
    note: "Halley's Comet again, this time in October. Fast meteors, visible from both hemispheres after midnight.",
  },
  STA: {
    name: "Southern Taurids",
    parent: "comet Encke",
    note: "Few meteors, but a long season and a reputation for slow, bright fireballs.",
  },
  NTA: {
    name: "Northern Taurids",
    parent: "comet Encke",
    note: "The quieter twin of the Southern Taurids, peaking in November; known for occasional fireballs.",
  },
  LEO: {
    name: "Leonids",
    parent: "comet Tempel-Tuttle",
    note: "The fastest meteors of the year. Normally modest, but famous for meteor storms in 1833, 1966 and 1999-2002.",
  },
  GEM: {
    name: "Geminids",
    parent: "asteroid 3200 Phaethon",
    note: "The richest shower of the year and visible from both hemispheres; it starts in the evening, not just after midnight.",
  },
  URS: {
    name: "Ursids",
    parent: "comet Tuttle",
    note: "A small shower around the December solstice, seen only from the Northern Hemisphere.",
  },
};

export const enShowerName = (s: MeteorShower) => EN_SHOWERS[s.code]?.name ?? s.name;

/** Büyük yağmur: güvenilir şekilde saatte 15'ten fazla (değişken olanlar hariç). Türkçe sayfayla aynı kural. */
export const isMajorShower = (s: MeteorShower) => s.zhr >= 15 && !s.variable;

/** Gökyüzü türleri, İngilizce. */
export const EN_SKIES = {
  sehir: { label: "City center", hint: "Street lights; only the brightest stars show" },
  kenar: { label: "Suburbs", hint: "A backyard or a park at the edge of town" },
  koy: { label: "Countryside", hint: "You can make out the Milky Way" },
  karanlik: { label: "Dark site", hint: "50+ miles from the nearest city" },
} as const;

const COMPASS = ["north", "north-northeast", "northeast", "east-northeast", "east", "east-southeast", "southeast", "south-southeast", "south", "south-southwest", "southwest", "west-southwest", "west", "west-northwest", "northwest", "north-northwest"];
export const compassWord = (az: number) => COMPASS[Math.round(az / 22.5) % 16];

/** Saatlik sayı: "<1", "~4". */
export const rateText = (r: number) => (r < 1 ? "<1" : `~${Math.round(r)}`);

/** En iyi saatte şehir kenarı sayısına göre kısa değerlendirme. */
export function verdict(suburbs: number | null): { text: string; tone: string } {
  if (suburbs === null) return { text: "Not visible", tone: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" };
  if (suburbs >= 20) return { text: "Excellent", tone: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" };
  if (suburbs >= 8) return { text: "Good", tone: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200" };
  if (suburbs >= 3) return { text: "Fair", tone: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" };
  return { text: "Poor", tone: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" };
}
