import { cacheLife } from "next/cache";
import { findProvince, getDarkNight, getMoonPhase, localDateParts, zonedTimeToUtc } from "@moon-app/moon";
import { AddToCalendar } from "@/components/AddToCalendar";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { icsTime } from "@/lib/ics";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const NIGHTS = 14;
/** Çizelgenin yerel saat aralığı: akşam 17:00'den sabah 08:00'e (15 saat). */
const AXIS_FROM_HOUR = 17;
const AXIS_HOURS = 15;
const HOUR_MS = 3_600_000;

function durationText(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} dk`;
  return m === 0 ? `${h} sa` : `${h} sa ${m} dk`;
}

/**
 * Yıldız gözlemi için önümüzdeki 14 gecenin tam karanlık saatleri (Güneş 18° altında, ay ufkun
 * altında), seçilen ile göre. Saatte bir yenilenir.
 */
export async function DarkNights({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = findProvince(slug) ?? siteConfig.defaultLocation;
  const timeZone = city.timeZone;
  const today = localDateParts(new Date(), timeZone);
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const dayLabel = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "short" });
  const weekday = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, weekday: "short" });
  const longDay = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", weekday: "long" });

  const nights = Array.from({ length: NIGHTS }, (_, i) => {
    const noon = zonedTimeToUtc(today.year, today.month, today.day + i, 12, timeZone);
    const axisStart = zonedTimeToUtc(today.year, today.month, today.day + i, AXIS_FROM_HOUR, timeZone).getTime();
    const night = getDarkNight(noon, city);
    const phase = getMoonPhase(new Date(noon.getTime() + 12 * HOUR_MS), timeZone);
    const length = night.dusk && night.dawn ? (night.dawn.getTime() - night.dusk.getTime()) / 60_000 : 0;
    return { noon, axisStart, night, phase, length };
  });
  const best = nights.reduce((a, b) => (b.night.minutes > a.night.minutes ? b : a));
  const bestSpan = best.night.dark.reduce(
    (a, b) => (b.end.getTime() - b.start.getTime() > a.end.getTime() - a.start.getTime() ? b : a),
    best.night.dark[0],
  );
  const pos = (t: number, axisStart: number) =>
    Math.min(100, Math.max(0, ((t - axisStart) / (AXIS_HOURS * HOUR_MS)) * 100));
  const ticks = [17, 20, 23, 2, 5, 8];

  return (
    <>
      <ol className="mt-6 space-y-2">
        <li className="grid grid-cols-[4.25rem_1fr_5rem] items-end gap-3 text-xs tabular-nums text-zinc-500 sm:grid-cols-[7.5rem_1fr_6rem]">
          <span />
          <span className="flex justify-between" aria-hidden="true">
            {ticks.map((h) => (
              <span key={h}>{String(h).padStart(2, "0")}</span>
            ))}
          </span>
          <span className="text-right">Karanlık</span>
        </li>
        {nights.map(({ noon, axisStart, night, phase, length }) => {
          const great = night.minutes > 0 && night.minutes >= length * 0.9;
          return (
            <li
              key={noon.toISOString()}
              className="grid grid-cols-[4.25rem_1fr_5rem] items-center gap-3 sm:grid-cols-[7.5rem_1fr_6rem]"
            >
              <span className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={20} title={phase.name} />
                <span className="whitespace-nowrap leading-tight">
                  {dayLabel.format(noon)}
                  <span className="hidden sm:inline"> {weekday.format(noon)}</span>
                </span>
              </span>
              <span
                className="relative h-6 overflow-hidden rounded-md bg-sky-900/40"
                role="img"
                aria-label={
                  night.dark.length
                    ? `Karanlık: ${night.dark.map((d) => `${time.format(d.start)}-${time.format(d.end)}`).join(", ")}`
                    : "Bu gece tam karanlık yok"
                }
              >
                {night.dusk && night.dawn && (
                  <span
                    className="absolute inset-y-0 bg-[#141a33]"
                    style={{
                      left: `${pos(night.dusk.getTime(), axisStart)}%`,
                      width: `${pos(night.dawn.getTime(), axisStart) - pos(night.dusk.getTime(), axisStart)}%`,
                    }}
                  />
                )}
                {night.dark.map((d) => (
                  <span
                    key={d.start.toISOString()}
                    className="absolute inset-y-1 rounded bg-indigo-400"
                    style={{
                      left: `${pos(d.start.getTime(), axisStart)}%`,
                      width: `${pos(d.end.getTime(), axisStart) - pos(d.start.getTime(), axisStart)}%`,
                    }}
                  />
                ))}
              </span>
              <span className={`whitespace-nowrap text-right text-xs tabular-nums sm:text-sm ${night.minutes ? "text-white" : "text-zinc-500"}`}>
                {night.minutes ? durationText(night.minutes) : "yok"}
                {great && <span className="ml-1 text-amber-300">★</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-indigo-400" /> Tam karanlık, ay batmış
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-[#141a33] ring-1 ring-white/10" /> Astronomik gece, ay ufukta
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-sky-900/60" /> Alacakaranlık ya da gündüz
        </span>
        <span>★ Gecenin neredeyse tamamı karanlık</span>
      </p>

      {bestSpan && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-indigo-300/30 bg-indigo-400/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-200/80">
              Önümüzdeki iki haftanın en karanlık gecesi ({city.name})
            </p>
            <p className="mt-1 text-xl font-semibold">{longDay.format(best.noon)} gecesi</p>
            <p className="text-zinc-300">
              {time.format(bestSpan.start)} – {time.format(bestSpan.end)} · toplam {durationText(best.night.minutes)}
            </p>
          </div>
          <AddToCalendar
            fileName={`karanlik-gece-${best.noon.toISOString().slice(0, 10)}.ics`}
            event={{
              uid: `karanlik-gece-${best.noon.toISOString().slice(0, 10)}-${city.slug}`,
              summary: "Yıldız gözlemi: karanlık gece",
              description: `Gökyüzü tamamen karanlık ve ay ufkun altında (${city.name}). Şehir ışıklarından uzak bir yer seçin; gözlerin karanlığa alışması 20-30 dakika sürer.`,
              url: new URL(PAGES.yeniAy.path, siteConfig.url).toString(),
              start: icsTime(bestSpan.start),
              end: icsTime(bestSpan.end),
            }}
          />
        </div>
      )}
    </>
  );
}
