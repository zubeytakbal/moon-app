import { buildSingleEventIcs, googleCalendarLink } from "@/lib/ics";

export interface CalendarEventInput {
  uid: string;
  summary: string;
  description: string;
  url: string;
  /** Tüm gün: "YYYYMMDD"; saatli: `icsTime(date)`. */
  start: string;
  end: string;
}

/** "Google Takvim" ve "Takvime ekle (.ics)" düğmeleri. JavaScript gerekmez; koyu zemin içindir. */
export function AddToCalendar({ event, fileName }: { event: CalendarEventInput; fileName: string }) {
  const ics = buildSingleEventIcs(event);
  const button =
    "rounded-full border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:border-white/30 hover:text-white";
  return (
    <div className="flex flex-wrap gap-2">
      <a href={googleCalendarLink(event)} target="_blank" rel="noopener nofollow" className={button}>
        Google Takvim
      </a>
      <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`} download={fileName} className={button}>
        Takvime ekle (.ics)
      </a>
    </div>
  );
}
