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
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { Explainer } from "./Explainer";

const PAGE = PAGES.bugunAy;
const PATH = PAGE.path;

export const metadata: Metadata = {
  title: `Bugün Ay Nasıl? Ayın Evresi ve Doğuş-Batış Saatleri | ${siteConfig.name}`,
  description:
    "Bugün ay hangi evrede, yüzde kaçı aydınlık, kaç günlük? 81 il için ayın doğuş ve batış saatleri ve bir sonraki dolunay tarihi.",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın: Google'a her zaman tek adres gösterilir.
  alternates: { canonical: PATH },
};

const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));

export default function TodayMoonPage({ searchParams }: PageProps<"/tr/bugun-ay">) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <Breadcrumb page={PAGE} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{PAGE.title}</h1>
      <TodayMoon />
      {/* Seçili il isteğe göre değişir. Beklerken (ve Google için) varsayılan il gösterilir. */}
      <Suspense fallback={<CityMoonTimes slug={siteConfig.defaultLocation.slug} />}>
        <SelectedCityMoonTimes searchParams={searchParams} />
      </Suspense>
      <NextPhases />
      <Explainer />
    </main>
  );
}

const location = siteConfig.defaultLocation;

function formatters() {
  const base = { timeZone: location.timeZone } as const;
  return {
    date: new Intl.DateTimeFormat(siteConfig.locale, { ...base, day: "numeric", month: "long", year: "numeric", weekday: "long" }),
    time: new Intl.DateTimeFormat(siteConfig.locale, { ...base, hour: "2-digit", minute: "2-digit" }),
    dateTime: new Intl.DateTimeFormat(siteConfig.locale, {
      ...base,
      day: "numeric",
      month: "long",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

/**
 * Ay verisi sunucuda hesaplanır ve saatlik önbelleğe alınır ("hours" profili:
 * en geç 1 saatte bir yenilenir). Böylece sayfa her gün kendiliğinden güncellenir.
 * Evre Türkiye'nin her yerinde aynıdır, sadece doğuş/batış ile değişir.
 */
async function TodayMoon() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const phase = getMoonPhase(now, location.timeZone);
  const { rise, set } = getMoonRiseSet(now, location);
  const nextFull = getNextFullMoon(now);
  const fmt = formatters();
  const percent = new Intl.NumberFormat(siteConfig.locale, { style: "percent", maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 1 });

  return (
    <>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        <time dateTime={now.toISOString()}>{fmt.date.format(now)}</time>
      </p>

      <div className="mt-6">
        <QuickFacts>
          {/* Saat, yüzde ve il adlarına gelen ekler (18:33'te / 09:00'da) değiştiği için ek kullanılmıyor. */}
          <li>
            Ayın bugünkü evresi: <strong>{phase.name}</strong> ({percent.format(phase.illumination)} aydınlık).
          </li>
          <li>
            {location.name}: ay doğuşu {rise ? fmt.time.format(rise) : "yok"}, ay batışı{" "}
            {set ? fmt.time.format(set) : "yok"}.
          </li>
          <li>Bir sonraki dolunay: {fmt.date.format(nextFull)}.</li>
        </QuickFacts>
      </div>

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

      <section className="mt-8 flex flex-col items-center gap-6 rounded-2xl bg-[#0b1020] px-6 py-10 text-white sm:flex-row sm:gap-10 sm:px-10">
        <MoonPhaseIcon
          phaseAngle={phase.phaseAngle}
          size={180}
          southern={isSouthernHemisphere(location)}
          title={`${phase.name}, yüzde ${Math.round(phase.illumination * 100)} aydınlık`}
        />
        <div className="text-center sm:text-left">
          <p className="text-sm uppercase tracking-widest text-zinc-400">Ayın evresi</p>
          <p className="mt-1 text-3xl font-semibold">{phase.name}</p>
          <p className="mt-3 text-zinc-300">
            {percent.format(phase.illumination)} aydınlık · {decimal.format(phase.ageDays)} günlük ·{" "}
            {phase.isWaxing ? "büyüyor" : "küçülüyor"}
          </p>
        </div>
      </section>
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
    <section className="mt-10" aria-labelledby="dogus-batis">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="dogus-batis" className="text-xl font-semibold">
          {city.name} için ay doğuş ve batış saatleri
        </h2>
        <CitySelect action={PATH} options={CITY_OPTIONS} selected={city.slug} />
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Fact label="Ay doğuşu" value={rise ? fmt.time.format(rise) : "Bugün ay doğmuyor"} />
        <Fact label="Ay batışı" value={set ? fmt.time.format(set) : "Bugün ay batmıyor"} />
      </dl>
    </section>
  );
}

async function NextPhases() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const fmt = formatters();

  return (
    <>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Fact label="Bir sonraki dolunay" value={fmt.dateTime.format(getNextFullMoon(now))} />
        <Fact label="Bir sonraki yeni ay" value={fmt.dateTime.format(getNextNewMoon(now))} />
      </dl>
      <p className="mt-10 text-sm text-zinc-500">
        Son güncelleme: <time dateTime={now.toISOString()}>{fmt.dateTime.format(now)}</time> (Türkiye saati)
      </p>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="mt-1 text-lg font-medium">{value}</dd>
    </div>
  );
}
