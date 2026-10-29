import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  findProvince,
  getMeteorNight,
  getMoonPhase,
  getUpcomingMeteorShowers,
  METEOR_SHOWERS,
  TURKEY_PROVINCES,
  type MeteorNight,
  type MeteorShower,
  type Province,
} from "@moon-app/moon";
import { AddToCalendar } from "@/components/AddToCalendar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CitySelect } from "@/components/CitySelect";
import { Faq } from "@/components/Faq";
import { MobileCollapse } from "@/components/MobileCollapse";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { FAQS } from "@/lib/faqs";
import { icsTime } from "@/lib/ics";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { MeteorSimulator } from "./MeteorSimulator";

const PAGE = PAGES.meteorYagmurlari;
const UPDATED = "2026-10-29";
const timeZone = siteConfig.defaultLocation.timeZone;
const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));
const DAY_MS = 86_400_000;
/** Girişte ve il bölümünde öne çıkan "büyük" yağmurlar: IMO ZHR ≥ 15 ve düzenli. Küçükler yalnız takvimde. */
const isMajor = (s: MeteorShower) => s.zhr >= 15 && !s.variable;

/** `from`dan sonraki ilk büyük yağmur. */
function nextMajor(from: Date) {
  return getUpcomingMeteorShowers(from, METEOR_SHOWERS.length).find((s) => isMajor(s.shower))!;
}

/** Telefonda yıl listesinde ilk açık duran yağmur sayısı. */
const MOBILE_ITEMS = 4;
/** Telefonda "büyük yağmurlar" bölümünde ilk açık duran yağmur sayısı. */
const MOBILE_NOTES = 3;

/** Başlıktaki yıllar: içinde bulunulan yıl ve sonraki. Günde bir yenilenir. */
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function generateMetadata(): Promise<Metadata> {
  const y = await currentYear();
  return {
    title: `Meteor Yağmurları ${y}-${y + 1}: Ne Zaman, Saat Kaçta, Nereden İzlenir? | ${siteConfig.name}`,
    description:
      "Sıradaki meteor yağmuru ne zaman? Perseid, İkizler, Orionid ve diğer yağmurların tarihleri, ilinizden en iyi izleme saatleri, ay ışığının etkisi ve saatte kaç meteor göreceğiniz.",
    // İl seçimi (?il=...) ayrı sayfa sayılmasın.
    alternates: { canonical: PAGE.path },
    openGraph: pageOpenGraph(PAGE),
  };
}

function cityOf(il: string | string[] | undefined): Province {
  return findProvince(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
}

const dateFmt = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
const dayMonth = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" });
const weekday = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, weekday: "long" });
const timeFmt = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

/** "14-15 Aralık gecesi" ya da "31 Aralık - 1 Ocak gecesi". */
function nightLabel(n: MeteorNight) {
  const a = dayMonth.formatToParts(n.dusk);
  const b = dayMonth.formatToParts(n.dawn);
  const part = (p: Intl.DateTimeFormatPart[], t: string) => p.find((x) => x.type === t)?.value ?? "";
  return part(a, "month") === part(b, "month")
    ? `${part(a, "day")}-${part(b, "day")} ${part(b, "month")} gecesi`
    : `${dayMonth.format(n.dusk)} - ${dayMonth.format(n.dawn)} gecesi`;
}

/** En iyi aralıkta ayın ne kadar engel olduğu: ufukta kalma payı × aydınlık oranı. */
function moonImpact(n: MeteorNight) {
  if (!n.best) return 1;
  const window = n.samples.filter((s) => s.time >= n.best!.start && s.time <= n.best!.end);
  const up = window.length ? window.filter((s) => s.moonAltitude > 0).length / window.length : 0;
  return up * n.moonIllumination;
}

function moonVerdict(n: MeteorNight): { text: string; tone: "good" | "mid" | "bad" } {
  const k = moonImpact(n);
  if (k < 0.15) return { text: "Ay engellemez", tone: "good" };
  if (k < 0.5) return { text: "Ay kısmen engeller", tone: "mid" };
  return { text: "Ay ışığı engeller", tone: "bad" };
}

const TONE = {
  good: "bg-emerald-500/15 text-emerald-200",
  mid: "bg-amber-500/15 text-amber-200",
  bad: "bg-red-500/15 text-red-200",
};

function moonNote(n: MeteorNight) {
  const pct = Math.round(n.moonIllumination * 100);
  if (pct < 3) return "O gece ay yeni ay evresinde: gökyüzü bütün gece karanlık.";
  const k = moonImpact(n);
  if (k < 0.15) return `Ay %${pct} aydınlık, ama en iyi saatlerde ufkun altında; meteorları engellemez.`;
  if (k < 0.5) return `Ay %${pct} aydınlık ve en iyi saatlerin bir kısmında gökyüzünde; sönük meteorların bir bölümü kaybolur.`;
  return `Ay %${pct} aydınlık ve en iyi saatlerde gökyüzünde; sönük meteorların çoğu görünmez.`;
}

export default function MeteorShowersPage({ searchParams }: PageProps<"/tr/meteor-yagmurlari">) {
  return (
    <>
      <Hero />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>
              Meteor yağmuru, Dünya bir kuyruklu yıldızın (ya da asteroidin) yörüngesinde bıraktığı toz şeridinden
              geçerken görülür; bu yüzden her yıl aynı tarihlere denk gelir.
            </li>
            <li>
              Yılın en güçlü yağmurları Aralık&apos;taki İkizler ve Ağustos&apos;taki Perseidlerdir. İkisi de
              Türkiye&apos;nin her yerinden görülür.
            </li>
            <li>
              Kaç meteor göreceğiniz en çok gökyüzünün karanlığına ve aya bağlıdır: şehir merkezinden saatte birkaç,
              karanlık bir yerden onlarca meteor görülebilir.
            </li>
          </QuickFacts>
        </div>

        <Suspense fallback={<CitySection slug={siteConfig.defaultLocation.slug} />}>
          <SelectedCity searchParams={searchParams} />
        </Suspense>

        <YearList />

        <ShowerNotes />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Meteor yağmuru nasıl oluşur?</h2>
            <p>
              Kuyruklu yıldızlar Güneş&apos;e yaklaştıkça ısınır ve yüzeylerinden toz ve küçük taş parçaları koparır.
              Bu parçacıklar kuyruklu yıldızın yörüngesi boyunca dağılarak uzayda ince, uzun bir toz şeridi oluşturur.
              Dünya her yıl yörüngesinin aynı noktasında bu şeritlerden birinin içinden geçer. O günlerde atmosfere
              normalden çok daha fazla parçacık girer ve gökyüzünde peş peşe ışık izleri görülür.
            </p>
          </Prose>
          <StreamDiagram />
          <Prose>
            <p>
              Parçacıkların çoğu kum tanesi, hatta toz büyüklüğündedir. Saniyede 20 ila 70 kilometre hızla atmosfere
              girdiklerinde önlerindeki havayı sıkıştırıp ısıtır, 70-100 kilometre yükseklikte buharlaşarak yanarlar.
              Gördüğümüz iz, parçacığın kendisi değil, bu sırada parlayan havadır. Bir yağmurdaki bütün parçacıklar
              uzayda birbirine paralel hareket eder; perspektif yüzünden gökyüzünde tek bir noktadan saçılıyormuş gibi
              görünürler. Bu noktaya <strong>radyant</strong> denir ve yağmur, radyantın bulunduğu takımyıldızın
              adını alır: Perseidler Perseus (Kahraman), Leonidler Leo (Aslan), İkizler de İkizler takımyıldızından
              gelir.
            </p>

            <h2>&quot;Saatte 100 meteor&quot; ne demek?</h2>
            <p>
              Haberlerde geçen sayı, gökbilimcilerin <strong>saatlik zenit sayısı (ZHR)</strong> dediği bir ölçüdür:
              radyant tam tepedeyken, kusursuz karanlık bir gökyüzünde, bir gözlemcinin bir saatte göreceği meteor
              sayısı. Gerçekte bu koşullar neredeyse hiç bir araya gelmez. Radyant alçaktaysa meteorların bir kısmı
              ufkun altında kalır; şehir ışıkları ve ay ise sönük meteorları siler. Bu yüzden &quot;saatte 150&quot;
              denen İkizler yağmurunu bir şehir merkezinden izleyen biri saatte ancak 10-15 meteor görebilir.
            </p>
            <p>
              Yukarıdaki hesaplayıcı, Uluslararası Meteor Örgütü&apos;nün (IMO) her yağmur için verdiği ZHR&apos;den
              yola çıkar ve seçtiğiniz ilde radyantın o saatteki yüksekliğine, ayın ufkun üzerinde olup olmadığına ve
              gökyüzünüzün karanlığına göre gerçekçi bir sayı tahmin eder. Gökyüzü karanlığını, çıplak gözle
              seçilebilen en sönük yıldızla ölçüyoruz: şehir merkezinde 4. kadir, kırsalda 6. kadir civarı.
            </p>

            <h2>Meteor yağmuru nasıl izlenir?</h2>
            <ul>
              <li>
                <strong>Işıklardan uzaklaşın.</strong> En büyük fark buradan gelir. Şehirden 20-30 kilometre
                uzaklaşmak, görülen meteor sayısını üç-dört katına çıkarabilir.
              </li>
              <li>
                <strong>Gözlerinizi karanlığa alıştırın.</strong> Gözün karanlığa tam uyum sağlaması 20-30 dakika
                sürer. Bu sırada telefon ekranına bakmak uyumu baştan başlatır; gerekiyorsa ekranı en düşük parlaklığa
                ve kırmızı filtreye alın.
              </li>
              <li>
                <strong>Uzanın ve sabırlı olun.</strong> Meteorlar düzenli aralıklarla değil, kümeler halinde gelir.
                Bir şezlong ya da mat, bir battaniye ve en az bir saat ayırın.
              </li>
              <li>
                <strong>Gece yarısından sonrasını kaçırmayın.</strong> Çoğu yağmurda radyant gece ilerledikçe yükselir
                ve Dünya&apos;nın sabaha dönük yüzü toz şeridine &quot;önden&quot; girer; bu yüzden en iyi saatler
                genellikle sabaha karşıdır. İkizler, akşam saatlerinde de iyi sonuç veren tek büyük yağmurdur.
              </li>
              <li>
                <strong>Teleskop ve dürbüne gerek yok.</strong> Meteorlar gökyüzünün herhangi bir yerinde, bir
                saniyeden kısa sürede belirir; en geniş görüş alanı çıplak gözdedir.
              </li>
            </ul>
            <p>
              Ayın ufkun altında olduğu karanlık gecelerin saatlerini{" "}
              <Link href={PAGES.yeniAy.path}>Yeni Ay</Link> sayfasındaki planlayıcıdan da görebilirsiniz.
            </p>
          </Prose>

          <Faq items={FAQS.meteorYagmurlari} />
          <ArticleFooter
            page={PAGE}
            headline="Meteor Yağmurları: Ne Zaman, Saat Kaçta, Nereden İzlenir?"
            updated={UPDATED}
            sources={[
              {
                label: "International Meteor Organization, 2026 Meteor Shower Calendar",
                href: "https://www.imo.net/the-2026-meteor-shower-calendar-is-here/",
              },
              {
                label: "International Meteor Organization, 2027 Meteor Shower Calendar",
                href: "https://www.imo.net/meteor-shower-calendar-2027/",
              },
              { label: "NASA Science, Meteors and Meteorites", href: "https://science.nasa.gov/solar-system/meteors-meteorites/" },
            ]}
          />
        </div>
      </main>
    </>
  );
}

/** Giriş: sıradaki yağmur, İstanbul'a göre. Saatte bir yenilenir. */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const next = nextMajor(new Date(now.getTime() - DAY_MS));
  const night = getMeteorNight(next.shower, next.peak, siteConfig.defaultLocation);
  const days = Math.max(0, Math.ceil((night.dusk.getTime() - now.getTime()) / DAY_MS));
  const verdict = moonVerdict(night);

  return (
    <section className="starfield relative overflow-hidden bg-[#05070d] text-white">
      <HeroStreaks />
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 pt-6 md:pb-20">
        <Breadcrumb page={PAGE} tone="dark" />
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Gökyüzü takvimi</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-7xl">{PAGE.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-zinc-200">
          Sıradaki meteor yağmuru ne zaman, saat kaçta en iyi görülür, ay ışığı engelleyecek mi? İlinizi seçin, kaç
          meteor göreceğinizi hesaplayın.
        </p>
        <div className="mt-8 max-w-md rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Sıradaki büyük meteor yağmuru</p>
          <p className="mt-1 text-2xl font-semibold">{next.shower.name}</p>
          <p className="mt-0.5 text-zinc-200">{nightLabel(night)}</p>
          <p className="mt-0.5 text-sm text-zinc-400">
            Doruk: {dateFmt.format(next.peak)}, {timeFmt.format(next.peak)} (Türkiye saati)
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-100">
              {days === 0 ? "Bu gece" : `${days} gün sonra`}
            </span>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${TONE[verdict.tone]}`}>{verdict.text}</span>
            <a href="#il-sec" className="text-sm text-zinc-300 underline hover:text-white">
              İlinizden saatler
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Girişin arka planında birkaç meteor izi (yalnız süs). */
function HeroStreaks() {
  const streaks = [
    [62, 18, 16, 9],
    [74, 30, 12, 7],
    [55, 40, 9, 5],
    [83, 12, 10, 6],
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
      {streaks.map(([left, top, len, h], i) => (
        <span
          key={i}
          className="absolute block rounded-full"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${len}vw`,
            height: 2,
            transform: `rotate(${28 + h}deg)`,
            background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(224,231,255,0.85))",
          }}
        />
      ))}
    </div>
  );
}

async function SelectedCity({ searchParams }: Pick<PageProps<"/tr/meteor-yagmurlari">, "searchParams">) {
  const { il } = await searchParams;
  return <CitySection slug={cityOf(il).slug} />;
}

/** Seçilen ilden sıradaki yağmur: gece boyunca saat saat beklenen meteor, en iyi aralık, simülasyon. */
async function CitySection({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = cityOf(slug);
  const now = new Date();
  const next = nextMajor(new Date(now.getTime() - DAY_MS));
  const night = getMeteorNight(next.shower, next.peak, city);
  const best = night.best;
  const dateKey = next.peak.toISOString().slice(0, 10);

  return (
    <section aria-labelledby="ilden" className="mt-12">
      <div id="il-sec" className="flex scroll-mt-32 flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            {next.shower.name} · {nightLabel(night)}
          </p>
          <h2
            id="ilden"
            data-toc-label="İlinizden en iyi saat"
            className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {city.name}: en iyi saat {best ? `${timeFmt.format(best.start)}-${timeFmt.format(best.end)}` : "yok"}
          </h2>
        </div>
        <CitySelect action={PAGE.path} options={CITY_OPTIONS} selected={city.slug} />
      </div>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Gökyüzünün karardığı saat: {timeFmt.format(night.dusk)} · aydınlanmaya başladığı saat:{" "}
        {timeFmt.format(night.dawn)}. Çizelge, gece boyunca saatte görülmesi beklenen meteor sayısını gösterir; gri
        alanlar ayın ufkun üzerinde olduğu saatlerdir.
      </p>

      <NightChart night={night} />

      {best && (
        <div className="mt-6">
          <MeteorSimulator
            showerName={next.shower.name}
            rates={{
              sehir: best.rate.sehir,
              kenar: best.rate.kenar,
              koy: best.rate.koy,
              karanlik: best.rate.karanlik,
            }}
            moonNote={moonNote(night)}
          />
        </div>
      )}

      {best && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-[#05070d] px-5 py-4 text-white">
          <p className="mr-auto text-sm text-zinc-300">
            Hatırlatma: {next.shower.name}, {city.name} için en iyi saatler
          </p>
          <AddToCalendar
            fileName={`meteor-${next.shower.key}-${dateKey}.ics`}
            event={{
              uid: `meteor-${next.shower.key}-${dateKey}-${city.slug}`,
              summary: `${next.shower.name} meteor yağmuru`,
              description: `${city.name} için en iyi saatler: ${timeFmt.format(best.start)}-${timeFmt.format(best.end)} (Türkiye saati). ${moonNote(night)} Işıklardan uzak, ufku açık bir yer seçin; gözlerinizin karanlığa alışması için 20 dakika bekleyin.`,
              url: new URL(PAGE.path, siteConfig.url).toString(),
              start: icsTime(best.start),
              end: icsTime(best.end),
            }}
          />
        </div>
      )}
    </section>
  );
}

/** Gece boyunca saatlik meteor sayısı (köy ve şehir kenarı), ayın ufukta olduğu saatler gri. */
function NightChart({ night }: { night: MeteorNight }) {
  const W = 720;
  const H = 200;
  const PAD = { l: 44, r: 10, t: 12, b: 34 };
  const t0 = night.dusk.getTime();
  const t1 = night.dawn.getTime();
  const max = Math.max(5, ...night.samples.map((s) => s.rate.koy));
  const x = (t: number) => PAD.l + ((t - t0) / (t1 - t0)) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b);
  const area = (key: "koy" | "kenar") =>
    `M${x(t0)},${y(0)} ` +
    night.samples.map((s) => `L${x(s.time.getTime()).toFixed(1)},${y(s.rate[key]).toFixed(1)}`).join(" ") +
    ` L${x(t1)},${y(0)} Z`;
  // Ayın ufukta olduğu aralıklar.
  const moonBands: [number, number][] = [];
  let start: number | null = null;
  for (const s of night.samples) {
    if (s.moonAltitude > 0 && start === null) start = s.time.getTime();
    if (s.moonAltitude <= 0 && start !== null) {
      moonBands.push([start, s.time.getTime()]);
      start = null;
    }
  }
  if (start !== null) moonBands.push([start, t1]);
  // Saat çizgileri: tam saatler.
  const ticks: number[] = [];
  for (let t = Math.ceil(t0 / 3_600_000) * 3_600_000; t <= t1; t += 3_600_000) ticks.push(t);
  const step = Math.ceil(max / 4 / 5) * 5;

  return (
    <figure className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gece boyunca saatte beklenen meteor sayısı">
        {moonBands.map(([a, b], i) => (
          <rect key={i} x={x(a)} y={PAD.t} width={x(b) - x(a)} height={H - PAD.t - PAD.b} className="fill-zinc-200 dark:fill-zinc-700/60" />
        ))}
        {Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step).map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-800" />
            <text x={PAD.l - 8} y={y(v) + 5} textAnchor="end" className="fill-zinc-500 text-[24px] sm:text-[11px]">
              {v}
            </text>
          </g>
        ))}
        <path d={area("koy")} className="fill-indigo-300/60 dark:fill-indigo-400/40" />
        <path d={area("kenar")} className="fill-indigo-600 dark:fill-indigo-500" />
        {ticks.map((t, i) =>
          i % 2 === 0 ? (
            <text key={t} x={x(t)} y={H - 6} textAnchor="middle" className="fill-zinc-500 text-[24px] sm:text-[11px]">
              {timeFmt.format(new Date(t))}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 px-1 text-xs text-zinc-600 dark:text-zinc-400">
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-indigo-300/60 align-middle" />
          Köy / kırsal
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-indigo-600 align-middle" />
          Şehir kenarı
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-zinc-200 align-middle dark:bg-zinc-700" />
          Ay ufkun üzerinde
        </span>
        <span>Dikey eksen: saatte meteor</span>
      </figcaption>
    </figure>
  );
}

/** Önümüzdeki 12 ayın yağmurları, İstanbul'a göre ay durumu. Saatte bir yenilenir. */
async function YearList() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const list = getUpcomingMeteorShowers(new Date(now.getTime() - DAY_MS), METEOR_SHOWERS.length);
  const y = now.getFullYear();
  const nights = list.map((s) => getMeteorNight(s.shower, s.peak, siteConfig.defaultLocation));

  return (
    <section aria-labelledby="takvim" className="mt-14">
      <h2 id="takvim" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {y}-{y + 1} meteor yağmurları takvimi
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Önümüzdeki on iki ayın yağmurları, doruk sırasıyla. Doruk saati Türkiye saatidir; meteorlar doruktan bir-iki
        gün önce ve sonra da yoğundur. Ay durumu İstanbul&apos;a göre hesaplanır, öteki illerde çok az değişir.
      </p>
      <MobileCollapse hiddenCount={list.length - MOBILE_ITEMS} noun="yağmur" variant="cards" className="mt-6">
        <ol className="grid gap-3 sm:grid-cols-2">
          {list.map((s, i) => {
            const n = nights[i];
            const v = moonVerdict(n);
            return (
              <li
                key={`${s.shower.key}-${s.peak.toISOString()}`}
                data-extra={i >= MOBILE_ITEMS || undefined}
                className={`flex gap-4 rounded-2xl bg-[#05070d] p-4 text-white ${i === 0 ? "ring-2 ring-indigo-400" : ""}`}
              >
                <span className="shrink-0 pt-1">
                  <MoonPhaseIcon phaseAngle={getMoonPhase(s.peak, timeZone).phaseAngle} size={44} title="" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                    {dayMonth.format(s.peak)} {weekday.format(s.peak)}
                  </p>
                  <p className="mt-0.5 text-lg font-semibold">
                    <a href={`#${s.shower.key}`} className="hover:underline">
                      {s.shower.name}
                    </a>
                  </p>
                  <p className="text-sm tabular-nums text-zinc-300">
                    Doruk {timeFmt.format(s.peak)} · {s.shower.variable ? "Değişken" : `ZHR ${s.shower.zhr}`}
                  </p>
                  <p className="mt-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[v.tone]}`}>
                      {v.text} (ay %{Math.round(n.moonIllumination * 100)})
                    </span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </MobileCollapse>
    </section>
  );
}

/** Her yağmur için elle yazılmış not. Çapalar yıl listesinden bağlanır. */
const NOTES: Record<string, { season: string; text: string[] }> = {
  kuadrantidler: {
    season: "Ocak başı",
    text: [
      "Adını artık kullanılmayan bir takımyıldızdan, Duvar Kadranı'ndan (Quadrans Muralis) alır; radyantı bugün Çoban ile Ejderha takımyıldızları arasında kalır. Yılın en güçlü yağmurlarından biridir ama doruğu çok dardır: yoğunluk birkaç saat içinde yükselip düşer. Doruk Türkiye'de gece saatlerine denk gelirse saatte onlarca meteor görülebilir, gündüze denk gelirse çok daha azı.",
      "Kaynağı bir kuyruklu yıldız değil, 2003 EH1 adlı küçük bir gökcismidir. Ocak gecelerinin soğuğu yüzünden en az izlenen büyük yağmurdur.",
    ],
  },
  liridler: {
    season: "Nisan sonu",
    text: [
      "Kaydı tutulan en eski meteor yağmurudur: Çin kayıtlarında MÖ 687'de 'yıldızların yağmur gibi düştüğü' yazar. Bugün genellikle saatte 15-20 meteorla orta şiddette bir yağmurdur, ama zaman zaman beklenmedik patlamalar yapar; 1982'de kısa bir süre saatte 90'a çıkmıştı.",
      "Kaynağı, Güneş çevresindeki turunu yaklaşık 415 yılda tamamlayan Thatcher kuyruklu yıldızıdır. Radyant Çalgı (Lyra) takımyıldızında, parlak Vega yıldızının yakınındadır ve gece yarısından sonra yükselir.",
    ],
  },
  "eta-akuaridler": {
    season: "Mayıs başı",
    text: [
      "Halley kuyruklu yıldızının bıraktığı tozdan oluşur; Halley'in kendisi ancak 2061'de dönecek ama tozu her yıl iki kez karşımıza çıkar. Radyant Kova takımyıldızında, gök ekvatorunun hemen üzerindedir ve ancak sabaha karşı, gün ağarmadan önce yükselir.",
      "Güney yarımkürede çok daha güçlü görülür. Türkiye'den sabahın son iki saatinde, doğu ufku açık bir yerden saatte 10-20 meteor beklenebilir. Meteorları çok hızlıdır ve çoğu zaman uzun, ince izler bırakır.",
    ],
  },
  "guney-delta-akuaridler": {
    season: "Temmuz sonu",
    text: [
      "Temmuz sonundan Ağustos ortasına kadar Perseidlerle aynı gecelerde etkindir. Radyant güney ufkunda, Kova takımyıldızında alçakta durduğu için Türkiye'den sayısı azdır; meteorların çoğu sönüktür. Perseidleri beklerken güneyden kuzeye doğru uçan sönük meteorlar görürseniz, büyük ihtimalle bu yağmurdandır.",
    ],
  },
  perseidler: {
    season: "Ağustos ortası",
    text: [
      "Türkiye'de en çok izlenen yağmurdur: ılık yaz geceleri, tatil ve açık gökyüzü bir araya gelir. Kaynağı, Güneş çevresini yaklaşık 133 yılda dolanan 109P/Swift-Tuttle kuyruklu yıldızıdır. Avrupa'da 10 Ağustos'taki Aziz Lawrence yortusuna denk geldiği için eskiden 'Aziz Lawrence'ın gözyaşları' diye anılırdı.",
      "Radyant Kahraman (Perseus) takımyıldızındadır; akşam alçakta başlar, gece boyunca yükselir. En iyi saatler sabaha karşıdır. Perseidler parlak ve hızlıdır, arada ardında birkaç saniye kalan iz bırakan ateş topları da görülür.",
    ],
  },
  drakonidler: {
    season: "Ekim başı",
    text: [
      "Çoğu yıl saatte yalnızca birkaç meteorluk zayıf bir yağmurdur, ama sürprizleriyle ünlüdür: 1933 ve 1946'da saatte binlerce meteorluk 'meteor fırtınaları' yapmıştır. Kaynağı 21P/Giacobini-Zinner kuyruklu yıldızıdır.",
      "Öteki yağmurların aksine radyant akşam saatlerinde yüksektir; bu yüzden en iyi zaman akşamdır. Meteorları çok yavaştır.",
    ],
  },
  orionidler: {
    season: "Ekim sonu",
    text: [
      "Halley kuyruklu yıldızının ikinci yağmurudur; Mayıs'taki Eta Akuaridlerle aynı toz şeridinin öbür ucundan gelir. Radyant Avcı (Orion) takımyıldızındadır ve gece yarısından sonra yükselir.",
      "Saatte 15-20 meteorla orta şiddettedir. Meteorları çok hızlıdır (saniyede 66 km); parlak olanlar ardında birkaç saniye görünen iz bırakabilir.",
    ],
  },
  "guney-toridler": {
    season: "Ekim-Kasım",
    text: [
      "Toridler, Güney ve Kuzey olmak üzere iki koldan oluşur ve Eylül sonundan Aralık başına kadar sürer. Saatte ancak birkaç meteor görülür, ama bunlar yavaş ve sık sık çok parlaktır; Batı'da Cadılar Bayramı'na denk geldikleri için 'Cadılar Bayramı ateş topları' diye anılırlar. Kaynakları Encke kuyruklu yıldızıdır.",
    ],
  },
  "kuzey-toridler": {
    season: "Kasım ortası",
    text: [
      "Toridlerin kuzey kolu, Kasım ortasında doruğa ulaşır. Güney koluyla birlikte, Ekim ve Kasım boyunca gece görülen yavaş, parlak meteorların çoğunun kaynağıdır.",
    ],
  },
  leonidler: {
    season: "Kasım ortası",
    text: [
      "Tarihin en büyük meteor fırtınaları Leonidlerden gelmiştir: 1833 ve 1966'da saatte on binlerce meteor görülmüş, 1999-2002 arasında da güçlü gösteriler olmuştur. Kaynakları olan 55P/Tempel-Tuttle kuyruklu yıldızı Güneş'e yaklaşık 33 yılda bir yaklaşır; fırtınalar bu yakınlaşmaların ardından gelir.",
      "Fırtına yıllarının dışında saatte 10-15 meteorla sakin bir yağmurdur. Meteorları büyük yağmurlar içinde en hızlısıdır (saniyede 71 km). Radyant Aslan takımyıldızında, gece yarısından sonra yükselir.",
    ],
  },
  ikizler: {
    season: "Aralık ortası",
    text: [
      "Yılın en güçlü ve en güvenilir yağmurudur: karanlık bir gökyüzünde saatte 100'den fazla meteor görülebilir. Kaynağı bir kuyruklu yıldız değil, 3200 Phaethon adlı bir asteroittir. Meteorları görece yavaş ve parlaktır; bazıları sarı, yeşil ya da mavimsi renkler gösterir.",
      "Radyant İkizler takımyıldızında, akşam saat 20-21 civarında doğu ufkunun üzerine çıkar. Bu yüzden İkizler, gece yarısını beklemeden akşamdan izlenebilen tek büyük yağmurdur; aileler ve çocuklar için en uygunudur.",
    ],
  },
  ursidler: {
    season: "Aralık sonu",
    text: [
      "Kış gündönümüne denk gelen küçük bir yağmurdur; saatte 5-10 meteor görülür. Radyant Küçük Ayı takımyıldızında, Kutup Yıldızı'nın yakınındadır; bu yüzden Türkiye'den bütün gece ufkun üzerindedir. Kaynağı 8P/Tuttle kuyruklu yıldızıdır.",
    ],
  },
};

/** Yağmurlar tek tek (ocaktan aralığa sabit sıra). */
function ShowerNotes() {
  return (
    <section aria-labelledby="yagmurlar" className="mt-14">
      <div className="mx-auto max-w-3xl">
        <h2 id="yagmurlar" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Yılın büyük meteor yağmurları
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Her yağmurun adı, yağmurun geldiği takımyıldızdan gelir. ZHR, kusursuz koşullarda saatte görülecek meteor
          sayısıdır; gerçek sayı için yukarıdaki hesaplayıcıya bakın.
        </p>
        <MobileCollapse hiddenCount={METEOR_SHOWERS.length - MOBILE_NOTES} noun="yağmur" variant="cards" className="mt-6">
        <div className="space-y-6">
          {METEOR_SHOWERS.map((s: MeteorShower, i) => {
            const note = NOTES[s.key];
            return (
              <article
                key={s.key}
                id={s.key}
                data-extra={i >= MOBILE_NOTES || undefined}
                className="scroll-mt-32 border-t border-zinc-200 pt-5 dark:border-zinc-800"
              >
                <h3 className="text-xl font-semibold">{s.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {note.season} · {s.variable ? "Değişken" : `ZHR ${s.zhr}`} · saniyede {s.speed} km · kaynağı {s.parent}
                </p>
                {note.text.map((p, i) => (
                  <p key={i} className="mt-3 leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {p}
                  </p>
                ))}
              </article>
            );
          })}
        </div>
        </MobileCollapse>
      </div>
    </section>
  );
}

/** Kendi çizimimiz: Dünya'nın yörüngesi, kuyruklu yıldızın toz şeridini her yıl aynı noktada keser. */
function StreamDiagram() {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#05070d] p-4 text-white">
      <svg viewBox="0 0 640 320" className="w-full" role="img" aria-label="Dünya yörüngesi ile kuyruklu yıldızın toz şeridinin kesiştiği nokta">
        <circle cx="300" cy="150" r="16" fill="#fcd34d" />
        <text x="300" y="185" textAnchor="middle" className="fill-amber-200 text-[13px]">
          Güneş
        </text>
        <ellipse cx="300" cy="150" rx="150" ry="110" fill="none" stroke="#60a5fa" strokeOpacity="0.6" strokeDasharray="4 5" />
        <text x="210" y="62" textAnchor="middle" className="fill-sky-300 text-[13px]">
          Dünya&apos;nın yörüngesi
        </text>
        <ellipse
          cx="350"
          cy="150"
          rx="270"
          ry="70"
          transform="rotate(-24 350 150)"
          fill="none"
          stroke="#c7d2fe"
          strokeOpacity="0.35"
          strokeWidth="14"
        />
        <ellipse cx="350" cy="150" rx="270" ry="70" transform="rotate(-24 350 150)" fill="none" stroke="#e0e7ff" strokeWidth="1.2" />
        <text x="636" y="22" textAnchor="end" className="fill-indigo-200 text-[13px]">
          Kuyruklu yıldızın toz şeridi
        </text>
        <circle cx="430" cy="78" r="6" fill="#e0e7ff" />
        <path d="M430 78 l40 -14" stroke="#e0e7ff" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
        <circle cx="160" cy="203" r="9" fill="#3b82f6" />
        <circle cx="160" cy="203" r="20" fill="none" stroke="#fde68a" strokeWidth="1.5" />
        <text x="160" y="310" textAnchor="middle" className="fill-amber-100 text-[13px]">
          Dünya şeritten geçer: meteor yağmuru
        </text>
      </svg>
      <figcaption className="mt-2 text-sm text-zinc-400">
        Dünya her yıl yörüngesinin aynı noktasında toz şeridini keser; bu yüzden her yağmur her yıl aynı günlere denk
        gelir. Ölçekli değildir.
      </figcaption>
    </figure>
  );
}
