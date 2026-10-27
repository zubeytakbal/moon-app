import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  getCurrentSignIngress,
  getMoonConstellation,
  getMoonPhase,
  getMoonSign,
  getMoonSignIngresses,
} from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { constellationTr, elementOf, ZODIAC_SYMBOLS } from "@/lib/zodiac";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.ayHangiBurcta;
const UPDATED = "2026-10-27";
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
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>Ay, burçlar kuşağını yaklaşık 27,3 günde dolaşır ve her burçta ortalama 2,3 gün kalır.</li>
            <li>Burç geçiş saatleri, ayın gökyüzündeki gerçek konumundan dakika hassasiyetiyle hesaplanır.</li>
            <li>
              Burçlar astrolojik bir gelenektir; bu sayfa onları <strong>geleneksel takvim</strong> olarak sunar,
              bilimsel bir etki iddia etmez.
            </li>
          </QuickFacts>
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight sm:text-3xl">
          Önümüzdeki günlerde ay hangi burçta?
        </h2>
        <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
          Ayın her burca giriş saati (Türkiye saati). Ay, bir sonraki satırdaki saate kadar o burçta kalır.
        </p>
        <Ingresses />

        <SkyVsSign />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Ayın burcu ne demek?</h2>
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

            <h2>Ay neden bu kadar sık burç değiştirir?</h2>
            <p>
              Güneş bir burçta yaklaşık bir ay kalırken ay, Dünya etrafındaki hızlı yolculuğu yüzünden burçlar kuşağını
              27,3 günde tamamlar. 360 dereceyi 12 burca bölünce ay her burçta ortalama 2,3 gün kalır. Ayın hızı
              yörüngesindeki konuma göre değiştiği için bu süre 2 ile 2,7 gün arasında değişir; yukarıdaki tabloda
              sürelerin farklı olmasının nedeni budur.
            </p>

            <h2>Burç ile takımyıldız neden farklı?</h2>
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
              derecelik burçları kullanır.
            </p>

            <h2>Bu sayfa neden &quot;geleneksel takvim&quot; olarak etiketli?</h2>
            <p>
              Ayın gökyüzündeki konumu ve burç geçiş saatleri astronomik hesaplarla, kesin olarak bulunur. Ama ayın
              burcunun insanlar, işler ya da olaylar üzerinde bir etkisi olduğuna dair bilimsel bir kanıt yoktur.
              Burçları, yüzyıllardır yaşayan bir takvim geleneği olarak sunuyoruz; yorum yapmıyoruz. Ayın gerçek
              evresini ve gökyüzündeki görünüşünü <Link href={PAGES.bugunAy.path}>Bugün Ay Nasıl?</Link> sayfasında
              bulabilirsiniz.
            </p>
          </Prose>

          <section className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <p>
              Ay konumları Astronomy Engine ile, tarihin gerçek ekinoksuna göre (tropikal burçlar) hesaplanmıştır.
              Takımyıldız sınırları Uluslararası Astronomi Birliği&apos;nin (IAU) resmî sınırlarıdır.
            </p>
            <p className="mt-2">
              Son güncelleme: <time dateTime={UPDATED}>27 Ekim 2026</time>
            </p>
          </section>
        </div>
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

/** Önümüzdeki burç geçişleri. Saatte bir yenilenir. */
async function Ingresses() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const current = getCurrentSignIngress(now);
  const list = [current, ...getMoonSignIngresses(now, 10)];
  const f = fmt();
  const nf = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 0 });

  return (
    <ol className="mt-6 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {list.slice(0, -1).map((ing, i) => {
        const end = list[i + 1].date;
        const hours = (end.getTime() - ing.date.getTime()) / HOUR_MS;
        const isNow = i === 0;
        return (
          <li
            key={ing.date.toISOString()}
            className={`flex items-center gap-4 px-4 py-3 sm:px-5 ${isNow ? "bg-violet-50 dark:bg-violet-950/30" : ""}`}
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1b1236] text-xl text-amber-200"
            >
              {ZODIAC_SYMBOLS[ing.sign.index]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {ing.sign.name}
                {isNow && (
                  <span className="ml-2 rounded bg-violet-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                    Şu an
                  </span>
                )}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <time dateTime={ing.date.toISOString()}>
                  {f.day.format(ing.date)} {f.time.format(ing.date)}
                </time>
                {" → "}
                <time dateTime={end.toISOString()}>
                  {f.day.format(end)} {f.time.format(end)}
                </time>
              </p>
            </div>
            <span className="shrink-0 text-sm tabular-nums text-zinc-500">{nf.format(hours)} saat</span>
          </li>
        );
      })}
    </ol>
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
      <h2 id="gokyuzu" className="text-xl font-semibold sm:col-span-2 sm:text-2xl">
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
