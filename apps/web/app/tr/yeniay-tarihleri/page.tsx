import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  findProvince,
  getLocalSolarEclipse,
  getUpcomingPrincipalPhases,
  getUpcomingSolarEclipses,
  localDateParts,
  type PrincipalPhase,
  type SolarEclipse,
} from "@moon-app/moon";
import { ArticleFooter, NextPrincipal, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { CalendarSubscribe } from "@/components/CalendarSubscribe";

const PAGE = PAGES.yeniayTarihleri;
const YEARS = [2026, 2027];
const UPDATED = "2026-10-27";
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;
/** Tutulma görünürlüğünün gösterileceği iller: batıdan doğuya, kuzeyden güneye dağılmış. */
const ECLIPSE_CITIES = ["izmir", "antalya", "edirne", "istanbul", "ankara", "hatay", "trabzon", "van"];

export const metadata: Metadata = {
  title: `2026-2027 Yeni Ay Tarihleri ve Güneş Tutulmaları | ${siteConfig.name}`,
  description:
    "2026 ve 2027 yeni ay tarihleri saatleriyle (Türkiye saati). Bu yılların güneş tutulmaları ve 2 Ağustos 2027 güneş tutulmasının İstanbul, İzmir, Ankara, Antalya ve diğer illerden ne kadar görüleceği.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

const KIND_TR = { partial: "Parçalı", annular: "Halkalı", total: "Tam" } as const;

/** Tutulmanın Dünya'da nereden görüleceği: hesapla bulunmayan, kaynaklardan derlenmiş kısa açıklama. */
const ECLIPSE_REGIONS: Record<string, string> = {
  "2026-02-17": "Antarktika; çevresindeki okyanuslardan ve Güney Afrika'nın güneyinden parçalı olarak",
  "2026-08-12": "Grönland, İzlanda ve İspanya; Avrupa'nın büyük kısmından parçalı olarak",
  "2027-02-06": "Şili ve Arjantin'den başlayıp Atlantik'i geçerek Batı Afrika'ya uzanan bir şerit",
  "2027-08-02": "Güney İspanya, Fas, Cezayir, Tunus, Libya, Mısır, Suudi Arabistan ve Yemen",
};

export default function NewMoons20262027Page() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={0}
        eyebrow="Takvim"
        lead="2026 ve 2027'nin bütün yeni ayları, saatleriyle. Güneş tutulmaları yalnızca yeni ayda olur; bu iki yılın tutulmalarını ve Türkiye'den görünüşlerini de burada bulabilirsiniz."
        aside={<NextPrincipal phase="new-moon" />}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>2027&apos;de 13 yeni ay var. Ağustos ayına iki yeni ay düşüyor: 2 ve 31 Ağustos.</li>
            <li>2 Ağustos 2027&apos;deki tam güneş tutulması Türkiye&apos;den parçalı olarak görülecek.</li>
            <li>Bu tutulmada Güneş&apos;in en çok örtüleceği yerler Ege ve Akdeniz kıyılarıdır.</li>
          </QuickFacts>
        </div>

        <EclipseTurkey />

        {YEARS.map((year) => (
          <section key={year} className="mt-14" aria-labelledby={`yil-${year}`}>
            <h2 id={`yil-${year}`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {year} yeni ayları
            </h2>
            <NewMoonTable year={year} />
          </section>
        ))}

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Güneş tutulması neden yeni ayda olur?</h2>
            <p>
              Güneş tutulması, ayın Dünya ile Güneş arasına girip Güneş&apos;i örtmesidir. Ay ancak{" "}
              <Link href={PAGES.yeniAy.path}>yeni ayda</Link> bu iki gök cisminin arasındadır. Ama ayın yörüngesi
              yaklaşık 5 derece eğik olduğu için çoğu yeni ayda ay, Güneş&apos;in biraz üstünden ya da altından geçer.
              Tutulma yalnızca yılda iki ile beş kez, yeni ay iki yörüngenin kesişme noktasına yakın bir zamana denk
              geldiğinde yaşanır.
            </p>
            <ul>
              <li>
                <strong>Tam tutulmada</strong> ay Güneş&apos;i tamamen örter, gündüz birkaç dakikalığına gece olur.
              </li>
              <li>
                <strong>Halkalı tutulmada</strong> ay, Dünya&apos;dan uzak olduğu için Güneş&apos;i tamamen örtemez.
                Ortada kara bir disk, çevresinde parlak bir halka kalır.
              </li>
              <li>
                <strong>Parçalı tutulmada</strong> Güneş&apos;in yalnızca bir kısmı örtülür. Tam ya da halkalı
                tutulmanın geçtiği bölgenin çevresindeki geniş bir alandan tutulma bu şekilde görülür.
              </li>
            </ul>

            <h2>2 Ağustos 2027: Türkiye&apos;den nasıl görülecek?</h2>
            <p>
              Bu tutulma, 21. yüzyılda karadan izlenebilecek en uzun tam güneş tutulmalarından biridir. Tam tutulma
              şeridi Cebelitarık Boğazı&apos;ndan başlayıp Kuzey Afrika&apos;yı boydan boya geçer; en uzun süre
              Mısır&apos;da, Luksor çevresinde yaşanır ve orada 6 dakikayı aşar.
            </p>
            <p>
              Türkiye bu şeridin kuzeyinde kaldığı için tutulmayı <strong>parçalı</strong> olarak görecek. Yukarıdaki
              tabloya göre Güneş&apos;in İzmir ve Antalya&apos;da yaklaşık %70&apos;i, İstanbul ve Ankara&apos;da
              yarıdan fazlası, Van ve Trabzon&apos;da ise yaklaşık %40&apos;ı örtülecek. Tutulma öğle saatlerinde, Güneş
              gökyüzünde yüksekteyken yaşanacağı için gözlem koşulları çok iyidir.
            </p>
            <h3>Güneş&apos;e asla korumasız bakmayın</h3>
            <p>
              Güneş&apos;in %70&apos;i örtülse bile kalan kısım gözlere kalıcı zarar verecek kadar parlaktır. Tutulmayı
              yalnızca ISO 12312-2 standardına uygun tutulma gözlükleriyle izleyin. Güneş gözlüğü, film negatifi ya da
              isli cam güvenli değildir. Dürbün ve teleskopla, önüne uygun güneş filtresi takılmadan asla bakmayın.
              Güvenli ve kolay bir yol da iğne deliği yöntemidir: kartondaki küçük bir delikten geçen ışık, yere
              Güneş&apos;in hilal biçimindeki görüntüsünü düşürür.
            </p>

            <h2>Kara ay nedir?</h2>
            <p>
              Bir takvim ayına iki dolunay sığdığında ikincisine mavi ay dendiği gibi, iki yeni ay sığdığında ikincisine
              de <strong>kara ay</strong> denir. 2027&apos;de bu durum ağustosta yaşanır: 2 Ağustos&apos;taki yeni ayı,
              31 Ağustos&apos;ta bir yenisi izler. Kara ay gökyüzünde hiçbir şekilde görülmez; yalnızca bir takvim
              tuhaflığıdır.
            </p>

            <h2>Yeni ay ve Hicri aylar</h2>
            <p>
              Tablodaki tarihler astronomik yeni aydır. Hicri aylar ise yeni aydan sonra ilk{" "}
              <Link href={PAGES.hilal.path}>hilalin</Link> görülebildiği akşam başlar; bu çoğu zaman bir iki gün
              sonradır. Ramazan ve bayram gibi dinî günler için Diyanet&apos;in takvimine bakmak gerekir.
            </p>
            <p>
              Yeni ay haftaları, ay ışığı olmadığı için yıldız ve Samanyolu gözlemi için de en iyi zamandır. Ayın
              bugünkü durumu için <Link href={PAGES.bugunAy.path}>Bugün Ay Nasıl?</Link>, aylık görünüm için{" "}
              <Link href={PAGES.ayTakvimi.path}>Ay Takvimi</Link> sayfasına bakabilirsiniz.
            </p>
          </Prose>
          <CalendarSubscribe />
          <ArticleFooter
            page={PAGE}
            headline="2026-2027 Yeni Ay Tarihleri ve Güneş Tutulmaları"
            updated={UPDATED}
            sources={[
              { label: "NASA Science, Eclipses", href: "https://science.nasa.gov/eclipses/" },
              { label: "NASA Science, Eclipse Safety", href: "https://science.nasa.gov/eclipses/safety/" },
            ]}
          />
        </div>
      </main>
    </>
  );
}

function newMoonsOfYear(year: number): PrincipalPhase[] {
  return getUpcomingPrincipalPhases(new Date(Date.UTC(year, 0, 1) - 2 * DAY_MS), 60).filter(
    (p) => p.key === "new-moon" && localDateParts(p.date, timeZone).year === year,
  );
}

/** Bir yılın yeni ayları; tutulma ve kara ay notlarıyla. Saatte bir yenilenir. */
async function NewMoonTable({ year }: { year: number }) {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const moons = newMoonsOfYear(year);
  const eclipses = getUpcomingSolarEclipses(new Date(Date.UTC(year, 0, 1) - 2 * DAY_MS), 4);
  const istanbul = siteConfig.defaultLocation;
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" });
  const weekday = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, weekday: "long" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  // Önceki yılın yeni ayları henüz bitmediyse "sıradaki" vurgusu o yılın tablosunda gösterilir.
  const previousYearPending = newMoonsOfYear(year - 1).some((m) => m.date > now);
  const nextIndex = previousYearPending ? -1 : moons.findIndex((m) => m.date > now);

  const notesFor = (m: PrincipalPhase, i: number) => {
    const notes: string[] = [];
    const eclipse = eclipses.find((e) => Math.abs(e.peak.getTime() - m.date.getTime()) < DAY_MS);
    if (eclipse) {
      const local = getLocalSolarEclipse(new Date(eclipse.peak.getTime() - DAY_MS), istanbul);
      const visible = Math.abs(local.peak.getTime() - eclipse.peak.getTime()) < DAY_MS;
      notes.push(
        `${KIND_TR[eclipse.kind]} güneş tutulması` +
          (visible ? `, İstanbul'dan parçalı (%${Math.round(local.obscuration * 100)})` : ", Türkiye'den görülmez"),
      );
    }
    if (i > 0 && localDateParts(moons[i - 1].date, timeZone).month === localDateParts(m.date, timeZone).month) {
      notes.push("Kara ay (ayın ikinci yeni ayı)");
    }
    return notes;
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-left">
        <thead className="bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950">
          <tr>
            <th className="px-4 py-3 font-medium sm:px-5">Tarih</th>
            <th className="px-4 py-3 font-medium sm:px-5">Saat</th>
            <th className="hidden px-5 py-3 font-medium sm:table-cell">Not</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {moons.map((m, i) => {
            const notes = notesFor(m, i);
            const past = m.date < now;
            return (
              <tr
                key={m.date.toISOString()}
                className={
                  i === nextIndex ? "bg-indigo-50/70 dark:bg-indigo-950/30" : past ? "text-zinc-400" : undefined
                }
              >
                <td className="px-4 py-3 sm:px-5">
                  <time dateTime={m.date.toISOString()} className="font-medium">
                    {date.format(m.date)}
                  </time>{" "}
                  <span className="text-sm text-zinc-500">{weekday.format(m.date)}</span>
                  {i === nextIndex && (
                    <span className="ml-2 rounded bg-indigo-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                      Sıradaki
                    </span>
                  )}
                  {notes.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-sm text-indigo-700 sm:hidden dark:text-indigo-300">
                      {notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-4 py-3 align-top tabular-nums sm:px-5">{time.format(m.date)}</td>
                <td className="hidden px-5 py-3 align-top text-sm text-indigo-700 sm:table-cell dark:text-indigo-300">
                  {notes.join(" · ")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** 2026-2027 güneş tutulmaları ve 2 Ağustos 2027 tutulmasının illere göre görünüşü. Haftada bir yenilenir. */
async function EclipseTurkey() {
  "use cache";
  cacheLife("weeks");

  const eclipses: SolarEclipse[] = getUpcomingSolarEclipses(new Date(Date.UTC(2026, 0, 1)), 4);
  const aug2027 = eclipses.find((e) => e.peak.toISOString().startsWith("2027-08-02"))!;
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

  const cities = ECLIPSE_CITIES.map((slug) => findProvince(slug)!)
    .map((city) => ({ city, local: getLocalSolarEclipse(new Date(aug2027.peak.getTime() - DAY_MS), city) }))
    .sort((a, b) => b.local.obscuration - a.local.obscuration);

  return (
    <>
      <section className="mt-14" aria-labelledby="tutulmalar">
        <h2 id="tutulmalar" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          2026-2027 güneş tutulmaları
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {eclipses.map((e) => {
            const key = e.peak.toISOString().slice(0, 10);
            return (
              <li key={key} className="flex gap-4 rounded-2xl bg-[#05070d] p-4 text-white">
                <span className="shrink-0">
                  <EclipseIcon kind={e.kind} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                    {KIND_TR[e.kind]} güneş tutulması
                  </p>
                  <p className="mt-0.5 text-lg font-semibold">{date.format(e.peak)}</p>
                  <p className="text-sm text-zinc-300">{ECLIPSE_REGIONS[key] ?? ""}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="turkiye-tutulma">
        <h2 id="turkiye-tutulma" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          2 Ağustos 2027 tutulması illere göre
        </h2>
        <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
          Güneş&apos;in en derin anda ne kadarının örtüleceği ve tutulmanın başlangıç, en derin an ve bitiş saatleri
          (Türkiye saati).
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cities.map(({ city, local }) => {
            const pct = Math.round(local.obscuration * 100);
            return (
              <li
                key={city.slug}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-lg font-semibold">{city.name}</p>
                  <p className="text-2xl font-light tabular-nums">%{pct}</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                  {time.format(local.begin)} başlar · {time.format(local.peak)} en derin · {time.format(local.end)}{" "}
                  biter
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

/** Tutulma türünü gösteren küçük çizim: Güneş ve önündeki ay. */
function EclipseIcon({ kind }: { kind: SolarEclipse["kind"] }) {
  const moonR = kind === "annular" ? 15 : 18;
  const offset = kind === "partial" ? 9 : 0;
  return (
    <svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="17"
        fill={kind === "total" ? "#fde68a" : "#fbbf24"}
        opacity={kind === "total" ? 0.35 : 1}
      />
      {kind === "total" && (
        <circle cx="24" cy="24" r="21" fill="none" stroke="#fde68a" strokeOpacity="0.4" strokeWidth="3" />
      )}
      <circle cx={24 + offset} cy={24 - offset / 2} r={moonR} fill="#05070d" />
    </svg>
  );
}
