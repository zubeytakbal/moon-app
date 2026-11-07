"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMoonPhase,
  getMoonRiseSet,
  getMoonView,
  getUpcomingPrincipalPhases,
  localDateParts,
  PHASE_NAMES_EN,
  zonedTimeToUtc,
} from "@moon-app/moon";
import { MoonCardDownload } from "@/components/MoonCardDownload";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ShareButton } from "@/components/ShareButton";
import { PlacePicker, usePlaceAndDate } from "@/components/en/PlacePicker";
import { englishFullMoonNames } from "@/lib/en/full-moon-names";
import { placeLabel, type EnPlace } from "@/lib/en/places";
import { PHASE_FRAME_LIMB, PHASE_FRAME_STEP } from "@/lib/moon-phase-frames";

/**
 * Moon Phase on Your Birthday aracı. Her şey tarayıcıda: doğum tarihi (PlacePicker'ın tarih alanı, ?date=), isteğe bağlı
 * saat (?time=HHMM), doğum yeri (?place=) ve partnerin tarihi (?partner=YYYY-MM-DD). Ay, doğum yerinden göründüğü
 * gibi döndürülür (Moon Phase Today ile aynı yöntem).
 */

const DAY_MS = 86_400_000;
const SYNODIC = 29.530588;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function readParam(name: string) {
  return new URLSearchParams(location.search).get(name);
}

function writeParam(name: string, value: string | null) {
  const params = new URLSearchParams(location.search);
  if (value) params.set(name, value);
  else params.delete(name);
  const q = params.toString();
  history.replaceState(history.state, "", q ? `?${q}` : location.pathname);
}

/** Bir yerel tarih (ve isteğe bağlı saat) için ay: evre, yerden görünüş açısı, en yakın dolunay ve adı. */
function moonAt(y: number, m: number, d: number, time: string | null, place: EnPlace) {
  const [hh, mm] = time ? [Number(time.slice(0, 2)), Number(time.slice(2, 4))] : [12, 0];
  const instant = new Date(zonedTimeToUtc(y, m, d, 0, place.timeZone).getTime() + (hh * 60 + mm) * 60_000);
  const phase = getMoonPhase(instant, place.timeZone);
  const view = getMoonView(instant, place);
  const around = getUpcomingPrincipalPhases(new Date(instant.getTime() - 20 * DAY_MS), 8).filter((p) => p.key === "full-moon");
  const nearest = around.reduce((a, b) => (Math.abs(a.date.getTime() - instant.getTime()) < Math.abs(b.date.getTime() - instant.getTime()) ? a : b));
  const fullName = englishFullMoonNames([nearest], place.timeZone).get(nearest.date.getTime());
  const rise = getMoonRiseSet(zonedTimeToUtc(y, m, d, 12, place.timeZone), place).rise;
  return { instant, phase, view, nearest, fullName, rise };
}

/** Bu yerel günün tamamında dolunay anı var mı? (O günün adı "Full Moon" olur.) */
function isFullMoonDay(y: number, m: number, d: number, tz: string) {
  const start = zonedTimeToUtc(y, m, d, 0, tz).getTime();
  const end = zonedTimeToUtc(y, m, d + 1, 0, tz).getTime();
  return getUpcomingPrincipalPhases(new Date(start - 2 * DAY_MS), 4).some((p) => p.key === "full-moon" && p.date.getTime() >= start && p.date.getTime() < end);
}

export function BirthdayExplorer({ initialNow }: { initialNow: string }) {
  const { place, source, now, locale, dateIso, isToday, choose, setDateInput, backToToday } = usePlaceAndDate(initialNow);
  const date = dateIso ? new Date(dateIso) : now;
  const tz = place.timeZone;
  const b = localDateParts(date, tz);
  const dayKey = `${b.year}-${pad(b.month)}-${pad(b.day)}`;
  const label = placeLabel(place);

  const [time, setTime] = useState<string | null>(null);
  const [partner, setPartner] = useState<string | null>(null);
  useEffect(() => {
    const t = readParam("time");
    if (t && /^\d{4}$/.test(t)) setTime(t);
    const p = readParam("partner");
    if (p && /^\d{4}-\d{2}-\d{2}$/.test(p)) setPartner(p);
  }, []);

  const fmt = useMemo(
    () => ({
      long: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      short: new Intl.DateTimeFormat(locale, { timeZone: tz, month: "short", day: "numeric", year: "numeric" }),
      time: new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" }),
    }),
    [locale, tz],
  );

  const me = useMemo(() => moonAt(b.year, b.month, b.day, time, place), [dayKey, time, place.latitude, place.longitude, tz]); // eslint-disable-line react-hooks/exhaustive-deps
  const name = PHASE_NAMES_EN[me.phase.key];
  const pct = Math.round(me.phase.illumination * 100);
  const index = Math.round(me.phase.phaseAngle / PHASE_FRAME_STEP) % (360 / PHASE_FRAME_STEP);
  const rotation = PHASE_FRAME_LIMB[index] - me.view.brightLimb;
  const diffDays = (me.nearest.date.getTime() - me.instant.getTime()) / DAY_MS;
  const nearestText =
    Math.abs(diffDays) < 0.5
      ? "You were born on the day of a full moon."
      : `The nearest full moon came ${Math.round(Math.abs(diffDays))} day${Math.round(Math.abs(diffDays)) === 1 ? "" : "s"} ${diffDays > 0 ? "after" : "before"} you were born.`;
  const dateText = `${fmt.long.format(me.instant)}${time ? `, ${fmt.time.format(me.instant)}` : ""}`;

  // Önümüzdeki 5 doğum günü ve doğum gününün dolunaya denk geleceği sıradaki yıl.
  const today = localDateParts(now, tz);
  const upcoming = useMemo(() => {
    const out: { year: number; key: string; angle: number; pct: number }[] = [];
    let year = today.year + (today.month > b.month || (today.month === b.month && today.day > b.day) ? 1 : 0);
    for (let i = 0; i < 5; i++, year++) {
      const p = getMoonPhase(zonedTimeToUtc(year, b.month, b.day, 21, tz), tz);
      out.push({ year, key: PHASE_NAMES_EN[p.key], angle: p.phaseAngle, pct: Math.round(p.illumination * 100) });
    }
    let fullYear: number | null = null;
    for (let y = today.year; y <= today.year + 40; y++) {
      if (y === today.year && (today.month > b.month || (today.month === b.month && today.day > b.day))) continue;
      if (isFullMoonDay(y, b.month, b.day, tz)) {
        fullYear = y;
        break;
      }
    }
    return { out, fullYear };
  }, [dayKey, tz, today.year]); // eslint-disable-line react-hooks/exhaustive-deps

  const partnerMoon = useMemo(() => {
    if (!partner) return null;
    const [y, m, d] = partner.split("-").map(Number);
    return moonAt(y, m, d, null, place);
  }, [partner, place.latitude, place.longitude, tz]); // eslint-disable-line react-hooks/exhaustive-deps

  const shareText = `The moon on my birthday, ${fmt.short.format(me.instant)}: ${name}, ${pct}% lit.${me.fullName ? ` My birth full moon: the ${me.fullName}.` : ""}`;

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
        dateLabel="Birthday"
      />
      <div className="mt-3 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="flex flex-col text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Time of birth (optional)
          <input
            type="time"
            value={time ? `${time.slice(0, 2)}:${time.slice(2)}` : ""}
            onChange={(e) => {
              const v = e.target.value.replace(":", "");
              setTime(v || null);
              writeParam("time", v || null);
            }}
            className="mt-1 rounded-xl border border-zinc-300 px-3 py-2 text-base font-normal normal-case tracking-normal dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <p className="text-sm text-zinc-500">
          Pick your birthday in the date box and your birthplace in the city box above. Without a time we use midday.
        </p>
      </div>

      {/* Sonuç */}
      <section aria-labelledby="result" className="mt-8">
        <h2 id="result" data-toc-label="Your birthday moon" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
          {isToday ? "The moon today" : "The moon on your birthday"}
        </h2>
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
            <figcaption className="mt-3 text-sm text-zinc-400">As seen from {place.name}</figcaption>
          </figure>
          <div>
            <p className="text-zinc-400">{dateText}</p>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{name}</p>
            <p className="mt-2 text-xl font-light text-zinc-200">
              {pct}% illuminated · {(Math.round(me.phase.ageDays * 10) / 10).toLocaleString(locale)} days old ·{" "}
              {me.phase.isWaxing ? "waxing" : "waning"}
            </p>
            <p className="mt-3 text-zinc-300">{nearestText}</p>
            {me.fullName && (
              <p className="mt-3 inline-flex flex-wrap items-baseline gap-x-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1.5 text-amber-100">
                <span className="text-sm text-amber-200/80">Your birth full moon:</span>
                <span className="font-semibold">{me.fullName}</span>
                <span className="text-sm text-amber-200/80">({fmt.short.format(me.nearest.date)})</span>
              </p>
            )}
            <p className="mt-3 text-sm text-zinc-400">
              Moonrise that day in {place.name}: {me.rise ? fmt.time.format(me.rise) : "none on that calendar day"}
            </p>
            <div className="mt-6 flex flex-wrap items-start gap-3">
              <ShareButton title="Moon phase on my birthday" text={shareText} lang="en" />
              <MoonCardDownload
                lang="en"
                phaseAngle={me.phase.phaseAngle}
                dateLabel={dateText}
                phaseName={name}
                detail={`${pct}% lit · ${me.phase.isWaxing ? "waxing" : "waning"}`}
                fullMoonName={me.fullName}
                fileName={`birthday-moon-${dayKey}`}
              />
            </div>
            <p className="mt-3 max-w-md text-xs text-zinc-500">
              The image is phone-wallpaper size (1080 × 1920). The moon picture is NASA&apos;s public-domain rendering of
              that phase.
            </p>
          </div>
        </div>
      </section>

      {/* Partner */}
      <section aria-labelledby="partner" className="mt-12">
        <h2 id="partner" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
          Compare with your partner
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Enter a second birthday to see both moons side by side.</p>
        <label className="mt-4 inline-flex flex-col text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Partner&apos;s birthday
          <input
            type="date"
            min="1900-01-01"
            max="2100-12-31"
            value={partner ?? ""}
            onChange={(e) => {
              setPartner(e.target.value || null);
              writeParam("partner", e.target.value || null);
            }}
            className="mt-1 rounded-xl border border-zinc-300 px-3 py-2 text-base font-normal normal-case tracking-normal dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        {partnerMoon && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { who: "You", m: me },
              { who: "Your partner", m: partnerMoon },
            ].map(({ who, m }) => (
              <div key={who} className="flex items-center gap-4 rounded-2xl bg-[#05070d] p-5 text-white">
                <MoonPhaseIcon phaseAngle={m.phase.phaseAngle} size={96} title={PHASE_NAMES_EN[m.phase.key]} southern={place.latitude < 0} />
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-400">{who}</p>
                  <p className="text-lg font-semibold">{PHASE_NAMES_EN[m.phase.key]}</p>
                  <p className="text-sm text-zinc-300">
                    {fmt.short.format(m.instant)} · {Math.round(m.phase.illumination * 100)}% lit
                  </p>
                </div>
              </div>
            ))}
            <p className="text-zinc-700 sm:col-span-2 dark:text-zinc-300">
              {(() => {
                const gap = Math.abs(me.phase.ageDays - partnerMoon.phase.ageDays);
                const cyc = Math.min(gap, SYNODIC - gap);
                return cyc < 1.5
                  ? "You were born under almost the same moon."
                  : cyc > SYNODIC / 2 - 1.5
                    ? "You were born under opposite moons: one near new, one near full."
                    : `Your moons are about ${Math.round(cyc)} days apart in the lunar cycle.`;
              })()}
            </p>
          </div>
        )}
      </section>

      {/* Önümüzdeki doğum günleri */}
      <section aria-labelledby="next-birthdays" className="mt-12">
        <h2 id="next-birthdays" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
          The moon on your next birthdays
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          The phase on the evening of each birthday in {place.name}.{" "}
          {upcoming.fullYear
            ? `Your birthday next falls on a full moon in ${upcoming.fullYear}.`
            : "Your birthday doesn't fall on a full moon in the next 40 years."}
        </p>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {upcoming.out.map((u) => (
            <li key={u.year} className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <MoonPhaseIcon phaseAngle={u.angle} size={56} title={u.key} southern={place.latitude < 0} />
              <span className="mt-2 font-semibold">{u.year}</span>
              <span className="text-xs text-zinc-500">
                {u.key}, {u.pct}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 19 yıllık döngü */}
      <section aria-labelledby="metonic" className="mt-12">
        <h2 id="metonic" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
          Your 19-year moon
        </h2>
        <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
          Every 19 years the moon&apos;s phases fall on almost the same calendar dates again, so on your 19th, 38th and 57th
          birthdays the moon looks nearly as it did when you were born.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {[19, 38, 57]
            .filter((age) => b.year + age <= 2100)
            .map((age) => {
              const p = getMoonPhase(zonedTimeToUtc(b.year + age, b.month, b.day, 12, tz), tz);
              return (
                <li key={age} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <MoonPhaseIcon phaseAngle={p.phaseAngle} size={48} title={PHASE_NAMES_EN[p.key]} southern={place.latitude < 0} />
                  <span className="leading-tight">
                    <span className="block font-semibold">
                      Age {age} ({b.year + age})
                    </span>
                    <span className="text-sm text-zinc-500">
                      {PHASE_NAMES_EN[p.key]}, {Math.round(p.illumination * 100)}%
                    </span>
                  </span>
                </li>
              );
            })}
        </ul>
      </section>
    </div>
  );
}
