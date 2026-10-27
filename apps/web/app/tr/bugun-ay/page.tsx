import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import {
  findProvince,
  getMoonPhase,
  getMoonRiseSet,
  getNextFullMoon,
  getNextNewMoon,
  isSouthernHemisphere,
  TURKEY_PROVINCES,
} from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CitySelect } from "@/components/CitySelect";
import { JsonLd } from "@/components/JsonLd";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { Explainer } from "./Explainer";

const PAGE = PAGES.bugunAy;
const PATH = PAGE.path;
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `Bugün Ay Nasıl? Ayın Evresi ve Doğuş-Batış Saatleri | ${siteConfig.name}`,
  description:
    "Bugün ay hangi evrede, yüzde kaçı aydınlık, kaç günlük? 81 il için ayın doğuş ve batış saatleri ve bir sonraki dolunay tarihi.",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın: Google'a her zaman tek adres gösterilir.
  alternates: { canonical: PATH },
  openGraph: pageOpenGraph(PAGE),
};

const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));

export default function TodayMoonPage({ searchParams }: PageProps<"/tr/bugun-ay">) {
  return (
    <>
      <Hero />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <Summary />
        {/* Seçili il isteğe göre değişir. Beklerken (ve Google için) varsayılan il gösterilir. */}
        <Suspense fallback={<CityMoonTimes slug={siteConfig.defaultLocation.slug} />}>
          <SelectedCityMoonTimes searchParams={searchParams} />
        </Suspense>
        <NextPhases />
        <Explainer />
      </main>
    </>
  );
}

const location = siteConfig.defaultLocation;

function formatters() {
  const base = { timeZone: location.timeZone } as const;
  return {
    date: new Intl.DateTimeFormat(siteConfig.locale, {
      ...base,
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    }),
    time: new Intl.DateTimeFormat(siteConfig.locale, { ...base, hour: "2-digit", minute: "2-digit" }),
    weekday: new Intl.DateTimeFormat(siteConfig.locale, { ...base, weekday: "long" }),
    dayMonth: new Intl.DateTimeFormat(siteConfig.locale, { ...base, day: "numeric", month: "short" }),
    dateTime: new Intl.DateTimeFormat(siteConfig.locale, {
      ...base,
      day: "numeric",
      month: "long",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    }),
    percent: new Intl.NumberFormat(siteConfig.locale, { style: "percent", maximumFractionDigits: 0 }),
    decimal: new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 1 }),
  };
}

/** "28 gün 2 saat" gibi kalan süre. */
function formatCountdown(ms: number): string {
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.floor((ms % DAY_MS) / 3_600_000);
  if (days === 0) return `${hours} saat`;
  return hours === 0 ? `${days} gün` : `${days} gün ${hours} saat`;
}

/**
 * Sayfanın girişi: ayın gerçek görüntüsü, aydınlık oranı ve 7 günlük şerit.
 * Ay verisi sunucuda hesaplanır ve saatlik önbelleğe alınır ("hours" profili:
 * en geç 1 saatte bir yenilenir). Evre Türkiye'nin her yerinde aynıdır.
 */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const phase = getMoonPhase(now, location.timeZone);
  const nextFull = getNextFullMoon(now);
  const nextNew = getNextNewMoon(now);
  const fmt = formatters();
  const illumination = Math.round(phase.illumination * 100);

  const week = [-1, 0, 1, 2, 3, 4, 5].map((offset) => {
    const date = new Date(now.getTime() + offset * DAY_MS);
    const p = getMoonPhase(date, location.timeZone);
    const label = offset === -1 ? "Dün" : offset === 0 ? "Bugün" : offset === 1 ? "Yarın" : fmt.weekday.format(date);
    return { offset, date, label, phase: p };
  });

  return (
    <section className="starfield relative overflow-hidden bg-[#05070d] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 pt-6">
        <Breadcrumb page={PAGE} tone="dark" />
      </div>
      <div className="mx-auto grid w-full max-w-5xl items-center gap-6 px-4 pb-10 pt-4 md:grid-cols-[1fr_auto] md:gap-12 md:pb-14">
        <div className="order-2 md:order-1">
          <h1 className="text-lg font-medium text-zinc-300">{PAGE.title}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            <time dateTime={now.toISOString()}>{fmt.date.format(now)}</time> · Türkiye saati {fmt.time.format(now)}
          </p>

          <p className="mt-4 text-[clamp(4.5rem,16vw,9rem)] font-extralight leading-none tracking-tighter tabular-nums">
            %{illumination}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{phase.name}</p>

          <dl className="mt-6 flex flex-wrap gap-2 text-sm">
            <Chip label="Ay yaşı" value={`${fmt.decimal.format(phase.ageDays)} gün`} />
            <Chip label="Yön" value={phase.isWaxing ? "Büyüyor" : "Küçülüyor"} />
            <Chip label="Dolunaya" value={formatCountdown(nextFull.getTime() - now.getTime())} />
            <Chip label="Yeni aya" value={formatCountdown(nextNew.getTime() - now.getTime())} />
          </dl>
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <div className="w-[min(78vw,420px)]">
            <MoonPhaseIcon
              phaseAngle={phase.phaseAngle}
              size={420}
              glow
              southern={isSouthernHemisphere(location)}
              title={`Ayın şu anki görünümü: ${phase.name}, yüzde ${illumination} aydınlık`}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20">
        <ol className="mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto px-4 py-4" aria-label="7 günlük ay görünümü">
          {week.map((d) => (
            <li
              key={d.offset}
              className={`flex min-w-[6.5rem] flex-1 items-center gap-3 rounded-xl px-3 py-2 ${
                d.offset === 0 ? "bg-white/12 ring-1 ring-white/25" : "bg-white/[0.04]"
              }`}
              aria-current={d.offset === 0 ? "date" : undefined}
            >
              <span className="shrink-0">
                <MoonPhaseIcon phaseAngle={d.phase.phaseAngle} size={34} title={d.phase.name} />
              </span>
              <div className="leading-tight">
                <p className="text-xs text-zinc-400">{d.label}</p>
                <p className="text-base font-semibold tabular-nums">{fmt.percent.format(d.phase.illumination)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <p className="sr-only">
        Ay görseli: NASA Scientific Visualization Studio, evre gölgesi bu sayfada hesaplanmıştır.
      </p>
    </section>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5">
      <dt className="inline text-zinc-400">{label}: </dt>
      <dd className="inline font-medium text-white">{value}</dd>
    </div>
  );
}

async function Summary() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const phase = getMoonPhase(now, location.timeZone);
  const { rise, set } = getMoonRiseSet(now, location);
  const nextFull = getNextFullMoon(now);
  const fmt = formatters();

  return (
    <>
      <QuickFacts>
        {/* Saat, yüzde ve il adlarına gelen ekler (18:33'te / 09:00'da) değiştiği için ek kullanılmıyor. */}
        <li>
          Ayın bugünkü evresi: <strong>{phase.name}</strong> ({fmt.percent.format(phase.illumination)} aydınlık).
        </li>
        <li>
          {location.name}: ay doğuşu {rise ? fmt.time.format(rise) : "yok"}, ay batışı{" "}
          {set ? fmt.time.format(set) : "yok"}.
        </li>
        <li>Bir sonraki dolunay: {fmt.date.format(nextFull)}.</li>
      </QuickFacts>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: PAGE.title,
          url: new URL(PATH, siteConfig.url).toString(),
          inLanguage: "tr-TR",
          dateModified: now.toISOString(),
        }}
      />
    </>
  );
}

async function SelectedCityMoonTimes({ searchParams }: Pick<PageProps<"/tr/bugun-ay">, "searchParams">) {
  const { il } = await searchParams;
  const city = findProvince(typeof il === "string" ? il : undefined) ?? location;
  return <CityMoonTimes slug={city.slug} />;
}

async function CityMoonTimes({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = findProvince(slug) ?? location;
  const now = new Date();
  const { rise, set } = getMoonRiseSet(now, city);
  const fmt = formatters();

  return (
    <section className="mt-12" aria-labelledby="dogus-batis">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Doğuş ve batış</p>
          <h2 id="dogus-batis" className="mt-1 text-2xl font-semibold tracking-tight">
            {city.name} için bugün
          </h2>
        </div>
        <CitySelect action={PATH} options={CITY_OPTIONS} selected={city.slug} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
        <BigFact icon="↑" label="Ay doğuşu" value={rise ? fmt.time.format(rise) : "Doğmuyor"} />
        <BigFact icon="↓" label="Ay batışı" value={set ? fmt.time.format(set) : "Batmıyor"} />
      </dl>
    </section>
  );
}

async function NextPhases() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const fmt = formatters();
  const full = getNextFullMoon(now);
  const fresh = getNextNewMoon(now);

  return (
    <section className="mt-12" aria-labelledby="siradaki-evreler">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Sıradaki</p>
      <h2 id="siradaki-evreler" className="mt-1 text-2xl font-semibold tracking-tight">
        Dolunay ve yeni ay
      </h2>
      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <PhaseFact angle={180} label="Bir sonraki dolunay" date={full} fmt={fmt} />
        <PhaseFact angle={0} label="Bir sonraki yeni ay" date={fresh} fmt={fmt} />
      </dl>
      <p className="mt-8 text-sm text-zinc-500">
        Son güncelleme: <time dateTime={now.toISOString()}>{fmt.dateTime.format(now)}</time> (Türkiye saati). Ay
        görseli: NASA Scientific Visualization Studio.
      </p>
    </section>
  );
}

function BigFact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <dt className="flex items-center gap-2 text-sm text-zinc-500">
        <span aria-hidden="true" className="text-base">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-2 text-3xl font-light tracking-tight tabular-nums sm:text-4xl">{value}</dd>
    </div>
  );
}

function PhaseFact({
  angle,
  label,
  date,
  fmt,
}: {
  angle: number;
  label: string;
  date: Date;
  fmt: ReturnType<typeof formatters>;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <span className="shrink-0 rounded-full bg-[#05070d] p-1.5">
        <MoonPhaseIcon phaseAngle={angle} size={48} title={label} />
      </span>
      <div>
        <dt className="text-sm text-zinc-500">{label}</dt>
        <dd className="mt-1 text-lg font-semibold">{fmt.date.format(date)}</dd>
        <dd className="text-sm text-zinc-600 dark:text-zinc-400">Saat {fmt.time.format(date)}</dd>
      </div>
    </div>
  );
}
