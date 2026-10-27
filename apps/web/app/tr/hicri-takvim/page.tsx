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
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.hicriTakvim;
const UPDATED = "2026-10-27";
const timeZone = siteConfig.defaultLocation.timeZone;
/** Hilal tahmini Türkiye'nin ortasına yakın bir noktadan, Ankara'dan yapılır. */
const OBSERVER = findProvince("ankara")!;
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `Hicri Takvim Nedir? Hicri Aylar ve Ay Başları | ${siteConfig.name}`,
  description:
    "Hicri takvim nasıl işler, Hicri aylar neden her yıl 11 gün öne gelir, ay başları nasıl belirlenir? Hicri ayların adları ve önümüzdeki ay başlarının astronomik tahmini. Resmî tarihler için Diyanet takvimi esas alınmalıdır.",
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

function hijriMonthIndex(date: Date): number {
  const name = hijri({ month: "long" }).format(date);
  return MONTHS.indexOf(name);
}

export default function HijriCalendarPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={35}
        eyebrow="Hicri ve gelenek"
        lead="Hicri takvim bir ay takvimidir: her ay, yeni aydan sonra hilalin görülmesiyle başlar. Bu sayfada takvimin nasıl işlediğini ve önümüzdeki ay başlarının astronomik tahminini bulabilirsiniz."
        aside={<TodayHijri />}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>Hicri yıl 12 aydır ve 354 ya da 355 gün sürer; Miladi yıldan yaklaşık 11 gün kısadır.</li>
            <li>
              Bu yüzden Ramazan ve bayramlar her yıl yaklaşık 11 gün öne gelir, 33 yılda bütün mevsimleri dolaşır.
            </li>
            <li>
              Bu sayfadaki tarihler astronomik tahmindir.{" "}
              <strong>Resmî dinî günler için Diyanet takvimi esastır.</strong>
            </li>
          </QuickFacts>
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight sm:text-3xl">Hicri aylar</h2>
        <MonthList />

        <h2 className="mt-14 text-2xl font-semibold tracking-tight sm:text-3xl">
          Önümüzdeki ay başları (astronomik tahmin)
        </h2>
        <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
          Her yeni ay için, Ankara&apos;da gün batımında ayın ufuktan en az {CRESCENT_MIN_ALTITUDE}° yüksekte ve
          Güneş&apos;ten en az {CRESCENT_MIN_ELONGATION}° uzakta olduğu ilk akşam. Bu, hilalin görülmesinin astronomik
          olarak mümkün olduğu sınırdır; çok genç hilal çıplak gözle genellikle ertesi akşam görülür. Hicri gün akşamla
          başladığı için yeni ay, bu akşamı izleyen gündür.
        </p>
        <MonthStarts />
        <p className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          Bu tablo resmî bir takvim değildir. Türkiye&apos;de Ramazan, bayramlar ve kandiller gibi dinî günler Diyanet
          İşleri Başkanlığı&apos;nın takvimine göre belirlenir. Diyanet hilalin dünyanın herhangi bir yerinden
          görülebilmesine baktığı için resmî ay başı çoğu zaman bu tahminden bir gün öncedir.
        </p>

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

            <h2>Ay başı nasıl belirlenir?</h2>
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
                gösterilir. Ay adları, Suudi Arabistan&apos;ın kullandığı Ümmülkurâ takviminden alınmıştır.
              </li>
            </ul>
            <p>
              Ayın bugünkü durumunu <Link href={PAGES.bugunAy.path}>Bugün Ay Nasıl?</Link>, aylık görünümü{" "}
              <Link href={PAGES.ayTakvimi.path}>Ay Takvimi</Link> sayfasında görebilirsiniz.
            </p>
          </Prose>
          <ArticleFooter
            page={PAGE}
            headline="Hicri Takvim Nedir? Hicri Aylar ve Ay Başları"
            updated={UPDATED}
            sources={[
              {
                label: "Diyanet İşleri Başkanlığı, Dinî Günler",
                href: "https://vakithesaplama.diyanet.gov.tr/dini_gunler.php",
              },
              { label: "NASA Science, Moon Phases", href: "https://science.nasa.gov/moon/moon-phases/" },
            ]}
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

  const current = hijriMonthIndex(new Date());
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

/** Önümüzdeki 6 yeni ay için hilal ölçütünün karşılandığı ilk akşam. Saatte bir yenilenir. */
async function MonthStarts() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const newMoons = getUpcomingPrincipalPhases(new Date(now.getTime() - 3 * DAY_MS), 28)
    .filter((p) => p.key === "new-moon")
    .slice(0, 6);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const weekday = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, weekday: "long" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const nf = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 1 });

  return (
    <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {newMoons.map((nm) => {
        const evenings = getCrescentEvenings(nm.date, OBSERVER);
        const first = evenings.find((e) => e.meetsCriteria);
        const firstDay = first ? new Date(first.sunset.getTime() + 12 * 3_600_000) : null;
        const monthIndex = hijriMonthIndex(firstDay ?? new Date(nm.date.getTime() + 2 * DAY_MS));
        return (
          <li key={nm.date.toISOString()} className="flex gap-4 rounded-2xl bg-[#05070d] p-5 text-white">
            <span className="shrink-0">
              <MoonPhaseIcon phaseAngle={25} size={56} title="Hilal" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                {MONTHS[monthIndex] ?? ""} ayının başlangıcı
              </p>
              {firstDay ? (
                <>
                  <p className="mt-0.5 text-lg font-semibold">{date.format(firstDay)}</p>
                  <p className="text-sm text-zinc-300">
                    {weekday.format(firstDay)} (hilal ölçütü önceki akşam, {time.format(first!.sunset)})
                  </p>
                </>
              ) : (
                <p className="mt-0.5 text-lg font-semibold">Hesaplanamadı</p>
              )}
              <p className="mt-2 text-xs text-zinc-400">
                Yeni ay: {date.format(nm.date)} {time.format(nm.date)}
                {first && (
                  <>
                    {" "}
                    · Ay yaşı {Math.round(first.ageHours)} saat · yükseklik {nf.format(first.moonAltitude)}° · açı{" "}
                    {nf.format(first.elongation)}°
                  </>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
