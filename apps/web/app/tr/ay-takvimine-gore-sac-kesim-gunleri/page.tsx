import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { getMonthCalendar, getMoonPhase, getMoonSign, getMoonSignIngresses, zonedTimeToUtc } from "@moon-app/moon";
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
import { ZODIAC_SYMBOLS } from "@/lib/zodiac";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.sacKesim;
const UPDATED = "2026-10-29";
const timeZone = siteConfig.defaultLocation.timeZone;
/** Gelenekte saç kesimi için en çok önerilen burç. */
const FAVORED_SIGN = "Aslan";
const WEEKDAYS_LONG = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export const metadata: Metadata = {
  title: `Ay Takvimine Göre Saç Kesim Günleri: Size Uygun Gün Hangisi? | ${siteConfig.name}`,
  description:
    "Ay takvimine göre saç kesim günleri: saçınız hızlı uzasın mı, şeklini mi korusun? Önümüzdeki uygun günleri bulun, takviminize ekleyin. Büyüyen ay, küçülen ay ve ayın burcu aylık takvimde.",
  // Ay ve amaç seçimi (?ay=, ?amac=) ayrı sayfa sayılmasın: Google'a her zaman tek adres gösterilir.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

/** Aracın seçenekleri. Yalnızca sayfada anlatılan geleneksel kurallar kullanılır. */
const GOALS = {
  uzatma: {
    label: "Hızlı uzasın",
    rule: "büyüyen ay",
    summary: "Saç kesimi: uzaması için uygun (büyüyen ay)",
  },
  koruma: {
    label: "Şeklini korusun",
    rule: "küçülen ay",
    summary: "Saç kesimi: şeklini koruması için uygun (küçülen ay)",
  },
  "en-iyi": {
    label: "En çok önerilen ★",
    rule: `büyüyen ay ${FAVORED_SIGN} burcunda`,
    summary: `Saç kesimi: geleneğin en çok önerdiği gün (büyüyen ay, ${FAVORED_SIGN})`,
  },
} as const;
type Goal = keyof typeof GOALS;

function parseGoal(value: string | string[] | undefined): Goal {
  return typeof value === "string" && value in GOALS ? (value as Goal) : "uzatma";
}

/** Aracın ve takvimin seçimlerini koruyarak sayfa adresi üretir; varsayılan değerler adrese yazılmaz. */
function pageHref({ goal, weekend, ay }: { goal: Goal; weekend: boolean; ay?: string }) {
  const params = new URLSearchParams();
  if (goal !== "uzatma") params.set("amac", goal);
  if (weekend) params.set("hs", "1");
  if (ay) params.set("ay", ay);
  const query = params.toString();
  return query ? `${PAGE.path}?${query}` : PAGE.path;
}

export default function HairCutDaysPage({ searchParams }: PageProps<"/tr/ay-takvimine-gore-sac-kesim-gunleri">) {
  return (
    <>
      <Suspense fallback={<HairFinder goal="uzatma" weekend={false} />}>
        <SelectedFinder searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<CurrentMonth />}>
        <SelectedMonth searchParams={searchParams} />
      </Suspense>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>
            Geleneğe göre büyüyen ayda kesilen saç daha hızlı uzar, küçülen ayda kesilen saç şeklini daha uzun korur.
          </li>
          <li>Ay {FAVORED_SIGN} burcundayken ve büyürken yapılan kesim, gelenekte en çok önerilen kesimdir.</li>
          <li>
            Bu bir halk geleneğidir; saçın uzama hızının ayın evresine bağlı olduğuna dair bilimsel bir kanıt yoktur.
          </li>
        </QuickFacts>

        <Prose>
          <h2>Ay takvimine göre saç kesimi nedir?</h2>
          <p>
            Ayın evrelerine göre saç kesme günü seçmek, Anadolu&apos;da ve dünyanın pek çok yerinde kuşaktan kuşağa
            aktarılan bir gelenektir. Geleneğin temeli basit bir benzetmeye dayanır: ay büyürken kesilen saç da ay gibi
            &quot;büyür&quot;, ay küçülürken kesilen saç ise yavaş uzar ve şeklini korur. Son yıllarda bu geleneğe ayın
            bulunduğu burç da eklenmiştir.
          </p>

          <h2>Gelenekteki kurallar</h2>
          <p>Kaynaklar arasında farklılıklar olsa da en yaygın kurallar şunlardır:</p>
          <ul>
            <li>
              <strong>Büyüyen ay (yeni aydan dolunaya):</strong> Saçın hızlı ve gür uzaması isteniyorsa bu dönem
              önerilir. Uzun saç isteyenlerin tercihi.
            </li>
            <li>
              <strong>Küçülen ay (dolunaydan yeni aya):</strong> Kısa bir modelin şeklini uzun süre korumak, saçın yavaş
              uzaması isteniyorsa bu dönem önerilir. Bazı kaynaklar dökülmeye karşı da bu dönemi önerir.
            </li>
            <li>
              <strong>Ay {FAVORED_SIGN} burcundayken:</strong> Gelenekte saç için en uygun burç olarak geçer. Ay hem
              büyüyor hem de {FAVORED_SIGN} burcundaysa, takvimde bu günler yıldızla işaretlenmiştir. Bazı kaynaklar
              Başak burcunu da uygun sayar.
            </li>
          </ul>
          <p>
            Haber sitelerinde ve uygulamalarda yayımlanan saç kesim takvimleri bu kurallardan farklı olanlarını seçip
            birleştirdiği için birbirini tutmayabilir. Bu sayfada yalnızca yukarıdaki yaygın kurallar uygulanmış, ayın
            evresi ve burcu astronomik olarak hesaplanmıştır.
          </p>

          <h2>Uygun günü nasıl buluyoruz?</h2>
          <p>
            Sayfanın başındaki araç, bugünden başlayarak her günü tek tek inceler: o gün öğle saatinde ay büyüyor mu,
            küçülüyor mu ve hangi burçta? Seçtiğiniz amaca uyan günler art arda geliyorsa tek bir dönem olarak
            gösterilir; &quot;yalnız hafta sonu&quot; seçeneğinde ise uygun cumartesi ve pazar günleri tek tek
            listelenir. Büyüyen ayın {FAVORED_SIGN} burcuna denk gelmesi yılda yalnızca birkaç kez olduğu için bu
            seçenekte bir yıl ilerisine kadar bakılır. Bulduğunuz günü Google Takvim&apos;e ya da telefonunuzun
            takvimine tek dokunuşla ekleyebilirsiniz.
          </p>

          <h2>Bilim ne diyor?</h2>
          <p>
            Saç, ayda ortalama 1 santimetre kadar uzar. Uzama hızını genetik yapı, yaş, hormonlar, beslenme ve genel
            sağlık belirler. Saç kökleri derinin altındadır ve kesimin zamanından etkilenmez. Ayın evresinin ya da
            burcunun saçın uzaması veya dökülmesi üzerinde bir etkisi olduğunu gösteren bilimsel bir çalışma yoktur.
          </p>
          <p>
            Yine de bu gelenek, saç bakımını düzenli bir takvime bağlamanın keyifli bir yolu olarak sürüyor. Bu sayfayı
            bir inanç ya da öneri olarak değil, geleneğin hangi günlere işaret ettiğini doğru tarihlerle gösteren bir
            takvim olarak hazırladık.
          </p>

          <h2>Ayın burcu ve evresi</h2>
          <p>
            Ayın bugünkü burcunu ve burç geçiş saatlerini{" "}
            <Link href={PAGES.ayHangiBurcta.path}>Bugün Ay Hangi Burçta?</Link>, ayın evrelerini ve aylık görünümünü{" "}
            <Link href={PAGES.ayTakvimi.path}>Ay Takvimi</Link> sayfasında bulabilirsiniz.
          </p>
        </Prose>

        <Faq items={FAQS.sacKesim} />
        <section className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            Ayın evresi ve burcu her gün öğle saatine (Türkiye saati) göre hesaplanmıştır. Ay o gün burç değiştiriyorsa
            geçiş saati ayrıca gösterilir.
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

/* ---------- Araç: size uygun günü bulun ---------- */

interface DayInfo {
  /** Bugünden kaç gün sonra. */
  offset: number;
  /** "YYYYMMDD" */
  key: string;
  year: number;
  month: number;
  day: number;
  /** 0 = pazartesi */
  weekday: number;
  waxing: boolean;
  phaseAngle: number;
  signName: string;
  signIndex: number;
}

/** Türkiye'de bugünden `offset` gün sonraki günün öğle saatindeki ay bilgisi. */
function dayInfo(base: { year: number; month: number; day: number }, offset: number): DayInfo {
  const date = new Date(Date.UTC(base.year, base.month - 1, base.day + offset));
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const noon = zonedTimeToUtc(year, month, day, 12, timeZone);
  const phase = getMoonPhase(noon, timeZone);
  const sign = getMoonSign(noon);
  return {
    offset,
    key: `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`,
    year,
    month,
    day,
    weekday: (date.getUTCDay() + 6) % 7,
    waxing: phase.isWaxing,
    phaseAngle: phase.phaseAngle,
    signName: sign.name,
    signIndex: sign.index,
  };
}

function matches(goal: Goal, d: DayInfo) {
  if (goal === "uzatma") return d.waxing;
  if (goal === "koruma") return !d.waxing;
  return d.waxing && d.signName === FAVORED_SIGN;
}

/** Bitişi dahil olmayan "YYYYMMDD" (takvim etkinlikleri için). */
function nextDayKey(d: DayInfo) {
  return new Date(Date.UTC(d.year, d.month - 1, d.day + 1)).toISOString().slice(0, 10).replace(/-/g, "");
}

const shortDate = (d: DayInfo) => `${d.day} ${MONTH_NAMES[d.month - 1]}`;
const longDate = (d: DayInfo) => `${shortDate(d)} ${WEEKDAYS_LONG[d.weekday]}`;

async function SelectedFinder({
  searchParams,
}: Pick<PageProps<"/tr/ay-takvimine-gore-sac-kesim-gunleri">, "searchParams">) {
  const { amac, hs, ay } = await searchParams;
  return (
    <HairFinder goal={parseGoal(amac)} weekend={hs === "1"} ay={parseMonth(ay) ? (ay as string) : undefined} />
  );
}

/** Seçilen amaca göre bugünden itibaren uygun günler. Saatte bir yenilenir. */
async function HairFinder({ goal, weekend, ay }: { goal: Goal; weekend: boolean; ay?: string }) {
  "use cache";
  cacheLife("hours");

  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .split("-")
    .map(Number);
  const base = { year: parts[0], month: parts[1], day: parts[2] };
  const today = dayInfo(base, 0);
  const todayFavored = matches("en-iyi", today);

  // Art arda uygun günler tek dönem olur; hafta sonu seçeneğinde günler tek tek listelenir.
  const horizon = goal === "en-iyi" ? 400 : 90;
  const limit = weekend ? 6 : 3;
  const results: { first: DayInfo; last: DayInfo }[] = [];
  let open: { first: DayInfo; last: DayInfo } | null = null;
  for (let i = 0; i < horizon && results.length < limit; i++) {
    const d = i === 0 ? today : dayInfo(base, i);
    const ok = matches(goal, d) && (!weekend || d.weekday >= 5);
    if (weekend) {
      if (ok) results.push({ first: d, last: d });
      continue;
    }
    if (ok) {
      if (open) open.last = d;
      else open = { first: d, last: d };
    } else if (open) {
      results.push(open);
      open = null;
    }
  }
  if (open && results.length < limit) results.push(open);

  const info = GOALS[goal];
  const todayText = today.waxing ? "büyüyen ay, uzaması için uygun" : "küçülen ay, şeklini koruması için uygun";

  return (
    <section className="bg-gradient-to-b from-[#1b1236] to-[#140d2a] text-white" aria-labelledby="sac-baslik">
      <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6">
        <Breadcrumb page={PAGE} tone="dark" />
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
            Geleneksel takvim
          </span>
        </div>
        <h1 id="sac-baslik" className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Ay Takvimine Göre Saç Kesim Günleri
        </h1>

        <p className="mt-5 flex items-center gap-3 text-zinc-200">
          <MoonPhaseIcon phaseAngle={today.phaseAngle} size={36} title="" />
          <span>
            <strong className="text-white">Bugün ({longDate(today)}):</strong> {todayText}. Ay {today.signName}{" "}
            burcunda.
            {todayFavored && <span className="ml-1 text-amber-300">★ Geleneğin en çok önerdiği gün.</span>}
          </span>
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <h2 className="text-xl font-semibold">Size uygun günü bulun</h2>
          <p className="mt-1 text-sm text-zinc-400">Saçınız için ne istiyorsunuz?</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Amaç">
            {(Object.keys(GOALS) as Goal[]).map((g) => (
              <Link
                key={g}
                href={pageHref({ goal: g, weekend, ay })}
                rel="nofollow"
                scroll={false}
                aria-current={g === goal ? "true" : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  g === goal
                    ? "border-amber-300/70 bg-amber-300/15 text-amber-100"
                    : "border-white/15 text-zinc-300 hover:border-white/30 hover:text-white"
                }`}
              >
                {GOALS[g].label}
              </Link>
            ))}
            <Link
              href={pageHref({ goal, weekend: !weekend, ay })}
              rel="nofollow"
              scroll={false}
              aria-pressed={weekend}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                weekend
                  ? "border-indigo-300/70 bg-indigo-400/15 text-indigo-100"
                  : "border-white/15 text-zinc-300 hover:border-white/30 hover:text-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-4 w-4 items-center justify-center rounded border text-[0.65rem] ${
                  weekend ? "border-indigo-200 bg-indigo-300 text-[#140d2a]" : "border-zinc-400"
                }`}
              >
                {weekend ? "✓" : ""}
              </span>
              Yalnız hafta sonu
            </Link>
          </div>

          <h3 className="mt-7 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Önümüzdeki uygun {weekend ? "günler" : "dönemler"} · {info.rule}
          </h3>
          {results.length ? (
            <ul className="mt-3 space-y-3">
              {results.map(({ first, last }) => {
                const single = first.key === last.key;
                const days =
                  Math.round(
                    (Date.UTC(last.year, last.month - 1, last.day) - Date.UTC(first.year, first.month - 1, first.day)) /
                      86_400_000,
                  ) + 1;
                const event = {
                  summary: info.summary,
                  description: `Ay takvimine göre geleneksel saç kesim günü (${info.rule}). Bilimsel bir kanıtı yoktur.`,
                  url: new URL(PAGE.path, siteConfig.url).toString(),
                  start: first.key,
                  end: nextDayKey(last),
                };
                // Dönemin simgesi ortadaki günün evresidir (ilk gün yeni aya yakın ve karanlık olabilir).
                const icon = single ? first : dayInfo(base, Math.floor((first.offset + last.offset) / 2));
                const ics = buildSingleEventIcs({ ...event, uid: `sac-${goal}-${first.key}` });
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
                          {first.key === today.key && (
                            <span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-medium text-emerald-200">
                              bugün
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {single
                            ? `Ay ${first.signName} burcunda`
                            : `${WEEKDAYS_LONG[first.weekday]} – ${WEEKDAYS_LONG[last.weekday]} · ${days} gün`}
                          {single && goal === "en-iyi" && <span className="ml-1 text-amber-300">★</span>}
                        </p>
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
                        download={`sac-kesimi-${first.key}.ics`}
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
            <p className="mt-3 text-sm text-zinc-400">Önümüzdeki dönemde bu koşula uyan gün bulunamadı.</p>
          )}
          {goal === "en-iyi" && (
            <p className="mt-4 text-xs text-zinc-400">
              Büyüyen ay {FAVORED_SIGN} burcuna yalnızca ocak sonu ile ağustos arasında, ayda bir iki gün denk gelir.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Aylık takvim ---------- */

async function SelectedMonth({
  searchParams,
}: Pick<PageProps<"/tr/ay-takvimine-gore-sac-kesim-gunleri">, "searchParams">) {
  const { ay, amac, hs } = await searchParams;
  const selected = parseMonth(ay);
  const goal = parseGoal(amac);
  const weekend = hs === "1";
  return selected ? (
    <HairCalendar year={selected.year} month={selected.month} goal={goal} weekend={weekend} />
  ) : (
    <CurrentMonth goal={goal} weekend={weekend} />
  );
}

/** İçinde bulunulan ayın takvimi; "şu an" önbellek içinde okunur. */
async function CurrentMonth({ goal = "uzatma", weekend = false }: { goal?: Goal; weekend?: boolean }) {
  "use cache";
  cacheLife("hours");
  const { year, month } = currentMonth(timeZone);
  return <HairCalendar year={year} month={month} goal={goal} weekend={weekend} />;
}

interface HairDay {
  day: number;
  weekday: number;
  waxing: boolean;
  signIndex: number;
  signName: string;
  phaseAngle: number;
  principal?: string;
  /** O gün burç değişiyorsa önceki ve yeni burç ile geçiş saati. */
  ingress?: { from: string; name: string; time: string };
  favored: boolean;
}

/** Bir ayın saç kesim takvimi. Saatte bir yenilenir (bugün vurgusu için). */
async function HairCalendar({
  year,
  month,
  goal,
  weekend,
}: {
  year: number;
  month: number;
  goal: Goal;
  weekend: boolean;
}) {
  "use cache";
  cacheLife("hours");

  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const calendar = getMonthCalendar(year, month, timeZone);
  const monthStart = zonedTimeToUtc(year, month, 1, 0, timeZone);
  const monthEnd = zonedTimeToUtc(year, month + 1, 1, 0, timeZone);
  const ingresses = getMoonSignIngresses(monthStart, 16).filter((i) => i.date < monthEnd);
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

  const days: HairDay[] = calendar.map((c) => {
    const noon = zonedTimeToUtc(year, month, c.day, 12, timeZone);
    const phase = getMoonPhase(noon, timeZone);
    const sign = getMoonSign(noon);
    const key = `${monthParam(year, month)}-${String(c.day).padStart(2, "0")}`;
    const ingress = ingresses.find((i) => dayKey(i.date) === key);
    return {
      day: c.day,
      weekday: c.weekday,
      waxing: phase.isWaxing,
      signIndex: sign.index,
      signName: sign.name,
      phaseAngle: phase.phaseAngle,
      principal:
        c.principal && (c.principal.key === "new-moon" || c.principal.key === "full-moon")
          ? c.principal.name
          : undefined,
      ingress: ingress
        ? {
            from: getMoonSign(zonedTimeToUtc(year, month, c.day, 0, timeZone)).name,
            name: ingress.sign.name,
            time: time.format(ingress.date),
          }
        : undefined,
      favored: phase.isWaxing && sign.name === FAVORED_SIGN,
    };
  });

  const today = dayKey(new Date());
  const isToday = (d: HairDay) => today === `${monthParam(year, month)}-${String(d.day).padStart(2, "0")}`;
  const { prev, next } = adjacentMonths(year, month);
  const ranges = (waxing: boolean) => {
    const out: [number, number][] = [];
    for (const d of days) {
      if (d.waxing !== waxing) continue;
      const last = out.at(-1);
      if (last && last[1] === d.day - 1) last[1] = d.day;
      else out.push([d.day, d.day]);
    }
    return out.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(", ");
  };
  const favoredDays = days.filter((d) => d.favored).map((d) => d.day);
  const monthName = MONTH_NAMES[month - 1];

  return (
    <section className="bg-gradient-to-b from-[#140d2a] to-[#05070d] text-white" aria-labelledby="sac-takvim">
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-zinc-400">Aylık saç kesim takvimi</p>
            <h2 id="sac-takvim" className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {monthName} {year}
            </h2>
          </div>
          <nav aria-label="Ay değiştir" className="flex items-center gap-2">
            {prev.year >= MIN_YEAR && (
              <MonthLink
                href={pageHref({ goal, weekend, ay: monthParam(prev.year, prev.month) })}
                label={`${MONTH_NAMES[prev.month - 1]} ${prev.year}`}
              >
                ‹
              </MonthLink>
            )}
            <Link
              href={pageHref({ goal, weekend })}
              rel="nofollow"
              scroll={false}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:border-white/30 hover:text-white"
            >
              Bu ay
            </Link>
            {next.year <= MAX_YEAR && (
              <MonthLink
                href={pageHref({ goal, weekend, ay: monthParam(next.year, next.month) })}
                label={`${MONTH_NAMES[next.month - 1]} ${next.year}`}
              >
                ›
              </MonthLink>
            )}
          </nav>
        </div>

        <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4">
            <dt className="text-xs uppercase tracking-wider text-emerald-200/80">Uzaması için (büyüyen ay)</dt>
            <dd className="mt-1 font-semibold">
              {monthName}: {ranges(true)}
            </dd>
          </div>
          <div className="rounded-2xl border border-sky-300/30 bg-sky-400/10 p-4">
            <dt className="text-xs uppercase tracking-wider text-sky-200/80">Şeklini koruması için (küçülen ay)</dt>
            <dd className="mt-1 font-semibold">
              {monthName}: {ranges(false)}
            </dd>
          </div>
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.08] p-4">
            <dt className="text-xs uppercase tracking-wider text-amber-200/80">★ Büyüyen ay {FAVORED_SIGN} burcunda</dt>
            <dd className="mt-1 font-semibold">
              {favoredDays.length ? `${monthName}: ${favoredDays.join(", ")}` : "Bu ay böyle bir gün yok"}
            </dd>
            {favoredDays.length === 0 && (
              <dd className="mt-1 text-xs text-zinc-400">
                Büyüyen ay {FAVORED_SIGN} burcuna yalnızca ocak sonu ile ağustos arasında denk gelir.
              </dd>
            )}
          </div>
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
                className={`relative flex flex-col gap-1 rounded-xl p-2 ${
                  d.waxing ? "bg-emerald-400/[0.08]" : "bg-sky-400/[0.06]"
                } ${d.favored ? "ring-1 ring-amber-300/70" : ""} ${isToday(d) ? "outline outline-2 outline-white/70" : ""}`}
                aria-current={isToday(d) ? "date" : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold tabular-nums">{d.day}</span>
                  {d.favored && (
                    <span className="text-amber-300" aria-label="Gelenekte en çok önerilen gün">
                      ★
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <MoonPhaseIcon phaseAngle={d.phaseAngle} size={26} title="" />
                  <span className="text-lg text-amber-200" title={d.signName} aria-label={`Ay ${d.signName} burcunda`}>
                    {ZODIAC_SYMBOLS[d.signIndex]}
                  </span>
                </div>
                <span className={`text-[0.7rem] font-medium ${d.waxing ? "text-emerald-300" : "text-sky-300"}`}>
                  {d.waxing ? "Uzama" : "Şekil"}
                </span>
                {(d.principal || d.ingress) && (
                  <span className="text-[0.65rem] leading-tight text-zinc-400">
                    {d.principal}
                    {d.principal && d.ingress ? " · " : ""}
                    {d.ingress && `${d.ingress.time} ${d.ingress.name}`}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Telefon: liste */}
        <ol className="mt-8 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 md:hidden">
          {days.map((d) => (
            <li
              key={d.day}
              className={`flex items-center gap-3 px-4 py-2.5 ${d.favored ? "bg-amber-300/[0.08]" : ""} ${
                isToday(d) ? "bg-white/10" : ""
              }`}
            >
              <span className="w-12 shrink-0 leading-tight">
                <span className="block font-semibold tabular-nums">{d.day}</span>
                <span className="block text-xs text-zinc-500">{WEEKDAYS_SHORT[d.weekday]}</span>
              </span>
              <MoonPhaseIcon phaseAngle={d.phaseAngle} size={30} title="" />
              <span className="min-w-0 flex-1 leading-tight">
                <span className={`block text-sm font-medium ${d.waxing ? "text-emerald-300" : "text-sky-300"}`}>
                  {d.waxing ? "Büyüyen ay · uzama" : "Küçülen ay · şekil"}
                  {d.favored && <span className="ml-1 text-amber-300">★</span>}
                </span>
                <span className="block text-xs text-zinc-400">
                  {d.ingress ? `${d.ingress.from} → ${d.ingress.name} (${d.ingress.time})` : d.signName}
                  {d.principal && ` · ${d.principal}`}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
