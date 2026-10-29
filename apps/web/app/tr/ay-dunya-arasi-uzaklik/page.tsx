import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonDistanceKm, getMoonPhase, getUpcomingLunarApsides } from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Faq } from "@/components/Faq";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { FAQS } from "@/lib/faqs";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { RecessionCalculator, TravelCalculator } from "./DistanceTools";

const PAGE = PAGES.ayUzaklik;
const UPDATED = "2026-10-29";
const timeZone = siteConfig.defaultLocation.timeZone;
const LIGHT_KM_S = 299_792.458;
const KM_PER_MILE = 1.609344;
/** NASA Moon Fact Sheet: yarı büyük eksen ve ekvator yarıçapları (km). */
const MEAN_KM = 384_400;
const EARTH_DIAMETER_KM = 12_756;
const MOON_DIAMETER_KM = 3_475;
/** Yüzyıl ölçeğinde görülen en küçük ve en büyük uzaklıklar (yaklaşık, km). */
const MIN_KM = 356_400;
const MAX_KM = 406_700;

const NF = new Intl.NumberFormat(siteConfig.locale);
const NF1 = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 1 });
const NF2 = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 2 });
const dateFmt = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });

export const metadata: Metadata = {
  title: `Ay ile Dünya Arası Kaç Km? Ay Şu An Ne Kadar Uzak? | ${siteConfig.name}`,
  description:
    "Ay ile Dünya arası ortalama 384.400 km. Ay şu an kaç km uzakta, arabayla ya da uçakla aya kaç günde gidilir, ay neden her yıl 3,8 cm uzaklaşıyor? Canlı uzaklık ve hesaplayıcılar.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

/** "3,844 × 10⁵" biçiminde bilimsel gösterim. */
function scientific(value: number) {
  const exp = Math.floor(Math.log10(value));
  const mantissa = value / 10 ** exp;
  const sup = String(exp)
    .split("")
    .map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)])
    .join("");
  return `${new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 3 }).format(mantissa)} × 10${sup}`;
}

export default function DistancePage() {
  return (
    <>
      <Hero />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>
              Ay ile Dünya arası ortalama <strong>384.400 kilometredir</strong> (bilimsel gösterimle 3,844 × 10⁵ km).
              Bu, merkezden merkeze ölçülen uzaklıktır.
            </li>
            <li>
              Ayın yörüngesi tam bir çember olmadığı için uzaklık her ay yaklaşık 356.400 ile 406.700 km arasında
              değişir.
            </li>
            <li>Işık bu yolu 1,3 saniyede alır. Ay her yıl Dünya&apos;dan yaklaşık 3,8 santimetre uzaklaşır.</li>
          </QuickFacts>
        </div>

        <NowSection />

        <section aria-labelledby="olcek" className="mt-14">
          <h2 id="olcek" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Gerçek ölçekte Dünya ve ay
          </h2>
          <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
            Ders kitaplarındaki çizimler ayı Dünya&apos;nın hemen yanında gösterir. Gerçek oranlarda aradaki boşluk
            yaklaşık 30 Dünya genişliğindedir; ay en uzak noktasındayken arasına Güneş sisteminin bütün gezegenleri yan
            yana sığar.
          </p>
          <ScaleDiagram />
        </section>

        <section aria-labelledby="hesapla" className="mt-14">
          <h2 id="hesapla" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Bu uzaklığı hissetmek için
          </h2>
          <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
            Uzay araçlarının aya kaç günde gittiğini <Link href={PAGES.ayaYolculuk.path} className="underline">Aya Yolculuk</Link>{" "}
            sayfasında anlattık. Burada gündelik araçlarla deneyelim.
          </p>
          <Tools />
        </section>

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Uzaklık neden her gün değişiyor?</h2>
            <p>
              Ay Dünya&apos;nın çevresinde tam bir çember değil, hafif basık bir elips çizer. Yörüngenin Dünya&apos;ya en
              yakın noktasına <strong>yakınberi</strong>, en uzak noktasına <strong>uzakberi</strong> denir; ay bu iki
              nokta arasında 27,5 günde bir gidip gelir. Güneş&apos;in çekimi elipsin biçimini ay ay değiştirdiği için
              yakınberi ve uzakberi uzaklıkları da her ay biraz farklıdır. Yakınberi dolunaya denk geldiğinde ay
              gökyüzünde biraz daha büyük ve parlak görünür; buna <Link href={PAGES.superAy.path}>süper ay</Link> denir.
            </p>

            <h2>Bu uzaklık nasıl ölçülüyor?</h2>
            <p>
              İlk tahminler iki bin yıldan eskidir. MÖ 2. yüzyılda Hipparkos, ay tutulmalarındaki gölgenin boyutundan ve
              farklı yerlerden görülen ay konumlarından yola çıkarak uzaklığı Dünya yarıçapının 60-67 katı olarak
              hesapladı. Bugünkü değer 60,3 kattır; yani şaşırtıcı derecede yakın bir tahmindi.
            </p>
            <p>
              Bugün uzaklık milimetre düzeyinde ölçülüyor. Apollo astronotlarının ve Sovyet ay araçlarının aya bıraktığı
              yansıtıcı aynalara Dünya&apos;dan lazer gönderiliyor; ışığın gidip dönmesi yaklaşık 2,5 saniye sürüyor ve bu
              süreden uzaklık hesaplanıyor. Ayın uzaklaştığını da bu ölçümler sayesinde biliyoruz.
            </p>

            <h2>Ay neden uzaklaşıyor?</h2>
            <p>
              Ayın çekimi Dünya&apos;daki okyanusları kendine doğru şişirir; bu şişkinlik gelgitleri oluşturur. Dünya
              kendi çevresinde aydan çok daha hızlı döndüğü için şişkinliği biraz önde taşır. Öne geçmiş bu su kütlesi ayı
              yörüngesinde hafifçe ileri çeker; ay enerji kazanır ve her yıl biraz daha geniş bir yörüngeye çıkar. Aynı
              etkileşim Dünya&apos;nın dönüşünü de frenler: günlerimiz her yüzyılda yaklaşık 2 milisaniye uzar.
            </p>
            <p>
              Uzaklaşmanın uzun vadede bir sonucu daha var. Bugün ay ile Güneş gökyüzünde neredeyse aynı büyüklükte
              göründüğü için ay Güneş&apos;i tam örtebiliyor. Ay uzaklaştıkça küçük görünecek; yüz milyonlarca yıl sonra
              Güneş&apos;i tamamen örtemeyecek ve tam güneş tutulmaları sona erecek. Önümüzdeki tutulmaları{" "}
              <Link href={PAGES.gunesTutulmasi.path}>Güneş Tutulması</Link> sayfasında görebilirsiniz.
            </p>
          </Prose>

          <Faq items={FAQS.ayUzaklik} />
          <ArticleFooter
            page={PAGE}
            headline="Ay ile Dünya Arası Kaç Km? Ay Şu An Ne Kadar Uzak?"
            updated={UPDATED}
            sources={[
              { label: "NASA, Moon Fact Sheet", href: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html" },
              { label: "NASA Science, Moon Facts", href: "https://science.nasa.gov/moon/facts/" },
            ]}
          />
        </div>
      </main>
    </>
  );
}

/** Giriş: ay şu an kaç km uzakta. Saatte bir yenilenir. */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const km = getMoonDistanceKm(now);
  const phase = getMoonPhase(now, timeZone);
  const diff = km - MEAN_KM;

  return (
    <section className="starfield relative overflow-hidden bg-[#05070d] text-white">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 pb-14 pt-6 md:grid-cols-[1fr_auto] md:pb-20">
        <div className="order-2 md:order-1">
          <Breadcrumb page={PAGE} tone="dark" />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Ay bilgisi</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl">{PAGE.title}</h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-200">
            Ortalama 384.400 kilometre. Ama ay her an aynı uzaklıkta değil; şu an tam olarak ne kadar uzakta?
          </p>
          <div className="mt-8 max-w-md rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Ay şu an</p>
            <p className="mt-1 text-4xl font-extralight tabular-nums">{NF.format(Math.round(km))} km</p>
            <p className="mt-1 text-zinc-300">
              uzakta: ortalamadan {NF.format(Math.abs(Math.round(diff)))} km {diff > 0 ? "daha uzak" : "daha yakın"}.
            </p>
            <p className="mt-3 text-sm text-zinc-400">Işık bu yolu {NF2.format(km / LIGHT_KM_S)} saniyede alır.</p>
          </div>
        </div>
        <div className="order-1 flex justify-center md:order-2">
          <div className="w-[min(60vw,300px)]">
            <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={300} glow title={`Ay şu an, ${phase.name}`} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Şu anki uzaklık: en yakın-en uzak aralığındaki yeri, birimler, sıradaki yakınberi ve uzakberi. */
async function NowSection() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const km = getMoonDistanceKm(now);
  const apsides = getUpcomingLunarApsides(now, 2);
  const pos = Math.min(100, Math.max(0, ((km - MIN_KM) / (MAX_KM - MIN_KM)) * 100));
  const units: [string, string][] = [
    ["Kilometre", `${NF.format(Math.round(km))} km`],
    ["Bilimsel gösterim", `${scientific(Math.round(km))} km`],
    ["Metre", `${scientific(Math.round(km) * 1000)} m`],
    ["Mil", `${NF.format(Math.round(km / KM_PER_MILE))} mil`],
    ["Işık zamanı", `${NF2.format(km / LIGHT_KM_S)} ışık saniyesi`],
    ["Dünya genişliği", `${NF1.format(km / EARTH_DIAMETER_KM)} Dünya`],
  ];

  return (
    <section aria-labelledby="simdi" className="mt-12">
      <h2 id="simdi" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Ay şu an {NF.format(Math.round(km))} km uzakta
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Değer, Dünya&apos;nın merkezinden ayın merkezine olan uzaklıktır ve saatte bir yenilenir. Çubuk, ayın son
        yüzyıllarda ulaştığı en yakın ve en uzak değerler arasında şu an nerede olduğunu gösterir.
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative h-3 rounded-full bg-gradient-to-r from-amber-300 via-zinc-300 to-sky-400 dark:via-zinc-600">
          <span
            className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-indigo-600 shadow dark:border-zinc-900"
            style={{ left: `${pos}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>En yakın ~{NF.format(MIN_KM)} km</span>
          <span>En uzak ~{NF.format(MAX_KM)} km</span>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {apsides.map((a) => (
            <li key={a.date.toISOString()} className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-950">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Sıradaki {a.kind === "perigee" ? "yakınberi (en yakın)" : "uzakberi (en uzak)"}
              </p>
              <p className="mt-0.5 font-semibold">{dateFmt.format(a.date)}</p>
              <p className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">{NF.format(Math.round(a.km))} km</p>
            </li>
          ))}
        </ul>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {units.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

async function Tools() {
  "use cache";
  cacheLife("hours");
  const now = new Date();
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <TravelCalculator km={getMoonDistanceKm(now)} />
      <RecessionCalculator currentYear={now.getFullYear()} />
    </div>
  );
}

/** Gezegenlerin çapları (km, NASA Planetary Fact Sheet), ölçek çizimi için. */
const PLANETS = [
  { name: "Merkür", d: 4_879, color: "#a8a29e" },
  { name: "Venüs", d: 12_104, color: "#fcd34d" },
  { name: "Mars", d: 6_792, color: "#f97316" },
  { name: "Jüpiter", d: 142_984, color: "#d6a77a" },
  { name: "Satürn", d: 120_536, color: "#eab308" },
  { name: "Uranüs", d: 51_118, color: "#67e8f9" },
  { name: "Neptün", d: 49_528, color: "#3b82f6" },
];

/** Gerçek ölçekte Dünya, ay (en uzak noktasında) ve aralarına sığan gezegenler. */
function ScaleDiagram() {
  const W = 1000;
  const scale = (W - 20) / (MAX_KM + EARTH_DIAMETER_KM / 2 + MOON_DIAMETER_KM / 2);
  const earthR = (EARTH_DIAMETER_KM / 2) * scale;
  const moonR = (MOON_DIAMETER_KM / 2) * scale;
  const earthX = 10 + earthR;
  const moonX = earthX + MAX_KM * scale;
  const meanX = earthX + MEAN_KM * scale;
  // Gezegenlerin soldan sağa başlangıç noktaları: Dünya'nın yüzeyinden başlayarak yan yana.
  const starts = PLANETS.map((_, i) => earthX + earthR + PLANETS.slice(0, i).reduce((s, p) => s + p.d * scale, 0));
  // Ekvator çapları toplamı; Dünya ve ayın yüzeyleri arasındaki boşlukla karşılaştırılır.
  const planetSum = PLANETS.reduce((s, p) => s + p.d, 0);
  const meanGap = MEAN_KM - EARTH_DIAMETER_KM / 2 - MOON_DIAMETER_KM / 2;
  const overflowThousand = Math.round((planetSum - meanGap) / 1000);

  return (
    <figure className="mt-6 overflow-hidden rounded-2xl bg-[#05070d] p-4 text-white sm:p-6">
      <svg viewBox={`0 0 ${W} 190`} className="w-full" role="img" aria-label="Dünya ve ay arasındaki uzaklık, gerçek ölçekte">
        {/* Üst sıra: Dünya, ortalama uzaklık işareti ve en uzak noktadaki ay */}
        <circle cx={earthX} cy={60} r={earthR} fill="#3b82f6" />
        <line x1={earthX + earthR} x2={moonX - moonR} y1={60} y2={60} stroke="#94a3b8" strokeOpacity="0.5" strokeDasharray="3 6" />
        <circle cx={moonX} cy={60} r={moonR} fill="#d4d4d8" />
        <line x1={meanX} x2={meanX} y1={40} y2={80} stroke="#a5b4fc" strokeOpacity="0.6" />
        <text x={meanX} y={30} textAnchor="middle" className="fill-indigo-200 text-[22px] sm:text-[13px]">
          ortalama
        </text>
        <text x={earthX} y={108} className="fill-sky-300 text-[22px] sm:text-[13px]">
          Dünya
        </text>
        <text x={moonX} y={108} textAnchor="end" className="fill-zinc-300 text-[22px] sm:text-[13px]">
          Ay (en uzakta)
        </text>
        {/* Alt sıra: gezegenler yan yana */}
        {PLANETS.map((p, i) => {
          const w = p.d * scale;
          const h = Math.min(w, 40);
          return <rect key={p.name} x={starts[i]} y={140 - h / 2} width={w} height={h} rx={h / 2} fill={p.color} />;
        })}
      </svg>
      <figcaption className="mt-3 text-sm text-zinc-400">
        Dünya, ay ve gezegenler aynı ölçekte. Alt sırada Merkür&apos;den Neptün&apos;e bütün gezegenler yan yana:
        çaplarının toplamı {NF.format(planetSum)} km. Bu sıra, ay en uzak noktasındayken Dünya ile ayın yüzeyleri
        arasındaki boşluğa sığar; ortalama uzaklıkta ise yaklaşık {overflowThousand} bin kilometre taşar. Büyük
        gezegenler sığsın diye yükseklikleri kısaltıldı; genişlikleri gerçek ölçekte.
      </figcaption>
    </figure>
  );
}
