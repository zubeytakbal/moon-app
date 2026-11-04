import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  ABROAD_CITIES,
  findPlace,
  getMoonAltitude,
  getUpcomingLunarEclipses,
  isAbroad,
  type GeoLocation,
  type LunarEclipse,
  type Place,
} from "@moon-app/moon";
import { ABROAD_OPTIONS, BERLIN, FEATURED_ABROAD, PROVINCE_OPTIONS } from "@/lib/place-options";
import { Faq } from "@/components/Faq";
import { MobileCollapse } from "@/components/MobileCollapse";
import { FAQS } from "@/lib/faqs";
import { AddToCalendar } from "@/components/AddToCalendar";
import { CitySelect } from "@/components/CitySelect";
import { icsTime } from "@/lib/ics";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { AnswerBox } from "@/components/InfoTables";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { NasaFigure } from "@/components/NasaFigure";
import { IMAGES } from "@/lib/images";
import { LunarEclipseDiagram } from "@/components/EclipseDiagrams";
import { CalendarSubscribe } from "@/components/CalendarSubscribe";

const PAGE = PAGES.ayTutulmalari;
const UPDATED = "2026-11-04";
const ISTANBUL = siteConfig.defaultLocation;
const src = pageSources("nasaLunarCatalog", "nasaEclipseTypes", "nasaDanjon", "nasaMoonFactSheet", "nasaSaros");
const FROM = new Date(Date.UTC(2026, 0, 1));
const COUNT = 9;
const timeZone = siteConfig.defaultLocation.timeZone;
const CITY_OPTIONS = PROVINCE_OPTIONS;
/** Avrupa tablosunda gösterilen tutulma sayısı (sütun). */
const EUROPE_COLUMNS = 4;
/** Telefonda listede ilk açık duran öğe sayısı (sıradakinden başlayarak). */
const MOBILE_ITEMS = 3;
const MINUTE = 60_000;

export const metadata: Metadata = {
  title: `Ay Tutulmaları 2026-2029: Tarihleri, Saatleri ve Türkiye'den Görünüşü | ${siteConfig.name}`,
  description:
    "Bir sonraki ay tutulması ne zaman? 2026-2029 ay tutulmalarının tarihleri, evrelerinin saatleri ve Türkiye'den, Almanya, Hollanda, Fransa gibi Avrupa ülkelerinden görülüp görülmeyeceği. 31 Aralık 2028 yılbaşı gecesi tam ay tutulması.",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

const KIND_TR = { penumbral: "Yarı gölge", partial: "Parçalı", total: "Tam" } as const;

interface Phase {
  key: "penumbral" | "partial" | "total";
  start: number;
  end: number;
}

function phasesOf(e: LunarEclipse): Phase[] {
  const p = e.peak.getTime();
  const sd = e.semiDurationMinutes;
  const list: Phase[] = [{ key: "penumbral", start: p - sd.penumbral * MINUTE, end: p + sd.penumbral * MINUTE }];
  if (sd.partial > 0) list.push({ key: "partial", start: p - sd.partial * MINUTE, end: p + sd.partial * MINUTE });
  if (sd.total > 0) list.push({ key: "total", start: p - sd.total * MINUTE, end: p + sd.total * MINUTE });
  return list;
}

/**
 * Tutulmanın gözle fark edilen kısmında (gölgeye girme varsa o, yoksa yarı gölge) ayın
 * seçilen ilde ufkun üzerinde kaldığı oran.
 */
function visibility(e: LunarEclipse, location: GeoLocation): { share: number; aboveIntervals: [number, number][] } {
  const phases = phasesOf(e);
  const main = phases.find((ph) => ph.key === "partial") ?? phases[0];
  const outer = phases[0];
  const step = 2 * MINUTE;
  let up = 0;
  let total = 0;
  const intervals: [number, number][] = [];
  let open: number | null = null;
  for (let t = outer.start; t <= outer.end; t += step) {
    const above = getMoonAltitude(new Date(t), location) > 0;
    if (t >= main.start && t <= main.end) {
      total++;
      if (above) up++;
    }
    if (above && open === null) open = t;
    if (!above && open !== null) {
      intervals.push([open, t]);
      open = null;
    }
  }
  if (open !== null) intervals.push([open, outer.end]);
  return { share: total ? up / total : 0, aboveIntervals: intervals };
}

function cityOf(il: string | string[] | undefined): Place {
  return findPlace(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
}

/** Saatin hangi saat dilimiyle yazıldığı: "Türkiye saati" ya da "Almanya saati"... */
function zoneLabelOf(place: Place) {
  return isAbroad(place) ? place.zoneLabel : "Türkiye saati";
}

function verdictOf(share: number) {
  return share === 0 ? "görülmez" : share > 0.97 ? "tamamı görülür" : "bir kısmı görülür";
}

export default function LunarEclipsesPage({ searchParams }: PageProps<"/tr/ay-tutulmalari">) {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={180}
        eyebrow="Tutulmalar"
        lead="Ay tutulması, dolunayda ayın Dünya'nın gölgesine girmesidir. Güneş tutulmasının aksine çıplak gözle izlemek tamamen güvenlidir; tek şart, o sırada ayın bulunduğunuz yerde ufkun üzerinde olması."
        aside={
          <Suspense fallback={<NextEclipse slug={siteConfig.defaultLocation.slug} />}>
            <SelectedNext searchParams={searchParams} />
          </Suspense>
        }
        updated={UPDATED}
      />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Ne zaman?" },
          { href: "#tutulma-listesi", label: "Bütün tutulmalar" },
          { href: "#avrupa", label: "Avrupa'dan" },
          { href: "#nasil-olur", label: "Nasıl olur?" },
          { href: "#turler", label: "Türleri" },
          { href: "#2028", label: "31 Aralık 2028" },
          { href: "#nasil-izlenir", label: "Nasıl izlenir?" },
          { href: "#sss", label: "Sık sorulanlar" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <EclipseAnswer />
        </div>

        <Suspense fallback={<EclipseSection slug={siteConfig.defaultLocation.slug} />}>
          <SelectedSection searchParams={searchParams} />
        </Suspense>

        <EuropeTable />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2 id="nasil-olur">Ay tutulması nasıl olur?</h2>
            <p>
              Dünya, Güneş ışığını engelleyerek uzaya doğru uzun bir gölge bırakır. Bu gölgenin iki kısmı vardır: tam
              karanlık iç kısım (tam gölge) ve onu çevreleyen, Güneş&apos;in yalnızca bir kısmının örtüldüğü soluk dış
              kısım (yarı gölge). <Link href={PAGES.dolunay.path}>Dolunayda</Link> ay, Dünya&apos;nın tam arkasına
              gelir. Ay bu sırada gölgenin içinden geçerse ay tutulması olur.{src.ref("nasaEclipseTypes")}
            </p>

            <LunarEclipseDiagram />
            <p>
              Ayın yörüngesi Dünya&apos;nın yörüngesine göre yaklaşık 5 derece eğik olduğu için{src.ref("nasaMoonFactSheet")} ay çoğu dolunayda
              gölgenin biraz üstünden ya da altından geçer. Tutulma, yılda birkaç kez, dolunay iki yörüngenin kesiştiği
              noktaya yakın bir zamana denk geldiğinde yaşanır.
            </p>

            <NasaFigure images={[IMAGES.lunarEclipseSequence]} />

            <h2 id="turler">Tutulma türleri</h2>
            <ul>
              <li>
                <strong>Yarı gölge tutulması:</strong> Ay yalnızca soluk yarı gölgeden geçer. Ayın bir kenarı hafifçe
                matlaşır; dikkatli bakmayan biri fark etmeyebilir.
              </li>
              <li>
                <strong>Parçalı tutulma:</strong> Ayın bir kısmı tam gölgeye girer. O kısım belirgin şekilde kararır,
                sanki aydan bir parça ısırılmış gibi görünür.
              </li>
              <li>
                <strong>Tam tutulma:</strong> Ayın tamamı tam gölgeye girer. Ay kaybolmaz; bakır, turuncu ya da koyu
                kırmızı bir renk alır. Halk arasında &quot;kanlı ay&quot; denmesi bundandır.
              </li>
            </ul>

            <h2>Ay tutulmada neden kırmızı olur?</h2>
            <p>
              Tam tutulmada aya doğrudan Güneş ışığı ulaşmaz. Ama Dünya&apos;nın atmosferi, Güneş ışığının bir kısmını
              kırarak gölgenin içine doğru büker. Bu ışık atmosferden geçerken mavi kısmı saçılır, geriye kırmızı ve
              turuncu kalır. Yani tutulma sırasında ayı aydınlatan ışık, o anda Dünya&apos;nın çevresinde yaşanan bütün
              gün doğumları ve gün batımlarının ışığıdır. Atmosferde toz ya da yanardağ külü fazlaysa ay çok daha koyu
              görünür.{src.ref("nasaDanjon")}
            </p>

            <h2 id="2028">31 Aralık 2028: yılbaşında tam ay tutulması</h2>
            <p>
              Önümüzdeki yıllarda Türkiye&apos;den izlenebilecek en güzel ay tutulması, 2028&apos;in son gecesindedir.
              Ay akşam saatlerinde doğu ufkundan yükselirken tutulma başlar. Saat 19:15 civarında ayın tamamı gölgeye
              girer, yaklaşık 19:51&apos;de tutulma en derin noktasına ulaşır ve kırmızı ay bir saati aşkın süre
              gökyüzünde kalır.{src.ref("nasaLunarCatalog")} Bu dolunay aynı zamanda o ayın ikinci dolunayıdır, yani bir{" "}
              <Link href={PAGES.ayTakvimi.path}>mavi aydır</Link>.
            </p>

            <h2 id="nasil-izlenir">Ay tutulması nasıl izlenir?</h2>
            <ul>
              <li>
                <strong>Gözlük gerekmez.</strong> Ay tutulmasını çıplak gözle, dürbünle ya da teleskopla gönül
                rahatlığıyla izleyebilirsiniz.
              </li>
              <li>
                <strong>Doğu ve güneydoğu ufkunu açık bir yer seçin.</strong> Akşam tutulmalarında ay ufka yakın olur;
                binalar ve tepeler görüşü kapatabilir.
              </li>
              <li>
                <strong>Dürbün büyük fark yaratır.</strong> Tam tutulmada ayın rengindeki tonlar ve gölgenin kenarı
                dürbünle çok daha güzel görünür.
              </li>
              <li>
                <strong>Fotoğraf için tripod kullanın.</strong> Tutulan ay çok karanlıktır; uzun pozlama gerekir.
                Telefonla çekecekseniz gece modunu deneyin ve telefonu sabit bir yere dayayın.
              </li>
            </ul>

            <h2>18 yılda bir tekrar eden düzen</h2>
            <p>
              Tutulmalar rastgele değildir. Yaklaşık 18 yıl 11 günde bir, Güneş, Dünya ve ay hemen hemen aynı düzene
              geri döner ve benzer bir tutulma yaşanır. Babil gökbilimcilerinden beri bilinen bu döngüye Saros döngüsü
              denir.{src.ref("nasaSaros")} Örneğin 31 Aralık 2028 tutulmasının bir benzeri, 18 yıl sonra, 2047 yılının ocak ayında yaşanacak.
            </p>
          </Prose>
          <CalendarSubscribe />
          <Faq items={FAQS.ayTutulmalari} />
          <ArticleFooter
            page={PAGE}
            headline="Ay Tutulmaları 2026-2029: Tarihleri, Saatleri ve Türkiye'den Görünüşü"
            updated={UPDATED}
            src={src}
          />
        </div>
      </main>
    </>
  );
}

async function SelectedNext({ searchParams }: Pick<PageProps<"/tr/ay-tutulmalari">, "searchParams">) {
  const { il } = await searchParams;
  return <NextEclipse slug={cityOf(il).slug} />;
}

/** Seçilen ilden görülebilen bir sonraki ay tutulması. Saatte bir yenilenir. */
async function NextEclipse({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = cityOf(slug);
  const now = new Date();
  const eclipses = getUpcomingLunarEclipses(now, 8);
  const next = eclipses.find((e) => visibility(e, city).share > 0);
  if (!next) return null;
  const share = visibility(next, city).share;
  const main = phasesOf(next).find((ph) => ph.key === "partial") ?? phasesOf(next)[0];
  const tz = city.timeZone;
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: tz, day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" });
  const days = Math.ceil((next.peak.getTime() - now.getTime()) / 86_400_000);
  const zone = zoneLabelOf(city);

  return (
    <div className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-zinc-400">Görülecek bir sonraki tutulma ({city.name})</p>
      <p className="mt-1 text-2xl font-semibold">{date.format(next.peak)}</p>
      <p className="mt-0.5 text-zinc-300">
        {KIND_TR[next.kind]} ay tutulması · en derin an {time.format(next.peak)}
        {isAbroad(city) && ` (${zone})`}
      </p>
      <p className="mt-0.5 text-sm text-zinc-400">
        Görünürlük ({city.name}): {verdictOf(share)}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-200">
          {days} gün sonra
        </span>
        <a href="#il-sec" className="text-sm text-zinc-300 underline hover:text-white">
          İl ya da şehir seçin
        </a>
      </div>
      <div className="mt-4">
        <AddToCalendar
          fileName={`ay-tutulmasi-${next.peak.toISOString().slice(0, 10)}.ics`}
          event={{
            uid: `ay-tutulmasi-${next.peak.toISOString().slice(0, 10)}-${city.slug}`,
            summary: `${KIND_TR[next.kind]} ay tutulması`,
            description: `En derin an ${time.format(next.peak)} (${zone}). Görünürlük (${city.name}): ${verdictOf(share)}. Çıplak gözle izlemek güvenlidir.`,
            url: new URL(PAGE.path, siteConfig.url).toString(),
            start: icsTime(new Date(main.start)),
            end: icsTime(new Date(main.end)),
          }}
        />
      </div>
    </div>
  );
}

async function SelectedSection({ searchParams }: Pick<PageProps<"/tr/ay-tutulmalari">, "searchParams">) {
  const { il } = await searchParams;
  return <EclipseSection slug={cityOf(il).slug} />;
}

/** Liste başlığı, il seçici, lejant ve liste: görünürlük seçilen ile göre. */
function EclipseSection({ slug }: { slug: string }) {
  const city = cityOf(slug);
  return (
    <section aria-labelledby="tutulma-listesi" className="mt-12">
      <div id="il-sec" className="flex scroll-mt-32 flex-wrap items-end justify-between gap-3">
        <h2 id="tutulma-listesi" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
          2026-2029 ay tutulmaları
        </h2>
        <CitySelect action={PAGE.path} options={CITY_OPTIONS} abroad={ABROAD_OPTIONS} selected={city.slug} />
      </div>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Saatler {zoneLabelOf(city)}dir. Görünürlük, seçtiğiniz il ya da şehir için hesaplanır; çizelgedeki taralı kısım, ayın orada
        ufkun altında olduğu, yani tutulmanın görülemediği zamandır. Doğudaki illerde ay biraz daha erken doğar ve
        erken batar; ay doğarken ya da batarken yaşanan tutulmalarda iller arasındaki fark bu yüzden büyüktür.
      </p>
        <ul
          className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400"
          aria-label="Çizelge açıklaması"
        >
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full bg-zinc-500/50" aria-hidden="true" /> Yarı gölge
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full bg-zinc-300 ring-1 ring-zinc-400" aria-hidden="true" /> Gölgede
            (parçalı)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full bg-red-700" aria-hidden="true" /> Tamamen gölgede
          </li>
          <li className="flex items-center gap-2">
            <span
              className="h-3 w-6 rounded bg-[#05070d] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.25)_0_3px,transparent_3px_6px)]"
              aria-hidden="true"
            />{" "}
            Ay ufkun altında ({city.name})
          </li>
        </ul>
      <EclipseList slug={city.slug} />
    </section>
  );
}

async function EclipseList({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = cityOf(slug);

  const now = new Date();
  const eclipses = getUpcomingLunarEclipses(FROM, COUNT);
  const date = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: city.timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: city.timeZone, hour: "2-digit", minute: "2-digit" });
  const nextIndex = Math.max(0, eclipses.findIndex((e) => e.peak > now));
  // Telefonda yalnız sıradaki ve sonraki birkaç tutulma açık; geçmiştekiler ve gerisi "+ daha göster" arkasında.
  const shown = (i: number) => i >= nextIndex && i < nextIndex + MOBILE_ITEMS;
  const shownCount = eclipses.filter((_, i) => shown(i)).length;

  return (
    <MobileCollapse hiddenCount={eclipses.length - shownCount} noun="tutulma" variant="cards" className="mt-6">
    <ol className="space-y-4">
      {eclipses.map((e, i) => {
        const phases = phasesOf(e);
        const outer = phases[0];
        const span = outer.end - outer.start;
        const pos = (t: number) => ((t - outer.start) / span) * 100;
        const { share, aboveIntervals } = visibility(e, city);
        const verdict = `Görünürlük (${city.name}): ${verdictOf(share)}`;
        const past = e.peak < now;
        const color = { penumbral: "bg-zinc-500/50", partial: "bg-zinc-300", total: "bg-red-700" };

        return (
          <li
            key={e.peak.toISOString()}
            data-extra={!shown(i) || undefined}
            className={`rounded-2xl bg-[#05070d] p-5 text-white ${i === nextIndex ? "ring-2 ring-indigo-400" : ""} ${
              past ? "opacity-60" : ""
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  {KIND_TR[e.kind]} ay tutulması
                  {i === nextIndex && (
                    <span className="ml-2 rounded bg-indigo-500 px-1.5 py-0.5 text-white">Sıradaki</span>
                  )}
                  {past && <span className="ml-2 text-zinc-400">Geçti</span>}
                </p>
                <p className="mt-0.5 text-xl font-semibold">{date.format(e.peak)}</p>
              </div>
              <p
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  share === 0 ? "bg-white/10 text-zinc-300" : "bg-emerald-500/20 text-emerald-200"
                }`}
              >
                {verdict}
              </p>
            </div>

            {/* Zaman çizelgesi: evreler ve ayın ufkun üzerinde olduğu aralıklar */}
            <div className="relative mt-5 h-8 overflow-hidden rounded-lg bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0_6px,transparent_6px_12px)]">
              {aboveIntervals.map(([a, b]) => (
                <div
                  key={a}
                  className="absolute inset-y-0 bg-[#141a2e]"
                  style={{ left: `${pos(a)}%`, width: `${pos(b) - pos(a)}%` }}
                />
              ))}
              {phases.map((ph) => (
                <div
                  key={ph.key}
                  className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-full ${color[ph.key]}`}
                  style={{ left: `${pos(ph.start)}%`, width: `${pos(ph.end) - pos(ph.start)}%` }}
                />
              ))}
              <div className="absolute inset-y-0 w-px bg-white" style={{ left: "50%" }} />
            </div>
            <div className="mt-1 flex justify-between text-xs tabular-nums text-zinc-400">
              <span>{time.format(new Date(outer.start))}</span>
              <span>En derin {time.format(e.peak)}</span>
              <span>{time.format(new Date(outer.end))}</span>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
              {phases.map((ph) => (
                <div key={ph.key} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${color[ph.key]}`} aria-hidden="true" />
                  <dt className="text-zinc-400">
                    {{ penumbral: "Yarı gölge", partial: "Gölgede", total: "Tamamen gölgede" }[ph.key]}:
                  </dt>
                  <dd className="tabular-nums">
                    {time.format(new Date(ph.start))}-{time.format(new Date(ph.end))}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        );
      })}
    </ol>
    </MobileCollapse>
  );
}

/**
 * Önümüzdeki ay tutulmalarının Avrupa'daki büyük şehirlerden görünüşü, her şehrin kendi saatiyle.
 * Seçiciden bağımsız, sayfada her zaman durur ("ay tutulması almanyada saat kaçta" aramalarının cevabı).
 * Sütunlar: tablodaki şehirlerin en az birinden görülen ve çok kısa olmayan sıradaki tutulmalar. Günde bir yenilenir.
 */
async function EuropeTable() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const columns = getUpcomingLunarEclipses(now, 10)
    .filter((e) => e.semiDurationMinutes.penumbral > 30 && FEATURED_ABROAD.some((c) => visibility(e, c).share > 0))
    .slice(0, EUROPE_COLUMNS);
  // Başlıktaki tarih Almanya'ya göre; yerel tarihi farklı düşen şehirde hücreye o şehrin tarihi de yazılır.
  const short = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: BERLIN.timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const dayMonthIn = (tz: string, d: Date) =>
    new Intl.DateTimeFormat(siteConfig.locale, { timeZone: tz, day: "numeric", month: "short" }).format(d);
  const verdictShort = (share: number) => (share === 0 ? "görülmez" : share > 0.97 ? "tamamı" : "bir kısmı");
  // Elle yazılan notta kullanılan değerler hesaptan gelir (tarihler kayınca not da doğru kalır).
  const total = columns.find((e) => e.kind === "total");
  const berlinTime = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: BERLIN.timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });
  const totalPhase = total && phasesOf(total).find((ph) => ph.key === "total");
  const partlyMissed = total ? FEATURED_ABROAD.some((c) => visibility(total, c).share <= 0.97) : false;
  // "Ay doğarken başlar, kızıl evre her yerden görülür" cümlesi yalnız gerçekten öyleyse yazılır.
  const moonRising =
    total && getMoonAltitude(new Date(total.peak.getTime() + 30 * MINUTE), BERLIN) > getMoonAltitude(total.peak, BERLIN);
  const totalityEverywhere =
    totalPhase &&
    FEATURED_ABROAD.every(
      (c) => getMoonAltitude(new Date(totalPhase.start), c) > 0 && getMoonAltitude(new Date(totalPhase.end), c) > 0,
    );

  return (
    <section className="mt-14" aria-labelledby="avrupa">
      <h2 id="avrupa" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Ay tutulması Avrupa&apos;dan saat kaçta görülecek?
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Almanya, Hollanda, Belçika, Fransa, Avusturya, İsviçre, İngiltere, Bulgaristan, KKTC ve Azerbaycan&apos;ın büyük
        şehirlerinde önümüzdeki ay tutulmalarının en derin anı (her şehrin kendi yerel saatiyle) ve tutulmanın ne
        kadarının görüleceği. Bu ülkelerdeki {ABROAD_CITIES.length} şehrin tamamı için yukarıdaki seçiciyi
        kullanabilirsiniz.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5 font-medium">Şehir</th>
              {columns.map((e) => (
                <th key={e.peak.toISOString()} className="px-4 py-2.5 font-medium">
                  <span className="block text-zinc-700 dark:text-zinc-300">{short.format(e.peak)}</span>
                  <span className="text-xs font-normal">{KIND_TR[e.kind]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {FEATURED_ABROAD.map((c) => {
              const time = new Intl.DateTimeFormat(siteConfig.locale, {
                timeZone: c.timeZone,
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <tr key={c.slug}>
                  <td className="px-4 py-2">
                    <Link
                      href={`${PAGE.path}?il=${c.slug}`}
                      rel="nofollow"
                      scroll={false}
                      className="font-medium hover:underline"
                    >
                      {c.name}
                    </Link>
                    <span className="ml-1.5 text-zinc-500">{c.country}</span>
                  </td>
                  {columns.map((e) => {
                    const share = visibility(e, c).share;
                    const localDay = dayMonthIn(c.timeZone, e.peak);
                    return (
                      <td key={e.peak.toISOString()} className="px-4 py-2">
                        {localDay !== dayMonthIn(BERLIN.timeZone, e.peak) && (
                          <span className="mr-1 text-xs text-zinc-500">{localDay}</span>
                        )}
                        <span className={`tabular-nums ${share === 0 ? "text-zinc-400" : ""}`}>
                          {time.format(e.peak)}
                        </span>
                        <span className={`ml-1.5 text-xs ${share === 0 ? "text-zinc-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                          {verdictShort(share)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-zinc-500">
        Saat, tutulmanın en derin anıdır. Başlıktaki tarihler Almanya&apos;ya göredir; yerel tarihi farklı düşen
        şehirlerde tarih saatin önüne yazıldı. &quot;Bir kısmı&quot;: ay tutulma sürerken doğar ya da batar.
        &quot;Görülmez&quot;: tutulma sırasında ay o şehirde ufkun altındadır.
      </p>
      <div className="mx-auto max-w-3xl">
        <Prose>
          <p>
            Güneş tutulmasının aksine ay tutulması her yerde aynı anda yaşanır: ay o an Dünya&apos;nın gölgesine girer ve
            ayı gören herkes aynı manzarayı izler. Şehirden şehre değişen iki şey vardır: saatin yerel olarak kaç
            gösterdiği ve ayın o sırada ufkun üzerinde olup olmadığı. Almanya saati Türkiye saatinin kışın 2, yazın 1
            saat gerisinde olduğu için aynı tutulma Almanya&apos;da saat olarak daha erken yazılır.
          </p>
          {total && totalPhase && (
            <p>
              Avrupa&apos;daki Türkler için önümüzdeki en önemli tarih {short.format(total.peak)} tam tutulmasıdır. Ay
              Almanya saatiyle {berlinTime.format(new Date(totalPhase.start))} ile{" "}
              {berlinTime.format(new Date(totalPhase.end))} arasında tamamen gölgede kalır ve kızıl görünür; en derin
              an {berlinTime.format(total.peak)}.
              {partlyMissed &&
                moonRising &&
                totalityEverywhere &&
                ` Ay o akşam tutulma başladıktan sonra doğduğu için birçok şehirde tutulmanın ilk kısmı ay doğmadan geçer; tablodaki "bir kısmı" bundandır. Ayın tamamen gölgede kaldığı kızıl evre ise tablodaki bütün şehirlerden görülür. Doğu ufku açık bir yer seçin.`}
            </p>
          )}
        </Prose>
      </div>
    </section>
  );
}

/** Sayfanın sorusunun cevabı, en üstte (timeanddate düzeni). Görünürlük İstanbul'a göre; saatte bir yenilenir. */
async function EclipseAnswer() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const upcoming = getUpcomingLunarEclipses(now, 12);
  const next = upcoming[0];
  const nextVis = visibility(next, ISTANBUL);
  const firstVisible = upcoming.find((e) => visibility(e, ISTANBUL).share > 0);
  const nextTotal = upcoming.find((e) => e.kind === "total");
  const day = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const days = Math.ceil((next.peak.getTime() - now.getTime()) / 86_400_000);
  const deNext = upcoming.find((e) => visibility(e, BERLIN).share > 0);
  const deDay = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: BERLIN.timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const deTime = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: BERLIN.timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AnswerBox
      question="Bir sonraki ay tutulması ne zaman?"
      answer={`${day.format(next.peak)}: ${KIND_TR[next.kind].toLocaleLowerCase("tr-TR")} ay tutulması. Türkiye'den ${verdictOf(nextVis.share)}.${
        next.kind === "penumbral" ? " Yarı gölge tutulması gözle zor fark edilir; ay kızarmaz." : ""
      }`}
      rows={[
        { label: "En derin an (Türkiye saati)", value: time.format(next.peak) },
        { label: "Kaç gün kaldı?", value: `${days} gün` },
        ...(deNext
          ? [
              {
                label: `Almanya'dan (${BERLIN.name})`,
                value: (
                  <>
                    {deDay.format(deNext.peak)}, {KIND_TR[deNext.kind].toLocaleLowerCase("tr-TR")}; en derin an{" "}
                    {deTime.format(deNext.peak)} ({BERLIN.zoneLabel}), {verdictOf(visibility(deNext, BERLIN).share)}.{" "}
                    <a href="#avrupa" className="underline underline-offset-2">
                      Diğer Avrupa şehirleri
                    </a>
                  </>
                ),
              },
            ]
          : []),
        ...(firstVisible && firstVisible !== next
          ? [
              {
                label: "Türkiye'den görülecek ilk tutulma",
                value: `${day.format(firstVisible.peak)} (${KIND_TR[firstVisible.kind].toLocaleLowerCase("tr-TR")})`,
              },
            ]
          : []),
        ...(nextTotal
          ? [
              {
                label: "Sıradaki tam tutulma (kanlı ay)",
                value: (
                  <>
                    {day.format(nextTotal.peak)}.{" "}
                    <Link href={PAGES.kanliAy.path} className="underline underline-offset-2">
                      Kanlı Ay
                    </Link>
                  </>
                ),
              },
            ]
          : []),
        { label: "İzlemek güvenli mi?", value: "Evet. Gözlük gerekmez; çıplak gözle, dürbünle ya da teleskopla izlenir." },
      ]}
      note={
        <>
          Tarihler NASA tutulma kataloğuyla karşılaştırılmıştır.{src.ref("nasaLunarCatalog")} Görünürlük İstanbul&apos;a
          göredir; iliniz ya da yurt dışında yaşadığınız şehir için{" "}
          <a href="#tutulma-listesi" className="underline underline-offset-2">
            listeden seçin
          </a>
          .
        </>
      }
    />
  );
}
