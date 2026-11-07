import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { getUpcomingMeteorShowers, localDateParts, METEOR_SHOWERS, tryMeteorNight, getShowerPeak, type MeteorShower } from "@moon-app/moon";
import { BreadcrumbTrail } from "@/components/Breadcrumb";
import { Byline } from "@/components/Byline";
import { EnArticleFooter } from "@/components/en/EnArticleFooter";
import { Faq } from "@/components/Faq";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { enPageSources } from "@/components/Sources";
import { EN_FAQS } from "@/lib/en/faqs";
import { enShowerName, isMajorShower, rateText, verdict } from "@/lib/en/meteor-showers";
import { EN_GROUP_NAMES, EN_HOME_PATH, EN_PAGES } from "@/lib/en/pages";
import { DEFAULT_PLACE, placeLabel, type EnPlace } from "@/lib/en/places";
import { WORLD_CITIES } from "@/lib/en/world-cities";
import { enPageOpenGraph } from "@/lib/og";
import { siteConfig } from "@/site.config";
import { MeteorExplorer } from "./MeteorExplorer";

const PAGE = EN_PAGES.meteorShowers;
const UPDATED = "2026-11-07";
const NY = DEFAULT_PLACE;
const src = enPageSources("imoCalendar2026", "imoCalendar2027", "nasaMeteors", "nasaGeminids", "geonames");
const DAY_MS = 86_400_000;

const city = (id: number) => WORLD_CITIES.find((c) => c.id === id)!;
/** Ülke tablosu: İngilizce aramaların geldiği ülkeler (ABD, Kanada, İngiltere, İrlanda, Hindistan, Avustralya, Yeni Zelanda). */
const COUNTRY_CITIES: { country: string; cities: EnPlace[] }[] = [
  { country: "United States and Canada", cities: [5128581, 4164138, 4699066, 5368361, 6167865].map(city) },
  { country: "United Kingdom and Ireland", cities: [2643743, 2650225, 2964574].map(city) },
  { country: "India", cities: [1273294, 1275339, 1275004, 1277333].map(city) },
  { country: "Australia and New Zealand", cities: [2147714, 2158177, 2063523, 2193733].map(city) },
];
const HEMI_CITIES = [5128581, 2643743, 1273294, 2147714].map(city);
const LONDON = city(2643743);
const SYDNEY = city(2147714);
const shower = (code: string) => METEOR_SHOWERS.find((s) => s.code === code)!;

/** Başlıktaki yıl kendiliğinden ilerler (Ekimden itibaren gelecek yıl da). */
async function titleYears() {
  "use cache";
  cacheLife("days");
  const p = localDateParts(new Date(), NY.timeZone);
  return p.month >= 10 ? `${p.year}-${p.year + 1}` : `${p.year}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const years = await titleYears();
  return {
    title: `Meteor Shower Tonight: Best Time, Where to Look, Calendar ${years} | ${siteConfig.name}`,
    description:
      "Is there a meteor shower tonight? The best time to watch from your city, how many meteors an hour to expect, which direction to look, how the moon interferes, and every meteor shower of the year.",
    alternates: { canonical: PAGE.path },
    openGraph: enPageOpenGraph(PAGE),
  };
}

export default function MeteorShowersPage() {
  return (
    <>
      <Hero />
      <QuickLinks
        lang="en"
        links={[
          { href: "#tonight", label: "Tonight" },
          { href: "#next", label: "Next shower" },
          { href: "#calendar", label: "Calendar" },
          { href: "#by-country", label: "US, UK, India, Australia" },
          { href: "#where-to-look", label: "Where to look" },
          { href: "#faq", label: "FAQ" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <Explorer />
        <CountryTable />
        <HemisphereTable />
        <div className="mx-auto max-w-3xl">
          <Explainer />
          <div id="faq" className="scroll-mt-32">
            <Faq items={EN_FAQS.meteorShowers} lang="en" />
          </div>
          <EnArticleFooter page={PAGE} headline="Meteor Shower Tonight: Best Time, Where to Look and Calendar" updated={UPDATED} src={src} />
        </div>
      </main>
    </>
  );
}

function Hero() {
  return (
    <section className="starfield relative overflow-hidden bg-[#05070d] text-white">
      <HeroStreaks />
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 pt-6 md:pb-16">
        <BreadcrumbTrail
          tone="dark"
          label="Breadcrumb"
          items={[{ name: "Home", path: EN_HOME_PATH }, { name: EN_GROUP_NAMES[PAGE.group] }, { name: PAGE.title, path: PAGE.path }]}
        />
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Meteor showers</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">Is There a Meteor Shower Tonight?</h1>
        <p className="mt-5 max-w-2xl text-lg text-zinc-200">
          The best time to watch from your city, how many shooting stars an hour to expect from your sky, which way to
          look, how much the moon gets in the way, and every meteor shower of the year.
        </p>
        <Byline updated={UPDATED} lang="en" />
      </div>
    </section>
  );
}

/** Giriş alanında birkaç meteor izi (süs; ekran okuyucudan gizli). */
function HeroStreaks() {
  const streaks = [
    { x: 62, y: 18, l: 16, o: 0.8 },
    { x: 78, y: 34, l: 10, o: 0.5 },
    { x: 70, y: 58, l: 22, o: 0.7 },
    { x: 88, y: 12, l: 8, o: 0.4 },
  ];
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="streak-en" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
      </defs>
      {streaks.map((s, i) => (
        <line key={i} x1={s.x} y1={s.y} x2={s.x + s.l} y2={s.y + s.l * 0.45} stroke="url(#streak-en)" strokeOpacity={s.o} strokeWidth="0.25" />
      ))}
    </svg>
  );
}

/** Araç: sunucu (ve Google) New York için hazır HTML üretir; saatte bir yenilenir. */
async function Explorer() {
  "use cache";
  cacheLife("hours");
  return <MeteorExplorer initialNow={new Date().toISOString()} />;
}

/** Sıradaki büyük yağmur (dün geceden sonra doruğa ulaşan, saatte 15+). */
function nextMajor(now: Date) {
  return getUpcomingMeteorShowers(new Date(now.getTime() - DAY_MS / 2), 12).find((u) => isMajorShower(u.shower))!;
}

/**
 * "Can I see it from India / the UK / Australia / Texas?" aramalarının cevabı: sıradaki büyük yağmurun bu ülkelerdeki
 * şehirlerden en iyi saati, her şehrin kendi saatiyle. Seçiciden bağımsız, sayfada her zaman durur. Günde bir.
 */
async function CountryTable() {
  "use cache";
  cacheLife("days");

  const { shower: s, peak } = nextMajor(new Date());
  const name = enShowerName(s);
  return (
    <section aria-labelledby="by-country" className="mt-14">
      <h2 id="by-country" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Can you see the {name} from the US, the UK, India or Australia?
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        The best hours on the peak night of the {name} in each city&apos;s own local time, with the meteors an hour you can
        expect from the suburbs and from a dark site outside town.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5 font-medium">City</th>
              <th className="px-4 py-2.5 font-medium">Best time (local)</th>
              <th className="px-4 py-2.5 font-medium">Per hour: suburbs / dark site</th>
              <th className="px-4 py-2.5 font-medium">Rating</th>
            </tr>
          </thead>
          {COUNTRY_CITIES.map((g) => (
            <tbody key={g.country} className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr className="bg-zinc-50/70 dark:bg-zinc-950/60">
                <th colSpan={4} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {g.country}
                </th>
              </tr>
              {g.cities.map((c) => {
                const n = tryMeteorNight(s, peak, c);
                const b = n?.best ?? null;
                const v = verdict(b ? b.rate.kenar : null);
                const day = new Intl.DateTimeFormat("en-US", { timeZone: c.timeZone, month: "short", day: "numeric" });
                const t = new Intl.DateTimeFormat("en-US", { timeZone: c.timeZone, hour: "numeric", minute: "2-digit" });
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-2">
                      <a href={`${PAGE.path}?place=${c.id}`} rel="nofollow" className="font-medium hover:underline">
                        {placeLabel(c)}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 tabular-nums">{b ? `${day.format(b.start)}, ${t.format(b.start)} – ${t.format(b.end)}` : "–"}</td>
                    <td className="px-4 py-2 tabular-nums">{b ? `${rateText(b.rate.kenar)} / ${rateText(b.rate.karanlik)}` : "–"}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${v.tone}`}>{v.text}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        Tap a city to open its night chart and calendar. Every city follows the same rule: the higher the radiant climbs
        and the darker your sky, the more you see.
      </p>
    </section>
  );
}

/**
 * Önümüzdeki 12 yağmurun dört şehirden (New York, Londra, Delhi, Sidney) karanlık yerde saatte kaç meteor verdiği:
 * hangi yağmurun hangi yarımkürenin olduğunu bir bakışta gösterir. Günde bir.
 */
async function HemisphereTable() {
  "use cache";
  cacheLife("days");

  const list = getUpcomingMeteorShowers(new Date(Date.now() - DAY_MS / 2), 12);
  const md = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });
  return (
    <section aria-labelledby="hemisphere" className="mt-14">
      <h2 id="hemisphere" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Which showers can you see from where you live?
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Meteors an hour from a dark site at the best time of each peak night, for one city in four of the countries that
        search for meteor showers most. Some showers belong to the north, some to the south; the moon changes the picture
        from year to year.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-3 py-2.5 font-medium">Shower</th>
              {HEMI_CITIES.map((c) => (
                <th key={c.id} className="px-3 py-2.5 font-medium">
                  {c.name === "New York City" ? "New York" : c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {list.map(({ shower: s, peak }) => (
              <tr key={s.code}>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className="font-medium">{enShowerName(s)}</span>
                  <span className="block text-xs text-zinc-500">{md.format(peak)}</span>
                </td>
                {HEMI_CITIES.map((c) => {
                  const b = tryMeteorNight(s, peak, c)?.best ?? null;
                  const v = verdict(b ? b.rate.kenar : null);
                  return (
                    <td key={c.id} className="px-3 py-2">
                      <span className={`inline-block min-w-12 rounded-full px-2 py-0.5 text-center text-xs font-semibold tabular-nums ${v.tone}`}>
                        {b ? rateText(b.rate.karanlik) : "–"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-zinc-500">Colors follow the same rating as the calendar above (based on the suburbs number).</p>
    </section>
  );
}

/** Kendi çizimimiz: Dünya'nın yörüngesi, kuyruklu yıldızın toz şeridini her yıl aynı noktada keser. */
function StreamDiagram() {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#05070d] p-4 text-white">
      <svg viewBox="0 0 640 320" className="w-full" role="img" aria-label="Earth's orbit crossing a comet's dust trail">
        <circle cx="300" cy="150" r="16" fill="#fcd34d" />
        <text x="300" y="185" textAnchor="middle" className="fill-amber-200 text-[13px]">
          Sun
        </text>
        <ellipse cx="300" cy="150" rx="150" ry="110" fill="none" stroke="#60a5fa" strokeOpacity="0.6" strokeDasharray="4 5" />
        <text x="210" y="62" textAnchor="middle" className="fill-sky-300 text-[13px]">
          Earth&apos;s orbit
        </text>
        <ellipse cx="350" cy="150" rx="270" ry="70" transform="rotate(-24 350 150)" fill="none" stroke="#c7d2fe" strokeOpacity="0.35" strokeWidth="14" />
        <ellipse cx="350" cy="150" rx="270" ry="70" transform="rotate(-24 350 150)" fill="none" stroke="#e0e7ff" strokeWidth="1.2" />
        <text x="636" y="22" textAnchor="end" className="fill-indigo-200 text-[13px]">
          The comet&apos;s dust trail
        </text>
        <circle cx="430" cy="78" r="6" fill="#e0e7ff" />
        <path d="M430 78 l40 -14" stroke="#e0e7ff" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
        <circle cx="160" cy="203" r="9" fill="#3b82f6" />
        <circle cx="160" cy="203" r="20" fill="none" stroke="#fde68a" strokeWidth="1.5" />
        <text x="160" y="310" textAnchor="middle" className="fill-amber-100 text-[13px]">
          Earth crosses the trail: a meteor shower
        </text>
      </svg>
      <figcaption className="mt-2 text-sm text-zinc-400">
        Earth crosses the dust trail at the same point of its orbit every year, so each shower comes back on the same
        dates. Not to scale.
      </figcaption>
    </figure>
  );
}

/** Bilgi metni. Yarımküre karşılaştırması derlemede hesaplanır; metin elle yazılmıştır. Günde bir. */
async function Explainer() {
  "use cache";
  cacheLife("days");

  const year = new Date().getUTCFullYear();
  const peakRate = (s: MeteorShower, c: EnPlace, kind: "kenar" | "karanlik" = "karanlik") => {
    const p = getShowerPeak(s, year);
    return tryMeteorNight(s, p, c)?.best?.rate[kind] ?? 0;
  };
  const perLondon = Math.round(peakRate(shower("PER"), LONDON));
  const perSydney = Math.round(peakRate(shower("PER"), SYDNEY));
  const etaLondon = Math.round(peakRate(shower("ETA"), LONDON));
  const etaSydney = Math.round(peakRate(shower("ETA"), SYDNEY));
  const gem = shower("GEM");
  const gemSuburbs = Math.round(peakRate(gem, NY, "kenar"));

  return (
    <Prose>
      <h2 id="what">What is a meteor shower?</h2>
      <p>
        A meteor shower happens when Earth passes through the trail of dust a comet has left behind on its orbit.
        {src.ref("nasaMeteors")} The grains, called meteoroids while they are still in space, hit the upper atmosphere at
        tens of kilometers a second and burn up, and the glowing streak is the meteor, or shooting star. Almost all of the
        material vaporizes; the rare piece that survives and lands is a meteorite. Every Perseid, for example, is a tiny
        fragment of comet Swift-Tuttle, which passes the sun every 135 years.{src.ref("nasaMeteors")} A few showers come
        from asteroids instead: the Geminids from 3200 Phaethon.{src.ref("nasaGeminids")}
      </p>
      <StreamDiagram />

      <h2 id="where-to-look">Where to look</h2>
      <p>
        All the meteors of one shower seem to fly out of one point in the sky, the radiant, which gives the shower its
        name: the Perseids come from Perseus, the Geminids from Gemini. That doesn&apos;t mean you should stare at it.
        Meteors appear all over the sky, and the ones far from the radiant have the longest trails. Look at the darkest
        part of the sky, about halfway up, and take in as much of it as you can. NASA&apos;s advice for the Geminids works
        for every shower: get well away from city and street lights, lie flat on your back, and give your eyes about 30
        minutes to adapt to the dark.{src.ref("nasaGeminids")} Don&apos;t look at your phone in between: its light resets
        your night vision.
      </p>

      <h2 id="after-midnight">Why the best time is usually after midnight</h2>
      <p>
        Two things work together. After midnight you are on the side of Earth that faces forward as the planet moves along
        its orbit, so it runs into more of the dust, the way a car&apos;s windshield catches more rain than the rear
        window. And for most showers the radiant climbs higher during the night, so fewer meteors are hidden below the
        horizon. That&apos;s why our night charts usually peak in the hours before dawn. The Geminids are an exception:
        their radiant is already well up by mid-evening, so they are worth watching from about 9 or 10 p.m.
        {src.ref("nasaGeminids")}
      </p>

      <h2 id="zhr">Why you see fewer meteors than the headlines say</h2>
      <p>
        News stories quote the zenithal hourly rate (ZHR): the number one observer would see in an hour with the radiant
        directly overhead and a perfect sky showing stars down to magnitude 6.5.{src.ref("imoCalendar2026")} Real nights
        are never that good. The radiant is lower, there is haze or moonlight, and most of us live under skies that hide
        the fainter stars. The Geminids&apos; ZHR is {gem.zhr}, but in {year} the best hour from a suburb of New York brings about {gemSuburbs}. That&apos;s
        why we give two numbers, for the suburbs and for a dark site, and an animation of what each sky looks like.
      </p>

      <h2 id="southern">Meteor showers from the Southern Hemisphere</h2>
      <p>
        A shower&apos;s radiant sits at a fixed point among the stars, so how high it gets depends on your latitude. The
        Perseids&apos; radiant is far in the northern sky: at their {year} peak a dark site near London could see about{" "}
        {perLondon} an hour, while near Sydney{" "}
        {perSydney >= 1 ? `only about ${perSydney}` : "the radiant never rises above the horizon at night, so hardly any appear"}.
        The Eta Aquariids, debris from Halley&apos;s Comet, work the other way: in {year} about {etaSydney} an hour near
        Sydney against {etaLondon} near London, because their radiant climbs high
        before dawn in the south and only just clears the horizon in Britain. The Geminids are the best shower
        for both hemispheres.
      </p>

      <h2 id="how">How we calculate</h2>
      <p>
        Peak times, radiants, speeds and rates come from the International Meteor Organization&apos;s working list of
        meteor showers.{src.ref("imoCalendar2026")} Each shower peaks when the sun reaches the same position along
        Earth&apos;s orbit every year, so we calculate the date from the sun&apos;s position; our 2026 and 2027 peak times
        agree with the IMO calendars to within 45 minutes.{src.ref("imoCalendar2027")} For your city we work through the
        night in 10-minute steps: how high the radiant is, where the moon is and how bright it is, and how dark your sky
        is, then scale the ZHR down using the IMO&apos;s formula. Away from the peak night we assume activity falls off
        steadily, halving roughly every day and a half (much faster for the Quadrantids, whose peak lasts a few hours).
        Real showers don&apos;t follow one curve, so treat all numbers as a guide. City data come from GeoNames.
        {src.ref("geonames")}
      </p>
    </Prose>
  );
}
