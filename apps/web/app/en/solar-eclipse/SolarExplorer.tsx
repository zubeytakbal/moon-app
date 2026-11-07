"use client";

import { useEffect, useMemo, useState } from "react";
import { getLocalSolarEclipse, localDateParts, type LocalSolarEclipse } from "@moon-app/moon";
import { EclipseDisc } from "@/components/EclipseDisc";
import { PlacePicker, usePlaceAndDate } from "@/components/en/PlacePicker";
import { placeLabel, type EnPlace } from "@/lib/en/places";

/**
 * Solar Eclipse aracı. Her şey tarayıcıda hesaplanır: sunucu (ve Google) New York için hazır HTML görür; ziyaretçinin
 * tarayıcısında şehir cihazın saat diliminden tahmin edilir ya da adresteki ?place= ile açılır. Seçilen yerden
 * görülecek sıradaki 3 güneş tutulması ve sıradaki tam tutulmanın yılı.
 */

const DAY_MS = 86_400_000;
const LAST_YEAR = 2100;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Güneş tutulmanın herhangi bir evresinde ufkun üstündeyse görülebilir sayılır. */
function visible(e: LocalSolarEclipse) {
  return e.obscuration > 0.001 && (e.beginSunAltitude > 0 || e.peakSunAltitude > 0 || e.endSunAltitude > 0);
}

/** Sıradaki `count` görülebilir tutulma. */
function nextVisible(from: Date, place: EnPlace, count: number): LocalSolarEclipse[] {
  const out: LocalSolarEclipse[] = [];
  let t = from;
  for (let i = 0; i < 40 && out.length < count; i++) {
    const e = getLocalSolarEclipse(t, place);
    if (localDateParts(e.peak, "UTC").year > LAST_YEAR) break;
    if (visible(e)) out.push(e);
    t = new Date(e.peak.getTime() + DAY_MS);
  }
  return out;
}

function kindAtPlace(e: LocalSolarEclipse) {
  if (e.centralSeconds > 0) return e.kind === "annular" ? "Annular" : "Total";
  return "Partial";
}

function duration(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}m ${pad(s % 60)}s`;
}

function horizonNote(e: LocalSolarEclipse): string | null {
  if (e.peakSunAltitude < 0 && e.endSunAltitude > 0) return "The eclipse is already under way at sunrise.";
  if (e.peakSunAltitude < 0) return "The sun sets before the deepest moment; only the start is visible.";
  if (e.beginSunAltitude < 0) return "The eclipse is already under way at sunrise.";
  if (e.endSunAltitude < 0) return "The sun sets before the eclipse ends.";
  if (e.peakSunAltitude < 10) return "The sun is low in the sky; you'll need a clear view of the horizon.";
  return null;
}

export function SolarExplorer({ initialNow }: { initialNow: string }) {
  const { place, source, now, locale, dateIso, isToday, choose, setDateInput, backToToday } = usePlaceAndDate(initialNow);
  const date = dateIso ? new Date(dateIso) : now;
  const tz = place.timeZone;
  const local = localDateParts(date, tz);
  const dayKey = `${local.year}-${pad(local.month)}-${pad(local.day)}`;
  const label = placeLabel(place);

  const fmt = useMemo(() => {
    const time = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" });
    return {
      time: (d: Date) => time.format(d),
      long: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    };
  }, [locale, tz]);

  const startKey = Math.floor(date.getTime() / DAY_MS);
  const eclipses = useMemo(
    () => nextVisible(new Date(startKey * DAY_MS), place, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startKey, place.latitude, place.longitude],
  );
  const nextTotal = useNextTotal(eclipses, place, startKey);

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
      <section aria-labelledby="your-city" className="mt-8">
        <h2 id="your-city" data-toc-label="From your city" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
          The next solar eclipses you can see from {label}
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Local times, how much of the sun the moon will cover at the deepest moment, and what it will look like.
        </p>
        {eclipses.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">No solar eclipse is visible from here before {LAST_YEAR}.</p>
        ) : (
          <ol className="mt-6 space-y-4">
            {eclipses.map((e, i) => {
              const pct = Math.round(e.obscuration * 100);
              const kind = kindAtPlace(e);
              const note = horizonNote(e);
              return (
                <li key={e.peak.getTime()} className="grid gap-5 rounded-3xl bg-[#05070d] p-5 text-white sm:grid-cols-[auto_1fr] sm:items-center sm:p-6">
                  <div className="mx-auto w-[150px]">
                    <EclipseDisc separation={e.peakSeparation} ratio={e.moonToSunRadius} size={150} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">
                      {i === 0 ? "Next" : i === 1 ? "After that" : "Then"} · {kind} eclipse here
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{fmt.long.format(e.peak)}</p>
                    <p className="mt-2 text-lg text-zinc-200">
                      {kind === "Total"
                        ? `Totality lasts ${duration(e.centralSeconds)}`
                        : kind === "Annular"
                          ? `Ring of fire for ${duration(e.centralSeconds)}`
                          : `${pct}% of the sun covered`}
                    </p>
                    <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                      <Cell label="Begins" value={e.beginSunAltitude > 0 ? fmt.time(e.begin) : "before sunrise"} />
                      <Cell label="Deepest" value={fmt.time(e.peak)} />
                      <Cell label="Ends" value={e.endSunAltitude > 0 ? fmt.time(e.end) : "after sunset"} />
                    </dl>
                    {note && <p className="mt-3 text-sm text-amber-200">{note}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <span className="font-semibold">Next total solar eclipse in {place.name}: </span>
          {nextTotal === undefined
            ? "searching…"
            : nextTotal
              ? `${fmt.long.format(nextTotal.peak)} (totality ${duration(nextTotal.centralSeconds)}).`
              : `none before ${LAST_YEAR}. A total eclipse covers only a narrow strip of Earth each time, so most places wait centuries.`}
        </p>
      </section>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
      <dt className="text-xs uppercase tracking-wider text-zinc-400">{label}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/**
 * Bu yerden görülecek sıradaki tam tutulma (2100'e kadar). Arama onlarca tutulmayı tarayabildiği için ekran donmasın
 * diye arka planda, birer birer yapılır; bulunana kadar `undefined`, yoksa `null`.
 */
function useNextTotal(known: LocalSolarEclipse[], place: EnPlace, startKey: number) {
  const [result, setResult] = useState<{ key: string; value: LocalSolarEclipse | null } | null>(null);
  const key = `${place.latitude}|${place.longitude}|${startKey}`;
  useEffect(() => {
    const found = known.find((e) => e.centralSeconds > 0 && e.kind === "total");
    if (found) {
      setResult({ key, value: found });
      return;
    }
    let cancelled = false;
    let t = new Date(startKey * DAY_MS);
    const step = () => {
      if (cancelled) return;
      for (let i = 0; i < 3; i++) {
        const e = getLocalSolarEclipse(t, place);
        if (localDateParts(e.peak, "UTC").year > LAST_YEAR) {
          setResult({ key, value: null });
          return;
        }
        if (e.kind === "total" && e.centralSeconds > 0 && e.peakSunAltitude > 0) {
          setResult({ key, value: e });
          return;
        }
        t = new Date(e.peak.getTime() + DAY_MS);
      }
      setTimeout(step, 0);
    };
    const first = setTimeout(step, 0);
    return () => {
      cancelled = true;
      clearTimeout(first);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return result?.key === key ? result.value : undefined;
}
