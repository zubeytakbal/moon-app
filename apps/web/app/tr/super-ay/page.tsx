import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { getFullMoonsOfYear, getMoonDistanceKm, type PrincipalPhase } from "@moon-app/moon";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { siteConfig } from "@/site.config";
import { NasaFigure } from "@/components/NasaFigure";
import { IMAGES } from "@/lib/images";

const PAGE = PAGES.superAy;
const UPDATED = "2026-10-27";
const FIRST_YEAR = 2026;
const LAST_YEAR = 2030;
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `Süper Ay Nedir? Ne Zaman? 2026-2030 Süper Ay Tarihleri | ${siteConfig.name}`,
  description:
    "Süper ay nedir, normal dolunaydan ne kadar büyük görünür, neden tek bir tanımı yok? Bir sonraki süper ay ve 2026-2030 arasındaki bütün süper aylar (Türkiye saati). Süper ay deprem tetikler mi?",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

interface MoonWithDistance {
  phase: PrincipalPhase;
  km: number;
}

function fullMoonsWithDistance(): MoonWithDistance[] {
  const all: MoonWithDistance[] = [];
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    for (const phase of getFullMoonsOfYear(y)) all.push({ phase, km: getMoonDistanceKm(phase.date) });
  }
  return all;
}

export default function SupermoonPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={180}
        eyebrow="Tarihler"
        lead="Dolunay, ayın Dünya'ya en çok yaklaştığı zamana denk geldiğinde ay biraz daha büyük ve parlak görünür. Bu sayfada farkın gerçekte ne kadar olduğunu ve önümüzdeki süper ayları bulabilirsiniz."
        aside={<NextSupermoon />}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>Süper ay, Dünya&apos;ya en yakın konumuna çok yakınken gerçekleşen dolunaydır.</li>
            <li>En büyük süper ay, en küçük dolunaydan yaklaşık %14 büyük ve %30 parlak görünür.</li>
            <li>Ortalama bir dolunaya göre fark yalnızca %7 civarındadır; gözle fark etmek zordur.</li>
          </QuickFacts>
        </div>

        <SizeComparison />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Süper ay nasıl oluşur?</h2>
            <p>
              Ayın Dünya etrafındaki yörüngesi tam bir daire değil, hafif bir elipstir. Bu yüzden ay her ay bir kez
              Dünya&apos;ya en çok yaklaşır (yakınberi), bir kez de en çok uzaklaşır (uzakberi). Yakın noktada uzaklık
              yaklaşık 356.000-370.000 km, uzak noktada ise 404.000-406.700 km arasındadır.
            </p>
            <p>
              Ayın evreleri ile bu yaklaşıp uzaklaşma döngüsü aynı uzunlukta değildir. Bu yüzden dolunay bazen yakın
              noktaya, bazen uzak noktaya denk gelir. Dolunay yakın noktaya denk geldiğinde <strong>süper ay</strong>,
              uzak noktaya denk geldiğinde <strong>mikro ay</strong> oluşur. Süper aylar genellikle art arda iki üç
              dolunay boyunca görülür, sonra yaklaşık bir yıl ara verir.
            </p>

            <h2>Neden tek bir tanımı yok?</h2>
            <p>
              &quot;Süper ay&quot; bir gökbilim terimi değildir. 1979&apos;da astrolog Richard Nolle tarafından ortaya
              atılmış, sonradan medyada yaygınlaşmıştır. Nolle&apos;un tanımı, ayın o yörüngedeki en yakın konumuna %90
              oranında yaklaştığı dolunaylardır. Başka kaynaklar sabit bir uzaklık eşiği kullanır. Bu yüzden bir yılda
              kaç süper ay olduğu kaynağa göre değişebilir.
            </p>
            <p>
              Bu sitede, dolunay anında Dünya&apos;ya {new Intl.NumberFormat(siteConfig.locale).format(SUPERMOON_KM)}{" "}
              km&apos;den yakın olan dolunaylara süper ay diyoruz. Bütün sayfalarımızda aynı eşiği kullanıyoruz.
            </p>
          </Prose>
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight sm:text-3xl">
          {FIRST_YEAR}-{LAST_YEAR} süper ayları
        </h2>
        <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
          Saatler, dolunay anıdır (Türkiye saati). Uzaklık, o anda ayın merkezi ile Dünya&apos;nın merkezi arasındaki
          mesafedir.
        </p>
        <SupermoonList />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Süper ay gerçekten büyük görünür mü?</h2>
            <p>
              Sayılar etkileyici görünse de gözle fark etmek zordur. En büyük süper ay, en küçük mikro aydan yaklaşık
              %14 büyük görünür; ama bu ikisini hiçbir zaman yan yana göremeyiz, aralarında aylar vardır. Ortalama bir
              dolunayla karşılaştırıldığında fark yalnızca %7 civarındadır.
            </p>
            <p>
              Süper ayın asıl dikkat çeken yanı parlaklığıdır. Ay daha yakın olduğu için yaklaşık %15-30 daha fazla ışık
              yansıtır. Şehir dışında, açık bir gecede gölgelerin daha keskin düştüğünü fark edebilirsiniz.
            </p>
            <p>
              Fotoğraflarda gördüğünüz devasa aylar ise çoğunlukla çok uzun odaklı objektiflerle ve ufuktaki binaların
              ya da dağların arkasından çekilmiştir. Gözümüzün ufuktaki ayı büyük algılaması da (ay yanılsaması) bu
              etkiyi artırır. Bunu <Link href={PAGES.dolunay.path}>Dolunay</Link> sayfasında anlattık.
            </p>

            <NasaFigure images={[IMAGES.supermoonCapitol]} />

            <h2>Süper ay deprem tetikler mi?</h2>
            <p>
              Türkiye&apos;de her süper ayda bu soru gündeme gelir. Kısa cevap:{" "}
              <strong>
                Süper ayın deprem tetiklediğine dair bir kanıt yoktur ve süper ay tarihleri deprem tahmini için
                kullanılamaz.
              </strong>
            </p>
            <p>
              Ay ve Güneş&apos;in çekimi, okyanuslarda olduğu gibi yer kabuğunda da çok küçük gelgitler oluşturur. Bazı
              bilimsel çalışmalar, zaten kırılmanın eşiğinde olan faylarda bu küçük ek yükün etkisini istatistiksel
              olarak incelemiştir. Ancak bu etki, depremlerin asıl nedeni olan ve yüzyıllar boyunca biriken gerilimin
              yanında çok küçüktür. Süper ayda ay yalnızca biraz daha yakındır; gelgit kuvveti normal bir dolunaya göre
              çok az artar. Türkiye&apos;deki depremler süper ay olsun olmasın her zaman olabilir. Deprem hazırlığı,
              takvimden bağımsız olarak her zaman yapılmalıdır.
            </p>

            <h2>Deniz suyu yükselir mi?</h2>
            <p>
              Süper ay döneminde gelgitler biraz daha güçlüdür; okyanus kıyılarında deniz suyu normal dolunaya göre
              birkaç santimetre daha yükselebilir. Türkiye kıyılarında ise gelgit zaten çok küçük olduğu için bu fark
              pratikte hissedilmez.
            </p>
          </Prose>
          <ArticleFooter
            page={PAGE}
            headline="Süper Ay Nedir? Ne Zaman? 2026-2030 Süper Ay Tarihleri"
            updated={UPDATED}
            sources={[
              { label: "NASA Science, Supermoons", href: "https://science.nasa.gov/moon/supermoons/" },
              { label: "NASA Science, Moon Phases", href: "https://science.nasa.gov/moon/moon-phases/" },
            ]}
          />
        </div>
      </main>
    </>
  );
}

/** Bir sonraki süper ay ve kalan süre. */
async function NextSupermoon() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const next = fullMoonsWithDistance().find((m) => m.phase.date > now && m.km < SUPERMOON_KM);
  if (!next) return null;
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const days = Math.ceil((next.phase.date.getTime() - now.getTime()) / DAY_MS);

  return (
    <div className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-zinc-400">Bir sonraki süper ay</p>
      <p className="mt-1 text-2xl font-semibold">{date.format(next.phase.date)}</p>
      <p className="mt-0.5 text-zinc-300">
        Saat {time.format(next.phase.date)} · {new Intl.NumberFormat(siteConfig.locale).format(Math.round(next.km))} km
      </p>
      <p className="mt-3 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-200">
        {days} gün sonra
      </p>
    </div>
  );
}

/** Dönemin en büyük süper ayı ile en küçük mikro ayı, gerçek görünen boyut oranıyla yan yana. */
async function SizeComparison() {
  "use cache";
  cacheLife("weeks");

  const all = fullMoonsWithDistance();
  const closest = all.reduce((a, b) => (a.km < b.km ? a : b));
  const farthest = all.reduce((a, b) => (a.km > b.km ? a : b));
  const big = 300;
  const small = Math.round((big * closest.km) / farthest.km);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const km = new Intl.NumberFormat(siteConfig.locale);
  const pct = Math.round((farthest.km / closest.km - 1) * 100);

  return (
    <section
      aria-labelledby="karsilastirma"
      className="starfield mt-12 overflow-hidden rounded-3xl bg-[#05070d] px-5 py-8 text-white sm:px-10"
    >
      <h2 id="karsilastirma" className="text-center text-xl font-semibold sm:text-2xl">
        Süper ay ve mikro ay, gerçek oranlarıyla
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-400">
        {FIRST_YEAR}-{LAST_YEAR} arasının en yakın ve en uzak dolunayları. Görsellerin boyut oranı, gökyüzündeki görünen
        boyut oranıyla aynıdır: süper ay %{pct} daha büyük.
      </p>
      <div className="mt-8 grid grid-cols-2 items-end gap-4">
        {[
          { m: closest, size: big, label: "Süper ay" },
          { m: farthest, size: small, label: "Mikro ay" },
        ].map(({ m, size, label }) => (
          <figure key={label} className="flex flex-col items-center text-center">
            <div style={{ width: `${(size / big) * 100}%`, maxWidth: size }}>
              <MoonPhaseIcon phaseAngle={180} size={size} title={`${label}, ${date.format(m.phase.date)}`} />
            </div>
            <figcaption className="mt-3">
              <span className="block font-semibold">{label}</span>
              <span className="block text-sm text-zinc-400">{date.format(m.phase.date)}</span>
              <span className="block text-sm tabular-nums text-zinc-400">{km.format(Math.round(m.km))} km</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/** Dönemin bütün süper ayları; her yılın en büyüğü işaretlenir. */
async function SupermoonList() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const all = fullMoonsWithDistance();
  const supers = all.filter((m) => m.km < SUPERMOON_KM);
  const overallClosest = supers.reduce((a, b) => (a.km < b.km ? a : b));
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const km = new Intl.NumberFormat(siteConfig.locale);
  const nextIndex = supers.findIndex((m) => m.phase.date > now);

  return (
    <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {supers.map((m, i) => {
        const past = m.phase.date < now;
        // Yakınlık çubuğu: eşikte 0, en yakın olası değerde (yaklaşık 356.400 km) dolu.
        const closeness = Math.min(1, Math.max(0, (SUPERMOON_KM - m.km) / (SUPERMOON_KM - 356_400)));
        return (
          <li
            key={m.phase.date.toISOString()}
            className={`rounded-2xl border p-4 ${
              i === nextIndex
                ? "border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/30"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            } ${past ? "opacity-55" : ""}`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-semibold">
                <time dateTime={m.phase.date.toISOString()}>{date.format(m.phase.date)}</time>
              </p>
              <p className="text-sm tabular-nums text-zinc-500">{time.format(m.phase.date)}</p>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${Math.max(6, closeness * 100)}%` }}
                />
              </div>
              <span className="text-sm tabular-nums">{km.format(Math.round(m.km))} km</span>
            </div>
            <p className="mt-2 flex flex-wrap gap-1.5 text-xs">
              {i === nextIndex && (
                <span className="rounded bg-indigo-500 px-1.5 py-0.5 font-semibold text-white">Sıradaki</span>
              )}
              {m === overallClosest && (
                <span className="rounded bg-amber-400 px-1.5 py-0.5 font-semibold text-[#05070d]">
                  {FIRST_YEAR}-{LAST_YEAR} arasının en büyüğü
                </span>
              )}
              {past && <span className="text-zinc-500">Geçti</span>}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
