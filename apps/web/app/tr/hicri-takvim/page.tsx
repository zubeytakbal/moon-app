import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  CRESCENT_MIN_ALTITUDE,
  CRESCENT_MIN_ELONGATION,
  findProvince,
  getCrescentEvenings,
  getUpcomingPrincipalPhases,
} from "@moon-app/moon";
import { Faq } from "@/components/Faq";
import { FAQS } from "@/lib/faqs";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { AnswerBox, DataTable } from "@/components/InfoTables";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import {
  fromHijri,
  getUpcomingReligiousDays,
  HIJRI_MONTHS,
  todayNoonUtc,
  toHijri,
  type ReligiousDay,
} from "@/lib/hijri-calendar";
import { MobileCollapse } from "@/components/MobileCollapse";
import { HijriConverter } from "@/components/HijriConverter";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.hicriTakvim;
const UPDATED = "2026-11-06";
const src = pageSources("diyanet2027", "diyanet2026", "diyanetAyTanim");
const timeZone = siteConfig.defaultLocation.timeZone;
/** Hilal tahmini Türkiye'nin ortasına yakın bir noktadan, Ankara'dan yapılır. */
const OBSERVER = findProvince("ankara")!;
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `Hicri Takvim: Dinî Günler, Kandiller, Hicri Miladi Çevirme | ${siteConfig.name}`,
  description:
    "Kandiller, Kadir Gecesi, Ramazan ve bayramlar ne zaman? Önümüzdeki 12 ayın dinî günleri, Hicri Miladi tarih çevirici. Yurt dışında da aynı gün mü? Resmî tarihler için Diyanet takvimi esas alınmalıdır.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

const MONTHS = [
  "Muharrem",
  "Safer",
  "Rebiülevvel",
  "Rebiülahir",
  "Cemaziyelevvel",
  "Cemaziyelahir",
  "Recep",
  "Şaban",
  "Ramazan",
  "Şevval",
  "Zilkade",
  "Zilhicce",
];

/** Ümmülkurâ takvimine göre Hicri tarih. Diyanet takvimiyle bir gün fark olabilir. */
const hijri = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("tr-TR-u-ca-islamic-umalqura", { timeZone, ...opts });


export default function HijriCalendarPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={35}
        eyebrow="Hicri"
        lead="Hicri takvim bir ay takvimidir: her ay, yeni aydan sonra hilalin görülmesiyle başlar. Bu sayfada takvimin nasıl işlediğini ve önümüzdeki ay başlarının astronomik tahminini bulabilirsiniz."
        aside={<TodayHijri />}
        updated={UPDATED}
      />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Bugün" },
          { href: "#dini-gunler", label: "Dinî günler" },
          { href: "#cevirici", label: "Çevirici" },
          { href: "#yurt-disi", label: "Yurt dışında" },
          { href: "#ay-baslari", label: "Ay başları" },
          { href: "#aylar", label: "Hicri aylar" },
          { href: "#ay-basi", label: "Ay başı nasıl belirlenir?" },
          { href: "#sss", label: "Sık sorulanlar" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <HijriAnswer />
        </div>

        <div className="mx-auto max-w-3xl">
          <ReligiousDays />
        </div>

        <div id="cevirici" className="mx-auto max-w-3xl scroll-mt-32">
          <HijriConverter />
        </div>

        <div className="mx-auto max-w-3xl">
          <AbroadDates />
        </div>

        <div className="mx-auto max-w-3xl">
          <h2 id="ay-baslari" className="mt-14 scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
            Önümüzdeki Hicri ay başları
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            İkinci sütun, Ümmülkurâ takvimine göre ayın ilk günüdür; Diyanet&apos;in 2027 dinî günleriyle karşılaştırdık,
            Ramazan, bayramlar ve kandiller aynı günlere düşüyor.{src.ref("diyanet2027")} Üçüncü sütun kendi astronomik
            tahminimizdir: Ankara&apos;da gün batımında ayın ufuktan en az {CRESCENT_MIN_ALTITUDE}° yüksekte ve
            Güneş&apos;ten en az {CRESCENT_MIN_ELONGATION}° uzakta olduğu ilk akşamı izleyen gün. Hicri gün akşamla
            başlar; ayın ilk gecesi, ilk günden önceki akşamdır.
          </p>
          <MonthStarts />
          <p className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            Bu tablo resmî bir takvim değildir. Türkiye&apos;de Ramazan, bayramlar ve kandiller gibi dinî günler Diyanet
            İşleri Başkanlığı&apos;nın takvimine göre belirlenir. Diyanet hilalin dünyanın herhangi bir yerinden
            görülebilmesine baktığı için resmî ay başı çoğu zaman Ankara tahmininden bir gün öncedir.
          </p>
        </div>

        <h2 id="aylar" className="mt-14 scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">Hicri aylar</h2>
        <MonthList />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Hicri takvim nedir?</h2>
            <p>
              Hicri takvim, Hz. Muhammed&apos;in Mekke&apos;den Medine&apos;ye hicretini (622) başlangıç kabul eden bir
              ay takvimidir. Bu başlangıç, Hz. Ömer döneminde belirlenmiştir. Takvimdeki her ay, ayın bir evre döngüsüne
              karşılık gelir ve 29 ya da 30 gün sürer.
            </p>
            <p>
              Miladi takvim ise Güneş&apos;e göre işler ve yılı mevsimlerle uyumlu tutar. Hicri takvimde mevsimlere göre
              bir düzeltme yapılmaz. Bu yüzden Hicri aylar Miladi takvime göre her yıl yaklaşık 11 gün öne kayar;
              Ramazan kimi yıllar yaza, kimi yıllar kışa denk gelir.
            </p>

            <h2>Hicri günler akşam başlar</h2>
            <p>
              Hicri takvimde gün, gün batımıyla başlar. Bu yüzden bir Hicri ayın ilk gecesi, Miladi takvimdeki ilk
              gününden önceki akşamdır. Kandil gecelerinin, kandil gününden önceki akşama denk gelmesinin nedeni budur.
            </p>

            <h2 id="ay-basi">Ay başı nasıl belirlenir?</h2>
            <p>
              Astronomik <Link href={PAGES.yeniAy.path}>yeni ay</Link>, ayın Güneş ile aynı boylama geldiği andır ve
              gözle görülmez. Hicri ay ise yeni aydan sonra ince <Link href={PAGES.hilal.path}>hilalin</Link>{" "}
              görülebilmesiyle başlar. Hilalin görülebilmesi için ayın Güneş&apos;ten yeterince uzaklaşmış ve gün
              batımından sonra ufkun üzerinde kalıyor olması gerekir.
            </p>
            <p>
              Ay başını belirlemenin iki yolu vardır. Bazı ülkeler hilalin gözle görülmesini (rüyet) esas alır. Türkiye
              ise astronomik hesaba dayanan bir takvim kullanır: Diyanet, 2016&apos;da İstanbul&apos;da toplanan
              Uluslararası Hicri Takvim Birliği Kongresi&apos;nde kabul edilen ölçütleri uygular. Bu ölçütler hilalin
              yalnızca Türkiye&apos;den değil, dünyanın herhangi bir yerinden görülebilir olmasına bakar. Bu yüzden
              Türkiye&apos;deki resmî ay başı, bu sayfadaki Ankara&apos;ya göre yapılan tahminden çoğu zaman bir gün
              öncedir. Farklı ülkelerde bayramın farklı günlerde kutlanmasının nedeni de bu yöntem farklarıdır.
            </p>

            <h2>Bu sayfadaki tahmin nasıl yapılıyor?</h2>
            <ul>
              <li>Her yeni ayın anı ve sonraki akşamlarda Ankara&apos;daki gün batımı saati hesaplanır.</li>
              <li>
                Gün batımı anında ayın ufuktan yüksekliği ve Güneş ile arasındaki açı bulunur. Ay, Güneş&apos;ten önce
                batıyorsa hilal o akşam görülemez.
              </li>
              <li>
                Yükseklik en az {CRESCENT_MIN_ALTITUDE}°, açı en az {CRESCENT_MIN_ELONGATION}° olan ilk akşam, tabloda
                &quot;Ankara&apos;dan hilal tahmini&quot; sütununda gösterilir.
              </li>
              <li>
                Ayın ilk günü ve bayram tarihleri Suudi Arabistan&apos;ın kullandığı Ümmülkurâ takviminden alınır. Bu
                takvim de astronomik hesaba dayanır ve 2027 için Diyanet&apos;in ilan ettiği günlerle örtüşür.
              </li>
            </ul>
            <p>
              Ayın bugünkü durumunu <Link href={PAGES.bugunAy.path}>Bugün Ay Nasıl?</Link>, aylık görünümü{" "}
              <Link href={PAGES.ayTakvimi.path}>Ay Takvimi</Link> sayfasında görebilirsiniz.
            </p>
          </Prose>
          <Faq items={FAQS.hicriTakvim} />
          <ArticleFooter
            page={PAGE}
            headline="Hicri Takvim Nedir? Hicri Aylar ve Ay Başları"
            updated={UPDATED}
            src={src}
          />
        </div>
      </main>
    </>
  );
}

/** Bugünün yaklaşık Hicri tarihi. */
async function TodayHijri() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  return (
    <div className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-zinc-400">Bugün, yaklaşık</p>
      <p className="mt-1 text-2xl font-semibold">
        {hijri({ day: "numeric", month: "long" }).format(now)}{" "}
        {hijri({ year: "numeric" }).format(now).replace(/\D/g, "")}
      </p>
      <p className="mt-1 text-sm text-zinc-300">Ümmülkurâ takvimine göre. Diyanet takvimiyle bir gün fark olabilir.</p>
    </div>
  );
}

async function MonthList() {
  "use cache";
  cacheLife("hours");

  const current = toHijri(new Date(), timeZone).month - 1;
  return (
    <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {MONTHS.map((m, i) => (
        <li
          key={m}
          className={`rounded-xl px-4 py-3 ${
            i === current
              ? "bg-[#05070d] text-white ring-2 ring-indigo-400"
              : "border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          }`}
        >
          <span className="text-xs tabular-nums text-zinc-500">{i + 1}. ay</span>
          <span className="block font-semibold">{m}</span>
          {i === current && <span className="text-xs text-indigo-300">Şu anki ay</span>}
          {m === "Ramazan" && i !== current && <span className="text-xs text-zinc-500">Oruç ayı</span>}
        </li>
      ))}
    </ol>
  );
}

/** Hicri tarihin Miladi karşılığı ("8 Şubat 2027 Pazartesi"). `fromHijri` günün ortasını (UTC) döndürür. */
const miladi = new Intl.DateTimeFormat(siteConfig.locale, {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
});

/** Bugünden sonraki ilk (ay, gün) Hicri tarihi: bu yıl geçtiyse gelecek yıl. */
function nextHijri(month: number, day: number, now: Date): { year: number; date: Date | null } {
  const t = toHijri(now, timeZone);
  const passed = t.month > month || (t.month === month && t.day >= day);
  const year = passed ? t.year + 1 : t.year;
  return { year, date: fromHijri(year, month, day) };
}

/** Sayfanın sorusunun cevabı, en üstte (timeanddate düzeni): bugünün Hicri tarihi ve önemli günler. Saatte bir yenilenir. */
async function HijriAnswer() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const t = toHijri(now, timeZone);
  const today = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const fmt = (x: { year: number; date: Date | null }, label: string) =>
    x.date ? `${miladi.format(x.date)} (${label} ${x.year})` : "Hesaplanamadı";
  const nextMonth = t.month === 12 ? { year: t.year + 1, month: 1 } : { year: t.year, month: t.month + 1 };
  const nextStart = fromHijri(nextMonth.year, nextMonth.month, 1);
  const inRamadan = t.month === 9;
  const nextDay = getUpcomingReligiousDays(now, timeZone)[0];

  return (
    <AnswerBox
      question="Bugün Hicri takvime göre ayın kaçı?"
      answer={`Bugün (${today.format(now)}) Hicri takvime göre ${t.day} ${t.monthName} ${t.year}.`}
      rows={[
        {
          label: `${HIJRI_MONTHS[nextMonth.month - 1]} ayının başı`,
          value: nextStart ? miladi.format(nextStart) : "Hesaplanamadı",
        },
        ...(nextDay
          ? [
              {
                label: "Sıradaki dinî gün",
                value: (
                  <>
                    {nextDay.name}: {dayText(nextDay)}{" "}
                    <a href="#dini-gunler" className="underline underline-offset-2">
                      Bütün liste
                    </a>
                  </>
                ),
              },
            ]
          : []),
        {
          label: "Ramazan başlangıcı",
          value: inRamadan ? `Şu an Ramazan ayındayız (${t.day}. gün).` : fmt(nextHijri(9, 1, now), "1 Ramazan"),
        },
        { label: "Ramazan Bayramı (1. gün)", value: fmt(nextHijri(10, 1, now), "1 Şevval") },
        { label: "Kurban Bayramı (1. gün)", value: fmt(nextHijri(12, 10, now), "10 Zilhicce") },
        { label: "Hicri yılbaşı", value: fmt(nextHijri(1, 1, now), "1 Muharrem") },
        {
          label: "Almanya'da ve yurt dışında aynı gün mü?",
          value: (
            <>
              Diyanet&apos;in ilan ettiği tarih bütün dünya için tektir; Almanya&apos;da, Hollanda&apos;da ya da
              Fransa&apos;da da aynı gündür.{src.ref("diyanetAyTanim")} Bulunduğunuz yerdeki cami ya da ülkenin dinî
              kurumu başka bir yöntem izliyorsa bir gün fark olabilir.{" "}
              <a href="#yurt-disi" className="underline underline-offset-2">
                Ayrıntılar
              </a>
            </>
          ),
        },
      ]}
      note={
        <>
          Ümmülkurâ takvimine göre; 2027 için Diyanet&apos;in ilan ettiği günlerle aynı.{src.ref("diyanet2027")} Hicri gün
          akşam başlar. <strong>Resmî dinî günler için Diyanet İşleri Başkanlığı&apos;nın takvimi esastır.</strong>
        </>
      }
    />
  );
}

/**
 * "Ramazan ve bayramlar yurt dışında ne zaman?": önümüzdeki Ramazan ve bayram tarihleri, ilk gece ve son oruç günüyle.
 * Yurt dışındaki Türklerin ülke ve şehir adıyla sorduğu "ramazan ne zaman başlıyor / bitiyor, bayram ne zaman"
 * aramalarının cevabı. Namaz ve imsak vakti verilmez (kapsam dışı). Günde bir yenilenir.
 */
async function AbroadDates() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const ramadan = nextHijri(9, 1, now);
  const t = toHijri(now, timeZone);
  // Şu an Ramazan'daysak bu Ramazan'ın sonu ve bayramı; değilse sıradaki Ramazan'ınki.
  const ramadanYear = t.month === 9 ? t.year : ramadan.year;
  const start = fromHijri(ramadanYear, 9, 1);
  const eid = fromHijri(ramadanYear, 10, 1);
  const kurban = nextHijri(12, 10, now);
  const dayBefore = (d: Date | null) => (d ? new Date(d.getTime() - DAY_MS) : null);
  const dm = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: "UTC", day: "numeric", month: "long" });
  const show = (d: Date | null) => (d ? miladi.format(d) : "Hesaplanamadı");

  return (
    <section aria-labelledby="yurt-disi" className="mt-14">
      <h2 id="yurt-disi" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Ramazan ve bayramlar yurt dışında ne zaman?
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Almanya, Hollanda, Belçika, Fransa, Avusturya, İsviçre, İngiltere, Bulgaristan, KKTC ya da başka bir ülkede
        yaşayanlar için önümüzdeki Ramazan ve bayram tarihleri, Diyanet takvimine göre.
      </p>
      <DataTable
        columns={["Gün", "Tarih", "Not"]}
        rows={[
          {
            key: "ramazan",
            cells: [
              "Ramazan'ın ilk günü (ilk oruç)",
              show(start),
              start ? `İlk gece (teravih ve ilk sahur): ${dm.format(dayBefore(start)!)} akşamı` : "",
            ],
          },
          { key: "son-oruc", cells: ["Son oruç günü", show(dayBefore(eid)), "Ramazan 29 ya da 30 gün sürer"] },
          {
            key: "ramazan-bayrami",
            cells: [
              "Ramazan Bayramı (1. gün)",
              show(eid),
              eid ? `Bayram 3 gün: ${dm.format(eid)} - ${dm.format(new Date(eid.getTime() + 2 * DAY_MS))}` : "",
            ],
          },
          {
            key: "kurban-bayrami",
            cells: [
              "Kurban Bayramı (1. gün)",
              show(kurban.date),
              kurban.date ? `Arefe: ${dm.format(dayBefore(kurban.date)!)}; bayram 4 gün` : "",
            ],
          },
        ]}
      />
      <Prose>
        <p>
          Diyanet İşleri Başkanlığı Hicri ayların, hilalin dünyanın herhangi bir yerinden ilk kez görülmesiyle
          başladığını esas alır.{src.ref("diyanetAyTanim")} Bu yüzden Diyanet&apos;in açıkladığı tarih bir ülkeye özgü
          değildir: Türkiye&apos;de Ramazan hangi gün başlıyorsa, bu takvimi izleyen biri için Almanya&apos;da,
          Hollanda&apos;da ya da Kıbrıs&apos;ta da o gün başlar. Tablodaki tarihler Ümmülkurâ hesabından gelir ve
          Diyanet&apos;in 2027 dinî günler listesiyle birebir aynıdır.{src.ref("diyanet2027")}
        </p>
        <p>
          Yaşadığınız ülkede herkes aynı günde başlamayabilir. Bazı camiler ve topluluklar hilalin o ülkeden gözle
          görülmesini, bazıları başka bir ülkenin ilanını esas alır; bu durumda Ramazan ya da bayram bir gün sonra
          başlayabilir. Azerbaycan, Irak ve Bulgaristan gibi ülkelerde tarihleri o ülkenin kendi dinî kurumu ilan eder.
          Bu yüzden <strong>kesin tarih için bağlı olduğunuz camiye ya da derneğe danışın.</strong> Hilalin
          bulunduğunuz şehirden astronomik olarak görülüp görülemeyeceğini{" "}
          <Link href={PAGES.hilalGozlemi.path}>Hilal Gözlemi</Link> sayfasında hesaplayabilirsiniz.
        </p>
      </Prose>
    </section>
  );
}

/** "Ramazan başlangıcı", "Kurban Bayramı 1. gün: …" gibi kısa notlar. */
function monthNote(year: number, month: number): string {
  if (month === 1) return "Hicri yılbaşı";
  if (month === 9) return "Ramazan başlangıcı";
  if (month === 10) return "Ramazan Bayramı 1. gün";
  if (month === 12) {
    const kurban = fromHijri(year, 12, 10);
    return kurban ? `Kurban Bayramı 1. gün: ${miladi.format(kurban)}` : "";
  }
  return "";
}

/** Gün numarası (karşılaştırma için): Türkiye tarihine göre. */
function dayNumber(date: Date, zone: string): number {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(date)
    .split("-")
    .map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

/**
 * Önümüzdeki 6 Hicri ayın başı (timeanddate tablo düzeni): Ümmülkurâ'ya göre ilk gün ve Ankara'dan hilal tahmini.
 * Saatte bir yenilenir.
 */
async function MonthStarts() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const t = toHijri(now, timeZone);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });

  const rows = Array.from({ length: 6 }, (_, i) => {
    const index = t.month - 1 + i + 1;
    const year = t.year + Math.floor(index / 12);
    const month = (index % 12) + 1;
    const start = fromHijri(year, month, 1);
    let estimate: Date | null = null;
    if (start) {
      const newMoon = getUpcomingPrincipalPhases(new Date(start.getTime() - 6 * DAY_MS), 8)
        .filter((p) => p.key === "new-moon" && p.date.getTime() < start.getTime() + DAY_MS)
        .pop();
      const first = newMoon ? getCrescentEvenings(newMoon.date, OBSERVER).find((e) => e.meetsCriteria) : undefined;
      estimate = first ? new Date(first.sunset.getTime() + 12 * 3_600_000) : null;
    }
    const diff = start && estimate ? dayNumber(estimate, timeZone) - dayNumber(start, "UTC") : null;
    return { key: `${year}-${month}`, year, month, start, estimate, diff };
  });

  return (
    <DataTable
      columns={["Hicri ay", "1. günü (Ümmülkurâ)", "Ankara'dan hilal tahmini", "Not"]}
      highlight={rows.find((r) => r.month === 9)?.key}
      rows={rows.map((r) => ({
        key: r.key,
        cells: [
          <span key="a" className="whitespace-nowrap">
            {HIJRI_MONTHS[r.month - 1]} {r.year}
          </span>,
          <span key="u" className="font-medium">
            {r.start ? miladi.format(r.start) : "-"}
          </span>,
          <span key="e">
            {r.estimate ? date.format(r.estimate) : "-"}
            {r.diff !== null && (
              <span className="block text-sm text-zinc-500">
                {r.diff === 0 ? "aynı gün" : r.diff > 0 ? `${r.diff} gün sonra` : `${-r.diff} gün önce`}
              </span>
            )}
          </span>,
          <span key="n" className="text-zinc-600 dark:text-zinc-400">
            {monthNote(r.year, r.month)}
          </span>,
        ],
      }))}
    />
  );
}

const dayMonth = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: "UTC", day: "numeric", month: "long" });

/** "5 Mart 2027 Cuma akşamı", bayramlarda "9-11 Mart 2027 (Salı-Perşembe)". */
function dayText(r: ReligiousDay): string {
  if (r.kind === "gece") return `${miladi.format(r.date)} akşamı`;
  if (r.days === 1) return miladi.format(r.date);
  const last = new Date(r.date.getTime() + (r.days - 1) * DAY_MS);
  const wd = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: "UTC", weekday: "long" });
  const year = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: "UTC", year: "numeric" });
  const sameMonth = r.date.getUTCMonth() === last.getUTCMonth();
  const range = sameMonth
    ? `${r.date.getUTCDate()}-${dayMonth.format(last)}`
    : `${dayMonth.format(r.date)} - ${dayMonth.format(last)}`;
  return `${range} ${year.format(last)} (${wd.format(r.date)}-${wd.format(last)})`;
}

/**
 * Önümüzdeki 12 ayın dinî günleri (kandiller, Kadir Gecesi, Ramazan, arefeler, bayramlar, Hicri yılbaşı, Aşure).
 * "Kadir gecesi ne zaman", "kandil ne zaman" aramalarının cevabı. Yalnız tarih verilir; dua, ibadet ya da hüküm yok.
 * Adres parametresi okumaz, bu yüzden tablo HTML'de tam durur. Saatte bir yenilenir (sıradaki vurgusu kayar).
 */
async function ReligiousDays() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const days = getUpcomingReligiousDays(now, timeZone);
  const today = todayNoonUtc(now, timeZone);
  const left = (r: ReligiousDay) => {
    const n = Math.round((r.date.getTime() - today) / DAY_MS);
    if (n < 0) return "Sürüyor";
    if (n === 0) return r.kind === "gece" ? "Bu akşam" : "Bugün";
    if (n === 1) return r.kind === "gece" ? "Yarın akşam" : "Yarın";
    return `${n} gün`;
  };
  const SHOWN = 6;

  return (
    <section aria-labelledby="dini-gunler" className="mt-14">
      <h2 id="dini-gunler" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Dinî günler: kandiller ve bayramlar ne zaman?
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Önümüzdeki 12 ayın kandilleri, Kadir Gecesi, Ramazan ve bayramlar. Tarihler Ümmülkurâ takvimiyle hesaplanır;
        Diyanet&apos;in 2026 ve 2027 dinî günler listeleriyle karşılaştırdık, hepsi aynı güne düşüyor.
        {src.ref("diyanet2027")}
        {src.ref("diyanet2026")}
      </p>
      <MobileCollapse hiddenCount={Math.max(0, days.length - SHOWN)} noun="dinî gün" className="mt-6">
        <DataTable
          columns={["Dinî gün", "Tarih", "Hicri tarih", "Kalan"]}
          highlight={days[0]?.id}
          extra={(key) => days.findIndex((d) => d.id === key) >= SHOWN}
          rows={days.map((r) => ({
            key: r.id,
            cells: [
              r.name,
              r.kind === "gece" ? (
                <>
                  {dayText(r)}
                  <span className="block text-xs text-zinc-500">
                    {dayMonth.format(new Date(r.date.getTime() + DAY_MS))} sabahına bağlayan gece
                  </span>
                </>
              ) : (
                dayText(r)
              ),
              `${r.hijri.day} ${HIJRI_MONTHS[r.hijri.month - 1]} ${r.hijri.year}`,
              left(r),
            ],
          }))}
        />
      </MobileCollapse>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Hicri gün akşam güneş batınca başlar. Bu yüzden kandiller ve Kadir Gecesi, tabloda yazan günün akşamıdır: örneğin
        Kadir Gecesi Ramazan&apos;ın 26. gününü 27. gününe bağlayan gecedir. Regaip Kandili, Recep ayının ilk Cuma
        gününden önceki Perşembe akşamıdır. Ramazan&apos;ın ilk sahuru da ilk günden önceki gecededir.
      </p>
      <p className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
        Bu liste bilgi amaçlıdır. Türkiye&apos;de dinî günler Diyanet İşleri Başkanlığı&apos;nın takvimine göre
        belirlenir; resmî tarih için{" "}
        <a href="https://vakithesaplama.diyanet.gov.tr/dini_gunler.php" className="underline underline-offset-2" rel="noopener">
          Diyanet&apos;in dinî günler sayfasına
        </a>{" "}
        bakın.
      </p>
    </section>
  );
}
