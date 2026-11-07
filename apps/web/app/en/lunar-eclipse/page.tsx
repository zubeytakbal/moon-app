import type { Metadata } from "next";
import { enPageOpenGraph } from "@/lib/og";
import Image from "next/image";
import { cacheLife } from "next/cache";
import { getUpcomingLunarEclipses, localDateParts, type LunarEclipse } from "@moon-app/moon";
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
import { WORLD_CITIES } from "@/lib/en/world-cities";
import { IMAGES } from "@/lib/images";
import { lunarPhases, lunarVisibility } from "@/lib/lunar-eclipse";
import { siteConfig } from "@/site.config";
import { LunarExplorer } from "./LunarExplorer";

const PAGE = EN_PAGES.lunarEclipse;
const UPDATED = "2026-11-07";
const NY = DEFAULT_PLACE;
const src = enPageSources("nasaLunarCatalog", "nasaLunarEclipseGuide", "nasaDanjon", "nasaMoonFactSheet", "geonames");
const KIND = { penumbral: "Penumbral", partial: "Partial", total: "Total" } as const;

/** Başlıkta "is there a blood moon in YYYY": Ekimden itibaren gelecek yıl. */
async function headlineYear() {
  "use cache";
  cacheLife("days");
  const p = localDateParts(new Date(), NY.timeZone);
  return p.month >= 10 ? p.year + 1 : p.year;
}

export async function generateMetadata(): Promise<Metadata> {
  const y = await headlineYear();
  return {
    title: `Next Lunar Eclipse and Blood Moon: Is There One in ${y}? | ${siteConfig.name}`,
    description: `When is the next lunar eclipse and blood moon you can see? Local times for every stage in your city, whether there is a blood moon in ${y}, every lunar eclipse to 2030 and why the moon turns red.`,
    alternates: { canonical: PAGE.path },
    openGraph: enPageOpenGraph(PAGE),
  };
}

export default function LunarEclipsePage() {
  return (
    <>
      <Hero />
      <QuickLinks
        lang="en"
        links={[
          { href: "#your-city", label: "From your city" },
          { href: "#this-year", label: "Blood moon this year?" },
          { href: "#all-eclipses", label: "All eclipses to 2030" },
          { href: "#world", label: "World" },
          { href: "#why-red", label: "Why red?" },
          { href: "#faq", label: "FAQ" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <Explorer />
        <ThisYear />
        <AllEclipses />
        <WorldTable />
        <div className="mx-auto max-w-3xl">
          <Explainer />
          <div id="faq" className="scroll-mt-32">
            <Faq items={EN_FAQS.lunarEclipse} lang="en" />
          </div>
          <EnArticleFooter page={PAGE} headline="Next Lunar Eclipse and Blood Moon" updated={UPDATED} src={src} />
        </div>
      </main>
    </>
  );
}

function Hero() {
  const img = IMAGES.bloodMoon;
  return (
    <section className="relative overflow-hidden bg-[#05070d] text-white">
      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-8 px-4 pb-14 pt-6 md:grid-cols-[1fr_auto] md:pb-16">
        <div>
          <BreadcrumbTrail
            tone="dark"
            label="Breadcrumb"
            items={[{ name: "Home", path: EN_HOME_PATH }, { name: EN_GROUP_NAMES[PAGE.group] }, { name: PAGE.title, path: PAGE.path }]}
          />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-red-300">Eclipses</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">When Is the Next Blood Moon?</h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-200">
            The next lunar eclipse and blood moon you can see from your city, with the local time of every stage, and every
            lunar eclipse to 2030.
          </p>
          <Byline updated={UPDATED} lang="en" />
        </div>
        <figure className="hidden w-80 md:block">
          <Image src={img.src} width={img.width} height={img.height} alt="The moon turned red during the total lunar eclipse of March 14, 2025" className="h-auto w-full rounded-2xl" priority />
          <figcaption className="mt-2 text-center text-xs text-zinc-400">
            March 14, 2025 ·{" "}
            <a href={img.sourceUrl} className="underline underline-offset-2" target="_blank" rel="noopener">
              {img.credit}
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/** Araç: sunucu (ve Google) New York için hazır HTML üretir. */
async function Explorer() {
  "use cache";
  cacheLife("hours");
  return <LunarExplorer initialNow={new Date().toISOString()} />;
}

function totalMinutes(e: LunarEclipse) {
  return Math.round(e.semiDurationMinutes.total * 2);
}

/** "Bu yıl kanlı ay var mı?": başlıktaki yıl için cevap ve sıradaki tam tutulma. Günde bir. */
async function ThisYear() {
  "use cache";
  cacheLife("days");

  const year = await headlineYear();
  const list = getUpcomingLunarEclipses(new Date(Date.UTC(year, 0, 1)), 8);
  const inYear = list.filter((e) => e.peak.getUTCFullYear() === year);
  const totals = inYear.filter((e) => e.kind === "total");
  const nextTotal = list.find((e) => e.kind === "total" && e.peak.getUTCFullYear() >= year)!;
  const md = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
  const kinds = inYear.map((e) => `${KIND[e.kind].toLowerCase()} on ${md.format(e.peak).replace(`, ${year}`, "")}`);

  return (
    <section aria-labelledby="this-year" className="mt-14 rounded-3xl border border-red-200 bg-white p-6 shadow-sm sm:p-8 dark:border-red-900 dark:bg-zinc-900">
      <h2 id="this-year" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Is there a blood moon in {year}?
      </h2>
      <p className="mt-3 text-lg">
        {totals.length ? (
          <>
            <strong>Yes.</strong> {totals.length === 1 ? "The total lunar eclipse" : "Total lunar eclipses"} of {year}:{" "}
            {totals.map((e) => md.format(e.peak)).join(" and ")}.
          </>
        ) : (
          <>
            <strong>No.</strong> {year} has {inYear.length} lunar eclipse{inYear.length === 1 ? "" : "s"} ({kinds.join(", ")}), but{" "}
            {inYear.length === 1 ? "it is not total" : "none of them is total"}, so the moon won&apos;t turn red. The next blood moon is
            on {md.format(nextTotal.peak)}, with {totalMinutes(nextTotal)} minutes of totality.
          </>
        )}
        {src.ref("nasaLunarCatalog")}
      </p>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">Dates in UTC; in the Americas the same eclipse can fall on the evening before.</p>
    </section>
  );
}

/** 2030 sonuna kadar bütün ay tutulmaları, kızıllık süresi ve listedeki hangi şehirlerden görüldüğü. Günde bir. */
async function AllEclipses() {
  "use cache";
  cacheLife("days");

  const list = getUpcomingLunarEclipses(new Date(), 14).filter((e) => e.peak.getUTCFullYear() <= 2030);
  const day = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });
  const rows = list.map((e) => {
    const seen = WORLD_CITIES.map((c) => ({ c, v: lunarVisibility(e, c) })).filter(({ v }) => (e.kind === "total" ? v.totalShare : v.share) > 0.5);
    return { e, seen };
  });

  return (
    <section aria-labelledby="all-eclipses" className="mt-14">
      <h2 id="all-eclipses" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Every lunar eclipse to 2030
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        A lunar eclipse is visible from the whole night side of Earth at once. Next to each are the cities from our list
        where the moon is up for most of the main stage (for total eclipses, the red part).
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5 font-medium">Date (UTC)</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Seen well from</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map(({ e, seen }) => (
              <tr key={e.peak.getTime()} className={e.kind === "total" ? "bg-red-50/60 dark:bg-red-950/20" : undefined}>
                <td className="whitespace-nowrap px-4 py-2.5 font-medium">{day.format(e.peak)}</td>
                <td className="px-4 py-2.5">
                  {KIND[e.kind]}
                  {e.kind === "total" && <span className="block text-xs text-red-700 dark:text-red-300">blood moon, {totalMinutes(e)} min</span>}
                </td>
                <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                  {seen.length
                    ? seen
                        .slice(0, 7)
                        .map(({ c }) => c.name)
                        .join(", ") + (seen.length > 7 ? ` and ${seen.length - 7} more` : "")
                    : "None of the cities in our list"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const MOBILE_ROWS = 10;

/** Sıradaki kanlı ayın (tam tutulma) şehirlerden görünüşü, yerel saatle. Günde bir. */
async function WorldTable() {
  "use cache";
  cacheLife("days");

  const next = getUpcomingLunarEclipses(new Date(), 10).find((e) => e.kind === "total")!;
  const total = lunarPhases(next).find((p) => p.key === "total")!;
  const rows = WORLD_CITIES.map((c) => ({ c, v: lunarVisibility(next, c) }));
  const verdict = (s: number) => (s === 0 ? "Not visible" : s > 0.97 ? "All of it" : "Part of it");
  const mdy = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });

  return (
    <section aria-labelledby="world" className="mt-14">
      <h2 id="world" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        The next blood moon ({mdy.format(next.peak)}) around the world
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        When the moon is red in each city&apos;s local time, and whether it is above the horizon then. Tap a city for all its
        eclipses.
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
              <th className="px-4 py-2.5 font-medium">Red moon (local)</th>
              <th className="px-4 py-2.5 font-medium">Visible?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map(({ c, v }, i) => {
              const d = new Intl.DateTimeFormat("en-US", { timeZone: c.timeZone, month: "short", day: "numeric" });
              const t = new Intl.DateTimeFormat("en-US", { timeZone: c.timeZone, hour: "numeric", minute: "2-digit" });
              return (
                <tr key={c.id} data-extra={i >= MOBILE_ROWS || undefined} className={v.totalShare === 0 ? "text-zinc-400" : undefined}>
                  <td className="px-4 py-2">
                    <a href={`${PAGE.path}?place=${c.id}`} rel="nofollow" className="font-medium hover:underline">
                      {placeLabel(c)}
                    </a>
                  </td>
                  <td className="px-4 py-2 tabular-nums">
                    {d.format(new Date(total.start))}, {t.format(new Date(total.start))} – {t.format(new Date(total.end))}
                  </td>
                  <td className="px-4 py-2">{verdict(v.totalShare)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </MobileCollapse>
    </section>
  );
}

/** Bilgi metni (elle yazılmış). */
function Explainer() {
  return (
    <Prose>
      <h2 id="why-red">Why the moon turns red</h2>
      <p>
        In a total lunar eclipse, Earth sits exactly between the sun and the full moon, and the moon moves into Earth&apos;s
        shadow. It doesn&apos;t go black, because some sunlight still reaches it: the light that passes through the edge of
        Earth&apos;s atmosphere is bent into the shadow, and on the way the blue part of it is scattered out, leaving red and
        orange. NASA describes it as if all the world&apos;s sunrises and sunsets were projected onto the moon; the more dust
        or clouds in the atmosphere, the redder it looks.{src.ref("nasaLunarEclipseGuide")}
      </p>
      <p>
        No two blood moons look the same. Astronomers rate them on the Danjon scale, from L0, so dark the moon almost
        disappears, to L4, a bright copper-orange. After big volcanic eruptions, which fill the upper atmosphere with fine
        dust, eclipses can stay very dark for a few years.{src.ref("nasaDanjon")}
      </p>

      <h2 id="types">Total, partial and penumbral</h2>
      <p>
        Earth&apos;s shadow has two parts: a dark core, the umbra, and a pale outer fringe, the penumbra. When the whole moon
        passes into the umbra, the eclipse is <strong>total</strong> and the moon turns red. When only part of it does, the
        eclipse is <strong>partial</strong>: a dark bite is taken out of the moon. When the moon only grazes the penumbra,
        the eclipse is <strong>penumbral</strong>; the moon dims so slightly that most people don&apos;t notice anything.
      </p>

      <h2 id="why-not-every-month">Why there isn&apos;t an eclipse every full moon</h2>
      <p>
        A lunar eclipse can only happen at full moon, when the moon is opposite the sun. But the moon&apos;s orbit is tilted
        about 5° to Earth&apos;s,{src.ref("nasaMoonFactSheet")} so most full moons pass a little above or below Earth&apos;s
        shadow. Only when a full moon falls near the points where the two orbits cross does the moon go through it. That
        gives two lunar eclipses in most years, sometimes three or four, but many of them are only partial or penumbral.
      </p>

      <h2 id="watch">How to watch</h2>
      <p>
        A lunar eclipse is completely safe to look at: unlike a solar eclipse, you don&apos;t need glasses or any special
        equipment, though binoculars or a small telescope show the colors better.{src.ref("nasaLunarEclipseGuide")} Find a
        spot with a clear view of the moon away from bright lights. The red stage is the highlight; the partial stages
        before and after are worth watching too, as the shadow creeps across the moon&apos;s face. For photos, use a tripod:
        the eclipsed moon is far fainter than a normal full moon, so you&apos;ll need much longer exposures.
      </p>

      <h2 id="beliefs">Eclipses and religious practice</h2>
      <p>
        Many traditions mark a lunar eclipse: in Hinduism with the Sutak period and in Islam with the eclipse prayer, for
        example. For those, follow your local panchang, temple, mosque or community; the times on this page are
        astronomical.
      </p>

      <h2 id="how">How we calculate</h2>
      <p>
        The start and end of each stage come from the positions of the sun, moon and Earth&apos;s shadow; our dates and types
        match NASA&apos;s eclipse catalog.{src.ref("nasaLunarCatalog")} Whether you can see a stage depends only on whether
        the moon is above your horizon at the time, which we work out for your exact location every two minutes. City data
        come from GeoNames.{src.ref("geonames")}
      </p>
    </Prose>
  );
}
