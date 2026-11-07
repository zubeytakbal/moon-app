"use client";

import { useMemo } from "react";
import { getUpcomingLunarEclipses, localDateParts, type LunarEclipse } from "@moon-app/moon";
import { PlacePicker, usePlaceAndDate } from "@/components/en/PlacePicker";
import { placeLabel, type EnPlace } from "@/lib/en/places";
import { lunarPhases, lunarVisibility, type LunarPhaseKey, type LunarVisibility } from "@/lib/lunar-eclipse";

/**
 * Lunar Eclipse aracı. Her şey tarayıcıda hesaplanır: sunucu (ve Google) New York için hazır HTML görür. Seçilen yerden
 * görülecek sıradaki ay tutulması (evre saatleri ve zaman çizelgesi) ve sıradaki kanlı ay (tam evrenin görüldüğü).
 */

const DAY_MS = 86_400_000;
const KIND: Record<LunarPhaseKey, string> = { penumbral: "Penumbral", partial: "Partial", total: "Total" };
const STAGE: Record<LunarPhaseKey, string> = {
  penumbral: "Faint shading (penumbra)",
  partial: "Bite out of the moon (partial)",
  total: "Blood moon (totality)",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface Found {
  e: LunarEclipse;
  v: LunarVisibility;
}

/** Bu yerden görülecek sıradaki tutulma ve sıradaki kanlı ay (tam evrenin en az bir kısmı ay ufkun üstündeyken). */
function search(from: Date, place: EnPlace): { next: Found | null; blood: Found | null } {
  const list = getUpcomingLunarEclipses(from, 24);
  let next: Found | null = null;
  let blood: Found | null = null;
  for (const e of list) {
    if (next && blood) break;
    const v = lunarVisibility(e, place);
    if (!next && v.share > 0) next = { e, v };
    if (!blood && e.kind === "total" && v.totalShare > 0) blood = { e, v };
  }
  return { next, blood };
}

export function LunarExplorer({ initialNow }: { initialNow: string }) {
  const { place, source, now, locale, dateIso, isToday, choose, setDateInput, backToToday } = usePlaceAndDate(initialNow);
  const date = dateIso ? new Date(dateIso) : now;
  const tz = place.timeZone;
  const local = localDateParts(date, tz);
  const dayKey = `${local.year}-${pad(local.month)}-${pad(local.day)}`;
  const label = placeLabel(place);
  const startKey = Math.floor(date.getTime() / DAY_MS);

  const fmt = useMemo(() => {
    const time = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" });
    return {
      time: (t: number) => time.format(new Date(t)),
      long: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      short: new Intl.DateTimeFormat(locale, { timeZone: tz, month: "short", day: "numeric" }),
    };
  }, [locale, tz]);

  const { next, blood } = useMemo(
    () => search(new Date(startKey * DAY_MS), place),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startKey, place.latitude, place.longitude],
  );

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
          The next lunar eclipse you can see from {label}
        </h2>
        {next ? <EclipseCard found={next} fmt={fmt} place={place} now={now} /> : <p className="mt-6">No lunar eclipse visible from here in the next ten years.</p>}

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/60 p-5 dark:border-red-900 dark:bg-red-950/30">
          <h3 className="text-lg font-semibold">Next blood moon from {place.name}</h3>
          {blood ? (
            <p className="mt-1 text-zinc-800 dark:text-zinc-200">
              {fmt.long.format(blood.e.peak)}. The moon is red from {fmt.time(lunarPhases(blood.e).find((p) => p.key === "total")!.start)} to{" "}
              {fmt.time(lunarPhases(blood.e).find((p) => p.key === "total")!.end)}
              {blood.v.totalShare < 0.97 ? ", but the moon is below the horizon for part of it" : ""}.
              {next && blood.e.peak.getTime() !== next.e.peak.getTime() && ` Until then, the eclipses visible from here are only partial or penumbral.`}
            </p>
          ) : (
            <p className="mt-1">No total lunar eclipse is visible from here in the next ten years.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function EclipseCard({ found, fmt, place, now }: { found: Found; fmt: { time: (t: number) => string; long: Intl.DateTimeFormat; short: Intl.DateTimeFormat }; place: EnPlace; now: Date }) {
  const { e, v } = found;
  const phases = lunarPhases(e);
  const outer = phases[0];
  const span = outer.end - outer.start;
  const pos = (t: number) => ((t - outer.start) / span) * 100;
  const verdict =
    v.share > 0.97 ? "The whole eclipse is visible" : "Only part of it is visible: the moon is below the horizon for the rest";
  return (
    <div className="mt-6 rounded-3xl bg-[#05070d] p-5 text-white sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">{KIND[e.kind]} lunar eclipse</p>
      <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{fmt.long.format(e.peak)}</p>
      <p className="mt-1 inline-block rounded-full bg-white/10 px-3 py-0.5 text-sm text-zinc-200">
        {(() => {
          const d = Math.ceil((e.peak.getTime() - now.getTime()) / 86_400_000);
          return d <= 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`;
        })()}
      </p>
      <p className="mt-2 text-zinc-300">
        {verdict} from {place.name}. Deepest at {fmt.time(e.peak.getTime())}.
        {e.kind === "penumbral" && " A penumbral eclipse only dims the moon slightly; many people don't notice it."}
      </p>

      {/* Zaman çizelgesi: evre bantları, ayın ufkun altında olduğu kısım taralı. */}
      <div className="relative mt-6 h-16 overflow-hidden rounded-xl bg-white/5" aria-hidden="true">
        {phases.map((p) => (
          <div
            key={p.key}
            className={`absolute top-0 h-full ${p.key === "total" ? "bg-red-700" : p.key === "partial" ? "bg-zinc-500" : "bg-zinc-700"}`}
            style={{ left: `${pos(p.start)}%`, width: `${pos(p.end) - pos(p.start)}%` }}
          />
        ))}
        <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(135deg, rgba(5,7,13,0.75) 0 6px, transparent 6px 12px)", clipPath: belowClip(v.above, outer.start, span) }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-zinc-400">
        <span>{fmt.time(outer.start)}</span>
        <span>{fmt.time(outer.end)}</span>
      </div>
      {v.share < 0.97 && <p className="mt-2 text-xs text-zinc-400">Striped: the moon is below the horizon from here.</p>}

      <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
        {phases.map((p) => (
          <div key={p.key} className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
            <dt className="text-xs uppercase tracking-wider text-zinc-400">{STAGE[p.key]}</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">
              {fmt.time(p.start)} – {fmt.time(p.end)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Ayın ufkun altında olduğu aralıkları kapsayan kesme şekli (taralı katman yalnız orada görünür). */
function belowClip(above: [number, number][], start: number, span: number) {
  if (!above.length) return "inset(0 0 0 0)";
  const pct = (t: number) => ((t - start) / span) * 100;
  // Ufkun altında olan aralıklar: üstteki aralıkların tümleyeni.
  const below: [number, number][] = [];
  let cursor = 0;
  for (const [a, b] of above) {
    if (pct(a) > cursor) below.push([cursor, pct(a)]);
    cursor = pct(b);
  }
  if (cursor < 100) below.push([cursor, 100]);
  if (!below.length) return "inset(0 100% 0 0)";
  const pts = below.flatMap(([a, b]) => [`${a}% 100%`, `${a}% 0%`, `${b}% 0%`, `${b}% 100%`]);
  return `polygon(0% 100%, ${pts.join(", ")}, 100% 100%)`;
}
