import * as Astronomy from "astronomy-engine";
import { getMoonSignIngresses, type MoonSign } from "./zodiac.ts";

/**
 * Boşluktaki ay hesabında ayın açılarına bakılan gök cisimleri. Modern astrolojide yaygın olan
 * küme kullanılır (Uranüs, Neptün ve Plüton dahil); geleneksel astroloji yalnızca Satürn'e kadar bakar.
 */
const BODIES = [
  Astronomy.Body.Sun,
  Astronomy.Body.Mercury,
  Astronomy.Body.Venus,
  Astronomy.Body.Mars,
  Astronomy.Body.Jupiter,
  Astronomy.Body.Saturn,
  Astronomy.Body.Uranus,
  Astronomy.Body.Neptune,
  Astronomy.Body.Pluto,
];

export const BODY_NAMES_TR: Record<string, string> = {
  Sun: "Güneş",
  Mercury: "Merkür",
  Venus: "Venüs",
  Mars: "Mars",
  Jupiter: "Jüpiter",
  Saturn: "Satürn",
  Uranus: "Uranüs",
  Neptune: "Neptün",
  Pluto: "Plüton",
};

/** Ptolemaios açıları: kavuşum, altmışlık, kare, üçgen, karşıt. */
const ASPECTS = [0, 60, 90, 120, 180, 240, 270, 300];

const HOUR_MS = 3_600_000;

/** Yer merkezli ekliptik boylam (J2000 ekliptiği). Açılar farka baktığı için tüm cisimlerde aynı çerçeve yeterlidir. */
function geoLongitude(body: Astronomy.Body, t: number): number {
  const ecl = Astronomy.Ecliptic(Astronomy.GeoVector(body, new Date(t), true));
  return ecl.elon;
}

/** Ay ile cismin boylamlarından, farkın bir açıdan sapması, (-180, 180] aralığında. */
function wrap(moonLon: number, bodyLon: number, aspect: number): number {
  const d = moonLon - bodyLon - aspect;
  return ((((d + 180) % 360) + 360) % 360) - 180;
}

function offset(body: Astronomy.Body, aspect: number, t: number): number {
  return wrap(geoLongitude(Astronomy.Body.Moon, t), geoLongitude(body, t), aspect);
}

export interface LastAspect {
  body: string;
  aspect: number;
  date: Date;
}

/** `end` anından önceki `lookbackHours` saat içinde ayın yaptığı son tam açı. */
export function findLastAspect(end: Date, lookbackHours = 72): LastAspect | null {
  const endT = end.getTime();
  // Konum hesabı pahalıdır: saatlik konumlar her cisim için bir kez hesaplanır, bütün açılar bu tablodan bakılır.
  const times = Array.from({ length: lookbackHours + 1 }, (_, i) => endT - i * HOUR_MS);
  const moon = times.map((t) => geoLongitude(Astronomy.Body.Moon, t));

  // Her cisim ve açı için geriye doğru saat saat bakıp ilk işaret değişimini (en son açıyı) bul; ay her
  // cisimden hızlı olduğu için fark hep artar. Yalnızca en geç saatlik aralığa düşenler son açı olabilir.
  let latest = -Infinity;
  let candidates: { body: Astronomy.Body; aspect: number; lo: number; hi: number }[] = [];
  for (const body of BODIES) {
    const lon = times.map((t) => geoLongitude(body, t));
    for (const aspect of ASPECTS) {
      let fHi = wrap(moon[0], lon[0], aspect);
      for (let step = 1; step <= lookbackHours; step++) {
        const fLo = wrap(moon[step], lon[step], aspect);
        if (fLo < 0 && fHi >= 0 && fHi - fLo < 30) {
          const hi = times[step - 1];
          if (hi > latest) {
            latest = hi;
            candidates = [];
          }
          if (hi === latest) candidates.push({ body, aspect, lo: times[step], hi });
          break;
        }
        fHi = fLo;
      }
    }
  }

  // Aynı saatlik aralıktaki adayların tam anı saniye düzeyinde ikiye bölerek bulunur.
  let best: LastAspect | null = null;
  for (const { body, aspect, lo, hi } of candidates) {
    let a = lo;
    let b = hi;
    while (b - a > 1000) {
      const mid = (a + b) / 2;
      if (offset(body, aspect, mid) < 0) a = mid;
      else b = mid;
    }
    if (!best || b > best.date.getTime())
      best = { body: body as string, aspect: aspect > 180 ? 360 - aspect : aspect, date: new Date(b) };
  }
  return best;
}

export interface VoidOfCourse {
  /** Ayın son açısını yaptığı an: boşluk burada başlar. */
  start: Date;
  /** Ayın yeni burca girdiği an: boşluk burada biter. */
  end: Date;
  lastAspect: LastAspect | null;
  /** Ayın boşluk sırasında bulunduğu burç (boşluk bir önceki burçta başlamışsa onun bitişine kadar). */
  nextSign: MoonSign;
}

/** `from` anından sonra biten ilk `count` boşluk dönemi. */
export function getVoidOfCoursePeriods(from: Date, count: number): VoidOfCourse[] {
  return getMoonSignIngresses(from, count).map((ingress) => {
    const lastAspect = findLastAspect(ingress.date);
    return {
      start: lastAspect ? lastAspect.date : ingress.date,
      end: ingress.date,
      lastAspect,
      nextSign: ingress.sign,
    };
  });
}
