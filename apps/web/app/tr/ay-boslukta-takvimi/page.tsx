import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { BODY_NAMES_TR, getVoidOfCoursePeriods, zonedTimeToUtc, type VoidOfCourse } from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { ZODIAC_SYMBOLS } from "@/lib/zodiac";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.aybosluk;
const UPDATED = "2026-10-28";
const timeZone = siteConfig.defaultLocation.timeZone;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `Ay Boşlukta mı? Boşluktaki Ay Takvimi ve Tarih Kontrolü | ${siteConfig.name}`,
  description:
    "Ay şu an boşlukta mı? Planladığınız gün ve saat boşlukta mı, kontrol edin. Önümüzdeki dört haftanın boşluktaki ay dönemleri, başlangıç ve bitiş saatleri (Türkiye saati), ayın son açısı ve gireceği burç.",
  // Girilen tarihler (?tarih=...&saat=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

const ASPECT_TR: Record<number, string> = {
  0: "kavuşum",
  60: "altmışlık",
  90: "kare",
  120: "üçgen",
  180: "karşıt",
};

function durationText(ms: number) {
  const hours = ms / HOUR_MS;
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} dakika`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h} saat` : `${h} saat ${m} dakika`;
}

/** Şu an ve önümüzdeki dört hafta: içinde bulunulan boşluk varsa o da dahil. */
function upcoming(now: Date): VoidOfCourse[] {
  // Bir önceki burç geçişinden başlayarak ara ki şu an süren boşluk da listeye girsin.
  return getVoidOfCoursePeriods(new Date(now.getTime() - 3 * DAY_MS), 16)
    .filter((v) => v.end > now)
    .slice(0, 12);
}

export default function VoidOfCoursePage({ searchParams }: PageProps<"/tr/ay-boslukta-takvimi">) {
  return (
    <>
      <Hero />
      <section className="bg-[#05070d] text-white" aria-labelledby="tarih-kontrol">
        <div className="mx-auto w-full max-w-5xl px-4 pb-14">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <h2 id="tarih-kontrol" className="text-xl font-semibold">
              Planladığınız gün boşlukta mı?
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Düğün, imza, taşınma ya da toplantı tarihinizi girin. Saat girerseniz o anı, girmezseniz bütün günü
              gösteririz.
            </p>
            <Suspense fallback={<CheckForm />}>
              <FormAndResult searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>
            Ay, bulunduğu burçta son açısını yaptıktan sonra bir sonraki burca girene kadar &quot;boşlukta&quot;
            sayılır.
          </li>
          <li>Bu dönemler birkaç dakikadan iki güne kadar sürebilir ve her 2-3 günde bir yaşanır.</li>
          <li>Geleneksel takvimde bir inanıştır; ayın konumu ve açılar astronomik olarak hesaplanır.</li>
        </QuickFacts>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight sm:text-3xl">Önümüzdeki boşluktaki ay dönemleri</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Başlangıç: ayın son açısı. Bitiş: ayın yeni burca girişi. Bütün saatler Türkiye saatidir.
        </p>
        <PeriodList />

        <Prose>
          <h2>&quot;Ay boşlukta&quot; ne demek?</h2>
          <p>
            Ay, burçlar kuşağında ilerlerken Güneş&apos;le ve gezegenlerle belirli açılar yapar. Astrolojide en çok
            bakılan açılar kavuşum (0°), altmışlık (60°), kare (90°), üçgen (120°) ve karşıttır (180°). Ay bulunduğu
            burçtaki son açısını yaptıktan sonra, bir sonraki burca girene kadar başka bir açı yapmaz. Bu aralığa{" "}
            <strong>boşluktaki ay</strong> (İngilizcede &quot;void of course&quot;) denir.
          </p>

          <h2>Tarihinizi nasıl kontrol ediyoruz?</h2>
          <p>
            Girdiğiniz günün Türkiye saatiyle başından sonuna kadar hangi boşluk dönemlerine denk geldiğine bakarız.
            Boşluk bir önceki gün başlamışsa ya da ertesi güne taşıyorsa, yalnızca sizin gününüze düşen kısmı
            gösterilir; dönemin gerçek başlangıç ve bitişi de yanında yazar. Saat girdiyseniz o dakikanın boşluğa
            düşüp düşmediği söylenir. &quot;Boşlukta olmadığı saatler&quot; kutusu, aynı gün içinde başka bir saat
            seçmek isteyenler için hazırlanmıştır.
          </p>

          <h2>Gelenekte boşluktaki ay</h2>
          <p>
            Astroloji geleneğinde boşluktaki ay dönemleri, yeni bir işe başlamak, önemli bir karar almak ya da bir
            sözleşme imzalamak için uygun görülmez. Bu dönemde başlanan işlerin &quot;bir yere varmayacağına&quot;
            inanılır. Rutin işler, dinlenme ve önceden başlanmış işleri bitirmek için ise sakıncalı sayılmaz.
          </p>

          <h2>Neden kaynaklar farklı saatler veriyor?</h2>
          <p>
            Boşluktaki ayın başlangıcı, hangi gök cisimlerinin hesaba katıldığına göre değişir. Geleneksel astroloji
            yalnızca Güneş&apos;e, Merkür&apos;e, Venüs&apos;e, Mars&apos;a, Jüpiter&apos;e ve Satürn&apos;e bakar.
            Modern astroloji bunlara Uranüs&apos;ü, Neptün&apos;ü ve Plüton&apos;u da ekler. Bu sayfada modern küme
            kullanılmıştır; bu yüzden boşluk dönemleri geleneksel takvimlere göre bazen daha kısadır. Hesaplarımızı
            yayımlanmış modern takvimlerle karşılaştırdık: örneğin 4-5 Kasım 2026&apos;daki 31 saatlik ve 24 Kasım
            2026&apos;daki 1 saatlik boşluklar birebir örtüşüyor.
          </p>

          <h2>Ayın burcu</h2>
          <p>
            Boşluk, ayın yeni burca girmesiyle biter. Ayın şu anki burcunu ve burç geçiş saatlerini{" "}
            <Link href={PAGES.ayHangiBurcta.path}>Bugün Ay Hangi Burçta?</Link> sayfasında bulabilirsiniz.
          </p>

          <h2>Bilimsel bir not</h2>
          <p>
            Ayın ve gezegenlerin gökyüzündeki konumları ve aralarındaki açılar astronomik olarak kesin hesaplanabilir.
            Ancak bu açıların ya da boşluktaki ayın insanlar ve olaylar üzerinde bir etkisi olduğuna dair bilimsel bir
            kanıt yoktur. Bu takvimi, yaygın bir geleneğin doğru saatlerle hesaplanmış hali olarak sunuyoruz.
          </p>
        </Prose>

        <section className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            Konumlar Astronomy Engine ile yer merkezli olarak hesaplanmıştır. Açı anları saniye düzeyinde bulunur,
            dakikaya yuvarlanarak gösterilir.
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

const fmt = () => ({
  dateTime: new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }),
  day: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "short", weekday: "short" }),
  time: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" }),
});

/** Giriş: ay şu an boşlukta mı? Saatte bir yenilenir. */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const [first, second] = upcoming(now);
  const active = first.start <= now;
  const next = active ? second : first;
  const f = fmt();

  return (
    <section className="bg-gradient-to-b from-[#1b1236] to-[#05070d] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6">
        <Breadcrumb page={PAGE} tone="dark" />
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
            Geleneksel takvim
          </span>
        </div>
        <h1 className="mt-4 text-lg font-medium text-zinc-300">Ay boşlukta mı?</h1>
        <p className={`mt-2 text-5xl font-bold tracking-tight sm:text-7xl ${active ? "text-amber-300" : ""}`}>
          {active ? "Evet, boşlukta" : "Hayır"}
        </p>
        <p className="mt-4 max-w-2xl text-lg text-zinc-300">
          {active
            ? `Boşluk ${f.dateTime.format(first.start)} başladı, ay ${first.nextSign.name} burcuna geçince ${f.dateTime.format(first.end)} bitecek.`
            : `Ay şu an boşlukta değil. Bir sonraki boşluk ${f.dateTime.format(first.start)} başlayacak.`}
        </p>
        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">{active ? "Kalan süre" : "Başlamasına"}</p>
            <p className="mt-1 text-2xl font-semibold">
              {durationText((active ? first.end : first.start).getTime() - now.getTime())}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              {active ? "Sonraki boşluk" : "Boşluk süresi"}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {active ? f.dateTime.format(next.start) : durationText(first.end.getTime() - first.start.getTime())}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Önümüzdeki boşluk dönemleri. Saatte bir yenilenir. */
async function PeriodList() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const list = upcoming(now);
  const f = fmt();

  return (
    <ol className="mt-6 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {list.map((v) => {
        const active = v.start <= now;
        const ms = v.end.getTime() - v.start.getTime();
        return (
          <li
            key={v.end.toISOString()}
            className={`flex items-start gap-4 px-4 py-3 sm:px-5 ${active ? "bg-amber-50 dark:bg-amber-950/30" : ""}`}
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1b1236] text-xl text-amber-200"
            >
              {ZODIAC_SYMBOLS[v.nextSign.index]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                <time dateTime={v.start.toISOString()}>
                  {f.day.format(v.start)} {f.time.format(v.start)}
                </time>
                {" → "}
                <time dateTime={v.end.toISOString()}>
                  {f.day.format(v.end)} {f.time.format(v.end)}
                </time>
                {active && (
                  <span className="ml-2 rounded bg-amber-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                    Şu an
                  </span>
                )}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {v.lastAspect
                  ? `Son açı: ${BODY_NAMES_TR[v.lastAspect.body]} ile ${ASPECT_TR[v.lastAspect.aspect]}`
                  : "Son açı bulunamadı"}{" "}
                · {v.nextSign.name} burcuna geçiş
              </p>
            </div>
            <span className="shrink-0 text-sm tabular-nums text-zinc-500">{durationText(ms)}</span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Araç: planladığınız gün boşlukta mı? ---------- */

interface CheckInput {
  year: number;
  month: number;
  day: number;
  /** Günün başından itibaren dakika; saat girilmediyse null. */
  minutes: number | null;
}

function parseCheck(tarih: unknown, saat: unknown): CheckInput | null {
  if (typeof tarih !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarih);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (year < 1900 || year > 2100 || month < 1 || month > 12) return null;
  if (day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;
  let minutes: number | null = null;
  if (typeof saat === "string") {
    const t = /^(\d{2}):?(\d{2})$/.exec(saat);
    if (t && Number(t[1]) < 24 && Number(t[2]) < 60) minutes = Number(t[1]) * 60 + Number(t[2]);
  }
  return { year, month, day, minutes };
}

const pad = (n: number) => String(n).padStart(2, "0");

async function FormAndResult({ searchParams }: Pick<PageProps<"/tr/ay-boslukta-takvimi">, "searchParams">) {
  const { tarih, saat } = await searchParams;
  const input = parseCheck(tarih, saat);
  const invalid = typeof tarih === "string" && tarih !== "" && !input;
  return (
    <>
      <CheckForm input={input} />
      {invalid && (
        <p className="mt-4 text-amber-300">
          Bu tarih anlaşılamadı. Lütfen 1900 ile 2100 arasında geçerli bir tarih seçin.
        </p>
      )}
      {input && <CheckResult {...input} />}
    </>
  );
}

function CheckForm({ input }: { input?: CheckInput | null }) {
  const dateValue = input ? `${input.year}-${pad(input.month)}-${pad(input.day)}` : "";
  const timeValue =
    input && input.minutes !== null ? `${pad(Math.floor(input.minutes / 60))}:${pad(input.minutes % 60)}` : "";
  return (
    <>
      <Form action={PAGE.path} scroll={false} className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex min-w-44 flex-1 flex-col gap-1 text-sm text-zinc-300">
          Tarih
          <input
            type="date"
            name="tarih"
            required
            min="1900-01-01"
            max="2100-12-31"
            defaultValue={dateValue}
            key={dateValue}
            className="rounded-xl border border-white/15 bg-[#0d111c] px-3 py-2.5 text-base text-white [color-scheme:dark]"
          />
        </label>
        <label className="flex w-36 flex-col gap-1 text-sm text-zinc-300">
          Saat (isteğe bağlı)
          <input
            type="time"
            name="saat"
            defaultValue={timeValue}
            key={timeValue}
            className="rounded-xl border border-white/15 bg-[#0d111c] px-3 py-2.5 text-base text-white [color-scheme:dark]"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-[#1b1236] transition hover:bg-amber-300"
        >
          Kontrol et
        </button>
      </Form>
      <Shortcuts />
    </>
  );
}

/** "Yarın", "Bu cumartesi", "Bu pazar" kısayolları. Saatte bir yenilenir. */
async function Shortcuts() {
  "use cache";
  cacheLife("hours");
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .split("-")
    .map(Number);
  // 0 = pazartesi, 5 = cumartesi, 6 = pazar
  const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  const at = (offset: number) => new Date(Date.UTC(y, m - 1, d + offset)).toISOString().slice(0, 10);
  const items = [
    { label: "Yarın", date: at(1) },
    // Pazar günü "bu cumartesi" geçmişte kaldığı için gelecek cumartesi gösterilir.
    { label: weekday === 6 ? "Gelecek cumartesi" : "Bu cumartesi", date: at(weekday === 6 ? 6 : 5 - weekday) },
    { label: "Bu pazar", date: at(6 - weekday) },
  ];
  return (
    <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
      Kısayollar:
      {items.map((i) => (
        <Link
          key={i.label}
          href={`${PAGE.path}?tarih=${i.date}`}
          rel="nofollow"
          scroll={false}
          className="rounded-full border border-white/15 px-3 py-1 text-zinc-200 hover:border-white/30 hover:text-white"
        >
          {i.label}
        </Link>
      ))}
    </p>
  );
}

/** Bir günün boşluk durumu. Sonuç yalnızca tarihe bağlıdır, bir gün önbellekte tutulur. */
async function CheckResult({ year, month, day, minutes }: CheckInput) {
  "use cache";
  cacheLife("days");

  const f = fmt();
  const dayStart = zonedTimeToUtc(year, month, day, 0, timeZone);
  const dayEnd = zonedTimeToUtc(year, month, day + 1, 0, timeZone);
  const span = dayEnd.getTime() - dayStart.getTime();
  const periods = getVoidOfCoursePeriods(new Date(dayStart.getTime() - 3 * DAY_MS), 5).filter(
    (v) => v.end > dayStart && v.start < dayEnd,
  );
  // Günün içine düşen kısımlar.
  const voids = periods.map((v) => ({
    period: v,
    from: new Date(Math.max(v.start.getTime(), dayStart.getTime())),
    to: new Date(Math.min(v.end.getTime(), dayEnd.getTime())),
  }));
  const free: { from: Date; to: Date }[] = [];
  let cursor = dayStart;
  for (const v of voids) {
    if (v.from > cursor) free.push({ from: cursor, to: v.from });
    cursor = v.to;
  }
  if (cursor < dayEnd) free.push({ from: cursor, to: dayEnd });

  // Gün sonu, ertesi günün 00:00 saati yerine 24:00 olarak yazılır.
  const clock = (d: Date) => (d.getTime() === dayEnd.getTime() ? "24:00" : f.time.format(d));
  const range = (a: Date, b: Date) => `${clock(a)} – ${clock(b)}`;
  const voidMs = voids.reduce((sum, v) => sum + (v.to.getTime() - v.from.getTime()), 0);
  const dateLabel = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(dayStart.getTime() + span / 2));

  const at = minutes === null ? null : dayStart.getTime() + minutes * 60_000;
  const hit =
    at === null ? undefined : voids.find((v) => v.period.start.getTime() <= at && at < v.period.end.getTime());
  const timeLabel = minutes === null ? "" : `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

  let headline: string;
  let isVoid: boolean;
  if (at !== null) {
    isVoid = Boolean(hit);
    headline = isVoid ? `Saat ${timeLabel}: ay boşlukta` : `Saat ${timeLabel}: ay boşlukta değil`;
  } else if (voidMs === 0) {
    isVoid = false;
    headline = "Bu gün ay hiç boşlukta değil";
  } else {
    isVoid = true;
    headline = `Bu gün ay toplam ${durationText(voidMs)} boşlukta`;
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-6" aria-live="polite">
      <p className="text-sm text-zinc-400">{dateLabel}</p>
      <p
        className={`mt-1 text-3xl font-bold tracking-tight sm:text-4xl ${isVoid ? "text-amber-300" : "text-emerald-300"}`}
      >
        {isVoid ? "✗ " : "✓ "}
        {headline}
      </p>
      {hit && (
        <p className="mt-2 text-zinc-300">
          Boşluk {f.dateTime.format(hit.period.start)} başlıyor, ay {hit.period.nextSign.name} burcuna geçince{" "}
          {f.dateTime.format(hit.period.end)} bitiyor.
        </p>
      )}

      <div className="mt-6" aria-hidden="true">
        <div className="relative h-8 overflow-hidden rounded-lg bg-emerald-400/15">
          {voids.map((v) => (
            <div
              key={v.period.end.toISOString()}
              className="absolute inset-y-0 bg-amber-400/70"
              style={{
                left: `${((v.from.getTime() - dayStart.getTime()) / span) * 100}%`,
                width: `${((v.to.getTime() - v.from.getTime()) / span) * 100}%`,
              }}
            />
          ))}
          {at !== null && (
            <div
              className="absolute inset-y-0 w-0.5 bg-white"
              style={{ left: `${((at - dayStart.getTime()) / span) * 100}%` }}
            />
          )}
        </div>
        <div className="mt-1 flex justify-between text-xs tabular-nums text-zinc-500">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400/70" /> Boşlukta
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400/40" /> Boşlukta değil
          </span>
          {at !== null && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-0.5 bg-white" /> Seçtiğiniz saat
            </span>
          )}
        </p>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.08] p-4">
          <dt className="text-xs uppercase tracking-wider text-amber-200/80">Boşlukta olduğu saatler</dt>
          {voids.length ? (
            voids.map((v) => (
              <dd key={v.period.end.toISOString()} className="mt-1">
                <span className="font-semibold tabular-nums">{range(v.from, v.to)}</span>
                {(v.period.start < dayStart || v.period.end > dayEnd) && (
                  <span className="block text-xs text-zinc-400">
                    Dönemin tamamı: {f.day.format(v.period.start)} {f.time.format(v.period.start)} →{" "}
                    {f.day.format(v.period.end)} {f.time.format(v.period.end)}
                  </span>
                )}
              </dd>
            ))
          ) : (
            <dd className="mt-1 font-semibold">Yok</dd>
          )}
        </div>
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/[0.08] p-4">
          <dt className="text-xs uppercase tracking-wider text-emerald-200/80">Boşlukta olmadığı saatler</dt>
          {free.length ? (
            free.map((r) => (
              <dd key={r.from.toISOString()} className="mt-1 font-semibold tabular-nums">
                {range(r.from, r.to)}
              </dd>
            ))
          ) : (
            <dd className="mt-1 font-semibold">Gün boyunca boşlukta</dd>
          )}
        </div>
      </dl>
    </div>
  );
}
