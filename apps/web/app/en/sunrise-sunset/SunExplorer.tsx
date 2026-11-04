"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  getBrahmaMuhurta,
  getDayLength,
  getRahuKaal,
  getSeasons,
  getSunDay,
  getSunPath,
  getTwilights,
  localDateParts,
  zonedTimeToUtc,
  type DayLength,
  type SunDay,
} from "@moon-app/moon";
import { deserializeYear, type InitialYear } from "./year-data";
import {
  DEFAULT_PLACE,
  loadWorldCities,
  placeForTimeZone,
  placeLabel,
  searchCities,
  zonePlaceById,
  type EnPlace,
  type WorldCities,
} from "@/lib/en/places";

/**
 * Sunrise & Sunset aracı. Her şey tarayıcıda hesaplanır: sunucu (ve Google) New York için hazır HTML görür;
 * ziyaretçinin tarayıcısında şehir cihazın saat diliminden tahmin edilir ya da adresteki ?place= ile açılır.
 * Seçimler adrese yazılır (paylaşılabilir), ama sayfanın tek adresi (canonical) değişmez.
 */

const DAY_MS = 86_400_000;
const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const compass = (az: number) => COMPASS[Math.round(az / 22.5) % 16];

type Source = "default" | "guess" | "link" | "search" | "location";

/**
 * Yılın 365 günü (~0,4 sn hesap; telefonda daha uzun). Ekran donmasın diye 6'şar günlük parçalar halinde (her biri
 * ~10 ms), araya tarayıcıya nefes bırakarak hesaplanır; bitene kadar önceki yer/yıl verisi soluk gösterilir. Varsayılan yerin
 * yılı sunucudan hazır gelir (Google ve ilk açılış için).
 */
function useYearDays(year: number, place: EnPlace, initial: InitialYear | undefined) {
  const key = `${place.id}|${place.latitude}|${place.longitude}|${place.timeZone}|${year}`;
  const [state, setState] = useState<{ key: string; days: DayLength[] } | null>(() =>
    initial ? { key: `${DEFAULT_PLACE.id}|${DEFAULT_PLACE.latitude}|${DEFAULT_PLACE.longitude}|${DEFAULT_PLACE.timeZone}|${initial.year}`, days: deserializeYear(initial.days) } : null,
  );
  useEffect(() => {
    if (state?.key === key) return;
    let cancelled = false;
    const out: DayLength[] = [];
    const start = Date.UTC(year, 0, 1, 12);
    const end = Date.UTC(year + 1, 0, 1);
    let t = start;
    const step = () => {
      if (cancelled) return;
      for (let i = 0; i < 6 && t < end; i++, t += DAY_MS) out.push(getDayLength(new Date(t), place));
      if (t < end) setTimeout(step, 0);
      else setState({ key, days: out });
    };
    const first = setTimeout(step, 0);
    return () => {
      cancelled = true;
      clearTimeout(first);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { days: state?.days ?? null, stale: state?.key !== key };
}

export interface ExplorerRefs {
  usno: ReactNode;
  brahma: ReactNode;
  rahu: ReactNode;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function durationText(minutes: number) {
  const m = Math.round(minutes);
  return `${Math.floor(m / 60)}h ${pad(m % 60)}m`;
}

/** "+2m 14s" gibi gün uzunluğu farkı (saniye hassasiyetli). */
function changeText(seconds: number) {
  const s = Math.round(Math.abs(seconds));
  const sign = seconds > 0.5 ? "+" : seconds < -0.5 ? "−" : "±";
  return `${sign}${Math.floor(s / 60)}m ${pad(s % 60)}s`;
}

/** "17° south of due east" — doğuş/batış yönünün tam doğu/batıdan sapması. */
function offsetFromCardinal(az: number, kind: "rise" | "set") {
  const ref = kind === "rise" ? 90 : 270;
  const d = Math.round(az - ref);
  if (d === 0) return `due ${kind === "rise" ? "east" : "west"}`;
  const side = kind === "rise" ? (d < 0 ? "north" : "south") : d < 0 ? "south" : "north";
  return `${Math.abs(d)}° ${side} of due ${kind === "rise" ? "east" : "west"}`;
}

export function SunExplorer({
  initialNow,
  initialYear,
  refs,
}: {
  initialNow: string;
  initialYear?: InitialYear;
  refs: ExplorerRefs;
}) {
  const [place, setPlace] = useState<EnPlace>(DEFAULT_PLACE);
  const [source, setSource] = useState<Source>("default");
  const [dateIso, setDateIso] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date(initialNow));
  const [locale, setLocale] = useState("en-US");

  // İlk açılış: adresteki yer/tarih, yoksa cihazın saat diliminden tahmin; saat biçimi cihazın diline göre.
  useEffect(() => {
    setNow(new Date());
    const lang = navigator.language;
    if (lang?.toLowerCase().startsWith("en")) setLocale(lang);
    const params = new URLSearchParams(location.search);
    const date = params.get("date");
    const id = Number(params.get("place"));
    const applyDate = (p: EnPlace) => {
      const m = date && /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
      if (m) setDateIso(zonedTimeToUtc(Number(m[1]), Number(m[2]), Number(m[3]), 12, p.timeZone).toISOString());
    };
    if (id) {
      const quick = zonePlaceById(id);
      if (quick) {
        setPlace(quick);
        setSource("link");
        applyDate(quick);
        return;
      }
      loadWorldCities()
        .then((d) => {
          const i = d.byId.get(id);
          if (i === undefined) return;
          const p = d.places(i);
          setPlace(p);
          setSource("link");
          applyDate(p);
        })
        .catch(() => {});
      return;
    }
    const guess = placeForTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (guess) {
      setPlace(guess);
      setSource("guess");
      applyDate(guess);
    } else applyDate(DEFAULT_PLACE);
  }, []);

  // "Şu an" dakikada bir ilerler (güneş yolu grafiğindeki işaret, bugünün vurgusu).
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const choose = (p: EnPlace, how: Source) => {
    setPlace(p);
    setSource(how);
    setDateIso(null);
    writeUrl(p, null);
  };

  const date = dateIso ? new Date(dateIso) : now;
  const isToday = !dateIso;

  const fmt = useMemo(() => {
    const tz = place.timeZone;
    const time = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" });
    return {
      time: (d: Date | null) => (d ? time.format(d) : "–"),
      day: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      short: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "short", month: "short", day: "numeric" }),
      weekday: new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long" }),
      monthDay: new Intl.DateTimeFormat(locale, { timeZone: tz, month: "long", day: "numeric" }),
      clock24: new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
      clockSeconds: new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }),
      offset: new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" }),
      zoneName: new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: "short" }),
    };
  }, [place.timeZone, locale]);

  const local = localDateParts(date, place.timeZone);
  const dayKey = `${local.year}-${pad(local.month)}-${pad(local.day)}`;
  const dayNoon = zonedTimeToUtc(local.year, local.month, local.day, 12, place.timeZone);

  // Seçilen günün ayrıntıları ve sonraki 10 gün.
  const days = useMemo(
    () => Array.from({ length: 11 }, (_, i) => getSunDay(new Date(dayNoon.getTime() + (i - 1) * DAY_MS), place)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [place, dayKey],
  );
  const sun = days[1];
  const yesterday = days[0];
  const twilights = useMemo(() => getTwilights(dayNoon, place), [place, dayKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const path = useMemo(() => getSunPath(dayNoon, place, 10), [place, dayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const label = placeLabel(place);
  const weekdayIndex = new Date(Date.UTC(local.year, local.month - 1, local.day)).getUTCDay();
  const zone = fmt.zoneName.formatToParts(dayNoon).find((p) => p.type === "timeZoneName")?.value ?? place.timeZone;

  return (
    <div>
      <PlacePicker place={place} label={label} source={source} dateKey={dayKey} isToday={isToday} onPlace={choose} onDate={(iso) => {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
        if (!m) return;
        const d = zonedTimeToUtc(Number(m[1]), Number(m[2]), Number(m[3]), 12, place.timeZone);
        setDateIso(d.toISOString());
        writeUrl(place, iso);
      }} onToday={() => {
        setDateIso(null);
        writeUrl(place, null);
      }} />

      <TodaySection sun={sun} yesterday={yesterday} fmt={fmt} label={label} isToday={isToday} dayText={fmt.day.format(dayNoon)} zone={zone} />

      <SunPathChart path={path} sun={sun} twilights={twilights} now={isToday ? now : null} fmt={fmt} label={label} />

      <NextDays days={days.slice(1)} fmt={fmt} label={label} todayKey={isToday ? dayKey : null} place={place} startNoon={dayNoon} />

      <TwilightTable twilights={twilights} sun={sun} fmt={fmt} usnoRef={refs.usno} />

      <YearSection place={place} year={local.year} fmt={fmt} label={label} todayIndex={dayOfYear(local)} initial={initialYear} />

      <DirectionSection sun={sun} place={place} year={local.year} label={label} />

      <HinduTimes sun={sun} weekday={fmt.weekday.format(dayNoon)} weekdayIndex={weekdayIndex} fmt={fmt} label={label} refs={refs} />
    </div>
  );
}

function writeUrl(p: EnPlace, date: string | null) {
  const params = new URLSearchParams();
  if (p.id) params.set("place", String(p.id));
  if (date) params.set("date", date);
  const q = params.toString();
  history.replaceState(history.state, "", q ? `?${q}` : location.pathname);
}

function dayOfYear(p: { year: number; month: number; day: number }) {
  return Math.round((Date.UTC(p.year, p.month - 1, p.day) - Date.UTC(p.year, 0, 1)) / DAY_MS);
}

type Fmt = {
  time: (d: Date | null) => string;
  day: Intl.DateTimeFormat;
  short: Intl.DateTimeFormat;
  monthDay: Intl.DateTimeFormat;
  clock24: Intl.DateTimeFormat;
  clockSeconds: Intl.DateTimeFormat;
  offset: Intl.DateTimeFormat;
};

/* ───────────────────────── Yer ve tarih seçimi ───────────────────────── */

function PlacePicker({
  place,
  label,
  source,
  dateKey,
  isToday,
  onPlace,
  onDate,
  onToday,
}: {
  place: EnPlace;
  label: string;
  source: Source;
  dateKey: string;
  isToday: boolean;
  onPlace: (p: EnPlace, how: Source) => void;
  onDate: (iso: string) => void;
  onToday: () => void;
}) {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<WorldCities | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const box = useRef<HTMLDivElement>(null);

  const ensure = () => {
    if (data || loading) return;
    setLoading(true);
    loadWorldCities()
      .then(setData)
      .catch(() => setMessage("The city list couldn't be loaded. Please refresh and try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const results = data ? searchCities(data, query) : [];

  const pick = (p: EnPlace) => {
    onPlace(p, "search");
    setQuery("");
    setOpen(false);
    setMessage("");
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setMessage("Your browser doesn't support location sharing.");
      return;
    }
    setMessage("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onPlace(
          {
            id: 0,
            name: "Your location",
            country: "",
            admin: "",
            latitude: Math.round(pos.coords.latitude * 1e4) / 1e4,
            longitude: Math.round(pos.coords.longitude * 1e4) / 1e4,
            elevation: 0,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          },
          "location",
        );
        setMessage("");
      },
      () => setMessage("We couldn't get your location. Check your browser's permission, or type a city instead."),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 600_000 },
    );
  };

  const why =
    source === "guess"
      ? "picked from your device's time zone"
      : source === "default"
        ? "default city"
        : source === "location"
          ? "your location stays on your device"
          : null;

  return (
    <section aria-label="Choose a place and date" className="rounded-2xl bg-[#05070d] p-5 text-white sm:p-6">
      <p className="text-sm text-zinc-400">
        Showing <span className="font-semibold text-white">{label}</span>
        {why && <span> · {why}</span>}
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div ref={box} className="relative min-w-60 flex-[2]">
          <label htmlFor="city-search" className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            City or town
          </label>
          <input
            id="city-search"
            type="search"
            autoComplete="off"
            placeholder="Type a city, e.g. Chicago or Pune"
            value={query}
            onFocus={() => {
              ensure();
              setOpen(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              ensure();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                e.preventDefault();
                pick(results[0]);
              }
              if (e.key === "Escape") setOpen(false);
            }}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-base text-white placeholder:text-zinc-500 focus:border-white/40 focus:outline-none"
          />
          {open && query.trim().length >= 2 && (
            <ul className="absolute z-30 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-white/10 bg-[#0d111c] py-1 shadow-2xl">
              {loading && <li className="px-3 py-2 text-sm text-zinc-400">Loading the city list…</li>}
              {!loading && data && results.length === 0 && (
                <li className="px-3 py-2 text-sm text-zinc-400">No match. Try a larger town nearby.</li>
              )}
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pick(p)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-white/5"
                  >
                    {placeLabel(p)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={locate}
          className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
        >
          Use my location
        </button>
        <label className="flex flex-col text-xs font-semibold uppercase tracking-wider text-amber-300">
          Date
          <input
            type="date"
            min="1900-01-01"
            max="2100-12-31"
            value={dateKey}
            onChange={(e) => onDate(e.target.value)}
            className="mt-1 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-base font-normal normal-case tracking-normal text-white [color-scheme:dark]"
          />
        </label>
        {!isToday && (
          <button type="button" onClick={onToday} className="rounded-xl px-3 py-2.5 text-sm text-amber-300 hover:bg-white/10">
            Back to today
          </button>
        )}
      </div>
      {message && <p className="mt-3 text-sm text-zinc-300">{message}</p>}
      <p className="mt-3 text-xs text-zinc-500">
        {place.id === 0
          ? "Times are calculated in your browser; your location isn't sent anywhere."
          : "Place list: GeoNames (CC BY 4.0). Times are for the city center and a flat horizon."}
      </p>
    </section>
  );
}

/* ───────────────────────── Bugün ───────────────────────── */

function polarRise(s: DayLength) {
  return s.polar === "day" ? "Sun doesn't set" : s.polar === "night" ? "Sun doesn't rise" : "–";
}

function TodaySection({
  sun,
  yesterday,
  fmt,
  label,
  isToday,
  dayText,
  zone,
}: {
  sun: SunDay;
  yesterday: SunDay;
  fmt: Fmt;
  label: string;
  isToday: boolean;
  dayText: string;
  zone: string;
}) {
  const change = (sun.minutes - yesterday.minutes) * 60;
  return (
    <section aria-labelledby="today" className="mt-8">
      <h2 id="today" data-toc-label="Today" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        {isToday ? "Today" : dayText.split(",").slice(0, 2).join(",")} in {label}
      </h2>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        {dayText} · times in local time ({zone})
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BigCard
          label="Sunrise"
          value={sun.rise ? fmt.time(sun.rise) : polarRise(sun)}
          sub={sun.riseAzimuth !== null ? `${compass(sun.riseAzimuth)} · ${Math.round(sun.riseAzimuth)}°` : undefined}
        />
        <BigCard
          label="Sunset"
          value={sun.set ? fmt.time(sun.set) : polarRise(sun)}
          sub={sun.setAzimuth !== null ? `${compass(sun.setAzimuth)} · ${Math.round(sun.setAzimuth)}°` : undefined}
        />
        <BigCard label="Dark at" value={fmt.time(sun.civilDusk)} sub="end of civil twilight" accent />
        <BigCard label="Daylight" value={durationText(sun.minutes)} sub={`${changeText(change)} vs. the day before`} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-zinc-200 bg-white p-5 text-sm sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Fact label="First light" value={fmt.time(sun.civilDawn)} note="sky starts to brighten" />
        <Fact label="Solar noon" value={fmt.time(sun.transit)} note={`sun ${Math.round(sun.transitAltitude)}° high`} />
        <Fact
          label="Golden hour (evening)"
          value={sun.goldenEveningStart && sun.set ? `${fmt.time(sun.goldenEveningStart)}–${fmt.time(sun.set)}` : "–"}
          note="soft light for photos"
        />
        <Fact
          label="Golden hour (morning)"
          value={sun.rise && sun.goldenMorningEnd ? `${fmt.time(sun.rise)}–${fmt.time(sun.goldenMorningEnd)}` : "–"}
          note="after sunrise"
        />
      </dl>
    </section>
  );
}

function BigCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 text-white sm:p-5 ${accent ? "bg-[#1b1440]" : "bg-[#05070d]"}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{label}</p>
      <p className="mt-1 text-3xl font-extralight tabular-nums sm:text-4xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}

function Fact({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
      <dd className="text-xs text-zinc-500">{note}</dd>
    </div>
  );
}

/* ───────────────────────── Güneş yolu ───────────────────────── */

const BANDS: { from: number; to: number; fill: string; name: string }[] = [
  { from: -90, to: -18, fill: "#070a17", name: "Night" },
  { from: -18, to: -12, fill: "#111733", name: "Astronomical twilight" },
  { from: -12, to: -6, fill: "#1c2552", name: "Nautical twilight" },
  { from: -6, to: 0, fill: "#33407a", name: "Civil twilight (dawn / dusk)" },
  { from: 0, to: 6, fill: "#b45309", name: "Golden hour" },
  { from: 6, to: 90, fill: "#1d4e74", name: "Daylight" },
];

function SunPathChart({
  path,
  sun,
  twilights,
  now,
  fmt,
  label,
}: {
  path: { time: Date; altitude: number }[];
  sun: SunDay;
  twilights: ReturnType<typeof getTwilights>;
  now: Date | null;
  fmt: Fmt;
  label: string;
}) {
  const W = 720;
  const H = 240;
  const start = path[0].time.getTime();
  const span = path[path.length - 1].time.getTime() - start;
  const top = Math.max(30, Math.ceil((sun.transitAltitude + 6) / 10) * 10);
  const bottom = -30;
  const x = (t: number) => ((t - start) / span) * W;
  const y = (alt: number) => ((top - Math.max(bottom, Math.min(top, alt))) / (top - bottom)) * H;
  const d = path.map((p, i) => `${i ? "L" : "M"}${x(p.time.getTime()).toFixed(1)},${y(p.altitude).toFixed(1)}`).join("");
  const hours = Array.from({ length: 9 }, (_, i) => start + (i * span) / 8);
  const nowX = now && now.getTime() >= start && now.getTime() <= start + span ? x(now.getTime()) : null;
  const marks = [
    { t: twilights.civil.dawn, text: "first light" },
    { t: sun.rise, text: "sunrise" },
    { t: sun.set, text: "sunset" },
    { t: twilights.civil.dusk, text: "dark" },
  ].filter((m): m is { t: Date; text: string } => m.t !== null);

  return (
    <section aria-labelledby="sun-path" className="mt-12">
      <h2 id="sun-path" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        The sun&apos;s path today
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        How high the sun is above (or below) the horizon in {label}, hour by hour. The colored bands show when the sky
        is fully dark, when twilight starts, and when the light turns golden.
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl bg-[#05070d] p-3 sm:p-4">
        <svg viewBox={`0 0 ${W} ${H + 26}`} className="w-full" role="img" aria-label={`Sun altitude through the day in ${label}`}>
          {BANDS.map((b) => (
            <rect key={b.name} x={0} width={W} y={y(b.to)} height={Math.max(0, y(b.from) - y(b.to))} fill={b.fill} />
          ))}
          <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="#fbbf24" strokeOpacity={0.6} strokeDasharray="4 4" />
          <text x={6} y={y(0) - 5} fill="#fde68a" fontSize={11}>
            horizon
          </text>
          {marks.map((m) => (
            <g key={m.text}>
              <line x1={x(m.t.getTime())} x2={x(m.t.getTime())} y1={0} y2={H} stroke="#fff" strokeOpacity={0.18} />
            </g>
          ))}
          <path d={d} fill="none" stroke="#fde68a" strokeWidth={2.5} />
          {nowX !== null && now && (
            <g>
              <line x1={nowX} x2={nowX} y1={0} y2={H} stroke="#f472b6" strokeWidth={1.5} />
              <circle cx={nowX} cy={y(path.reduce((a, p) => (Math.abs(p.time.getTime() - now.getTime()) < Math.abs(a.time.getTime() - now.getTime()) ? p : a)).altitude)} r={5} fill="#f472b6" />
              <text x={Math.min(nowX + 6, W - 30)} y={14} fill="#f9a8d4" fontSize={11}>
                now
              </text>
            </g>
          )}
          {hours.map((t, i) => (
            <text
              key={i}
              x={x(t)}
              y={H + 18}
              fill="#a1a1aa"
              fontSize={11}
              textAnchor={i === 0 ? "start" : i === hours.length - 1 ? "end" : "middle"}
            >
              {fmt.clock24.format(new Date(t))}
            </text>
          ))}
        </svg>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 px-1 text-xs text-zinc-300">
          {[...BANDS].reverse().map((b) => (
            <li key={b.name} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-3 w-3 rounded-sm" style={{ background: b.fill, outline: "1px solid rgba(255,255,255,.2)" }} />
              {b.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────────────────── Sonraki günler / ay ───────────────────────── */

function NextDays({
  days,
  fmt,
  label,
  todayKey,
  place,
  startNoon,
}: {
  days: SunDay[];
  fmt: Fmt;
  label: string;
  todayKey: string | null;
  place: EnPlace;
  startNoon: Date;
}) {
  const [month, setMonth] = useState(false);
  const p = localDateParts(startNoon, place.timeZone);
  const monthDays = useMemo(() => {
    if (!month) return null;
    const count = new Date(Date.UTC(p.year, p.month, 0)).getUTCDate();
    return Array.from({ length: count + 1 }, (_, i) =>
      getSunDay(zonedTimeToUtc(p.year, p.month, i, 12, place.timeZone), place),
    );
  }, [month, p.year, p.month, place]);
  const rows = monthDays ? monthDays.slice(1) : days;
  const prev = monthDays ? monthDays.slice(0, -1) : null;
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(p.year, p.month - 1, 15)),
  );
  const keyOf = (d: SunDay) => {
    const l = localDateParts(d.noon, place.timeZone);
    return `${l.year}-${pad(l.month)}-${pad(l.day)}`;
  };

  return (
    <section aria-labelledby="next-days" className="mt-12">
      <h2 id="next-days" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        {monthDays ? `Sunrise and sunset in ${label}, ${monthName}` : `Sunrise and sunset in ${label}: the next 10 days`}
      </h2>
      <div className="mt-3 flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMonth(false)}
          aria-pressed={!month}
          className={`rounded-full px-4 py-1.5 font-medium ${!month ? "bg-[#05070d] text-white" : "border border-zinc-300 dark:border-zinc-700"}`}
        >
          Next 10 days
        </button>
        <button
          type="button"
          onClick={() => setMonth(true)}
          aria-pressed={month}
          className={`rounded-full px-4 py-1.5 font-medium ${month ? "bg-[#05070d] text-white" : "border border-zinc-300 dark:border-zinc-700"}`}
        >
          Whole month
        </button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[36rem] text-left text-[0.9375rem]">
          <thead className="bg-zinc-100 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <tr>
              {["Date", "First light", "Sunrise", "Sunset", "Dark at", "Daylight", "Change"].map((c) => (
                <th key={c} scope="col" className="px-3 py-2.5 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => {
              const before = prev ? prev[i] : i === 0 ? null : rows[i - 1];
              const k = keyOf(d);
              return (
                <tr
                  key={k}
                  className={`border-t border-zinc-200 tabular-nums dark:border-zinc-800 ${k === todayKey ? "bg-indigo-50 dark:bg-indigo-950/40" : "even:bg-zinc-50 dark:even:bg-zinc-900"}`}
                >
                  <th scope="row" className="px-3 py-2 font-medium">
                    {fmt.short.format(d.noon)}
                  </th>
                  <td className="px-3 py-2">{fmt.time(d.civilDawn)}</td>
                  <td className="px-3 py-2">{d.rise ? fmt.time(d.rise) : polarRise(d)}</td>
                  <td className="px-3 py-2">{d.set ? fmt.time(d.set) : polarRise(d)}</td>
                  <td className="px-3 py-2">{fmt.time(d.civilDusk)}</td>
                  <td className="px-3 py-2">{durationText(d.minutes)}</td>
                  <td className="px-3 py-2 text-zinc-500">{before ? changeText((d.minutes - before.minutes) * 60) : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        &quot;First light&quot; and &quot;dark at&quot; are the start and end of civil twilight, when the sun is 6° below the horizon.
      </p>
    </section>
  );
}

function TwilightTable({
  twilights,
  sun,
  fmt,
  usnoRef,
}: {
  twilights: ReturnType<typeof getTwilights>;
  sun: SunDay;
  fmt: Fmt;
  usnoRef: ReactNode;
}) {
  const rows = [
    { name: "Astronomical twilight", deg: "18°", morning: twilights.astronomical.dawn, evening: twilights.astronomical.dusk, what: "Before this in the morning and after it in the evening, the sky is fully dark: the best time for faint stars and the Milky Way." },
    { name: "Nautical twilight", deg: "12°", morning: twilights.nautical.dawn, evening: twilights.nautical.dusk, what: "The horizon is still visible at sea; bright stars are out." },
    { name: "Civil twilight", deg: "6°", morning: twilights.civil.dawn, evening: twilights.civil.dusk, what: "Enough light to be outdoors without a lamp. This is what we call first light and dark." },
  ];
  return (
    <details className="mt-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <summary className="cursor-pointer px-5 py-4 font-semibold">All three kinds of twilight, for this day</summary>
      <div className="overflow-x-auto border-t border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
            <tr>
              <th className="px-4 py-2 font-semibold">Twilight</th>
              <th className="px-4 py-2 font-semibold">Sun below horizon</th>
              <th className="px-4 py-2 font-semibold">Morning starts</th>
              <th className="px-4 py-2 font-semibold">Evening ends</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-zinc-200 align-top dark:border-zinc-800">
                <th scope="row" className="px-4 py-2.5 font-medium">
                  {r.name}
                  <span className="mt-0.5 block text-xs font-normal text-zinc-500">{r.what}</span>
                </th>
                <td className="px-4 py-2.5 tabular-nums">{r.deg}</td>
                <td className="px-4 py-2.5 tabular-nums">{r.morning ? fmt.time(r.morning) : "doesn't happen"}</td>
                <td className="px-4 py-2.5 tabular-nums">{r.evening ? fmt.time(r.evening) : "doesn't happen"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-zinc-200 px-5 py-3 text-xs text-zinc-500 dark:border-zinc-800">
        Definitions follow the U.S. Naval Observatory.{usnoRef} In summer far from the equator, the sun may not sink low
        enough for the darker twilights; the table then says &quot;doesn&apos;t happen&quot;. Solar noon today:{" "}
        {fmt.time(sun.transit)}.
      </p>
    </details>
  );
}

/* ───────────────────────── Yıl ───────────────────────── */

function YearSection({
  place,
  year,
  fmt,
  label,
  todayIndex,
  initial,
}: {
  place: EnPlace;
  year: number;
  fmt: Fmt;
  label: string;
  todayIndex: number;
  initial: InitialYear | undefined;
}) {
  const { days: yearDays, stale } = useYearDays(year, place, initial);
  const data = useMemo(() => {
    if (!yearDays) return null;
    const days = yearDays;
    // Saniye hassasiyetli günün saati (en erken/en geç günü doğru seçmek için); grafikte dakikaya çevrilir.
    const mod = (d: Date | null) => {
      if (!d) return null;
      const [h, m, s] = fmt.clockSeconds.format(d).split(":").map(Number);
      return h * 60 + m + s / 60;
    };
    const offsets = days.map((d) => fmt.offset.formatToParts(d.noon).find((p) => p.type === "timeZoneName")?.value ?? "");
    const changes: { before: DayLength; after: DayLength; from: string; to: string }[] = [];
    for (let i = 1; i < days.length; i++) {
      if (offsets[i] !== offsets[i - 1]) changes.push({ before: days[i - 1], after: days[i], from: offsets[i - 1], to: offsets[i] });
    }
    const pick = (cmp: (a: number, b: number) => boolean, key: "rise" | "set") => {
      let best: DayLength | null = null;
      for (const d of days) {
        const v = mod(d[key]);
        if (v === null) continue;
        if (!best || cmp(v, mod(best[key])!)) best = d;
      }
      return best;
    };
    const longest = days.reduce((a, b) => (b.minutes > a.minutes ? b : a));
    const shortest = days.reduce((a, b) => (b.minutes < a.minutes ? b : a));
    // Kutup bölgeleri: gece yarısı güneşi ve kutup gecesi aralıkları (yıl başını/sonunu aşan aralık iki parça olur).
    const ranges = (kind: "day" | "night") => {
      const out: { from: DayLength; to: DayLength }[] = [];
      let from: DayLength | null = null;
      days.forEach((d, i) => {
        if (d.polar === kind) from ??= d;
        if (from && (d.polar !== kind || i === days.length - 1)) {
          out.push({ from, to: d.polar === kind ? d : days[i - 1] });
          from = null;
        }
      });
      return out;
    };
    return {
      midnightSun: ranges("day"),
      polarNight: ranges("night"),
      days,
      mods: days.map((d) => ({ rise: mod(d.rise), set: mod(d.set) })),
      changes,
      earliestRise: pick((a, b) => a < b, "rise"),
      latestRise: pick((a, b) => a > b, "rise"),
      earliestSet: pick((a, b) => a < b, "set"),
      latestSet: pick((a, b) => a > b, "set"),
      longest,
      shortest,
    };
  }, [yearDays, fmt]);

  if (!data) {
    return (
      <section aria-labelledby="year" className="mt-12">
        <h2 id="year" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
          Sunrise and sunset through {year} in {label}
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Working out the whole year…</p>
        <div className="mt-4 aspect-[3/1] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </section>
    );
  }

  const W = 720;
  const H = 240;
  const n = data.days.length;
  const colW = W / n;
  const yy = (m: number) => (m / 1440) * H;
  const monthTicks = Array.from({ length: 12 }, (_, i) => Math.round((Date.UTC(year, i, 1) - Date.UTC(year, 0, 1)) / DAY_MS));

  return (
    <section aria-labelledby="year" className="mt-12">
      <h2 id="year" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Sunrise and sunset through {year} in {label}
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        The golden band is daylight: its top edge is sunrise, its bottom edge sunset. Steps in the band are clock
        changes for daylight saving time.
      </p>
      <div aria-busy={stale} className={`mt-4 rounded-2xl bg-[#05070d] p-3 transition-opacity sm:p-4 ${stale ? "opacity-40" : ""}`}>
        <svg viewBox={`0 0 ${W + 34} ${H + 24}`} className="w-full" role="img" aria-label={`Daylight hours through ${year} in ${label}`}>
          <g transform="translate(34,0)">
            <rect x={0} y={0} width={W} height={H} fill="#0b1024" />
            {data.days.map((d, i) => {
              const m = data.mods[i];
              if (d.polar === "day") return <rect key={i} x={i * colW} y={0} width={colW + 0.6} height={H} fill="#f59e0b" />;
              if (m.rise === null || m.set === null) return null;
              const a = Math.min(m.rise, m.set);
              const b = Math.max(m.rise, m.set);
              return <rect key={i} x={i * colW} y={yy(a)} width={colW + 0.6} height={yy(b) - yy(a)} fill="#f59e0b" />;
            })}
            {[6, 12, 18].map((h) => (
              <line key={h} x1={0} x2={W} y1={yy(h * 60)} y2={yy(h * 60)} stroke="#fff" strokeOpacity={0.15} />
            ))}
            {monthTicks.map((t, i) => (
              <text key={i} x={(t + 15) * colW} y={H + 16} fill="#a1a1aa" fontSize={11} textAnchor="middle">
                {"JFMAMJJASOND"[i]}
              </text>
            ))}
            {todayIndex >= 0 && todayIndex < n && (
              <line x1={(todayIndex + 0.5) * colW} x2={(todayIndex + 0.5) * colW} y1={0} y2={H} stroke="#f472b6" strokeWidth={1.5} />
            )}
          </g>
          {[0, 6, 12, 18, 24].map((h) => (
            <text key={h} x={28} y={Math.min(H, Math.max(10, yy(h * 60) + 4))} fill="#a1a1aa" fontSize={11} textAnchor="end">
              {pad(h % 24)}h
            </text>
          ))}
        </svg>
      </div>
      <div className={`mt-4 overflow-x-auto rounded-xl border border-zinc-200 transition-opacity dark:border-zinc-800 ${stale ? "opacity-40" : ""}`}>
        <table className="w-full min-w-[30rem] text-left text-[0.9375rem]">
          <tbody>
            {data.midnightSun.length || data.polarNight.length ? (
              <>
                {data.midnightSun.map((r) => (
                  <RangeRow key={r.from.noon.getTime()} label="Midnight sun (the sun never sets)" from={r.from} to={r.to} fmt={fmt} />
                ))}
                {data.polarNight.map((r) => (
                  <RangeRow key={r.from.noon.getTime()} label="Polar night (the sun never rises)" from={r.from} to={r.to} fmt={fmt} />
                ))}
              </>
            ) : (
              <>
                <YearRow label="Longest day" day={data.longest} value={durationText(data.longest.minutes)} fmt={fmt} />
                <YearRow label="Shortest day" day={data.shortest} value={durationText(data.shortest.minutes)} fmt={fmt} />
                {data.earliestRise && <YearRow label="Earliest sunrise" day={data.earliestRise} value={fmt.time(data.earliestRise.rise)} fmt={fmt} />}
                {data.latestRise && <YearRow label="Latest sunrise" day={data.latestRise} value={fmt.time(data.latestRise.rise)} fmt={fmt} />}
                {data.earliestSet && <YearRow label="Earliest sunset" day={data.earliestSet} value={fmt.time(data.earliestSet.set)} fmt={fmt} />}
                {data.latestSet && <YearRow label="Latest sunset" day={data.latestSet} value={fmt.time(data.latestSet.set)} fmt={fmt} />}
              </>
            )}
          </tbody>
        </table>
      </div>

      <h3 id="clocks" className="mt-8 scroll-mt-32 text-xl font-semibold">
        What time does it get dark when the clocks change?
      </h3>
      {data.changes.length === 0 ? (
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          {label} doesn&apos;t change its clocks in {year}, so sunset moves only a little from one day to the next, all
          year.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {data.changes.map((c) => {
            const forward = parseOffset(c.to) > parseOffset(c.from);
            return (
              <li key={c.after.noon.toISOString()} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="font-semibold">
                  {fmt.monthDay.format(c.after.noon)}: clocks go {forward ? "forward" : "back"} one hour
                </p>
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">
                  Sunset jumps from {fmt.time(c.before.set)} to {fmt.time(c.after.set)} on the clock
                  {forward ? ", so evenings suddenly stay light an hour longer." : ", so it gets dark an hour earlier overnight."}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function RangeRow({ label, from, to, fmt }: { label: string; from: DayLength; to: DayLength; fmt: Fmt }) {
  const days = Math.round((to.noon.getTime() - from.noon.getTime()) / DAY_MS) + 1;
  return (
    <tr className="border-t border-zinc-200 first:border-0 even:bg-zinc-50 dark:border-zinc-800 dark:even:bg-zinc-900">
      <th scope="row" className="px-4 py-2.5 font-medium">
        {label}
      </th>
      <td className="px-4 py-2.5">
        {fmt.monthDay.format(from.noon)} to {fmt.monthDay.format(to.noon)}
      </td>
      <td className="px-4 py-2.5 font-semibold tabular-nums">{days} days</td>
    </tr>
  );
}

/** "GMT-5" → -300 (dakika). */
function parseOffset(s: string) {
  const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(s);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

function YearRow({ label, day, value, fmt }: { label: string; day: DayLength; value: string; fmt: Fmt }) {
  return (
    <tr className="border-t border-zinc-200 first:border-0 even:bg-zinc-50 dark:border-zinc-800 dark:even:bg-zinc-900">
      <th scope="row" className="px-4 py-2.5 font-medium">
        {label}
      </th>
      <td className="px-4 py-2.5">{fmt.monthDay.format(day.noon)}</td>
      <td className="px-4 py-2.5 font-semibold tabular-nums">{value}</td>
    </tr>
  );
}

/* ───────────────────────── Yön ───────────────────────── */

function DirectionSection({ sun, place, year, label }: { sun: SunDay; place: EnPlace; year: number; label: string }) {
  const solstices = useMemo(() => {
    const s = getSeasons(year);
    return { june: getSunDay(s.juneSolstice, place), december: getSunDay(s.decemberSolstice, place) };
  }, [year, place]);
  const R = 100;
  const C = 120;
  const ray = (az: number, len = R) => {
    const a = ((az - 90) * Math.PI) / 180;
    return { x: C + len * Math.cos(a), y: C + len * Math.sin(a) };
  };
  const lines = [
    { az: solstices.june.riseAzimuth, color: "#93c5fd", dash: "4 4" },
    { az: solstices.june.setAzimuth, color: "#93c5fd", dash: "4 4" },
    { az: solstices.december.riseAzimuth, color: "#c4b5fd", dash: "4 4" },
    { az: solstices.december.setAzimuth, color: "#c4b5fd", dash: "4 4" },
    { az: sun.riseAzimuth, color: "#fbbf24", dash: undefined },
    { az: sun.setAzimuth, color: "#f97316", dash: undefined },
  ];

  return (
    <section aria-labelledby="direction" className="mt-12">
      <h2 id="direction" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Does the sun rise exactly in the east?
      </h2>
      <div className="mt-4 grid items-center gap-6 md:grid-cols-[240px_1fr]">
        <svg viewBox="0 0 240 240" className="mx-auto w-60 rounded-full bg-[#05070d]" role="img" aria-label={`Sunrise and sunset directions in ${label}`}>
          <circle cx={C} cy={C} r={R} fill="none" stroke="#fff" strokeOpacity={0.25} />
          {["N", "E", "S", "W"].map((t, i) => {
            const p = ray(i * 90, R + 12);
            return (
              <text key={t} x={p.x} y={p.y + 4} fill="#e4e4e7" fontSize={13} fontWeight={600} textAnchor="middle">
                {t}
              </text>
            );
          })}
          {lines.map((l, i) =>
            l.az === null ? null : (
              <line key={i} x1={C} y1={C} x2={ray(l.az).x} y2={ray(l.az).y} stroke={l.color} strokeWidth={l.dash ? 1.5 : 3} strokeDasharray={l.dash} />
            ),
          )}
          <circle cx={C} cy={C} r={4} fill="#fff" />
        </svg>
        <div className="text-zinc-700 dark:text-zinc-300">
          {sun.riseAzimuth !== null && sun.setAzimuth !== null ? (
            <p>
              <span className="font-semibold text-amber-600 dark:text-amber-300">Today</span> the sun rises{" "}
              {offsetFromCardinal(sun.riseAzimuth, "rise")} ({compass(sun.riseAzimuth)}, {Math.round(sun.riseAzimuth)}°) and sets{" "}
              {offsetFromCardinal(sun.setAzimuth, "set")} ({compass(sun.setAzimuth)}, {Math.round(sun.setAzimuth)}°).
            </p>
          ) : (
            <p>The sun doesn&apos;t rise or set here on this day.</p>
          )}
          {solstices.june.riseAzimuth !== null && solstices.december.riseAzimuth !== null && (
            <p className="mt-3">
              Over the year, sunrise swings between{" "}
              <span className="font-semibold text-sky-700 dark:text-sky-300">{Math.round(solstices.june.riseAzimuth)}° at the June solstice</span>{" "}
              and{" "}
              <span className="font-semibold text-violet-700 dark:text-violet-300">
                {Math.round(solstices.december.riseAzimuth)}° at the December solstice
              </span>
              . It comes up due east (90°) only around the equinoxes in March and September.
            </p>
          )}
          <p className="mt-3 text-sm text-zinc-500">
            Compass bearings: north 0°, east 90°, south 180°, west 270°. The thick lines are today; dashed lines are the
            solstices.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Hindu zamanları ───────────────────────── */

function HinduTimes({
  sun,
  weekday,
  weekdayIndex,
  fmt,
  label,
  refs,
}: {
  sun: SunDay;
  weekday: string;
  weekdayIndex: number;
  fmt: Fmt;
  label: string;
  refs: ExplorerRefs;
}) {
  const rahu = getRahuKaal(sun.rise, sun.set, weekdayIndex);
  const brahma = getBrahmaMuhurta(sun.rise);
  return (
    <section aria-labelledby="hindu-times" className="mt-12 rounded-2xl bg-gradient-to-br from-[#1a1033] to-[#05070d] p-5 text-white sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
          Traditional calendar
        </span>
        <span className="text-sm text-zinc-400">Calculated from sunrise and sunset; not astronomy</span>
      </div>
      <h2 id="hindu-times" className="mt-3 scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Brahma Muhurta and Rahu Kaal in {label}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white/[0.06] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Brahma Muhurta</p>
          <p className="mt-1 text-2xl font-light tabular-nums">{brahma ? `${fmt.time(brahma.start)}–${fmt.time(brahma.end)}` : "–"}</p>
          <p className="mt-1 text-sm text-zinc-400">96 to 48 minutes before sunrise</p>
        </div>
        <div className="rounded-xl bg-white/[0.06] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Rahu Kaal · {weekday}</p>
          <p className="mt-1 text-2xl font-light tabular-nums">{rahu ? `${fmt.time(rahu.start)}–${fmt.time(rahu.end)}` : "–"}</p>
          <p className="mt-1 text-sm text-zinc-400">one eighth of the daytime, set by the weekday</p>
        </div>
      </div>
      <div className="mt-5 space-y-3 text-[0.9375rem] leading-relaxed text-zinc-300">
        <p>
          <strong className="text-white">Brahma Muhurta</strong> is the early-morning period that Hindu tradition holds
          best for prayer, meditation and study. The common reckoning puts it between the fourth and the second ghatika
          before sunrise; a ghatika is 24 minutes, so that is 96 to 48 minutes before sunrise.{refs.brahma} Some
          traditions count only the 48 minutes before sunrise, or the hour and a half before it.
        </p>
        <p>
          <strong className="text-white">Rahu Kaal</strong> (Rahu Kalam) is a stretch of about an hour and a half that is
          traditionally avoided for starting anything new. The daytime, from sunrise to sunset, is split into eight equal
          parts, and the weekday picks which part: Monday the 2nd, Saturday the 3rd, Friday the 4th, Wednesday the 5th,
          Thursday the 6th, Tuesday the 7th and Sunday the 8th.{refs.rahu} Because the parts follow your local sunrise
          and sunset, Rahu Kaal shifts with the season and from city to city, which is why a fixed table like
          &quot;7:30 to 9 on Mondays&quot; is only an approximation.
        </p>
        <p className="text-sm text-zinc-400">
          We give these times as a calendar tradition and make no claims about their effects. Temples and family
          panchangs may follow a different reckoning; for rituals, go by your own tradition.
        </p>
      </div>
    </section>
  );
}
