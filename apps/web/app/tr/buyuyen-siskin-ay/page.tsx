import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonPhase, getUpcomingPrincipalPhases } from "@moon-app/moon";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter, NextPeriod, PhaseHero, PhaseNav, UpcomingPeriodTable } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.buyuyenSiskinAy;
const UPDATED = "2026-10-27";
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `Büyüyen Şişkin Ay Nedir? Dolunaydan Nasıl Ayırt Edilir? | ${siteConfig.name}`,
  description:
    "İlk dördün ile dolunay arasındaki büyüyen şişkin ay: ne zaman görülür, dolunaydan nasıl ayırt edilir, ay neden dolunaya yaklaştıkça çok daha hızlı parlaklaşır? Gün gün aydınlık oranı.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function WaxingGibbousPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={135}
        eyebrow="Ay evreleri · 4"
        lead="İlk dördünden sonra ayın yarıdan fazlası aydınlanır ama henüz tam yuvarlak değildir. Dolunaya giden son haftadır."
        aside={<NextPeriod from="first-quarter" to="full-moon" label="büyüyen şişkin ay dönemi" />}
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>Büyüyen şişkin ay, ilk dördün ile dolunay arasındaki yaklaşık bir haftalık dönemdir.</li>
          <li>Ayın %51 ile %99 arası aydınlıktır. Sol kenarı hâlâ biraz eksiktir.</li>
          <li>Öğleden sonra doğar, akşam ve gecenin büyük kısmında gökyüzündedir.</li>
        </QuickFacts>

        <Prose>
          <h2>&quot;Şişkin&quot; ne demek?</h2>
          <p>
            Ay bu evrede yarım dairenin ötesine geçmiş, ama henüz tam bir daire olmamıştır. Aydınlık kısmın sınırı dışa
            doğru bombelidir, ay sanki şişmiş gibi görünür. Adı buradan gelir. Batı dillerinde kullanılan
            &quot;gibbous&quot; kelimesi de Latincede &quot;kambur, tümsekli&quot; anlamına gelen <em>gibbus</em>
            kelimesinden türemiştir.
          </p>

          <h2>Dolunaydan nasıl ayırt edilir?</h2>
          <p>
            Dolunaydan bir iki gün önce ay çıplak gözle neredeyse yuvarlak görünür ve sık sık dolunay sanılır. Ayırt
            etmenin üç kolay yolu var:
          </p>
          <ul>
            <li>
              <strong>Sol kenara bakın.</strong> Türkiye&apos;den bakınca büyüyen şişkin ayın sol kenarı hafifçe basık
              ya da bulanıktır. Dolunayda iki kenar da aynı keskinliktedir.
            </li>
            <li>
              <strong>Doğuş saatine bakın.</strong> Dolunay gün batımıyla birlikte doğar. Büyüyen şişkin ay ise Güneş
              batmadan, öğleden sonra doğmuştur. Hava kararırken ay gökyüzünde zaten yüksekteyse dolunay değildir.
            </li>
            <li>
              <strong>Takvime bakın.</strong> Aşağıdaki tablo bu dönemde ayın her gün yüzde kaç aydınlık olduğunu
              gösteriyor.
            </li>
          </ul>
        </Prose>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Dolunaya doğru gün gün</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Bir sonraki büyüyen şişkin ay döneminde, her akşam saat 21:00&apos;de ayın aydınlık oranı:
        </p>
        <DailyIllumination />

        <Prose>
          <h2>Ay neden dolunaya yaklaştıkça hızla parlaklaşır?</h2>
          <p>
            İlk dördünde ayın yarısı aydınlıktır. Bu yüzden ayın, dolunayın yarısı kadar parlak olmasını bekleriz.
            Gerçekte ilk dördündeki ay, dolunayın <strong>yalnızca onda biri</strong> kadar parlaktır.
          </p>
          <p>
            Bunun nedeni ayın yüzeyindeki toz ve kayalardır. Güneş ışığı yüzeye yandan vurduğunda her taş, her toz
            tanesi ve her krater arkasına bir gölge düşürür. Yüzeyin büyük kısmı küçük gölgelerle kaplanır. Ay dolunaya
            yaklaştıkça ışık tepeden vurmaya başlar, gölgeler küçülür ve sonunda neredeyse tamamen kaybolur. Bu yüzden
            ayın parlaklığı son birkaç günde çok hızlı artar. Dolunay gecesinin bu kadar aydınlık olmasının sırrı budur.
          </p>

          <h2>Ne zaman ve nerede görülür?</h2>
          <p>
            Büyüyen şişkin ay her gün yaklaşık 50 dakika daha geç doğar. Dönemin başında öğle saatlerinden sonra,
            sonunda ise gün batımından hemen önce doğar. Akşam saatlerinde güneydoğu ve güney gökyüzünde, gecenin büyük
            kısmında ise yüksekte görülür. Sabaha karşı batar.
          </p>
          <p>
            Bu, akşam yürüyüşleri ve çocuklarla ay gözlemi için en rahat dönemdir: ay erken saatlerde gökyüzündedir,
            parlaktır ve teleskopla bakıldığında aydınlık ile karanlığın sınırındaki kraterler hâlâ gölgeli ve
            belirgindir. Kraterleri izlemek için <Link href={PAGES.ilkDordun.path}>ilk dördün</Link> sayfasındaki
            ipuçlarına da bakabilirsiniz.
          </p>
        </Prose>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Önümüzdeki büyüyen şişkin ay dönemleri</h2>
        <UpcomingPeriodTable from="first-quarter" to="full-moon" count={4} />

        <PhaseNav current={PAGE} />
        <ArticleFooter
          page={PAGE}
          headline="Büyüyen Şişkin Ay Nedir? Dolunaydan Nasıl Ayırt Edilir?"
          updated={UPDATED}
          sources={[{ label: "NASA Science, Moon Phases", href: "https://science.nasa.gov/moon/moon-phases/" }]}
        />
      </main>
    </>
  );
}

/** Bir sonraki (ya da içinde bulunulan) büyüyen şişkin ay döneminde her akşam 21:00 aydınlık oranı. */
async function DailyIllumination() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const timeZone = siteConfig.defaultLocation.timeZone;
  const phases = getUpcomingPrincipalPhases(new Date(now.getTime() - 9 * DAY_MS), 8);
  let firstQuarter = phases.find((p, i) => p.key === "first-quarter" && phases[i + 1]?.date > now)!;
  if (!firstQuarter) firstQuarter = phases.find((p) => p.key === "first-quarter")!;
  const fullMoon = phases.find((p) => p.key === "full-moon" && p.date > firstQuarter.date)!;

  // Türkiye UTC+3: yerel 21:00 = 18:00 UTC.
  const days: Date[] = [];
  const startDay = new Date(firstQuarter.date);
  startDay.setUTCHours(18, 0, 0, 0);
  if (startDay < firstQuarter.date) startDay.setUTCDate(startDay.getUTCDate() + 1);
  for (
    let d = new Date(startDay);
    d <= new Date(fullMoon.date.getTime() + DAY_MS / 2);
    d = new Date(d.getTime() + DAY_MS)
  ) {
    days.push(d);
  }

  const fmt = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "short",
    weekday: "short",
  });

  return (
    <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {days.map((d) => {
        const p = getMoonPhase(d, timeZone);
        const pct = Math.round(p.illumination * 100);
        return (
          <li key={d.toISOString()} className="flex items-center gap-3 rounded-xl bg-[#05070d] px-3 py-2.5 text-white">
            <MoonPhaseIcon phaseAngle={p.phaseAngle} size={36} title={p.name} />
            <div className="leading-tight">
              <p className="text-xs text-zinc-400">{fmt.format(d)}</p>
              <p className="font-semibold tabular-nums">%{pct}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
