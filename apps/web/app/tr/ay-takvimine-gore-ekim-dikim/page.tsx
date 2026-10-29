import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  getMonthCalendar,
  getMoonPhase,
  getMoonSign,
  getUpcomingPrincipalPhases,
  localDateParts,
  zonedTimeToUtc,
} from "@moon-app/moon";
import { Faq } from "@/components/Faq";
import { FAQS } from "@/lib/faqs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { MonthLink } from "@/components/MonthLink";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { buildSingleEventIcs, googleCalendarLink } from "@/lib/ics";
import {
  adjacentMonths,
  currentMonth,
  MAX_YEAR,
  MIN_YEAR,
  MONTH_NAMES,
  monthParam,
  parseMonth,
  WEEKDAYS_SHORT,
} from "@/lib/months";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { elementOf, ZODIAC_SYMBOLS } from "@/lib/zodiac";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.ekimDikim;
const UPDATED = "2026-10-29";
const timeZone = siteConfig.defaultLocation.timeZone;
const WEEKDAYS_LONG = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export const metadata: Metadata = {
  title: `Ay Takvimine Göre Ekim Dikim Takvimi: Ne Zaman Ne Ekilir? | ${siteConfig.name}`,
  description:
    "Ay takvimine göre ekim dikim: domates, biber, marul, patates, soğan ve diğerleri için önümüzdeki uygun günleri bulun, takviminize ekleyin. Büyüyen ay, küçülen ay, dinlenme günleri ve biyodinamik kök, yaprak, çiçek, meyve günleri.",
  // Ay ve bitki seçimi (?ay=, ?bitki=) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

type Work = "ust" | "kok" | "dinlenme";

const WORK: Record<Work, { label: string; short: string; tone: string; text: string }> = {
  ust: {
    label: "Toprak üstü ürünler",
    short: "Toprak üstü",
    tone: "text-emerald-300",
    text: "Yapraklı sebzeler, domates, biber, fasulye, tahıl; aşılama",
  },
  kok: {
    label: "Kök bitkileri, budama",
    short: "Kök, budama",
    tone: "text-orange-300",
    text: "Patates, havuç, soğan, sarımsak, turp; budama, hasat, ot temizliği",
  },
  dinlenme: {
    label: "Dinlenme",
    short: "Dinlenme",
    tone: "text-zinc-400",
    text: "Gelenekte ekim dikim yapılmaz",
  },
};

/** Biyodinamik takvimde ayın bulunduğu burcun elementine göre gün türü. */
const BIODYNAMIC: Record<string, string> = { Toprak: "Kök", Su: "Yaprak", Hava: "Çiçek", Ateş: "Meyve" };

/**
 * Araçtaki bitkiler ve işler. Sınıflar yalnızca sayfada anlatılan iki gelenekten gelir:
 * halk takvimi (toprak üstü / kök) ve biyodinamik takvim (yenen kısmına göre kök, yaprak, çiçek, meyve).
 * İşlerin biyodinamik karşılığı yoktur.
 */
const PLANT_GROUPS: { title: string; items: Record<string, { name: string; folk: Exclude<Work, "dinlenme">; bio?: string }> }[] =
  [
    {
      title: "Meyvesi, tohumu yenen",
      items: {
        domates: { name: "Domates", folk: "ust", bio: "Meyve" },
        biber: { name: "Biber", folk: "ust", bio: "Meyve" },
        patlican: { name: "Patlıcan", folk: "ust", bio: "Meyve" },
        salatalik: { name: "Salatalık", folk: "ust", bio: "Meyve" },
        kabak: { name: "Kabak", folk: "ust", bio: "Meyve" },
        fasulye: { name: "Fasulye", folk: "ust", bio: "Meyve" },
        bezelye: { name: "Bezelye", folk: "ust", bio: "Meyve" },
        cilek: { name: "Çilek", folk: "ust", bio: "Meyve" },
        bugday: { name: "Buğday, arpa", folk: "ust", bio: "Meyve" },
      },
    },
    {
      title: "Yaprağı yenen",
      items: {
        marul: { name: "Marul", folk: "ust", bio: "Yaprak" },
        ispanak: { name: "Ispanak", folk: "ust", bio: "Yaprak" },
        maydanoz: { name: "Maydanoz", folk: "ust", bio: "Yaprak" },
        roka: { name: "Roka", folk: "ust", bio: "Yaprak" },
        lahana: { name: "Lahana", folk: "ust", bio: "Yaprak" },
      },
    },
    {
      title: "Çiçeği yenen ya da süs bitkisi",
      items: {
        brokoli: { name: "Brokoli", folk: "ust", bio: "Çiçek" },
        karnabahar: { name: "Karnabahar", folk: "ust", bio: "Çiçek" },
        cicek: { name: "Süs çiçekleri", folk: "ust", bio: "Çiçek" },
      },
    },
    {
      title: "Kökü, yumrusu yenen",
      items: {
        patates: { name: "Patates", folk: "kok", bio: "Kök" },
        havuc: { name: "Havuç", folk: "kok", bio: "Kök" },
        sogan: { name: "Soğan", folk: "kok", bio: "Kök" },
        sarimsak: { name: "Sarımsak", folk: "kok", bio: "Kök" },
        turp: { name: "Turp", folk: "kok", bio: "Kök" },
        pancar: { name: "Pancar", folk: "kok", bio: "Kök" },
      },
    },
    {
      title: "Bahçe işleri",
      items: {
        asilama: { name: "Aşılama", folk: "ust" },
        budama: { name: "Budama", folk: "kok" },
        hasat: { name: "Hasat ve depolama", folk: "kok" },
      },
    },
  ];
const PLANTS = Object.assign({}, ...PLANT_GROUPS.map((g) => g.items)) as Record<
  string,
  { name: string; folk: Exclude<Work, "dinlenme">; bio?: string }
>;

/** Aracın ve takvimin seçimlerini koruyarak sayfa adresi üretir. */
function pageHref({ plant, weekend, ay }: { plant?: string; weekend: boolean; ay?: string }) {
  const params = new URLSearchParams();
  if (plant) params.set("bitki", plant);
  if (weekend) params.set("hs", "1");
  if (ay) params.set("ay", ay);
  const query = params.toString();
  return query ? `${PAGE.path}?${query}` : PAGE.path;
}

export default function PlantingCalendarPage({ searchParams }: PageProps<"/tr/ay-takvimine-gore-ekim-dikim">) {
  return (
    <>
      <Suspense fallback={<PlantFinder weekend={false} />}>
        <SelectedFinder searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<CurrentMonth />}>
        <SelectedMonth searchParams={searchParams} />
      </Suspense>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>Geleneğe göre büyüyen ayda toprak üstünde ürün veren, küçülen ayda kökü yenen bitkiler ekilir.</li>
          <li>
            Yeni ay ve dolunay günleri ile bunlara bitişik günler, gelenekte ekim dikim için &quot;dinlenme&quot;
            sayılır.
          </li>
          <li>
            Bu kuralların ekim verimini artırdığı bilimsel olarak gösterilmemiştir; takvim geleneği doğru tarihlerle
            sunar.
          </li>
        </QuickFacts>

        <Prose>
          <h2>Ay takvimine göre ekim nedir?</h2>
          <p>
            Anadolu&apos;da çiftçiler kuşaklar boyunca ekim, budama ve hasat zamanını ayın evrelerine göre seçmiştir. Bu
            &quot;halk takvimi&quot;nin temelinde bir benzetme yatar: ay büyürken bitkideki özsuyun yukarıya, yapraklara
            ve meyveye; ay küçülürken aşağıya, köklere çekildiğine inanılır.
          </p>

          <h2>Gelenekteki kurallar</h2>
          <ul>
            <li>
              <strong>Büyüyen ay (yeni aydan dolunaya):</strong> Ürünü toprağın üstünde olan bitkiler ekilir: marul,
              ıspanak, maydanoz gibi yapraklılar; domates, biber, patlıcan, fasulye gibi meyve verenler; buğday ve arpa
              gibi tahıllar. Aşılama için de bu dönem tercih edilir.
            </li>
            <li>
              <strong>Küçülen ay (dolunaydan yeni aya):</strong> Ürünü toprağın altında olan bitkiler ekilir: patates,
              havuç, soğan, sarımsak, turp, pancar. Budama, hasat, ürünü depolamak ve yabani ot temizliği için de uygun
              görülür.
            </li>
            <li>
              <strong>Yeni ay ve dolunay:</strong> Bu günler ve çevresi &quot;dinlenme&quot; günleri sayılır, ekim dikim
              yapılmaz. Kaç gün bekleneceği kaynaklara göre bir ile üç gün arasında değişir; takvimde ana evre günü ile
              önceki ve sonraki gün işaretlenmiştir.
            </li>
          </ul>
          <p>
            Kaynaklar bu kurallarda tam olarak birleşmez. Örneğin bazı kaynaklar kök bitkilerini yeni ay döneminde
            ekmeyi önerir. Takvimde yalnızca en yaygın kurallar uygulanmıştır.
          </p>

          <h2>Biyodinamik takvim: kök, yaprak, çiçek, meyve günleri</h2>
          <p>
            Avrupa&apos;da yaygın olan biyodinamik tarım geleneği, 20. yüzyılda Alman araştırmacı Maria Thun&apos;un
            takvimiyle tanınmıştır. Bu gelenekte ayın bulunduğu burcun elementine göre günler dörde ayrılır: toprak
            burçları (Boğa, Başak, Oğlak) <strong>kök</strong>, su burçları (Yengeç, Akrep, Balık){" "}
            <strong>yaprak</strong>, hava burçları (İkizler, Terazi, Kova) <strong>çiçek</strong>, ateş burçları (Koç,
            Aslan, Yay) <strong>meyve</strong> günüdür. Her bitki, yenen kısmına uygun günde ekilir. Takvimde bu bilgi
            ayrıca gösterilmiştir; Anadolu&apos;nun halk takviminden farklı bir gelenektir.
          </p>

          <h2>Uygun günü nasıl buluyoruz?</h2>
          <p>
            Sayfanın başındaki araçta seçtiğiniz bitkinin yenen kısmına bakarız. Halk takvimine göre toprak üstünde
            ürün verenler büyüyen ayda, kökü yenenler küçülen ayda ekilir; dinlenme günleri her zaman dışarıda bırakılır.
            Bu günlerden, ayın biyodinamik takvimde de aynı bitki türüne uygun bir burçta olduğu günler ★ ile
            işaretlenir: örneğin domates için meyve günü, havuç için kök günü. Yani ★, iki geleneğin aynı güne işaret
            ettiği günlerdir. Budama, aşılama ve hasat gibi işler yalnızca halk takvimine göre gösterilir.
          </p>
          <p>
            Araç bitkinin ekim mevsimini bilmez. Domatesin fidesi dona dayanmaz, sarımsak ise çoğu bölgede sonbaharda
            dikilir. Ekim zamanını önce bölgenizin iklimine ve don tarihlerine göre seçin; ay takvimi, o mevsimin içinde
            gün seçmenize yardımcı olur.
          </p>

          <h2>Bilim ne diyor?</h2>
          <p>
            Ayın evrelerinin ekim verimine etkisini gösteren güçlü bir bilimsel kanıt yoktur. Bitkinin büyümesini asıl
            belirleyenler toprak, su, sıcaklık, gün ışığı süresi ve ekim mevsimidir. Ayın çekiminin bitkideki özsuyu
            hareket ettirecek kadar güçlü olmadığı kabul edilir.
          </p>
          <p>
            Yine de konu araştırılmaya devam ediyor. Antalya&apos;daki Batı Akdeniz Ormancılık Araştırma Enstitüsü,
            2012&apos;de başlattığı bir projede ayın dört ana evresinde kesilen kızılçam ağaçlarını incelemiş; ön
            bulgularda dolunay ve yeni ayda kesilen tomruklarda zararlı böceklerin arttığı gözlenmiştir. Bu çalışma ağaç
            kesimiyle ilgilidir, 40 ağaç üzerinde yapılmıştır ve ekim verimi hakkında bir sonuç içermez.
          </p>
          <p>
            Takvimi, yüzyıllardır süren bir tarım geleneğini doğru tarihlerle izlemek isteyenler için hazırladık. Ekim
            zamanını seçerken bölgenizin iklimini ve don tarihlerini mutlaka göz önünde bulundurun.
          </p>

          <h2>Ayın evresi ve burcu</h2>
          <p>
            Ayın bugünkü durumu için <Link href={PAGES.bugunAy.path}>Bugün Ay Nasıl?</Link>, ayın burcu için{" "}
            <Link href={PAGES.ayHangiBurcta.path}>Bugün Ay Hangi Burçta?</Link> sayfalarına bakabilirsiniz.
          </p>
        </Prose>

        <Faq items={FAQS.ekimDikim} />
        <section className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            Ayın evresi ve burcu her gün öğle saatine (Türkiye saati) göre hesaplanmıştır. Kaynak: Batı Akdeniz
            Ormancılık Araştırma Enstitüsü çalışmasına ilişkin{" "}
            <a
              href="https://www.cnnturk.com/turkiye/anadoludaki-kadim-inanis-bilimsel-olarak-dogrulandi-578602"
              rel="noopener"
              target="_blank"
              className="underline"
            >
              CNN Türk haberi (2016)
            </a>
            .
          </p>
          <p className="mt-2">
            Son güncelleme: <time dateTime={UPDATED}>29 Ekim 2026</time>
          </p>
        </section>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: PAGE.title,
          url: new URL(PAGE.path, siteConfig.url).toString(),
          inLanguage: "tr-TR",
          dateModified: UPDATED,
        }}
      />
    </>
  );
}

/* ---------- Araç: ne ekeceksiniz? ---------- */

interface DayInfo {
  /** "YYYYMMDD" */
  key: string;
  year: number;
  month: number;
  day: number;
  /** 0 = pazartesi */
  weekday: number;
  work: Work;
  bio: string;
  phaseAngle: number;
}

const dayKey = (year: number, month: number, day: number) =>
  `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;

/** Bugünden itibaren `count` günün ekim dikim bilgisi (öğle saatine göre; dinlenme ana evre gününe göre). */
function upcomingDays(count: number): DayInfo[] {
  const today = localDateParts(new Date(), timeZone);
  const from = zonedTimeToUtc(today.year, today.month, today.day - 2, 0, timeZone);
  // Yeni ay ve dolunayın düştüğü yerel günler; bir gün öncesi ve sonrası da dinlenmedir.
  const rest = new Set<string>();
  for (const p of getUpcomingPrincipalPhases(from, Math.ceil(count / 7) + 4)) {
    if (p.key !== "new-moon" && p.key !== "full-moon") continue;
    const d = localDateParts(p.date, timeZone);
    for (const o of [-1, 0, 1]) {
      const n = new Date(Date.UTC(d.year, d.month - 1, d.day + o));
      rest.add(dayKey(n.getUTCFullYear(), n.getUTCMonth() + 1, n.getUTCDate()));
    }
  }
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day + i));
    const [year, month, day] = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
    const noon = zonedTimeToUtc(year, month, day, 12, timeZone);
    const phase = getMoonPhase(noon, timeZone);
    const sign = getMoonSign(noon);
    const key = dayKey(year, month, day);
    return {
      key,
      year,
      month,
      day,
      weekday: (date.getUTCDay() + 6) % 7,
      work: rest.has(key) ? "dinlenme" : phase.isWaxing ? "ust" : "kok",
      bio: BIODYNAMIC[elementOf(sign.index)],
      phaseAngle: phase.phaseAngle,
    };
  });
}

const shortDate = (d: DayInfo) => `${d.day} ${MONTH_NAMES[d.month - 1]}`;
const longDate = (d: DayInfo) => `${shortDate(d)} ${WEEKDAYS_LONG[d.weekday]}`;
const nextDayKey = (d: DayInfo) => {
  const n = new Date(Date.UTC(d.year, d.month - 1, d.day + 1));
  return dayKey(n.getUTCFullYear(), n.getUTCMonth() + 1, n.getUTCDate());
};

async function SelectedFinder({ searchParams }: Pick<PageProps<"/tr/ay-takvimine-gore-ekim-dikim">, "searchParams">) {
  const { bitki, hs, ay } = await searchParams;
  return (
    <PlantFinder
      plant={typeof bitki === "string" && bitki in PLANTS ? bitki : undefined}
      weekend={hs === "1"}
      ay={parseMonth(ay) ? (ay as string) : undefined}
    />
  );
}

/** Seçilen bitki için önümüzdeki uygun günler. Saatte bir yenilenir. */
async function PlantFinder({ plant, weekend, ay }: { plant?: string; weekend: boolean; ay?: string }) {
  "use cache";
  cacheLife("hours");

  const days = upcomingDays(60);
  const today = days[0];
  const info = plant ? PLANTS[plant] : undefined;

  // Halk takvimine uyan günler: art arda olanlar tek dönem; hafta sonu seçeneğinde tek tek.
  const results: { first: DayInfo; last: DayInfo; best: DayInfo[] }[] = [];
  if (info) {
    let open: (typeof results)[number] | null = null;
    const limit = weekend ? 6 : 3;
    for (const d of days) {
      if (results.length >= limit) break;
      const ok = d.work === info.folk && (!weekend || d.weekday >= 5);
      const best = ok && info.bio === d.bio;
      if (weekend) {
        if (ok) results.push({ first: d, last: d, best: best ? [d] : [] });
        continue;
      }
      if (ok) {
        if (open) {
          open.last = d;
          if (best) open.best.push(d);
        } else open = { first: d, last: d, best: best ? [d] : [] };
      } else if (open) {
        results.push(open);
        open = null;
      }
    }
    if (open && results.length < limit) results.push(open);
  }

  const todayText =
    today.work === "dinlenme"
      ? "dinlenme günü (yeni ay ya da dolunay çevresi), gelenekte ekim dikim yapılmaz"
      : today.work === "ust"
        ? "büyüyen ay, toprak üstü ürünler ve aşılama için uygun"
        : "küçülen ay, kök bitkileri, budama ve hasat için uygun";

  return (
    <section className="bg-gradient-to-b from-[#0f1d14] to-[#0a1410] text-white" aria-labelledby="ekim-baslik">
      <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6">
        <Breadcrumb page={PAGE} tone="dark" />
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
            Geleneksel takvim
          </span>
        </div>
        <h1 id="ekim-baslik" className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Ay Takvimine Göre Ekim Dikim Takvimi
        </h1>

        <p className="mt-5 flex items-center gap-3 text-zinc-200">
          <MoonPhaseIcon phaseAngle={today.phaseAngle} size={36} title="" />
          <span>
            <strong className="text-white">Bugün ({longDate(today)}):</strong> {todayText}. Biyodinamik takvimde{" "}
            {today.bio.toLocaleLowerCase("tr-TR")} günü.
          </span>
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <h2 className="text-xl font-semibold">Ne ekeceksiniz?</h2>
          <p className="mt-1 text-sm text-zinc-400">Bir bitki ya da iş seçin, önümüzdeki uygun günleri gösterelim.</p>
          <div className="mt-4 space-y-3">
            {PLANT_GROUPS.map((g) => (
              <div key={g.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{g.title}</p>
                <div className="mt-1.5 flex flex-wrap gap-2" role="group" aria-label={g.title}>
                  {Object.entries(g.items).map(([slug, p]) => (
                    <Link
                      key={slug}
                      href={pageHref({ plant: slug, weekend, ay })}
                      rel="nofollow"
                      scroll={false}
                      aria-current={slug === plant ? "true" : undefined}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                        slug === plant
                          ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                          : "border-white/15 text-zinc-300 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Link
            href={pageHref({ plant, weekend: !weekend, ay })}
            rel="nofollow"
            scroll={false}
            aria-pressed={weekend}
            className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              weekend
                ? "border-indigo-300/70 bg-indigo-400/15 text-indigo-100"
                : "border-white/15 text-zinc-300 hover:border-white/30 hover:text-white"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-4 w-4 items-center justify-center rounded border text-[0.65rem] ${
                weekend ? "border-indigo-200 bg-indigo-300 text-[#0f1d14]" : "border-zinc-400"
              }`}
            >
              {weekend ? "✓" : ""}
            </span>
            Yalnız hafta sonu
          </Link>

          {info ? (
            <>
              <h3 className="mt-7 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {info.name} için önümüzdeki uygun {weekend ? "günler" : "dönemler"} ·{" "}
                {info.folk === "ust" ? "büyüyen ay" : "küçülen ay"}, dinlenme günleri hariç
              </h3>
              {results.length ? (
                <ul className="mt-3 space-y-3">
                  {results.map(({ first, last, best }) => {
                    const single = first.key === last.key;
                    const count = days.indexOf(last) - days.indexOf(first) + 1;
                    const icon = days[Math.floor((days.indexOf(first) + days.indexOf(last)) / 2)];
                    const event = {
                      summary: `${info.name}: ay takvimine göre uygun ${single ? "gün" : "dönem"}`,
                      description: `Ay takvimine göre geleneksel ekim dikim günü (${
                        info.folk === "ust" ? "büyüyen ay" : "küçülen ay"
                      }). Ekim zamanını bölgenizin iklimine göre seçin.`,
                      url: new URL(PAGE.path, siteConfig.url).toString(),
                      start: first.key,
                      end: nextDayKey(last),
                    };
                    const ics = buildSingleEventIcs({ ...event, uid: `ekim-${plant}-${first.key}` });
                    return (
                      <li
                        key={first.key}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <MoonPhaseIcon phaseAngle={icon.phaseAngle} size={40} title="" />
                          <div className="min-w-0">
                            <p className="font-semibold">
                              {single ? longDate(first) : `${shortDate(first)} – ${shortDate(last)}`}
                              {single && best.length > 0 && <span className="ml-1.5 text-amber-300">★</span>}
                              {first.key === today.key && (
                                <span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-medium text-emerald-200">
                                  bugün
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {single
                                ? `Biyodinamik: ${first.bio.toLocaleLowerCase("tr-TR")} günü`
                                : `${WEEKDAYS_LONG[first.weekday]} – ${WEEKDAYS_LONG[last.weekday]} · ${count} gün`}
                            </p>
                            {!single && info.bio && (
                              <p className="mt-0.5 text-sm">
                                {best.length ? (
                                  <span className="text-amber-300">
                                    ★ En uygun ({info.bio.toLocaleLowerCase("tr-TR")} günü):{" "}
                                    {best.map(shortDate).join(", ")}
                                  </span>
                                ) : (
                                  <span className="text-zinc-500">
                                    Bu dönemde biyodinamik {info.bio.toLocaleLowerCase("tr-TR")} günü yok
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 text-sm">
                          <a
                            href={googleCalendarLink(event)}
                            target="_blank"
                            rel="noopener nofollow"
                            className="rounded-full border border-white/15 px-3 py-1.5 text-zinc-200 hover:border-white/30 hover:text-white"
                          >
                            Google Takvim
                          </a>
                          <a
                            href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`}
                            download={`ekim-${plant}-${first.key}.ics`}
                            className="rounded-full border border-white/15 px-3 py-1.5 text-zinc-200 hover:border-white/30 hover:text-white"
                          >
                            Takvime ekle (.ics)
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-400">Önümüzdeki iki ayda bu koşula uyan gün bulunamadı.</p>
              )}
              <p className="mt-4 text-xs text-zinc-400">
                ⚠ Araç ekim mevsimini bilmez. Önce bölgenizin iklimine ve don tarihlerine göre mevsimi seçin; ay
                takvimi o mevsim içinde gün seçmek içindir.
              </p>
            </>
          ) : (
            <p className="mt-6 text-sm text-zinc-400">Yukarıdan bir bitki ya da iş seçin.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Aylık takvim ---------- */

async function SelectedMonth({ searchParams }: Pick<PageProps<"/tr/ay-takvimine-gore-ekim-dikim">, "searchParams">) {
  const { ay, bitki, hs } = await searchParams;
  const selected = parseMonth(ay);
  const plant = typeof bitki === "string" && bitki in PLANTS ? bitki : undefined;
  const weekend = hs === "1";
  return selected ? (
    <PlantingCalendar year={selected.year} month={selected.month} plant={plant} weekend={weekend} />
  ) : (
    <CurrentMonth plant={plant} weekend={weekend} />
  );
}

/** İçinde bulunulan ayın takvimi; "şu an" önbellek içinde okunur. */
async function CurrentMonth({ plant, weekend = false }: { plant?: string; weekend?: boolean }) {
  "use cache";
  cacheLife("hours");
  const { year, month } = currentMonth(timeZone);
  return <PlantingCalendar year={year} month={month} plant={plant} weekend={weekend} />;
}

interface PlantDay {
  day: number;
  weekday: number;
  work: Work;
  phaseAngle: number;
  signIndex: number;
  biodynamic: string;
  principal?: string;
}

/** Bir ayın ekim dikim takvimi. Saatte bir yenilenir (bugün vurgusu için). */
async function PlantingCalendar({
  year,
  month,
  plant,
  weekend,
}: {
  year: number;
  month: number;
  plant?: string;
  weekend: boolean;
}) {
  "use cache";
  cacheLife("hours");

  // Ayın ilk ve son gününün komşuları da dinlenme hesabı için gerekir.
  const prevCal = getMonthCalendar(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1, timeZone);
  const cal = getMonthCalendar(year, month, timeZone);
  const nextCal = getMonthCalendar(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, timeZone);
  const isRestAnchor = (c: (typeof cal)[number] | undefined) =>
    !!c?.principal && (c.principal.key === "new-moon" || c.principal.key === "full-moon");

  const days: PlantDay[] = cal.map((c, i) => {
    const before = i === 0 ? prevCal.at(-1) : cal[i - 1];
    const after = i === cal.length - 1 ? nextCal[0] : cal[i + 1];
    const noon = zonedTimeToUtc(year, month, c.day, 12, timeZone);
    const phase = getMoonPhase(noon, timeZone);
    const sign = getMoonSign(noon);
    const rest = isRestAnchor(c) || isRestAnchor(before) || isRestAnchor(after);
    return {
      day: c.day,
      weekday: c.weekday,
      work: rest ? "dinlenme" : phase.isWaxing ? "ust" : "kok",
      phaseAngle: phase.phaseAngle,
      signIndex: sign.index,
      biodynamic: BIODYNAMIC[elementOf(sign.index)],
      principal: isRestAnchor(c) ? c.principal!.name : undefined,
    };
  });

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const isToday = (d: PlantDay) => today === `${monthParam(year, month)}-${String(d.day).padStart(2, "0")}`;
  const { prev, next } = adjacentMonths(year, month);
  const monthName = MONTH_NAMES[month - 1];
  const ranges = (work: Work) => {
    const out: [number, number][] = [];
    for (const d of days) {
      if (d.work !== work) continue;
      const last = out.at(-1);
      if (last && last[1] === d.day - 1) last[1] = d.day;
      else out.push([d.day, d.day]);
    }
    return out.length ? out.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(", ") : "-";
  };
  const cellTone: Record<Work, string> = {
    ust: "bg-emerald-400/[0.08]",
    kok: "bg-orange-400/[0.07]",
    dinlenme: "bg-white/[0.02]",
  };

  return (
    <section className="bg-gradient-to-b from-[#0a1410] to-[#05070d] text-white" aria-labelledby="ekim-takvim">
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-zinc-400">Aylık ekim dikim takvimi</p>
            <h2 id="ekim-takvim" className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {monthName} {year}
            </h2>
          </div>
          <nav aria-label="Ay değiştir" className="flex items-center gap-2">
            {prev.year >= MIN_YEAR && (
              <MonthLink
                href={pageHref({ plant, weekend, ay: monthParam(prev.year, prev.month) })}
                label={`${MONTH_NAMES[prev.month - 1]} ${prev.year}`}
              >
                ‹
              </MonthLink>
            )}
            <Link
              href={pageHref({ plant, weekend })}
              rel="nofollow"
              scroll={false}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:border-white/30 hover:text-white"
            >
              Bu ay
            </Link>
            {next.year <= MAX_YEAR && (
              <MonthLink
                href={pageHref({ plant, weekend, ay: monthParam(next.year, next.month) })}
                label={`${MONTH_NAMES[next.month - 1]} ${next.year}`}
              >
                ›
              </MonthLink>
            )}
          </nav>
        </div>

        <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["ust", "kok", "dinlenme"] as Work[]).map((w) => (
            <div key={w} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <dt className={`text-xs uppercase tracking-wider ${WORK[w].tone}`}>{WORK[w].label}</dt>
              <dd className="mt-1 font-semibold">
                {monthName}: {ranges(w)}
              </dd>
              <dd className="mt-1 text-xs text-zinc-400">{WORK[w].text}</dd>
            </div>
          ))}
        </dl>

        {/* Masaüstü: takvim ızgarası */}
        <div className="mt-8 hidden md:block">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {WEEKDAYS_SHORT.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <ol className="mt-2 grid grid-cols-7 gap-2">
            {days.map((d) => (
              <li
                key={d.day}
                style={d.day === 1 ? { gridColumnStart: d.weekday + 1 } : undefined}
                className={`flex flex-col gap-1 rounded-xl p-2 ${cellTone[d.work]} ${
                  isToday(d) ? "outline outline-2 outline-white/70" : ""
                }`}
                aria-current={isToday(d) ? "date" : undefined}
              >
                <span className="text-sm font-semibold tabular-nums">{d.day}</span>
                <div className="flex items-center gap-1.5">
                  <MoonPhaseIcon phaseAngle={d.phaseAngle} size={26} title="" />
                  <span className="text-lg text-amber-200" aria-hidden="true">
                    {ZODIAC_SYMBOLS[d.signIndex]}
                  </span>
                </div>
                <span className={`text-[0.7rem] font-medium ${WORK[d.work].tone}`}>{WORK[d.work].short}</span>
                <span className="text-[0.65rem] text-zinc-400">
                  {d.principal ?? `Biyodinamik: ${d.biodynamic.toLocaleLowerCase("tr-TR")}`}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Telefon: liste */}
        <ol className="mt-8 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 md:hidden">
          {days.map((d) => (
            <li key={d.day} className={`flex items-center gap-3 px-4 py-2.5 ${isToday(d) ? "bg-white/10" : ""}`}>
              <span className="w-12 shrink-0 leading-tight">
                <span className="block font-semibold tabular-nums">{d.day}</span>
                <span className="block text-xs text-zinc-500">{WEEKDAYS_SHORT[d.weekday]}</span>
              </span>
              <MoonPhaseIcon phaseAngle={d.phaseAngle} size={30} title="" />
              <span className="min-w-0 flex-1 leading-tight">
                <span className={`block text-sm font-medium ${WORK[d.work].tone}`}>{WORK[d.work].label}</span>
                <span className="block text-xs text-zinc-400">
                  {d.principal ?? `Biyodinamik: ${d.biodynamic.toLocaleLowerCase("tr-TR")} günü`}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
