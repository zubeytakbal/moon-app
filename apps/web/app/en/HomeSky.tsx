"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
  getLocalSolarEclipse,
  getMoonPhase,
  getMoonRiseSet,
  getSunDay,
  getUpcomingLunarEclipses,
  getUpcomingPrincipalPhases,
  getVisiblePlanets,
  localDateParts,
  PHASE_NAMES_EN,
  zonedTimeToUtc,
  type LocalSolarEclipse,
  type LunarEclipse,
} from "@moon-app/moon";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { PlacePicker, usePlaceAndDate } from "@/components/en/PlacePicker";
import { englishFullMoonNames } from "@/lib/en/full-moon-names";
import { EN_PAGES } from "@/lib/en/pages";
import { placeLabel, type EnPlace } from "@/lib/en/places";
import { lunarVisibility } from "@/lib/lunar-eclipse";

/**
 * Ana sayfanın "Tonight in your city" paneli. Her şey tarayıcıda hesaplanır: sunucu (ve Google) New York için dolu
 * HTML görür; tarayıcıda şehir cihazın saat diliminden tahmin edilir ya da adresteki ?place= ile açılır.
 */

const DAY_MS = 86_400_000;
const PLANET_EN: Record<string, string> = { Venüs: "Venus", Mars: "Mars", Jüpiter: "Jupiter", Satürn: "Saturn" };
const WHEN_EN = { aksam: "evening", sabah: "before dawn", "gece-boyu": "all night" } as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function nextSolar(from: Date, place: EnPlace): LocalSolarEclipse | null {
  let t = from;
  for (let i = 0; i < 12; i++) {
    const e = getLocalSolarEclipse(t, place);
    if (e.obscuration > 0.001 && (e.beginSunAltitude > 0 || e.peakSunAltitude > 0 || e.endSunAltitude > 0)) return e;
    t = new Date(e.peak.getTime() + DAY_MS);
  }
  return null;
}

function nextLunar(from: Date, place: EnPlace): LunarEclipse | null {
  for (const e of getUpcomingLunarEclipses(from, 8)) if (lunarVisibility(e, place).share > 0) return e;
  return null;
}

export function HomeSky({ initialNow }: { initialNow: string }) {
  const { place, source, now, locale, dateIso, isToday, choose, setDateInput, backToToday } = usePlaceAndDate(initialNow);
  const date = dateIso ? new Date(dateIso) : now;
  const tz = place.timeZone;
  const local = localDateParts(date, tz);
  const dayKey = `${local.year}-${pad(local.month)}-${pad(local.day)}`;
  const dayNoon = zonedTimeToUtc(local.year, local.month, local.day, 12, tz);
  const label = placeLabel(place);

  const fmt = useMemo(() => {
    const time = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" });
    return {
      time: (d: Date | null) => (d ? time.format(d) : "–"),
      short: new Intl.DateTimeFormat(locale, { timeZone: tz, month: "short", day: "numeric", year: "numeric" }),
    };
  }, [locale, tz]);

  const data = useMemo(() => {
    const phase = getMoonPhase(date, tz);
    const moon = getMoonRiseSet(dayNoon, place);
    const sun = getSunDay(dayNoon, place);
    const full = getUpcomingPrincipalPhases(date, 4).find((p) => p.key === "full-moon")!;
    const fullName = englishFullMoonNames([full], tz).get(full.date.getTime());
    const startOfDay = new Date(Math.floor(date.getTime() / DAY_MS) * DAY_MS);
    const solar = nextSolar(startOfDay, place);
    const lunar = nextLunar(startOfDay, place);
    const planets = getVisiblePlanets(date, place);
    return { phase, moon, sun, full, fullName, solar, lunar, planets };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey, place.latitude, place.longitude, tz, Math.floor(date.getTime() / 3_600_000)]);

  const { phase, moon, sun, full, fullName, solar, lunar, planets } = data;
  const days = (d: Date) => Math.max(0, Math.ceil((d.getTime() - date.getTime()) / DAY_MS));

  return (
    <section aria-labelledby="tonight" className="pt-14 sm:pt-20">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Tonight in your sky</p>
      <h2 id="tonight" className="mt-1 text-3xl font-semibold tracking-tight">
        {isToday ? "Today" : fmt.short.format(dayNoon)} in {label}
      </h2>
      <div className="mt-5">
        <PlacePicker place={place} label={label} source={source} dateKey={dayKey} isToday={isToday} onPlace={choose} onDate={setDateInput} onToday={backToToday} />
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Tile
          href={EN_PAGES.moonPhaseToday.path}
          icon={<MoonPhaseIcon phaseAngle={phase.phaseAngle} size={44} title={PHASE_NAMES_EN[phase.key]} southern={place.latitude < 0} />}
          label="Moon phase"
          value={PHASE_NAMES_EN[phase.key]}
          sub={`${Math.round(phase.illumination * 100)}% lit · ${phase.isWaxing ? "waxing" : "waning"}`}
        />
        <Tile href={EN_PAGES.moonPhaseToday.path + "#calendar"} icon={<Glyph>↑↓</Glyph>} label="Moonrise · moonset" value={`${fmt.time(moon.rise)} · ${fmt.time(moon.set)}`} sub="local time" />
        <Tile href={EN_PAGES.sunriseSunset.path} icon={<Glyph>☀</Glyph>} label="Sunrise · sunset" value={`${fmt.time(sun.rise)} · ${fmt.time(sun.set)}`} sub={`dark at ${fmt.time(sun.civilDusk)}`} />
        <Tile
          href={EN_PAGES.fullMoon.path}
          icon={<MoonPhaseIcon phaseAngle={180} size={44} title="Full moon" />}
          label="Next full moon"
          value={fmt.short.format(full.date)}
          sub={`${fullName ?? "Full moon"} · in ${days(full.date)} days`}
        />
        <Tile
          href={EN_PAGES.solarEclipse.path}
          icon={<Glyph>◐</Glyph>}
          label="Next solar eclipse here"
          value={solar ? fmt.short.format(solar.peak) : "None soon"}
          sub={solar ? `${solar.centralSeconds > 0 ? (solar.kind === "annular" ? "annular" : "total") : `${Math.round(solar.obscuration * 100)}% of the sun covered`}` : "not in the next few years"}
        />
        <Tile
          href={EN_PAGES.lunarEclipse.path}
          icon={<Glyph>●</Glyph>}
          label="Next lunar eclipse here"
          value={lunar ? fmt.short.format(lunar.peak) : "None soon"}
          sub={lunar ? (lunar.kind === "total" ? "total: a blood moon" : lunar.kind === "partial" ? "partial" : "penumbral (faint)") : ""}
        />
      </ul>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">Planets tonight: </span>
        {planets.length
          ? planets.map((p) => `${PLANET_EN[p.name] ?? p.name} (${WHEN_EN[p.when]})`).join(", ")
          : "none of the bright planets is well placed tonight"}
        .
      </p>
    </section>
  );
}

function Tile({ href, icon, label, value, sub }: { href: string; icon: ReactNode; label: string; value: string; sub: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
      >
        <span className="shrink-0">{icon}</span>
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-wider text-zinc-500">{label}</span>
          <span className="block text-lg font-semibold tabular-nums">{value}</span>
          <span className="block text-sm text-zinc-600 dark:text-zinc-400">{sub}</span>
        </span>
      </Link>
    </li>
  );
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-[#05070d] text-lg text-amber-300">
      {children}
    </span>
  );
}
