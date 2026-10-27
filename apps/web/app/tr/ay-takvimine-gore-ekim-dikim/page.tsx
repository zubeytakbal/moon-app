import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { getMonthCalendar, getMoonPhase, getMoonSign, zonedTimeToUtc } from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { MonthLink } from "@/components/MonthLink";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
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
const UPDATED = "2026-10-27";
const timeZone = siteConfig.defaultLocation.timeZone;

export const metadata: Metadata = {
  title: `Ay Takvimine Göre Ekim Dikim Takvimi: Bu Ay Ne Zaman Ne Ekilir? | ${siteConfig.name}`,
  description:
    "Ay takvimine göre ekim dikim günleri: büyüyen ayda toprak üstü ürünler, küçülen ayda kök bitkileri ve budama, yeni ay ve dolunayda dinlenme. Biyodinamik kök, yaprak, çiçek ve meyve günleri. İstediğiniz ayı seçin.",
  // Ay seçimi (?ay=...) ayrı sayfa sayılmasın.
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

export default function PlantingCalendarPage({ searchParams }: PageProps<"/tr/ay-takvimine-gore-ekim-dikim">) {
  return (
    <>
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
            Son güncelleme: <time dateTime={UPDATED}>27 Ekim 2026</time>
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

async function SelectedMonth({ searchParams }: Pick<PageProps<"/tr/ay-takvimine-gore-ekim-dikim">, "searchParams">) {
  const { ay } = await searchParams;
  const selected = parseMonth(ay);
  return selected ? <PlantingCalendar year={selected.year} month={selected.month} /> : <CurrentMonth />;
}

async function CurrentMonth() {
  "use cache";
  cacheLife("hours");
  const { year, month } = currentMonth(timeZone);
  return <PlantingCalendar year={year} month={month} />;
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
async function PlantingCalendar({ year, month }: { year: number; month: number }) {
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
    <section className="bg-gradient-to-b from-[#0f1d14] to-[#05070d] text-white" aria-labelledby="ekim-baslik">
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6">
        <Breadcrumb page={PAGE} tone="dark" />
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
            Geleneksel takvim
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-lg font-medium text-zinc-300">Ay takvimine göre ekim dikim</p>
            <h1 id="ekim-baslik" className="mt-1 text-4xl font-bold tracking-tight sm:text-6xl">
              {monthName} {year}
            </h1>
          </div>
          <nav aria-label="Ay değiştir" className="flex items-center gap-2">
            {prev.year >= MIN_YEAR && (
              <MonthLink
                href={`${PAGE.path}?ay=${monthParam(prev.year, prev.month)}`}
                label={`${MONTH_NAMES[prev.month - 1]} ${prev.year}`}
              >
                ‹
              </MonthLink>
            )}
            <Link
              href={PAGE.path}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:border-white/30 hover:text-white"
            >
              Bu ay
            </Link>
            {next.year <= MAX_YEAR && (
              <MonthLink
                href={`${PAGE.path}?ay=${monthParam(next.year, next.month)}`}
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
