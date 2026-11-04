import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  ABROAD_CITIES,
  CRESCENT_MIN_ALTITUDE,
  CRESCENT_MIN_ELONGATION,
  findPlace,
  getCrescentEvenings,
  getUpcomingPrincipalPhases,
  isAbroad,
  type CrescentEvening,
  type GeoLocation,
  type Place,
} from "@moon-app/moon";
import { Faq } from "@/components/Faq";
import { FAQS } from "@/lib/faqs";
import { fromHijri, toHijri } from "@/lib/hijri-calendar";
import { ABROAD_OPTIONS, BERLIN, FEATURED_ABROAD, PROVINCE_OPTIONS } from "@/lib/place-options";
import { CitySelect } from "@/components/CitySelect";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { AnswerBox } from "@/components/InfoTables";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.hilalGozlemi;
const UPDATED = "2026-11-04";
const src = pageSources("nasaMoonPhases", "nasaEclipseSafety", "diyanet2027", "diyanetAyTanim");
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;
const CITY_OPTIONS = PROVINCE_OPTIONS;

/** Saatin hangi saat dilimiyle yazıldığı: "Türkiye saati" ya da "Almanya saati"... */
function zoneLabelOf(place: Place) {
  return isAbroad(place) ? place.zoneLabel : "Türkiye saati";
}

/** Hilalin ölçütlere göre görülebileceği ilk akşam (yoksa undefined). */
function firstVisible(evenings: CrescentEvening[]) {
  return evenings.find((e) => e.meetsCriteria && e.moonSetsAfterSun && e.moonAltitude > 0);
}

/** Hicri ayın başından önceki son yeni ay (ayı başlatan hilalin yeni ayı). */
function newMoonBefore(monthStart: Date) {
  return getUpcomingPrincipalPhases(new Date(monthStart.getTime() - 5 * DAY_MS), 4).find(
    (p) => p.key === "new-moon" && p.date < monthStart,
  );
}

export const metadata: Metadata = {
  title: `Hilal Gözlemi Nasıl Yapılır? Yeni Hilal Ne Zaman, Nerede Görülür? | ${siteConfig.name}`,
  description:
    "Yeni hilali görmek için ne zaman ve nereye bakmalı? İlinize ya da Almanya, Hollanda, Fransa gibi yurt dışındaki şehrinize göre gün batımı, ay batışı, hilalin yüksekliği ve yönü. Ramazan ve bayram hilali Avrupa'dan ne zaman görülebilir?",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function CrescentWatchPage({ searchParams }: PageProps<"/tr/hilal-gozlemi">) {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={25}
        eyebrow="Hicri"
        lead="Yeni aydan sonra batı ufkunda beliren ince hilal, gökyüzünün en zarif ve en zor görüntülerinden biridir. Ne zaman ve nereye bakacağınızı bilirseniz bulmak çok daha kolaydır."
        aside={
          <div className="rounded-2xl border border-white/15 bg-black/40 p-5 text-sm text-zinc-200 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Kısaca nasıl?</p>
            <p className="mt-1">
              Gün battıktan 15-30 dakika sonra, Güneş&apos;in battığı noktanın biraz soluna ve yukarısına bakın.
            </p>
          </div>
        }
        updated={UPDATED}
      />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Sıradaki hilal" },
          { href: "#aksamlar", label: "İlinize göre" },
          { href: "#avrupa", label: "Avrupa'dan" },
          { href: "#ne-zaman", label: "Ne zaman?" },
          { href: "#nereye", label: "Nereye?" },
          { href: "#guvenlik", label: "Güvenlik" },
          { href: "#hicri", label: "Hicri takvim" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <CrescentAnswer />
        </div>

        <Suspense fallback={<Evenings slug={siteConfig.defaultLocation.slug} />}>
          <SelectedCity searchParams={searchParams} />
        </Suspense>

        <EuropeTable />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2 id="ne-zaman">Ne zaman bakmalı?</h2>
            <p>
              Hilal, Güneş&apos;e çok yakın ve çok soluk olduğu için gün batımında gökyüzü hâlâ fazla aydınlıktır. En
              iyi zaman, Güneş battıktan <strong>15-30 dakika sonrasıdır</strong>: gökyüzü yeterince kararmış, ama hilal
              henüz batmamıştır. Yukarıdaki kartlarda her akşamın gün batımı ve ay batışı saatleri, yani gözlem
              pencereniz yer alıyor. Ay, gün batımından kısa süre sonra batıyorsa pencere çok dardır.
            </p>

            <h2 id="nereye">Nereye bakmalı?</h2>
            <p>
              Önce Güneş&apos;in battığı noktayı not edin. Yeni hilal bu noktanın biraz yukarısında ve genellikle biraz
              solunda (güneyinde) durur. Kartlarda, hilalin gün batımı noktasına göre konumu derece olarak verildi.
              Dereceyi ölçmenin kolay bir yolu var:{" "}
              <strong>
                kolunuzu tam uzatıp yumruk yaptığınızda, yumruğunuzun genişliği gökyüzünde yaklaşık 10 derecedir.
              </strong>{" "}
              Parmak genişliği ise yaklaşık 1-2 derecedir.
            </p>
            <p>
              Hilalin boynuzları yukarıya, Güneş&apos;in tersine bakar. Çok ince olduğu için bir bulut kenarı ya da uçak
              izi sanılabilir; birkaç dakika boyunca aynı yerde, ufka doğru yavaşça indiğini görürseniz hilaldir.
            </p>

            <h2>Nasıl bir yer seçmeli?</h2>
            <ul>
              <li>
                <strong>Batı ufku açık olmalı.</strong> Hilal ufka çok yakın olduğu için binalar, ağaçlar ve tepeler onu
                kolayca gizler. Deniz kıyısı, yüksek bir tepe ya da düz bir ova idealdir.
              </li>
              <li>
                <strong>Hava berrak olmalı.</strong> Ufka yakın pus ve toz, ince hilali tamamen yok edebilir. Yağmurdan
                sonraki açık akşamlar en iyisidir.
              </li>
              <li>
                <strong>Şehir ışıklarından uzaklaşın.</strong> Batı yönündeki ışık kirliliği alacakaranlığı daha da
                aydınlatır.
              </li>
            </ul>

            <h2 id="guvenlik">Dürbün kullanımı ve güvenlik</h2>
            <p>
              Dürbün, çok ince bir hilali bulmayı büyük ölçüde kolaylaştırır. Hilali önce dürbünle bulup sonra çıplak
              gözle aramak iyi bir yöntemdir. Ama bir kural kesindir:{" "}
              <strong>Güneş tamamen batmadan dürbünü ya da teleskopu batı ufkuna çevirmeyin.</strong> Güneş&apos;in
              görüş alanına girmesi bir saniyede bile kalıcı göz hasarına yol açabilir.{src.ref("nasaEclipseSafety")}
            </p>

            <h2>Neden bazı aylar daha zor?</h2>
            <p>
              Hilalin akşam ne kadar yüksekte kalacağı, mevsime göre değişir. İlkbahar akşamlarında ayın gökyüzündeki
              yolu ufka dik olduğu için hilal hızla yükselir ve kolay görülür. Sonbahar akşamlarında ise yol ufka
              yatıktır; hilal ufka yakın kalır ve görülmesi bir iki akşam gecikebilir. Bunu{" "}
              <Link href={PAGES.hilal.path}>Hilal</Link> sayfasında ayrıntılı anlattık.
            </p>

            <h2>Rekorlar</h2>
            <p>
              Çıplak gözle görülen en genç hilal, yeni aydan yalnızca 15,5 saat sonra gözlenmiştir; bu, deneyimli
              gözlemcilerin özel koşullarda ulaştığı bir sınırdır. Çoğu insan için hilal, yeni aydan en az bir gün sonra
              görünür hale gelir. Günümüzde özel tekniklerle, ayın tam yeni ay anındaki ince kenarı bile
              fotoğraflanabilmektedir.
            </p>

            <h2 id="hicri">Hilal gözlemi ve Hicri takvim</h2>
            <p>
              Hilal gözlemi, Hicri ayların başlangıcını belirlemek için yüzyıllardır yapılır. Türkiye&apos;de ise Hicri
              ay başları astronomik hesaplarla belirlenir. Ay başlarının nasıl hesaplandığını ve önümüzdeki ayların
              tahmini başlangıçlarını <Link href={PAGES.hicriTakvim.path}>Hicri Takvim</Link> sayfasında bulabilirsiniz.
            </p>
          </Prose>
          <Faq items={FAQS.hilalGozlemi} />
          <ArticleFooter
            page={PAGE}
            headline="Hilal Gözlemi Nasıl Yapılır? Yeni Hilal Ne Zaman, Nerede Görülür?"
            updated={UPDATED}
            src={src}
          />
        </div>
      </main>
    </>
  );
}

async function SelectedCity({ searchParams }: Pick<PageProps<"/tr/hilal-gozlemi">, "searchParams">) {
  const { il } = await searchParams;
  const city = findPlace(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
  return <Evenings slug={city.slug} />;
}

type Difficulty = { label: string; tone: "none" | "hard" | "binocular" | "naked" | "easy" };

/** Kaba kolaylık tahmini. Eşikler gözlem deneyimine dayalı yaklaşık değerlerdir. */
function difficulty(e: CrescentEvening): Difficulty {
  if (e.ageHours <= 0) return { label: "Yeni ay henüz olmadı", tone: "none" };
  if (!e.moonSetsAfterSun || e.moonAltitude <= 0)
    return { label: "Görülemez: ay Güneş'ten önce batıyor", tone: "none" };
  if (!e.meetsCriteria) return { label: "Görülmesi beklenmez: ay çok alçakta", tone: "none" };
  if (e.moonAltitude < 8 || e.elongation < 12) return { label: "Çok zor: dürbünle denenebilir", tone: "hard" };
  if (e.moonAltitude < 12) return { label: "Çıplak gözle görülebilir, dikkatli bakın", tone: "naked" };
  return { label: "Kolayca görülür", tone: "easy" };
}

const TONE: Record<Difficulty["tone"], string> = {
  none: "bg-white/10 text-zinc-300",
  hard: "bg-amber-500/20 text-amber-200",
  binocular: "bg-amber-500/20 text-amber-200",
  naked: "bg-emerald-500/20 text-emerald-200",
  easy: "bg-emerald-500/30 text-emerald-100",
};

/** Bir ilde, ilgili yeni aydan sonraki dört akşamın hilal koşulları. Saatte bir yenilenir. */
async function Evenings({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = findPlace(slug) ?? siteConfig.defaultLocation;
  const now = new Date();
  const tz = city.timeZone;
  // Son dört gün içinde yeni ay olduysa onu, yoksa bir sonrakini göster.
  const newMoon = getUpcomingPrincipalPhases(new Date(now.getTime() - 4 * DAY_MS), 6).find(
    (p) => p.key === "new-moon",
  )!;
  const evenings = getCrescentEvenings(newMoon.date, city);

  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: tz, day: "numeric", month: "long", weekday: "long" });
  const dateLong = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: tz,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" });
  const nf = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 0 });

  return (
    <section className="mt-12" aria-labelledby="aksamlar">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Önümüzdeki hilal akşamları</p>
          <h2 id="aksamlar" className="scroll-mt-32 mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {isAbroad(city) ? `${city.name}, ${city.country}` : city.name} için
          </h2>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Yeni ay: {dateLong.format(newMoon.date)}, saat {time.format(newMoon.date)} ({zoneLabelOf(city)})
          </p>
        </div>
        <CitySelect action={PAGE.path} options={CITY_OPTIONS} abroad={ABROAD_OPTIONS} selected={city.slug} />
      </div>

      <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {evenings.map((e) => {
          const d = difficulty(e);
          const offset = e.moonAzimuth - e.sunAzimuth;
          const side = offset < 0 ? "solunda" : "sağında";
          const windowMin = e.moonSet ? Math.round((e.moonSet.getTime() - e.sunset.getTime()) / 60_000) : 0;
          return (
            <li key={e.sunset.toISOString()} className="rounded-2xl bg-[#05070d] p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{date.format(e.sunset)}</p>
                  <p className="text-sm text-zinc-400">
                    Ay yaşı: {e.ageHours > 0 ? `${nf.format(e.ageHours)} saat` : "yeni ay henüz olmadı"}
                  </p>
                </div>
                <MoonPhaseIcon phaseAngle={Math.max(4, Math.min(e.elongation, 60))} size={48} title="Hilal" />
              </div>
              <p className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${TONE[d.tone]}`}>
                {d.label}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-zinc-400">Gün batımı</dt>
                  <dd className="font-medium tabular-nums">{time.format(e.sunset)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-400">Ay batışı</dt>
                  <dd className="font-medium tabular-nums">
                    {e.moonSet ? time.format(e.moonSet) : "-"}
                    {windowMin > 0 && <span className="text-zinc-400"> ({windowMin} dk sonra)</span>}
                  </dd>
                </div>
                {e.moonAltitude > 0 && e.moonSetsAfterSun && (
                  <div className="col-span-2">
                    <dt className="text-zinc-400">Nereye bakmalı (gün batımı anında)</dt>
                    <dd className="font-medium">
                      Gün batımı noktasının {nf.format(Math.abs(offset))}° {side}, ufuktan {nf.format(e.moonAltitude)}°
                      yukarıda
                    </dd>
                  </div>
                )}
              </dl>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-sm text-zinc-500">
        Kolaylık tahmini kabadır: gün batımında ayın yüksekliği ve Güneş&apos;ten uzaklığına bakar (en az{" "}
        {CRESCENT_MIN_ALTITUDE}° yükseklik ve {CRESCENT_MIN_ELONGATION}° açı olmadan &quot;görülmesi beklenmez&quot;).
        Hava, ufuk ve gözlemcinin deneyimi sonucu büyük ölçüde değiştirir.
      </p>
    </section>
  );
}

/** Avrupa tablosunda yeni aydan sonra bakılan akşam sayısı. */
const EVENINGS = 5;

const HIJRI_KEY_MONTHS = [
  { month: 9, label: "Ramazan hilali", dayName: "1 Ramazan" },
  { month: 10, label: "Şevval (bayram) hilali", dayName: "Ramazan Bayramı" },
  { month: 12, label: "Zilhicce hilali", dayName: "1 Zilhicce" },
];

/**
 * "Hilal Avrupa'dan ne zaman görülebilir?": sıradaki Ramazan, Şevval ve Zilhicce hilallerinin Avrupa'daki büyük
 * şehirlerden astronomik olarak görülebileceği ilk akşam ve Diyanet'in ilan ettiği ay başıyla karşılaştırma.
 * "Almanya'da hilal göründü mü" aramalarına dinî hüküm değil, astronomik tahmin olarak cevap verir. Günde bir yenilenir.
 */
async function EuropeTable() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const t = toHijri(now, timeZone);
  const isoDay = (d: Date, tz: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const short = (tz: string) => new Intl.DateTimeFormat(siteConfig.locale, { timeZone: tz, day: "numeric", month: "short" });
  const longUtc = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });

  const columns = HIJRI_KEY_MONTHS.map((m) => {
    const year = t.month >= m.month ? t.year + 1 : t.year;
    const start = fromHijri(year, m.month, 1);
    const newMoon = start ? newMoonBefore(start) : undefined;
    return { ...m, year, start, newMoon };
  }).filter((c): c is typeof c & { start: Date; newMoon: NonNullable<typeof c.newMoon> } => !!c.start && !!c.newMoon);

  const cell = (c: (typeof columns)[number], place: GeoLocation) =>
    firstVisible(getCrescentEvenings(c.newMoon.date, place, EVENINGS));
  // Yerel gözleme göre ay başı (ilk görülebilir akşamın ertesi günü) Diyanet'ten farklı mı? Berlin'e göre.
  const differing = columns
    .map((c) => {
      const fv = cell(c, BERLIN);
      if (!fv) return null;
      const localStart = new Date(fv.sunset.getTime() + DAY_MS);
      return isoDay(localStart, BERLIN.timeZone) !== isoDay(c.start, "UTC") ? { c, fv, localStart } : null;
    })
    .filter((x) => x !== null);
  const berlinShort = short(BERLIN.timeZone);

  return (
    <section className="mt-14" aria-labelledby="avrupa">
      <h2 id="avrupa" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Ramazan ve bayram hilali Avrupa&apos;dan ne zaman görülebilir?
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Almanya, Hollanda, Belçika, Fransa, Avusturya, İsviçre, İngiltere, Bulgaristan, KKTC ve Azerbaycan&apos;ın büyük
        şehirlerinden, sıradaki Ramazan, Şevval ve Zilhicce hilalinin astronomik olarak görülebileceği ilk akşam. Bu,
        hilalin gerçekten görüldüğü anlamına gelmez; hava ve ufuk sonucu değiştirir. Bu ülkelerdeki{" "}
        {ABROAD_CITIES.length} şehrin tamamı için yukarıdaki seçiciyi kullanabilirsiniz.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5 font-medium">Şehir</th>
              {columns.map((c) => (
                <th key={c.month} className="px-4 py-2.5 font-medium">
                  <span className="block text-zinc-700 dark:text-zinc-300">{c.label}</span>
                  <span className="text-xs font-normal">
                    Diyanet: {c.dayName} {longUtc.format(c.start)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {FEATURED_ABROAD.map((p) => (
              <tr key={p.slug}>
                <td className="px-4 py-2">
                  <Link href={`${PAGE.path}?il=${p.slug}`} rel="nofollow" scroll={false} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                  <span className="ml-1.5 text-zinc-500">{p.country}</span>
                </td>
                {columns.map((c) => {
                  const fv = cell(c, p);
                  const d = fv && difficulty(fv);
                  return (
                    <td key={c.month} className="px-4 py-2">
                      {fv ? (
                        <>
                          <span className="tabular-nums">{short(p.timeZone).format(fv.sunset)} akşamı</span>
                          <span className="ml-1.5 text-xs text-zinc-500">
                            {d && (d.tone === "easy" ? "kolay" : d.tone === "naked" ? "çıplak gözle" : "çok zor")}
                          </span>
                        </>
                      ) : (
                        <span className="text-zinc-400">ilk {EVENINGS} akşamda görülmez</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-zinc-500">
        Ölçüt: gün batımında ay en az {CRESCENT_MIN_ALTITUDE}° yüksekte ve Güneş&apos;ten en az {CRESCENT_MIN_ELONGATION}°
        uzakta. Hicri ay, hilalin görüldüğü akşam başlar; ilk günü ertesi gündür.
      </p>
      <div className="mx-auto max-w-3xl">
        <Prose>
          <p>
            Kış ve ilkbaharda hilal, Avrupa&apos;nın büyük şehirlerinden çoğunlukla Türkiye ile aynı akşam görülebilir
            hale gelir. Yaz sonu ve sonbaharda ise akşamları ayın yolu ufka yatık olduğu için hilal kuzeydeki
            şehirlerden (Berlin, Hamburg, Amsterdam, Londra) bir iki akşam sonra görülebilir; güneydeki Lefkoşa ve
            Bakü&apos;de fark yoktur. Diyanet ise ay başını yalnızca bir ülkeden değil, hilalin dünyanın
            herhangi bir yerinden görülebilmesine göre belirler.{src.ref("diyanetAyTanim")} Bu yüzden Diyanet&apos;in
            ilan ettiği gün ile Avrupa&apos;dan yerel gözleme göre çıkan gün bazen aynı, bazen bir gün farklıdır.
          </p>
          {differing.length > 0 ? (
            <p>
              Örneğin {differing[0].c.label} Berlin&apos;den ilk kez{" "}
              {berlinShort.format(differing[0].fv.sunset)} akşamı görülebilir; yerel gözlemi esas alan biri için{" "}
              {differing[0].c.dayName} {berlinShort.format(differing[0].localStart)} olur. Diyanet&apos;in ilan ettiği gün
              ise {longUtc.format(differing[0].c.start)}.{src.ref("diyanet2027")} Avrupa&apos;da aynı şehirdeki
              camilerin bazen farklı günlerde bayram yapmasının astronomik nedeni bu farktır. Hangi günün esas
              alınacağı dinî bir karardır; bağlı olduğunuz camiye ya da derneğe danışın.
            </p>
          ) : (
            <p>
              Önümüzdeki üç ay başında Avrupa&apos;dan yerel gözleme göre çıkan gün, Diyanet&apos;in ilan ettiği günle
              aynıdır. Hangi günün esas alınacağı dinî bir karardır; bağlı olduğunuz camiye ya da derneğe danışın.
            </p>
          )}
          <p>
            Tarihlerin listesi için <Link href={PAGES.hicriTakvim.path}>Hicri Takvim</Link> sayfasındaki
            &quot;Ramazan ve bayramlar yurt dışında ne zaman?&quot; bölümüne bakabilirsiniz.
          </p>
        </Prose>
      </div>
    </section>
  );
}

/**
 * Sayfanın sorusunun cevabı, en üstte (timeanddate düzeni): İstanbul'dan hilalin görülebileceği ilk akşam,
 * gün batımı, gözlem penceresi ve nereye bakılacağı. Saatte bir yenilenir.
 */
async function CrescentAnswer() {
  "use cache";
  cacheLife("hours");

  const city = siteConfig.defaultLocation;
  const now = new Date();
  const newMoon = getUpcomingPrincipalPhases(new Date(now.getTime() - 4 * DAY_MS), 6).find((p) => p.key === "new-moon")!;
  const evenings = getCrescentEvenings(newMoon.date, city);
  const first = evenings.find((e) => e.sunset > now && e.meetsCriteria && e.moonSetsAfterSun && e.moonAltitude > 0);
  const day = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", weekday: "long" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const nf = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 0 });

  if (!first) {
    return (
      <AnswerBox
        question="Yeni hilal ne zaman, nerede görülür?"
        answer={`Yeni ay ${day.format(newMoon.date)}. Hilal, ondan sonraki akşamlarda gün batımından sonra batı ufkunda aranır.`}
        rows={[{ label: "Ne zaman bakmalı?", value: "Güneş battıktan 15-30 dakika sonra" }]}
      />
    );
  }
  const offset = first.moonAzimuth - first.sunAzimuth;
  const windowMin = first.moonSet ? Math.round((first.moonSet.getTime() - first.sunset.getTime()) / 60_000) : 0;
  const deFirst = firstVisible(getCrescentEvenings(newMoon.date, BERLIN));
  const deDay = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: BERLIN.timeZone,
    day: "numeric",
    month: "long",
    weekday: "long",
  });
  const deTime = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: BERLIN.timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AnswerBox
      question="Yeni hilal ne zaman, nerede görülür?"
      answer={`İstanbul'dan bir sonraki yeni hilal ${day.format(first.sunset)} akşamı, gün batımından sonra batı ufkunda aranabilir.`}
      rows={[
        { label: "Yeni ay", value: `${day.format(newMoon.date)}, ${time.format(newMoon.date)}` },
        {
          label: "Gün batımı / ay batışı",
          value: `${time.format(first.sunset)} / ${first.moonSet ? time.format(first.moonSet) : "-"}${windowMin > 0 ? ` (gözlem penceresi ${windowMin} dakika)` : ""}`,
        },
        {
          label: "Nereye bakmalı?",
          value: `Gün batımı noktasının ${nf.format(Math.abs(offset))}° ${offset < 0 ? "solunda" : "sağında"}, ufuktan ${nf.format(first.moonAltitude)}° yukarıda`,
        },
        { label: "Ne zaman bakmalı?", value: "Güneş battıktan 15-30 dakika sonra" },
        ...(deFirst
          ? [
              {
                label: `Almanya'dan (${BERLIN.name})`,
                value: (
                  <>
                    {deDay.format(deFirst.sunset)} akşamı, gün batımı {deTime.format(deFirst.sunset)} ({BERLIN.zoneLabel}
                    ).{" "}
                    <a href="#avrupa" className="underline underline-offset-2">
                      Diğer Avrupa şehirleri
                    </a>
                  </>
                ),
              },
            ]
          : []),
        {
          label: "Dürbün kullanılır mı?",
          value: "Evet, ama yalnızca Güneş tamamen battıktan sonra; Güneş'e dürbünle bakmak kalıcı göz hasarı yapar.",
        },
      ]}
      note={
        <>
          İstanbul&apos;a göre; iliniz ya da yurt dışında yaşadığınız şehir için{" "}
          <a href="#aksamlar" className="underline underline-offset-2">
            aşağıdan seçin
          </a>
          . Yumruğunuzu kolunuz uzanmışken gökyüzüne tutarsanız genişliği yaklaşık 10 derecedir.
        </>
      }
    />
  );
}
