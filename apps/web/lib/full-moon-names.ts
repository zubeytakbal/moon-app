import {
  getFullMoonsOfYear,
  getSeasons,
  getUpcomingPrincipalPhases,
  localDateParts,
  type PrincipalPhase,
} from "@moon-app/moon";

/**
 * Dolunayların geleneksel adları. Kuzey Amerika kökenlidir (Old Farmer's Almanac geleneği),
 * Türkçeye çevrilerek kullanılır; Türk halk geleneğinden gelen adlar değildir.
 */
export const MONTHLY_FULL_MOON_NAMES = [
  "Kurt Ayı",
  "Kar Ayı",
  "Solucan Ayı",
  "Pembe Ay",
  "Çiçek Ayı",
  "Çilek Ayı",
  "Erkek Geyik Ayı",
  "Mersin Balığı Ayı",
  "Mısır Ayı",
  "Avcı Ayı",
  "Kunduz Ayı",
  "Soğuk Ay",
];

/**
 * Dolunaylara geleneksel adlarını verir. Eylül ekinoksuna en yakın dolunay "Hasat Ayı",
 * ondan sonraki "Avcı Ayı" olur; aynı takvim ayındaki ikinci dolunay "Mavi Ay" diye anılır.
 */
export function nameFullMoons(fullMoons: PrincipalPhase[], timeZone: string): Map<number, string> {
  const names = new Map<number, string>();
  const byYear = new Map<number, PrincipalPhase[]>();
  for (const p of fullMoons) {
    const y = localDateParts(p.date, timeZone).year;
    byYear.set(y, [...(byYear.get(y) ?? []), p]);
  }

  for (const [year, list] of byYear) {
    const equinox = getSeasons(year).septemberEquinox.getTime();
    let harvest: PrincipalPhase | undefined;
    for (const p of list) {
      if (!harvest || Math.abs(p.date.getTime() - equinox) < Math.abs(harvest.date.getTime() - equinox)) harvest = p;
    }
    let previousMonth = -1;
    list.forEach((p, i) => {
      const month = localDateParts(p.date, timeZone).month;
      let name = MONTHLY_FULL_MOON_NAMES[month - 1];
      if (month === previousMonth) name = "Mavi Ay";
      if (p === harvest) name = "Hasat Ayı";
      if (i > 0 && list[i - 1] === harvest) name = "Avcı Ayı";
      names.set(p.date.getTime(), name);
      previousMonth = month;
    });
  }
  return names;
}

/**
 * Bir ana en yakın dolunay (önce ya da sonra), geleneksel adı ve aradaki gün farkı.
 * Doğum dolunayı için kullanılır; Hasat Ayı ve Mavi Ay gibi kurallar o yılın bütün dolunaylarına bakar.
 */
export function nearestNamedFullMoon(date: Date, timeZone: string): { date: Date; name: string | undefined; diffDays: number } {
  const around = getUpcomingPrincipalPhases(new Date(date.getTime() - 20 * 86_400_000), 8).filter(
    (p) => p.key === "full-moon",
  );
  const nearest = around.reduce((a, b) =>
    Math.abs(a.date.getTime() - date.getTime()) < Math.abs(b.date.getTime() - date.getTime()) ? a : b,
  );
  const year = localDateParts(nearest.date, timeZone).year;
  return {
    date: nearest.date,
    name: nameFullMoons(getFullMoonsOfYear(year), timeZone).get(nearest.date.getTime()),
    diffDays: (nearest.date.getTime() - date.getTime()) / 86_400_000,
  };
}
