import * as Astronomy from "astronomy-engine";
import { daysBetween, localDayRange } from "./time.ts";

export type PhaseKey =
  | "new-moon"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full-moon"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export const PHASE_NAMES_TR: Record<PhaseKey, string> = {
  "new-moon": "Yeni Ay",
  "waxing-crescent": "Büyüyen Hilal",
  "first-quarter": "İlk Dördün",
  "waxing-gibbous": "Büyüyen Şişkin Ay",
  "full-moon": "Dolunay",
  "waning-gibbous": "Küçülen Şişkin Ay",
  "last-quarter": "Son Dördün",
  "waning-crescent": "Küçülen Hilal",
};

/** astronomy-engine çeyrek numaraları: 0 yeni ay, 1 ilk dördün, 2 dolunay, 3 son dördün. */
const QUARTER_KEYS: PhaseKey[] = ["new-moon", "first-quarter", "full-moon", "last-quarter"];

/** Ortalama kavuşum ayı (iki yeni ay arası), gün. */
export const SYNODIC_MONTH_DAYS = 29.530588;

export interface MoonPhaseInfo {
  key: PhaseKey;
  /** Türkçe evre adı. */
  name: string;
  /** Ay ile Güneş arasındaki ekliptik boylam farkı (0-360). 0 yeni ay, 180 dolunay. */
  phaseAngle: number;
  /** Ay diskinin aydınlık kısmının oranı (0-1). */
  illumination: number;
  /** Son yeni aydan bu yana geçen gün. */
  ageDays: number;
  /** Ay büyüyor mu (yeni aydan dolunaya doğru)? */
  isWaxing: boolean;
}

/**
 * Verilen andaki ay evresi.
 *
 * Ana evreler (yeni ay, ilk dördün, dolunay, son dördün) aslında tek bir andır.
 * Takvimlerde olduğu gibi, o anın düştüğü yerel günün tamamı o evrenin adını alır.
 * Diğer günlerde ad, evre açısına göre belirlenir.
 */
export function getMoonPhase(date: Date, timeZone: string): MoonPhaseInfo {
  const phaseAngle = Astronomy.MoonPhase(date);
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, date).phase_fraction;
  const isWaxing = phaseAngle < 180;

  const previousNewMoon = Astronomy.SearchMoonPhase(0, date, -(SYNODIC_MONTH_DAYS + 2));
  const ageDays = previousNewMoon ? daysBetween(previousNewMoon.date, date) : (phaseAngle / 360) * SYNODIC_MONTH_DAYS;

  const key = principalPhaseOnLocalDay(date, timeZone) ?? intermediatePhase(phaseAngle);

  return { key, name: PHASE_NAMES_TR[key], phaseAngle, illumination, ageDays, isWaxing };
}

function principalPhaseOnLocalDay(date: Date, timeZone: string): PhaseKey | null {
  const { start, end } = localDayRange(date, timeZone);
  const quarter = Astronomy.SearchMoonQuarter(start);
  return quarter.time.date < end ? QUARTER_KEYS[quarter.quarter] : null;
}

function intermediatePhase(phaseAngle: number): PhaseKey {
  if (phaseAngle < 90) return "waxing-crescent";
  if (phaseAngle < 180) return "waxing-gibbous";
  if (phaseAngle < 270) return "waning-gibbous";
  return "waning-crescent";
}

/** Verilen andan sonraki ilk dolunay. */
export function getNextFullMoon(date: Date): Date {
  return searchPhase(180, date);
}

/** Verilen andan sonraki ilk yeni ay. */
export function getNextNewMoon(date: Date): Date {
  return searchPhase(0, date);
}

function searchPhase(targetLon: number, date: Date): Date {
  const time = Astronomy.SearchMoonPhase(targetLon, date, SYNODIC_MONTH_DAYS + 2);
  if (!time) throw new Error(`Ay evresi bulunamadı (${targetLon}°)`);
  return time.date;
}
