import type { Metadata } from "next";
import Link from "next/link";
import {
  getLocalSolarEclipse,
  getMoonRiseSet,
  getNextFullMoon,
  getNextNewMoon,
  getSeasons,
  getSunDay,
  getUpcomingLunarEclipses,
  getUpcomingSolarEclipses,
  zonedTimeToUtc,
} from "@moon-app/moon";
import { BreadcrumbTrail } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { enPageSources, SourceList } from "@/components/Sources";
import { EN_HOME_PATH, EN_PAGES } from "@/lib/en/pages";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { siteConfig } from "@/site.config";

const PAGE = EN_PAGES.methodology;
const UPDATED = "2026-11-07";
const src = enPageSources("usnoMoonPhases", "nasaLunarCatalog", "nasaSolarCatalog", "eclipsewise2027", "usnoSeasons", "usnoRiseSetOneDay", "geonames", "svsMoonPhase2026");

export const metadata: Metadata = {
  title: `Methodology and Accuracy: How We Check Our Numbers | ${siteConfig.name}`,
  description:
    "How Lunatlas calculates moon phases, rise and set times, full moons and eclipses, and a live comparison with NASA and U.S. Naval Observatory data, with our definitions and known limits.",
  alternates: { canonical: PAGE.path },
};

type SourceKey = "usnoMoonPhases" | "nasaLunarCatalog" | "nasaSolarCatalog" | "eclipsewise2027" | "usnoSeasons" | "usnoRiseSetOneDay";

interface Check {
  topic: string;
  source: SourceKey;
  reference: string;
  ours: string;
  result: string;
  ok: boolean;
  usedOn: { href: string; label: string };
}

/** Dakikaya yuvarlanmış iki an arasındaki fark (USNO ve NASA dakikaya yuvarlar). */
function minutesApart(a: Date, b: Date) {
  return Math.abs(Math.round(a.getTime() / 60_000) - Math.round(b.getTime() / 60_000));
}

function result(minutes: number) {
  return minutes === 0 ? "Same minute" : `${minutes} min apart`;
}

/**
 * Karşılaştırma tablosu. Kaynak değerleri yayımlanmış tablolardan elle alındı (USNO ve NASA, 7 Kasım 2026'da okundu);
 * "our calculation" sütunu sayfa derlenirken sitenin kullandığı fonksiyonlarla yeniden hesaplanır.
 */
function buildChecks(): Check[] {
  const checks: Check[] = [];
  const utc = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const from = (iso: string) => new Date(`${iso}T00:00:00Z`);
  const timed = (topic: string, source: SourceKey, iso: string, ours: Date, usedOn: Check["usedOn"]) => {
    const ref = new Date(iso);
    const m = minutesApart(ref, ours);
    // Ekranda da dakikaya yuvarlanmış an gösterilir (karşılaştırmayla aynı yuvarlama).
    const shown = new Date(Math.round(ours.getTime() / 60_000) * 60_000);
    checks.push({ topic, source, reference: `${utc.format(ref)} UTC`, ours: `${utc.format(shown)} UTC`, result: result(m), ok: m <= 2, usedOn });
  };
  const fullMoon = { href: EN_PAGES.fullMoon.path, label: "Full Moon" };
  const moonToday = { href: EN_PAGES.moonPhaseToday.path, label: "Moon Phase Today" };
  const lunar = { href: EN_PAGES.lunarEclipse.path, label: "Lunar Eclipses" };
  const solar = { href: EN_PAGES.solarEclipse.path, label: "Solar Eclipses" };
  const sun = { href: EN_PAGES.sunriseSunset.path, label: "Sunrise & Sunset" };

  timed("Full moon", "usnoMoonPhases", "2026-11-24T14:53:00Z", getNextFullMoon(from("2026-11-01")), fullMoon);
  timed("New moon", "usnoMoonPhases", "2026-11-09T07:02:00Z", getNextNewMoon(from("2026-11-01")), moonToday);
  timed("Total lunar eclipse, greatest", "nasaLunarCatalog", "2025-09-07T18:11:00Z", getUpcomingLunarEclipses(from("2025-09-01"), 1)[0].peak, lunar);
  timed("Total lunar eclipse, greatest", "nasaLunarCatalog", "2026-03-03T11:33:00Z", getUpcomingLunarEclipses(from("2026-02-20"), 1)[0].peak, lunar);
  timed("Total solar eclipse, greatest", "nasaSolarCatalog", "2027-08-02T10:07:00Z", getUpcomingSolarEclipses(from("2027-07-01"), 1)[0].peak, solar);

  // 2 Ağustos 2027: en büyük tutulma noktası ve oradaki tam tutulma süresi (EclipseWise: 25°30.2' K, 33°11.0' D; 6m23s).
  const g = getUpcomingSolarEclipses(from("2027-07-01"), 1)[0];
  const dLat = Math.abs((g.centerLatitude ?? 0) - 25.503);
  const dLon = Math.abs((g.centerLongitude ?? 0) - 33.183);
  checks.push({
    topic: "Aug 2, 2027 eclipse, point of greatest eclipse",
    source: "eclipsewise2027",
    reference: "25.50° N, 33.18° E",
    ours: `${g.centerLatitude?.toFixed(2)}° N, ${g.centerLongitude?.toFixed(2)}° E`,
    result: `${Math.max(dLat, dLon).toFixed(2)}° apart`,
    ok: dLat < 0.2 && dLon < 0.2,
    usedOn: solar,
  });
  const at = getLocalSolarEclipse(from("2027-07-25"), { name: "Greatest eclipse", latitude: 25.503, longitude: 33.183, elevation: 0, timeZone: "UTC" });
  const sec = Math.round(at.centralSeconds);
  checks.push({
    topic: "Aug 2, 2027 eclipse, totality at greatest eclipse",
    source: "eclipsewise2027",
    reference: "6m 23s",
    ours: `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, "0")}s`,
    result: `${Math.abs(sec - 383)} s apart`,
    ok: Math.abs(sec - 383) <= 5,
    usedOn: solar,
  });

  const seasons = getSeasons(2026);
  timed("March equinox 2026", "usnoSeasons", "2026-03-20T14:46:00Z", seasons.marchEquinox, sun);
  timed("December solstice 2026", "usnoSeasons", "2026-12-21T20:50:00Z", seasons.decemberSolstice, sun);

  // Doğuş-batış: USNO "one day" verisi (yerel saat, dakikaya yuvarlanmış). Şehir koordinatları GeoNames.
  const place = (name: string, latitude: number, longitude: number, timeZone: string) => ({ name, latitude, longitude, elevation: 0, timeZone });
  const ny = place("New York", 40.7143, -74.006, "America/New_York");
  const london = place("London", 51.5085, -0.1257, "Europe/London");
  const delhi = place("Delhi", 28.652, 77.2315, "Asia/Kolkata");
  const local = (p: { timeZone: string }, y: number, mo: number, d: number, hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return new Date(zonedTimeToUtc(y, mo, d, 0, p.timeZone).getTime() + (h * 60 + m) * 60_000);
  };
  const t = (p: { timeZone: string }) => new Intl.DateTimeFormat("en-US", { timeZone: p.timeZone, hour: "numeric", minute: "2-digit" });
  const riseSet = (label: string, p: ReturnType<typeof place>, y: number, mo: number, d: number, kind: "rise" | "set" | "dusk" | "moonrise" | "moonset", ref: string, usedOn: Check["usedOn"]) => {
    const noon = zonedTimeToUtc(y, mo, d, 12, p.timeZone);
    const sunDay = getSunDay(noon, p);
    const moon = getMoonRiseSet(noon, p);
    const ours = kind === "rise" ? sunDay.rise : kind === "set" ? sunDay.set : kind === "dusk" ? sunDay.civilDusk : kind === "moonrise" ? moon.rise : moon.set;
    const refDate = local(p, y, mo, d, ref);
    const m = ours ? minutesApart(refDate, ours) : 99;
    const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(Date.UTC(y, mo - 1, d, 12));
    checks.push({
      topic: `${label}, ${p.name}, ${date}`,
      source: "usnoRiseSetOneDay",
      reference: t(p).format(refDate),
      ours: ours ? t(p).format(new Date(Math.round(ours.getTime() / 60_000) * 60_000)) : "–",
      result: result(m),
      ok: m <= 1,
      usedOn,
    });
  };
  riseSet("Sunrise", ny, 2026, 11, 4, "rise", "06:30", sun);
  riseSet("Sunset", ny, 2026, 11, 4, "set", "16:49", sun);
  riseSet("End of civil twilight", ny, 2026, 11, 4, "dusk", "17:17", sun);
  riseSet("Sunrise", london, 2026, 12, 21, "rise", "08:04", sun);
  riseSet("Sunset", london, 2026, 12, 21, "set", "15:53", sun);
  riseSet("Sunrise", delhi, 2026, 11, 6, "rise", "06:37", sun);
  riseSet("Sunset", delhi, 2026, 11, 6, "set", "17:32", sun);
  riseSet("Moonrise", ny, 2026, 11, 4, "moonrise", "01:36", moonToday);
  riseSet("Moonset", ny, 2026, 11, 4, "moonset", "14:26", moonToday);
  return checks;
}

export default function MethodologyPage() {
  const checks = buildChecks();
  const passed = checks.filter((c) => c.ok).length;
  return (
    <>
      <section className="starfield bg-[#05070d] text-white">
        <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6 md:pb-16">
          <BreadcrumbTrail tone="dark" label="Breadcrumb" items={[{ name: "Home", path: EN_HOME_PATH }, { name: PAGE.title, path: PAGE.path }]} />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Transparency</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">{PAGE.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-200">
            Every date and time on this site is calculated. This page explains how, compares our results with official
            sources, and says where differences can come from.
          </p>
          <div className="mt-8 inline-flex items-baseline gap-3 rounded-2xl border border-white/15 bg-black/40 px-5 py-4">
            <span className="text-4xl font-extralight tabular-nums">
              {passed}/{checks.length}
            </span>
            <span className="text-zinc-300">checks agree with the official values (within 2 minutes, or 1 minute for rise and set times)</span>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2 id="how">How we calculate</h2>
            <p>
              We use Astronomy Engine, an open-source library that calculates the positions of the sun, moon and planets to
              within about an arcminute. From those positions we work out, for the exact coordinates of the place you choose:
            </p>
            <ul>
              <li>moon phases, illumination and the moments of new moon, first quarter, full moon and last quarter;</li>
              <li>sunrise, sunset, twilight, moonrise and moonset, with atmospheric refraction included;</li>
              <li>the start, deepest moment and end of solar and lunar eclipses, how much of the sun is covered and how long totality lasts;</li>
              <li>equinoxes and solstices.</li>
            </ul>
            <p>
              Nothing is copied from other websites. Times are shown in each place&apos;s own time zone, including daylight
              saving time; place coordinates come from GeoNames.{src.ref("geonames")}
            </p>
          </Prose>
        </div>

        <section aria-labelledby="checks" className="mt-14">
          <h2 id="checks" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
            How our results compare
          </h2>
          <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
            The official values were typed in by hand from the published tables. Our column is recalculated by the
            site&apos;s own code every time the site is built, so if the code ever changed, this table would show it.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
                <tr>
                  <th className="px-4 py-2.5 font-medium">What</th>
                  <th className="px-4 py-2.5 font-medium">Official</th>
                  <th className="px-4 py-2.5 font-medium">Our calculation</th>
                  <th className="px-4 py-2.5 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {checks.map((c, i) => (
                  <tr key={i} className="align-top">
                    <td className="px-4 py-2.5">
                      <span className="font-medium">{c.topic}</span>
                      <span className="block text-xs text-zinc-500">
                        Source {src.ref(c.source)} · used on <Link href={c.usedOn.href} className="underline underline-offset-2">{c.usedOn.label}</Link>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">{c.reference}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">{c.ours}</td>
                    <td className={`whitespace-nowrap px-4 py-2.5 font-medium ${c.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-700"}`}>
                      {c.ok ? "✓ " : "✗ "}
                      {c.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mx-auto mt-14 max-w-3xl">
          <Prose>
            <h2 id="differences">Where differences can come from</h2>
            <ul>
              <li>
                <strong>Rounding:</strong> official tables round to the minute, and so do we on screen. A time that falls at
                30 seconds past the minute can show one minute apart.
              </li>
              <li>
                <strong>Horizon and height:</strong> rise and set times assume a flat horizon at sea level. Mountains or tall
                buildings make the sun or moon appear later and disappear earlier; a high viewpoint or a sea horizon gives you
                a minute or two more.
              </li>
              <li>
                <strong>The air:</strong> refraction near the horizon depends on temperature and pressure; unusual conditions
                can shift a rise or set time by about a minute.
              </li>
              <li>
                <strong>City center:</strong> times are for the coordinates of the city center. Across a large city, sunrise
                can differ by a minute or more.
              </li>
              <li>
                <strong>Eclipse visibility:</strong> we can say whether an eclipse happens above your horizon, not whether the
                sky will be clear.
              </li>
            </ul>

            <h2 id="definitions">Our definitions</h2>
            <ul>
              <li>
                <strong>Phase names:</strong> the four main phases are single moments; the whole local calendar day of that
                moment carries the phase&apos;s name. On other days the name follows the moon&apos;s angle from the sun.
              </li>
              <li>
                <strong>Supermoon:</strong> a full moon closer than {SUPERMOON_KM.toLocaleString("en-US")} km. There is no
                official definition, so other sites draw the line slightly differently.
              </li>
              <li>
                <strong>&quot;Dark at&quot;:</strong> the end of civil twilight, when the sun is 6° below the horizon.
              </li>
              <li>
                <strong>Golden hour:</strong> while the sun is between the horizon and 6° above it.
              </li>
              <li>
                <strong>New crescent:</strong> likely visible when, at sunset, the moon is at least 5° above the horizon and 8°
                from the sun. This is an astronomical estimate, not a sighting.
              </li>
              <li>
                <strong>Full moon names:</strong> North American names, with the Harvest Moon nearest the September equinox
                and a Blue Moon as the second full moon in a calendar month.
              </li>
            </ul>

            <h2 id="traditions">Traditional calendars</h2>
            <p>
              The Hindu tithi and the Islamic Hijri date are shown as astronomical information. Tithi times are the moments
              the moon reaches each 12° step from the sun; which day a festival or fast falls on follows panchang rules. The
              Hijri date uses the Umm al-Qura calendar of Saudi Arabia; many communities start months by local moon sighting,
              which can be a day later. For religious dates, we always point you to your local authority.
            </p>

            <h2 id="images">Moon images</h2>
            <p>
              The moon pictures are NASA&apos;s own renderings of the moon in each phase,{src.ref("svsMoonPhase2026")} which
              we turn to match how the moon looks from the place you choose. Eclipse photos are NASA images, credited where
              they appear.
            </p>
          </Prose>
          <h2 className="mt-12 text-2xl font-semibold tracking-tight" data-toc-skip>
            Sources
          </h2>
          <SourceList src={src} lang="en" />
        </div>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: PAGE.title,
          inLanguage: "en-US",
          dateModified: UPDATED,
          url: new URL(PAGE.path, siteConfig.url).toString(),
        }}
      />
    </>
  );
}
