import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  getMonthCalendar,
  getMoonPhase,
  getNextBlueMoon,
  getUpcomingPrincipalPhases,
  type CalendarDay,
  type PrincipalPhase,
} from "@moon-app/moon";
import { Faq } from "@/components/Faq";
import { FAQS } from "@/lib/faqs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { MonthLink } from "@/components/MonthLink";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { AnswerBox, DataTable } from "@/components/InfoTables";
import { Byline } from "@/components/Byline";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import {
  adjacentMonths,
  currentMonth,
  MAX_YEAR,
  MIN_YEAR,
  MONTH_NAMES as MONTHS,
  monthParam,
  parseMonth,
  WEEKDAYS_SHORT as WEEKDAYS,
} from "@/lib/months";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.ayTakvimi;
const UPDATED = "2026-11-01";
const timeZone = siteConfig.defaultLocation.timeZone;
const src = pageSources("usnoMoonPhases", "nasaPhaseCatalog", "nasaMoonFactSheet");

export const metadata: Metadata = {
  title: `Ay Takvimi: Aylık Ay Evreleri, Dolunay ve Yeni Ay Günleri | ${siteConfig.name}`,
  description:
    "Ay takvimi: bu ayın her günü için ay evresi ve aydınlık oranı, dolunay, yeni ay ve dördün tarihleri saatleriyle (Türkiye saati). Önceki ve sonraki aylara geçebilirsiniz.",
  // Ay seçimi (?ay=...) ayrı sayfa sayılmasın: Google'a her zaman tek adres gösterilir.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function MoonCalendarPage({ searchParams }: PageProps<"/tr/ay-takvimi">) {
  return (
    <>
      {/* Seçili ay isteğe göre değişir. Beklerken (ve Google için) içinde bulunulan ay gösterilir. */}
      <Suspense fallback={<CurrentMonth />}>
        <SelectedMonth searchParams={searchParams} />
      </Suspense>
      <QuickLinks
        links={[
          { href: "#cevap", label: "Bu ayın evreleri" },
          { href: "#yillik", label: "Yıllık evre tablosu" },
          { href: "#nasil-okunur", label: "Nasıl okunur?" },
          { href: "#mavi-ay", label: "Mavi ay" },
          { href: "#hicri", label: "Hicri takvimle farkı" },
          { href: "#sss", label: "Sık sorulanlar" },
        ]}
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <MonthAnswer />
        <YearTables />
        <Explainer />
        <Faq items={FAQS.ayTakvimi} />
        <ArticleFooter
          page={PAGE}
          headline="Ay Takvimi: Aylık Ay Evreleri, Dolunay ve Yeni Ay Günleri"
          updated={UPDATED}
          src={src}
        />
      </main>
    </>
  );
}

async function SelectedMonth({ searchParams }: Pick<PageProps<"/tr/ay-takvimi">, "searchParams">) {
  const { ay } = await searchParams;
  const selected = parseMonth(ay);
  return selected ? <MonthCalendar year={selected.year} month={selected.month} /> : <CurrentMonth />;
}

async function CurrentMonth() {
  "use cache";
  cacheLife("hours");

  const { year, month } = currentMonth(timeZone);
  return <MonthCalendar year={year} month={month} />;
}

/** Bir ayın takvimi: koyu giriş alanı, ay değiştirme, ana evreler ve günler. Saatte bir yenilenir. */
async function MonthCalendar({ year, month }: { year: number; month: number }) {
  "use cache";
  cacheLife("hours");

  const days = getMonthCalendar(year, month, timeZone);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const isToday = (d: CalendarDay) => today === `${monthParam(year, month)}-${String(d.day).padStart(2, "0")}`;

  const { prev, next } = adjacentMonths(year, month);
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const principals = days.filter((d) => d.principal);

  return (
    <section className="starfield bg-[#05070d] text-white" aria-labelledby="takvim-baslik">
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6">
        <Breadcrumb page={PAGE} tone="dark" />
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Ay takvimi</p>
            <h1 id="takvim-baslik" className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
              {MONTHS[month - 1]} {year}
            </h1>
            <Byline updated={UPDATED} />
          </div>
          <nav aria-label="Ay değiştir" className="flex items-center gap-2">
            {prev.year >= MIN_YEAR && (
              <MonthLink
                href={`${PAGE.path}?ay=${monthParam(prev.year, prev.month)}`}
                label={`${MONTHS[prev.month - 1]} ${prev.year}`}
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
                label={`${MONTHS[next.month - 1]} ${next.year}`}
              >
                ›
              </MonthLink>
            )}
          </nav>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {principals.map((d) => (
            <li key={d.day} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
              <MoonPhaseIcon phaseAngle={d.phase.phaseAngle} size={40} title={d.principal!.name} />
              <div className="leading-tight">
                <p className="font-semibold">{d.principal!.name}</p>
                <p className="text-sm text-zinc-400">
                  {d.day} {MONTHS[month - 1]} · {time.format(d.principal!.date)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Masaüstü: takvim ızgarası */}
        <div className="mt-8 hidden md:block">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <ol className="mt-2 grid grid-cols-7 gap-2">
            {days.map((d) => (
              <li
                key={d.day}
                style={d.day === 1 ? { gridColumnStart: d.weekday + 1 } : undefined}
                className={`flex flex-col items-center rounded-xl px-1 pb-2 pt-1.5 ${
                  d.principal
                    ? "bg-indigo-500/15 ring-1 ring-indigo-400/60"
                    : isToday(d)
                      ? "bg-white/10 ring-1 ring-white/40"
                      : "bg-white/[0.03]"
                }`}
                aria-current={isToday(d) ? "date" : undefined}
              >
                <span className="self-start pl-1 text-sm font-semibold tabular-nums text-zinc-300">
                  {d.day}
                  {isToday(d) && <span className="ml-1 text-[0.65rem] font-medium uppercase text-white">Bugün</span>}
                </span>
                <MoonPhaseIcon phaseAngle={d.phase.phaseAngle} size={52} title={`${d.day}: ${d.phase.name}`} />
                <span className="mt-1 text-xs tabular-nums text-zinc-400">
                  %{Math.round(d.phase.illumination * 100)}
                </span>
                {d.principal && (
                  <span className="mt-0.5 text-center text-[0.7rem] font-semibold leading-tight text-indigo-200">
                    {d.principal.name} {time.format(d.principal.date)}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Telefon: gün gün liste */}
        <ol className="mt-8 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 md:hidden">
          {days.map((d) => (
            <li
              key={d.day}
              className={`flex items-center gap-3 px-4 py-2.5 ${
                d.principal ? "bg-indigo-500/15" : isToday(d) ? "bg-white/10" : ""
              }`}
            >
              <span className="w-14 shrink-0 leading-tight">
                <span className="block font-semibold tabular-nums">{d.day}</span>
                <span className="block text-xs text-zinc-500">{WEEKDAYS[d.weekday]}</span>
              </span>
              <MoonPhaseIcon phaseAngle={d.phase.phaseAngle} size={36} title={d.phase.name} />
              <span className="min-w-0 flex-1 leading-tight">
                <span className={`block text-sm ${d.principal ? "font-semibold text-indigo-200" : "text-zinc-200"}`}>
                  {d.principal ? `${d.principal.name} · ${time.format(d.principal.date)}` : d.phase.name}
                </span>
                {isToday(d) && <span className="text-xs font-medium uppercase text-white">Bugün</span>}
              </span>
              <span className="text-sm tabular-nums text-zinc-400">%{Math.round(d.phase.illumination * 100)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Açıklama metni; içindeki tarihler (mavi ay, 19 yıllık döngü örneği) hesaplanır. */
async function Explainer() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const blue = getNextBlueMoon(now, timeZone);

  // 19 yıllık döngü örneği: bir sonraki dolunay ve 19 yıl sonraki karşılığı.
  const nextFull = getUpcomingPrincipalPhases(now, 4).find((p) => p.key === "full-moon")!;
  const nineteen = new Date(nextFull.date);
  nineteen.setUTCFullYear(nineteen.getUTCFullYear() + 19);
  const repeat = getUpcomingPrincipalPhases(new Date(nineteen.getTime() - 3 * 86_400_000), 4).find(
    (p) => p.key === "full-moon",
  )!;

  return (
    <Prose>
      <h2 id="nasil-okunur">Ay takvimi nasıl okunur?</h2>
      <p>
        Takvimdeki her kutu, ayın o günün akşamı saat 21:00&apos;de nasıl göründüğünü gösterir. Yüzde değeri, ay
        diskinin ne kadarının aydınlık olduğudur. Vurgulu kutular ana evrelerin günleridir:{" "}
        <Link href={PAGES.yeniAy.path}>yeni ay</Link>, <Link href={PAGES.ilkDordun.path}>ilk dördün</Link>,{" "}
        <Link href={PAGES.dolunay.path}>dolunay</Link> ve <Link href={PAGES.sonDordun.path}>son dördün</Link>. Bu
        evreler aslında tek bir andır; kutuda o anın saati de yazar.
      </p>
      <p>
        Bir ayda genellikle dört ana evre bulunur. Ama ay döngüsü 29,5 gün sürdüğü için 31 günlük aylarda zaman zaman
        beşinci bir ana evre de sığar.
      </p>

      <h2>Evreler neden her ay farklı günlere düşer?</h2>
      <p>
        Takvim aylarımız 28 ile 31 gün arasında sürer, ay döngüsü ise ortalama 29,5 gündür.{src.ref("nasaMoonFactSheet")} Bu küçük fark birikir: bir
        ay 15&apos;inde olan dolunay, ertesi ay genellikle bir gün kadar daha erkene kayar. Bir yılda 12 tam ay döngüsü
        354 gün eder. Bu yüzden ay evreleri her yıl yaklaşık 11 gün geriye kayar. Hicri takvimdeki ayların her yıl 11
        gün öne gelmesinin nedeni de budur.
      </p>
      <h3>19 yılda bir aynı tarihler</h3>
      <p>
        Bu kaymanın güzel bir düzeni vardır: 19 yıl, neredeyse tam olarak 235 ay döngüsüne eşittir. Bu yüzden ay
        evreleri 19 yıl sonra hemen hemen aynı tarihlere geri döner. Eski Yunan astronomu Meton&apos;un adıyla{" "}
        <strong>Meton döngüsü</strong> denir. Örneğin bir sonraki dolunayın tarihi {date.format(nextFull.date)}, 19 yıl
        sonraki karşılığının tarihi ise {date.format(repeat.date)}.
      </p>

      <h2 id="mavi-ay">Mavi ay nedir?</h2>
      <p>
        Bazen bir takvim ayına iki dolunay sığar. Bu durumda ikinci dolunaya <strong>mavi ay</strong> denir. Adı
        renginden değil, İngilizcedeki &quot;once in a blue moon&quot; (çok nadiren) deyiminden gelir; ay o gece de her
        zamanki rengindedir. İki dolunay arası 29,5 gün olduğu için bu yalnızca 30 ya da 31 günlük aylarda, ortalama iki
        üç yılda bir yaşanır.
      </p>
      {blue && (
        <p>
          Türkiye saatine göre bir sonraki mavi ay <strong>{date.format(blue.date)}</strong> tarihindedir. Takvimi o aya
          getirerek aynı aydaki iki dolunayı görebilirsiniz.
        </p>
      )}

      <h2 id="hicri">Ay takvimi ile Hicri takvim aynı şey mi?</h2>
      <p>
        Değil. Bu sayfadaki takvim, bildiğimiz Miladi takvimin günleri üzerine ayın evrelerini yerleştirir. Hicri takvim
        ise başlı başına bir ay takvimidir: her ayı, <Link href={PAGES.yeniAy.path}>yeni aydan</Link> sonra ilk{" "}
        <Link href={PAGES.hilal.path}>hilalin</Link> görülmesiyle başlar ve 29 ya da 30 gün sürer. Hicri bir yıl 354 ya
        da 355 gündür. Resmî dinî günler için Diyanet&apos;in takvimine bakmak gerekir.
      </p>
    </Prose>
  );
}

const dayMonthWeekday = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", weekday: "long" });
const dayMonthShort = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "short" });
const fullDate = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
const hm = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

function yearOf(d: Date): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(d));
}

/** Sayfanın sorusunun cevabı, en üstte: içinde bulunulan ayın ana evreleri ve bugünün ayı. Saatte bir yenilenir. */
async function MonthAnswer() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const { year, month } = currentMonth(timeZone);
  const principals = getMonthCalendar(year, month, timeZone).flatMap((d) => (d.principal ? [d.principal] : []));
  const today = getMoonPhase(now, timeZone);
  const name = `${MONTHS[month - 1]} ${year}`;
  const newMoon = principals.find((p) => p.key === "new-moon");
  const fullMoons = principals.filter((p) => p.key === "full-moon");
  const blue = fullMoons.length >= 2 ? null : getNextBlueMoon(now, timeZone);

  const parts = [
    newMoon && `yeni ay ${dayMonthWeekday.format(newMoon.date)}`,
    fullMoons[0] && `dolunay ${dayMonthWeekday.format(fullMoons[0].date)}`,
  ].filter(Boolean);

  return (
    <AnswerBox
      question={`${name} ay takvimi`}
      answer={`${name} ayında ${parts.join(", ")} günü.`}
      rows={[
        { label: "Bugünkü ay", value: `${today.name}, %${Math.round(today.illumination * 100)} aydınlık` },
        ...principals.map((p) => ({
          label: p.name,
          value: `${dayMonthWeekday.format(p.date)}, ${hm.format(p.date)}`,
        })),
        {
          label: "Bu ay mavi ay var mı?",
          value:
            fullMoons.length >= 2
              ? `Evet: ${dayMonthWeekday.format(fullMoons[1].date)} dolunayı, ayın ikinci dolunayı.`
              : blue
                ? `Hayır. Sıradaki mavi ay ${fullDate.format(blue.date)}.`
                : "Hayır.",
        },
      ]}
      note={
        <>
          Saatler Türkiye saatidir (UTC+3) ve ABD Deniz Gözlemevi tablolarıyla karşılaştırılmıştır.{src.ref("usnoMoonPhases")}{" "}
          Takvimdeki her kutu, ayın o akşam saat 21:00&apos;deki görünüşünü gösterir.
        </>
      }
    />
  );
}

interface LunationRow {
  key: string;
  newMoon?: PrincipalPhase;
  firstQuarter?: PrincipalPhase;
  fullMoon?: PrincipalPhase;
  lastQuarter?: PrincipalPhase;
  /** Döngünün süresi (bu yeni aydan bir sonrakine), milisaniye. */
  length?: number;
}

/** Bir yılın ay döngüleri: her satır bir yeni ayla başlar (timeanddate "Moon Phases" tablosu gibi). */
function yearLunations(year: number): LunationRow[] {
  // Yılın başından biraz önce başlayıp yılın sonundan sonraki ilk yeni aya kadar.
  const all = getUpcomingPrincipalPhases(new Date(Date.UTC(year - 1, 11, 31, 21)), 4 * 14);
  const rows: LunationRow[] = [];
  for (const p of all) {
    if (yearOf(p.date) !== year) continue;
    if (p.key === "new-moon" || rows.length === 0) rows.push({ key: p.date.toISOString() });
    const row = rows[rows.length - 1];
    if (p.key === "new-moon") row.newMoon = p;
    else if (p.key === "first-quarter") row.firstQuarter = p;
    else if (p.key === "full-moon") row.fullMoon = p;
    else if (p.key === "last-quarter") row.lastQuarter = p;
  }
  const newMoons = all.filter((p) => p.key === "new-moon");
  for (const row of rows) {
    if (!row.newMoon) continue;
    const next = newMoons.find((n) => n.date > row.newMoon!.date);
    if (next) row.length = next.date.getTime() - row.newMoon.date.getTime();
  }
  return rows;
}

function formatLength(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000);
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  return `${d} gün ${h} sa ${m} dk`;
}

function PhaseCell({ p }: { p?: PrincipalPhase }) {
  if (!p) return <span className="text-zinc-400">-</span>;
  return (
    <span className="whitespace-nowrap tabular-nums">
      {dayMonthShort.format(p.date)} <span className="text-zinc-500">{hm.format(p.date)}</span>
    </span>
  );
}

/** Yıllık evre tablosu: bu yıl; Ekim'den itibaren gelecek yıl da (aramalar o yıla döner). Günde bir yenilenir. */
async function YearTables() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const { year, month } = currentMonth(timeZone);
  const years = month >= 10 ? [year, year + 1] : [year];

  return (
    <section aria-labelledby="yillik" className="mt-14">
      <h2 id="yillik" data-toc-label="Yıllık evre tablosu" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        {years.join(" ve ")} ay evreleri takvimi
      </h2>
      <p className="mt-3 text-zinc-700 dark:text-zinc-300">
        Yılın bütün ana evreleri, Türkiye saatiyle. Her satır bir yeni ayla başlar ve bir ay döngüsünü gösterir; içinde
        bulunduğumuz döngü vurgulanmıştır.
      </p>
      {years.map((y) => {
        const rows = yearLunations(y);
        const current = rows.find(
          (r) => r.newMoon && r.length && r.newMoon.date <= now && now.getTime() < r.newMoon.date.getTime() + r.length,
        );
        return (
          <div key={y} className="mt-8">
            {years.length > 1 && <h3 className="text-lg font-semibold">{y}</h3>}
            <DataTable
              columns={["Yeni ay", "İlk dördün", "Dolunay", "Son dördün", "Döngü süresi"]}
              highlight={current?.key}
              dim={(key) => {
                const r = rows.find((x) => x.key === key);
                const last = r?.lastQuarter ?? r?.fullMoon ?? r?.firstQuarter ?? r?.newMoon;
                return !!last && last.date < now && r !== current;
              }}
              rows={rows.map((r) => ({
                key: r.key,
                cells: [
                  <PhaseCell key="n" p={r.newMoon} />,
                  <PhaseCell key="f" p={r.firstQuarter} />,
                  <PhaseCell key="d" p={r.fullMoon} />,
                  <PhaseCell key="l" p={r.lastQuarter} />,
                  r.length ? (
                    <span key="s" className="whitespace-nowrap tabular-nums">
                      {formatLength(r.length)}
                    </span>
                  ) : (
                    <span key="s" className="text-zinc-400">-</span>
                  ),
                ],
              }))}
            />
          </div>
        );
      })}
      <p className="mt-3 text-sm text-zinc-500">
        Döngü süresi, iki yeni ay arasındaki zamandır. Ortalaması 29 gün 12 saat 44 dakikadır, ama Güneş&apos;in
        çekimi yüzünden her döngü farklıdır: en kısası yaklaşık 29 gün 6 saat, en uzunu 29 gün 19 saat sürer.
        {src.ref("nasaPhaseCatalog")} Saatler kendi hesabımızdır; ABD Deniz Gözlemevi tablolarıyla en fazla bir dakika
        farkla örtüşür (fark saniyeleri yuvarlamaktan gelir).{src.ref("usnoMoonPhases")}{" "}
        <Link href={PAGES.yontem.path} className="underline underline-offset-2">
          Hesap ne kadar doğru?
        </Link>
      </p>
    </section>
  );
}
