"use client";

import { useMemo, useState } from "react";
import {
  getActiveShowers,
  getRadiantPosition,
  getShowerPeak,
  getUpcomingMeteorShowers,
  localDateParts,
  METEOR_SHOWERS,
  tryMeteorNight,
  zonedTimeToUtc,
  type MeteorNight,
  type MeteorShower,
} from "@moon-app/moon";
import { MeteorSimulator } from "@/components/MeteorSimulator";
import { PlacePicker, usePlaceAndDate } from "@/components/en/PlacePicker";
import { googleCalendarUrl, icsDataUrl } from "@/lib/en/calendar-event";
import { EN_SHOWERS, EN_SKIES, compassWord, enShowerName, isMajorShower, rateText, verdict } from "@/lib/en/meteor-showers";
import { placeLabel, type EnPlace } from "@/lib/en/places";
import { siteConfig } from "@/site.config";

/**
 * Meteor Showers aracı. Her şey tarayıcıda hesaplanır: sunucu (ve Google) New York için hazır HTML görür; ziyaretçinin
 * tarayıcısında şehir cihazın saat diliminden tahmin edilir ya da ?place= ile açılır. Doruk anları her yerde aynıdır;
 * en iyi saat, radyantın yüksekliği, ay ve saatte kaç meteor yere göre değişir.
 */

const DAY_MS = 86_400_000;
const PAGE_URL = `${siteConfig.url}/en/meteor-showers`;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type Fmt = ReturnType<typeof makeFmt>;

function makeFmt(locale: string, tz: string) {
  const time = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" });
  return {
    time: (d: Date) => time.format(d),
    long: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    short: new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "short", month: "short", day: "numeric" }),
    md: new Intl.DateTimeFormat(locale, { timeZone: tz, month: "short", day: "numeric" }),
    zone: (d: Date) => new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: "short" }).formatToParts(d).find((p) => p.type === "timeZoneName")?.value ?? tz,
  };
}

/** "Dec 13–14": gecenin başladığı ve bittiği yerel günler. */
function nightDates(n: MeteorNight, fmt: Fmt) {
  const a = fmt.md.format(n.dusk);
  const b = fmt.md.format(n.dawn);
  if (a === b) return a;
  const [am, ad] = a.split(" ");
  const [bm, bd] = b.split(" ");
  return am === bm && ad && bd ? `${am} ${ad}–${bd}` : `${a}–${b}`;
}

function moonNote(n: MeteorNight): string {
  const pct = Math.round(n.moonIllumination * 100);
  const nightMin = (n.dawn.getTime() - n.dusk.getTime()) / 60_000;
  const share = n.moonUpMinutes / nightMin;
  if (pct < 15 || share < 0.15) return `The moon (${pct}% lit) is out of the way: a dark sky for most of the night.`;
  if (pct > 60 && share > 0.7) return `A ${pct}% lit moon is up most of the night and will wash out the fainter meteors.`;
  return `The moon (${pct}% lit) is up for part of the night; you'll see more while it is down.`;
}

/** Radyantın en iyi andaki yönü: "the northeast, 52° up". */
function radiantAt(shower: MeteorShower, n: MeteorNight, place: EnPlace) {
  if (!n.best) return null;
  const r = getRadiantPosition(shower, n.best.peakTime, place);
  return { dir: compassWord(r.azimuth), alt: Math.round(r.altitude) };
}

export function MeteorExplorer({ initialNow }: { initialNow: string }) {
  const { place, source, now, locale, dateIso, isToday, choose, setDateInput, backToToday } = usePlaceAndDate(initialNow);
  const date = dateIso ? new Date(dateIso) : now;
  const tz = place.timeZone;
  const fmt = useMemo(() => makeFmt(locale, tz), [locale, tz]);
  const local = localDateParts(date, tz);
  const dayKey = `${local.year}-${pad(local.month)}-${pad(local.day)}`;
  const label = placeLabel(place);
  // Bu gecenin ortası (yaklaşık yerel gece yarısı) ve günün başı.
  const noon = zonedTimeToUtc(local.year, local.month, local.day, 12, tz).getTime();
  const tonight = new Date(noon + 12 * 3_600_000);
  const startOfDay = noon - 12 * 3_600_000;

  // Sıradaki yağmurlar: dün geceden sonraki doruklar.
  const upcoming = useMemo(() => getUpcomingMeteorShowers(new Date(startOfDay - 12 * 3_600_000), 12), [startOfDay]);
  const [pick, setPick] = useState<string | null>(null);
  const firstMajor = upcoming.find((u) => isMajorShower(u.shower)) ?? upcoming[0];
  const selected = upcoming.find((u) => u.shower.code === pick) ?? firstMajor;

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
      <TonightSection tonight={tonight} place={place} fmt={fmt} label={label} isToday={isToday} nextMajor={firstMajor} />
      <ShowerSection
        key={`${selected.shower.code}-${place.id}-${place.latitude}`}
        shower={selected.shower}
        peak={selected.peak}
        upcoming={upcoming}
        onPick={setPick}
        place={place}
        fmt={fmt}
        label={label}
        now={now}
      />
      <CalendarSection year={local.year} place={place} fmt={fmt} label={label} now={now} />
    </div>
  );
}

/* ───────────────────────── Bu gece ───────────────────────── */

function TonightSection({
  tonight,
  place,
  fmt,
  label,
  isToday,
  nextMajor,
}: {
  tonight: Date;
  place: EnPlace;
  fmt: Fmt;
  label: string;
  isToday: boolean;
  nextMajor: { shower: MeteorShower; peak: Date };
}) {
  const rows = useMemo(
    () =>
      getActiveShowers(tonight)
        .slice(0, 4)
        .map((a) => {
          const night = tryMeteorNight(a.shower, tonight, place, a.factor);
          return { ...a, night, radiant: night ? radiantAt(a.shower, night, place) : null };
        }),
    [tonight, place],
  );
  const when = isToday ? "tonight" : `on the night of ${fmt.short.format(tonight.getTime() - DAY_MS / 2)}`;
  const dark = rows.find((r) => r.night)?.night ?? null;
  const best = rows
    .filter((r) => r.night?.best)
    .sort((a, b) => b.night!.best!.rate.kenar - a.night!.best!.rate.kenar)[0];
  const peakWords = (peak: Date) => {
    const diff = (tonight.getTime() - peak.getTime()) / DAY_MS;
    const d = Math.round(Math.abs(diff));
    if (Math.abs(diff) < 0.5) return "at their peak";
    if (Math.abs(diff) < 1.5) return diff < 0 ? "the night before their peak" : "the night after their peak";
    return diff < 0 ? `${d} days before their peak` : `${d} days after their peak`;
  };
  const nextName = enShowerName(nextMajor.shower);

  let answer: string;
  if (!dark && rows.length) answer = `The sky over ${label} doesn't get dark enough ${when} to see meteors: at this time of year twilight lasts all night.`;
  else if (best && best.night!.best!.rate.kenar >= 1)
    answer = `Yes. The ${enShowerName(best.shower)} are active ${when} in ${label}, ${peakWords(best.peak)}. The best time is ${fmt.time(best.night!.best!.start)} to ${fmt.time(best.night!.best!.end)}, with about ${Math.round(best.night!.best!.rate.kenar)} meteors an hour from the suburbs and ${Math.round(best.night!.best!.rate.karanlik)} from a dark site.`;
  else if (rows.length)
    answer = `Only weak showers are active ${when} (${rows.map((r) => enShowerName(r.shower)).join(", ")}): even from a dark site expect just a few meteors an hour, including random ones. The next big shower is the ${nextName}, peaking ${fmt.short.format(nextMajor.peak)}.`;
  else
    answer = `No meteor shower is active ${when}. On any clear, dark night you can still see a few random meteors an hour. The next big shower is the ${nextName}, peaking ${fmt.short.format(nextMajor.peak)}.`;

  return (
    <section aria-labelledby="tonight" className="mt-8">
      <h2 id="tonight" data-toc-label="Tonight" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Is there a meteor shower {isToday ? "tonight" : "that night"} in {label}?
      </h2>
      <p className="mt-2 text-lg text-zinc-700 dark:text-zinc-300">{answer}</p>
      {rows.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-3xl bg-[#05070d] text-white">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 px-5 py-3 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">Active {isToday ? "tonight" : "that night"}</p>
            {dark && (
              <p className="text-sm text-zinc-400">
                Dark from {fmt.time(dark.dusk)} to {fmt.time(dark.dawn)} · moon {Math.round(dark.moonIllumination * 100)}% lit
              </p>
            )}
          </div>
          <ul className="divide-y divide-white/10">
            {rows.map((r) => (
              <li key={r.shower.code} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
                <div>
                  <p className="text-lg font-semibold">
                    {enShowerName(r.shower)}{" "}
                    <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-zinc-300">
                      peak {fmt.md.format(r.peak)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    {r.night?.best && r.radiant
                      ? `Best ${fmt.time(r.night.best.start)}–${fmt.time(r.night.best.end)} · radiant in the ${r.radiant.dir}, ${r.radiant.alt}° up at ${fmt.time(r.night.best.peakTime)}`
                      : r.night
                        ? "The radiant stays below the horizon here: you won't see this shower."
                        : "Too light all night here."}
                  </p>
                </div>
                <p className="text-right tabular-nums">
                  <span className="text-3xl font-extralight">{r.night?.best ? rateText(r.night.best.rate.karanlik) : "0"}</span>
                  <span className="ml-1.5 text-sm text-zinc-400">/ hour, dark site</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="border-t border-white/10 px-5 py-3 text-xs text-zinc-500 sm:px-6">
            Away from the peak night, numbers are rough: they assume a typical rise and fall in activity. Add a few random
            meteors an hour on any dark night.
          </p>
        </div>
      )}
    </section>
  );
}

/* ───────────────────────── Seçilen yağmur ───────────────────────── */

function ShowerSection({
  shower,
  peak,
  upcoming,
  onPick,
  place,
  fmt,
  label,
  now,
}: {
  shower: MeteorShower;
  peak: Date;
  upcoming: { shower: MeteorShower; peak: Date }[];
  onPick: (code: string) => void;
  place: EnPlace;
  fmt: Fmt;
  label: string;
  now: Date;
}) {
  const night = useMemo(() => tryMeteorNight(shower, peak, place), [shower, peak, place]);
  const name = enShowerName(shower);
  const info = EN_SHOWERS[shower.code];
  const radiant = night ? radiantAt(shower, night, place) : null;
  const days = Math.ceil((peak.getTime() - now.getTime()) / DAY_MS);
  const v = verdict(night?.best ? night.best.rate.kenar : null);

  const sentence = !night
    ? `The ${name} peak on ${fmt.long.format(peak)}, but the sky over ${label} stays too light that night to see them.`
    : !night.best
      ? `The ${name} peak on ${fmt.long.format(peak)}, but their radiant stays below the horizon in ${label}, so this shower can't be seen from here.`
      : `The ${name} peak on ${fmt.long.format(peak)}. In ${label} the best time is the night of ${nightDates(night, fmt)}, from ${fmt.time(night.best.start)} to ${fmt.time(night.best.end)}, with about ${Math.round(night.best.rate.kenar)} meteors an hour from the suburbs and ${Math.round(night.best.rate.karanlik)} from a dark site.`;

  const event = night?.best
    ? {
        uid: `${shower.code}-${peak.getUTCFullYear()}-${place.id || "here"}`,
        summary: `${name} meteor shower: best time`,
        description: `About ${Math.round(night.best.rate.kenar)} meteors an hour from the suburbs, ${Math.round(night.best.rate.karanlik)} from a dark site (Lunatlas estimate for ${label}).${radiant ? ` The meteors seem to come from the ${radiant.dir}, but look at the darkest part of the sky.` : ""}`,
        url: PAGE_URL,
        start: night.best.start,
        end: night.best.end,
      }
    : null;

  return (
    <section aria-labelledby="next" className="mt-14">
      <h2 id="next" data-toc-label="Next shower" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        {shower === upcoming.find((u) => isMajorShower(u.shower))?.shower ? "Next big meteor shower: " : ""}the {name} in {label}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose a meteor shower">
        {upcoming.slice(0, 8).map((u) => (
          <button
            key={u.shower.code}
            type="button"
            onClick={() => onPick(u.shower.code)}
            aria-pressed={u.shower.code === shower.code}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              u.shower.code === shower.code
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {enShowerName(u.shower)} <span className="opacity-70">{fmt.md.format(u.peak)}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">{sentence}</p>

      <div className="mt-6 grid gap-6 rounded-3xl bg-[#05070d] p-6 text-white sm:p-8 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">Peak</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{fmt.long.format(peak)}</p>
          <p className="mt-1 text-lg font-light text-zinc-200">
            {fmt.time(peak)} {fmt.zone(peak)} · {days <= 0 ? "now" : days === 1 ? "tomorrow" : `in ${days} days`}
          </p>
          <p className="mt-4 inline-block rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-white/20">
            <span className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs ${v.tone}`}>{v.text}</span>
            {shower.variable ? "rates vary a lot from year to year" : `up to ${shower.zhr} an hour in a perfect sky`}
          </p>
          <p className="mt-4 text-sm text-zinc-400">
            {info?.note} Source: {info?.parent}, hitting the air at {shower.speed} km/s.
          </p>
        </div>
        <dl className="grid content-start gap-3 text-sm">
          {night?.best ? (
            <>
              <Fact k="Best time" v={`${fmt.time(night.best.start)} – ${fmt.time(night.best.end)}, night of ${nightDates(night, fmt)}`} />
              <Fact k="Most meteors" v={`around ${fmt.time(night.best.peakTime)}`} />
              {radiant && <Fact k="Where they come from" v={`the ${radiant.dir}, ${radiant.alt}° up (but they appear all over the sky)`} />}
            </>
          ) : (
            <Fact k="Visibility" v={night ? "radiant below the horizon all night" : "no dark sky that night"} />
          )}
          {night && <Fact k="Dark sky" v={`${fmt.time(night.dusk)} – ${fmt.time(night.dawn)}`} />}
          {night && <Fact k="Moon" v={moonNote(night)} />}
          {event && (
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={googleCalendarUrl(event)} target="_blank" rel="noopener nofollow" className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:border-white/30 hover:text-white">
                Google Calendar
              </a>
              <a href={icsDataUrl(event)} download={`${shower.code.toLowerCase()}-${peak.getUTCFullYear()}.ics`} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:border-white/30 hover:text-white">
                Add to calendar (.ics)
              </a>
            </div>
          )}
        </dl>
      </div>

      {night?.best && (
        <>
          <h3 id="night-chart" className="mt-10 scroll-mt-32 text-xl font-semibold">Meteors an hour through the night</h3>
          <NightChart night={night} fmt={fmt} />
          <h3 id="per-hour" className="mt-10 scroll-mt-32 text-xl font-semibold">How many will you see from your sky?</h3>
          <div className="mt-4">
            <MeteorSimulator lang="en" showerName={name} rates={night.best.rate} moonNote={moonNote(night)} />
          </div>
        </>
      )}
    </section>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-3 border-b border-white/10 pb-2">
      <dt className="text-zinc-400">{k}</dt>
      <dd className="text-zinc-100">{v}</dd>
    </div>
  );
}

/** Gece boyunca saatlik meteor sayısı (kırsal ve şehir kenarı), ayın ufukta olduğu saatler gri. */
function NightChart({ night, fmt }: { night: MeteorNight; fmt: Fmt }) {
  const W = 720;
  const H = 200;
  const PAD = { l: 44, r: 10, t: 12, b: 34 };
  const t0 = night.dusk.getTime();
  const t1 = night.dawn.getTime();
  const max = Math.max(5, ...night.samples.map((s) => s.rate.koy));
  const x = (t: number) => PAD.l + ((t - t0) / (t1 - t0)) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b);
  const area = (key: "koy" | "kenar") =>
    `M${x(t0)},${y(0)} ` + night.samples.map((s) => `L${x(s.time.getTime()).toFixed(1)},${y(s.rate[key]).toFixed(1)}`).join(" ") + ` L${x(t1)},${y(0)} Z`;
  const moonBands: [number, number][] = [];
  let start: number | null = null;
  for (const s of night.samples) {
    if (s.moonAltitude > 0 && start === null) start = s.time.getTime();
    if (s.moonAltitude <= 0 && start !== null) {
      moonBands.push([start, s.time.getTime()]);
      start = null;
    }
  }
  if (start !== null) moonBands.push([start, t1]);
  const ticks: number[] = [];
  for (let t = Math.ceil(t0 / 3_600_000) * 3_600_000; t <= t1; t += 3_600_000) ticks.push(t);
  const step = Math.max(1, Math.ceil(max / 4 / 5) * 5);

  return (
    <figure className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Expected meteors per hour through the night">
        {moonBands.map(([a, b], i) => (
          <rect key={i} x={x(a)} y={PAD.t} width={x(b) - x(a)} height={H - PAD.t - PAD.b} className="fill-zinc-200 dark:fill-zinc-700/60" />
        ))}
        {Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step).map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-800" />
            <text x={PAD.l - 8} y={y(v) + 5} textAnchor="end" className="fill-zinc-500 text-[24px] sm:text-[11px]">
              {v}
            </text>
          </g>
        ))}
        <path d={area("koy")} className="fill-indigo-300/60 dark:fill-indigo-400/40" />
        <path d={area("kenar")} className="fill-indigo-600 dark:fill-indigo-500" />
        {ticks.map((t, i) =>
          i % 2 === 0 ? (
            <text key={t} x={x(t)} y={H - 6} textAnchor="middle" className="fill-zinc-500 text-[24px] sm:text-[11px]">
              {fmt.time(new Date(t)).replace(":00", "")}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 px-1 text-xs text-zinc-600 dark:text-zinc-400">
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-indigo-300/60 align-middle" />
          {EN_SKIES.koy.label}
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-indigo-600 align-middle" />
          {EN_SKIES.kenar.label}
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-zinc-200 align-middle dark:bg-zinc-700" />
          Moon above the horizon
        </span>
        <span>Vertical axis: meteors per hour</span>
      </figcaption>
    </figure>
  );
}

/* ───────────────────────── Takvim ───────────────────────── */

function CalendarSection({ year, place, fmt, label, now }: { year: number; place: EnPlace; fmt: Fmt; label: string; now: Date }) {
  const rows = useMemo(() => {
    const tz = place.timeZone;
    return [year, year + 1].flatMap((y) =>
      [y - 1, y, y + 1]
        .flatMap((yy) => METEOR_SHOWERS.map((shower) => ({ shower, peak: getShowerPeak(shower, yy) })))
        .filter((r) => localDateParts(r.peak, tz).year === y)
        .sort((a, b) => a.peak.getTime() - b.peak.getTime())
        .map((r) => ({ ...r, year: y, night: tryMeteorNight(r.shower, r.peak, place) })),
    );
  }, [year, place]);
  const nextIndex = rows.findIndex((r) => r.peak.getTime() > now.getTime() - DAY_MS / 2);

  return (
    <section aria-labelledby="calendar" className="mt-14">
      <h2 id="calendar" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Meteor shower calendar {year}–{year + 1} for {label}
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Every shower&apos;s peak in local time, the best hours on the peak night, how many meteors an hour to expect and how
        much the moon gets in the way.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-3 py-2.5 font-medium">Shower</th>
              <th className="px-3 py-2.5 font-medium">Peak</th>
              <th className="px-3 py-2.5 font-medium">Best time</th>
              <th className="px-3 py-2.5 font-medium">Per hour: suburbs / dark site</th>
              <th className="px-3 py-2.5 font-medium">Moon</th>
              <th className="px-3 py-2.5 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((r, i) => {
              const b = r.night?.best ?? null;
              const v = verdict(b ? b.rate.kenar : null);
              const yearStart = i === 0 || rows[i - 1].year !== r.year;
              return (
                <tr
                  key={`${r.shower.code}-${r.year}`}
                  className={`${i === nextIndex ? "bg-indigo-50 dark:bg-indigo-950/40" : ""} ${i < nextIndex ? "text-zinc-400 dark:text-zinc-600" : ""} ${yearStart && i > 0 ? "border-t-2 border-zinc-300 dark:border-zinc-700" : ""}`}
                >
                  <td className="whitespace-nowrap px-3 py-2 font-medium">
                    {enShowerName(r.shower)}
                    {i === nextIndex && <span className="ml-2 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">next</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                    {fmt.short.format(r.peak)}
                    <span className="block text-xs text-zinc-500">{fmt.time(r.peak)}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                    {b ? `${fmt.time(b.start)} – ${fmt.time(b.end)}` : "–"}
                    {r.night && <span className="block text-xs text-zinc-500">night of {nightDates(r.night, fmt)}</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">{b ? `${rateText(b.rate.kenar)} / ${rateText(b.rate.karanlik)}` : "–"}</td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">{r.night ? `${Math.round(r.night.moonIllumination * 100)}%` : "–"}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${v.tone}`}>{r.shower.variable && b ? "Unpredictable" : v.text}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        Ratings use the suburbs number at the best time: Excellent 20+, Good 8+, Fair 3+ an hour. &quot;Not visible&quot;
        means the radiant stays below your horizon or the sky never gets dark enough.
      </p>
    </section>
  );
}
