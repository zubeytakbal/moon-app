import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  getFullMoonsOfYear,
  getMoonAltitude,
  getMoonDistanceKm,
  getMoonRiseSet,
  getUpcomingLunarEclipses,
  type LunarEclipse,
  type PrincipalPhase,
} from "@moon-app/moon";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter, NextPrincipal, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { AnswerBox } from "@/components/InfoTables";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { nameFullMoons } from "@/lib/full-moon-names";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { siteConfig } from "@/site.config";
import { CalendarSubscribe } from "@/components/CalendarSubscribe";

const PAGE = PAGES.dolunayTarihleri;
const YEAR = 2027;
const UPDATED = "2026-11-01";
const src = pageSources("nasaLunarCatalog", "nasaSupermoons", "nolleSupermoon");
const location = siteConfig.defaultLocation;
const timeZone = location.timeZone;
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `2027 Dolunay Tarihleri ve Saatleri (Türkiye) | ${siteConfig.name}`,
  description:
    "2027 yılının 12 dolunayı tarih ve saatleriyle (Türkiye saati). Süper ay ve mikro ay, 2027 ay tutulmaları, Hasat Ayı ve dolunayların geleneksel adları, İstanbul'da ayın doğuş saatleri.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function FullMoons2027Page() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={180}
        eyebrow="Takvim"
        lead="2027'de 12 dolunay var. Her birinin tarihi, saati, Dünya'ya uzaklığı ve o yıla özgü notları bu sayfada."
        aside={<NextPrincipal phase="full-moon" />}
        updated={UPDATED}
      />
      <QuickLinks
        links={[
          { href: "#cevap", label: `${YEAR} dolunayları` },
          { href: "#liste", label: "Ayrıntılı liste" },
          { href: "#en-buyuk", label: "En büyük ve en küçük" },
          { href: "#tutulmalar", label: "Ay tutulmaları" },
          { href: "#hasat", label: "Hasat Ayı" },
          { href: "#mavi-ay", label: "Mavi ay var mı?" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <YearAnswer />
        </div>

        <RemainingThisYear />

        <h2 id="liste" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">2027 dolunayları</h2>
        <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
          Saat, ayın Güneş&apos;in tam karşısına geldiği andır. Doğuş, ayın o gün İstanbul&apos;da ufuktan yükseldiği
          saattir. Bütün saatler Türkiye saatidir.
        </p>
        <FullMoonTable year={YEAR} />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2 id="en-buyuk">Yılın en büyük ve en küçük dolunayı</h2>
            <p>
              Ayın Dünya etrafındaki yörüngesi tam bir daire değildir; ay her ay bir kez Dünya&apos;ya en çok yaklaşır,
              bir kez de en çok uzaklaşır.{src.ref("nasaSupermoons")} Dolunay yörüngenin yakın noktasına denk geldiğinde ay biraz daha büyük ve
              parlak görünür.
            </p>
            <p>
              2027&apos;de en yakın dolunay <strong>22 Ocak</strong>&apos;ta, Dünya&apos;ya yaklaşık 357.600 km
              uzaklıkta gerçekleşir. En uzak dolunay ise <strong>18 Temmuz</strong>&apos;da, yaklaşık 406.000 km
              uzaklıktadır. İki ayın görünen çapı arasında yaklaşık %13,5, aydınlattığı alan arasında ise yaklaşık %29
              fark vardır. Bu fark iki ay yan yana konunca belirgindir; ama tek başına bakınca gözle ayırt etmek zordur.
            </p>
            <p>
              &quot;Süper ay&quot; için herkesin kabul ettiği resmî bir tanım yoktur. Bu sitede, dolunay anında
              Dünya&apos;ya {new Intl.NumberFormat(siteConfig.locale).format(SUPERMOON_KM)} km&apos;den yakın olan
              dolunaylara süper ay diyoruz. Bu eşik, terimi 1979&apos;da ilk kullanan astrolog Richard Nolle&apos;un
              tanımına yakındır.{src.ref("nolleSupermoon")} Bu tanıma göre 2027&apos;de tek süper ay vardır: 22 Ocak.
            </p>

            <h2 id="tutulmalar">2027&apos;nin ay tutulmaları</h2>
            <p>
              2027&apos;de üç ay tutulması yaşanır ve üçü de <strong>yarı gölge tutulmasıdır</strong>.
              {src.ref("nasaLunarCatalog")} Bu tür tutulmada
              ay, Dünya&apos;nın gölgesinin yalnızca soluk dış kısmından geçer. Ay kararmaz ya da kızarmaz, sadece bir
              kenarı hafifçe matlaşır. Dikkatli bakmayan biri tutulmayı hiç fark etmeyebilir.
            </p>
            <p>
              Bir tutulmanın görülebilmesi için o sırada ayın ufkun üzerinde olması gerekir. Tablodaki notlar, her
              tutulmanın en derin anında ayın İstanbul&apos;dan görülüp görülmediğini gösteriyor.
            </p>

            <h2 id="hasat">Hasat Ayı ve Avcı Ayı</h2>
            <p>
              Eylül ekinoksuna en yakın dolunaya <strong>Hasat Ayı</strong> denir. 2027&apos;de ekinoks 23
              Eylül&apos;de, Hasat Ayı ise ondan bir hafta önce, 16 Eylül&apos;dedir. Bu dönemde ay birkaç akşam üst
              üste gün batımından kısa süre sonra doğar ve akşamlar uzun süre aydınlık kalır. Ondan sonraki dolunaya, 15
              Ekim&apos;e, <strong>Avcı Ayı</strong> denir.
            </p>
            <p>
              Tablodaki diğer adlar da (Kurt Ayı, Çilek Ayı, Soğuk Ay gibi) Kuzey Amerika kökenli geleneksel adların
              Türkçeleridir. Gökbilimsel bir anlamları yoktur ama dolunayları ayırt etmenin keyifli bir yoludur.
            </p>

            <h2 id="mavi-ay">2027&apos;de mavi ay var mı?</h2>
            <p>
              Hayır. Bir takvim ayına iki dolunayın sığması anlamına gelen mavi ay, 2027&apos;de yaşanmaz. Türkiye
              saatine göre bir sonraki mavi ay 31 Aralık 2028&apos;dedir. Bunu{" "}
              <Link href={`${PAGES.ayTakvimi.path}`}>Ay Takvimi</Link> sayfasında Aralık 2028&apos;e giderek
              görebilirsiniz.
            </p>

            <h2>Kış dolunayları neden daha uzun aydınlatır?</h2>
            <p>
              Aralık ve ocak dolunayları gökyüzünde çok yüksekten geçer ve uzun kış gecelerinin neredeyse tamamında
              gökyüzünde kalır. Haziran ve temmuz dolunayları ise alçakta kalır ve kısa yaz gecelerinde daha kısa süre
              görülür. Nedenini <Link href={PAGES.dolunay.path}>Dolunay</Link> sayfasında anlattık.
            </p>
          </Prose>
          <CalendarSubscribe />
          <ArticleFooter
            page={PAGE}
            headline="2027 Dolunay Tarihleri ve Saatleri"
            updated={UPDATED}
            src={src}
          />
        </div>
      </main>
    </>
  );
}

interface FullMoonRow {
  phase: PrincipalPhase;
  name: string;
  distanceKm: number;
  rise: Date | null;
  notes: string[];
}

function buildRows(fullMoons: PrincipalPhase[], eclipses: LunarEclipse[]): FullMoonRow[] {
  const names = nameFullMoons(fullMoons, timeZone);
  const distances = fullMoons.map((p) => getMoonDistanceKm(p.date));
  const farthest = Math.max(...distances);
  const closest = Math.min(...distances);

  return fullMoons.map((phase, i) => {
    const notes: string[] = [];
    if (distances[i] < SUPERMOON_KM) notes.push(distances[i] === closest ? "Süper ay, yılın en büyüğü" : "Süper ay");
    if (distances[i] === farthest) notes.push("Mikro ay, yılın en küçüğü");
    const eclipse = eclipses.find((e) => Math.abs(e.peak.getTime() - phase.date.getTime()) < DAY_MS);
    if (eclipse) {
      const kind = { penumbral: "Yarı gölge", partial: "Parçalı", total: "Tam" }[eclipse.kind];
      const visible = getMoonAltitude(eclipse.peak, location) > 0;
      notes.push(`${kind} ay tutulması, Türkiye'den ${visible ? "görülür" : "görülmez"}`);
    }
    return {
      phase,
      name: names.get(phase.date.getTime())!,
      distanceKm: distances[i],
      rise: getMoonRiseSet(phase.date, location).rise,
      notes,
    };
  });
}

/** Bir yılın dolunay tablosu. Sıradaki dolunay vurgulanır; saatte bir yenilenir. */
async function FullMoonTable({ year }: { year: number }) {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const fullMoons = getFullMoonsOfYear(year);
  const rows = buildRows(fullMoons, getUpcomingLunarEclipses(new Date(Date.UTC(year, 0, 1) - 2 * DAY_MS), 6));
  // Önceki yılın dolunayları henüz bitmediyse "sıradaki" vurgusu o listede gösterilir.
  const previousYearPending = getFullMoonsOfYear(year - 1).some((p) => p.date > now);
  const nextIndex = previousYearPending ? -1 : rows.findIndex((r) => r.phase.date > now);
  return <MoonRows rows={rows} highlight={nextIndex} />;
}

/** Bu yılın henüz gerçekleşmemiş dolunayları (yıl sonuna yaklaşırken anlamlıdır). */
async function RemainingThisYear() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const thisYear = Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(now));
  if (thisYear >= YEAR) return null;
  const all = getFullMoonsOfYear(thisYear);
  const rows = buildRows(all, getUpcomingLunarEclipses(new Date(Date.UTC(thisYear, 0, 1)), 6)).filter(
    (r) => r.phase.date > now,
  );
  if (rows.length === 0) return null;

  return (
    <section className="mt-12" aria-labelledby="kalan">
      <h2 id="kalan" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        {thisYear}&apos;nın kalan dolunayları
      </h2>
      <MoonRows rows={rows} highlight={0} />
    </section>
  );
}

function MoonRows({ rows, highlight }: { rows: FullMoonRow[]; highlight: number }) {
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" });
  const weekday = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, weekday: "long" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const km = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 0 });

  return (
    <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map((r, i) => (
        <li
          key={r.phase.date.toISOString()}
          className={`flex gap-4 rounded-2xl p-4 ${
            i === highlight ? "bg-[#0d1226] text-white ring-2 ring-indigo-400" : "bg-[#05070d] text-white"
          }`}
        >
          <span className="shrink-0">
            <MoonPhaseIcon
              phaseAngle={180}
              size={
                r.notes.some((n) => n.startsWith("Süper")) ? 72 : r.notes.some((n) => n.startsWith("Mikro")) ? 56 : 64
              }
              title={r.name}
            />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              {r.name}
              {i === highlight && <span className="ml-2 rounded bg-indigo-500 px-1.5 py-0.5 text-white">Sıradaki</span>}
            </p>
            <p className="mt-0.5 text-lg font-semibold">
              <time dateTime={r.phase.date.toISOString()}>{date.format(r.phase.date)}</time>{" "}
              <span className="font-normal text-zinc-400">{weekday.format(r.phase.date)}</span>
            </p>
            <p className="text-sm text-zinc-300">
              Saat {time.format(r.phase.date)}
              {r.rise && <> · İstanbul&apos;da doğuş {time.format(r.rise)}</>} · {km.format(r.distanceKm)} km
            </p>
            {r.notes.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {r.notes.map((n) => (
                  <li key={n} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-zinc-200">
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Sayfanın sorusunun cevabı, en üstte (timeanddate düzeni): yılın 12 dolunayı tek bakışta, adları ve saatleriyle.
 * Ayrıntılı kartlar aşağıda. Saatte bir yenilenir.
 */
async function YearAnswer() {
  "use cache";
  cacheLife("hours");

  const rows = buildRows(
    getFullMoonsOfYear(YEAR),
    getUpcomingLunarEclipses(new Date(Date.UTC(YEAR, 0, 1) - 2 * DAY_MS), 6),
  );
  const day = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", weekday: "long" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const month = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, month: "long" });
  const biggest = rows.find((r) => r.notes.some((n) => n.includes("yılın en büyüğü")));
  const smallest = rows.find((r) => r.notes.some((n) => n.includes("yılın en küçüğü")));
  const eclipseCount = rows.filter((r) => r.notes.some((n) => n.includes("ay tutulması"))).length;

  return (
    <AnswerBox
      question={`${YEAR} dolunayları ne zaman?`}
      answer={`${YEAR} yılında ${rows.length} dolunay var.${biggest ? ` En büyüğü ${day.format(biggest.phase.date)} (süper ay)` : ""}${
        smallest ? `, en küçüğü ${day.format(smallest.phase.date)} (mikro ay)` : ""
      }.${eclipseCount ? ` ${eclipseCount} dolunayda ay tutulması olur.` : ""}`}
      rows={rows.map((r) => ({
        label: `${month.format(r.phase.date)} · ${r.name}`,
        value: (
          <>
            {day.format(r.phase.date)}, {time.format(r.phase.date)}
            {r.notes.length > 0 && <span className="block text-sm text-zinc-500">{r.notes.join(" · ")}</span>}
          </>
        ),
      }))}
      note={
        <>
          Saatler Türkiye saatidir. Doğuş saatleri ve uzaklıklar için{" "}
          <a href="#liste" className="underline underline-offset-2">
            ayrıntılı listeye
          </a>{" "}
          bakın.
        </>
      }
    />
  );
}
