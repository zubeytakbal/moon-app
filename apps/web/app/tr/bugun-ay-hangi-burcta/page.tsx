import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  getCurrentSignIngress,
  getMoonConstellation,
  getMoonPhase,
  getMoonSign,
  getMoonSignIngresses,
  zonedTimeToUtc,
} from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Byline } from "@/components/Byline";
import { AnswerBox, DataTable } from "@/components/InfoTables";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter, countdown } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { constellationTr, elementOf, ZODIAC_SYMBOLS } from "@/lib/zodiac";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.ayHangiBurcta;
const UPDATED = "2026-11-01";
const src = pageSources("nasaMoonFactSheet", "iauConstellations", "nasaConstellations");
const timeZone = siteConfig.defaultLocation.timeZone;
const HOUR_MS = 3_600_000;

export const metadata: Metadata = {
  title: `Bugün Ay Hangi Burçta? Ay Burç Takvimi | ${siteConfig.name}`,
  description:
    "Ay şu an hangi burçta, saat kaçta burç değiştirecek? Önümüzdeki günlerin ay burçları ve geçiş saatleri (Türkiye saati). Ay gökyüzünde aslında hangi takımyıldızın önünde?",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function MoonSignTodayPage() {
  return (
    <>
      <Hero />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Bugün hangi burçta?" },
          { href: "#gecisler", label: "Önümüzdeki günler" },
          { href: "#gokyuzu", label: "Gökyüzünde nerede?" },
          { href: "#ne-demek", label: "Ay burcu nedir?" },
          { href: "#takimyildiz", label: "Burç ve takımyıldız" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <SignAnswer />
        </div>

        <h2 id="gecisler" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
          Önümüzdeki günlerde ay hangi burçta?
        </h2>
        <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
          Ayın her burca giriş ve çıkış saati (Türkiye saati). Vurgulu satır, ayın şu an bulunduğu burçtur.
        </p>
        <Ingresses />
        <p className="mt-3 text-sm text-zinc-500">
          Saatler ayın gökyüzündeki gerçek konumundan hesaplanır; yayımlanmış astroloji takvimleriyle birkaç dakika fark
          çıkabilir.{" "}
          <Link href={PAGES.yontem.path} className="underline underline-offset-2">
            Hesap ne kadar doğru?
          </Link>
        </p>

        <SkyVsSign />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2 id="ne-demek">Ayın burcu ne demek?</h2>
            <p>
              Astrolojide burçlar, Güneş&apos;in bir yıl boyunca gökyüzünde izlediği yolu (ekliptik) 30&apos;ar
              derecelik 12 eşit parçaya böler. Güneş bu yolu bir yılda, ay ise yaklaşık bir ayda dolaşır. &quot;Ay Boğa
              burcunda&quot; demek, ayın o anda bu yolun Boğa&apos;ya ayrılmış 30 derecelik dilimi içinde olması
              demektir.
            </p>
            <p>
              Doğum anındaki ay burcu &quot;ay burcu&quot; olarak bilinir. Günlük ay burcu ise geleneksel takvimlerde,
              örneğin bahçe işleri ya da saç kesimi gibi işler için gün seçerken kullanılır.
            </p>

            <h2 id="neden-sik">Ay neden bu kadar sık burç değiştirir?</h2>
            <p>
              Güneş bir burçta yaklaşık bir ay kalırken ay, Dünya etrafındaki hızlı yolculuğu yüzünden burçlar kuşağını
              27,3 günde tamamlar.{src.ref("nasaMoonFactSheet")} 360 dereceyi 12 burca bölünce ay her burçta ortalama 2,3 gün kalır. Ayın hızı
              yörüngesindeki konuma göre değiştiği için bu süre 2 ile 2,7 gün arasında değişir; yukarıdaki tabloda
              sürelerin farklı olmasının nedeni budur.
            </p>

            <h2 id="takimyildiz">Burç ile takımyıldız neden farklı?</h2>
            <p>
              Burçlar adlarını takımyıldızlardan alır, ama bugün aynı yerde değildirler. Burçların sınırları yaklaşık
              2.000 yıl önce, ilkbahar ekinoksu Koç takımyıldızındayken belirlenmiştir. O zamandan beri Dünya&apos;nın
              ekseni bir topacın eksenini andıran yavaş bir dönüşle kayar (presesyon). Bu yüzden ekinoks noktası her 72
              yılda yaklaşık 1 derece geriye kaymıştır. Bugün aradaki fark yaklaşık 24 derecedir: astrolojide ay Boğa
              burcundayken, gökyüzünde çoğu zaman hâlâ Koç takımyıldızının önündedir.
            </p>
            <p>
              Ayrıca takımyıldızlar eşit büyüklükte değildir ve ayın yolu, burçlar listesinde olmayan Yılancı
              (Ophiuchus) gibi takımyıldızlardan da geçer. Batı astrolojisi bu yüzden takımyıldızları değil, eşit 30
              derecelik burçları kullanır. Gökbilimde ise gökyüzü 88 resmî takımyıldıza bölünmüştür; sınırları
              1928&apos;de Uluslararası Astronomi Birliği (IAU) onaylamıştır. Yukarıdaki &quot;gökyüzünde ay aslında
              nerede?&quot; kutusu bu resmî sınırları kullanır.{src.ref("iauConstellations")}
            </p>

            <h2>Bu sayfa neden &quot;geleneksel takvim&quot; olarak etiketli?</h2>
            <p>
              Ayın gökyüzündeki konumu ve burç geçiş saatleri astronomik hesaplarla, kesin olarak bulunur. Ama ayın
              burcunun insanlar, işler ya da olaylar üzerinde bir etkisi olduğuna dair bilimsel bir kanıt yoktur.
              {src.ref("nasaConstellations")}
              Burçları, yüzyıllardır yaşayan bir takvim geleneği olarak sunuyoruz; yorum yapmıyoruz. Ayın gerçek
              evresini ve gökyüzündeki görünüşünü <Link href={PAGES.bugunAy.path}>Bugün Ay Nasıl?</Link> sayfasında
              bulabilirsiniz.
            </p>
          </Prose>

          <ArticleFooter page={PAGE} headline="Bugün Ay Hangi Burçta? Ay Burç Takvimi" updated={UPDATED} src={src} />
        </div>
      </main>
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
  time: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" }),
  day: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", weekday: "short" }),
});

/** Giriş: ayın şu anki burcu, burca giriş ve çıkış saatleri. Saatte bir yenilenir. */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const sign = getMoonSign(now);
  const since = getCurrentSignIngress(now);
  const [next] = getMoonSignIngresses(now, 1);
  const phase = getMoonPhase(now, timeZone);
  const f = fmt();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1b1236] to-[#05070d] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6 md:pb-20">
        <Breadcrumb page={PAGE} tone="dark" />
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
            Geleneksel takvim
          </span>
          <span className="text-sm text-zinc-400">Burç konumu astronomik hesapla bulunur</span>
        </div>
        <h1 className="mt-4 text-lg font-medium text-zinc-300">{PAGE.title}</h1>
        <Byline updated={UPDATED} />

        <div className="mt-4 grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="flex items-baseline gap-4">
              <span aria-hidden="true" className="text-6xl text-amber-200 sm:text-7xl">
                {ZODIAC_SYMBOLS[sign.index]}
              </span>
              <span className="text-5xl font-bold tracking-tight sm:text-7xl">{sign.name}</span>
            </p>
            <p className="mt-3 text-lg text-zinc-300">
              Ay şu an {sign.name} burcunun {Math.floor(sign.degree) + 1}. derecesinde · {elementOf(sign.index)} grubu
            </p>
            <dl className="mt-6 grid max-w-lg grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <dt className="text-xs uppercase tracking-wider text-zinc-400">Bu burca girdi</dt>
                <dd className="mt-1 font-semibold">{f.dateTime.format(since.date)}</dd>
              </div>
              <div className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.07] p-4">
                <dt className="text-xs uppercase tracking-wider text-amber-200/80">{next.sign.name} burcuna geçecek</dt>
                <dd className="mt-1 font-semibold">{f.dateTime.format(next.date)}</dd>
              </div>
            </dl>
          </div>
          <div className="flex justify-center">
            <div className="w-[min(60vw,240px)]">
              <MoonPhaseIcon
                phaseAngle={phase.phaseAngle}
                size={240}
                glow
                title={`Ayın şu anki görünümü: ${phase.name}`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Önümüzdeki burç geçişleri, sütunlu tablo (şu anki burç vurgulu). Saatte bir yenilenir. */
async function Ingresses() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const current = getCurrentSignIngress(now);
  const list = [current, ...getMoonSignIngresses(now, 10)];
  const f = fmt();
  const nf = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 0 });
  const at = (d: Date) => (
    <time dateTime={d.toISOString()} className="whitespace-nowrap">
      {f.day.format(d)} {f.time.format(d)}
    </time>
  );

  return (
    <DataTable
      columns={["Burç", "Giriş", "Çıkış", "Süre"]}
      highlight={current.date.toISOString()}
      rows={list.slice(0, -1).map((ing, i) => {
        const end = list[i + 1].date;
        const hours = (end.getTime() - ing.date.getTime()) / HOUR_MS;
        return {
          key: ing.date.toISOString(),
          cells: [
            <span key="s" className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="text-lg text-violet-700 dark:text-amber-200">
                {ZODIAC_SYMBOLS[ing.sign.index]}
              </span>
              {ing.sign.name}
              {i === 0 && (
                <span className="rounded bg-violet-600 px-1.5 py-0.5 text-xs font-semibold text-white">Şu an</span>
              )}
            </span>,
            at(ing.date),
            at(end),
            <span key="h" className="tabular-nums">{nf.format(hours)} saat</span>,
          ],
        };
      })}
    />
  );
}

/**
 * Sayfanın sorusunun cevabı, en üstte (timeanddate düzeni): ayın şu anki burcu, ne zaman değişeceği ve bugün
 * (Türkiye günü) hangi burçlarda bulunduğu. Saatte bir yenilenir.
 */
async function SignAnswer() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const sign = getMoonSign(now);
  const since = getCurrentSignIngress(now);
  const [next] = getMoonSignIngresses(now, 1);
  const constellation = constellationTr(getMoonConstellation(now));
  const f = fmt();

  // Türkiye'de bugünün başı ve sonu; ay bugün burç değiştiriyorsa iki burç da yazılır.
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(now)
    .split("-")
    .map(Number);
  const dayStart = zonedTimeToUtc(y, m, d, 0, timeZone);
  const dayEnd = zonedTimeToUtc(y, m, d + 1, 0, timeZone);
  const startSign = getMoonSign(dayStart);
  const changes = getMoonSignIngresses(dayStart, 2).filter((i) => i.date < dayEnd);
  const today =
    changes.length === 0
      ? `Bütün gün ${startSign.name}`
      : [
          `${startSign.name} (${f.time.format(changes[0].date)} saatine kadar)`,
          ...changes.map((c, i) =>
            changes[i + 1]
              ? `${c.sign.name} (${f.time.format(changes[i + 1].date)} saatine kadar)`
              : `${c.sign.name} (${f.time.format(c.date)} saatinden itibaren)`,
          ),
        ].join(", ");

  return (
    <AnswerBox
      question="Bugün ay hangi burçta?"
      answer={`Ay şu an ${sign.name} burcunda. ${f.dateTime.format(next.date)} saatinde ${next.sign.name} burcuna geçecek.`}
      rows={[
        { label: "Bugün (Türkiye saati)", value: today },
        { label: "Derece", value: `${sign.name} burcunun ${Math.floor(sign.degree) + 1}. derecesi (30 dereceden)` },
        { label: "Element", value: `${elementOf(sign.index)} grubu` },
        { label: "Bu burca girdi", value: f.dateTime.format(since.date) },
        { label: "Burç değişimine kalan", value: countdown(next.date.getTime() - now.getTime()) },
        { label: "Gökyüzündeki takımyıldız", value: `${constellation} (IAU sınırlarına göre)` },
      ]}
      note={
        <>
          Burçlar bu sayfada <strong>geleneksel takvim</strong> olarak verilir; ayın konumu kesin hesaplanır, ama
          burcunun bir etkisi olduğuna dair bilimsel kanıt yoktur.{src.ref("nasaConstellations")}
        </>
      }
    />
  );
}

/** Ayın astrolojik burcu ile gökyüzündeki takımyıldızı yan yana. */
async function SkyVsSign() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const sign = getMoonSign(now);
  const constellation = constellationTr(getMoonConstellation(now));
  const same = constellation === sign.name;

  return (
    <section
      aria-labelledby="gokyuzu"
      className="mt-12 grid gap-4 rounded-3xl bg-[#05070d] p-6 text-white sm:grid-cols-2 sm:p-8"
    >
      <h2 id="gokyuzu" className="scroll-mt-32 text-xl font-semibold sm:col-span-2 sm:text-2xl">
        Gökyüzünde ay aslında nerede?
      </h2>
      <div className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.07] p-5">
        <p className="text-xs uppercase tracking-wider text-amber-200/80">Astrolojik burç</p>
        <p className="mt-1 text-3xl font-bold">{sign.name}</p>
        <p className="mt-1 text-sm text-zinc-300">Ekliptiğin eşit 30 derecelik dilimlerine göre</p>
      </div>
      <div className="rounded-2xl border border-sky-300/30 bg-sky-300/[0.07] p-5">
        <p className="text-xs uppercase tracking-wider text-sky-200/80">Gökyüzündeki takımyıldız</p>
        <p className="mt-1 text-3xl font-bold">{constellation}</p>
        <p className="mt-1 text-sm text-zinc-300">IAU takımyıldız sınırlarına göre</p>
      </div>
      <p className="text-sm text-zinc-300 sm:col-span-2">
        {same
          ? "Şu an ikisi aynı. Ama çoğu zaman ay, astrolojik burcundan bir önceki takımyıldızın önündedir; nedenini aşağıda anlattık."
          : "İkisinin farklı olması normaldir: Dünya'nın eksenindeki yavaş kayma yüzünden burçlar, adlarını aldıkları takımyıldızlardan yaklaşık 24 derece kaymıştır."}
      </p>
    </section>
  );
}
