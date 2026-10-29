import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { getFullMoonsOfYear, zonedTimeToUtc } from "@moon-app/moon";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter, NextPrincipal, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { ShareButton } from "@/components/ShareButton";
import { nameFullMoons, nearestNamedFullMoon } from "@/lib/full-moon-names";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.dolunayIsimleri;
const UPDATED = "2026-10-29";
const timeZone = siteConfig.defaultLocation.timeZone;

export const metadata: Metadata = {
  title: `Dolunay İsimleri ve Anlamları: Kurt Ayı, Çilek Ayı, Hasat Ayı | ${siteConfig.name}`,
  description:
    "Her ayın dolunayının geleneksel adı ve anlamı: Kurt Ayı, Kar Ayı, Solucan Ayı, Pembe Ay, Çiçek Ayı, Çilek Ayı, Hasat Ayı, Avcı Ayı, Soğuk Ay ve diğerleri. İsimlerin kökeni ve bir sonraki tarihleri.",
  // Girilen doğum tarihi (?tarih=...) ayrı sayfa sayılmasın.
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

export default function FullMoonNamesPage({ searchParams }: PageProps<"/tr/dolunay-isimleri">) {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={180}
        eyebrow="Takvim"
        lead="Her ayın dolunayının bir adı vardır: Kurt Ayı, Çilek Ayı, Hasat Ayı... Bu adlar nereden geliyor, ne anlama geliyor ve bir sonraki ne zaman?"
        aside={<NextPrincipal phase="full-moon" />}
      />
      <section className="bg-[#05070d] text-white" aria-labelledby="dogum-dolunayi">
        <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <h2 id="dogum-dolunayi" className="text-xl font-semibold">
              Doğum dolunayınızın adı ne?
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Doğum tarihinizi girin; doğumunuza en yakın dolunayın geleneksel adını ve anlamını görün.
            </p>
            <Suspense fallback={<BirthMoonForm />}>
              <BirthMoonTool searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
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

            <h2>Doğum dolunayı nasıl bulunuyor?</h2>
            <p>
              Sayfanın başındaki araç, doğum tarihinize en yakın dolunayı bulur; bu dolunay doğumunuzdan birkaç gün önce
              ya da sonra olabilir. Adı, o yılın bütün dolunaylarına bakılarak verilir: eylül ekinoksuna en yakın dolunay
              Hasat Ayı, ondan sonraki Avcı Ayı, aynı takvim ayına düşen ikinci dolunay Mavi Ay olur. Bu yüzden aynı gün
              doğan iki kişinin doğum yılı farklıysa dolunaylarının adı da farklı olabilir.
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

/* ---------- Araç: doğum dolunayının adı ---------- */

function parseBirthDate(tarih: unknown): { year: number; month: number; day: number } | null {
  if (typeof tarih !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarih);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (year < 1900 || year > 2100 || month < 1 || month > 12) return null;
  if (day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;
  return { year, month, day };
}

async function BirthMoonTool({ searchParams }: Pick<PageProps<"/tr/dolunay-isimleri">, "searchParams">) {
  const { tarih } = await searchParams;
  const input = parseBirthDate(tarih);
  const invalid = typeof tarih === "string" && tarih !== "" && !input;
  return (
    <>
      <BirthMoonForm value={input ? (tarih as string) : ""} />
      {invalid && (
        <p className="mt-4 text-amber-300">Bu tarih anlaşılamadı. Lütfen 1900 ile 2100 arasında bir tarih seçin.</p>
      )}
      {input && <BirthMoonResult {...input} />}
    </>
  );
}

function BirthMoonForm({ value = "" }: { value?: string }) {
  return (
    <Form action={PAGE.path} scroll={false} className="mt-5 flex flex-wrap items-end gap-3">
      <label className="flex min-w-44 flex-1 flex-col gap-1 text-sm text-zinc-300 sm:max-w-xs">
        Doğum tarihi
        <input
          type="date"
          name="tarih"
          required
          min="1900-01-01"
          max="2100-12-31"
          defaultValue={value}
          key={value}
          className="rounded-xl border border-white/15 bg-[#0d111c] px-3 py-2.5 text-base text-white [color-scheme:dark]"
        />
      </label>
      <button
        type="submit"
        className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
      >
        Dolunayımı bul
      </button>
    </Form>
  );
}

/** Doğum tarihine en yakın dolunay ve adı. Sonuç tarihe bağlıdır, önbellekte uzun tutulur. */
async function BirthMoonResult({ year, month, day }: { year: number; month: number; day: number }) {
  "use cache";
  cacheLife("weeks");

  const birth = zonedTimeToUtc(year, month, day, 12, timeZone);
  const moon = nearestNamedFullMoon(birth, timeZone);
  const info = [...NAMES, ...SPECIAL].find((n) => n.name === moon.name);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const days = Math.round(Math.abs(moon.diffDays));
  const when =
    days === 0
      ? "Doğduğunuz gün dolunaydı."
      : `Doğumunuzdan ${days} gün ${moon.diffDays > 0 ? "sonra" : "önce"}, ${date.format(moon.date)} tarihindeki dolunay.`;

  return (
    <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-5 sm:flex-row sm:items-center">
      <div className="shrink-0 self-center">
        <MoonPhaseIcon phaseAngle={180} size={96} glow title={moon.name ?? "Dolunay"} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-amber-200/80">Doğum dolunayınız</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{moon.name ?? "Dolunay"}</p>
        <p className="mt-1 text-sm text-zinc-400">{when}</p>
        {info && <p className="mt-3 text-zinc-200">{info.meaning}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ShareButton
            title={PAGE.title}
            text={`Doğum dolunayım: ${moon.name ?? "Dolunay"} (${date.format(moon.date)}).`}
          />
          <Link
            href={`${PAGES.dogdugumGun.path}?tarih=${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`}
            rel="nofollow"
            className="text-sm text-indigo-300 underline hover:text-indigo-200"
          >
            Doğduğunuz gün ay nasıldı?
          </Link>
        </div>
      </div>
    </div>
  );
}
