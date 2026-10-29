import { buildBiyzCalendar } from "@/lib/ics";

/** Eyyam-ı biyz takvimi (.ics). Takvim uygulamaları bu adrese abone olur; arama motorlarında listelenmez. */
export async function GET() {
  return new Response(await buildBiyzCalendar(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="eyyam-i-biyz.ics"',
      "X-Robots-Tag": "noindex",
    },
  });
}
