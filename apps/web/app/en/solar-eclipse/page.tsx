import type { Metadata } from "next";
import { enPageOpenGraph } from "@/lib/og";
import Image from "next/image";
import { cacheLife } from "next/cache";
import { getLocalSolarEclipse, getUpcomingSolarEclipses, type LocalSolarEclipse, type SolarEclipseKind } from "@moon-app/moon";
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
import { DEFAULT_PLACE, placeLabel, type EnPlace } from "@/lib/en/places";
import { WORLD_CITIES } from "@/lib/en/world-cities";
import { IMAGES, type SiteImage } from "@/lib/images";
import { siteConfig } from "@/site.config";
import { SolarExplorer } from "./SolarExplorer";

const PAGE = EN_PAGES.solarEclipse;
const UPDATED = "2026-11-07";
const DAY_MS = 86_400_000;
/** 2 Ağustos 2027 tutulmasını bulmak için arama başlangıcı. */
const AUG_2027 = new Date("2027-07-25T00:00:00Z");
const src = enPageSources("eclipsewise2027", "nasaSolarCatalog", "nasaEclipseSafety", "nasaEclipseMyths", "nasaMoonFactSheet", "geonames");

export const metadata: Metadata = {
  title: `Next Solar Eclipse From Your City, and the August 2, 2027 Total Eclipse | ${siteConfig.name}`,
  description:
    "When is the next solar eclipse you can see? Local times and how much of the sun is covered for your city, the path and times of the August 2, 2027 total eclipse, every solar eclipse to 2036, and how to watch safely.",
  // Yer ve tarih seçimi (?place=, ?date=) tarayıcıda; ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
    openGraph: enPageOpenGraph(PAGE),
};

/** Tam tutulma yolundaki ve yakınındaki şehirler (koordinatlar GeoNames). Yalnız bu tabloda; adres bağlantısı yok. */
const PATH_CITIES: EnPlace[] = (
  [
    ["Cádiz", "ES", 36.5271, -6.2886, "Europe/Madrid"],
    ["Málaga", "ES", 36.7202, -4.4203, "Europe/Madrid"],
    ["Seville", "ES", 37.3891, -5.9845, "Europe/Madrid"],
    ["Madrid", "ES", 40.4165, -3.7026, "Europe/Madrid"],
    ["Gibraltar", "GI", 36.1447, -5.3526, "Europe/Gibraltar"],
    ["Tangier", "MA", 35.7673, -5.7997, "Africa/Casablanca"],
    ["Tunis", "TN", 36.819, 10.1658, "Africa/Tunis"],
    ["Benghazi", "LY", 32.1167, 20.0667, "Africa/Tripoli"],
    ["Luxor", "EG", 25.6872, 32.6396, "Africa/Cairo"],
    ["Cairo", "EG", 30.0626, 31.2497, "Africa/Cairo"],
    ["Jeddah", "SA", 21.4858, 39.1925, "Asia/Riyadh"],
    ["Mecca", "SA", 21.4266, 39.8256, "Asia/Riyadh"],
    ["Riyadh", "SA", 24.6877, 46.7219, "Asia/Riyadh"],
  ] as const
).map(([name, country, latitude, longitude, timeZone]) => ({ id: 0, name, country, admin: "", latitude, longitude, elevation: 0, timeZone }));

export default function SolarEclipsePage() {
  return (
    <>
      <Hero />
      <QuickLinks
        lang="en"
        links={[
          { href: "#your-city", label: "From your city" },
          { href: "#august-2027", label: "August 2, 2027" },
          { href: "#upcoming", label: "Next 10 years" },
          { href: "#safety", label: "Watch safely" },
          { href: "#types", label: "Total or partial?" },
          { href: "#faq", label: "FAQ" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <Explorer />
        <August2027 />
        <Upcoming />
        <div className="mx-auto max-w-3xl">
          <Explainer />
          <div id="faq" className="scroll-mt-32">
            <Faq items={EN_FAQS.solarEclipse} lang="en" />
          </div>
          <EnArticleFooter page={PAGE} headline="Next Solar Eclipse and the August 2, 2027 Total Eclipse" updated={UPDATED} src={src} />
        </div>
      </main>
    </>
  );
}

function Hero() {
  const img = IMAGES.solarCorona;
  return (
    <section className="relative overflow-hidden bg-[#05070d] text-white">
      <Image src={img.src} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05070d] via-[#05070d]/80 to-transparent" />
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-6 md:pb-20">
        <BreadcrumbTrail
          tone="dark"
          label="Breadcrumb"
          items={[{ name: "Home", path: EN_HOME_PATH }, { name: EN_GROUP_NAMES[PAGE.group] }, { name: PAGE.title, path: PAGE.path }]}
        />
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Eclipses</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">When Is the Next Solar Eclipse?</h1>
        <p className="mt-5 max-w-2xl text-lg text-zinc-200">
          The next eclipses you can see from your city, with local times and how much of the sun goes dark, plus the
          great total eclipse of August 2, 2027 across Spain, North Africa and Arabia.
        </p>
        <Byline updated={UPDATED} lang="en" />
        <p className="mt-6 text-xs text-zinc-400">
          Photo: total solar eclipse of August 21, 2017, by{" "}
          <a href={img.sourceUrl} className="underline underline-offset-2" target="_blank" rel="noopener">
            {img.credit}
          </a>
        </p>
      </div>
    </section>
  );
}

/** Araç: sunucu (ve Google) New York için hazır HTML üretir; günde bir yenilenir. */
async function Explorer() {
  "use cache";
  cacheLife("hours");
  return <SolarExplorer initialNow={new Date().toISOString()} />;
}

function pct(e: LocalSolarEclipse) {
  return Math.round(e.obscuration * 100);
}

function seen(e: LocalSolarEclipse) {
  return e.obscuration > 0.001 && (e.beginSunAltitude > 0 || e.peakSunAltitude > 0 || e.endSunAltitude > 0);
}

function duration(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

const MOBILE_ROWS = 10;

/** 2 Ağustos 2027: kaynaktaki bilgiler, yol üstündeki şehirler ve dünya şehirleri. Kalıcı içerik; günde bir. */
async function August2027() {
  "use cache";
  cacheLife("days");

  const pathRows = PATH_CITIES.map((c) => ({ c, e: getLocalSolarEclipse(AUG_2027, c) }));
  const worldRows = WORLD_CITIES.map((c) => ({ c, e: getLocalSolarEclipse(AUG_2027, c) }))
    .filter(({ e }) => Math.abs(e.peak.getTime() - Date.UTC(2027, 7, 2, 10)) < DAY_MS)
    .sort((a, b) => b.e.obscuration - a.e.obscuration);
  const notVisible = WORLD_CITIES.filter((c) => !worldRows.some((r) => r.c.id === c.id && seen(r.e)));
  const time = (c: EnPlace, d: Date) => new Intl.DateTimeFormat("en-US", { timeZone: c.timeZone, hour: "numeric", minute: "2-digit" }).format(d);
  const luxor = pathRows.find((r) => r.c.name === "Luxor")!.e;
  const london = worldRows.find((r) => r.c.name === "London");
  const delhi = worldRows.find((r) => r.c.name === "Delhi");

  return (
    <section aria-labelledby="august-2027" className="mt-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">The eclipse of the decade</p>
      <h2 id="august-2027" className="mt-1 scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        The total solar eclipse of August 2, 2027
      </h2>
      <div className="mt-4 max-w-3xl space-y-3 text-zinc-700 dark:text-zinc-300">
        <p>
          On Monday, August 2, 2027, the moon&apos;s shadow crosses Morocco, southern Spain, Algeria, Libya, Egypt, Saudi
          Arabia, Yemen and Somalia, while most of Africa, Europe, the Middle East and west and south Asia see a partial
          eclipse.{src.ref("eclipsewise2027")} At the point of greatest eclipse, in southern Egypt, the sun stays
          completely hidden for 6 minutes 23 seconds, an unusually long totality. By our calculation, Luxor gets{" "}
          {duration(luxor.centralSeconds)} of totality with the sun almost overhead.
        </p>
        <p>
          {london && `In London the moon covers ${pct(london.e)}% of the sun at ${time(london.c, london.e.peak)} local time`}
          {delhi && `, in Delhi ${pct(delhi.e)}% at ${time(delhi.c, delhi.e.peak)}`}. The eclipse is not visible from the Americas,
          Australia or East Asia.
        </p>
      </div>

      <h3 className="mt-8 text-lg font-semibold">Along the path of totality</h3>
      <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5 font-medium">Place</th>
              <th className="px-4 py-2.5 font-medium">Deepest (local)</th>
              <th className="px-4 py-2.5 font-medium">What you see</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {pathRows.map(({ c, e }) => (
              <tr key={c.name} className={e.centralSeconds > 0 ? "bg-amber-50/60 dark:bg-amber-950/20" : undefined}>
                <td className="px-4 py-2 font-medium">{placeLabel(c)}</td>
                <td className="px-4 py-2 tabular-nums">{time(c, e.peak)}</td>
                <td className="px-4 py-2">{e.centralSeconds > 0 ? `Total, ${duration(e.centralSeconds)}` : `Partial, ${pct(e)}% covered`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 text-lg font-semibold">From major cities</h3>
      <MobileCollapse
        hiddenCount={Math.max(0, worldRows.filter(({ e }) => seen(e)).length - MOBILE_ROWS)}
        noun="cities"
        className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5 font-medium">City</th>
              <th className="px-4 py-2.5 font-medium">Deepest (local)</th>
              <th className="px-4 py-2.5 font-medium">Sun covered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {worldRows
              .filter(({ e }) => seen(e))
              .map(({ c, e }, i) => (
                <tr key={c.id} data-extra={i >= MOBILE_ROWS || undefined}>
                  <td className="px-4 py-2">
                    <a href={`${PAGE.path}?place=${c.id}`} rel="nofollow" className="font-medium hover:underline">
                      {placeLabel(c)}
                    </a>
                  </td>
                  <td className="px-4 py-2 tabular-nums">{time(c, e.peak)}</td>
                  <td className="px-4 py-2 tabular-nums">{pct(e)}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </MobileCollapse>
      <p className="mt-3 text-sm text-zinc-500">
        Not visible from: {notVisible.map((c) => c.name).join(", ")}.
      </p>
    </section>
  );
}

const KIND_WORDS: Record<SolarEclipseKind, string> = { total: "Total", annular: "Annular", partial: "Partial" };

/** 10 yılın güneş tutulmaları ve listedeki hangi büyük şehirlerden görüldüğü (≥%10). Günde bir. */
async function Upcoming() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const list = getUpcomingSolarEclipses(now, 30).filter((e) => e.peak.getTime() < now.getTime() + 10 * 365.25 * DAY_MS);
  const cities = [...WORLD_CITIES, ...PATH_CITIES.filter((c) => !WORLD_CITIES.some((w) => w.name === c.name))];
  const rows = list.map((g) => {
    const near = new Date(g.peak.getTime() - 2 * DAY_MS);
    const from = cities
      .map((c) => ({ c, e: getLocalSolarEclipse(near, c) }))
      .filter(({ e }) => Math.abs(e.peak.getTime() - g.peak.getTime()) < DAY_MS && seen(e) && e.obscuration >= 0.1)
      .sort((a, b) => b.e.obscuration - a.e.obscuration);
    return { g, from };
  });
  const day = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });

  return (
    <section aria-labelledby="upcoming" className="mt-16">
      <h2 id="upcoming" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Every solar eclipse in the next 10 years
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        There are two to five solar eclipses each year, but each is seen only from part of the world. Next to every eclipse
        are the cities from our list where the moon covers at least 10% of the sun.{src.ref("nasaSolarCatalog")}
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5 font-medium">Date (UTC)</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Seen from (most covered first)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map(({ g, from }) => (
              <tr key={g.peak.getTime()}>
                <td className="whitespace-nowrap px-4 py-2.5 font-medium">{day.format(g.peak)}</td>
                <td className="px-4 py-2.5">{KIND_WORDS[g.kind]}</td>
                <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                  {from.length
                    ? from
                        .slice(0, 6)
                        .map(({ c, e }) => `${c.name} ${Math.round(e.obscuration * 100)}%`)
                        .join(", ") + (from.length > 6 ? ` and ${from.length - 6} more` : "")
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

function EnFigure({ image, caption }: { image: SiteImage; caption: string }) {
  return (
    <figure className="mt-8">
      <div className="overflow-hidden rounded-2xl bg-[#05070d]">
        <Image src={image.src} width={image.width} height={image.height} alt={caption} sizes="(min-width: 768px) 768px, 100vw" className="h-auto w-full" />
      </div>
      <figcaption className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        {caption}{" "}
        <a href={image.sourceUrl} target="_blank" rel="noopener" className="text-zinc-500 underline-offset-2 hover:underline">
          Photo: {image.credit}
        </a>
      </figcaption>
    </figure>
  );
}

/** Bilgi metni. New York için sıradaki tam tutulma hesaplanır; metin elle yazılmıştır. Günde bir. */
async function Explainer() {
  "use cache";
  cacheLife("days");

  let t = new Date();
  let nyTotal: LocalSolarEclipse | null = null;
  for (let i = 0; i < 120 && !nyTotal; i++) {
    const e = getLocalSolarEclipse(t, DEFAULT_PLACE);
    if (e.peak.getUTCFullYear() > 2100) break;
    if (e.kind === "total" && e.centralSeconds > 0 && e.peakSunAltitude > 0) nyTotal = e;
    t = new Date(e.peak.getTime() + DAY_MS);
  }
  const mdy = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric" });

  return (
    <Prose>
      <h2 id="safety">How to watch a solar eclipse safely</h2>
      <p>
        Never look straight at the sun, even when most of it is covered: the thin crescent that remains is still bright
        enough to burn the retina, and it doesn&apos;t hurt while it happens. Use eclipse glasses or a handheld solar
        viewer that meets the ISO 12312-2 standard, and throw them away if they are scratched or damaged. Ordinary
        sunglasses are not safe. A pinhole projector, even a piece of card with a small hole in it, lets you watch the
        sun&apos;s image on the ground safely. Never look at the sun through a camera lens, binoculars or a telescope:
        they need a proper solar filter attached to the front.{src.ref("nasaEclipseSafety")}
      </p>
      <p>
        Only during totality, when the moon covers the sun completely and the sky goes dark, is it safe to look with the
        naked eye. Put the glasses back on as soon as the first bright point of the sun reappears.
      </p>
      <EnFigure image={IMAGES.solarDiamondRing} caption="The diamond ring: the last flash of sunlight just before totality begins. From here on, eye protection is needed again as soon as the sun reappears." />

      <h2 id="types">Total, annular or partial?</h2>
      <p>
        In a <strong>total</strong> eclipse the moon covers the sun completely, the sky darkens like late twilight and the
        sun&apos;s faint outer atmosphere, the corona, appears. In an <strong>annular</strong> eclipse the moon is too far
        away to cover the whole sun and leaves a bright &quot;ring of fire&quot;. Both are seen only along a narrow track
        a few hundred kilometers wide; on either side of it, and far beyond, people see a <strong>partial</strong> eclipse,
        with a bite taken out of the sun. Even a 90% partial eclipse leaves the day surprisingly bright.
      </p>

      <h2 id="why-rare">Why there isn&apos;t an eclipse every month</h2>
      <p>
        The moon passes between Earth and the sun at every new moon, but its orbit is tilted about 5° to Earth&apos;s.
        {src.ref("nasaMoonFactSheet")} Most months it passes a little above or below the sun. Only when a new moon falls
        near the points where the two orbits cross does its shadow touch Earth. That happens two to five times a year,
        but the shadow&apos;s darkest part is so narrow that any one city sees a total eclipse only rarely. In New York,
        for example, the next total solar eclipse is{" "}
        {nyTotal ? `on ${mdy.format(nyTotal.peak)}` : "not until after 2100"}.
      </p>

      <h2 id="beliefs">Eclipses, Sutak and pregnancy</h2>
      <p>
        In many traditions an eclipse is a time for special practices: in Hinduism the Sutak period before an eclipse,
        in Islam the eclipse prayer. For those, follow your local panchang, temple, mosque or community; the times on
        this page are astronomical. Two common worries have no basis in science: an eclipse does not harm pregnant women
        or unborn babies, and food cooked or left out during an eclipse is not poisoned. The only real danger is to the
        eyes, from looking at the uncovered sun.{src.ref("nasaEclipseMyths")}
      </p>

      <h2 id="how">How we calculate</h2>
      <p>
        For each place we calculate the positions of the sun and moon as seen from its exact coordinates, which gives the
        start, deepest moment and end of the eclipse, how much of the sun&apos;s disk is covered, and how long totality
        lasts. Our dates and types match NASA&apos;s eclipse catalog,{src.ref("nasaSolarCatalog")} and the greatest-eclipse
        point of August 2, 2027 matches the published figures.{src.ref("eclipsewise2027")} Times assume a flat horizon;
        city data come from GeoNames.{src.ref("geonames")}
      </p>
    </Prose>
  );
}
