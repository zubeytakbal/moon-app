import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { getFullMoonsOfYear } from "@moon-app/moon";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter, NextPrincipal, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { nameFullMoons } from "@/lib/full-moon-names";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.dolunayIsimleri;
const UPDATED = "2026-10-27";
const timeZone = siteConfig.defaultLocation.timeZone;

export const metadata: Metadata = {
  title: `Dolunay İsimleri ve Anlamları: Kurt Ayı, Çilek Ayı, Hasat Ayı | ${siteConfig.name}`,
  description:
    "Her ayın dolunayının geleneksel adı ve anlamı: Kurt Ayı, Kar Ayı, Solucan Ayı, Pembe Ay, Çiçek Ayı, Çilek Ayı, Hasat Ayı, Avcı Ayı, Soğuk Ay ve diğerleri. İsimlerin kökeni ve bir sonraki tarihleri.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

/** Her ismin anlamı. Sıra, takvim yılındaki yerine göredir. */
const NAMES: { name: string; month: string; meaning: string }[] = [
  {
    name: "Kurt Ayı",
    month: "Ocak",
    meaning:
      "Kışın ortasında, uzun ve soğuk gecelerde kurtların uluması daha sık duyulur. Eskiden bunun açlıktan olduğu düşünülürdü; bugün kurtların uluyarak sürüsüyle haberleştiği ve bölgesini belirlediği biliniyor.",
  },
  {
    name: "Kar Ayı",
    month: "Şubat",
    meaning: "Kuzey Amerika'da yılın en çok kar yağan dönemine denk gelir.",
  },
  {
    name: "Solucan Ayı",
    month: "Mart",
    meaning:
      "Toprak çözülmeye başlar, solucanlar ve böcek kurtçukları yeniden yüzeye çıkar. Baharın ilk işaretlerinden biridir.",
  },
  {
    name: "Pembe Ay",
    month: "Nisan",
    meaning:
      "Ay pembe olmaz. Ad, Kuzey Amerika'da ilkbaharın erken açan pembe çiçeklerinden birinden, yer floksundan gelir.",
  },
  { name: "Çiçek Ayı", month: "Mayıs", meaning: "Doğanın en çok çiçek açtığı dönemin dolunayıdır." },
  {
    name: "Çilek Ayı",
    month: "Haziran",
    meaning:
      "Yabani çileklerin olgunlaşıp toplandığı zamandır. Avrupa'da aynı dolunaya Gül Ayı ya da Bal Ayı da denir.",
  },
  {
    name: "Erkek Geyik Ayı",
    month: "Temmuz",
    meaning: "Erkek geyiklerin boynuzlarının yeniden çıkıp hızla büyüdüğü dönemdir.",
  },
  {
    name: "Mersin Balığı Ayı",
    month: "Ağustos",
    meaning: "Kuzey Amerika'daki Büyük Göller'de mersin balıklarının en kolay avlandığı yaz sonu dolunayıdır.",
  },
  {
    name: "Mısır Ayı",
    month: "Eylül",
    meaning: "Mısırın hasat edildiği zamandır. Eylül dolunayı Hasat Ayı olursa bu ad kullanılmaz.",
  },
  {
    name: "Avcı Ayı",
    month: "Ekim",
    meaning:
      "Hasat Ayı'ndan sonraki dolunaydır. Tarlalar boşalmış, kışa hazırlık için av zamanı gelmiştir. Ay akşamları erken doğarak avcılara ışık verir.",
  },
  {
    name: "Kunduz Ayı",
    month: "Kasım",
    meaning: "Kunduzların kış için barajlarını ve yuvalarını tamamladığı, göllerin donmaya başladığı dönemdir.",
  },
  { name: "Soğuk Ay", month: "Aralık", meaning: "Gecelerin en uzun ve en soğuk olduğu kış başlangıcının dolunayıdır." },
];

const SPECIAL: { name: string; meaning: string; href?: string }[] = [
  {
    name: "Hasat Ayı",
    meaning:
      "Eylül ekinoksuna en yakın dolunaydır; eylül ya da ekime düşer. Birkaç akşam üst üste gün batımından kısa süre sonra doğar, çiftçilerin karanlıkta da hasada devam etmesine ışık olurdu.",
  },
  {
    name: "Mavi Ay",
    meaning: "Bir takvim ayına düşen ikinci dolunaydır. Rengiyle ilgisi yoktur, iki üç yılda bir görülür.",
    href: PAGES.ayTakvimi.path,
  },
  {
    name: "Süper Ay",
    meaning: "Ayın Dünya'ya en çok yaklaştığı zamana denk gelen, biraz daha büyük ve parlak görünen dolunaydır.",
    href: PAGES.superAy.path,
  },
  {
    name: "Kanlı Ay",
    meaning:
      "Tam ay tutulması sırasında Dünya'nın gölgesine giren ayın aldığı bakır kırmızısı rengin halk arasındaki adıdır.",
    href: PAGES.ayTutulmalari.path,
  },
];

export default function FullMoonNamesPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={180}
        eyebrow="Tarihler"
        lead="Her ayın dolunayının bir adı vardır: Kurt Ayı, Çilek Ayı, Hasat Ayı... Bu adlar nereden geliyor, ne anlama geliyor ve bir sonraki ne zaman?"
        aside={<NextPrincipal phase="full-moon" />}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>Bugün yaygın kullanılan dolunay isimleri Kuzey Amerika kökenlidir; Türk geleneğinden gelmez.</li>
            <li>İsimler gökbilimsel değil, mevsimseldir: o dönemde doğada olan bir şeyi anlatır.</li>
            <li>Hasat Ayı ve Mavi Ay gibi bazı isimler takvim ayına değil, belirli bir kurala bağlıdır.</li>
          </QuickFacts>
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight sm:text-3xl">On iki ayın dolunayı</h2>
        <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
          Her kartta, o adı taşıyan bir sonraki dolunayın tarihi yer alıyor (Türkiye saati).
        </p>
        <NameCards />

        <h2 className="mt-14 text-2xl font-semibold tracking-tight sm:text-3xl">Özel dolunay isimleri</h2>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SPECIAL.map((s) => (
            <li
              key={s.name}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-lg font-semibold">{s.name}</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{s.meaning}</p>
              {s.href && (
                <Link
                  href={s.href}
                  className="mt-2 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-300"
                >
                  Ayrıntılar →
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Bu isimler nereden geliyor?</h2>
            <p>
              Bugün haberlerde ve sosyal medyada duyduğumuz dolunay isimleri, büyük ölçüde Kuzey Amerika&apos;da
              1792&apos;den beri yayımlanan çiftçi almanağı <em>The Old Farmer&apos;s Almanac</em> aracılığıyla
              yaygınlaştı. Almanak bu isimleri Kuzey Amerika yerli halklarının, Avrupalı göçmenlerin ve eski Avrupa
              geleneklerinin adlarından derledi.
            </p>
            <p>
              Yerli halklar ay döngülerini mevsimleri izlemek için kullanırdı. Her dolunay, o dönemde doğada olan önemli
              bir şeyle anılırdı: kurtların uluması, karın en yoğun olduğu zaman, çileklerin olgunlaşması gibi. Aynı
              dolunayın farklı kabilelerde farklı adları vardı; bugün kullanılan liste, bunlardan yalnızca birkaçının
              bir araya getirilmiş halidir.
            </p>
            <p>
              Bu isimlerin gökbilimsel bir anlamı yoktur. &quot;Çilek Ayı&quot; ile &quot;Soğuk Ay&quot; arasında, ayın
              kendisi bakımından hiçbir fark yoktur. Ama dolunayları ayırt etmenin ve yılın döngüsünü hatırlamanın
              keyifli bir yoludur.
            </p>

            <h2>Türkçede ay ve dolunay</h2>
            <p>
              Türkçede her dolunaya ayrı bir ad verme geleneği yaygın değildir. Ama dilimizde dolunayla ilgili güzel bir
              deyim vardır: <strong>&quot;ayın on dördü gibi&quot;</strong>. Çok güzel, ışıl ışıl bir yüz için söylenir.
            </p>
            <p>
              Deyimin kaynağı Hicri takvimdir. Hicri aylar hilalle başladığı için ay, ayın 14. gecesinde dolunaya ulaşır
              ve en parlak haline gelir. Hicri ayın 13, 14 ve 15. günlerine bu yüzden &quot;beyaz günler&quot; anlamında
              eyyam-ı biyz denir. Dolunayın kendisi hakkında daha fazlası için{" "}
              <Link href={PAGES.dolunay.path}>Dolunay</Link> sayfasına, bu yılın bütün dolunayları için{" "}
              <Link href={PAGES.dolunayTarihleri.path}>2027 Dolunay Tarihleri</Link> sayfasına bakabilirsiniz.
            </p>

            <h2>Hasat Ayı neden özel?</h2>
            <p>
              Ay her gün ortalama 50 dakika geç doğar. Ama eylül ekinoksu civarında, akşam saatlerinde ayın gökyüzündeki
              yolu ufka çok yatık olduğu için bu gecikme kuzey yarımkürede birkaç gün boyunca 20-30 dakikaya iner. Ay
              birkaç akşam üst üste gün batımından hemen sonra doğar ve akşamlar alacakaranlıktan geceye kesintisiz
              aydınlık kalır. Elektriğin olmadığı zamanlarda bu, hasadı tamamlamak için paha biçilmez bir ışıktı.
            </p>
          </Prose>
          <ArticleFooter
            page={PAGE}
            headline="Dolunay İsimleri ve Anlamları"
            updated={UPDATED}
            sources={[
              { label: "NASA Science, Moon Phases", href: "https://science.nasa.gov/moon/moon-phases/" },
              { label: "The Old Farmer's Almanac, Full Moon Names", href: "https://www.almanac.com/full-moon-names" },
            ]}
          />
        </div>
      </main>
    </>
  );
}

/** İsim kartları: her isim için bir sonraki dolunay tarihi hesaplanır. Saatte bir yenilenir. */
async function NameCards() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const year = Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(now));
  const moons = [year, year + 1, year + 2].flatMap((y) => getFullMoonsOfYear(y));
  const names = nameFullMoons(moons, timeZone);
  const upcoming = moons.filter((m) => m.date > now);
  const nextFor = (name: string) => upcoming.find((m) => names.get(m.date.getTime()) === name);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const harvest = nextFor("Hasat Ayı");

  return (
    <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[...NAMES, { name: "Hasat Ayı", month: "Eylül ya da Ekim", meaning: SPECIAL[0].meaning }].map((n) => {
        const next = nextFor(n.name);
        return (
          <li key={n.name} className="flex gap-4 rounded-2xl bg-[#05070d] p-5 text-white">
            <span className="shrink-0">
              <MoonPhaseIcon phaseAngle={180} size={60} title={n.name} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">{n.month}</p>
              <p className="mt-0.5 text-xl font-semibold">{n.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-300">{n.meaning}</p>
              <p className="mt-3 text-sm">
                {next ? (
                  <>
                    <span className="text-zinc-400">Bir sonraki: </span>
                    <time dateTime={next.date.toISOString()} className="font-medium">
                      {date.format(next.date)}
                    </time>
                  </>
                ) : (
                  <span className="text-zinc-400">
                    Önümüzdeki yıllarda bu dolunay {harvest ? "Hasat Ayı" : "başka bir adla"} anılıyor.
                  </span>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
