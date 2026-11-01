import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  findProvince,
  getMoonAltitude,
  getMoonDistanceKm,
  getUpcomingLunarEclipses,
  TURKEY_PROVINCES,
  type LunarEclipse,
  type Province,
} from "@moon-app/moon";
import { Faq } from "@/components/Faq";
import { MobileCollapse } from "@/components/MobileCollapse";
import { FAQS } from "@/lib/faqs";
import { AddToCalendar } from "@/components/AddToCalendar";
import { CitySelect } from "@/components/CitySelect";
import { icsTime } from "@/lib/ics";
import { Breadcrumb } from "@/components/Breadcrumb";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { AnswerBox, DataTable, FactTable } from "@/components/InfoTables";
import { Byline } from "@/components/Byline";
import { pageSources } from "@/components/Sources";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { siteConfig } from "@/site.config";
import { NasaFigure } from "@/components/NasaFigure";
import { IMAGES } from "@/lib/images";

const PAGE = PAGES.kanliAy;
const UPDATED = "2026-11-01";
const FROM = new Date(Date.UTC(2025, 0, 1));
const UNTIL_YEAR = 2037;
const timeZone = siteConfig.defaultLocation.timeZone;
const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));
/** Telefonda listede ilk açık duran öğe sayısı (sıradakinden başlayarak). */
const MOBILE_ITEMS = 3;
const MINUTE = 60_000;
const ISTANBUL = siteConfig.defaultLocation;
const src = pageSources("nasaLunarCatalog", "nasaEclipseTypes", "nasaDanjon");
const KIND_TR: Record<LunarEclipse["kind"], string> = { total: "tam", partial: "parçalı", penumbral: "yarı gölge" };
/** Yarı süresi bundan kısa yarı gölge tutulması gölgenin ucundan geçer; gözle fark edilmez (ör. 18 Temmuz 2027). */
const FAINT_PENUMBRAL_MINUTES = 30;

export const metadata: Metadata = {
  title: `Kanlı Ay Ne Zaman? Bir Sonraki Kanlı Ay ve Türkiye'den Görünüşü | ${siteConfig.name}`,
  description:
    "Bir sonraki kanlı ay (tam ay tutulması) ne zaman ve Türkiye'den görülecek mi? 2025-2037 kanlı ayları, kızıllığın süresi, ayın neden kırmızıya döndüğü ve Anadolu'daki tutulma gelenekleri.",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

interface BloodMoon {
  eclipse: LunarEclipse;
  start: Date;
  end: Date;
  minutes: number;
  /** Kızıllık süresinin ne kadarında ayın seçilen ilde ufkun üzerinde olduğu (0-1). */
  visibleShare: number;
  km: number;
}

/** Ayın verilen aralığın ne kadarında (0-1) ilde ufkun üzerinde olduğu; 2 dakikalık adımlarla. */
function shareAboveHorizon(start: Date, end: Date, location: Province): number {
  let up = 0;
  let n = 0;
  for (let t = start.getTime(); t <= end.getTime(); t += 2 * MINUTE) {
    n++;
    if (getMoonAltitude(new Date(t), location) > 0) up++;
  }
  return n ? up / n : 0;
}

function bloodMoons(location: Province): BloodMoon[] {
  return getUpcomingLunarEclipses(FROM, 40)
    .filter((e) => e.kind === "total" && e.peak.getUTCFullYear() <= UNTIL_YEAR)
    .map((eclipse) => {
      const sd = eclipse.semiDurationMinutes.total * MINUTE;
      const start = new Date(eclipse.peak.getTime() - sd);
      const end = new Date(eclipse.peak.getTime() + sd);
      return {
        eclipse,
        start,
        end,
        minutes: Math.round(2 * eclipse.semiDurationMinutes.total),
        visibleShare: shareAboveHorizon(start, end, location),
        km: getMoonDistanceKm(eclipse.peak),
      };
    });
}

/** "1 sa 11 dk" / "38 dk" */
function formatDuration(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  return h ? `${h} sa ${m % 60} dk` : `${m} dk`;
}

function yearOf(d: Date): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(d));
}

/** Tutulan ayın kızıl görünümü: gerçek ay görseli, renk filtresiyle. */
function RedMoon({ size }: { size: number }) {
  return (
    <div
      className="rounded-full"
      style={{
        boxShadow: "0 0 80px 10px rgba(180, 40, 20, 0.35)",
        filter: "grayscale(1) sepia(1) saturate(3.5) hue-rotate(-28deg) brightness(0.55) contrast(1.1)",
      }}
    >
      <MoonPhaseIcon phaseAngle={180} size={size} title="Tam ay tutulması sırasında kızıl ay" />
    </div>
  );
}

function cityOf(il: string | string[] | undefined): Province {
  return findProvince(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
}

function verdictOf(share: number) {
  return share > 0.97 ? "tamamı görülür" : share > 0 ? "bir kısmı görülür" : "görülmez";
}

export default function BloodMoonPage({ searchParams }: PageProps<"/tr/kanli-ay">) {
  return (
    <>
      <Suspense fallback={<Hero slug={siteConfig.defaultLocation.slug} />}>
        <SelectedHero searchParams={searchParams} />
      </Suspense>
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <BloodMoonAnswer />
        </div>

        <Suspense fallback={<BloodMoonSection slug={siteConfig.defaultLocation.slug} />}>
          <SelectedSection searchParams={searchParams} />
        </Suspense>

        <div className="mx-auto max-w-3xl">
          <NextBloodMoonDetails />
          <YearsTable />
          <Prose>
            <h2>Ay neden kırmızıya döner?</h2>
            <p>
              Tam tutulmada ay, Dünya&apos;nın gölgesinin tam ortasındadır ve doğrudan Güneş ışığı almaz.
              {src.ref("nasaEclipseTypes")} Yine de kaybolmaz, çünkü Dünya&apos;nın atmosferi Güneş ışığının bir
              kısmını kırarak gölgenin içine doğru büker.{src.ref("nasaDanjon")}
            </p>
            <p>
              Işık atmosferden geçerken mavi kısmı havadaki moleküller tarafından her yöne saçılır; gökyüzünün gündüz
              mavi görünmesinin nedeni de budur. Kırmızı ve turuncu ışık ise yoluna devam eder ve aya ulaşır. Yani tam
              tutulma sırasında ayı aydınlatan ışık, o anda Dünya&apos;nın çevresinde yaşanan bütün gün doğumlarının ve
              gün batımlarının ışığıdır. Aydan bakan biri, Dünya&apos;nın çevresinde kıpkırmızı parlayan ince bir halka
              görürdü.
            </p>

            <NasaFigure images={[IMAGES.bloodMoon]} />

            <h2>Her kanlı ay aynı renkte mi?</h2>
            <p>
              Hayır. Ayın rengi parlak bakır turuncusundan neredeyse görünmez koyu kahverengiye kadar değişebilir.
              Gözlemciler rengi, Fransız gökbilimci André Danjon&apos;un adını taşıyan beş basamaklı bir ölçekle
              değerlendirir:{src.ref("nasaDanjon")}
            </p>
            <ul>
              <li>
                <strong>L0:</strong> Çok karanlık; ay tutulmanın ortasında neredeyse görünmez olur.
              </li>
              <li>
                <strong>L1:</strong> Koyu gri ya da kahverengi; yüzey ayrıntıları zor seçilir.
              </li>
              <li>
                <strong>L2:</strong> Koyu kırmızı ya da pas rengi; ortası kenarlarından daha karanlık.
              </li>
              <li>
                <strong>L3:</strong> Tuğla kırmızısı; gölgenin kenarı daha parlak, sarımsı.
              </li>
              <li>
                <strong>L4:</strong> Çok parlak bakır ya da turuncu; kenarında mavimsi bir şerit görülebilir.
              </li>
            </ul>
            <p>
              Rengi belirleyen, o sırada Dünya atmosferinin ne kadar temiz olduğudur. Büyük yanardağ patlamalarından
              sonra üst atmosferdeki kül ve sülfat tanecikleri ışığı engeller ve ay çok koyu görünür.
              {src.ref("nasaDanjon")} Örneğin
              1991&apos;de Filipinler&apos;deki Pinatubo Yanardağı&apos;nın patlamasından sonraki tutulmalarda ay
              olağanüstü karanlıktı.
            </p>

            <h2>Neden her ay tutulmasında kanlı ay olmaz?</h2>
            <p>
              Kanlı ay için ayın Dünya&apos;nın gölgesinin tam içine, yani tam gölgenin tamamına girmesi gerekir. Ay
              gölgenin yalnızca bir kısmından geçerse parçalı tutulma olur; ayın bir bölümü kararır ama ay kızıla
              boyanmaz. Gölgenin yalnızca soluk dış kısmından geçerse (yarı gölge tutulması) değişim gözle zor fark
              edilir. Bütün ay tutulmalarının listesi için <Link href={PAGES.ayTutulmalari.path}>Ay Tutulmaları</Link>{" "}
              sayfasına bakabilirsiniz.
            </p>

            <h2>Süper kanlı ay nedir?</h2>
            <p>
              Tam tutulma, ayın Dünya&apos;ya yakın olduğu bir döneme denk gelirse &quot;süper kanlı ay&quot; denir. Ay
              biraz daha büyük görünür ve gölgenin içinden daha uzun sürede geçer. Yukarıdaki listede{" "}
              <Link href={PAGES.superAy.path}>süper ay</Link> eşiğimize giren tutulmalar işaretlendi. Önümüzdeki
              yıllarda Türkiye&apos;den görülecek süper kanlı ay, 12 Şubat 2036 gecesidir.
            </p>

            <h2>Anadolu&apos;da ay tutulması gelenekleri</h2>
            <p>
              Anadolu&apos;nun birçok yerinde ay tutulması, ayı bir ejderhanın ya da kötü bir varlığın yuttuğu şeklinde
              yorumlanırdı. Halk, ayı &quot;kurtarmak&quot; için tencere, tava ve teneke çalar, gürültü yapardı; bazı
              yerlerde havaya silah atıldığı da anlatılır. Bu gelenek, dünyanın pek çok kültüründe benzer biçimlerde
              karşımıza çıkar. Bugün tutulmanın nedenini biliyoruz, ama kızıl ayı izlemek hâlâ en etkileyici gökyüzü
              olaylarından biridir.
            </p>

            <h2>Kanlı ay nasıl izlenir?</h2>
            <ul>
              <li>
                <strong>Gözlük gerekmez.</strong> Güneş tutulmasının aksine kanlı ayı çıplak gözle, dürbünle ya da
                teleskopla rahatça izleyebilirsiniz.
              </li>
              <li>
                <strong>Ufku açık bir yer seçin.</strong> Akşam tutulmalarında ay doğuya yakın ve alçakta olur.
              </li>
              <li>
                <strong>Gözlerinizi karanlığa alıştırın.</strong> Kızıl ay, dolunaydan binlerce kez daha sönüktür; şehir
                ışıklarından uzaklaşırsanız rengi çok daha belirgin görünür.
              </li>
              <li>
                <strong>Tutulmanın tamamını izleyin.</strong> Gölgenin aya girişi ve rengin yavaş yavaş koyulaşması,
                kızıllık anı kadar etkileyicidir.
              </li>
            </ul>
          </Prose>
          <Faq items={FAQS.kanliAy} />
          <ArticleFooter
            page={PAGE}
            headline="Kanlı Ay Ne Zaman? Bir Sonraki Kanlı Ay ve Türkiye'den Görünüşü"
            updated={UPDATED}
            src={src}
          />
        </div>
      </main>
    </>
  );
}

async function SelectedHero({ searchParams }: Pick<PageProps<"/tr/kanli-ay">, "searchParams">) {
  const { il } = await searchParams;
  return <Hero slug={cityOf(il).slug} />;
}

/** Giriş: seçilen ilden görülecek bir sonraki kanlı ay. Saatte bir yenilenir. */
async function Hero({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = cityOf(slug);
  const now = new Date();
  const list = bloodMoons(city);
  const nextVisible = list.find((b) => b.eclipse.peak > now && b.visibleShare > 0.5);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const days = nextVisible ? Math.ceil((nextVisible.eclipse.peak.getTime() - now.getTime()) / 86_400_000) : 0;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1a0605] to-[#05070d] text-white">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 pb-14 pt-6 md:grid-cols-[1fr_auto] md:pb-20">
        <div className="order-2 md:order-1">
          <Breadcrumb page={PAGE} tone="dark" />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-red-300">Tam ay tutulması</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-7xl">{PAGE.title}</h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-200">
            Dolunay Dünya&apos;nın gölgesine tamamen girdiğinde kaybolmaz; bakır kırmızısına döner. Bir sonraki kanlı ay
            ne zaman, Türkiye&apos;den görülecek mi?
          </p>
          <Byline updated={UPDATED} />
          {nextVisible && (
            <div className="mt-8 max-w-md rounded-2xl border border-red-300/30 bg-red-500/10 p-5">
              <p className="text-xs uppercase tracking-wider text-red-200/80">
                Görülecek bir sonraki kanlı ay ({city.name})
              </p>
              <p className="mt-1 text-2xl font-semibold">{date.format(nextVisible.eclipse.peak)}</p>
              <p className="mt-0.5 text-zinc-300">
                Kızıllık {time.format(nextVisible.start)}-{time.format(nextVisible.end)} · {nextVisible.minutes} dakika
              </p>
              <p className="mt-0.5 text-sm text-zinc-400">
                Görünürlük ({city.name}): {verdictOf(nextVisible.visibleShare)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-100">
                  {days} gün sonra
                </span>
                <a href="#il-sec" className="text-sm text-zinc-300 underline hover:text-white">
                  İlinizi seçin
                </a>
              </div>
              <div className="mt-4">
                <AddToCalendar
                  fileName={`kanli-ay-${nextVisible.eclipse.peak.toISOString().slice(0, 10)}.ics`}
                  event={{
                    uid: `kanli-ay-${nextVisible.eclipse.peak.toISOString().slice(0, 10)}-${city.slug}`,
                    summary: "Kanlı ay (tam ay tutulması)",
                    description: `Ayın tamamen kızıl olduğu aralık: ${time.format(nextVisible.start)}-${time.format(nextVisible.end)} (Türkiye saati). Görünürlük (${city.name}): ${verdictOf(nextVisible.visibleShare)}. Çıplak gözle izlemek güvenlidir.`,
                    url: new URL(PAGE.path, siteConfig.url).toString(),
                    start: icsTime(nextVisible.start),
                    end: icsTime(nextVisible.end),
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="order-1 flex justify-center md:order-2">
          <div className="w-[min(70vw,340px)]">
            <RedMoon size={340} />
          </div>
        </div>
      </div>
    </section>
  );
}

async function SelectedSection({ searchParams }: Pick<PageProps<"/tr/kanli-ay">, "searchParams">) {
  const { il } = await searchParams;
  return <BloodMoonSection slug={cityOf(il).slug} />;
}

/** Liste başlığı, il seçici ve liste: görünürlük seçilen ile göre. */
function BloodMoonSection({ slug }: { slug: string }) {
  const city = cityOf(slug);
  return (
    <section aria-labelledby="kanli-ay-listesi" className="mt-12">
      <div id="il-sec" className="flex scroll-mt-32 flex-wrap items-end justify-between gap-3">
        <h2 id="kanli-ay-listesi" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          2025-{UNTIL_YEAR} kanlı ayları
        </h2>
        <CitySelect action={PAGE.path} options={CITY_OPTIONS} selected={city.slug} />
      </div>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Saatler, ayın tamamen kızardığı aralıktır (Türkiye saati). Görünürlük, bu aralıkta ayın seçtiğiniz ilde ufkun
        üzerinde olup olmadığına göre hesaplanır.
      </p>
      <BloodMoonList slug={city.slug} />
    </section>
  );
}

async function BloodMoonList({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = cityOf(slug);
  const now = new Date();
  const list = bloodMoons(city);
  const nextIndex = Math.max(0, list.findIndex((b) => b.eclipse.peak > now));
  // Telefonda yalnız sıradaki ve sonraki birkaç kanlı ay açık; geçmiştekiler ve gerisi "+ daha göster" arkasında.
  const shown = (i: number) => i >= nextIndex && i < nextIndex + MOBILE_ITEMS;
  const shownCount = list.filter((_, i) => shown(i)).length;
  const date = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

  return (
    <MobileCollapse hiddenCount={list.length - shownCount} noun="kanlı ay" variant="cards" className="mt-6">
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {list.map((b, i) => {
        const past = b.eclipse.peak < now;
        const verdict = `Görünürlük (${city.name}): ${verdictOf(b.visibleShare)}`;
        const visible = b.visibleShare > 0;
        return (
          <li
            key={b.eclipse.peak.toISOString()}
            data-extra={!shown(i) || undefined}
            className={`flex gap-4 rounded-2xl p-4 text-white ${visible ? "bg-[#1a0907]" : "bg-[#05070d]"} ${
              i === nextIndex ? "ring-2 ring-red-400" : ""
            } ${past ? "opacity-55" : ""}`}
          >
            <span className="shrink-0" style={visible ? undefined : { filter: "grayscale(1) brightness(0.6)" }}>
              <span
                className="block rounded-full"
                style={{
                  filter: "grayscale(1) sepia(1) saturate(3.5) hue-rotate(-28deg) brightness(0.55) contrast(1.1)",
                }}
              >
                <MoonPhaseIcon phaseAngle={180} size={52} title="" />
              </span>
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-200/80">
                {past ? "Geçti" : i === nextIndex ? "Sıradaki" : "Kanlı ay"}
                {b.km < SUPERMOON_KM && (
                  <span className="ml-2 rounded bg-amber-400 px-1.5 py-0.5 text-[#05070d]">Süper kanlı ay</span>
                )}
              </p>
              <p className="mt-0.5 text-lg font-semibold">{date.format(b.eclipse.peak)}</p>
              <p className="text-sm text-zinc-300">
                Kızıllık {time.format(b.start)}-{time.format(b.end)} · {b.minutes} dk
              </p>
              <p className={`mt-2 text-sm font-medium ${visible ? "text-emerald-300" : "text-zinc-400"}`}>{verdict}</p>
            </div>
          </li>
        );
      })}
    </ol>
    </MobileCollapse>
  );
}

/** Bir yılın ay tutulmaları ve o yıl kanlı ay olup olmadığı (İstanbul'dan görünürlüğüyle). */
function yearSummary(year: number) {
  const eclipses = getUpcomingLunarEclipses(new Date(Date.UTC(year - 1, 11, 1)), 8).filter((e) => yearOf(e.peak) === year);
  const totals = eclipses
    .filter((e) => e.kind === "total")
    .map((e) => {
      const sd = e.semiDurationMinutes.total * MINUTE;
      return {
        eclipse: e,
        visibleShare: shareAboveHorizon(new Date(e.peak.getTime() - sd), new Date(e.peak.getTime() + sd), ISTANBUL),
      };
    });
  return { year, eclipses, totals };
}

const dayMonth = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" });
const fullDate = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
const hm = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

/** "Yok. O yıl 3 ay tutulması var, hepsi yarı gölge tutulması; ay kızarmaz." / "Var: 3 Mart (Türkiye'den görülmez)." */
function yearAnswer({ eclipses, totals }: ReturnType<typeof yearSummary>): string {
  if (totals.length === 0) {
    const kinds = eclipses.map((e) => KIND_TR[e.kind]);
    const allPenumbral = kinds.every((k) => k === "yarı gölge");
    return `Yok. O yıl ${eclipses.length} ay tutulması var${
      allPenumbral ? ", hepsi yarı gölge tutulması; ay kızarmaz" : `: ${kinds.join(", ")}; ay kızarmaz`
    }.`;
  }
  return `Var: ${totals
    .map((t) => `${dayMonth.format(t.eclipse.peak)} (Türkiye'den ${verdictOf(t.visibleShare)})`)
    .join(", ")}.`;
}

/** Sayfanın sorusunun cevabı, en üstte (timeanddate düzeni). Görünürlük İstanbul'a göre; saatte bir yenilenir. */
async function BloodMoonAnswer() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const list = bloodMoons(ISTANBUL);
  const next = list.find((b) => b.eclipse.peak > now);
  const nextVisible = list.find((b) => b.eclipse.peak > now && b.visibleShare > 0.5);
  const lastVisible = [...list].reverse().find((b) => b.eclipse.peak <= now && b.visibleShare > 0.5);
  const weekday = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, weekday: "long" });
  const thisYear = yearOf(now);
  const days = (d: Date) => Math.ceil((d.getTime() - now.getTime()) / 86_400_000);

  if (!next) return null;
  const nextSeen = next.visibleShare > 0.5;
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(next.eclipse.peak));
  const partOfDay = hour < 6 ? "gecesi" : hour < 12 ? "sabahı" : hour < 17 ? "öğleden sonrası" : "akşamı";
  const answer = nextSeen
    ? `Bir sonraki kanlı ay ${fullDate.format(next.eclipse.peak)} ${weekday.format(next.eclipse.peak)} ${partOfDay} ve Türkiye'den görülecek.`
    : `Bir sonraki kanlı ay ${fullDate.format(next.eclipse.peak)}, ama Türkiye'den görülmeyecek.`;

  return (
    <AnswerBox
      question="Kanlı ay ne zaman?"
      answer={answer}
      rows={[
        {
          label: "Kızıllık (Türkiye saati)",
          value: `${hm.format(next.start)}-${hm.format(next.end)} (${next.minutes} dakika)`,
        },
        { label: "Kaç gün kaldı?", value: `${days(next.eclipse.peak)} gün` },
        ...(!nextSeen && nextVisible
          ? [{ label: "Türkiye'den görülecek ilk kanlı ay", value: fullDate.format(nextVisible.eclipse.peak) }]
          : []),
        ...[thisYear, thisYear + 1].map((y) => ({
          label: `${y} yılında kanlı ay var mı?`,
          value: (
            <>
              {yearAnswer(yearSummary(y))}
              {src.ref("nasaLunarCatalog")}
            </>
          ),
        })),
        ...(lastVisible
          ? [{ label: "Türkiye'den görülen son kanlı ay", value: fullDate.format(lastVisible.eclipse.peak) }]
          : []),
        { label: "İzlemek güvenli mi?", value: "Evet. Gözlük gerekmez; çıplak gözle, dürbünle ya da teleskopla izlenir." },
      ]}
      note={
        <>
          Görünürlük İstanbul&apos;a göre hesaplandı; iliniz için{" "}
          <a href="#il-sec" className="underline underline-offset-2">
            listeden il seçin
          </a>
          .
        </>
      }
    />
  );
}

/** Sıradaki kanlı ay: aşama aşama saatler ve kısa bilgiler (timeanddate tutulma sayfası düzeni). İstanbul'a göre. */
async function NextBloodMoonDetails() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const next = bloodMoons(ISTANBUL).find((b) => b.eclipse.peak > now);
  if (!next) return null;
  const { peak, semiDurationMinutes: sd } = next.eclipse;
  const at = (minutes: number) => new Date(peak.getTime() + minutes * MINUTE);
  const stages: { name: string; time: Date }[] = [
    { name: "Yarı gölge tutulması başlar", time: at(-sd.penumbral) },
    { name: "Parçalı tutulma başlar", time: at(-sd.partial) },
    { name: "Kızıllık başlar (tam tutulma)", time: at(-sd.total) },
    { name: "En derin an", time: peak },
    { name: "Kızıllık biter", time: at(sd.total) },
    { name: "Parçalı tutulma biter", time: at(sd.partial) },
    { name: "Yarı gölge tutulması biter", time: at(sd.penumbral) },
  ];
  const isSuper = next.km < SUPERMOON_KM;

  return (
    <section aria-labelledby="siradaki" className="mt-14">
      <h2 id="siradaki" data-toc-label="Sıradaki kanlı ay" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Sıradaki kanlı ay: {fullDate.format(peak)}
      </h2>
      <p className="mt-3 text-zinc-700 dark:text-zinc-300">
        Ayın Dünya&apos;nın gölgesine girişinden çıkışına kadar bütün aşamalar. Saatler Türkiye saatidir;
        &quot;İstanbul&apos;dan görülür mü?&quot; sütunu, o anda ayın İstanbul&apos;da ufkun üzerinde olup olmadığını
        gösterir.
      </p>
      <DataTable
        columns={["Aşama", "Türkiye saati", "İstanbul'dan görülür mü?"]}
        highlight="En derin an"
        rows={stages.map((st) => ({
          key: st.name,
          cells: [
            st.name,
            <span key="t" className="tabular-nums">
              {dayMonth.format(st.time)} {hm.format(st.time)}
            </span>,
            getMoonAltitude(st.time, ISTANBUL) > 0 ? "Evet" : "Hayır, ay ufkun altında",
          ],
        }))}
      />
      <h3 className="mt-8 text-lg font-semibold">Bu kanlı ay hakkında kısa bilgiler</h3>
      <FactTable
        rows={[
          { label: "Kızıllık süresi", value: formatDuration(2 * sd.total), comment: "Ayın tamamen kızıl göründüğü süre." },
          {
            label: "Parçalı evreler",
            value: formatDuration(2 * (sd.partial - sd.total)),
            comment: "Ayın gölgeye girerken ve çıkarken bir kısmının karardığı iki aşamanın toplamı.",
          },
          {
            label: "Tutulmanın tamamı",
            value: formatDuration(2 * sd.penumbral),
            comment: "İlk soluk kararmadan son soluk kararmaya kadar. Yarı gölge aşamaları gözle zor fark edilir.",
          },
          {
            label: "Ayın uzaklığı",
            value: `${Math.round(next.km).toLocaleString("tr-TR")} km`,
            comment: isSuper
              ? "Ay Dünya'ya yakın: süper kanlı ay."
              : `Süper kanlı ay değil (eşiğimiz ${SUPERMOON_KM.toLocaleString("tr-TR")} km).`,
          },
          {
            label: "İstanbul'dan görünürlük",
            value: verdictOf(next.visibleShare),
            comment: "Kızıllık süresince ayın ufkun üzerinde olup olmadığına göre.",
          },
        ]}
      />
      <p className="mt-3 text-sm text-zinc-500">
        Saatler kendi hesabımızdır ve NASA kataloğuyla birkaç dakika içinde örtüşür.{src.ref("nasaLunarCatalog")}{" "}
        <Link href={PAGES.yontem.path} className="underline underline-offset-2">
          Hesap ne kadar doğru?
        </Link>
      </p>
    </section>
  );
}

/** Yıllara göre kanlı ay: bu yıl ve sonraki üç yıl. "2027'de kanlı ay var mı?" sorusunun cevabı. */
async function YearsTable() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const thisYear = yearOf(now);
  const years = [0, 1, 2, 3].map((i) => yearSummary(thisYear + i));
  const nextBlood = bloodMoons(ISTANBUL).find((b) => b.eclipse.peak > now);
  const nextYear = nextBlood ? yearOf(nextBlood.eclipse.peak) : undefined;

  return (
    <section aria-labelledby="yillar" className="mt-14">
      <h2 id="yillar" data-toc-label="Hangi yıl kanlı ay var?" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {thisYear}-{thisYear + 3} arası hangi yıl kanlı ay var?
      </h2>
      <p className="mt-3 text-zinc-700 dark:text-zinc-300">
        Her yıl iki üç ay tutulması olur, ama hepsi kanlı ay değildir. Ay yalnız tam tutulmada kızarır; parçalı ve
        yarı gölge tutulmalarında kızarmaz.{src.ref("nasaLunarCatalog")}
      </p>
      <DataTable
        columns={["Yıl", "Kanlı ay var mı?", "O yılın ay tutulmaları"]}
        highlight={nextYear ? String(nextYear) : undefined}
        rows={years.map((y) => ({
          key: String(y.year),
          cells: [
            <span key="y" className="tabular-nums">
              {y.year}
              {y.year === nextYear && (
                <span className="ml-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">sıradaki</span>
              )}
            </span>,
            yearAnswer(y),
            y.eclipses
              .map((e) => {
                const faint = e.kind === "penumbral" && e.semiDurationMinutes.penumbral < FAINT_PENUMBRAL_MINUTES;
                return `${dayMonth.format(e.peak)}: ${KIND_TR[e.kind]}${faint ? " (çok zayıf)" : ""}`;
              })
              .join(" · "),
          ],
        }))}
      />
      {/* Elle yazılmış yıl notu: her Ekim bir sonraki yıla göre yeniden yazılır (CLAUDE.md 11b). */}
      <h3 className="mt-8 text-lg font-semibold">2027 yılında kanlı ay olacak mı?</h3>
      <p className="mt-2 text-zinc-700 dark:text-zinc-300">
        Hayır. 2027&apos;de üç ay tutulması var: 21 Şubat, 18 Temmuz ve 17 Ağustos (Türkiye saatiyle). Üçü de yarı gölge tutulmasıdır, yani ay
        Dünya&apos;nın gölgesinin yalnız soluk dış kısmından geçer ve kızarmaz.{src.ref("nasaLunarCatalog")} 20 Şubat&apos;ı 21
        Şubat&apos;a bağlayan gece, saat 02.12 civarında Türkiye&apos;den bakıldığında ayın bir kenarı biraz soluklaşır;
        dikkatli bakan fark edebilir. 18 Temmuz
        tutulması o kadar zayıftır ki (ayın çapının binde birinden azı gölgeye girer) gözle hiç fark edilmez.
        2027&apos;den sonraki ilk kanlı ay, 31 Aralık 2028 yılbaşı akşamıdır ve Türkiye&apos;nin her yerinden
        görülecektir.
      </p>
    </section>
  );
}
