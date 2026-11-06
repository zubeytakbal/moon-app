import { buildEnFullMoonCalendar } from "@/lib/en/ics";

/** Dolunay takvimi (.ics). Takvim uygulamaları bu adrese abone olur; arama motorlarında listelenmez. */
export async function GET() {
  return new Response(await buildEnFullMoonCalendar(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="full-moons.ics"',
      "X-Robots-Tag": "noindex",
    },
  });
}
