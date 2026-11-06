import { cacheLife } from "next/cache";
import { getFullMoonsOfYear, getMoonDistanceKm, getUpcomingLunarEclipses, localDateParts } from "@moon-app/moon";
import { englishFullMoonNames } from "@/lib/en/full-moon-names";
import { EN_PAGES } from "@/lib/en/pages";
import { escapeText, fold } from "@/lib/ics";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { siteConfig } from "@/site.config";

/** İngilizce dolunay takviminin adresi (abonelik). */
export const EN_FULL_MOON_CALENDAR_PATH = "/en/calendar/full-moons.ics";

const DAY_MS = 86_400_000;
/** Adlar Kuzey Amerika geleneğinden geldiği için ay sınırları New York saatine göre belirlenir. */
const NAME_ZONE = "America/New_York";

const ECLIPSE_WORDS = { penumbral: "penumbral lunar eclipse", partial: "partial lunar eclipse", total: "total lunar eclipse" } as const;

function utc(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Dolunay takvimi (.ics): 35 gün geriden 2 yıl ileriye her dolunay, tam anında başlayan 1 saatlik etkinlik. Saatler
 * evrensel zamanla yazılır; takvim uygulaması her kullanıcıya kendi saatiyle gösterir. Günde bir yenilenir.
 */
export async function buildEnFullMoonCalendar(): Promise<string> {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const from = now.getTime() - 35 * DAY_MS;
  const to = now.getTime() + 2 * 365 * DAY_MS;
  const y = localDateParts(now, NAME_ZONE).year;
  const moons = [y - 1, y, y + 1, y + 2]
    .flatMap((year) => getFullMoonsOfYear(year))
    .filter((p, i, all) => all.findIndex((q) => q.date.getTime() === p.date.getTime()) === i)
    .filter((p) => p.date.getTime() >= from && p.date.getTime() <= to);
  const names = englishFullMoonNames(moons, NAME_ZONE);
  const eclipses = getUpcomingLunarEclipses(new Date(from), 8);
  const url = new URL(EN_PAGES.fullMoon.path, siteConfig.url).toString();
  const host = new URL(siteConfig.url).hostname;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${siteConfig.name}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`Full moons (${siteConfig.name})`)}`,
    "X-WR-CALDESC:Every full moon with its traditional name\\, supermoons and lunar eclipses.",
    "REFRESH-INTERVAL;VALUE=DURATION:P1D",
    "X-PUBLISHED-TTL:P1D",
  ];
  for (const p of moons) {
    const name = names.get(p.date.getTime()) ?? "Full Moon";
    const km = getMoonDistanceKm(p.date);
    const eclipse = eclipses.find((e) => Math.abs(e.peak.getTime() - p.date.getTime()) < DAY_MS);
    const extras = [km < SUPERMOON_KM ? "supermoon" : null, eclipse ? ECLIPSE_WORDS[eclipse.kind] : null].filter(Boolean);
    const summary = `Full Moon: ${name}${extras.length ? ` (${extras.join(", ")})` : ""}`;
    const description = `The exact moment of the full moon. The moon looks full from the evening before to the evening after. Distance: ${Math.round(km).toLocaleString("en-US")} km.\n\nMoonrise for your city: ${url}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:full-moon-${utc(p.date)}@${host}`,
      `DTSTAMP:${utc(now)}`,
      `DTSTART:${utc(p.date)}`,
      `DTEND:${utc(new Date(p.date.getTime() + 3_600_000))}`,
      fold(`SUMMARY:${escapeText(summary)}`),
      fold(`DESCRIPTION:${escapeText(description)}`),
      fold(`URL:${url}`),
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR", "");
  return lines.join("\r\n");
}
