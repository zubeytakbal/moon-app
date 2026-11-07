import type { Metadata } from "next";
import { enPageOpenGraph } from "@/lib/og";
import { cacheLife } from "next/cache";
import {
  getMoonPhase,
  getMoonPosition,
  getMoonRiseSet,
  getNextMoonEvent,
  getUpcomingPrincipalPhases,
  localDateParts,
  PHASE_NAMES_EN,
  zonedTimeToUtc,
} from "@moon-app/moon";
import { BreadcrumbTrail } from "@/components/Breadcrumb";
import { Byline } from "@/components/Byline";
import { EnArticleFooter } from "@/components/en/EnArticleFooter";
import { Faq } from "@/components/Faq";
import { MobileCollapse } from "@/components/MobileCollapse";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { enPageSources } from "@/components/Sources";
import { EN_FAQS } from "@/lib/en/faqs";
import { englishFullMoonNames } from "@/lib/en/full-moon-names";
import { EN_GROUP_NAMES, EN_HOME_PATH, EN_PAGES } from "@/lib/en/pages";
import { DEFAULT_PLACE, placeLabel } from "@/lib/en/places";
import { WORLD_CITIES } from "@/lib/en/world-cities";
import { siteConfig } from "@/site.config";
import { MoonExplorer } from "./MoonExplorer";

const PAGE = EN_PAGES.moonPhaseToday;
const UPDATED = "2026-11-06";
const src = enPageSources(
  "nasaMoonPhases",
  "nasaMoonFactSheet",
  "nasaPhaseCatalog",
  "almanacFullMoonNames",
  "usnoMoonPhases",
  "svsMoonPhase2026",
  "geonames",
  "wisdomlibTithi",
);

export const metadata: Metadata = {
  title: `Moon Phase Today and Tonight, With Moonrise for Your City | ${siteConfig.name}`,
  description:
    "What the moon looks like tonight where you are: today's phase and illumination, whether it's waxing or waning, moonrise and moonset with direction, the next full moon and a 30-day moon calendar.",
  // Yer ve tarih seçimi (?place=, ?date=) tarayıcıda; ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
    openGraph: enPageOpenGraph(PAGE),
};

export default function MoonPhaseTodayPage() {
  return (
    <>
      <Hero />
      <QuickLinks
        lang="en"
        links={[
          { href: "#tonight", label: "Tonight" },
          { href: "#path", label: "Tonight's path" },
          { href: "#calendar", label: "Next 30 days" },
          { href: "#traditional", label: "Tithi & Hijri" },
          { href: "#world", label: "World" },
          { href: "#waxing-waning", label: "Waxing or waning?" },
          { href: "#faq", label: "FAQ" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <Explorer />
        <WorldTable />
        <div className="mx-auto max-w-3xl">
          <Explainer />
          <div id="faq" className="scroll-mt-32">
            <Faq items={EN_FAQS.moonPhaseToday} lang="en" />
          </div>
          <EnArticleFooter page={PAGE} headline="Moon Phase Today and Tonight" updated={UPDATED} src={src} />
        </div>
      </main>
    </>
  );
}

/** Giriş alanı; yanındaki küçük ay New York için bugünün evresi (saatte bir). */
async function Hero() {
  "use cache";
  cacheLife("hours");
  const phase = getMoonPhase(new Date(), DEFAULT_PLACE.timeZone);
  return (
    <section className="starfield relative overflow-hidden bg-[#05070d] text-white">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 px-4 pb-14 pt-6 md:grid-cols-[1fr_auto] md:pb-16">
        <div>
          <BreadcrumbTrail
            tone="dark"
            label="Breadcrumb"
            items={[{ name: "Home", path: EN_HOME_PATH }, { name: EN_GROUP_NAMES[PAGE.group] }, { name: PAGE.title, path: PAGE.path }]}
          />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Moon tonight</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">Moon Phase Today</h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-200">
            Tonight&apos;s moon for your city: its phase and how it looks from where you are, when it rises and sets and in
            which direction, and what&apos;s coming next.
          </p>
          <Byline updated={UPDATED} lang="en" />
        </div>
        <div className="hidden md:block">
          <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={220} glow title={`${PHASE_NAMES_EN[phase.key]} today`} />
        </div>
      </div>
    </section>
  );
}

/** Araç: sunucu (ve Google) New York için hazır HTML üretir; "şu an" saatte bir yenilenir. */
async function Explorer() {
  "use cache";
  cacheLife("hours");
  return <MoonExplorer initialNow={new Date().toISOString()} refs={{ tithi: src.ref("wisdomlibTithi") }} />;
}

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const MOBILE_ROWS = 10;

/**
 * "Moonrise and moonset today around the world": elle seçilmiş şehirler, her biri kendi yerel gününde ve saatinde.
 * Evre her yerde aynı olduğu için tek satırda yazılır. Saatte bir yenilenir.
 */
async function WorldTable() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const phase = getMoonPhase(now, "UTC");
  return (
    <section aria-labelledby="world" className="mt-14">
      <h2 id="world" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Moonrise and moonset today around the world
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        The phase is the same everywhere ({PHASE_NAMES_EN[phase.key].toLowerCase()}, {Math.round(phase.illumination * 100)}% lit),
        but rise and set times are not. Each city is shown in its own local time and date. Tap a city for its full night.
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
              <th className="px-4 py-2.5 font-medium">Moonrise</th>
              <th className="px-4 py-2.5 font-medium">Moonset</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {WORLD_CITIES.map((p, i) => {
              const d = localDateParts(now, p.timeZone);
              const rs = getMoonRiseSet(zonedTimeToUtc(d.year, d.month, d.day, 12, p.timeZone), p);
              const t = new Intl.DateTimeFormat("en-US", { timeZone: p.timeZone, hour: "numeric", minute: "2-digit" });
              const dir = (x: Date) => COMPASS[Math.round(getMoonPosition(x, p).azimuth / 22.5) % 16];
              return (
                <tr key={p.id} data-extra={i >= MOBILE_ROWS || undefined}>
                  <td className="px-4 py-2">
                    <a href={`${PAGE.path}?place=${p.id}`} rel="nofollow" className="font-medium hover:underline">
                      {placeLabel(p)}
                    </a>
                  </td>
                  <td className="px-4 py-2 tabular-nums">
                    {rs.rise ? `${t.format(rs.rise)} ${dir(rs.rise)}` : "–"}
                  </td>
                  <td className="px-4 py-2 tabular-nums">{rs.set ? `${t.format(rs.set)} ${dir(rs.set)}` : "–"}</td>
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
 * Bilgi metni. Sayılar hesapla üretilir (New York'ta önümüzdeki ay doğuşları, sıradaki dolunayın adı), metin elle
 * yazılmıştır. Günde bir yenilenir.
 */
async function Explainer() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const ny = DEFAULT_PLACE;
  // New York'ta art arda 30 ay doğuşu: her gün kaç dakika geç doğuyor?
  const rises: Date[] = [];
  let t = now;
  for (let i = 0; i < 31; i++) {
    const r = getNextMoonEvent(t, ny, "rise");
    if (!r) break;
    rises.push(r);
    t = new Date(r.getTime() + 3_600_000);
  }
  const delays = rises.slice(1).map((r, i) => (r.getTime() - rises[i].getTime()) / 60_000 - 24 * 60);
  const avg = Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
  const min = Math.round(Math.min(...delays));
  const max = Math.round(Math.max(...delays));
  const nextFull = getUpcomingPrincipalPhases(now, 4).find((p) => p.key === "full-moon")!;
  const fullName = englishFullMoonNames([nextFull], ny.timeZone).get(nextFull.date.getTime());
  const md = new Intl.DateTimeFormat("en-US", { timeZone: ny.timeZone, month: "long", day: "numeric" });

  return (
    <Prose>
      <h2 id="why-phases">Why the moon has phases</h2>
      <p>
        The sun always lights half of the moon. As the moon circles Earth, we see that lit half from a changing angle:
        none of it at the new moon, when the moon sits roughly between us and the sun, all of it at the full moon, when
        it is on the far side of Earth, and part of it in between.{src.ref("nasaMoonPhases")} A full cycle, from one new
        moon to the next, takes 29.53 days on average,{src.ref("nasaMoonFactSheet")} but single cycles run anywhere from
        about 29.3 to 29.8 days because the sun&apos;s pull speeds the moon up and slows it down.{src.ref("nasaPhaseCatalog")}
      </p>
      <p>
        The four main phases (new moon, first quarter, full moon and last quarter) are single moments. Calendars,
        including the one above, give the whole local day of that moment the phase&apos;s name; on the days in between,
        the moon is a crescent or gibbous, waxing or waning.
      </p>

      <h2 id="waxing-waning">Waxing or waning? How to tell from where you are</h2>
      <p>
        A waxing moon is growing toward full; a waning moon is shrinking toward new. Which side is lit depends on where
        on Earth you stand, because the moon looks rotated from different latitudes:
      </p>
      <ul>
        <li>
          <strong>Northern Hemisphere</strong> (US, Canada, UK, Europe, most of India): lit on the right means waxing, lit
          on the left means waning. An old memory aid: a waxing moon looks like the curve of a D, a waning one like a C.
        </li>
        <li>
          <strong>Southern Hemisphere</strong> (Australia, New Zealand, South Africa, Argentina): the other way round. Lit
          on the left is waxing, lit on the right is waning.
        </li>
        <li>
          <strong>Near the equator</strong> (Singapore, Nairobi, southern India): the crescent lies on its back like a
          boat, lit from below in the evening and from above before dawn.
        </li>
      </ul>
      <p>
        There is a simpler test that works everywhere: a moon you see in the evening sky soon after sunset is waxing; one
        still up in the morning sky after sunrise is waning. The picture at the top of this page is turned the way the
        moon really looks from the city you choose, at the time shown under it.
      </p>

      <h2 id="same-everywhere">Is the moon phase the same everywhere?</h2>
      <p>
        Yes. The phase depends only on where the moon is in its orbit, so at any given moment it is the same for
        everyone on Earth. Three things do change with your location: the local date and time of a phase (a full moon at
        2 a.m. in London happens the evening before in New York), the way the moon is turned in the sky, and when it
        rises and sets.
      </p>

      <h2 id="later-each-day">Why the moon rises later every day</h2>
      <p>
        While Earth turns once, the moon moves about a thirtieth of the way along its orbit in the same direction, so
        Earth has to turn a little extra before the moon comes back over the horizon. In New York over the next month,
        moonrise comes on average {avg} minutes later each day, but the gap swings from {min} to {max} minutes, because
        the angle of the moon&apos;s path to the horizon keeps changing. In autumn the gap gets especially small around the
        full moon, which is why the Harvest Moon seems to rise at nearly the same time several evenings in a row.
      </p>

      <h2 id="full-moon-names">Full moon names</h2>
      <p>
        Each month&apos;s full moon has a traditional name from North American folklore, such as the Wolf Moon in January
        and the Strawberry Moon in June. The full moon closest to the September equinox is the Harvest Moon, the one after
        it the Hunter&apos;s Moon, and a second full moon in the same calendar month is a Blue Moon.
        {src.ref("almanacFullMoonNames")} The next full moon, on {md.format(nextFull.date)}, is the {fullName}. These names
        follow Northern Hemisphere seasons, so they don&apos;t really fit in Australia or New Zealand.
      </p>

      <h2 id="how">How we calculate</h2>
      <p>
        Every number on this page is calculated for the exact coordinates of the place you choose: the phase and
        illumination from the positions of the sun and moon, moonrise and moonset when the moon&apos;s upper edge crosses a
        flat horizon, with the bending of light by the atmosphere included. Our phase times match the U.S. Naval
        Observatory&apos;s tables{src.ref("usnoMoonPhases")} to within about a minute. The moon pictures are NASA&apos;s own
        renderings of the moon in each phase,{src.ref("svsMoonPhase2026")} turned to match your sky, and the place list
        comes from GeoNames.{src.ref("geonames")}
      </p>
    </Prose>
  );
}
