import { cacheLife } from "next/cache";
import {
  getFullMoonsOfYear,
  getLocalSolarEclipse,
  getMoonAltitude,
  getMoonDistanceKm,
  getUpcomingLunarEclipses,
  getUpcomingPrincipalPhases,
  localDateParts,
} from "@moon-app/moon";
import { nameFullMoons } from "@/lib/full-moon-names";
import { PAGES } from "@/lib/pages";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { siteConfig } from "@/site.config";

/** Takvim dosyasının yayımlandığı adres. Abonelik bağlantıları buradan üretilir. */
export const CALENDAR_PATH = "/takvim/ay-olaylari.ics";

const DAY_MS = 86_400_000;
const location = siteConfig.defaultLocation;
const timeZone = location.timeZone;
const NF = new Intl.NumberFormat("tr-TR");
const TIME = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

interface CalendarEvent {
  uid: string;
  summary: string;
  description: string;
  url: string;
  /** Tüm gün etkinliği: Türkiye'deki tarih. Yoksa `start`-`end` saatli etkinlik. */
  day?: Date;
  start?: Date;
  end?: Date;
}

/** iCalendar metin alanı kaçışları (RFC 5545). */
function escapeText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** 75 baytı aşan satırları böler; Türkçe harfler UTF-8'de 2 bayt olduğu için bayt sayılır. */
function fold(line: string) {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  for (const ch of line) {
    if (encoder.encode(current + ch).length > (out.length ? 74 : 75)) {
      out.push(current);
      current = ch;
    } else current += ch;
  }
  out.push(current);
  return out.join("\r\n ");
}

function utcStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function localDay(date: Date, plusDays = 0) {
  const { year, month, day } = localDateParts(date, timeZone);
  const d = new Date(Date.UTC(year, month - 1, day + plusDays));
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function abs(path: string) {
  return new URL(path, siteConfig.url).toString();
}

function collectEvents(now: Date): CalendarEvent[] {
  const from = new Date(now.getTime() - 35 * DAY_MS);
  const until = new Date(now.getTime() + 2 * 365.25 * DAY_MS);
  const events: CalendarEvent[] = [];

  // Dolunay adları yılın bütün dolunaylarına bakılarak verilir (Hasat Ayı, Mavi Ay).
  const years = [from.getUTCFullYear(), from.getUTCFullYear() + 1, from.getUTCFullYear() + 2];
  const names = nameFullMoons(years.flatMap(getFullMoonsOfYear), timeZone);

  for (const p of getUpcomingPrincipalPhases(from, 120)) {
    if (p.date > until) break;
    if (p.key === "full-moon") {
      const km = getMoonDistanceKm(p.date);
      const supermoon = km < SUPERMOON_KM;
      const name = names.get(p.date.getTime());
      events.push({
        uid: `dolunay-${utcStamp(p.date)}`,
        day: p.date,
        summary: `🌕 Dolunay ${TIME.format(p.date)}${name ? ` · ${name}` : ""}${supermoon ? " · Süper ay" : ""}`,
        description: `Dolunay anı: ${TIME.format(p.date)} (Türkiye saati). Ay-Dünya uzaklığı ${NF.format(Math.round(km))} km.${
          supermoon ? " Yılın en yakın dolunaylarından biri: süper ay." : ""
        }`,
        url: abs(PAGES.dolunay.path),
      });
    } else if (p.key === "new-moon") {
      events.push({
        uid: `yeniay-${utcStamp(p.date)}`,
        day: p.date,
        summary: `🌑 Yeni ay ${TIME.format(p.date)}`,
        description: `Yeni ay anı: ${TIME.format(p.date)} (Türkiye saati). Ay görünmez; yıldız gözlemi için en karanlık günler.`,
        url: abs(PAGES.yeniAy.path),
      });
    }
  }

  for (const e of getUpcomingLunarEclipses(from, 6)) {
    if (e.peak > until) break;
    const half = e.semiDurationMinutes.partial || e.semiDurationMinutes.penumbral;
    const start = new Date(e.peak.getTime() - half * 60_000);
    const end = new Date(e.peak.getTime() + half * 60_000);
    const visible = getMoonAltitude(e.peak, location) > 0;
    const title =
      e.kind === "total"
        ? "Tam ay tutulması (kanlı ay)"
        : e.kind === "partial"
          ? "Parçalı ay tutulması"
          : "Yarı gölge ay tutulması";
    events.push({
      uid: `aytutulmasi-${utcStamp(e.peak)}`,
      start,
      end,
      summary: `🔴 ${title}`,
      description: `En derin an ${TIME.format(e.peak)} (Türkiye saati). ${location.name}: ${
        visible ? "en derin anda ay ufkun üstünde" : "en derin anda ay ufkun altında, görülmez"
      }.`,
      url: abs(e.kind === "total" ? PAGES.kanliAy.path : PAGES.ayTutulmalari.path),
    });
  }

  // Güneş tutulmaları: yalnız varsayılan konumdan görülenler.
  let t = from;
  for (let i = 0; i < 6; i++) {
    const e = getLocalSolarEclipse(t, location);
    if (e.peak > until) break;
    if (e.peakSunAltitude > 0 && e.obscuration > 0) {
      events.push({
        uid: `gunestutulmasi-${utcStamp(e.peak)}`,
        start: e.begin,
        end: e.end,
        summary: `☀️ Güneş tutulması · ${location.name} %${Math.round(e.obscuration * 100)}`,
        description: `${location.name}: ${TIME.format(e.begin)} başlar, ${TIME.format(e.peak)} en derin, ${TIME.format(
          e.end,
        )} biter. Güneş'e asla korumasız bakmayın; yalnız sertifikalı tutulma gözlüğü güvenlidir.`,
        url: abs(PAGES.gunesTutulmasi.path),
      });
    }
    t = new Date(e.peak.getTime() + DAY_MS);
  }

  return events.sort((a, b) => ((a.day ?? a.start)!.getTime() - (b.day ?? b.start)!.getTime()));
}

/**
 * Önümüzdeki iki yılın ay olayları, iCalendar biçiminde. Takvim uygulamaları aboneliği günde bir
 * yeniler; böylece kullanıcının takvimi hep güncel kalır, yeni sayfa da oluşmaz.
 */
export async function buildCalendar(): Promise<string> {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const stamp = utcStamp(now);
  const host = new URL(siteConfig.url).hostname;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${siteConfig.name}//Ay olayları//TR`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`Ay olayları (${siteConfig.name})`)}`,
    "X-WR-CALDESC:Dolunay\\, yeni ay\\, ay ve güneş tutulmaları. Türkiye saati.",
    "X-WR-TIMEZONE:Europe/Istanbul",
    "REFRESH-INTERVAL;VALUE=DURATION:P1D",
    "X-PUBLISHED-TTL:P1D",
  ];
  for (const e of collectEvents(now)) {
    lines.push("BEGIN:VEVENT", `UID:${e.uid}@${host}`, `DTSTAMP:${stamp}`);
    if (e.day) lines.push(`DTSTART;VALUE=DATE:${localDay(e.day)}`, `DTEND;VALUE=DATE:${localDay(e.day, 1)}`, "TRANSP:TRANSPARENT");
    else lines.push(`DTSTART:${utcStamp(e.start!)}`, `DTEND:${utcStamp(e.end!)}`);
    lines.push(
      `SUMMARY:${escapeText(e.summary)}`,
      `DESCRIPTION:${escapeText(`${e.description}\n\nAyrıntı: ${e.url}`)}`,
      `URL:${e.url}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
