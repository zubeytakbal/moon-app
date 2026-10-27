import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { getMonthCalendar, getMoonPhase, getMoonSign, getMoonSignIngresses, zonedTimeToUtc } from "@moon-app/moon";
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
import { PAGES } from "@/lib/pages";
import { ZODIAC_SYMBOLS } from "@/lib/zodiac";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.sacKesim;
const UPDATED = "2026-10-27";
const timeZone = siteConfig.defaultLocation.timeZone;
/** Gelenekte saç kesimi için en çok önerilen burç. */
const FAVORED_SIGN = "Aslan";

export const metadata: Metadata = {
  title: `Ay Takvimine Göre Saç Kesim Günleri: Bu Ay Hangi Günler? | ${siteConfig.name}`,
  description:
    "Ay takvimine göre saç kesim günleri: büyüyen ay (uzaması için) ve küçülen ay (şeklini koruması için) günleri, ayın burcu ve geleneğin en çok önerdiği günler. İstediğiniz ayı seçebilirsiniz.",
  // Ay seçimi (?ay=...) ayrı sayfa sayılmasın: Google'a her zaman tek adres gösterilir.
  alternates: { canonical: PAGE.path },
};

export default function HairCutDaysPage({ searchParams }: PageProps<"/tr/ay-takvimine-gore-sac-kesim-gunleri">) {
  return (
    <>
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

        <section className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            Ayın evresi ve burcu her gün öğle saatine (Türkiye saati) göre hesaplanmıştır. Ay o gün burç değiştiriyorsa
            geçiş saati ayrıca gösterilir.
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

async function SelectedMonth({
  searchParams,
}: Pick<PageProps<"/tr/ay-takvimine-gore-sac-kesim-gunleri">, "searchParams">) {
  const { ay } = await searchParams;
  const selected = parseMonth(ay);
  return selected ? <HairCalendar year={selected.year} month={selected.month} /> : <CurrentMonth />;
}

async function CurrentMonth() {
  "use cache";
  cacheLife("hours");
  const { year, month } = currentMonth(timeZone);
  return <HairCalendar year={year} month={month} />;
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
async function HairCalendar({ year, month }: { year: number; month: number }) {
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
    <section className="bg-gradient-to-b from-[#1b1236] to-[#05070d] text-white" aria-labelledby="sac-baslik">
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6">
        <Breadcrumb page={PAGE} tone="dark" />
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
            Geleneksel takvim
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-lg font-medium text-zinc-300">Ay takvimine göre saç kesim günleri</p>
            <h1 id="sac-baslik" className="mt-1 text-4xl font-bold tracking-tight sm:text-6xl">
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
