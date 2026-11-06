"use client";

import { useMemo } from "react";
import {
  getFullMoonRise,
  getFullMoonsOfYear,
  getMoonDistanceKm,
  getMoonPhase,
  getMoonPosition,
  getSunAltitude,
  getUpcomingLunarEclipses,
  localDateParts,
  PHASE_NAMES_EN,
  zonedTimeToUtc,
  type LunarEclipse,
  type PrincipalPhase,
} from "@moon-app/moon";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { PlacePicker, usePlaceAndDate } from "@/components/en/PlacePicker";
import { englishFullMoonNames } from "@/lib/en/full-moon-names";
import { placeLabel, type EnPlace } from "@/lib/en/places";
import { SUPERMOON_KM } from "@/lib/supermoon";

/**
 * Full Moon aracı. Her şey tarayıcıda hesaplanır: sunucu (ve Google) New York için hazır HTML görür; ziyaretçinin
 * tarayıcısında şehir cihazın saat diliminden tahmin edilir ya da adresteki ?place= ile açılır. Dolunay anları her
 * yerde aynıdır; yerel tarih/saat, doğuş saati ve yönü yere göre değişir.
 */

const DAY_MS = 86_400_000;
const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const compass = (az: number) => COMPASS[Math.round(az / 22.5) % 16];
const ECLIPSE_WORDS = { penumbral: "Penumbral lunar eclipse", partial: "Partial lunar eclipse", total: "Total lunar eclipse" } as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type Fmt = ReturnType<typeof makeFmt>;

function makeFmt(locale: string, tz: string) {
  const time = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" });
  return {
    time: (d: Date | null) => (d ? time.format(d) : "–"),
    long: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    short: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "short", month: "short", day: "numeric" }),
    zoneName: new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: "short" }),
    number: new Intl.NumberFormat(locale),
  };
}

interface FullMoonRow {
  moon: PrincipalPhase;
  name: string;
  km: number;
  eclipse: LunarEclipse | undefined;
  year: number;
  biggest: boolean;
  smallest: boolean;
}

/** Bir saat diliminde verilen yılların dolunayları: ad, uzaklık, yılın en büyüğü/küçüğü, denk gelen tutulma. */
function fullMoonRows(years: number[], tz: string): FullMoonRow[] {
  const moons = years
    .flatMap((y) => getFullMoonsOfYear(y))
    .filter((p, i, all) => all.findIndex((q) => q.date.getTime() === p.date.getTime()) === i);
  const names = englishFullMoonNames(moons, tz);
  const eclipses = getUpcomingLunarEclipses(new Date(moons[0].date.getTime() - DAY_MS), 10);
  const rows = moons
    .map((moon) => ({
      moon,
      name: names.get(moon.date.getTime()) ?? "Full Moon",
      km: getMoonDistanceKm(moon.date),
      eclipse: eclipses.find((e) => Math.abs(e.peak.getTime() - moon.date.getTime()) < DAY_MS),
      year: localDateParts(moon.date, tz).year,
      biggest: false,
      smallest: false,
    }))
    .filter((r) => years.includes(r.year));
  for (const y of years) {
    const ofYear = rows.filter((r) => r.year === y);
    if (!ofYear.length) continue;
    ofYear.reduce((a, b) => (b.km < a.km ? b : a)).biggest = true;
    ofYear.reduce((a, b) => (b.km > a.km ? b : a)).smallest = true;
  }
  return rows;
}

export function FullMoonExplorer({ initialNow }: { initialNow: string }) {
  const { place, source, now, locale, dateIso, isToday, choose, setDateInput, backToToday } = usePlaceAndDate(initialNow);
  const date = dateIso ? new Date(dateIso) : now;
  const tz = place.timeZone;
  const fmt = useMemo(() => makeFmt(locale, tz), [locale, tz]);
  const local = localDateParts(date, tz);
  const dayKey = `${local.year}-${pad(local.month)}-${pad(local.day)}`;
  const label = placeLabel(place);

  // Bu yıl ve gelecek yıl (seçilen yerin saatiyle).
  const rows = useMemo(() => fullMoonRows([local.year, local.year + 1], tz), [local.year, tz]);
  // Sıradaki dolunay: bugünün tarihi dolunay günüyse o, değilse sonraki.
  const startOfToday = zonedTimeToUtc(local.year, local.month, local.day, 0, tz).getTime();
  const nextIndex = rows.findIndex((r) => r.moon.date.getTime() >= startOfToday);
  const next = rows[nextIndex] ?? rows[rows.length - 1];

  return (
    <div>
      <PlacePicker
        place={place}
        label={label}
        source={source}
        dateKey={dayKey}
        isToday={isToday}
        onPlace={choose}
        onDate={setDateInput}
        onToday={backToToday}
      />
      <AnswerSection next={next} date={date} place={place} fmt={fmt} label={label} isToday={isToday} />
      <WatchSection row={next} place={place} fmt={fmt} label={label} />
      <CalendarSection rows={rows} nextIndex={nextIndex} fmt={fmt} label={label} zone={fmt.zoneName.formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? tz} southern={place.latitude < 0} />
    </div>
  );
}

/* ───────────────────────── Cevap ───────────────────────── */

function Tags({ row }: { row: FullMoonRow }) {
  const tags = [
    row.km < SUPERMOON_KM ? { text: "Supermoon", tone: "bg-amber-300 text-amber-950" } : null,
    row.biggest && row.km >= SUPERMOON_KM ? { text: "Biggest of the year", tone: "bg-amber-100 text-amber-900" } : null,
    row.smallest ? { text: "Micromoon, smallest of the year", tone: "bg-zinc-200 text-zinc-800" } : null,
    row.eclipse ? { text: ECLIPSE_WORDS[row.eclipse.kind], tone: "bg-red-100 text-red-900" } : null,
    row.name === "Blue Moon" ? { text: "Second full moon of the month", tone: "bg-sky-100 text-sky-900" } : null,
  ].filter((t): t is { text: string; tone: string } => t !== null);
  if (!tags.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t.text} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.tone}`}>
          {t.text}
        </span>
      ))}
    </span>
  );
}

function AnswerSection({
  next,
  date,
  place,
  fmt,
  label,
  isToday,
}: {
  next: FullMoonRow;
  date: Date;
  place: EnPlace;
  fmt: Fmt;
  label: string;
  isToday: boolean;
}) {
  const phase = getMoonPhase(date, place.timeZone);
  const pct = Math.round(phase.illumination * 100);
  const sameDay = localDateParts(next.moon.date, place.timeZone);
  const today = localDateParts(date, place.timeZone);
  const isFullToday = sameDay.year === today.year && sameDay.month === today.month && sameDay.day === today.day;
  const days = Math.max(0, Math.ceil((next.moon.date.getTime() - date.getTime()) / DAY_MS));
  const when = isToday ? "tonight" : `on ${fmt.short.format(date)}`;
  const verdict = isFullToday
    ? `Yes. The full moon is ${isToday ? "today" : "on this day"}, exactly at ${fmt.time(next.moon.date)}.`
    : pct >= 97
      ? `Almost. The moon is ${pct}% lit ${when} and looks full; the exact full moon is ${fmt.short.format(next.moon.date)}.`
      : `No. ${isToday ? "Tonight" : "That night"} the moon is a ${PHASE_NAMES_EN[phase.key].toLowerCase()}, ${pct}% lit.`;

  return (
    <section aria-labelledby="next" className="mt-8">
      <h2 id="next" data-toc-label="Next full moon" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        When is the next full moon in {label}?
      </h2>
      <div className="mt-6 grid items-center gap-8 rounded-3xl bg-[#05070d] p-6 text-white sm:p-8 md:grid-cols-[auto_1fr]">
        <div className="mx-auto w-[min(60vw,220px)]">
          <MoonPhaseIcon phaseAngle={180} size={220} glow title={`${next.name}, ${fmt.short.format(next.moon.date)}`} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">Next full moon</p>
          <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{fmt.long.format(next.moon.date)}</p>
          <p className="mt-2 text-xl font-light text-zinc-200">
            {fmt.time(next.moon.date)} local time · {days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}
          </p>
          <p className="mt-3 text-lg">
            <span className="text-zinc-400">Name: </span>
            <span className="font-semibold text-amber-200">{next.name}</span>
          </p>
          <div className="mt-3">
            <Tags row={next} />
          </div>
          <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-zinc-200">
            <span className="font-semibold text-white">Is it a full moon {when}? </span>
            {verdict}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── İzleme ───────────────────────── */

function WatchSection({ row, place, fmt, label }: { row: FullMoonRow; place: EnPlace; fmt: Fmt; label: string }) {
  const info = useMemo(() => {
    const r = getFullMoonRise(row.moon.date, place);
    // Doğuştan sonraki 16 saat: karanlıkta (Güneş −6° altı) en yüksek an.
    let best: { time: Date; alt: number; az: number } | null = null;
    for (let m = 0; m <= 16 * 60; m += 10) {
      const t = new Date(r.rise.getTime() + m * 60_000);
      const pos = getMoonPosition(t, place);
      if (pos.altitude < 0 && m > 60) break;
      if (getSunAltitude(t, place) < -6 && (!best || pos.altitude > best.alt)) best = { time: t, alt: pos.altitude, az: pos.azimuth };
    }
    return { ...r, best };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.moon.date.getTime(), place.latitude, place.longitude, place.timeZone]);

  const gap = info.sunset ? Math.round((info.rise.getTime() - info.sunset.getTime()) / 60_000) : null;
  const gapText =
    gap === null
      ? ""
      : Math.abs(gap) <= 45
        ? `That's ${Math.abs(gap)} minutes ${gap >= 0 ? "after" : "before"} sunset, so the moon comes up in a still-glowing sky: the best moment for photos, when it looks big and orange near the horizon.`
        : gap > 0
          ? `That's ${Math.floor(gap / 60)}h ${pad(gap % 60)}m after sunset, in a dark sky.`
          : `That's before sunset, so the full moon rises in daylight.`;

  return (
    <section aria-labelledby="watch" className="mt-12">
      <h2 id="watch" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        When and where to watch it rise
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        The full moon rises around sunset on the opposite side of the sky from the sun. For {label}:
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Card label="Moonrise" value={fmt.time(info.rise)} sub={`${fmt.short.format(info.rise)} · toward the ${compass(info.azimuth)} (${Math.round(info.azimuth)}°)`} />
        <Card label="Sunset" value={fmt.time(info.sunset)} sub={info.sunset ? fmt.short.format(info.sunset) : "–"} />
        <Card
          label="Highest in the dark"
          value={info.best ? fmt.time(info.best.time) : "–"}
          sub={info.best ? `${Math.round(info.best.alt)}° up, toward the ${compass(info.best.az)}` : "the sky doesn't get dark"}
        />
      </div>
      {gapText && <p className="mt-4 text-zinc-700 dark:text-zinc-300">{gapText}</p>}
      <p className="mt-2 text-sm text-zinc-500">
        Look for a low, clear view in that direction: a beach, a hilltop or the top of a parking garage. Directions are
        from true north (90° is due east).
      </p>
    </section>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-[#05070d] p-4 text-white sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{label}</p>
      <p className="mt-1 text-3xl font-extralight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{sub}</p>
    </div>
  );
}

/* ───────────────────────── Takvim ───────────────────────── */

function CalendarSection({
  rows,
  nextIndex,
  fmt,
  label,
  zone,
  southern,
}: {
  rows: FullMoonRow[];
  nextIndex: number;
  fmt: Fmt;
  label: string;
  zone: string;
  southern: boolean;
}) {
  const years = [...new Set(rows.map((r) => r.year))];
  return (
    <section aria-labelledby="calendar" className="mt-12">
      <h2 id="calendar" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Full moon calendar {years[0]} and {years[1]}
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Every full moon with its date and exact time in {label} ({zone}), its traditional name and anything special about
        it. The moon looks full from the evening before to the evening after.
      </p>
      {years.map((y) => {
        const list = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.year === y);
        return (
          <div key={y} className="mt-6">
            <h3 className="text-lg font-semibold">
              {y}: {list.length} full moons
            </h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
                  <tr>
                    <th className="px-3 py-2.5 font-medium sm:px-4">Date</th>
                    <th className="px-3 py-2.5 font-medium sm:px-4">Time</th>
                    <th className="px-3 py-2.5 font-medium sm:px-4">Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {list.map(({ r, i }) => (
                    <tr
                      key={r.moon.date.getTime()}
                      className={i === nextIndex ? "bg-indigo-50 dark:bg-indigo-950/40" : i < nextIndex ? "text-zinc-400" : undefined}
                    >
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium sm:px-4">
                        <span className="flex items-center gap-2">
                          <MoonPhaseIcon phaseAngle={180} size={24} title="Full moon" southern={southern} />
                          {fmt.short.format(r.moon.date)}
                        </span>
                        {i === nextIndex && <span className="mt-1 block text-xs font-semibold text-indigo-700 dark:text-indigo-300">Next</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums sm:px-4">{fmt.time(r.moon.date)}</td>
                      <td className="px-3 py-2.5 sm:px-4">
                        <span className="font-medium">{r.name}</span>
                        <span className="mt-1 block">
                          <Tags row={r} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}

