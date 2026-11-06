import { getFullMoonsOfYear, localDateParts, type PrincipalPhase } from "@moon-app/moon";
import { nameFullMoons, type FullMoonLabels } from "@/lib/full-moon-names";

/**
 * Dolunayların İngilizce geleneksel adları (The Old Farmer's Almanac'ın Kuzey Amerika listesi). Kurallar Türkçedekiyle
 * aynı: Eylül ekinoksuna en yakın dolunay Harvest Moon, ondan sonraki Hunter's Moon, aynı takvim ayının ikinci
 * dolunayı Blue Moon. Adlar Kuzey Yarımküre mevsimlerine göredir.
 */
export const EN_FULL_MOON_LABELS: FullMoonLabels = {
  monthly: [
    "Wolf Moon",
    "Snow Moon",
    "Worm Moon",
    "Pink Moon",
    "Flower Moon",
    "Strawberry Moon",
    "Buck Moon",
    "Sturgeon Moon",
    "Corn Moon",
    "Hunter's Moon",
    "Beaver Moon",
    "Cold Moon",
  ],
  blue: "Blue Moon",
  harvest: "Harvest Moon",
  hunter: "Hunter's Moon",
};

/** Verilen dolunayların İngilizce adları (anahtar: dolunay anının zaman damgası). Yıl kuralları o yılın bütün dolunaylarına bakar. */
export function englishFullMoonNames(fullMoons: PrincipalPhase[], timeZone: string): Map<number, string> {
  // getFullMoonsOfYear yılı Türkiye saatine göre böler; yılbaşına yakın dolunay kaçmasın diye komşu yıllar da alınır,
  // nameFullMoons sonra her dolunayı seçilen yerin yılına göre gruplar. Aynı dolunay iki kez gelirse tekilleştirilir.
  const years = new Set(fullMoons.flatMap((p) => {
    const y = localDateParts(p.date, timeZone).year;
    return [y - 1, y, y + 1];
  }));
  const seen = new Map<number, PrincipalPhase>();
  for (const y of years) for (const p of getFullMoonsOfYear(y)) seen.set(p.date.getTime(), p);
  const all = [...seen.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
  return nameFullMoons(all, timeZone, EN_FULL_MOON_LABELS);
}
