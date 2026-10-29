import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import {
  findProvince,
  getLunation,
  getMoonPhase,
  getMoonRiseSet,
  getMoonSign,
  getMoonSignIngresses,
  getNextFullMoon,
  getVoidOfCoursePeriods,
  TURKEY_PROVINCES,
  type PhaseKey,
} from "@moon-app/moon";
import { CitySelect } from "@/components/CitySelect";
import { JsonLd } from "@/components/JsonLd";
import { MobileCollapse } from "@/components/MobileCollapse";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { PageVisual } from "@/components/PageVisual";
import { SiteSearch } from "@/components/SiteSearch";
import { toHijri } from "@/lib/hijri";
import { pageOpenGraph } from "@/lib/og";
import { HOME_PATH, PAGES, pagesByGroup, SEARCH_ITEMS } from "@/lib/pages";
import { getUpcomingSkyEvents, type SkyEventKind } from "@/lib/sky-events";
import { ZODIAC_SYMBOLS } from "@/lib/zodiac";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: `${siteConfig.name}: Ay Evreleri, Ay Takvimi ve Doğuş-Batış Saatleri`,
  description:
    "Ayın bugünkü evresi, bu ayın dolunay ve yeni ay tarihleri, 81 il için ay doğuş-batış saatleri ve ay evrelerinin anlatımı. Hesaplar Türkiye saatine göre.",
  alternates: { canonical: HOME_PATH },
  openGraph: pageOpenGraph({
    path: HOME_PATH,
    title: "Gökyüzündeki ay, bugün ve her gün",
    description:
      "Ayın evresi, doğuş ve batış saatleri, dolunay tarihleri. Türkiye saatine göre, astronomik hesaplarla.",
  }),
};

const PHASE_ANGLE: Record<PhaseKey, number> = {
  "new-moon": 0,
  "waxing-crescent": 45,
  "first-quarter": 90,
  "waxing-gibbous": 135,
  "full-moon": 180,
  "waning-gibbous": 225,
  "last-quarter": 270,
  "waning-crescent": 315,
};

const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;
const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));
export default function HomePage({ searchParams }: PageProps<"/tr">) {
  return (
    <>
      <Hero />
      <main className="mx-auto w-full max-w-5xl px-4">
        {/* İl seçimi (?il=...) aynı sayfada değişir; beklerken varsayılan il gösterilir. */}
        <Suspense fallback={<TodaySky slug={siteConfig.defaultLocation.slug} />}>
          <SelectedTodaySky searchParams={searchParams} />
        </Suspense>
        <LunationTimeline />
        <UpcomingEvents />
        <Explore />
        <About />
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          // Google arama sonuçlarındaki site adı için: kök adres, ad ve Türkçe açıklayıcı ikinci ad.
          name: siteConfig.name,
          alternateName: `${siteConfig.name} ${siteConfig.tagline}`,
          url: new URL("/", siteConfig.url).toString(),
          description:
            "Ay evreleri, ay takvimi, 81 il için ay doğuş-batış saatleri, dolunay ve tutulma tarihleri, Hicri takvim. Türkiye saatine göre astronomik hesaplar.",
          inLanguage: "tr-TR",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          // Google'ın arama sonuçlarında ve bilgi panelinde göstereceği logo.
          name: siteConfig.name,
          url: new URL("/", siteConfig.url).toString(),
          logo: new URL("/logo.png", siteConfig.url).toString(),
          email: siteConfig.contactEmail,
        }}
      />
    </>
  );
}

/** Giriş: bu geceki ay. Saatte bir yenilenir. */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const phase = getMoonPhase(now, timeZone);
  const illumination = Math.round(phase.illumination * 100);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", weekday: "long" });

  return (
    <section className="starfield relative flex min-h-[640px] flex-col justify-end overflow-hidden bg-[#05070d] text-white md:min-h-[min(88vh,860px)]">
      {/* Dev ay: yalnızca üst yayı görünür, evre gölgesi o anki evreye göre. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[34%] w-[max(900px,125vw)] -translate-x-1/2 md:top-[24%] md:w-[min(125vw,1900px)]"
      >
        <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={1600} title="" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#05070d] via-[#05070d]/70 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 md:pb-20">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Ay rehberi</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl md:text-[5.25rem]">
          Gökyüzündeki ay, bugün ve her gün
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-200 md:text-xl">
          Ayın evresi, doğuş ve batış saatleri, dolunay tarihleri. Hepsi Türkiye saatine göre, astronomik hesaplarla.
        </p>

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-start">
          <Link
            href={PAGES.bugunAy.path}
            className="group flex max-w-md flex-1 items-center gap-4 rounded-2xl border border-white/15 bg-black/40 p-4 backdrop-blur-sm transition hover:border-white/30 hover:bg-black/55"
          >
            <span className="shrink-0">
              <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={56} title={phase.name} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs uppercase tracking-wider text-zinc-400">
                Bu gece · <time dateTime={now.toISOString()}>{date.format(now)}</time>
              </span>
              <span className="mt-0.5 block text-lg font-semibold">
                {phase.name} <span className="font-light text-zinc-300">· %{illumination}</span>
              </span>
              <span className="text-sm text-indigo-300">Bugünün ayrıntıları</span>
            </span>
            <span
              aria-hidden="true"
              className="text-xl text-zinc-400 transition group-hover:translate-x-1 group-hover:text-white"
            >
              →
            </span>
          </Link>
          <SiteSearch items={SEARCH_ITEMS} />
        </div>
      </div>
    </section>
  );
}

async function SelectedTodaySky({ searchParams }: Pick<PageProps<"/tr">, "searchParams">) {
  const { il } = await searchParams;
  const city = findProvince(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
  return <TodaySky slug={city.slug} />;
}

/** "Bugün gökyüzünde" paneli: seçili il için ayın bugünkü durumu tek bakışta. Saatte bir yenilenir. */
async function TodaySky({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = findProvince(slug) ?? siteConfig.defaultLocation;
  const now = new Date();
  const phase = getMoonPhase(now, timeZone);
  const { rise, set } = getMoonRiseSet(now, city);
  const sign = getMoonSign(now);
  const [nextIngress] = getMoonSignIngresses(now, 1);
  const voc = getVoidOfCoursePeriods(new Date(now.getTime() - 3 * DAY_MS), 4).find((v) => v.end > now)!;
  const vocActive = voc.start <= now;
  const nextFull = getNextFullMoon(now);
  const hijri = toHijri(now, timeZone);
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const dayTime = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" });
  const daysToFull = Math.ceil((nextFull.getTime() - now.getTime()) / DAY_MS);

  return (
    <section aria-labelledby="bugun" className="pt-14 sm:pt-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Bugün gökyüzünde</p>
          <h2 id="bugun" className="mt-1 text-3xl font-semibold tracking-tight">
            {city.name} için ay
          </h2>
        </div>
        <CitySelect action={HOME_PATH} options={CITY_OPTIONS} selected={city.slug} />
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SkyTile
          href={PAGES.bugunAy.path}
          label="Ayın evresi"
          icon={<MoonPhaseIcon phaseAngle={phase.phaseAngle} size={40} title="" />}
        >
          {phase.name}
          <Sub>%{Math.round(phase.illumination * 100)} aydınlık</Sub>
        </SkyTile>
        <SkyTile href={`${PAGES.bugunAy.path}?il=${city.slug}`} label="Doğuş · Batış" icon={<Arrows />}>
          <span className="tabular-nums">
            {rise ? time.format(rise) : "–"} · {set ? time.format(set) : "–"}
          </span>
          <Sub>{rise && set ? "Türkiye saati" : "Bugün ay doğmuyor ya da batmıyor"}</Sub>
        </SkyTile>
        <SkyTile
          href={PAGES.ayHangiBurcta.path}
          label="Ayın burcu"
          icon={<span className="text-3xl text-amber-300">{ZODIAC_SYMBOLS[sign.index]}</span>}
        >
          {sign.name}
          <Sub>
            {nextIngress.sign.name}: {dayTime.format(nextIngress.date)}
          </Sub>
        </SkyTile>
        <SkyTile href={PAGES.aybosluk.path} label="Ay boşlukta mı?" icon={<Dot active={vocActive} />}>
          {vocActive ? "Evet" : "Hayır"}
          <Sub>{vocActive ? `Bitiş: ${dayTime.format(voc.end)}` : `Sonraki: ${dayTime.format(voc.start)}`}</Sub>
        </SkyTile>
        <SkyTile
          href={PAGES.dolunay.path}
          label="Sonraki dolunay"
          icon={<MoonPhaseIcon phaseAngle={180} size={40} title="" />}
        >
          {date.format(nextFull)}
          <Sub>{daysToFull} gün sonra</Sub>
        </SkyTile>
        <SkyTile
          href={PAGES.hicriTakvim.path}
          label="Hicri tarih"
          icon={<MoonPhaseIcon phaseAngle={30} size={40} title="" />}
        >
          {hijri.day} {hijri.monthName}
          <Sub>{hijri.year} · yaklaşık</Sub>
        </SkyTile>
      </ul>
    </section>
  );
}

function SkyTile({
  href,
  label,
  icon,
  children,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#05070d]">{icon}</span>
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-wider text-zinc-500">{label}</span>
          <span className="mt-0.5 block text-lg font-semibold leading-tight">{children}</span>
        </span>
      </Link>
    </li>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return <span className="mt-0.5 block text-sm font-normal text-zinc-500">{children}</span>;
}

function Arrows() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e4e4e7" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 19V5M7 5L3.5 8.5M7 5l3.5 3.5M17 5v14M17 19l-3.5-3.5M17 19l3.5-3.5" />
    </svg>
  );
}

function Dot({ active }: { active: boolean }) {
  return (
    <span className={`h-4 w-4 rounded-full ${active ? "bg-amber-400 shadow-[0_0_12px_#fbbf24]" : "bg-emerald-400"}`} />
  );
}

const RED_FILTER = "grayscale(1) sepia(1) saturate(3.5) hue-rotate(-28deg) brightness(0.55) contrast(1.1)";

const EVENT_STYLE: Record<SkyEventKind, { icon: ReactNode; tone: string }> = {
  supermoon: { icon: <MoonPhaseIcon phaseAngle={180} size={44} glow title="" />, tone: "text-indigo-300" },
  "lunar-eclipse": { icon: <MoonPhaseIcon phaseAngle={200} size={40} title="" />, tone: "text-zinc-300" },
  "blood-moon": {
    icon: (
      <span style={{ filter: RED_FILTER }}>
        <MoonPhaseIcon phaseAngle={180} size={40} title="" />
      </span>
    ),
    tone: "text-red-300",
  },
  "solar-eclipse": {
    icon: <span className="h-9 w-9 rounded-full bg-amber-300 shadow-[inset_-12px_-4px_0_#05070d]" />,
    tone: "text-amber-300",
  },
  "blue-moon": { icon: <MoonPhaseIcon phaseAngle={180} size={40} title="" />, tone: "text-sky-300" },
  eyyam: { icon: <MoonPhaseIcon phaseAngle={170} size={40} title="" />, tone: "text-emerald-300" },
};

/** Önümüzdeki üç yılın öne çıkan gökyüzü olayları. Saatte bir yenilenir. */
async function UpcomingEvents() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const events = getUpcomingSkyEvents(now, siteConfig.defaultLocation).slice(0, 8);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });

  return (
    <section aria-labelledby="olaylar" className="border-t border-zinc-200 py-14 dark:border-zinc-800 sm:py-20">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Takviminize not edin</p>
      <h2 id="olaylar" className="mt-1 text-3xl font-semibold tracking-tight">
        Yaklaşan gökyüzü olayları
      </h2>
      <ol className="mt-8 space-y-3">
        {events.map((e) => {
          const days = Math.ceil((e.date.getTime() - now.getTime()) / DAY_MS);
          return (
            <li key={`${e.kind}-${e.date.toISOString()}`}>
              <Link
                href={e.href}
                className="group flex items-center gap-4 rounded-2xl bg-[#05070d] p-4 text-white transition hover:bg-[#0d111c] sm:gap-6 sm:p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center">{EVENT_STYLE[e.kind].icon}</span>
                <span className="w-28 shrink-0 sm:w-44">
                  <time dateTime={e.date.toISOString()} className="block font-semibold">
                    {date.format(e.date)}
                  </time>
                  <span className="text-sm text-zinc-400">{days} gün sonra</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block font-semibold ${EVENT_STYLE[e.kind].tone}`}>{e.title}</span>
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
    </section>
  );
}

/** Bu ayın döngüsü: yeni aydan bir sonraki yeni aya, bugünün yeri işaretli. */
async function LunationTimeline() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const { start, end, phases } = getLunation(now);
  const progress = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
  const points = [{ key: "new-moon" as PhaseKey, name: "Yeni Ay", date: start }, ...phases];
  const day = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "short" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

  return (
    <section aria-labelledby="dongu" className="py-14 sm:py-20">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Bu ayın döngüsü</p>
      <h2 id="dongu" className="mt-1 text-3xl font-semibold tracking-tight">
        Yeni aydan yeni aya
      </h2>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Ay, {day.format(start)} yeni ayından bu yana döngünün yüzde {Math.round(progress * 100)} kadarını tamamladı. Ana
        evrelerin tarihleri Türkiye saatiyle:
      </p>

      <div className="mt-10">
        <div className="relative h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-indigo-500"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-500 shadow"
            style={{ left: `${progress * 100}%` }}
          >
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-500 px-2 py-0.5 text-xs font-semibold text-white">
              Bugün
            </span>
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-5 gap-1 sm:gap-4">
          {points.map((p) => {
            const past = p.date.getTime() < now.getTime();
            return (
              <li key={p.date.toISOString()} className="flex flex-col items-center text-center">
                <span className="rounded-full bg-[#05070d] p-1 sm:p-1.5">
                  <MoonPhaseIcon phaseAngle={PHASE_ANGLE[p.key]} size={52} title={p.name} />
                </span>
                <span className={`mt-2 text-xs font-semibold leading-tight sm:text-sm ${past ? "text-zinc-400" : ""}`}>
                  {p.name}
                </span>
                <time dateTime={p.date.toISOString()} className="text-xs text-zinc-500 sm:text-sm">
                  {day.format(p.date)}
                  <span className="hidden sm:inline"> · {time.format(p.date)}</span>
                </time>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** Telefonda "Bütün sayfalar"da her bölümün ilk gösterilen kart sayısı. */
const MOBILE_CARDS = 2;

function Explore() {
  const groups = pagesByGroup().filter((g) => g.group !== "kurumsal");
  return (
    <section aria-labelledby="kesfet" className="border-t border-zinc-200 py-14 dark:border-zinc-800 sm:py-20">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Keşfet</p>
      <h2 id="kesfet" className="mt-1 text-3xl font-semibold tracking-tight">
        Bütün sayfalar
      </h2>
      {groups.map((g) => (
        <div key={g.group} className="mt-10">
          <h3 className="text-xl font-semibold">{g.name}</h3>
          <MobileCollapse hiddenCount={g.pages.length - MOBILE_CARDS} noun="sayfa" variant="cards" className="mt-4">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {g.pages.map((page, i) => (
              <li key={page.path} data-extra={i >= MOBILE_CARDS || undefined}>
                <Link
                  href={page.path}
                  className="group block h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <PageVisual page={page} />
                  <div className="p-4">
                    <p className="font-semibold group-hover:underline">{page.title}</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{page.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          </MobileCollapse>
        </div>
      ))}
    </section>
  );
}

function About() {
  return (
    <section aria-labelledby="hakkinda" className="border-t border-zinc-200 py-14 dark:border-zinc-800 sm:py-20">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Nasıl hesaplıyoruz?</p>
          <h2 id="hakkinda" className="mt-1 text-2xl font-semibold tracking-tight">
            Tahmin değil, hesap
          </h2>
        </div>
        <div className="grid gap-6 text-zinc-700 dark:text-zinc-300 sm:grid-cols-3 md:col-span-2">
          <Fact title="Astronomik model">
            Ayın ve Güneş&apos;in konumu yüksek hassasiyetli modellerle hesaplanır, NASA tablolarıyla karşılaştırılır.
          </Fact>
          <Fact title="Türkiye saati">Bütün tarih ve saatler Türkiye saatiyle (UTC+3) verilir.</Fact>
          <Fact title="81 il">Doğuş ve batış saatleri her il merkezi için ayrı ayrı hesaplanır.</Fact>
        </div>
      </div>
    </section>
  );
}

function Fact({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-zinc-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm leading-relaxed">{children}</p>
    </div>
  );
}
