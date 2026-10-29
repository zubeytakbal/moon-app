import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { getMoonPhase, getMoonSign, getMoonSignIngresses, getSunSign, zonedTimeToUtc } from "@moon-app/moon";
import { Faq } from "@/components/Faq";
import { FAQS } from "@/lib/faqs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { ShareButton } from "@/components/ShareButton";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { elementOf, ZODIAC_SYMBOLS } from "@/lib/zodiac";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.ayBurcu;
const UPDATED = "2026-10-29";
const timeZone = siteConfig.defaultLocation.timeZone;

export const metadata: Metadata = {
  title: `Ay Burcu Hesaplama: Doğduğunuzda Ay Hangi Burçtaydı? | ${siteConfig.name}`,
  description:
    "Doğum tarihinizi ve saatinizi girin, ay burcunuzu hesaplayın. Doğum saatini bilmiyorsanız ayın o gün burç değiştirip değiştirmediğini ve saatini gösteririz. Güneş burcunuz ve doğduğunuz günün ay evresi de sonuçta.",
  // Girilen tarihler (?tarih=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function MoonSignCalculatorPage({ searchParams }: PageProps<"/tr/ay-burcu-hesaplama">) {
  return (
    <>
      <section className="bg-gradient-to-b from-[#1b1236] to-[#05070d] text-white">
        <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6">
          <Breadcrumb page={PAGE} tone="dark" />
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
              Geleneksel takvim
            </span>
            <span className="text-sm text-zinc-400">Ayın konumu astronomik hesapla bulunur</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">{PAGE.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-300">
            Doğum tarihinizi ve saatinizi girin; doğduğunuz anda ayın hangi burçta olduğunu öğrenin.
          </p>
          <Suspense fallback={<SignForm />}>
            <FormAndResult searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>Ay her 2-2,5 günde bir burç değiştirir; bu yüzden ay burcu için doğum saati önemlidir.</li>
          <li>Saatinizi bilmiyorsanız, ay o gün burç değiştirdiyse geçiş saatini gösteririz.</li>
          <li>Ay burcu, Türkiye içinde doğum yerine göre değişmez; yalnızca doğum anına bağlıdır.</li>
        </QuickFacts>

        <Prose>
          <h2>Ay burcu nedir?</h2>
          <p>
            Astrolojide &quot;burcunuz&quot; denildiğinde genellikle güneş burcu kastedilir: doğduğunuz gün
            Güneş&apos;in gökyüzünde bulunduğu burç. Ay burcu ise doğduğunuz anda ayın bulunduğu burçtur. Astroloji
            geleneğinde güneş burcunun kişinin dışa dönük yanını, ay burcunun ise duygusal yanını temsil ettiği kabul
            edilir.
          </p>
          <p>
            Güneş bir burçta yaklaşık bir ay kalırken ay, burçlar kuşağını 27,3 günde dolaşır. Bu yüzden aynı ay içinde,
            hatta birkaç gün arayla doğan iki kişinin güneş burcu aynı, ay burcu farklı olabilir.
          </p>

          <h2>Doğum saati neden önemli?</h2>
          <p>
            Ay gökyüzünde saatte yaklaşık yarım derece, yani günde 12-15 derece ilerler. Bir burç 30 derece olduğu için
            ay her 2-2,5 günde bir burç değiştirir. Doğduğunuz gün ay burç değiştirmediyse saat bilmeden de ay burcunuzu
            kesin olarak bulabiliriz. Ama ay o gün burç değiştirdiyse, sonucun doğru çıkması için doğum saatini bilmek
            gerekir. Hesaplayıcı bu durumda geçiş saatini gösterir.
          </p>

          <h2>Doğum yeri neden sorulmuyor?</h2>
          <p>
            Ay burcu, ayın Dünya&apos;nın merkezinden görülen konumuna göre hesaplanır ve doğum yerine göre değişmez.
            Önemli olan yalnızca doğum anıdır. Türkiye&apos;nin tamamı aynı saat dilimini kullandığı için ilinizi
            sormamıza gerek yok. Hesap, doğduğunuz tarihte Türkiye&apos;de geçerli olan saate göre yapılır; 2016&apos;ya
            kadar uygulanan yaz ve kış saati farkları da hesaba katılır. Yurt dışında doğduysanız, doğum saatinizi
            Türkiye saatine çevirerek girmelisiniz.
          </p>
          <p>
            Doğum yeri, astrolojide yükselen burcu hesaplamak için gereklidir. Yükselen burç bu sitenin kapsamında
            değildir; biz yalnızca ayla ilgili hesapları yapıyoruz.
          </p>

          <h2>Bugün ay hangi burçta?</h2>
          <p>
            Ayın şu anki burcunu ve önümüzdeki günlerde hangi burçlara geçeceğini{" "}
            <Link href={PAGES.ayHangiBurcta.path}>Bugün Ay Hangi Burçta?</Link> sayfasında bulabilirsiniz. Doğduğunuz
            günün ay evresini ve o geceki ayın görüntüsünü görmek için{" "}
            <Link href={PAGES.dogdugumGun.path}>Doğduğum Gün Ay Nasıldı?</Link> aracını deneyin.
          </p>

          <h2>Bilimsel bir not</h2>
          <p>
            Ayın doğum anındaki konumu astronomik olarak kesin hesaplanabilir. Ama ayın burcunun kişilik ya da kader
            üzerinde etkisi olduğuna dair bilimsel bir kanıt yoktur. Bu hesaplayıcıyı, yüzyıllardır süren bir takvim
            geleneğinin parçası olarak sunuyoruz.
          </p>
        </Prose>

        <Faq items={FAQS.ayBurcu} />
        <section className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            Hesaplar Astronomy Engine ile, tarihin gerçek ekinoksuna göre (tropikal burçlar) yapılmıştır. Girdiğiniz
            tarih kaydedilmez.
          </p>
          <p className="mt-2">
            Son güncelleme: <time dateTime={UPDATED}>29 Ekim 2026</time>
          </p>
        </section>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: PAGE.title,
          url: new URL(PAGE.path, siteConfig.url).toString(),
          applicationCategory: "LifestyleApplication",
          inLanguage: "tr-TR",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
        }}
      />
    </>
  );
}

interface Input {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  hasTime: boolean;
}

function parseInput(tarih: unknown, saat: unknown): Input | null {
  if (typeof tarih !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarih);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (year < 1900 || year > 2100 || month < 1 || month > 12) return null;
  if (day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;
  if (typeof saat === "string") {
    const t = /^(\d{2}):?(\d{2})$/.exec(saat);
    if (t && Number(t[1]) < 24 && Number(t[2]) < 60) {
      return { year, month, day, hour: Number(t[1]), minute: Number(t[2]), hasTime: true };
    }
  }
  return { year, month, day, hour: 12, minute: 0, hasTime: false };
}

async function FormAndResult({ searchParams }: Pick<PageProps<"/tr/ay-burcu-hesaplama">, "searchParams">) {
  const { tarih, saat } = await searchParams;
  const input = parseInput(tarih, saat);
  const invalid = typeof tarih === "string" && tarih !== "" && !input;
  return (
    <>
      <SignForm input={input} />
      {invalid && (
        <p className="mt-4 text-amber-300">
          Bu tarih anlaşılamadı. Lütfen 1900 ile 2100 arasında geçerli bir tarih seçin.
        </p>
      )}
      {input && <SignResult {...input} />}
    </>
  );
}

function SignForm({ input }: { input?: Input | null }) {
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
        Doğum saati
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
        className="rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-400"
      >
        Hesapla
      </button>
    </Form>
  );
}

/** Sonuç kartı. Aynı girdi için sonuç bir gün önbellekte tutulur. */
async function SignResult({ year, month, day, hour, minute, hasTime }: Input) {
  "use cache";
  cacheLife("days");

  const birth = new Date(zonedTimeToUtc(year, month, day, hour, timeZone).getTime() + minute * 60_000);
  const dayStart = zonedTimeToUtc(year, month, day, 0, timeZone);
  const dayEnd = zonedTimeToUtc(year, month, day + 1, 0, timeZone);
  const moon = getMoonSign(birth);
  const sun = getSunSign(birth);
  const phase = getMoonPhase(birth, timeZone);

  // Saat bilinmiyorsa: ay o gün burç değiştirdi mi?
  const changeToday = getMoonSignIngresses(dayStart, 1).find((i) => i.date < dayEnd);
  const signAtStart = getMoonSign(dayStart);

  const date = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const ambiguous = !hasTime && changeToday;

  return (
    <div className="mt-10">
      <p className="text-zinc-400">
        {date.format(birth)}
        {hasTime ? `, saat ${time.format(birth)}` : ", saat girilmedi"}
      </p>

      {ambiguous ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { sign: signAtStart, when: `Doğum saatiniz ${time.format(changeToday.date)} öncesiyse` },
            { sign: changeToday.sign, when: `Doğum saatiniz ${time.format(changeToday.date)} sonrasıysa` },
          ].map(({ sign, when }) => (
            <SignCard key={sign.index} index={sign.index} name={sign.name} note={when} />
          ))}
          <p className="text-sm text-amber-200 sm:col-span-2">
            Ay bu gün saat {time.format(changeToday.date)} civarında burç değiştirdi. Kesin sonuç için doğum saatinizi
            girin.
          </p>
        </div>
      ) : (
        <div className="mt-4 max-w-md">
          <SignCard
            index={moon.index}
            name={moon.name}
            note={`Ay burcunuz · ${Math.floor(moon.degree) + 1}. derece · ${elementOf(moon.index)} grubu`}
            big
          />
        </div>
      )}

      <dl className="mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <span aria-hidden="true" className="text-3xl text-amber-200">
            {ZODIAC_SYMBOLS[sun.index]}
          </span>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-400">Güneş burcunuz</dt>
            <dd className="text-lg font-semibold">{sun.name}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={40} title={phase.name} />
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-400">Doğduğunuz anda ay</dt>
            <dd className="text-lg font-semibold">
              {phase.name} · %{Math.round(phase.illumination * 100)}
            </dd>
          </div>
        </div>
      </dl>

      {!ambiguous && (
        <div className="mt-6">
          <ShareButton title={PAGE.title} text={`Ay burcum ${moon.name}, güneş burcum ${sun.name}.`} />
        </div>
      )}
    </div>
  );
}

function SignCard({ index, name, note, big = false }: { index: number; name: string; note: string; big?: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-amber-300/30 bg-amber-300/[0.07] p-5">
      <span aria-hidden="true" className={`${big ? "text-6xl" : "text-4xl"} text-amber-200`}>
        {ZODIAC_SYMBOLS[index]}
      </span>
      <div>
        <p className={`${big ? "text-4xl sm:text-5xl" : "text-3xl"} font-bold tracking-tight`}>{name}</p>
        <p className="mt-1 text-sm text-zinc-300">{note}</p>
      </div>
    </div>
  );
}
