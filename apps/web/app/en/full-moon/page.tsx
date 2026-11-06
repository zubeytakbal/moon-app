import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import {
  getFullMoonRise,
  getFullMoonsOfYear,
  getMoonDistanceKm,
  getNextBlueMoon,
  getSeasons,
  getUpcomingLunarEclipses,
  getUpcomingPrincipalPhases,
  localDateParts,
} from "@moon-app/moon";
import { BreadcrumbTrail } from "@/components/Breadcrumb";
import { Byline } from "@/components/Byline";
import { CalendarSubscribe } from "@/components/CalendarSubscribe";
import { EnArticleFooter } from "@/components/en/EnArticleFooter";
import { Faq } from "@/components/Faq";
import { MobileCollapse } from "@/components/MobileCollapse";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { enPageSources } from "@/components/Sources";
import { EN_FAQS } from "@/lib/en/faqs";
import { englishFullMoonNames } from "@/lib/en/full-moon-names";
import { EN_FULL_MOON_CALENDAR_PATH } from "@/lib/en/ics";
import { EN_GROUP_NAMES, EN_HOME_PATH, EN_PAGES } from "@/lib/en/pages";
import { DEFAULT_PLACE, placeLabel } from "@/lib/en/places";
import { WORLD_CITIES } from "@/lib/en/world-cities";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { siteConfig } from "@/site.config";
import { FullMoonExplorer } from "./FullMoonExplorer";

const PAGE = EN_PAGES.fullMoon;
const UPDATED = "2026-11-06";
const NY = DEFAULT_PLACE;
const src = enPageSources("almanacFullMoonNames", "nasaMoonPhases", "nasaMoonFactSheet", "nasaSupermoons", "arliss2005", "cajochen2013", "wisdomlibTithi", "geonames");

/** BaÅŸlÄ±ktaki yÄ±llar kendiliÄŸinden ilerler (New York'taki bu yÄ±l ve gelecek yÄ±l). */
async function titleYears() {
  "use cache";
  cacheLife("days");
  const y = localDateParts(new Date(), NY.timeZone).year;
  return [y, y + 1];
}

export async function generateMetadata(): Promise<Metadata> {
  const [y, y1] = await titleYears();
  return {
    title: `Next Full Moon: Date, Time and Full Moon Calendar ${y}-${y1} | ${siteConfig.name}`,
    description: `When is the next full moon? The date and exact time in your time zone, its name, when it rises where you are, and every full moon of ${y} and ${y1} with supermoons and eclipses.`,
    // Yer ve tarih seÃ§imi (?place=, ?date=) tarayÄ±cÄ±da; ayrÄ± sayfa sayÄ±lmasÄ±n.
    alternates: { canonical: PAGE.path },
  };
}

export default function FullMoonPage() {
  return (
    <>
      <Hero />
      <QuickLinks
        lang="en"
        links={[
          { href: "#next", label: "Next full moon" },
          { href: "#watch", label: "Watch it rise" },
          { href: "#calendar", label: "Calendar" },
          { href: "#year-notes", label: "Highlights" },
          { href: "#world", label: "World" },
          { href: "#how-long", label: "How long it lasts" },
          { href: "#faq", label: "FAQ" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <Explorer />
        <CalendarSubscribe
          lang="en"
          path={EN_FULL_MOON_CALENDAR_PATH}
          title="Add every full moon to your calendar"
          text="Each full moon appears in your phone or computer calendar at its exact time in your own time zone, with its name, supermoons and lunar eclipses. The calendar updates itself."
        />
        <YearNotes />
        <WorldTable />
        <div className="mx-auto max-w-3xl">
          <Explainer />
          <div id="faq" className="scroll-mt-32">
            <Faq items={EN_FAQS.fullMoon} lang="en" />
          </div>
          <EnArticleFooter page={PAGE} headline="Next Full Moon: Date, Time and Full Moon Calendar" updated={UPDATED} src={src} />
        </div>
      </main>
    </>
  );
}

function Hero() {
  return (
    <section className="starfield relative overflow-hidden bg-[#05070d] text-white">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 px-4 pb-14 pt-6 md:grid-cols-[1fr_auto] md:pb-16">
        <div>
          <BreadcrumbTrail
            tone="dark"
            label="Breadcrumb"
            items={[{ name: "Home", path: EN_HOME_PATH }, { name: EN_GROUP_NAMES[PAGE.group] }, { name: PAGE.title, path: PAGE.path }]}
          />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Full moon</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">When Is the Next Full Moon?</h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-200">
            The date and exact time in your time zone, its traditional name, when and where to watch it rise from your
            city, and every full moon of this year and next.
          </p>
          <Byline updated={UPDATED} lang="en" />
        </div>
        <div className="hidden md:block">
          <MoonPhaseIcon phaseAngle={180} size={220} glow title="Full moon" />
        </div>
      </div>
    </section>
  );
}

/** AraÃ§: sunucu (ve Google) New York iÃ§in hazÄ±r HTML Ã¼retir; saatte bir yenilenir. */
async function Explorer() {
  "use cache";
  cacheLife("hours");
  return <FullMoonExplorer initialNow={new Date().toISOString()} />;
}

/**
 * YÄ±lÄ±n Ã¶ne Ã§Ä±kanlarÄ±: dolunay sayÄ±sÄ±, en bÃ¼yÃ¼k/kÃ¼Ã§Ã¼k, Hasat AyÄ±, mavi ay, dolunaya denk gelen tutulmalar.
 * Ekimden itibaren gelecek yÄ±l anlatÄ±lÄ±r. Tarihler ABD DoÄŸu saatine gÃ¶re (adlar Kuzey Amerika geleneÄŸinden). GÃ¼nde bir.
 */
async function YearNotes() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const p = localDateParts(now, NY.timeZone);
  const year = p.month >= 10 ? p.year + 1 : p.year;
  const all = [year - 1, year, year + 1]
    .flatMap((y) => getFullMoonsOfYear(y))
    .filter((m, i, list) => list.findIndex((q) => q.date.getTime() === m.date.getTime()) === i);
  const moons = all.filter((m) => localDateParts(m.date, NY.timeZone).year === year);
  const names = englishFullMoonNames(moons, NY.timeZone);
  const withKm = moons.map((m) => ({ m, km: getMoonDistanceKm(m.date) }));
  const biggest = withKm.reduce((a, b) => (b.km < a.km ? b : a));
  const smallest = withKm.reduce((a, b) => (b.km > a.km ? b : a));
  const supers = withKm.filter((x) => x.km < SUPERMOON_KM);
  const harvest = moons.find((m) => names.get(m.date.getTime()) === "Harvest Moon");
  const blue = moons.find((m) => names.get(m.date.getTime()) === "Blue Moon");
  const nextBlue = blue ? null : getNextBlueMoon(new Date(Date.UTC(year + 1, 0, 1)), NY.timeZone);
  const eclipses = getUpcomingLunarEclipses(new Date(Date.UTC(year, 0, 1)), 4).filter(
    (e) => localDateParts(e.peak, NY.timeZone).year === year,
  );
  const equinox = getSeasons(year).septemberEquinox;
  const md = new Intl.DateTimeFormat("en-US", { timeZone: NY.timeZone, month: "long", day: "numeric" });
  const mdy = new Intl.DateTimeFormat("en-US", { timeZone: NY.timeZone, month: "long", day: "numeric", year: "numeric" });
  const km = (x: number) => `${(Math.round(x / 100) * 100).toLocaleString("en-US")} km`;

  return (
    <section aria-labelledby="year-notes" className="mx-auto mt-14 max-w-3xl">
      <Prose>
        <h2 id="year-notes">Full moon highlights of {year}</h2>
        <ul>
          <li>
            <strong>{moons.length} full moons.</strong> The first is the {names.get(moons[0].date.getTime())} on{" "}
            {md.format(moons[0].date)}, the last the {names.get(moons[moons.length - 1].date.getTime())} on{" "}
            {md.format(moons[moons.length - 1].date)} (US Eastern time).
          </li>
          <li>
            <strong>Biggest:</strong> the {names.get(biggest.m.date.getTime())} on {md.format(biggest.m.date)}, {km(biggest.km)} from
            Earth{supers.length ? `. ${supers.length === 1 ? "It is the year's only supermoon" : `It is one of ${supers.length} supermoons this year`}` : ", not quite close enough to count as a supermoon"}.{" "}
            <strong>Smallest:</strong> the {names.get(smallest.m.date.getTime())} on {md.format(smallest.m.date)}, {km(smallest.km)} away. The biggest looks about{" "}
            {Math.round((smallest.km / biggest.km - 1) * 100)}% wider in the sky than the smallest.
          </li>
          {harvest && (
            <li>
              <strong>Harvest Moon:</strong> {md.format(harvest.date)}, the full moon closest to the September equinox (
              {md.format(equinox)}).
            </li>
          )}
          <li>
            <strong>Blue Moon:</strong>{" "}
            {blue
              ? `yes, on ${md.format(blue.date)}, the second full moon of the month.`
              : `none this year${nextBlue ? `; the next one is on ${mdy.format(nextBlue.date)}` : ""}.`}
          </li>
          <li>
            <strong>Lunar eclipses:</strong>{" "}
            {eclipses.length ? eclipseSentence(eclipses.map((e) => ({ kind: e.kind, date: md.format(e.peak) }))) : "none this year."}
          </li>
        </ul>
      </Prose>
    </section>
  );
}

const COUNT_WORDS = ["", "one", "two", "three", "four"];
const ECLIPSE_NOTES = {
  penumbral: "a faint shading most people won't notice",
  partial: "part of the moon goes dark",
  total: "the whole moon turns red, a blood moon",
} as const;

/** Tutulmaları türe göre gruplar: "three penumbral eclipses (February 20, July 18 and August 17): a faint shading…". */
function eclipseSentence(list: { kind: keyof typeof ECLIPSE_NOTES; date: string }[]) {
  const kinds = [...new Set(list.map((e) => e.kind))];
  return (
    kinds
      .map((k) => {
        const dates = list.filter((e) => e.kind === k).map((e) => e.date);
        const joined = dates.length > 1 ? `${dates.slice(0, -1).join(", ")} and ${dates[dates.length - 1]}` : dates[0];
        return dates.length > 1
          ? `${COUNT_WORDS[dates.length] ?? dates.length} ${k} eclipses (${joined}): ${ECLIPSE_NOTES[k]}`
          : `a ${k} eclipse on ${joined}: ${ECLIPSE_NOTES[k]}`;
      })
      .join("; ") + "."
  );
}

const MOBILE_ROWS = 10;

/** SÄ±radaki dolunayÄ±n ÅŸehirlerdeki yerel tarihi, saati ve o akÅŸamki doÄŸuÅŸu. Saatte bir. */
async function WorldTable() {
  "use cache";
  cacheLife("hours");

  const next = getUpcomingPrincipalPhases(new Date(), 4).find((p) => p.key === "full-moon")!;
  return (
    <section aria-labelledby="world" className="mt-14">
      <h2 id="world" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        The next full moon around the world
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        The full moon happens at the same moment everywhere, but the local date and time differ, and so does moonrise.
        Tap a city to see its full calendar.
      </p>
      <MobileCollapse
        hiddenCount={WORLD_CITIES.length - MOBILE_ROWS}
        noun="cities"
        className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5 font-medium">City</th>
              <th className="px-4 py-2.5 font-medium">Full moon</th>
              <th className="px-4 py-2.5 font-medium">Moonrise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {WORLD_CITIES.map((c, i) => {
              const day = new Intl.DateTimeFormat("en-US", { timeZone: c.timeZone, weekday: "short", month: "short", day: "numeric" });
              const t = new Intl.DateTimeFormat("en-US", { timeZone: c.timeZone, hour: "numeric", minute: "2-digit" });
              const rise = getFullMoonRise(next.date, c).rise;
              return (
                <tr key={c.id} data-extra={i >= MOBILE_ROWS || undefined}>
                  <td className="px-4 py-2">
                    <a href={`${PAGE.path}?place=${c.id}`} rel="nofollow" className="font-medium hover:underline">
                      {placeLabel(c)}
                    </a>
                  </td>
                  <td className="px-4 py-2 tabular-nums">
                    {day.format(next.date)}, {t.format(next.date)}
                  </td>
                  <td className="px-4 py-2 tabular-nums">
                    {day.format(rise)}, {t.format(rise)}
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

/** Bilgi metni. SayÄ±lar New York iÃ§in hesaplanÄ±r; metin elle yazÄ±lmÄ±ÅŸtÄ±r. */
function Explainer() {
  // New York'ta Haziran ve AralÄ±k dolunayÄ±nÄ±n en yÃ¼ksek konumu (yaklaÅŸÄ±k: Ã¶ÄŸle yÃ¼ksekliÄŸi = 90 âˆ’ enlem Â± eÄŸim).
  const winterAlt = Math.round(90 - NY.latitude + 23.4);
  const summerAlt = Math.round(90 - NY.latitude - 23.4);

  return (
    <Prose>
      <h2 id="how-long">How long does a full moon last?</h2>
      <p>
        Strictly, only an instant: the moment the moon is exactly opposite the sun in its orbit, which is the time given
        in the tables above. To the eye, though, the moon looks full for about three nights, because it is more than 97%
        lit for about a day and a half on either side of that moment. That&apos;s why the night before or after is just as good for
        watching, and why calendars sometimes list the full moon on the day before or after the one shown here: the exact
        moment falls on different dates in different time zones.
      </p>

      <h2 id="bright">Why the full moon is so bright, and why it looks huge when it rises</h2>
      <p>
        At full moon, the side facing us is lit head-on, with no shadows from mountains or craters to darken it, so it
        is much brighter than at first or last quarter.{src.ref("nasaMoonPhases")} Its distance changes over the year too:
        a full moon at the closest point of the moon&apos;s oval orbit, a supermoon, can look up to 14% bigger and 30%
        brighter than the year&apos;s smallest full moon.{src.ref("nasaSupermoons")} The huge moon you sometimes see sitting on the
        horizon is a different thing: an illusion of the eye. Measured, the rising moon is no bigger than when it is high
        in the sky.
      </p>

      <h2 id="winter-summer">Why the full moon rides high in winter and low in summer</h2>
      <p>
        A full moon sits opposite the sun, so it takes the path the sun takes six months later. In winter, when the sun is
        low, the full moon climbs high and stays up for most of the long night; in summer it stays low. In New York the
        December full moon can reach about {winterAlt}Â° above the southern horizon, while the June full moon gets only to
        about {summerAlt}Â°. In the Southern Hemisphere it&apos;s the other way round, with the high full moons in June and
        July.
      </p>

      <h2 id="names">Full moon names</h2>
      <p>
        The monthly names, from the Wolf Moon in January to the Cold Moon in December, come from North American traditions
        collected by The Old Farmer&apos;s Almanac.{src.ref("almanacFullMoonNames")} The full moon nearest the September
        equinox is the Harvest Moon and the next one the Hunter&apos;s Moon; a second full moon in one calendar month is a
        Blue Moon. Because the names follow the seasons of the Northern Hemisphere, they don&apos;t fit Australia or New
        Zealand, where the Harvest Moon would come in March or April. A Blue Moon also depends on your time zone: a full
        moon right at the end of a month can be the second of that month in one place and the first of the next in
        another.
      </p>

      <h2 id="purnima">Full moon and Purnima</h2>
      <p>
        In the Hindu calendar the full moon day is Purnima, the fifteenth tithi of the bright fortnight.
        {src.ref("wisdomlibTithi")} Because festival days follow the tithi at sunrise, Purnima can fall on the day before
        or the day of the exact full moon in India. Our{" "}
        <a href={EN_PAGES.moonPhaseToday.path + "#traditional"}>Moon Phase Today</a> page shows the exact start and end of
        the next Purnima tithi for your city.
      </p>

      <h2 id="how">How we calculate</h2>
      <p>
        Every full moon is the moment the moon reaches 180Â° from the sun in longitude, calculated from the positions of the
        sun and moon; the cycle averages 29.53 days.{src.ref("nasaMoonFactSheet")} Times are shown in the time zone of the
        place you choose. We count a full moon as a supermoon when it is closer than {SUPERMOON_KM.toLocaleString("en-US")}{" "}
        km; there is no official definition, so other sites draw the line a little differently. City data come from
        GeoNames.{src.ref("geonames")}
      </p>
    </Prose>
  );
}
