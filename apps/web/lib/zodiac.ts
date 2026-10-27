/** Burç sembolleri (metin olarak gösterilsin diye U+FE0E ile). */
export const ZODIAC_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map(
  (s) => `${s}︎`,
);

/** Astrolojideki geleneksel element grupları. */
export const ZODIAC_ELEMENTS = ["Ateş", "Toprak", "Hava", "Su"] as const;
export const elementOf = (signIndex: number) => ZODIAC_ELEMENTS[signIndex % 4];

/** Ayın önünden geçebildiği takımyıldızların Türkçe adları (IAU Latince adlarından). */
const CONSTELLATIONS_TR: Record<string, string> = {
  Aries: "Koç",
  Taurus: "Boğa",
  Gemini: "İkizler",
  Cancer: "Yengeç",
  Leo: "Aslan",
  Virgo: "Başak",
  Libra: "Terazi",
  Scorpius: "Akrep",
  Sagittarius: "Yay",
  Capricornus: "Oğlak",
  Aquarius: "Kova",
  Pisces: "Balık",
  Ophiuchus: "Yılancı",
  Cetus: "Balina",
  Orion: "Avcı (Orion)",
  Sextans: "Sekstant",
  Auriga: "Arabacı",
  Scutum: "Kalkan",
  Crater: "Kâse",
  Corvus: "Karga",
  Hydra: "Suyılanı",
  Pegasus: "Kanatlı At (Pegasus)",
  Serpens: "Yılan",
};

export const constellationTr = (latin: string) => CONSTELLATIONS_TR[latin] ?? latin;
