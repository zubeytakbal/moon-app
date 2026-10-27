import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { getMonthCalendar, getNextBlueMoon, getUpcomingPrincipalPhases, type CalendarDay } from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.ayTakvimi;
const UPDATED = "2026-10-27";
const timeZone = siteConfig.defaultLocation.timeZone;
const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export const metadata: Metadata = {
  title: `Ay Takvimi: Aylık Ay Evreleri, Dolunay ve Yeni Ay Günleri | ${siteConfig.name}`,
  description:
    "Ay takvimi: bu ayın her günü için ay evresi ve aydınlık oranı, dolunay, yeni ay ve dördün tarihleri saatleriyle (Türkiye saati). Önceki ve sonraki aylara geçebilirsiniz.",
  // Ay seçimi (?ay=...) ayrı sayfa sayılmasın: Google'a her zaman tek adres gösterilir.
  alternates: { canonical: PAGE.path },
};

export default function MoonCalendarPage({ searchParams }: PageProps<"/tr/ay-takvimi">) {
  return (
    <>
      {/* Seçili ay isteğe göre değişir. Beklerken (ve Google için) içinde bulunulan ay gösterilir. */}
      <Suspense fallback={<CurrentMonth />}>
        <SelectedMonth searchParams={searchParams} />
      </Suspense>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>Takvimde her günün kutusu, ayın o akşam saat 21:00&apos;deki görünüşünü ve aydınlık oranını gösterir.</li>
          <li>
            Dolunay, yeni ay ve dördünler tek bir andır. Takvimde o anın düştüğü gün, saatiyle birlikte vurgulanır.
          </li>
          <li>Bütün saatler Türkiye saatiyle (UTC+3) verilmiştir.</li>
        </QuickFacts>
        <Explainer />
        <section className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            Evre anları Astronomy Engine ile hesaplanmış ve NASA ay evresi tablolarıyla karşılaştırılmıştır. Ay görseli:
            NASA Scientific Visualization Studio.
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
          name: "Ay Takvimi",
          url: new URL(PAGE.path, siteConfig.url).toString(),
          inLanguage: "tr-TR",
          dateModified: UPDATED,
        }}
      />
    </>
  );
}

/** "2026-11" biçimindeki ay parametresini çözer; geçersizse null döner. */
function parseMonth(value: string | string[] | undefined): { year: number; month: number } | null {
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12) return null;
  return { year, month };
}

async function SelectedMonth({ searchParams }: Pick<PageProps<"/tr/ay-takvimi">, "searchParams">) {
  const { ay } = await searchParams;
  const selected = parseMonth(ay);
  return selected ? <MonthCalendar year={selected.year} month={selected.month} /> : <CurrentMonth />;
}

async function CurrentMonth() {
  "use cache";
  cacheLife("hours");

  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "numeric" }).formatToParts(
    new Date(),
  );
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return <MonthCalendar year={get("year")} month={get("month")} />;
}

function monthParam(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
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

  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
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

function MonthLink({ href, label, children }: { href: string; label: string; children: string }) {
  return (
    <Link
      href={href}
      // Sonsuz ay bağlantılarının taranmasını önler; sayfanın tek adresi canonical ile belirtilir.
      rel="nofollow"
      scroll={false}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-xl text-zinc-200 hover:border-white/30 hover:text-white"
    >
      {children}
    </Link>
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
      <h2>Ay takvimi nasıl okunur?</h2>
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
        Takvim aylarımız 28 ile 31 gün arasında sürer, ay döngüsü ise ortalama 29,5 gündür. Bu küçük fark birikir: bir
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

      <h2>Mavi ay nedir?</h2>
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

      <h2>Ay takvimi ile Hicri takvim aynı şey mi?</h2>
      <p>
        Değil. Bu sayfadaki takvim, bildiğimiz Miladi takvimin günleri üzerine ayın evrelerini yerleştirir. Hicri takvim
        ise başlı başına bir ay takvimidir: her ayı, <Link href={PAGES.yeniAy.path}>yeni aydan</Link> sonra ilk{" "}
        <Link href={PAGES.hilal.path}>hilalin</Link> görülmesiyle başlar ve 29 ya da 30 gün sürer. Hicri bir yıl 354 ya
        da 355 gündür. Resmî dinî günler için Diyanet&apos;in takvimine bakmak gerekir.
      </p>
    </Prose>
  );
}
