import type { DayLength } from "@moon-app/moon";

/** Yıl verisinin sunucu → tarayıcı taşınması (sunucu da tarayıcı da kullanır; "use client" dosyasında olamaz). */

/** Sunucudan gelen yıl verisi (Date yerine sayı): [öğle, doğuş, batış, gündüz dk, kutup 0 yok / 1 gün / 2 gece]. */
export type SerialDay = [number, number | null, number | null, number, 0 | 1 | 2];
export interface InitialYear {
  year: number;
  placeId: number;
  days: SerialDay[];
}

export function serializeYear(days: DayLength[]): SerialDay[] {
  return days.map((d) => [
    d.noon.getTime(),
    d.rise ? d.rise.getTime() : null,
    d.set ? d.set.getTime() : null,
    d.minutes,
    d.polar === "day" ? 1 : d.polar === "night" ? 2 : 0,
  ]);
}

export function deserializeYear(days: SerialDay[]): DayLength[] {
  return days.map(([noon, rise, set, minutes, polar]) => ({
    noon: new Date(noon),
    rise: rise === null ? null : new Date(rise),
    set: set === null ? null : new Date(set),
    minutes,
    polar: polar === 1 ? "day" : polar === 2 ? "night" : null,
  }));
}

