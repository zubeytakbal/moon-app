import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import {
  AURORA_DESTINATIONS,
  findPlace,
  geomagneticLatitude,
  getAuroraNight,
  getDarkMinutes,
  getUpcomingPrincipalPhases,
  localDateParts,
  type AuroraNight,
} from "@moon-app/moon";
import { AnswerBox, DataTable } from "@/components/InfoTables";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Byline } from "@/components/Byline";
import { Faq } from "@/components/Faq";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { FAQS } from "@/lib/faqs";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.kuzeyIsiklari;
const UPDATED = "2026-11-04";
const src = pageSources("noaaAurora", "noaaScales", "nasaMay2024Storm", "nasaAuroraSpacePlace", "noaaOvation", "ncieGeomagneticPoles");
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;
/** Mevsim tablosundaki aylar (karanlık mevsim ve çevresi): Ağustos'tan Nisan'a. */
const SEASON_MONTHS = [8, 9, 10, 11, 12, 1, 2, 3, 4];
const MONTH_NAMES = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const MONTH_LONG = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const RATING = {
  "cok-iyi": { text: "Çok iyi", cls: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200" },
  iyi: { text: "İyi", cls: "bg-lime-100 text-lime-900 dark:bg-lime-900/40 dark:text-lime-200" },
  "ay-isigi": { text: "Ay ışığı soldurur", cls: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" },
  "karanlik-yok": { text: "Gece kararmıyor", cls: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
} as const;

export const metadata: Metadata = {
  title: `Kuzey Işıkları Nerede, Ne Zaman Görülür? Gezi Planlayıcı | ${siteConfig.name}`,
  description:
    "Kuzey ışıkları hangi ülkede, hangi aylarda görülür? Tromsø, Laponya, Abisko, İzlanda için gece gece karanlık ve ay ışığı planlayıcı, bu kışın en iyi geceleri. Türkiye'den görülür mü, nasıl oluşur, neden yeşil?",
  // Yer ve ay seçimi (?yer=, ?ay=) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

const hours = (minutes: number) => `${(Math.round(minutes / 6) / 10).toLocaleString("tr-TR")} sa`;

/** Planlayıcı için varsayılan ay: karanlık mevsimdeysek bu ay, yazdaysak gelecek Eylül. */
function defaultMonth(now: Date): { year: number; month: number } {
  const p = localDateParts(now, timeZone);
  if (p.month >= 5 && p.month <= 8) return { year: p.year, month: 9 };
  return { year: p.year, month: p.month };
}

function parseMonth(value: unknown): { year: number; month: number } | null {
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [year, month] = [Number(m[1]), Number(m[2])];
  return year >= 2000 && year <= 2100 && month >= 1 && month <= 12 ? { year, month } : null;
}

/** Önümüzdeki karanlık dönemler: yeni ayın 4 gün öncesinden 4 gün sonrasına (ay ışığı yok ya da çok az). */
function darkWindows(from: Date, count: number) {
  return getUpcomingPrincipalPhases(from, 40)
    .filter((p) => p.key === "new-moon")
    .filter((p) => {
      const m = localDateParts(p.date, timeZone).month;
      return m >= 9 || m <= 3;
    })
    .slice(0, count)
    .map((p) => ({ newMoon: p.date, start: new Date(p.date.getTime() - 4 * DAY_MS), end: new Date(p.date.getTime() + 4 * DAY_MS) }));
}

export default function AuroraPage({ searchParams }: PageProps<"/tr/kuzey-isiklari">) {
  return (
    <>
      <Hero />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Nerede, ne zaman?" },
          { href: "#planlayici", label: "Gezi planlayıcı" },
          { href: "#mevsim", label: "Hangi aylarda?" },
          { href: "#turkiye", label: "Türkiye'den" },
          { href: "#nasil-olusur", label: "Nasıl oluşur?" },
          { href: "#ipuclari", label: "İpuçları" },
          { href: "#sss", label: "Sık sorulanlar" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <AuroraAnswer />
        </div>

        <Suspense fallback={<Planner slug="tromso" monthKey={null} />}>
          <SelectedPlanner searchParams={searchParams} />
        </Suspense>

        <SeasonTable />

        <div className="mx-auto max-w-3xl">
          <TurkeySection />
          <Prose>
            <h2 id="nasil-olusur">Kuzey ışıkları nasıl oluşur?</h2>
            <p>
              Güneş, uzaya sürekli olarak elektrik yüklü parçacıklar savurur (Güneş rüzgârı); zaman zaman da büyük
              patlamalarla bunun çok daha güçlüsünü gönderir. Bu parçacıkların bir kısmı Dünya&apos;nın manyetik alanına
              takılır, enerji kazanır ve kutuplara yakın bölgelerde manyetik alan çizgileri boyunca atmosfere iner.
              {src.ref("nasaAuroraSpacePlace")} Atmosferin üst katmanlarındaki gazlara çarptıklarında bu gazlar ışık
              verir. Işıklar yerden 80 ila 500 kilometre yükseklikte oluşur.{src.ref("noaaAurora")}
            </p>
            <AuroraDiagram />
            <p>
              Renkleri, çarpılan gaz belirler: oksijen yeşil ve kırmızı, azot mavi ve mor ışık verir.
              {src.ref("nasaAuroraSpacePlace")} En sık görülen renk yeşildir; çok güçlü fırtınalarda üst kısımda kırmızı,
              alt kenarda mor tonlar belirir. Işıkların kutuplarda toplanmasının nedeni, manyetik alanın parçacıkları
              oraya yönlendirmesidir. Bu yüzden ışıklar Kuzey Kutbu&apos;nun çevresinde halka biçimli bir bölgede, yaklaşık
              60 ile 75 derece enlemleri arasında en sık görülür.{src.ref("noaaAurora")} Aynı olay güney yarımkürede de
              yaşanır; ona güney ışıkları (aurora australis) denir.
            </p>

            <h2 id="ipuclari">Kuzey ışıklarını görme ipuçları</h2>
            <ul>
              <li>
                <strong>Karanlık mevsimde gidin.</strong> Kutup bölgesinde mayıs-ağustos arasında gece hiç kararmaz;
                ışıklar olsa da görülmez.{src.ref("noaaAurora")} Eylül-mart arası doğru zamandır.
              </li>
              <li>
                <strong>Ay ışığına dikkat edin.</strong> Dolunay gökyüzünü aydınlatır ve soluk ışıkları siler.
                Yukarıdaki planlayıcıda ayın gökyüzünde olmadığı geceler &quot;çok iyi&quot; işaretlidir; gezinizi
                mümkünse yeni ay dönemine denk getirin.
              </li>
              <li>
                <strong>Şehir ışıklarından uzaklaşın ve kuzeye bakın.</strong> Işıklar genellikle kuzey ufkunda başlar,
                güçlendikçe gökyüzüne yayılır. Hareketlenme çoğu zaman akşamın geç saatlerinde, gece yarısına doğru
                artar.{src.ref("noaaAurora")}
              </li>
              <li>
                <strong>Bulut en büyük engeldir.</strong> Gökyüzü kapalıysa en güçlü fırtınada bile bir şey görülmez.
                Birkaç gece kalmak ve hava tahminini izlemek şansı artırır.
              </li>
              <li>
                <strong>&quot;Bu gece görülecek mi?&quot;</strong> sorusunun cevabı uzay havasına bağlıdır ve günler
                önceden kesin bilinemez. Resmî kısa süreli tahmin için NOAA&apos;nın kuzey ışıkları tahmin haritasına
                bakın.{src.ref("noaaOvation")}
              </li>
              <li>
                <strong>Gözle fotoğraftaki gibi görünmez.</strong> Fotoğraf makinesi ve telefon uzun pozlamayla ışığı
                biriktirir; soluk ışıklar gözle grimsi yeşil bir bulut gibi, fotoğrafta ise canlı yeşil görünür. Güçlü
                ışıklar ise gözle de rengiyle ve hareketiyle görülür.
              </li>
            </ul>
            <p>
              Yeni ay tarihlerini <Link href={PAGES.yeniayTarihleri.path}>Yeniay Tarihleri</Link>, kuzey ülkelerinde
              gün uzunluğunu <Link href={PAGES.gunDogumuBatimi.path}>Gün Doğumu ve Gün Batımı</Link> sayfasında
              bulabilirsiniz.
            </p>
          </Prose>
          <Faq items={FAQS.kuzeyIsiklari} />
          <ArticleFooter
            page={PAGE}
            headline="Kuzey Işıkları Nerede, Ne Zaman Görülür? Gezi Planlayıcı"
            updated={UPDATED}
            src={src}
          />
        </div>
      </main>
    </>
  );
}

/** Giriş: bu kışın sıradaki karanlık dönemi (yeni ay ±4 gün). Günde bir yenilenir. */
async function Hero() {
  "use cache";
  cacheLife("days");

  const [next] = darkWindows(new Date(Date.now() - 4 * DAY_MS), 1);
  const dm = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" });
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#06231c] to-[#05070d] text-white">
      <AuroraGlow />
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 pt-6 md:pb-20">
        <Breadcrumb page={PAGE} tone="dark" />
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Gökyüzü takvimi</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-7xl">{PAGE.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-zinc-200">
          Hangi ülkede, hangi ayda, hangi gece? Gideceğiniz yeri seçin; karanlık ve ay ışığını gece gece gösterelim.
        </p>
        <Byline updated={UPDATED} />
        {next && (
          <div className="mt-8 max-w-md rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-5">
            <p className="text-xs uppercase tracking-wider text-emerald-200/80">Sıradaki karanlık dönem (ay ışığı yok)</p>
            <p className="mt-1 text-2xl font-semibold">
              {dm.format(next.start)} - {dm.format(next.end)}
            </p>
            <p className="mt-0.5 text-sm text-zinc-300">Yeni ay: {dm.format(next.newMoon)}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/** Girişin arka planında yumuşak yeşil perdeler (yalnız süs). */
function AuroraGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60">
      <div className="absolute -top-20 right-[-10%] h-72 w-[70%] rotate-[-8deg] rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="absolute top-24 right-[5%] h-40 w-[45%] rotate-[-14deg] rounded-full bg-teal-300/20 blur-3xl" />
      <div className="absolute -top-10 right-[25%] h-28 w-[30%] rotate-[6deg] rounded-full bg-fuchsia-400/10 blur-3xl" />
    </div>
  );
}

/** Sayfanın sorusunun cevabı, en üstte. Günde bir yenilenir. */
async function AuroraAnswer() {
  "use cache";
  cacheLife("days");

  const windows = darkWindows(new Date(Date.now() - 4 * DAY_MS), 3);
  const dm = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" });
  return (
    <AnswerBox
      question="Kuzey ışıkları nerede ve ne zaman görülür?"
      answer="Kuzey Kutbu'nun çevresinde, yaklaşık 60-75° enlemleri arasında: Norveç'in kuzeyi (Tromsø), İsveç ve Finlandiya Laponyası, İzlanda, Kanada ve Alaska. Eylül'den mart sonuna kadar, karanlık ve bulutsuz gecelerde."
      rows={[
        { label: "En iyi aylar", value: "Eylül-mart (mayıs-ağustos arası kutup bölgesinde gece kararmaz)" },
        {
          label: "Bu kışın en karanlık dönemleri",
          value: windows.map((w) => `${dm.format(w.start)} - ${dm.format(w.end)}`).join(" · "),
        },
        { label: "Gecenin hangi saati?", value: "Akşamın geç saatlerinden gece yarısı sonrasına kadar" },
        {
          label: "Türkiye'den görülür mü?",
          value: (
            <>
              Normalde hayır; yalnız Mayıs 2024 gibi çok güçlü fırtınalarda, kuzey ufkunda soluk bir kızıllık olarak.{" "}
              <a href="#turkiye" className="underline underline-offset-2">
                Ayrıntılar
              </a>
            </>
          ),
        },
        {
          label: "Bu gece görülecek mi?",
          value: (
            <>
              Uzay havasına bağlıdır, günler önceden bilinemez. Kısa süreli resmî tahmin: NOAA kuzey ışıkları haritası.
              {src.ref("noaaOvation")}
            </>
          ),
        },
      ]}
      note={
        <>
          Bölge bilgisi NOAA&apos;dan.{src.ref("noaaAurora")} Karanlık dönemler, yeni ayın 4 gün öncesinden 4 gün
          sonrasına kadardır (kendi hesabımız). Gideceğiniz yer için{" "}
          <a href="#planlayici" className="underline underline-offset-2">
            planlayıcıya
          </a>{" "}
          bakın.
        </>
      }
    />
  );
}

async function SelectedPlanner({ searchParams }: Pick<PageProps<"/tr/kuzey-isiklari">, "searchParams">) {
  const { yer, ay } = await searchParams;
  const dest = AURORA_DESTINATIONS.find((d) => d.slug === yer) ?? AURORA_DESTINATIONS[0];
  const month = parseMonth(ay);
  return <Planner slug={dest.slug} monthKey={month ? `${month.year}-${String(month.month).padStart(2, "0")}` : null} />;
}

/**
 * Gezi planlayıcı: seçilen yer ve ayda her gece karanlık süresi, ay ışığı ve değerlendirme. Ay seçilmemişse karanlık
 * mevsimde bu ay, yazdaysak gelecek Eylül. Günde bir yenilenir.
 */
async function Planner({ slug, monthKey }: { slug: string; monthKey: string | null }) {
  "use cache";
  cacheLife("days");

  const dest = AURORA_DESTINATIONS.find((d) => d.slug === slug) ?? AURORA_DESTINATIONS[0];
  const now = new Date();
  const { year, month } = (monthKey && parseMonth(monthKey)) || defaultMonth(now);
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const nights: AuroraNight[] = Array.from({ length: days }, (_, i) =>
    getAuroraNight(new Date(Date.UTC(year, month - 1, i + 1, 12)), dest),
  );
  const t = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: dest.timeZone, hour: "2-digit", minute: "2-digit" });
  const dm = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: dest.timeZone, day: "numeric", month: "long", weekday: "short" });
  const best = nights.filter((n) => n.rating === "cok-iyi").length;
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const base = localDateParts(now, timeZone);
    const m = ((base.month - 1 + i) % 12) + 1;
    const y = base.year + Math.floor((base.month - 1 + i) / 12);
    return { key: `${y}-${String(m).padStart(2, "0")}`, label: `${MONTH_LONG[m - 1]} ${y}` };
  });
  const selectedKey = `${year}-${String(month).padStart(2, "0")}`;

  return (
    <section aria-labelledby="planlayici" className="mt-12">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Kuzey ışıkları gezi planlayıcı</p>
      <h2 id="planlayici" data-toc-label="Gezi planlayıcı" className="mt-1 scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        {dest.name}, {dest.country}: {MONTH_LONG[month - 1]} {year}
      </h2>
      <Form action={PAGE.path} scroll={false} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Gidilecek yer
          <select
            name="yer"
            defaultValue={dest.slug}
            key={dest.slug}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          >
            {AURORA_DESTINATIONS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name} ({d.country})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Ay
          <select
            name="ay"
            defaultValue={selectedKey}
            key={selectedKey}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          >
            {monthOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-[#05070d] px-5 py-2.5 font-semibold text-white hover:bg-zinc-800">
          Göster
        </button>
      </Form>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        {best > 0
          ? `Bu ay ${best} gece "çok iyi": karanlık uzun ve ay ışığı yok. Gezinizi bu gecelere denk getirin.`
          : nights.every((n) => n.rating === "karanlik-yok")
            ? "Bu ay gece hiç kararmıyor; kuzey ışıkları görülmez. Eylül-mart arasını seçin."
            : "Bu ay ay ışığı çok gece etkili; en karanlık geceler aşağıda işaretli."}
      </p>
      <DataTable
        columns={["Gece", "Karanlık", "Ay", "Değerlendirme"]}
        rows={nights.map((n, i) => ({
          key: String(i),
          cells: [
            dm.format(n.evening),
            n.darkStart && n.darkEnd ? `${t.format(n.darkStart)} - ${t.format(n.darkEnd)} (${hours(n.darkMinutes)})` : "kararmıyor",
            `%${Math.round(n.moonIllumination * 100)}${n.moonUpMinutes === 0 && n.darkMinutes > 0 ? ", gökyüzünde değil" : ""}`,
            <span key="r" className={`rounded-full px-2 py-0.5 text-xs font-medium ${RATING[n.rating].cls}`}>
              {RATING[n.rating].text}
            </span>,
          ],
        }))}
      />
      <p className="mt-3 text-sm text-zinc-500">
        Karanlık: Güneş ufkun 12° altındayken (yerel saat). Değerlendirme yalnız karanlığa ve ay ışığına bakar; ışıkların
        o gece ne kadar güçlü olacağı uzay havasına bağlıdır ve önceden hesaplanamaz.
      </p>
    </section>
  );
}

/** "Kuzey ışıkları hangi aylarda görülür?": her yer için ayın ortasındaki gecede karanlık süresi. Haftada bir yenilenir. */
async function SeasonTable() {
  "use cache";
  cacheLife("weeks");

  const now = new Date();
  const y = localDateParts(now, timeZone).year;
  // Ağustos-Aralık bu yıl, Ocak-Nisan gelecek yıl (tek bir karanlık mevsim).
  const dateOf = (m: number) => new Date(Date.UTC(m >= 8 ? y : y + 1, m - 1, 15, 12));
  return (
    <section aria-labelledby="mevsim" className="mt-14">
      <h2 id="mevsim" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Kuzey ışıkları hangi aylarda görülür?
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Her ayın ortasında gecenin kaç saat gerçekten karanlık olduğu. Kutup bölgesinde yaz gecesi hiç kararmaz; aralıkta
        ise gece 16-18 saati bulur. Karanlık süresi uzadıkça ışıkları görme şansı artar.
      </p>
      <DataTable
        columns={["Yer", ...SEASON_MONTHS.map((m) => MONTH_NAMES[m - 1])]}
        rows={AURORA_DESTINATIONS.map((d) => ({
          key: d.slug,
          cells: [
            <Link key="l" href={`${PAGE.path}?yer=${d.slug}`} rel="nofollow" scroll={false} className="hover:underline">
              {d.name}
            </Link>,
            ...SEASON_MONTHS.map((m) => {
              const min = getDarkMinutes(dateOf(m), d);
              return min === 0 ? <span key={m} className="text-zinc-400">-</span> : String(Math.round(min / 60));
            }),
          ],
        }))}
      />
      <p className="mt-3 text-sm text-zinc-500">Saat cinsinden, Güneş ufkun 12° altındayken. &quot;-&quot;: gece o kadar kararmıyor.</p>
    </section>
  );
}

/** "Kuzey ışıkları Türkiye'den görülür mü?": jeomanyetik enlemler (kendi hesabımız) ve NOAA ölçeği. */
async function TurkeySection() {
  "use cache";
  cacheLife("weeks");

  // Ülke taramasında "X'ten kuzey ışıkları görülür mü?" diye sorulan şehirler (kuzeyden güneye) ve Türkiye.
  const rows = ["oslo", "stockholm", "kopenhag", "hamburg", "berlin", "amsterdam", "londra", "toronto", "zurih", "viyana", "new-york", "edirne", "istanbul", "ankara", "antalya"]
    .map((s) => findPlace(s)!)
    .map((p) => ({ p, gm: geomagneticLatitude(p) }))
    .sort((a, b) => b.gm - a.gm);
  const nf = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  // NOAA ölçeğindeki tipik sınırlar: G2 55°, G3 50°, G4 45°, G5 40° jeomanyetik enlem.
  const needed = (gm: number) =>
    gm >= 60
      ? "Hafif fırtınalarda bile (sık)"
      : gm >= 55
        ? "Orta fırtına (G2) ve üstü"
        : gm >= 50
          ? "Güçlü fırtına (G3) ve üstü"
          : gm >= 45
            ? "Çok güçlü fırtına (G4) ve üstü"
            : gm >= 40
              ? "Aşırı fırtına (G5)"
              : "Yalnız olağanüstü fırtınada (Mayıs 2024 gibi)";
  const placeLabel = (p: (typeof rows)[number]["p"]) => ("country" in p ? `${p.name} (${p.country})` : p.name);

  return (
    <section aria-labelledby="turkiye" className="mt-14">
      <Prose>
        <h2 id="turkiye">Kuzey ışıkları hangi şehirden görülür? Türkiye&apos;den görülür mü?</h2>
        <p>
          Kuzey ışıklarının görülebileceği sınır, coğrafi enlemle değil jeomanyetik enlemle, yani Dünya&apos;nın manyetik
          kutbuna olan uzaklıkla ölçülür. NOAA&apos;nın jeomanyetik fırtına ölçeğine göre orta bir fırtınada (G2)
          ışıklar tipik olarak 55°, güçlü bir fırtınada (G3) 50°, çok güçlü bir fırtınada (G4) 45°, en üst sınıf olan
          aşırı fırtınada (G5) ise 40° jeomanyetik enleme kadar iner.{src.ref("noaaScales")} Aşağıdaki tablo, Türkçe
          aramalarda &quot;buradan görülür mü?&quot; diye sorulan şehirler için bunu gösteriyor.
        </p>
      </Prose>
      <DataTable
        columns={["Şehir", "Jeomanyetik enlem", "Görmek için gereken fırtına"]}
        rows={rows.map(({ p, gm }) => ({ key: p.slug, cells: [placeLabel(p), `${nf.format(gm)}°`, needed(gm)] }))}
      />
      <Prose>
        <p>
          Jeomanyetik enlemleri, NOAA&apos;nın 2025 jeomanyetik kutup konumuyla (80,85° K, 72,76° B) kendimiz
          hesapladık.{src.ref("ncieGeomagneticPoles")} Kuzey Amerika manyetik kutba daha yakın olduğu için Toronto ya da
          New York, aynı coğrafi enlemdeki Avrupa şehirlerinden daha kuzeydeymiş gibi davranır. Oslo ve Stockholm&apos;den
          ışıklar güçlü gecelerde kuzey ufkunda görülebilir; ama düzenli ve gökyüzünün tamamını kaplayan ışıklar için
          Tromsø, Abisko ya da Laponya gibi ışık halkasının altındaki yerlere gitmek gerekir.
        </p>
        <p>
          <strong>Türkiye</strong>&apos;nin jeomanyetik enlemi 34° ile 40° arasındadır; yani en güçlü fırtınaların bile
          tipik sınırının hemen güneyinde kalır. İstisna, çok nadir görülen olağanüstü fırtınalardır. 10 Mayıs 2024&apos;te başlayan ve 2003&apos;ten
          beri ilk kez G5 düzeyine ulaşan fırtınada kuzey ışıkları 26° manyetik enleme kadar, ABD&apos;nin güneyinden ve
          Hindistan&apos;ın kuzeyinden görüldü.{src.ref("nasaMay2024Storm")} Böyle bir gecede Türkiye&apos;den de
          kuzey ufkunda kırmızımsı bir parıltı görülebilir; ama bu, kutup bölgesindeki yeşil perdeler gibi değildir ve
          çoğu zaman gözden çok fotoğrafta belirgindir. Bir sonraki böyle fırtınanın ne zaman olacağı önceden
          bilinemez.
        </p>
      </Prose>
    </section>
  );
}

/** Güneş rüzgârı, Dünya'nın manyetik alanı ve kutuplardaki ışık halkası (kendi çizimimiz, ölçeksiz). */
function AuroraDiagram() {
  return (
    <figure className="not-prose my-8 rounded-2xl bg-[#05070d] p-4 text-white">
      <svg viewBox="0 0 600 260" className="w-full" role="img" aria-label="Güneş rüzgârı Dünya'nın manyetik alanına ulaşıyor; parçacıklar kutuplardaki halkalarda atmosfere iniyor">
        <circle cx="40" cy="130" r="60" fill="#fcd34d" />
        <circle cx="40" cy="130" r="74" fill="#fcd34d" fillOpacity="0.12" />
        {[70, 100, 130, 160, 190].map((y, i) => (
          <path key={y} d={`M110 ${y} C 200 ${y + (i - 2) * 4}, 270 ${y + (i - 2) * 8}, 330 ${130 + (y - 130) * 1.6}`} fill="none" stroke="#fde68a" strokeOpacity="0.45" strokeDasharray="5 6" />
        ))}
        <text x="180" y="40" fontSize="12" fill="#fde68a">Güneş rüzgârı</text>
        {[40, 62, 84].map((r) => (
          <g key={r} fill="none" stroke="#93c5fd" strokeOpacity="0.5">
            <path d={`M450 ${130 - 34} C ${450 - r * 2.2} ${130 - r * 1.5}, ${450 - r * 2.2} ${130 + r * 1.5}, 450 ${130 + 34}`} />
            <path d={`M450 ${130 - 34} C ${450 + r * 2.6} ${130 - r * 1.5}, ${450 + r * 2.6} ${130 + r * 1.5}, 450 ${130 + 34}`} />
          </g>
        ))}
        <text x="500" y="40" fontSize="12" fill="#93c5fd">Manyetik alan</text>
        <circle cx="450" cy="130" r="34" fill="#2563eb" />
        <ellipse cx="450" cy="99" rx="16" ry="5" fill="none" stroke="#34d399" strokeWidth="4" />
        <ellipse cx="450" cy="161" rx="16" ry="5" fill="none" stroke="#34d399" strokeWidth="4" />
        <text x="472" y="92" fontSize="12" fill="#6ee7b7">Kuzey ışıkları</text>
        <text x="472" y="178" fontSize="12" fill="#6ee7b7">Güney ışıkları</text>
      </svg>
      <figcaption className="mt-2 text-xs text-zinc-400">
        Ölçeksiz çizim. Manyetik alan Güneş&apos;ten gelen parçacıkların çoğunu saptırır; bir kısmı kutuplara yakın, halka
        biçimli bölgelerde atmosfere iner ve ışık oluşturur.
      </figcaption>
    </figure>
  );
}
