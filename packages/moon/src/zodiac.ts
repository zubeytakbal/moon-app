import * as Astronomy from "astronomy-engine";

/**
 * Batı astrolojisindeki (tropikal) burçlar. Burçlar ilkbahar ekinoksundan başlayarak ekliptiği
 * 30'ar derecelik eşit parçalara böler; gökyüzündeki takımyıldızlarla aynı değildir.
 */
export const ZODIAC_SIGNS_TR = [
  "Koç",
  "Boğa",
  "İkizler",
  "Yengeç",
  "Aslan",
  "Başak",
  "Terazi",
  "Akrep",
  "Yay",
  "Oğlak",
  "Kova",
  "Balık",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS_TR)[number];

/** Ayın, tarihin gerçek ekinoksuna göre ekliptik boylamı (0-360 derece). */
export function getMoonEclipticLongitude(date: Date): number {
  const lon = Astronomy.EclipticGeoMoon(date).lon;
  return ((lon % 360) + 360) % 360;
}

export interface MoonSign {
  /** 0 Koç ... 11 Balık. */
  index: number;
  name: ZodiacSign;
  /** Burcun içindeki derece (0-30). */
  degree: number;
}

export function getMoonSign(date: Date): MoonSign {
  const lon = getMoonEclipticLongitude(date);
  const index = Math.floor(lon / 30) % 12;
  return { index, name: ZODIAC_SIGNS_TR[index], degree: lon - index * 30 };
}

export interface SignIngress {
  sign: MoonSign;
  /** Ayın bu burca girdiği an. */
  date: Date;
}

/** `from` anından sonra ayın burç değiştirdiği ilk `count` an. */
export function getMoonSignIngresses(from: Date, count: number): SignIngress[] {
  const result: SignIngress[] = [];
  let t = from.getTime();
  let current = getMoonSign(new Date(t)).index;
  const step = 3 * 3_600_000; // Ay bir burçta en az ~2 gün kalır; 3 saatlik adım hiçbir geçişi atlamaz.
  while (result.length < count) {
    const next = t + step;
    const sign = getMoonSign(new Date(next)).index;
    if (sign !== current) {
      // Geçiş anını ikiye bölerek saniye düzeyinde bul.
      let lo = t;
      let hi = next;
      while (hi - lo > 1000) {
        const mid = (lo + hi) / 2;
        if (getMoonSign(new Date(mid)).index === current) lo = mid;
        else hi = mid;
      }
      const date = new Date(hi);
      result.push({ sign: getMoonSign(new Date(hi + 1000)), date });
      current = sign;
    }
    t = next;
  }
  return result;
}

/** Ayın burcuna girdiği son an (verilen andan önceki en yakın burç geçişi). */
export function getCurrentSignIngress(date: Date): SignIngress {
  // Ay bir burçta en fazla ~2,7 gün kalır; 3 gün geriden başlayıp ileri doğru arayalım.
  const ingresses = getMoonSignIngresses(new Date(date.getTime() - 3 * 86_400_000), 3);
  return ingresses.filter((i) => i.date <= date).at(-1)!;
}

/** Ayın gökyüzünde önünde bulunduğu takımyıldızın Latince adı (IAU sınırlarına göre). */
export function getMoonConstellation(date: Date): string {
  const observer = new Astronomy.Observer(0, 0, 0);
  const eq = Astronomy.Equator(Astronomy.Body.Moon, date, observer, false, true);
  return Astronomy.Constellation(eq.ra, eq.dec).name;
}

/** Güneş'in, tarihin gerçek ekinoksuna göre ekliptik boylamından bulunan burcu ("güneş burcu"). */
export function getSunSign(date: Date): MoonSign {
  const lon = ((Astronomy.SunPosition(date).elon % 360) + 360) % 360;
  const index = Math.floor(lon / 30) % 12;
  return { index, name: ZODIAC_SIGNS_TR[index], degree: lon - index * 30 };
}
