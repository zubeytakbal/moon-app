import type { Metadata } from "next";
import { enPageOpenGraph } from "@/lib/og";
import { cacheLife } from "next/cache";
import { getSeasons, getSunDay, getYearDayLengths, localDateParts, type SunDay } from "@moon-app/moon";
import { BreadcrumbTrail } from "@/components/Breadcrumb";
import { Byline } from "@/components/Byline";
import { EnArticleFooter } from "@/components/en/EnArticleFooter";
import { Faq } from "@/components/Faq";
import { MobileCollapse } from "@/components/MobileCollapse";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { enPageSources } from "@/components/Sources";
import { EN_FAQS } from "@/lib/en/faqs";
import { EN_GROUP_NAMES, EN_HOME_PATH, EN_PAGES } from "@/lib/en/pages";
import { DEFAULT_PLACE, placeLabel } from "@/lib/en/places";
import { WORLD_CITIES as WORLD } from "@/lib/en/world-cities";
import { siteConfig } from "@/site.config";
import { SunExplorer } from "./SunExplorer";
import { serializeYear } from "./year-data";

const PAGE = EN_PAGES.sunriseSunset;
const UPDATED = "2026-11-04";
const src = enPageSources("usnoRiseSetDefs", "nasaSeasons", "geonames", "wisdomlibBrahmaMuhurta", "wisdomlibRahukala");

export const metadata: Metadata = {
  title: `Sunrise and Sunset Times Today: What Time Does It Get Dark? | ${siteConfig.name}`,
  description:
    "Sunrise, sunset and what time it gets dark today in your city, plus first light, golden hour, day length, the sun's direction, the next 10 days and the whole year. Works for any town worldwide.",
  // Yer ve tarih seçimi (?place=, ?date=) tarayıcıda; ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
    openGraph: enPageOpenGraph(PAGE),
};


const MOBILE_ROWS = 10;

export default function SunrisePage() {
  return (
    <>
      <Hero />
      <QuickLinks
        lang="en"
        links={[
          { href: "#today", label: "Today" },
          { href: "#next-days", label: "Next 10 days" },
          { href: "#year", label: "Year" },
          { href: "#clocks", label: "Clock changes" },
          { href: "#direction", label: "Direction" },
          { href: "#hindu-times", label: "Rahu Kaal" },
          { href: "#world", label: "World" },
          { href: "#faq", label: "FAQ" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <Explorer />

        <WorldTable />

        <div className="mx-auto max-w-3xl">
          <Explainer />
          <div id="faq" className="scroll-mt-32">
            <Faq items={EN_FAQS.sunriseSunset} lang="en" />
          </div>
          <EnArticleFooter page={PAGE} headline="Sunrise and Sunset Times Today: What Time Does It Get Dark?" updated={UPDATED} src={src} />
        </div>
      </main>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#2a1406] to-[#05070d] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6 md:pb-16">
        <BreadcrumbTrail
          tone="dark"
          label="Breadcrumb"
          items={[{ name: "Home", path: EN_HOME_PATH }, { name: EN_GROUP_NAMES[PAGE.group] }, { name: PAGE.title, path: PAGE.path }]}
        />
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Sky calendar</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">Sunrise, Sunset and When It Gets Dark</h1>
        <p className="mt-5 max-w-2xl text-lg text-zinc-200">
          Today&apos;s times for your city, worked out for its exact location: first light, sunrise, sunset, dusk,
          golden hour and how long the day is, plus where on the horizon the sun comes up.
        </p>
        <Byline updated={UPDATED} lang="en" />
      </div>
    </section>
  );
}

/** Araç: sunucu (ve Google) New York için hazır HTML üretir; "şu an" saatte bir yenilenir. */
async function Explorer() {
  "use cache";
  cacheLife("hours");
  const now = new Date();
  const year = localDateParts(now, DEFAULT_PLACE.timeZone).year;
  return (
    <SunExplorer
      initialNow={now.toISOString()}
      initialYear={{ year, placeId: DEFAULT_PLACE.id, days: await defaultYear(year) }}
      refs={{ usno: src.ref("usnoRiseSetDefs"), brahma: src.ref("wisdomlibBrahmaMuhurta"), rahu: src.ref("wisdomlibRahukala") }}
    />
  );
}

/** Varsayılan yerin (New York) yılı: ağır hesap (~0,4 sn), günde bir. */
async function defaultYear(year: number) {
  "use cache";
  cacheLife("days");
  return serializeYear(getYearDayLengths(year, DEFAULT_PLACE, 1));
}

/** "Sunrise and sunset today around the world": elle seçilmiş şehirler, her biri kendi saatiyle. Saatte bir yenilenir. */
async function WorldTable() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  return (
    <section aria-labelledby="world" className="mt-14">
      <h2 id="world" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Sunrise and sunset today around the world
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Today&apos;s times in major cities, each in its own local time. Tap a city to see its full day, the next 10 days
        and the year.
      </p>
      <MobileCollapse
        hiddenCount={WORLD.length - MOBILE_ROWS}
        noun="cities"
        className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5 font-medium">City</th>
              <th className="px-4 py-2.5 font-medium">Sunrise</th>
              <th className="px-4 py-2.5 font-medium">Sunset</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Dark at</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Daylight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {WORLD.map((p, i) => {
              const s = getSunDay(now, p);
              const t = new Intl.DateTimeFormat("en-US", { timeZone: p.timeZone, hour: "numeric", minute: "2-digit" });
              const m = Math.round(s.minutes);
              return (
                <tr key={p.id} data-extra={i >= MOBILE_ROWS || undefined}>
                  <td className="px-4 py-2">
                    <a href={`${PAGE.path}?place=${p.id}`} rel="nofollow" className="font-medium hover:underline">
                      {placeLabel(p)}
                    </a>
                  </td>
                  <td className="px-4 py-2 tabular-nums">{s.rise ? t.format(s.rise) : "–"}</td>
                  <td className="px-4 py-2 tabular-nums">{s.set ? t.format(s.set) : "–"}</td>
                  <td className="hidden px-4 py-2 tabular-nums sm:table-cell">{s.civilDusk ? t.format(s.civilDusk) : "–"}</td>
                  <td className="hidden px-4 py-2 tabular-nums sm:table-cell">
                    {Math.floor(m / 60)}h {String(m % 60).padStart(2, "0")}m
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </MobileCollapse>
    </section>
  );
}

/**
 * Bilgi metni. Sayılar hesapla üretilir (New York ve Sydney için bu yılın değerleri), metin elle yazılmıştır.
 * Günde bir yenilenir.
 */
async function Explainer() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const ny = DEFAULT_PLACE;
  const year = localDateParts(now, ny.timeZone).year;
  const t = new Intl.DateTimeFormat("en-US", { timeZone: ny.timeZone, hour: "numeric", minute: "2-digit" });
  const md = new Intl.DateTimeFormat("en-US", { timeZone: ny.timeZone, month: "long", day: "numeric" });
  const clock = new Intl.DateTimeFormat("en-GB", { timeZone: ny.timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  // Saniye hassasiyeti: dakikaya yuvarlanınca birkaç gün aynı çıkar ve ilk gün seçilirdi.
  const mod = (d: Date) => {
    const [h, m, s] = clock.format(d).split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };
  // Bu kış New York'ta en erken gün batımı (Kasım-Aralık) ve en geç gün doğumu (Aralık-Ocak; saat değişimi Mart'ta).
  let earliestSet: SunDay | null = null;
  let latestRise: SunDay | null = null;
  for (let ms = Date.UTC(year, 10, 15, 17); ms < Date.UTC(year + 1, 1, 15); ms += 86_400_000) {
    const d = getSunDay(new Date(ms), ny);
    if (d.set && (!earliestSet || mod(d.set) < mod(earliestSet.set!))) earliestSet = d;
    if (d.rise && (!latestRise || mod(d.rise) > mod(latestRise.rise!))) latestRise = d;
  }
  const solstice = getSeasons(year).decemberSolstice;
  const sydney = { name: "Sydney", latitude: -33.8678, longitude: 151.2073, elevation: 0, timeZone: "Australia/Sydney" };
  const june = getSunDay(getSeasons(year).juneSolstice, sydney);
  const dec = getSunDay(solstice, sydney);
  const hm = (minutes: number) => `${Math.floor(minutes / 60)} hours ${Math.round(minutes % 60)} minutes`;

  return (
    <Prose>
      <h2 id="dark">What time does it get dark?</h2>
      <p>
        Sunset isn&apos;t the moment it gets dark. After the sun drops below the horizon, the sky stays bright for a while
        because sunlight still reaches the upper atmosphere and scatters down to you. Astronomers split this twilight
        into three stages by how far the sun is below the horizon: civil (down to 6°), nautical (12°) and astronomical
        (18°).{src.ref("usnoRiseSetDefs")} The time we show as &quot;dark at&quot; is the end of civil twilight, the point
        after which you&apos;d normally need a light to be outdoors. Truly dark skies, good for faint stars, come only after
        astronomical twilight ends, roughly an hour or more after sunset.
      </p>
      <p>
        How long the dusk lasts depends on where you are. Near the equator the sun drops almost straight down, and it
        gets dark about 21 to 24 minutes after sunset. In New York it takes about half an hour; in London, 40 minutes in
        winter and nearly 50 in June; in Edinburgh in June, about an hour, and farther north the sky never gets fully
        dark on summer nights.
      </p>

      <h2 id="earliest">Why isn&apos;t the earliest sunset on the shortest day?</h2>
      {earliestSet && latestRise && (
        <p>
          The shortest day of the year in the Northern Hemisphere is the December solstice ({md.format(solstice)} this
          year), but the earliest sunset comes weeks before it and the latest sunrise weeks after. In New York this winter,
          the earliest sunset is on {md.format(earliestSet.noon)} ({t.format(earliestSet.set!)}) and the latest sunrise
          on {md.format(latestRise.noon)} ({t.format(latestRise.rise!)}). The reason is that solar noon, the moment the sun
          is highest, isn&apos;t fixed on the clock: around the December solstice it drifts later by about half a minute a
          day, because Earth moves fastest in its slightly oval orbit in early January and its axis is tilted. The day
          keeps shrinking at both ends, but the whole day slides later, so evenings start brightening before mornings do.
        </p>
      )}

      <h2 id="seasons">Why are days longer in summer, and opposite in Australia?</h2>
      <p>
        Earth&apos;s axis is tilted about 23.4°. For half the year the Northern Hemisphere leans toward the sun, which then
        climbs higher and stays up longer; for the other half the Southern Hemisphere does.{src.ref("nasaSeasons")}{" "}
        That&apos;s also why the seasons are reversed: when New York has its shortest days in December, Sydney has its
        longest. This year Sydney gets {hm(dec.minutes)} of daylight at the December solstice and only {hm(june.minutes)}{" "}
        in June. Within the Arctic and Antarctic circles the effect becomes extreme: the sun stays up for weeks in
        summer and doesn&apos;t rise at all in midwinter. The tool above says so on those days.
      </p>

      <h2 id="prayer">Sunrise, sunset and prayer times</h2>
      <p>
        The sunrise and sunset on this page are astronomical: the moments the top of the sun touches a flat horizon.
        Religious timetables use their own rules. Islamic prayer times such as Fajr and Isha are based on the sun&apos;s
        angle below the horizon, and different organizations use different angles, so the same city can have noticeably
        different Fajr times in different timetables. For prayer, fasting and other religious times, follow your local mosque, temple or community.
      </p>

      <h2 id="how">How these times are calculated</h2>
      <p>
        We calculate every time from the sun&apos;s position for the coordinates of the place you choose, using the
        standard definitions: sunrise and sunset when the sun&apos;s upper edge is on the horizon, with the bending of
        light by the atmosphere included.{src.ref("usnoRiseSetDefs")} The city list comes from GeoNames
        {src.ref("geonames")} and uses each city&apos;s center. The times assume a flat horizon at sea level: behind
        mountains or tall buildings the sun appears a few minutes later and disappears earlier, while from a high
        viewpoint or over the sea you may see it a minute or two longer. Unusual air temperatures near the ground can
        shift the moment by a minute as well.
      </p>
    </Prose>
  );
}
