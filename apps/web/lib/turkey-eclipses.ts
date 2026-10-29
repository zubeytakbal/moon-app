import data from "@/lib/data/turkey-eclipses.json";

/**
 * Türkiye'den önemli ölçüde görülen güneş tutulmaları (1900-2100) ve 81 ildeki görünüşleri.
 * Veri `scripts/turkey-eclipses.ts` ile astronomy-engine'den üretilir; bkz. o dosyadaki açıklama.
 */
export type LocalKind = "partial" | "total" | "annular";

export interface LocalView {
  /** Güneş diskinin örtülen alan oranı (0-1). */
  obscuration: number;
  kind: LocalKind;
  begin: Date;
  peak: Date;
  end: Date;
  /** En derin anda merkezler arası açı, Güneş yarıçapı cinsinden. */
  separation: number;
  /** Ay/Güneş görünen yarıçap oranı. */
  ratio: number;
  /** Tam ya da halkalı evrenin süresi (sn); parçalıda 0. */
  centralSeconds: number;
  /** En derin anda Güneş'in yüksekliği (°). */
  sunAltitude: number;
}

export interface TurkeyEclipse {
  /** "YYYY-MM-DD", Dünya genelinde en derin anın evrensel zamana göre günü. */
  id: string;
  peak: Date;
  globalKind: string;
  /** İl sırası `PROVINCE_SLUGS` ile aynıdır; il görmüyorsa null. */
  local: (LocalView | null)[];
}

type Raw = [number, string, number, number, number, number, number, number, number];
const KIND: Record<string, LocalKind> = { p: "partial", t: "total", a: "annular" };

export const PROVINCE_SLUGS: string[] = data.provinces;

export const TURKEY_ECLIPSES: TurkeyEclipse[] = data.eclipses.map((e) => ({
  id: e.peak.slice(0, 10),
  peak: new Date(e.peak),
  globalKind: e.kind,
  local: (e.local as (Raw | 0)[]).map((l) =>
    l === 0
      ? null
      : {
          obscuration: l[0] / 1000,
          kind: KIND[l[1]],
          begin: new Date(l[2] * 1000),
          peak: new Date(l[3] * 1000),
          end: new Date(l[4] * 1000),
          separation: l[5] / 1000,
          ratio: l[6] / 1000,
          centralSeconds: l[7],
          sunAltitude: l[8],
        },
  ),
}));

/** Bir ilden "önemli" görünen tutulma: Güneş ufkun üzerinde ve örtülme %40'ı geçiyor ya da tam/halkalı. */
export function isNotable(v: LocalView | null): v is LocalView {
  return !!v && v.sunAltitude > 0 && (v.obscuration >= 0.4 || v.kind !== "partial");
}

/** Bir tutulmanın tam ya da halkalı görüldüğü iller (il sırası korunur). */
export function centralProvinces(e: TurkeyEclipse): number[] {
  return e.local.flatMap((v, i) => (v && v.kind !== "partial" && v.sunAltitude > 0 ? [i] : []));
}

/** "2 dakika 9 saniye" */
export function durationText(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s} saniye`;
  return s === 0 ? `${m} dakika` : `${m} dakika ${s} saniye`;
}
