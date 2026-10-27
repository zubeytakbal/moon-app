import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { getMoonPhase, getUpcomingPrincipalPhases, SYNODIC_MONTH_DAYS, zonedTimeToUtc } from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { ShareButton } from "@/components/ShareButton";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.dogdugumGun;
const UPDATED = "2026-10-27";
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;
/** Ayın Dünya etrafındaki bir turu (yıldızlara göre), gün. */
const SIDEREAL_MONTH_DAYS = 27.321662;

export const metadata: Metadata = {
  title: `Doğduğum Gün Ay Nasıldı? Doğum Tarihine Göre Ay Evresi | ${siteConfig.name}`,
  description:
    "Doğum tarihinizi girin, o gün ayın hangi evrede olduğunu, yüzde kaç aydınlık ve kaç günlük olduğunu görün. Doğduğunuzdan beri kaç dolunay geçti, ay hangi yaş günlerinizde yine aynı görünecek?",
  // Girilen tarihler (?tarih=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
};

/** Ünlü tarihler: aracı denemek için örnek. */
const EXAMPLES = [
  { date: "1969-07-20", time: "", label: "Ay'a ilk iniş", note: "Apollo 11" },
  { date: "1923-10-29", time: "20:30", label: "Cumhuriyet'in ilanı", note: "Ankara" },
  { date: "2000-01-01", time: "00:00", label: "2000 yılının ilk anı", note: "Gece yarısı" },
];

export default function BirthMoonPage({ searchParams }: PageProps<"/tr/dogdugum-gun-ay">) {
  return (
    <>
      <section className="starfield bg-[#05070d] text-white">
        <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6">
          <Breadcrumb page={PAGE} tone="dark" />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Araç</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">{PAGE.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-300">
            Doğum tarihinizi girin; o gece gökyüzündeki ayı, evresini ve aydınlık oranını görün.
          </p>
          <Suspense fallback={<BirthForm />}>
            <FormAndResult searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>Ay evresi, doğduğunuz gün ve saatte ayın ne kadarının aydınlık göründüğünü anlatır.</li>
          <li>Saat girmezseniz öğle 12:00 kabul edilir. Evrenin adı gün boyunca genellikle değişmez.</li>
          <li>Hesap Türkiye saatine göredir; geçmişteki yaz saati uygulamaları da hesaba katılır.</li>
        </QuickFacts>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Örnek tarihler</h2>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {EXAMPLES.map((e) => (
            <li key={e.date}>
              <Link
                href={`${PAGE.path}?tarih=${e.date}${e.time ? `&saat=${e.time.replace(":", "")}` : ""}`}
                rel="nofollow"
                className="block h-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="font-semibold">{e.label}</p>
                <p className="text-sm text-zinc-500">
                  {formatIsoDate(e.date)} · {e.note}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <Prose>
          <h2>Doğum günündeki ay neden ilginç?</h2>
          <p>
            Ay evresi, her ay yeniden başlayan 29,5 günlük bir döngüdür. Doğum günümüz ise her yıl aynı tarihte gelir.
            Bu iki takvim birbirine uymadığı için doğum gününüzdeki ay her yıl farklıdır: bir yıl dolunay, ertesi yıl
            yaklaşık 11 gün geride, ince bir hilal olabilir.
          </p>
          <p>
            Ama bu karmaşanın içinde bir düzen saklıdır. 19 yıl, neredeyse tam olarak 235 ay döngüsüne eşittir. Bu
            yüzden 19., 38. ve 57. yaş günlerinizde ay, doğduğunuz günkü evresine çok yakın görünür. Bu düzene, onu fark
            eden Antik Yunan astronomu Meton&apos;un adıyla Meton döngüsü denir. Yukarıdaki sonuçta bu yaş
            günlerinizdeki ayı da görebilirsiniz.
          </p>

          <h2>&quot;Dolunayda doğanlar&quot; hakkında</h2>
          <p>
            Dolunay gecelerinde daha çok doğum olduğu sık duyulan bir inanıştır. Milyonlarca doğum kaydını inceleyen
            araştırmalar ise ay evresi ile doğum sayısı arasında anlamlı bir ilişki bulamamıştır. Doğduğunuz günün ayı,
            sizin hakkınızda bir şey söylemez; ama o geceye bakmanın güzel bir yoludur.
          </p>

          <h2>Hesap nasıl yapılıyor?</h2>
          <ul>
            <li>
              Girdiğiniz tarih ve saat, o tarihte Türkiye&apos;de geçerli olan saat dilimine göre evrensel zamana
              çevrilir. Türkiye 2016&apos;ya kadar yaz ve kış saati uygulamıştır; bu farklar hesaba katılır.
            </li>
            <li>
              Ayın ve Güneş&apos;in o andaki konumu astronomik modellerle hesaplanır, evre adı ve aydınlık oranı buradan
              bulunur. Ayrıntılar için <Link href={PAGES.ayEvreleri.path}>Ay Evreleri Nedir?</Link> sayfasına
              bakabilirsiniz.
            </li>
            <li>1900 ile 2100 arasındaki tarihler hesaplanabilir.</li>
          </ul>
        </Prose>

        <section className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            Hesaplar Astronomy Engine ile yapılmıştır. Ay görseli: NASA Scientific Visualization Studio. Girdiğiniz
            tarih kaydedilmez.
          </p>
          <p className="mt-2">
            Son güncelleme: <time dateTime={UPDATED}>27 Ekim 2026</time>
          </p>
        </section>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: PAGE.title,
          url: new URL(PAGE.path, siteConfig.url).toString(),
          applicationCategory: "EducationalApplication",
          inLanguage: "tr-TR",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
        }}
      />
    </>
  );
}

function formatIsoDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  hasTime: boolean;
}

function parseInput(tarih: unknown, saat: unknown): BirthInput | null {
  if (typeof tarih !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarih);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (year < 1900 || year > 2100 || month < 1 || month > 12) return null;
  if (day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;

  let hour = 12;
  let minute = 0;
  let hasTime = false;
  if (typeof saat === "string") {
    const t = /^(\d{2}):?(\d{2})$/.exec(saat);
    if (t && Number(t[1]) < 24 && Number(t[2]) < 60) {
      hour = Number(t[1]);
      minute = Number(t[2]);
      hasTime = true;
    }
  }
  return { year, month, day, hour, minute, hasTime };
}

async function FormAndResult({ searchParams }: Pick<PageProps<"/tr/dogdugum-gun-ay">, "searchParams">) {
  const { tarih, saat } = await searchParams;
  const input = parseInput(tarih, saat);
  const invalid = typeof tarih === "string" && tarih !== "" && !input;
  return (
    <>
      <BirthForm input={input} />
      {invalid && (
        <p className="mt-4 text-amber-300">
          Bu tarih anlaşılamadı. Lütfen 1900 ile 2100 arasında geçerli bir tarih seçin.
        </p>
      )}
      {input && (
        <BirthResult
          year={input.year}
          month={input.month}
          day={input.day}
          hour={input.hour}
          minute={input.minute}
          hasTime={input.hasTime}
        />
      )}
    </>
  );
}

function BirthForm({ input }: { input?: BirthInput | null }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateValue = input ? `${input.year}-${pad(input.month)}-${pad(input.day)}` : "";
  const timeValue = input?.hasTime ? `${pad(input.hour)}:${pad(input.minute)}` : "";

  return (
    <Form
      action={PAGE.path}
      scroll={false}
      className="mt-8 flex max-w-2xl flex-wrap items-end gap-3 rounded-2xl border border-white/15 bg-white/[0.05] p-4"
    >
      <label className="flex min-w-44 flex-1 flex-col gap-1 text-sm text-zinc-300">
        Doğum tarihi
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
        className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
      >
        Ayı göster
      </button>
    </Form>
  );
}

/** Bir doğum anı için sonuç kartı. Aynı girdi için sonuç bir gün önbellekte tutulur. */
async function BirthResult({ year, month, day, hour, minute, hasTime }: BirthInput) {
  "use cache";
  cacheLife("days");

  const birth = new Date(zonedTimeToUtc(year, month, day, hour, timeZone).getTime() + minute * 60_000);
  const now = new Date();
  const phase = getMoonPhase(birth, timeZone);
  const pct = Math.round(phase.illumination * 100);

  const date = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const short = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

  // En yakın dolunay (önce ya da sonra).
  const around = getUpcomingPrincipalPhases(new Date(birth.getTime() - 20 * DAY_MS), 8).filter(
    (p) => p.key === "full-moon",
  );
  const nearest = around.reduce((a, b) =>
    Math.abs(a.date.getTime() - birth.getTime()) < Math.abs(b.date.getTime() - birth.getTime()) ? a : b,
  );
  const diffDays = (nearest.date.getTime() - birth.getTime()) / DAY_MS;
  const nearestText =
    Math.abs(diffDays) < 0.5
      ? "Doğduğunuz gün dolunaydı."
      : `En yakın dolunay, doğumunuzdan ${Math.round(Math.abs(diffDays))} gün ${diffDays > 0 ? "sonraydı" : "önceydi"}.`;

  const isPast = birth < now;
  const elapsedDays = (now.getTime() - birth.getTime()) / DAY_MS;
  const fullMoons = Math.floor(elapsedDays / SYNODIC_MONTH_DAYS);
  const orbits = Math.floor(elapsedDays / SIDEREAL_MONTH_DAYS);
  const nf = new Intl.NumberFormat(siteConfig.locale);

  // 19, 38 ve 57. yaş günleri (Meton döngüsü).
  const metonic = [19, 38, 57]
    .map((age) => {
      if (year + age > 2100) return null;
      const d = zonedTimeToUtc(year + age, month, day, hour, timeZone);
      const p = getMoonPhase(d, timeZone);
      return { age, date: d, phase: p };
    })
    .filter((m) => m !== null);

  const shareText = `${short.format(birth)} günü ay: ${phase.name}, %${pct} aydınlık.`;

  return (
    <div className="mt-10 grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
      <div className="mx-auto w-[min(70vw,320px)]">
        <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={320} glow title={`${short.format(birth)}: ${phase.name}`} />
      </div>
      <div>
        <p className="text-zinc-400">
          {date.format(birth)}
          {hasTime ? `, saat ${time.format(birth)}` : ""}
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{phase.name}</p>
        <p className="mt-2 text-xl font-light text-zinc-200">
          %{pct} aydınlık · {nf.format(Math.round(phase.ageDays * 10) / 10)} günlük ·{" "}
          {phase.isWaxing ? "büyüyordu" : "küçülüyordu"}
        </p>
        <p className="mt-3 text-zinc-300">{nearestText}</p>

        {isPast && (
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <dt className="text-xs uppercase tracking-wider text-zinc-400">O günden beri</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">~{nf.format(fullMoons)}</dd>
              <dd className="text-sm text-zinc-400">dolunay geçti</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <dt className="text-xs uppercase tracking-wider text-zinc-400">Ay, Dünya&apos;nın etrafında</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">~{nf.format(orbits)}</dd>
              <dd className="text-sm text-zinc-400">tur attı</dd>
            </div>
          </dl>
        )}

        <div className="mt-6">
          <ShareButton title={PAGE.title} text={shareText} />
        </div>
      </div>

      {metonic.length > 0 && (
        <div className="md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">Ay yeniden aynı göründüğünde</p>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {metonic.map((m) => (
              <li
                key={m.age}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3"
              >
                <MoonPhaseIcon phaseAngle={m.phase.phaseAngle} size={48} title={m.phase.name} />
                <div className="leading-tight">
                  <p className="font-semibold">{m.age}. yaş günü</p>
                  <p className="text-sm text-zinc-400">
                    {short.format(m.date)} · %{Math.round(m.phase.illumination * 100)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
