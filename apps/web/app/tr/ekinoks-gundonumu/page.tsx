import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  findProvince,
  getDayLength,
  getEquiluxDay,
  getExtremeDay,
  getSeasons,
  getYearDayLengths,
  type DayLength,
  type GeoLocation,
} from "@moon-app/moon";
import { AnswerBox, DataTable } from "@/components/InfoTables";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Byline } from "@/components/Byline";
import { CitySelect } from "@/components/CitySelect";
import { Faq } from "@/components/Faq";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { FAQS } from "@/lib/faqs";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { PROVINCE_OPTIONS } from "@/lib/place-options";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.ekinoksGundonumu;
const UPDATED = "2026-11-04";
const src = pageSources("usnoSeasons", "nasaSeasons", "nasaEarthFactSheet");
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;
/** Tabloda gösterilen yıl sayısı (içinde bulunulan yıldan başlayarak). */
const TABLE_YEARS = 5;

type SeasonKey = "marchEquinox" | "juneSolstice" | "septemberEquinox" | "decemberSolstice";
const SEASON_NAMES: Record<SeasonKey, string> = {
  marchEquinox: "Mart ekinoksu (ilkbahar)",
  juneSolstice: "Haziran gündönümü (yaz)",
  septemberEquinox: "Eylül ekinoksu (sonbahar)",
  decemberSolstice: "Aralık gündönümü (kış)",
};
const SEASON_SHORT: Record<SeasonKey, string> = {
  marchEquinox: "Mart ekinoksu",
  juneSolstice: "Haziran gündönümü",
  septemberEquinox: "Eylül ekinoksu",
  decemberSolstice: "Aralık gündönümü",
};
const SEASON_KEYS = Object.keys(SEASON_NAMES) as SeasonKey[];

/** Karşılaştırma tablosundaki şehirler (enlem sırasıyla). Elle seçildi: aramalarda geçen ülkeler ve kutup bölgesi. */
const WORLD: GeoLocation[] = [
  { name: "Dubai", latitude: 25.2, longitude: 55.27, elevation: 0, timeZone: "Asia/Dubai" },
  { name: "Antalya", latitude: 36.8969, longitude: 30.7133, elevation: 0, timeZone: "Europe/Istanbul" },
  { name: "İstanbul", latitude: 41.0082, longitude: 28.9784, elevation: 0, timeZone: "Europe/Istanbul" },
  { name: "Berlin", latitude: 52.52, longitude: 13.405, elevation: 0, timeZone: "Europe/Berlin" },
  { name: "Stockholm", latitude: 59.33, longitude: 18.07, elevation: 0, timeZone: "Europe/Stockholm" },
  { name: "Oslo", latitude: 59.91, longitude: 10.75, elevation: 0, timeZone: "Europe/Oslo" },
  { name: "Reykjavik", latitude: 64.15, longitude: -21.94, elevation: 0, timeZone: "Atlantic/Reykjavik" },
  { name: "Tromsø (Norveç)", latitude: 69.65, longitude: 18.96, elevation: 0, timeZone: "Europe/Oslo" },
];

/** "15 sa 8 dk" (önce toplam dakika yuvarlanır; "11 sa 60 dk" çıkmasın). */
function hm(minutes: number) {
  const m = Math.round(minutes);
  return `${Math.floor(m / 60)} sa ${m % 60} dk`;
}

const dateFmt = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
const dayMonth = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" });
const weekday = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, weekday: "long" });
const timeFmt = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

/** `from`dan sonraki ilk ekinoks ya da gündönümü. */
function nextSeason(from: Date): { key: SeasonKey; date: Date } {
  const y = Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(from));
  for (const year of [y, y + 1]) {
    const s = getSeasons(year);
    for (const key of SEASON_KEYS) if (s[key] > from) return { key, date: s[key] };
  }
  throw new Error("mevsim bulunamadı");
}

/** Başlıktaki yıllar: Aralık gündönümü geçtiyse gelecek yıl ve ondan sonraki. Günde bir yenilenir. */
async function titleYears() {
  "use cache";
  cacheLife("days");
  const now = new Date();
  const y = Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(now));
  return now > getSeasons(y).decemberSolstice ? y + 1 : y;
}

export async function generateMetadata(): Promise<Metadata> {
  const y = await titleYears();
  return {
    title: `Ekinoks ve Gündönümü ${y}-${y + 1}: Tarihleri, En Uzun ve En Kısa Gün | ${siteConfig.name}`,
    description: `${y} ve ${y + 1} ekinoks ve gündönümü tarihleri saatleriyle. En uzun ve en kısa gün ne zaman, ilinizde gündüz kaç saat sürüyor, ekinoksta gece ile gündüz gerçekten eşit mi? Gün uzunluğu hesaplayıcı.`,
    // İl seçimi (?il=...) ayrı sayfa sayılmasın.
    alternates: { canonical: PAGE.path },
    openGraph: pageOpenGraph(PAGE),
  };
}

export default function SeasonsPage({ searchParams }: PageProps<"/tr/ekinoks-gundonumu">) {
  return (
    <>
      <Hero />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Ne zaman?" },
          { href: "#gun-uzunlugu", label: "Gün uzunluğu" },
          { href: "#tarihler", label: "Tarihler" },
          { href: "#esit-mi", label: "Eşit mi?" },
          { href: "#dunyada", label: "Dünyada" },
          { href: "#neden", label: "Mevsimler neden olur?" },
          { href: "#sss", label: "Sık sorulanlar" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <SeasonsAnswer />
        </div>

        <Suspense fallback={<DayLengthTool slug={siteConfig.defaultLocation.slug} />}>
          <SelectedTool searchParams={searchParams} />
        </Suspense>

        <div className="mx-auto max-w-3xl">
          <SeasonsTable />
          <EquiluxSection />
        </div>

        <WorldTable />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2 id="neden">Mevsimler neden olur?</h2>
            <p>
              Dünya&apos;nın dönme ekseni, Güneş etrafındaki yörüngesine göre yaklaşık 23,44 derece eğiktir.
              {src.ref("nasaEarthFactSheet")} Eksen yıl boyunca uzayda hep aynı yöne bakar; bu yüzden Dünya yörüngede
              ilerledikçe önce kuzey yarımküre, altı ay sonra güney yarımküre Güneş&apos;e doğru eğilir. Güneş&apos;e
              eğilen yarımkürede Güneş öğlen daha yüksekten bakar, ışınlar yere daha dik düşer ve gündüz daha uzun
              sürer: orada yaz yaşanır.
            </p>
            <SeasonsDiagram />
            <p>
              Yaygın bir yanlış, yazın Dünya&apos;nın Güneş&apos;e daha yakın olduğudur. Tam tersine, Dünya Güneş&apos;e
              ocak başında en yakın, temmuz başında en uzaktır; aradaki fark mevsimleri belirleyecek kadar büyük
              değildir.{src.ref("nasaSeasons")} Mevsimlerin nedeni uzaklık değil, eğikliktir. Güney yarımkürede
              mevsimlerin bizimkinin tersi olması da bunu gösterir: Aralık&apos;ta Avustralya&apos;da yaz yaşanır.
            </p>
            <ul>
              <li>
                <strong>Haziran gündönümü:</strong> Kuzey yarımküre Güneş&apos;e en çok eğiktir. Kuzeyde yılın en uzun
                günü, astronomik yazın başlangıcıdır.
              </li>
              <li>
                <strong>Aralık gündönümü:</strong> Kuzey yarımküre Güneş&apos;ten en uzak yöne eğiktir. Kuzeyde yılın en
                kısa günü ve en uzun gecesi, astronomik kışın başlangıcıdır.
              </li>
              <li>
                <strong>Ekinokslar (Mart ve Eylül):</strong> Eksen Güneş&apos;e ne yaklaşır ne uzaklaşır; Güneş tam
                ekvatorun üzerindedir. &quot;Ekinoks&quot; Latince &quot;eşit gece&quot; demektir; Türkçede gece gündüz
                eşitliği denir.
              </li>
            </ul>

            <h2 id="tarih-kayar">21 Haziran her zaman en uzun gün mü?</h2>
            <p>
              Hayır, tarih her yıl biraz kayar. Bir yıl 365 gün değil, yaklaşık 365,242 gündür.{src.ref("nasaEarthFactSheet")}{" "}
              Bu yüzden gündönümü anı her yıl yaklaşık 6 saat ileri kayar, artık yıllarda ise takvime eklenen bir günle
              geri gelir. Türkiye saatiyle Haziran gündönümü 20, 21 ya da 22 Haziran&apos;a; Aralık gündönümü 21 ya da 22
              Aralık&apos;a; Mart ekinoksu 20 ya da 21 Mart&apos;a, Eylül ekinoksu 22 ya da 23 Eylül&apos;e düşer.
              Yukarıdaki tabloda her yılın kendi tarihini görebilirsiniz.
            </p>
            <p>
              En uzun günün uzunluğu gündönümünden bir iki gün önce ve sonra yalnızca birkaç saniye değişir. Bu yüzden
              gündönümünün çevresindeki birkaç gün pratikte aynı uzunluktadır; günler fark edilir biçimde ancak bir iki
              hafta sonra kısalmaya başlar.
            </p>

            <h2>Ekvatorda ve kutuplarda ne olur?</h2>
            <p>
              Ekvatorda gündüz yıl boyunca 12 saate çok yakındır; mevsimlerin gün uzunluğuna etkisi neredeyse yoktur.
              Kutuplara doğru gidildikçe fark büyür. Kuzey Kutup Dairesi&apos;nin (yaklaşık 66,6° kuzey) ötesinde yazın
              Güneş hiç batmaz (gece yarısı güneşi), kışın hiç doğmaz (kutup gecesi). Yukarıdaki dünya tablosunda
              Norveç&apos;in Tromsø kentinde bunu görebilirsiniz.
            </p>
            <p>
              Gün doğumu ve batımına ayın da eşlik ettiğini unutmayın: dolunay her zaman Güneş&apos;in karşısında olduğu
              için kışın uzun gecelerde gökyüzünde en uzun ve en yüksekten kalır. Ayrıntısı{" "}
              <Link href={PAGES.dolunay.path}>Dolunay</Link> sayfasında.
            </p>
          </Prose>
          <Faq items={FAQS.ekinoksGundonumu} />
          <ArticleFooter
            page={PAGE}
            headline="Ekinoks ve Gündönümü: Tarihleri, En Uzun ve En Kısa Gün"
            updated={UPDATED}
            src={src}
          />
        </div>
      </main>
    </>
  );
}

/** Giriş: sıradaki ekinoks ya da gündönümü ve İstanbul'da bugünkü gündüz süresi. Saatte bir yenilenir. */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const next = nextSeason(now);
  const days = Math.ceil((next.date.getTime() - now.getTime()) / DAY_MS);
  const today = getDayLength(now, siteConfig.defaultLocation);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1c1606] to-[#05070d] text-white">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 pb-14 pt-6 md:grid-cols-[1fr_auto] md:pb-20">
        <div>
          <Breadcrumb page={PAGE} tone="dark" />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Gökyüzü takvimi</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-7xl">{PAGE.title}</h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-200">
            Yılın en uzun ve en kısa günü, gece ile gündüzün eşitlendiği günler. Ne zaman, ilinizde gündüz kaç saat?
          </p>
          <Byline updated={UPDATED} />
          <div className="mt-8 max-w-md rounded-2xl border border-amber-300/30 bg-amber-400/10 p-5">
            <p className="text-xs uppercase tracking-wider text-amber-200/80">Sıradaki</p>
            <p className="mt-1 text-2xl font-semibold">{SEASON_NAMES[next.key]}</p>
            <p className="mt-0.5 text-zinc-200">
              {dateFmt.format(next.date)}, {timeFmt.format(next.date)} (Türkiye saati)
            </p>
            <p className="mt-3 inline-block rounded-full bg-amber-400/20 px-3 py-1 text-sm font-medium text-amber-100">
              {days} gün sonra
            </p>
          </div>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-sm uppercase tracking-wider text-zinc-400">Bugün İstanbul&apos;da gündüz</p>
          <p className="mt-1 text-6xl font-extralight tabular-nums">{hm(today.minutes)}</p>
          {today.rise && today.set && (
            <p className="mt-2 text-zinc-400 tabular-nums">
              Gün doğumu {timeFmt.format(today.rise)} · batımı {timeFmt.format(today.set)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/** Sayfanın sorusunun cevabı, en üstte (timeanddate düzeni). Saatte bir yenilenir. */
async function SeasonsAnswer() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const next = nextSeason(now);
  const year = Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(next.date));
  const s = getSeasons(year);
  const city = siteConfig.defaultLocation;
  const longest = getExtremeDay(s.juneSolstice, city, "max");
  const shortest = getExtremeDay(s.decemberSolstice, city, "min");
  const days = Math.ceil((next.date.getTime() - now.getTime()) / DAY_MS);

  return (
    <AnswerBox
      question="Sıradaki ekinoks ya da gündönümü ne zaman?"
      answer={`${SEASON_NAMES[next.key]}: ${dateFmt.format(next.date)} ${weekday.format(next.date)}, saat ${timeFmt.format(next.date)} (Türkiye saati).`}
      rows={[
        { label: "Kaç gün kaldı?", value: `${days} gün` },
        {
          label: `${year} en uzun gün`,
          value: `${dayMonth.format(s.juneSolstice)}: İstanbul'da gündüz ${hm(longest.minutes)}`,
        },
        {
          label: `${year} en kısa gün`,
          value: `${dayMonth.format(s.decemberSolstice)}: İstanbul'da gündüz ${hm(shortest.minutes)}`,
        },
        {
          label: `${year} gece gündüz eşitliği`,
          value: `${dayMonth.format(s.marchEquinox)} ve ${dayMonth.format(s.septemberEquinox)}`,
        },
        {
          label: "21 Haziran her zaman en uzun gün mü?",
          value: (
            <>
              Hayır; tarih yıla göre 20-22 Haziran arasında kayar.{" "}
              <a href="#tarih-kayar" className="underline underline-offset-2">
                Neden?
              </a>
            </>
          ),
        },
      ]}
      note={
        <>
          Anlar kendi hesabımızdır ve ABD Deniz Gözlemevi&apos;nin (USNO) yayımladığı değerlerle 1 dakika içinde
          örtüşür.{src.ref("usnoSeasons")} İlinizde gündüzün kaç saat sürdüğünü{" "}
          <a href="#gun-uzunlugu" className="underline underline-offset-2">
            aşağıdan
          </a>{" "}
          hesaplayabilirsiniz.
        </>
      }
    />
  );
}

async function SelectedTool({ searchParams }: Pick<PageProps<"/tr/ekinoks-gundonumu">, "searchParams">) {
  const { il } = await searchParams;
  const city = findProvince(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
  return <DayLengthTool slug={city.slug} />;
}

/** Gün uzunluğu hesaplayıcı: seçilen ilde bugün, en uzun ve en kısa gün, yıl boyu grafik. Günde bir yenilenir. */
async function DayLengthTool({ slug }: { slug: string }) {
  "use cache";
  cacheLife("days");

  const city = findProvince(slug) ?? siteConfig.defaultLocation;
  const now = new Date();
  const year = Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(now));
  const s = getSeasons(year);
  const today = getDayLength(now, city);
  const yesterday = getDayLength(new Date(now.getTime() - DAY_MS), city);
  const diff = Math.round(today.minutes - yesterday.minutes);
  const longest = getExtremeDay(s.juneSolstice, city, "max");
  const shortest = getExtremeDay(s.decemberSolstice, city, "min");
  const equinoxDay = getDayLength(s.marchEquinox, city);
  const points = getYearDayLengths(year, city, 2);

  const card = (title: string, d: DayLength, note?: string) => (
    <div className="rounded-2xl bg-[#05070d] p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{title}</p>
      <p className="mt-1 text-3xl font-light tabular-nums">{hm(d.minutes)}</p>
      <p className="mt-1 text-sm text-zinc-300">
        {dayMonth.format(d.noon)}
        {d.rise && d.set && (
          <span className="tabular-nums">
            {" "}
            · {timeFmt.format(d.rise)} - {timeFmt.format(d.set)}
          </span>
        )}
      </p>
      {note && <p className="mt-1 text-xs text-zinc-400">{note}</p>}
    </div>
  );

  return (
    <section aria-labelledby="gun-uzunlugu" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Gün uzunluğu hesaplayıcı</p>
          <h2 id="gun-uzunlugu" data-toc-label="Gün uzunluğu" className="mt-1 scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
            {city.name}: bugün gündüz {hm(today.minutes)}
          </h2>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Dünden {diff === 0 ? "farkı bir dakikadan az" : `${Math.abs(diff)} dakika ${diff > 0 ? "uzun" : "kısa"}`}.
            {today.rise && today.set && (
              <>
                {" "}
                Gün doğumu {timeFmt.format(today.rise)}, gün batımı {timeFmt.format(today.set)}.
              </>
            )}
          </p>
        </div>
        <CitySelect action={PAGE.path} options={PROVINCE_OPTIONS} selected={city.slug} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {card(`${year} en uzun gün`, longest)}
        {card(`${year} en kısa gün`, shortest, `Fark: ${hm(longest.minutes - shortest.minutes)}`)}
        {card("Mart ekinoksu günü", equinoxDay, "Tam 12 saat değil; aşağıda nedeni var.")}
      </div>

      <DayLengthChart points={points} seasons={s} today={today} />
      <p className="mt-3 text-sm text-zinc-500">
        Gündüz, Güneş&apos;in üst kenarının ufukta göründüğü andan battığı ana kadar sayılır (düz ufuk, Türkiye saati).
        Ekinoks ve gündönümü anlarının tarihleri her ilde aynıdır; değişen gündüzün uzunluğudur: kuzeydeki illerde
        yaz günleri daha uzun, kış günleri daha kısadır.
      </p>
    </section>
  );
}

/** Yıl boyunca gündüz süresi (saat), ekinoks ve gündönümü işaretli, bugün nokta. */
function DayLengthChart({
  points,
  seasons,
  today,
}: {
  points: DayLength[];
  seasons: ReturnType<typeof getSeasons>;
  today: DayLength;
}) {
  const W = 720;
  const H = 220;
  const PAD = { l: 40, r: 12, t: 14, b: 30 };
  const t0 = points[0].noon.getTime();
  const t1 = points[points.length - 1].noon.getTime();
  const hours = points.map((p) => p.minutes / 60);
  const lo = Math.floor(Math.min(...hours)) - 1;
  const hi = Math.ceil(Math.max(...hours)) + 1;
  const x = (t: number) => PAD.l + ((t - t0) / (t1 - t0)) * (W - PAD.l - PAD.r);
  const y = (h: number) => H - PAD.b - ((h - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.noon.getTime()).toFixed(1)},${y(p.minutes / 60).toFixed(1)}`).join(" ");
  const ticks: number[] = [];
  for (let h = lo; h <= hi; h++) ticks.push(h);
  const months = Array.from({ length: 12 }, (_, m) => new Date(Date.UTC(new Date(t0).getUTCFullYear(), m, 1, 12)));
  const monthFmt = new Intl.DateTimeFormat(siteConfig.locale, { month: "short", timeZone: "UTC" });

  return (
    <figure className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Yıl boyunca gündüz süresi">
        {ticks.map((h) => (
          <g key={h}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(h)} y2={y(h)} className="stroke-zinc-200 dark:stroke-zinc-800" />
            {(h % 2 === 0 || hi - lo <= 8) && (
              <text x={PAD.l - 6} y={y(h) + 4} textAnchor="end" className="fill-zinc-500 text-[22px] sm:text-[11px]">
                {h} sa
              </text>
            )}
          </g>
        ))}
        {SEASON_KEYS.map((k) => (
          <line
            key={k}
            x1={x(seasons[k].getTime())}
            x2={x(seasons[k].getTime())}
            y1={PAD.t}
            y2={H - PAD.b}
            className="stroke-amber-400"
            strokeDasharray="4 4"
          />
        ))}
        <path d={line} fill="none" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth={2.5} />
        {today.noon.getTime() >= t0 && today.noon.getTime() <= t1 && (
          <circle cx={x(today.noon.getTime())} cy={y(today.minutes / 60)} r={5} className="fill-indigo-600 dark:fill-indigo-400" />
        )}
        {months.map((m, i) =>
          i % 2 === 0 ? (
            <text key={i} x={x(m.getTime())} y={H - 8} textAnchor="start" className="fill-zinc-500 text-[22px] sm:text-[11px]">
              {monthFmt.format(m)}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 px-1 text-xs text-zinc-600 dark:text-zinc-400">
        <span>
          <span className="mr-1.5 inline-block h-0.5 w-4 bg-indigo-600 align-middle" />
          Gündüz süresi
        </span>
        <span>
          <span className="mr-1.5 inline-block h-3 w-0 border-l-2 border-dashed border-amber-400 align-middle" />
          Ekinoks ve gündönümleri
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-indigo-600 align-middle" />
          Bugün
        </span>
      </figcaption>
    </figure>
  );
}

/** İçinde bulunulan yıldan başlayarak beş yılın ekinoks ve gündönümleri. Günde bir yenilenir. */
async function SeasonsTable() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const y = Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(now));
  const next = nextSeason(now);
  const nextYear = Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(next.date));
  const cell = (d: Date) => (
    <span className={d < now ? "text-zinc-400" : undefined}>
      {dayMonth.format(d)} <span className="tabular-nums text-zinc-500">{timeFmt.format(d)}</span>
    </span>
  );

  return (
    <section aria-labelledby="tarihler" className="mt-14">
      <h2 id="tarihler" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Ekinoks ve gündönümü tarihleri {y}-{y + TABLE_YEARS - 1}
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Her olayın tarihi ve saati (Türkiye saati). Sıradaki olayın bulunduğu yıl vurgulu, geçmiş olanlar soluk.
      </p>
      <DataTable
        columns={["Yıl", ...SEASON_KEYS.map((k) => SEASON_SHORT[k])]}
        highlight={String(nextYear)}
        rows={Array.from({ length: TABLE_YEARS }, (_, i) => {
          const year = y + i;
          const s = getSeasons(year);
          return { key: String(year), cells: [String(year), ...SEASON_KEYS.map((k) => cell(s[k]))] };
        })}
      />
      <p className="mt-3 text-sm text-zinc-500">
        Anlar kendi hesabımızdır; USNO değerleriyle 1 dakika içinde aynıdır.{src.ref("usnoSeasons")}{" "}
        <Link href={PAGES.yontem.path} className="underline underline-offset-2">
          Hesap ne kadar doğru?
        </Link>
      </p>
    </section>
  );
}

/** "Ekinoksta gece ile gündüz eşit mi?": İstanbul ve Ankara için ekinoks günü ile gerçekten eşit olan gün. */
async function EquiluxSection() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const y = Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(now));
  const year = now > getSeasons(y).septemberEquinox ? y + 1 : y;
  const s = getSeasons(year);
  const ist = siteConfig.defaultLocation;
  const ank = findProvince("ankara")!;
  const rows = [ist, ank].map((c) => ({
    c,
    march: getDayLength(s.marchEquinox, c),
    marchEq: getEquiluxDay(s.marchEquinox, c),
    sept: getDayLength(s.septemberEquinox, c),
    septEq: getEquiluxDay(s.septemberEquinox, c),
  }));
  const r = rows[0];

  return (
    <section aria-labelledby="esit-mi" className="mt-14">
      <Prose>
        <h2 id="esit-mi">Ekinoksta gece ile gündüz gerçekten eşit mi?</h2>
        <p>
          Tam olarak değil. Ekinoks, Güneş&apos;in merkezinin ekvatorun tam üzerinden geçtiği andır. Ama gün doğumu ve
          batımı Güneş&apos;in merkezine değil üst kenarına göre sayılır; ayrıca hava, ufka yakın Güneş&apos;in ışığını
          kırarak onu gerçekte olduğundan biraz yukarıda gösterir. Bu iki etki yüzünden ekinoks günü gündüz 12 saatten
          birkaç dakika uzun sürer. {year} Mart ekinoksunda İstanbul&apos;da gündüz {hm(r.march.minutes)}; gece ile
          gündüzün gerçekten eşitlendiği gün ise {dayMonth.format(r.marchEq.noon)} (gündüz {hm(r.marchEq.minutes)}).
          Sonbaharda eşit gün ekinoksun birkaç gün sonrasına, {dayMonth.format(r.septEq.noon)} tarihine düşer.
        </p>
      </Prose>
      <DataTable
        columns={["İl", "Mart ekinoksu günü", "Gerçekten eşit gün", "Eylül ekinoksu günü", "Gerçekten eşit gün"]}
        rows={rows.map((x) => ({
          key: x.c.slug,
          cells: [
            x.c.name,
            `${dayMonth.format(x.march.noon)}: ${hm(x.march.minutes)}`,
            dayMonth.format(x.marchEq.noon),
            `${dayMonth.format(x.sept.noon)}: ${hm(x.sept.minutes)}`,
            dayMonth.format(x.septEq.noon),
          ],
        }))}
      />
    </section>
  );
}

/** "Dünyada en kısa gün nerede?": enleme göre sıralı şehirlerde en uzun ve en kısa gün. Haftada bir yenilenir. */
async function WorldTable() {
  "use cache";
  cacheLife("weeks");

  const now = new Date();
  const y = Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(now));
  const s = getSeasons(y);
  const fmt = (d: DayLength) => (d.polar === "day" ? "24 saat (Güneş batmaz)" : d.polar === "night" ? "0 (Güneş doğmaz)" : hm(d.minutes));

  return (
    <section aria-labelledby="dunyada" className="mt-14">
      <h2 id="dunyada" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Dünyada en uzun ve en kısa gün nerede?
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Kuzeye gidildikçe yaz günleri uzar, kış günleri kısalır. Almanya, İsveç, Norveç ve İzlanda&apos;dan seçtiğimiz
        şehirlerde {y} yılının en uzun ve en kısa günü (her şehrin kendi yerel saatine göre hesaplandı).
      </p>
      <DataTable
        columns={["Şehir", "Enlem", "En uzun gün (Haziran)", "En kısa gün (Aralık)"]}
        rows={WORLD.map((c) => ({
          key: c.name,
          cells: [
            c.name,
            `${c.latitude.toFixed(1).replace(".", ",")}° K`,
            fmt(getExtremeDay(s.juneSolstice, c, "max")),
            fmt(getExtremeDay(s.decemberSolstice, c, "min")),
          ],
        }))}
      />
      <p className="mt-3 text-sm text-zinc-500">
        Tromsø Kuzey Kutup Dairesi&apos;nin kuzeyindedir: yaz ortasında Güneş hiç batmaz, kış ortasında hiç doğmaz.
      </p>
    </section>
  );
}

/** Dünya'nın yörüngesi ve eğik ekseni: dört konumda hangi yarımkürenin Güneş'e döndüğü (kendi çizimimiz). */
function SeasonsDiagram() {
  // Eksenin kuzey ucu çizimde sağ üste eğik: soldaki konumda Güneş'e (yaz), sağdakinde tersine (kış) döner;
  // üstte ve altta eğiklik Güneş doğrultusuna diktir (ekinoks).
  const positions = [
    { x: 60, y: 150, label: "21 Haziran", sub: "kuzeyde yaz" },
    { x: 300, y: 60, label: "21 Mart", sub: "ekinoks" },
    { x: 540, y: 150, label: "21 Aralık", sub: "kuzeyde kış" },
    { x: 300, y: 240, label: "23 Eylül", sub: "ekinoks" },
  ];
  const tilt = (23.44 * Math.PI) / 180;
  return (
    <figure className="not-prose my-8 rounded-2xl bg-[#05070d] p-4 text-white">
      <svg viewBox="0 -14 600 314" className="w-full" role="img" aria-label="Dünya'nın Güneş çevresindeki yörüngesi ve eğik ekseni">
        <ellipse cx="300" cy="150" rx="240" ry="90" fill="none" stroke="rgba(255,255,255,0.18)" strokeDasharray="4 6" />
        <circle cx="300" cy="150" r="26" fill="#fcd34d" />
        <circle cx="300" cy="150" r="36" fill="#fcd34d" fillOpacity="0.15" />
        {positions.map((p) => {
          // Eksen uzayda hep aynı yöne (sağ üste) eğik durur.
          const dx = Math.sin(tilt) * 26;
          const dy = Math.cos(tilt) * 26;
          return (
            <g key={p.label}>
              <circle cx={p.x} cy={p.y} r="15" fill="#3b82f6" />
              <line x1={p.x - dx} y1={p.y + dy} x2={p.x + dx} y2={p.y - dy} stroke="#e4e4e7" strokeWidth="1.5" />
              <text x={p.x} y={p.y < 150 ? p.y - 56 : p.y + 40} textAnchor="middle" fontSize="13" fill="#fafafa">
                {p.label}
              </text>
              <text x={p.x} y={p.y < 150 ? p.y - 42 : p.y + 54} textAnchor="middle" fontSize="11" fill="#a1a1aa">
                {p.sub}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-zinc-400">
        Ölçeksiz çizim. Eksen (beyaz çizgi, kuzey ucu yukarıda) yıl boyunca aynı yöne bakar;
        Haziran&apos;da kuzey ucu Güneş&apos;e doğru, Aralık&apos;ta Güneş&apos;in tersine eğiktir.
      </figcaption>
    </figure>
  );
}
