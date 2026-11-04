import * as Astronomy from "astronomy-engine";

/**
 * Tithi (Hindu ay günü): ayın Güneş'ten doğuya doğru 12° uzaklaşması için geçen süre. Bir ay döngüsünde 30 tithi
 * vardır: büyüyen yarı (Shukla paksha) 1-15, 15. Purnima (dolunay); küçülen yarı (Krishna paksha) 16-30,
 * 30. Amavasya (yeni ay). Ayın hızı değiştiği için tithi süresi sabit değildir. Hesap tamamen astronomiktir;
 * bir günün hangi tithi sayılacağı (gün doğumu kuralı vb.) panchang geleneğine bırakılır.
 */

export const TITHI_NAMES = [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
] as const;

export interface Tithi {
  /** 1-30. */
  number: number;
  paksha: "Shukla" | "Krishna";
  /** "Ekadashi", "Purnima", "Amavasya"… */
  name: string;
  start: Date;
  end: Date;
}

export function getTithi(date: Date): Tithi {
  const elongation = Astronomy.MoonPhase(date);
  const index = Math.min(29, Math.floor(elongation / 12));
  const number = index + 1;
  const name = number === 15 ? "Purnima" : number === 30 ? "Amavasya" : TITHI_NAMES[index % 15];
  const start = Astronomy.SearchMoonPhase(index * 12, new Date(date.getTime() - 3 * 86_400_000), 4)!.date;
  const end = Astronomy.SearchMoonPhase(((index + 1) * 12) % 360, date, 3)!.date;
  return { number, paksha: index < 15 ? "Shukla" : "Krishna", name, start, end };
}
