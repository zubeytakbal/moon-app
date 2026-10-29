import * as Astronomy from "astronomy-engine";
import type { GeoLocation } from "./location.ts";

/**
 * Meteor yağmurları. Veriler Uluslararası Meteor Örgütü'nün (IMO) "Working List of Visual Meteor Showers"
 * tablosundan (Meteor Shower Calendar 2026, Tablo 5): en yoğun anın Güneş boylamı (λ⊙, J2000.0),
 * saçılma noktası (radyant, J2000.0), saatlik zenit sayısı (ZHR), hız ve nüfus indeksi (r).
 *
 * Yağmurlar her yıl Dünya yörüngesinin aynı noktasında doruğa ulaşır; o yılın tarihi, Güneş'in
 * J2000.0 ekliptik boylamının λ⊙ değerine ulaştığı an olarak hesaplanır. IMO'nun 2026-2027 için
 * açıkladığı saatlerle karşılaştırması testlerde (dakikalar düzeyinde).
 */
export interface MeteorShower {
  /** Sayfadaki çapa ve anahtar, örn. "perseidler". */
  key: string;
  /** IAU kodu, örn. "PER". */
  code: string;
  /** Türkçe adı. */
  name: string;
  /** En yoğun anın Güneş boylamı, derece (J2000.0). */
  peakLongitude: number;
  /** Etkinlik dönemi (ay 1-12, gün). */
  activeFrom: [number, number];
  activeTo: [number, number];
  /** Radyant, derece (J2000.0). */
  radiantRa: number;
  radiantDec: number;
  /** Kusursuz koşullarda saatte görülecek meteor (ZHR). */
  zhr: number;
  /** Yıldan yıla çok değişiyorsa (IMO "Var"). */
  variable?: boolean;
  /** Atmosfere giriş hızı, km/sn. */
  speed: number;
  /** Nüfus indeksi: sönük meteorların oranı (büyükse sönük meteor çok). */
  r: number;
  /** Kaynağı (kuyruklu yıldız ya da asteroit). */
  parent: string;
}

export const METEOR_SHOWERS: readonly MeteorShower[] = [
  { key: "kuadrantidler", code: "QUA", name: "Kuadrantidler", peakLongitude: 283.15, activeFrom: [12, 28], activeTo: [1, 12], radiantRa: 230, radiantDec: 49, zhr: 80, speed: 41, r: 2.1, parent: "2003 EH1 (asteroit)" },
  { key: "liridler", code: "LYR", name: "Liridler", peakLongitude: 32.32, activeFrom: [4, 14], activeTo: [4, 30], radiantRa: 271, radiantDec: 34, zhr: 18, speed: 49, r: 2.1, parent: "C/1861 G1 Thatcher kuyruklu yıldızı" },
  { key: "eta-akuaridler", code: "ETA", name: "Eta Akuaridler", peakLongitude: 45.5, activeFrom: [4, 19], activeTo: [5, 28], radiantRa: 338, radiantDec: -1, zhr: 50, speed: 66, r: 2.4, parent: "1P/Halley kuyruklu yıldızı" },
  { key: "guney-delta-akuaridler", code: "SDA", name: "Güney Delta Akuaridler", peakLongitude: 128, activeFrom: [7, 12], activeTo: [8, 23], radiantRa: 340, radiantDec: -16, zhr: 25, speed: 41, r: 2.5, parent: "96P/Machholz kuyruklu yıldızı (olası)" },
  { key: "perseidler", code: "PER", name: "Perseidler", peakLongitude: 140.0, activeFrom: [7, 17], activeTo: [8, 24], radiantRa: 48, radiantDec: 58, zhr: 100, speed: 59, r: 2.2, parent: "109P/Swift-Tuttle kuyruklu yıldızı" },
  { key: "drakonidler", code: "DRA", name: "Drakonidler", peakLongitude: 195.4, activeFrom: [10, 6], activeTo: [10, 10], radiantRa: 262, radiantDec: 54, zhr: 5, variable: true, speed: 20, r: 2.6, parent: "21P/Giacobini-Zinner kuyruklu yıldızı" },
  { key: "orionidler", code: "ORI", name: "Orionidler", peakLongitude: 208, activeFrom: [10, 2], activeTo: [11, 7], radiantRa: 95, radiantDec: 16, zhr: 20, speed: 66, r: 2.5, parent: "1P/Halley kuyruklu yıldızı" },
  { key: "guney-toridler", code: "STA", name: "Güney Toridler", peakLongitude: 223, activeFrom: [9, 20], activeTo: [11, 20], radiantRa: 52, radiantDec: 15, zhr: 7, speed: 27, r: 2.3, parent: "2P/Encke kuyruklu yıldızı" },
  { key: "kuzey-toridler", code: "NTA", name: "Kuzey Toridler", peakLongitude: 230, activeFrom: [10, 20], activeTo: [12, 10], radiantRa: 58, radiantDec: 22, zhr: 5, speed: 29, r: 2.3, parent: "2P/Encke kuyruklu yıldızı" },
  { key: "leonidler", code: "LEO", name: "Leonidler", peakLongitude: 235.27, activeFrom: [11, 6], activeTo: [11, 30], radiantRa: 152, radiantDec: 22, zhr: 15, speed: 71, r: 2.5, parent: "55P/Tempel-Tuttle kuyruklu yıldızı" },
  { key: "ikizler", code: "GEM", name: "İkizler (Geminidler)", peakLongitude: 262.2, activeFrom: [12, 4], activeTo: [12, 20], radiantRa: 112, radiantDec: 33, zhr: 150, speed: 35, r: 2.6, parent: "3200 Phaethon (asteroit)" },
  { key: "ursidler", code: "URS", name: "Ursidler", peakLongitude: 270.7, activeFrom: [12, 17], activeTo: [12, 26], radiantRa: 217, radiantDec: 76, zhr: 10, speed: 33, r: 2.8, parent: "8P/Tuttle kuyruklu yıldızı" },
];

const DAY_MS = 86_400_000;
const DEG = Math.PI / 180;

/** Güneş'in yer merkezli ekliptik boylamı, J2000.0 ekliptiğine göre (IMO λ⊙ bu sistemde verir). */
export function sunLongitudeJ2000(date: Date): number {
  const v = Astronomy.GeoVector(Astronomy.Body.Sun, date, true);
  const e = Astronomy.RotateVector(Astronomy.Rotation_EQJ_ECL(), v);
  return (Math.atan2(e.y, e.x) / DEG + 360) % 360;
}

/** Bir yağmurun verilen (UTC) yıldaki en yoğun anı. */
export function getShowerPeak(shower: MeteorShower, year: number): Date {
  // λ⊙ ≈ 280° yılbaşına denk gelir; Güneş günde ~0,9856° ilerler. Kaba tahminden Newton adımlarıyla inceltilir.
  let t = Date.UTC(year, 0, 1) + (((shower.peakLongitude - 280 + 360) % 360) / 360) * 365.2422 * DAY_MS;
  for (let i = 0; i < 6; i++) {
    const diff = ((shower.peakLongitude - sunLongitudeJ2000(new Date(t)) + 540) % 360) - 180;
    t += (diff / 0.9856) * DAY_MS;
    if (Math.abs(diff) < 1e-6) break;
  }
  return new Date(t);
}

export interface ShowerPeak {
  shower: MeteorShower;
  peak: Date;
  /** Doruk anında ayın aydınlık oranı (0-1). */
  moonIllumination: number;
}

/** `from` anından sonraki yağmur dorukları, tarih sırasıyla. */
export function getUpcomingMeteorShowers(from: Date, count: number): ShowerPeak[] {
  const year = from.getUTCFullYear();
  const out: ShowerPeak[] = [];
  for (let y = year; y <= year + Math.ceil(count / METEOR_SHOWERS.length) + 1; y++) {
    for (const shower of METEOR_SHOWERS) {
      const peak = getShowerPeak(shower, y);
      if (peak > from) out.push({ shower, peak, moonIllumination: Astronomy.Illumination(Astronomy.Body.Moon, peak).phase_fraction });
    }
  }
  return out.sort((a, b) => a.peak.getTime() - b.peak.getTime()).slice(0, count);
}

/** Gökyüzü karanlığı: yerin en sönük görülebilen yıldız parlaklığı (kadir). */
export const SKY_LIMITING_MAGNITUDE = { sehir: 4.0, kenar: 5.0, koy: 6.0, karanlik: 6.5 } as const;
export type SkyKind = keyof typeof SKY_LIMITING_MAGNITUDE;

/**
 * Saatte görülmesi beklenen meteor sayısı (IMO'nun ZHR tanımının tersi):
 * HR = ZHR · sin(radyant yüksekliği) / r^(6,5 − LM).
 * Ay ufkun üzerindeyse gökyüzü aydınlanır; LM en fazla 6,5 − 2 · (ayın aydınlık oranı) olabilir
 * (dolunayda ~4,5). Kaba bir modeldir; sayfada "tahmin" olarak sunulur.
 */
export function expectedHourlyRate(
  shower: MeteorShower,
  radiantAltitude: number,
  limitingMagnitude: number,
  moon?: { altitude: number; illumination: number },
): number {
  if (radiantAltitude <= 0) return 0;
  let lm = limitingMagnitude;
  if (moon && moon.altitude > 0) lm = Math.min(lm, 6.5 - 2 * moon.illumination);
  return (shower.zhr * Math.sin(radiantAltitude * DEG)) / Math.pow(shower.r, 6.5 - lm);
}

export interface MeteorNightSample {
  time: Date;
  sunAltitude: number;
  radiantAltitude: number;
  moonAltitude: number;
  /** Saatte beklenen meteor, gökyüzü türüne göre (Güneş −12°'nin üzerindeyse 0). */
  rate: Record<SkyKind, number>;
}

export interface MeteorNight {
  shower: MeteorShower;
  peak: Date;
  /** Gecenin başı ve sonu: Güneş ufkun 12° altına indiği/çıktığı an (deniz alacakaranlığı). */
  dusk: Date;
  dawn: Date;
  moonIllumination: number;
  /** Ayın gece boyunca ufkun üzerinde kaldığı dakika. */
  moonUpMinutes: number;
  samples: MeteorNightSample[];
  /** Saatlik sayının (şehir kenarı için) doruğunun en az yarısı olduğu aralık. Radyant hiç doğmuyorsa null. */
  best: { start: Date; end: Date; peakTime: Date; rate: Record<SkyKind, number> } | null;
}

const NIGHT_SUN_DEG = -12;
const STEP_MS = 10 * 60_000;

/**
 * Doruğa en yakın yerel gece için, `location`dan saat saat görünüş: radyant yüksekliği, ay ve beklenen sayılar.
 * Doruk gündüze denk gelse bile en yakın gecenin ortası seçilir (meteorlar doruktan önceki ve sonraki
 * saatlerde de yoğundur).
 */
export function getMeteorNight(shower: MeteorShower, peak: Date, location: GeoLocation): MeteorNight {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  // Doruktan önceki ve sonraki akşamlar; gece ortası doruğa en yakın olan seçilir.
  const candidates: { dusk: Date; dawn: Date }[] = [];
  for (const offset of [-1.5, -0.5, 0.5]) {
    const from = new Date(peak.getTime() + offset * DAY_MS);
    const dusk = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, -1, from, 1, NIGHT_SUN_DEG);
    const dawn = dusk && Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, +1, dusk, 1, NIGHT_SUN_DEG);
    if (dusk && dawn) candidates.push({ dusk: dusk.date, dawn: dawn.date });
  }
  const mid = (n: { dusk: Date; dawn: Date }) => (n.dusk.getTime() + n.dawn.getTime()) / 2;
  const night = candidates.sort((a, b) => Math.abs(mid(a) - peak.getTime()) - Math.abs(mid(b) - peak.getTime()))[0];

  const samples: MeteorNightSample[] = [];
  let moonUp = 0;
  for (let t = night.dusk.getTime(); t <= night.dawn.getTime(); t += STEP_MS) {
    const time = new Date(t);
    const sunEq = Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true);
    const sunAltitude = Astronomy.Horizon(time, observer, sunEq.ra, sunEq.dec, "normal").altitude;
    const radiantAltitude = Astronomy.Horizon(time, observer, shower.radiantRa / 15, shower.radiantDec, "normal").altitude;
    const moonEq = Astronomy.Equator(Astronomy.Body.Moon, time, observer, true, true);
    const moonAltitude = Astronomy.Horizon(time, observer, moonEq.ra, moonEq.dec, "normal").altitude;
    const illumination = Astronomy.Illumination(Astronomy.Body.Moon, time).phase_fraction;
    if (moonAltitude > 0) moonUp += STEP_MS / 60_000;
    const rate = {} as Record<SkyKind, number>;
    for (const kind of Object.keys(SKY_LIMITING_MAGNITUDE) as SkyKind[]) {
      rate[kind] =
        sunAltitude > NIGHT_SUN_DEG
          ? 0
          : expectedHourlyRate(shower, radiantAltitude, SKY_LIMITING_MAGNITUDE[kind], { altitude: moonAltitude, illumination });
    }
    samples.push({ time, sunAltitude, radiantAltitude, moonAltitude, rate });
  }

  const top = samples.reduce((a, b) => (b.rate.kenar > a.rate.kenar ? b : a), samples[0]);
  let best: MeteorNight["best"] = null;
  if (top && top.rate.kenar > 0) {
    const i = samples.indexOf(top);
    let s = i;
    let e = i;
    while (s > 0 && samples[s - 1].rate.kenar >= top.rate.kenar / 2) s--;
    while (e < samples.length - 1 && samples[e + 1].rate.kenar >= top.rate.kenar / 2) e++;
    best = { start: samples[s].time, end: samples[e].time, peakTime: top.time, rate: top.rate };
  }

  return {
    shower,
    peak,
    dusk: night.dusk,
    dawn: night.dawn,
    moonIllumination: Astronomy.Illumination(Astronomy.Body.Moon, peak).phase_fraction,
    moonUpMinutes: Math.round(moonUp),
    samples,
    best,
  };
}
