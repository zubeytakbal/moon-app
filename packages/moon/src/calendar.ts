import { getMoonPhase, getUpcomingPrincipalPhases, type MoonPhaseInfo, type PrincipalPhase } from "./phase.ts";
import { localDateParts, zonedTimeToUtc } from "./time.ts";

export interface CalendarDay {
  /** Ayın günü (1-31). */
  day: number;
  /** Haftanın günü, pazartesi 0 ... pazar 6. */
  weekday: number;
  /** Günün akşamı (yerel 21:00): evre ve aydınlık oranı bu ana göre verilir. */
  evening: Date;
  phase: MoonPhaseInfo;
  /** O yerel güne düşen ana evre (yeni ay, ilk dördün, dolunay, son dördün) ve tam anı. */
  principal?: PrincipalPhase;
}

/** Yerel saat diliminde bir takvim ayının (ay 1-12) her günü için ay durumu. */
export function getMonthCalendar(year: number, month: number, timeZone: string): CalendarDay[] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthStart = zonedTimeToUtc(year, month, 1, 0, timeZone);
  // Ay içinde en fazla 5 ana evre olabilir; birkaç fazlası güvenli pay bırakır.
  const principals = getUpcomingPrincipalPhases(monthStart, 7);
  const byDay = new Map<number, PrincipalPhase>();
  for (const p of principals) {
    const local = localDateParts(p.date, timeZone);
    if (local.year === year && local.month === month) byDay.set(local.day, p);
  }

  const days: CalendarDay[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const evening = zonedTimeToUtc(year, month, day, 21, timeZone);
    const weekday = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
    days.push({ day, weekday, evening, phase: getMoonPhase(evening, timeZone), principal: byDay.get(day) });
  }
  return days;
}

/** Verilen andan sonra, aynı takvim ayında ikinci kez gerçekleşen ilk dolunay ("mavi ay"). */
export function getNextBlueMoon(date: Date, timeZone: string): PrincipalPhase | null {
  const fullMoons = getUpcomingPrincipalPhases(date, 4 * 13 * 6).filter((p) => p.key === "full-moon");
  for (let i = 1; i < fullMoons.length; i++) {
    const a = localDateParts(fullMoons[i - 1].date, timeZone);
    const b = localDateParts(fullMoons[i].date, timeZone);
    if (a.year === b.year && a.month === b.month) return fullMoons[i];
  }
  return null;
}
