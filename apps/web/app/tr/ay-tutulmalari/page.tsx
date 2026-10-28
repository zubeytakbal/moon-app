import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonAltitude, getUpcomingLunarEclipses, type LunarEclipse } from "@moon-app/moon";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { NasaFigure } from "@/components/NasaFigure";
import { IMAGES } from "@/lib/images";
import { LunarEclipseDiagram } from "@/components/EclipseDiagrams";

const PAGE = PAGES.ayTutulmalari;
const UPDATED = "2026-10-27";
const FROM = new Date(Date.UTC(2026, 0, 1));
const COUNT = 9;
const location = siteConfig.defaultLocation;
const timeZone = location.timeZone;
const MINUTE = 60_000;

export const metadata: Metadata = {
  title: `Ay Tutulmaları 2026-2029: Tarihleri, Saatleri ve Türkiye'den Görünüşü | ${siteConfig.name}`,
  description:
    "Bir sonraki ay tutulması ne zaman? 2026-2029 ay tutulmalarının tarihleri, evrelerinin saatleri (Türkiye saati) ve Türkiye'den görülüp görülmeyeceği. 31 Aralık 2028 yılbaşı gecesi tam ay tutulması.",
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
 * İstanbul'da ufkun üzerinde kaldığı oran.
 */
function visibility(e: LunarEclipse): { share: number; aboveIntervals: [number, number][] } {
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

export default function LunarEclipsesPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={180}
        eyebrow="Tarihler"
        lead="Ay tutulması, dolunayda ayın Dünya'nın gölgesine girmesidir. Güneş tutulmasının aksine çıplak gözle izlemek tamamen güvenlidir; tek şart, o sırada ayın bulunduğunuz yerde ufkun üzerinde olması."
        aside={<NextEclipse />}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>Ay tutulması yalnızca dolunayda olur ve ayın görüldüğü her yerden aynı anda izlenir.</li>
            <li>31 Aralık 2028 yılbaşı gecesi tam ay tutulması Türkiye&apos;den baştan sona görülecek.</li>
            <li>Ay tutulmasını çıplak gözle izlemek güvenlidir; özel gözlük gerekmez.</li>
          </QuickFacts>
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight sm:text-3xl">2026-2029 ay tutulmaları</h2>
        <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
          Saatler Türkiye saatidir. Çizelgedeki taralı kısım, ayın İstanbul&apos;da ufkun altında olduğu, yani
          tutulmanın görülemediği zamandır. Doğudaki illerde ay biraz daha erken doğar ve erken batar.
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
            Ay ufkun altında (İstanbul)
          </li>
        </ul>
        <EclipseList />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Ay tutulması nasıl olur?</h2>
            <p>
              Dünya, Güneş ışığını engelleyerek uzaya doğru uzun bir gölge bırakır. Bu gölgenin iki kısmı vardır: tam
              karanlık iç kısım (tam gölge) ve onu çevreleyen, Güneş&apos;in yalnızca bir kısmının örtüldüğü soluk dış
              kısım (yarı gölge). <Link href={PAGES.dolunay.path}>Dolunayda</Link> ay, Dünya&apos;nın tam arkasına
              gelir. Ay bu sırada gölgenin içinden geçerse ay tutulması olur.
            </p>

            <LunarEclipseDiagram />
            <p>
              Ayın yörüngesi Dünya&apos;nın yörüngesine göre yaklaşık 5 derece eğik olduğu için ay çoğu dolunayda
              gölgenin biraz üstünden ya da altından geçer. Tutulma, yılda birkaç kez, dolunay iki yörüngenin kesiştiği
              noktaya yakın bir zamana denk geldiğinde yaşanır.
            </p>

            <NasaFigure images={[IMAGES.lunarEclipseSequence]} />

            <h2>Tutulma türleri</h2>
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
              görünür.
            </p>

            <h2>31 Aralık 2028: yılbaşında tam ay tutulması</h2>
            <p>
              Önümüzdeki yıllarda Türkiye&apos;den izlenebilecek en güzel ay tutulması, 2028&apos;in son gecesindedir.
              Ay akşam saatlerinde doğu ufkundan yükselirken tutulma başlar. Saat 19:15 civarında ayın tamamı gölgeye
              girer, yaklaşık 19:51&apos;de tutulma en derin noktasına ulaşır ve kırmızı ay bir saati aşkın süre
              gökyüzünde kalır. Bu dolunay aynı zamanda o ayın ikinci dolunayıdır, yani bir{" "}
              <Link href={PAGES.ayTakvimi.path}>mavi aydır</Link>.
            </p>

            <h2>Ay tutulması nasıl izlenir?</h2>
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
              geri döner ve benzer bir tutulma yaşanır. Babilliler zamanından beri bilinen bu döngüye Saros döngüsü
              denir. Örneğin 31 Aralık 2028 tutulmasının bir benzeri, 18 yıl sonra, 2047 yılının ocak ayında yaşanacak.
            </p>
          </Prose>
          <ArticleFooter
            page={PAGE}
            headline="Ay Tutulmaları 2026-2029: Tarihleri, Saatleri ve Türkiye'den Görünüşü"
            updated={UPDATED}
            sources={[
              { label: "NASA Science, Eclipses", href: "https://science.nasa.gov/eclipses/" },
              { label: "NASA Science, Lunar Eclipses", href: "https://science.nasa.gov/eclipses/types/" },
            ]}
          />
        </div>
      </main>
    </>
  );
}

/** Bir sonraki, Türkiye'den görülebilen ay tutulması. */
async function NextEclipse() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const eclipses = getUpcomingLunarEclipses(now, 8);
  const next = eclipses.find((e) => visibility(e).share > 0);
  if (!next) return null;
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const days = Math.ceil((next.peak.getTime() - now.getTime()) / 86_400_000);

  return (
    <div className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-zinc-400">Türkiye&apos;den görülecek bir sonraki tutulma</p>
      <p className="mt-1 text-2xl font-semibold">{date.format(next.peak)}</p>
      <p className="mt-0.5 text-zinc-300">
        {KIND_TR[next.kind]} ay tutulması · en derin an {time.format(next.peak)}
      </p>
      <p className="mt-3 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-200">
        {days} gün sonra
      </p>
    </div>
  );
}

async function EclipseList() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const eclipses = getUpcomingLunarEclipses(FROM, COUNT);
  const date = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const nextIndex = eclipses.findIndex((e) => e.peak > now);

  return (
    <ol className="mt-6 space-y-4">
      {eclipses.map((e, i) => {
        const phases = phasesOf(e);
        const outer = phases[0];
        const span = outer.end - outer.start;
        const pos = (t: number) => ((t - outer.start) / span) * 100;
        const { share, aboveIntervals } = visibility(e);
        const verdict =
          share === 0
            ? "Türkiye'den görülmez"
            : share > 0.97
              ? "Türkiye'den tamamı görülür"
              : "Türkiye'den bir kısmı görülür";
        const past = e.peak < now;
        const color = { penumbral: "bg-zinc-500/50", partial: "bg-zinc-300", total: "bg-red-700" };

        return (
          <li
            key={e.peak.toISOString()}
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
  );
}
