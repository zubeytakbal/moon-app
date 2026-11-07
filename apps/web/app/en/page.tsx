import type { Metadata } from "next";
import { enPageOpenGraph } from "@/lib/og";
import Link from "next/link";
import type { ReactNode } from "react";
import { cacheLife } from "next/cache";
import {
  getFullMoonsOfYear,
  getMoonDistanceKm,
  getMoonPhase,
  getNextBlueMoon,
  getSeasons,
  getUpcomingLunarEclipses,
  getUpcomingSolarEclipses,
  localDateParts,
  PHASE_NAMES_EN,
} from "@moon-app/moon";
import { EclipseDisc } from "@/components/EclipseDisc";
import { JsonLd } from "@/components/JsonLd";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { SiteSearch } from "@/components/SiteSearch";
import { englishFullMoonNames } from "@/lib/en/full-moon-names";
import { EN_ALL_PAGES, EN_GROUP_NAMES, EN_PAGES } from "@/lib/en/pages";
import { DEFAULT_PLACE } from "@/lib/en/places";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { siteConfig } from "@/site.config";
import { HomeSky } from "./HomeSky";

const DAY_MS = 86_400_000;
const NY = DEFAULT_PLACE;

export const metadata: Metadata = {
  title: `${siteConfig.name}: Moon Phase Tonight, Full Moons, Eclipses and Sunrise for Your City`,
  description:
    "Tonight's moon phase, moonrise and moonset, the next full moon, solar and lunar eclipses, and sunrise and sunset, all calculated for your own city. Free tools with clear explanations.",
  alternates: { canonical: "/en" },
  openGraph: enPageOpenGraph({ path: "/en", title: "Lunatlas: Moon guide", description: "Moon phase, moonrise and moonset, full moons, eclipses and sunrise, calculated for your own city." }),
};

const SEARCH_ITEMS = EN_ALL_PAGES.map((p) => ({ path: p.path, title: p.title, description: p.description, group: EN_GROUP_NAMES[p.group] }));
const CONTENT_PAGES = EN_ALL_PAGES.filter((p) => p.group !== "about");

export default function EnglishHome() {
  return (
    <>
      <Hero />
      <main className="mx-auto w-full max-w-5xl px-4">
        <SkyPanel />
        <UpcomingEvents />
        <Explore />
        <About />
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          alternateName: `${siteConfig.name} Moon Guide`,
          url: new URL("/en", siteConfig.url).toString(),
          description: "Moon phases, moonrise and moonset, full moons, eclipses and sunrise and sunset, calculated for any city in the world.",
          inLanguage: "en-US",
        }}
      />
    </>
  );
}

/** Giriş: New York'ta bu geceki ay (saatte bir). Dev ayın yalnız üst yayı görünür. */
async function Hero() {
  "use cache";
  cacheLife("hours");
  const now = new Date();
  const phase = getMoonPhase(now, NY.timeZone);
  const date = new Intl.DateTimeFormat("en-US", { timeZone: NY.timeZone, weekday: "long", month: "long", day: "numeric" });
  return (
    <section className="starfield relative flex min-h-[620px] flex-col justify-end overflow-hidden bg-[#05070d] text-white md:min-h-[min(84vh,820px)]">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[34%] w-[max(900px,125vw)] -translate-x-1/2 md:top-[24%] md:w-[min(125vw,1900px)]">
        <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={1600} title="" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#05070d] via-[#05070d]/70 to-transparent" />
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 md:pb-20">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Moon guide</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl md:text-[5.25rem]">
          The moon tonight, wherever you are
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-200 md:text-xl">
          Moon phase, moonrise and moonset, full moons, eclipses and sunrise, worked out for your own city, with a plain
          explanation of what you&apos;re seeing.
        </p>
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-start">
          <Link
            href={EN_PAGES.moonPhaseToday.path}
            className="group flex max-w-md flex-1 items-center gap-4 rounded-2xl border border-white/15 bg-black/40 p-4 backdrop-blur-sm transition hover:border-white/30 hover:bg-black/55"
          >
            <span className="shrink-0">
              <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={56} title={PHASE_NAMES_EN[phase.key]} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs uppercase tracking-wider text-zinc-400">
                Tonight · <time dateTime={now.toISOString()}>{date.format(now)}</time>
              </span>
              <span className="mt-0.5 block text-lg font-semibold">
                {PHASE_NAMES_EN[phase.key]} <span className="font-light text-zinc-300">· {Math.round(phase.illumination * 100)}%</span>
              </span>
              <span className="text-sm text-indigo-300">See it for your city</span>
            </span>
            <span aria-hidden="true" className="text-xl text-zinc-400 transition group-hover:translate-x-1 group-hover:text-white">
              →
            </span>
          </Link>
          <SiteSearch items={SEARCH_ITEMS} lang="en" />
        </div>
      </div>
    </section>
  );
}

/** "Tonight in your sky" paneli: sunucu New York için hazır üretir, tarayıcıda ziyaretçinin şehrine geçer. */
async function SkyPanel() {
  "use cache";
  cacheLife("hours");
  return <HomeSky initialNow={new Date().toISOString()} />;
}

interface SkyEvent {
  date: Date;
  title: string;
  detail: string;
  href: string;
  icon: ReactNode;
}

/** Dünya genelinde yaklaşan olaylar (süper ay, tutulmalar, mavi ay, ekinoks/gündönümü), tarih sırasıyla. Saatte bir. */
async function UpcomingEvents() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const until = now.getTime() + 2 * 365 * DAY_MS;
  const y = localDateParts(now, NY.timeZone).year;
  const events: SkyEvent[] = [];

  const moons = [y, y + 1, y + 2].flatMap((year) => getFullMoonsOfYear(year)).filter((m) => m.date > now && m.date.getTime() < until);
  const names = englishFullMoonNames(moons, NY.timeZone);
  for (const m of moons) {
    const km = getMoonDistanceKm(m.date);
    if (km < SUPERMOON_KM)
      events.push({
        date: m.date,
        title: `Supermoon: ${names.get(m.date.getTime()) ?? "full moon"}`,
        detail: `The full moon is ${Math.round(km).toLocaleString("en-US")} km away, one of the closest of the year.`,
        href: EN_PAGES.fullMoon.path,
        icon: <MoonPhaseIcon phaseAngle={180} size={44} title="" />,
      });
  }
  for (const e of getUpcomingLunarEclipses(now, 4).filter((e) => e.peak.getTime() < until)) {
    events.push({
      date: e.peak,
      title: e.kind === "total" ? "Total lunar eclipse: blood moon" : e.kind === "partial" ? "Partial lunar eclipse" : "Penumbral lunar eclipse",
      detail: e.kind === "total" ? `The moon turns red for ${Math.round(e.semiDurationMinutes.total * 2)} minutes.` : e.kind === "partial" ? "Part of the moon goes dark in Earth's shadow." : "A faint shading most people won't notice.",
      href: EN_PAGES.lunarEclipse.path,
      icon: <span className={`block size-10 rounded-full ${e.kind === "total" ? "bg-red-700" : "bg-zinc-600"}`} />,
    });
  }
  for (const e of getUpcomingSolarEclipses(now, 4).filter((e) => e.peak.getTime() < until)) {
    events.push({
      date: e.peak,
      title: `${e.kind === "total" ? "Total" : e.kind === "annular" ? "Annular" : "Partial"} solar eclipse`,
      detail: "See whether and when it's visible from your city.",
      href: EN_PAGES.solarEclipse.path,
      icon: <EclipseDisc separation={e.kind === "partial" ? 0.6 : 0} ratio={e.kind === "annular" ? 0.94 : 1.04} size={44} />,
    });
  }
  const blue = getNextBlueMoon(now, NY.timeZone);
  if (blue && blue.date.getTime() < until)
    events.push({ date: blue.date, title: "Blue Moon", detail: "The second full moon in one calendar month (US Eastern time).", href: EN_PAGES.fullMoon.path, icon: <MoonPhaseIcon phaseAngle={180} size={44} title="" /> });
  for (const year of [y, y + 1]) {
    const s = getSeasons(year);
    for (const [d, title, detail] of [
      [s.juneSolstice, "June solstice", "Longest day in the Northern Hemisphere, shortest in the Southern."],
      [s.decemberSolstice, "December solstice", "Shortest day in the Northern Hemisphere, longest in the Southern."],
    ] as const)
      if (d > now && d.getTime() < until) events.push({ date: d, title, detail, href: EN_PAGES.sunriseSunset.path, icon: <span className="block text-3xl text-amber-300">☀</span> });
  }
  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  const shown = events.slice(0, 8);
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });

  return (
    <section aria-labelledby="events" className="border-t border-zinc-200 py-14 dark:border-zinc-800 sm:py-20 mt-14 sm:mt-20">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Mark your calendar</p>
      <h2 id="events" className="mt-1 text-3xl font-semibold tracking-tight">
        Coming up in the sky
      </h2>
      <ol className="mt-8 space-y-3">
        {shown.map((e) => {
          const days = Math.ceil((e.date.getTime() - now.getTime()) / DAY_MS);
          return (
            <li key={`${e.title}-${e.date.toISOString()}`}>
              <Link href={e.href} className="group flex items-center gap-4 rounded-2xl bg-[#05070d] p-4 text-white transition hover:bg-[#0d111c] sm:gap-6 sm:p-5">
                <span className="flex size-12 shrink-0 items-center justify-center">{e.icon}</span>
                <span className="w-32 shrink-0 sm:w-44">
                  <time dateTime={e.date.toISOString()} className="block font-semibold">
                    {fmt.format(e.date)}
                  </time>
                  <span className="text-sm text-zinc-400">in {days} days</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-amber-200">{e.title}</span>
                  <span className="block text-sm text-zinc-400">{e.detail}</span>
                </span>
                <span aria-hidden="true" className="hidden text-zinc-500 transition group-hover:translate-x-1 sm:block">
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-sm text-zinc-500">Dates in UTC. Each page shows the local time for your city.</p>
    </section>
  );
}

/** Bütün araç sayfaları, gruplu kartlar. */
function Explore() {
  const groups = (Object.keys(EN_GROUP_NAMES) as (keyof typeof EN_GROUP_NAMES)[])
    .filter((g) => g !== "about")
    .map((g) => ({ g, pages: CONTENT_PAGES.filter((p) => p.group === g) }))
    .filter((x) => x.pages.length > 0);
  return (
    <section aria-labelledby="explore" className="border-t border-zinc-200 py-14 dark:border-zinc-800 sm:py-20">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Explore</p>
      <h2 id="explore" className="mt-1 text-3xl font-semibold tracking-tight">
        Tools for your sky
      </h2>
      {groups.map(({ g, pages }) => (
        <div key={g} className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">{EN_GROUP_NAMES[g]}</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {pages.map((p) => (
              <li key={p.path}>
                <Link href={p.path} className="flex h-full gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="shrink-0">
                    <MoonPhaseIcon phaseAngle={p.cardPhaseAngle} size={52} title="" />
                  </span>
                  <span>
                    <span className="block text-lg font-semibold">{p.title}</span>
                    <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">{p.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function About() {
  return (
    <section aria-labelledby="about-site" className="border-t border-zinc-200 py-14 dark:border-zinc-800 sm:py-20">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">How it works</p>
          <h2 id="about-site" className="mt-1 text-2xl font-semibold tracking-tight">
            Calculated for you, checked against official data
          </h2>
        </div>
        <Fact title="Your city, not the world">
          Every time is calculated for the exact place you choose, from about 46,000 towns and cities, in its own time zone.
        </Fact>
        <Fact title="Checked, with sources">
          Our results agree with NASA and the U.S. Naval Observatory; see the{" "}
          <Link href={EN_PAGES.methodology.path} className="underline underline-offset-2">
            comparison
          </Link>{" "}
          and our <Link href={EN_PAGES.sources.path} className="underline underline-offset-2">sources</Link>.
        </Fact>
      </div>
    </section>
  );
}

function Fact({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">{children}</p>
    </div>
  );
}
