/**
 * Tek etkinlikli takvim bağlantıları (Google Takvim + .ics), tarayıcıda kullanılabilir: `lib/ics.ts` sunucu
 * önbelleğine bağlı olduğu için istemci bileşenleri bu küçük kopyayı kullanır. Saatler evrensel zamanla yazılır;
 * takvim uygulaması kullanıcının saat dilimine çevirir.
 */
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const fold = (line: string) => line.match(/.{1,73}/g)!.join("\r\n ");

export interface TimedEvent {
  uid: string;
  summary: string;
  description: string;
  url: string;
  start: Date;
  end: Date;
}

export function googleCalendarUrl(e: TimedEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.summary,
    dates: `${stamp(e.start)}/${stamp(e.end)}`,
    details: `${e.description}\n\n${e.url}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function icsDataUrl(e: TimedEvent) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lunatlas//EN",
    "BEGIN:VEVENT",
    `UID:${e.uid}@lunatlas.com`,
    `DTSTAMP:${stamp(e.start)}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(e.end)}`,
    fold(`SUMMARY:${esc(e.summary)}`),
    fold(`DESCRIPTION:${esc(`${e.description}\n\n${e.url}`)}`),
    fold(`URL:${e.url}`),
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
