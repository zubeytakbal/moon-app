import { buildCalendar } from "@/lib/ics";

/** Ay olayları takvimi (.ics). Takvim uygulamaları bu adrese abone olur; arama motorlarında listelenmez. */
export async function GET() {
  return new Response(await buildCalendar(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="ay-olaylari.ics"',
      "X-Robots-Tag": "noindex",
    },
  });
}
