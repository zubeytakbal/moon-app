"use client";

import { useMemo } from "react";
import {
  getMoonDistanceKm,
  getMoonPhase,
  getMoonPosition,
  getMoonRiseSet,
  getMoonView,
  getNextMoonEvent,
  getSunAltitude,
  getUpcomingPrincipalPhases,
  localDateParts,
  PHASE_NAMES_EN,
  zonedTimeToUtc,
  type PrincipalPhase,
} from "@moon-app/moon";
import { MobileCollapse } from "@/components/MobileCollapse";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { PlacePicker, usePlaceAndDate } from "@/components/en/PlacePicker";
import { englishFullMoonNames } from "@/lib/en/full-moon-names";
import { placeLabel, type EnPlace } from "@/lib/en/places";
import { PHASE_FRAME_LIMB, PHASE_FRAME_STEP } from "@/lib/moon-phase-frames";

/**
 * Moon Phase Today aracı. Her şey tarayıcıda hesaplanır: sunucu (ve Google) New York için hazır HTML görür; ziyaretçinin
 * tarayıcısında şehir cihazın saat diliminden tahmin edilir ya da adresteki ?place= ile açılır (Sunrise sayfasıyla
 * aynı yer seçici). Ay görseli, seçilen yerden göründüğü gibi döndürülür (aydınlık kenar tepe noktasına göre).
 */

const DAY_MS = 86_400_000;
const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const compass = (az: number) => COMPASS[Math.round(az / 22.5) % 16];
const CALENDAR_DAYS = 30;
const CALENDAR_MOBILE_ROWS = 10;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Aydınlık kenarın yönü (tepe noktasından saat yönünün tersine derece) → "lower right" gibi sözcük. */
function limbWords(angle: number) {
  const words = ["top", "upper left", "left", "lower left", "bottom", "lower right", "right", "upper right"];
  return words[Math.round(angle / 45) % 8];
}

type Fmt = ReturnType<typeof makeFmt>;

function makeFmt(locale: string, tz: string) {
  const time = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" });
  return {
    time: (d: Date | null) => (d ? time.format(d) : "–"),
    day: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    short: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "short", month: "short", day: "numeric" }),
    hour: new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric" }),
    zoneName: new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: "short" }),
    number: new Intl.NumberFormat(locale),
  };
}

export function MoonExplorer({ initialNow }: { initialNow: string }) {
  const { place, source, now, locale, dateIso, isToday, choose, setDateInput, backToToday } = usePlaceAndDate(initialNow);
  const date = dateIso ? new Date(dateIso) : now;
  const tz = place.timeZone;
  const fmt = useMemo(() => makeFmt(locale, tz), [locale, tz]);

  const local = localDateParts(date, tz);
  const dayKey = `${local.year}-${pad(local.month)}-${pad(local.day)}`;
  const dayNoon = zonedTimeToUtc(local.year, local.month, local.day, 12, tz);
  // "Bu gece": öğleden ertesi öğleye. Bugün gece yarısından sonra (sabah 6'dan önce) bakılıyorsa içinde bulunulan gece.
  const earlyMorning = isToday && date.getTime() < dayNoon.getTime() - 6 * 3_600_000;
  const nightStart = earlyMorning ? new Date(dayNoon.getTime() - DAY_MS) : dayNoon;

  const night = useMemo(() => nightPath(nightStart, place), [place, nightStart.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps
  const label = placeLabel(place);
  const zone = fmt.zoneName.formatToParts(dayNoon).find((p) => p.type === "timeZoneName")?.value ?? tz;

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
      <TonightSection
        date={date}
        dayNoon={dayNoon}
        place={place}
        label={label}
        fmt={fmt}
        isToday={isToday}
        now={now}
        night={night}
        zone={zone}
      />
      {isToday && <NowSection now={now} place={place} label={label} fmt={fmt} />}
      <PathChart night={night} now={isToday ? now : null} fmt={fmt} label={label} />
      <CalendarTable startNoon={dayNoon} place={place} fmt={fmt} label={label} todayKey={isToday ? dayKey : null} />
      <PhasesList from={date} tz={tz} fmt={fmt} southern={place.latitude < 0} />
    </div>
  );
}

/* ───────────────────────── Gece boyunca ay ve Güneş ───────────────────────── */

interface NightSample {
  time: Date;
  moon: number;
  sun: number;
}

/** 24 saat, 15 dakikada bir ayın ve Güneş'in yüksekliği. */
function nightPath(start: Date, place: EnPlace): NightSample[] {
  const out: NightSample[] = [];
  for (let i = 0; i <= 96; i++) {
    const time = new Date(start.getTime() + i * 15 * 60_000);
    out.push({ time, moon: getMoonPosition(time, place).altitude, sun: getSunAltitude(time, place) });
  }
  return out;
}

/* ───────────────────────── Bu gece ───────────────────────── */

function TonightSection({
  date,
  dayNoon,
  place,
  label,
  fmt,
  isToday,
  now,
  night,
  zone,
}: {
  date: Date;
  dayNoon: Date;
  place: EnPlace;
  label: string;
  fmt: Fmt;
  isToday: boolean;
  now: Date;
  night: NightSample[];
  zone: string;
}) {
  const phase = getMoonPhase(date, place.timeZone);
  const name = PHASE_NAMES_EN[phase.key];
  const pct = Math.round(phase.illumination * 100);
  const riseSet = getMoonRiseSet(dayNoon, place);
  const riseAz = riseSet.rise ? getMoonPosition(riseSet.rise, place).azimuth : null;
  const setAz = riseSet.set ? getMoonPosition(riseSet.set, place).azimuth : null;
  const km = getMoonDistanceKm(date);
  const next = getUpcomingPrincipalPhases(date, 4);
  const nextFull = next.find((p) => p.key === "full-moon")!;
  const nextNew = next.find((p) => p.key === "new-moon")!;
  const fullName = englishFullMoonNames([nextFull], place.timeZone).get(nextFull.date.getTime());

  // Görselin anı: ay şu an ufkun üstündeyse şimdi, değilse bu gece en yüksekte olduğu an.
  const upNow = isToday && getMoonPosition(now, place).altitude > 0;
  const highest = night.reduce((a, b) => (b.moon > a.moon ? b : a));
  const viewTime = upNow ? now : highest.moon > 0 ? highest.time : date;
  const view = getMoonView(viewTime, place);
  const index = Math.round(phase.phaseAngle / PHASE_FRAME_STEP) % (360 / PHASE_FRAME_STEP);
  const rotation = PHASE_FRAME_LIMB[index] - view.brightLimb;
  const tooThin = pct < 3;
  const daysTo = (d: Date) => Math.max(0, Math.round((d.getTime() - date.getTime()) / DAY_MS));

  return (
    <section aria-labelledby="tonight" className="mt-8">
      <h2 id="tonight" data-toc-label="Tonight" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        {isToday ? "The moon today" : `The moon on ${fmt.short.format(dayNoon)}`} in {label}
      </h2>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        {fmt.day.format(dayNoon)} · times in local time ({zone})
      </p>

      <div className="mt-6 grid items-center gap-8 rounded-3xl bg-[#05070d] p-6 text-white sm:p-8 md:grid-cols-[auto_1fr]">
        <figure className="mx-auto w-[min(70vw,280px)] text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/moon/phases/p${pad(index)}-640.webp`}
            width={280}
            height={280}
            alt={`${name} moon, ${pct}% illuminated, as seen from ${label}`}
            className="h-auto w-full rounded-full"
            style={{ transform: `rotate(${rotation.toFixed(1)}deg)` }}
          />
          <figcaption className="mt-3 text-sm text-zinc-400">
            {tooThin
              ? "Too close to the sun to see"
              : `As seen from ${place.name}${upNow ? " right now" : ` at ${fmt.time(viewTime)}`}: lit on the ${limbWords(view.brightLimb)}`}
          </figcaption>
        </figure>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">Moon phase</p>
          <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{name}</p>
          <p className="mt-2 text-xl font-light text-zinc-200">
            {pct}% illuminated · {phase.isWaxing ? "waxing (growing)" : "waning (shrinking)"}
          </p>
          <p className="mt-1 text-zinc-400">
            {fmt.number.format(Math.round(phase.ageDays * 10) / 10)} days since the new moon
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            <Card
              label="Moonrise"
              value={riseSet.rise ? fmt.time(riseSet.rise) : "No moonrise"}
              sub={riseAz !== null ? `${compass(riseAz)} · ${Math.round(riseAz)}°` : "none on this calendar day"}
            />
            <Card
              label="Moonset"
              value={riseSet.set ? fmt.time(riseSet.set) : "No moonset"}
              sub={setAz !== null ? `${compass(setAz)} · ${Math.round(setAz)}°` : "none on this calendar day"}
            />
            <Card
              label="Next full moon"
              value={fmt.short.format(nextFull.date)}
              sub={`${fullName ?? "Full moon"} · ${fmt.time(nextFull.date)}${daysTo(nextFull.date) ? ` · in ${daysTo(nextFull.date)} days` : ""}`}
            />
            <Card
              label="Distance"
              value={`${fmt.number.format(Math.round(km * 0.621371 / 100) * 100)} mi`}
              sub={`${fmt.number.format(Math.round(km / 100) * 100)} km from Earth`}
            />
          </dl>
          <p className="mt-4 text-sm text-zinc-400">
            Next new moon: {fmt.short.format(nextNew.date)}, {fmt.time(nextNew.date)}
          </p>
        </div>
      </div>
    </section>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</dt>
      <dd className="mt-1 text-2xl font-light tabular-nums">{value}</dd>
      <dd className="mt-0.5 text-xs text-zinc-400">{sub}</dd>
    </div>
  );
}

/* ───────────────────────── Şu an ───────────────────────── */

function NowSection({ now, place, label, fmt }: { now: Date; place: EnPlace; label: string; fmt: Fmt }) {
  const pos = getMoonPosition(now, place);
  const up = pos.altitude > 0;
  const nextEvent = getNextMoonEvent(now, place, up ? "set" : "rise");
  const nextAz = nextEvent ? getMoonPosition(nextEvent, place).azimuth : null;
  const sunUp = getSunAltitude(now, place) > 0;

  return (
    <section aria-labelledby="now" className="mt-12">
      <h2 id="now" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Where is the moon right now?
      </h2>
      <div className="mt-5 grid gap-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-[auto_1fr] sm:items-center dark:border-zinc-800 dark:bg-zinc-900">
        <CompassDial azimuth={pos.azimuth} up={up} />
        <div>
          <p className="text-2xl font-semibold">
            {up
              ? `${Math.round(pos.altitude)}° above the horizon, toward the ${compass(pos.azimuth)}`
              : `Below the horizon in ${place.name}`}
          </p>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">
            {up
              ? sunUp
                ? "The moon is up, but the sky is bright: look for a pale moon in the daytime sky."
                : "The moon is up now. Face the direction on the dial and look about " + heightWords(pos.altitude) + "."
              : "You can't see it from here at the moment."}{" "}
            {nextEvent &&
              `${up ? "Moonset" : "Next moonrise"}: ${fmt.short.format(nextEvent)}, ${fmt.time(nextEvent)}${
                nextAz !== null ? `, toward the ${compass(nextAz)} (${Math.round(nextAz)}°)` : ""
              }.`}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Direction is measured from true north: 90° is due east, 180° due south. Updated every minute for {label}.
          </p>
        </div>
      </div>
    </section>
  );
}

function heightWords(alt: number) {
  if (alt < 15) return "just above the horizon";
  if (alt < 35) return "a third of the way up the sky";
  if (alt < 60) return "halfway up the sky";
  return "high overhead";
}

function CompassDial({ azimuth, up }: { azimuth: number; up: boolean }) {
  const r = 52;
  const a = (azimuth * Math.PI) / 180;
  const x = 64 + Math.sin(a) * r;
  const y = 64 - Math.cos(a) * r;
  return (
    <svg viewBox="0 0 128 128" width={128} height={128} role="img" aria-label={`Moon direction ${Math.round(azimuth)} degrees`} className="mx-auto">
      <circle cx={64} cy={64} r={58} fill="#05070d" />
      <circle cx={64} cy={64} r={52} fill="none" stroke="#ffffff22" />
      {["N", "E", "S", "W"].map((t, i) => (
        <text key={t} x={64 + Math.sin((i * Math.PI) / 2) * 40} y={64 - Math.cos((i * Math.PI) / 2) * 40 + 4} textAnchor="middle" fontSize={11} fill="#a1a1aa">
          {t}
        </text>
      ))}
      <line x1={64} y1={64} x2={x} y2={y} stroke={up ? "#fbbf24" : "#52525b"} strokeWidth={2} />
      <circle cx={x} cy={y} r={7} fill={up ? "#fef3c7" : "#3f3f46"} />
    </svg>
  );
}

/* ───────────────────────── Bu gecenin ay yolu ───────────────────────── */

function PathChart({ night, now, fmt, label }: { night: NightSample[]; now: Date | null; fmt: Fmt; label: string }) {
  const W = 720;
  const H = 220;
  const top = 90;
  const bottom = -30;
  const start = night[0].time.getTime();
  const span = night[night.length - 1].time.getTime() - start;
  const x = (t: number) => ((t - start) / span) * W;
  const y = (alt: number) => ((top - Math.max(bottom, Math.min(top, alt))) / (top - bottom)) * H;
  const d = night.map((p, i) => `${i ? "L" : "M"}${x(p.time.getTime()).toFixed(1)},${y(p.moon).toFixed(1)}`).join("");
  const nowX = now && now.getTime() >= start && now.getTime() <= start + span ? x(now.getTime()) : null;
  const sky = (sun: number) => (sun > 0 ? "#1d4e74" : sun > -6 ? "#33407a" : sun > -12 ? "#1c2552" : sun > -18 ? "#111733" : "#070a17");
  const step = W / (night.length - 1);
  const ticks = Array.from({ length: 9 }, (_, i) => start + (i * span) / 8);
  // Gökyüzü karanlıkken (Güneş −6° altında) ayın en yüksek anı; ay karanlıkta hiç ufkun üstüne çıkmıyorsa null.
  const dark = night.filter((p) => p.sun < -6 && p.moon > 0);
  const darkHighest = dark.length ? dark.reduce((a, b) => (b.moon > a.moon ? b : a)) : null;

  return (
    <section aria-labelledby="path" className="mt-12">
      <h2 id="path" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        The moon&apos;s path tonight
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        How high the moon is above the horizon in {label} from noon to noon. The background shows daylight, twilight and
        full darkness, so you can see when the moon is up in a dark sky.
        {darkHighest
          ? ` In the dark sky it is highest at ${fmt.time(darkHighest.time)}, ${Math.round(darkHighest.moon)}° up.`
          : " Tonight the moon is not above the horizon while the sky is dark."}
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl bg-[#05070d] p-3 sm:p-4">
        <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" role="img" aria-label={`Moon altitude through the night in ${label}`}>
          {night.map((p, i) => (
            <rect key={i} x={i * step - step / 2} y={0} width={step + 0.5} height={H} fill={sky(p.sun)} />
          ))}
          <rect x={0} y={y(0)} width={W} height={H - y(0)} fill="#000" fillOpacity={0.45} />
          <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="#a1a1aa" strokeOpacity={0.6} strokeDasharray="4 4" />
          <text x={6} y={y(0) - 5} fill="#d4d4d8" fontSize={11}>
            horizon
          </text>
          <path d={d} fill="none" stroke="#fef3c7" strokeWidth={2.5} />
          {nowX !== null && (
            <g>
              <line x1={nowX} x2={nowX} y1={0} y2={H} stroke="#fbbf24" strokeWidth={1.5} />
              <text x={Math.min(W - 30, nowX + 4)} y={14} fill="#fbbf24" fontSize={11}>
                now
              </text>
            </g>
          )}
          {ticks.map((t) => (
            <text key={t} x={Math.min(W - 18, Math.max(18, x(t)))} y={H + 17} textAnchor="middle" fill="#a1a1aa" fontSize={11}>
              {fmt.hour.format(new Date(t))}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}

/* ───────────────────────── 30 günlük takvim ───────────────────────── */

function CalendarTable({
  startNoon,
  place,
  fmt,
  label,
  todayKey,
}: {
  startNoon: Date;
  place: EnPlace;
  fmt: Fmt;
  label: string;
  todayKey: string | null;
}) {
  const rows = useMemo(
    () =>
      Array.from({ length: CALENDAR_DAYS }, (_, i) => {
        const noon = new Date(startNoon.getTime() + i * DAY_MS);
        const phase = getMoonPhase(noon, place.timeZone);
        const rs = getMoonRiseSet(noon, place);
        const p = localDateParts(noon, place.timeZone);
        return {
          key: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
          noon,
          phase,
          rise: rs.rise,
          set: rs.set,
          riseAz: rs.rise ? getMoonPosition(rs.rise, place).azimuth : null,
          setAz: rs.set ? getMoonPosition(rs.set, place).azimuth : null,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startNoon.getTime(), place.latitude, place.longitude, place.timeZone],
  );

  return (
    <section aria-labelledby="calendar" className="mt-12">
      <h2 id="calendar" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Moonrise, moonset and phases for the next 30 days
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        For {label}, in local time. The moon rises about 50 minutes later each day on average, so about once a month
        there is a day with no moonrise and one with no moonset.
      </p>
      <MobileCollapse
        hiddenCount={CALENDAR_DAYS - CALENDAR_MOBILE_ROWS}
        noun="days"
        className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-3 py-2.5 font-medium sm:px-4">Date</th>
              <th className="px-3 py-2.5 font-medium sm:px-4">Phase</th>
              <th className="px-3 py-2.5 font-medium sm:px-4">Moonrise</th>
              <th className="px-3 py-2.5 font-medium sm:px-4">Moonset</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((r, i) => (
              <tr
                key={r.key}
                data-extra={i >= CALENDAR_MOBILE_ROWS || undefined}
                className={r.key === todayKey ? "bg-indigo-50 dark:bg-indigo-950/40" : undefined}
              >
                <td className="whitespace-nowrap px-3 py-2 font-medium sm:px-4">{fmt.short.format(r.noon)}</td>
                <td className="px-3 py-2 sm:px-4">
                  <span className="flex items-center gap-2">
                    <MoonPhaseIcon phaseAngle={r.phase.phaseAngle} size={28} title={PHASE_NAMES_EN[r.phase.key]} southern={place.latitude < 0} />
                    <span className="leading-tight">
                      {PHASE_NAMES_EN[r.phase.key]}
                      <span className="block text-xs text-zinc-500">{Math.round(r.phase.illumination * 100)}%</span>
                    </span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums sm:px-4">
                  {r.rise ? fmt.time(r.rise) : "–"}
                  {r.riseAz !== null && <span className="block text-xs text-zinc-500">{compass(r.riseAz)}</span>}
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums sm:px-4">
                  {r.set ? fmt.time(r.set) : "–"}
                  {r.setAz !== null && <span className="block text-xs text-zinc-500">{compass(r.setAz)}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </MobileCollapse>
    </section>
  );
}

/* ───────────────────────── Sıradaki ana evreler ───────────────────────── */

function PhasesList({ from, tz, fmt, southern }: { from: Date; tz: string; fmt: Fmt; southern: boolean }) {
  const phases = useMemo(() => getUpcomingPrincipalPhases(from, 8), [from.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps
  const names = useMemo(
    () => englishFullMoonNames(phases.filter((p) => p.key === "full-moon"), tz),
    [phases, tz],
  );
  const days = (p: PrincipalPhase) => Math.round((p.date.getTime() - from.getTime()) / DAY_MS);

  return (
    <section aria-labelledby="next-phases" className="mt-12">
      <h2 id="next-phases" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Upcoming moon phases
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        The exact moments of the four main phases, in your local time. Full moons carry their traditional North American
        names.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {phases.map((p) => {
          const name = p.key === "full-moon" ? names.get(p.date.getTime()) : undefined;
          return (
            <li key={p.date.getTime()} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <MoonPhaseIcon phaseAngle={p.key === "new-moon" ? 0 : p.key === "first-quarter" ? 90 : p.key === "full-moon" ? 180 : 270} size={48} title={PHASE_NAMES_EN[p.key]} southern={southern} />
              <div className="leading-tight">
                <p className="font-semibold">
                  {PHASE_NAMES_EN[p.key]}
                  {name && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">{name}</span>}
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {fmt.short.format(p.date)}, {fmt.time(p.date)}
                  {days(p) > 0 && ` · in ${days(p)} ${days(p) === 1 ? "day" : "days"}`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
