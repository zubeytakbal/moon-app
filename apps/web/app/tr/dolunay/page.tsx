import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { getMoonAltitude, getUpcomingPrincipalPhases } from "@moon-app/moon";
import { ArticleFooter, NextPrincipal, PhaseHero, PhaseNav } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { NasaFigure } from "@/components/NasaFigure";
import { IMAGES } from "@/lib/images";
import { CalendarSubscribe } from "@/components/CalendarSubscribe";
import { fullMoonCity, FullMoonRiseFinder } from "./FullMoonRise";

const PAGE = PAGES.dolunay;
const UPDATED = "2026-10-29";
const MINUTE = 60_000;

export const metadata: Metadata = {
  title: `Dolunay Ne Zaman? Önümüzdeki Dolunay Tarihleri ve Saatleri | ${siteConfig.name}`,
  description:
    "Bir sonraki dolunay ne zaman? Önümüzdeki 12 dolunayın tarihi ve saati (Türkiye saati), ilinizde dolunayın saat kaçta ve hangi yönden doğacağı, gece ne kadar yükseleceği. Dolunay neden kışın yüksekte, ufukta neden büyük görünür?",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function FullMoonPage({ searchParams }: PageProps<"/tr/dolunay">) {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={180}
        eyebrow="Ay evreleri · 5"
        lead="Ayın Güneş'in tam karşısına geldiği, bize bakan yüzünün tamamen aydınlandığı an. Gün batımında doğar, bütün gece gökyüzünde kalır."
        aside={<NextPrincipal phase="full-moon" />}
      />
      <Suspense fallback={<FullMoonRiseFinder slug={siteConfig.defaultLocation.slug} />}>
        <SelectedFinder searchParams={searchParams} />
      </Suspense>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>
            Dolunayda ay, Dünya&apos;ya göre Güneş&apos;in tam karşısındadır. Bize bakan yüzün tamamı aydınlıktır.
          </li>
          <li>Dolunay gün batımında doğar, gece yarısı en yüksek noktasına çıkar, gün doğumunda batar.</li>
          <li>İki dolunay arasında ortalama 29,5 gün vardır. Bu yüzden bazı yıllarda 13 dolunay yaşanır.</li>
        </QuickFacts>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Önümüzdeki dolunaylar</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Saat, ayın Güneş&apos;in tam karşısına geldiği andır (Türkiye saati). Son sütun, ayın o gece seçtiğiniz ilde
          ufuktan en fazla kaç derece yükseldiğini gösterir.
        </p>
        <Suspense fallback={<FullMoonTable slug={siteConfig.defaultLocation.slug} />}>
          <SelectedTable searchParams={searchParams} />
        </Suspense>

        <Prose>
          <h2>Dolunay neden kışın yüksekte, yazın alçakta?</h2>
          <p>
            Tablodaki son sütuna bakın: aralık dolunayı neredeyse tepemize çıkar; İstanbul&apos;da 70 dereceyi geçer, güneydeki
            illerde daha da yükselir. Haziran dolunayı ise ufuktan ancak 20 derece kadar yükselir. Doğuş yönü de buna
            uyar: kış dolunayı kuzeydoğudan, yaz dolunayı güneydoğudan doğar.
          </p>
          <p>
            Nedeni basittir: dolunay, gökyüzünde her zaman Güneş&apos;in tam karşısındadır. Kışın Güneş öğle vakti bile
            alçakta kalır, bu yüzden karşısındaki dolunay gece yüksekten geçer. Yazın Güneş öğlen tepemize yakındır,
            karşısındaki dolunay ise gece alçakta kalır. Yani dolunay, kendinden altı ay önceki ya da sonraki
            Güneş&apos;in yolunu izler.
          </p>
          <p>
            Bunun güzel bir sonucu var: kış gecelerinin uzun ve karanlık olduğu dönemde dolunay en uzun süre ve en
            yüksekten aydınlatır. Kar varsa gece neredeyse gündüz gibi aydınlık olur.
          </p>

          <h2>Dolunay ufukta neden daha büyük görünür?</h2>
          <p>
            Yeni doğan dolunay ufukta kocaman görünür, birkaç saat sonra yükseldiğinde ise küçülmüş gibidir. Oysa ayın
            gerçek boyutu değişmez. Hatta ufuktaki ay bize biraz daha uzaktır, çünkü aradaki mesafeye Dünya&apos;nın
            yarıçapı kadar fazlalık eklenir.
          </p>
          <p>
            Bu bir göz yanılmasıdır ve adı <strong>ay yanılsamasıdır</strong>. Beynimiz ufuktaki cisimleri ağaçlar ve
            binalarla karşılaştırarak daha uzak ve daha büyük algılar. Denemek kolaydır: kolunuzu uzatıp küçük
            parmağınızın tırnağıyla ufuktaki ayı kapatın, saatler sonra yüksekteki ayı da aynı tırnak tam olarak
            kapatacaktır.
          </p>

          <NasaFigure images={[IMAGES.supermoonHorizon]} />

          <h2>Dolunay ne kadar sürer?</h2>
          <p>
            Astronomik olarak dolunay tek bir andır: ayın Güneş&apos;in tam karşısına geldiği dakika. Ama ay bir önceki
            ve bir sonraki gece de %97&apos;nin üzerinde aydınlık olduğu için çıplak gözle üç gece boyunca yuvarlak
            görünür. Takvimlerde dolunay, o anın düştüğü günün adıyla gösterilir.
          </p>

          <h2>Her dolunayda ay tutulması olur mu?</h2>
          <p>
            Ay tutulması yalnızca dolunayda olur, çünkü ancak o zaman ay Dünya&apos;nın gölgesine girebilir. Ama ayın
            yörüngesi yaklaşık 5 derece eğik olduğu için çoğu dolunayda ay, gölgenin biraz üstünden ya da altından
            geçer. Tutulma yalnızca dolunay, iki yörüngenin kesiştiği noktaya yakın bir zamana denk geldiğinde yaşanır.
            Bu yılda birkaç kez olur.
          </p>

          <h2>Dolunay ve Hicri takvim</h2>
          <p>
            Hicri aylar hilalle başladığı için dolunay, her Hicri ayın ortasına denk gelir. Ayın 13, 14 ve 15. günlerine{" "}
            <strong>eyyam-ı biyz</strong>, yani &quot;beyaz günler&quot; denir. Adını, ayın bu gecelerde dolunaya yakın
            olup geceyi aydınlatmasından alır.
          </p>

          <h2>Dolunay gözlemi için ipuçları</h2>
          <ul>
            <li>
              <strong>Doğuş anını yakalayın.</strong> Dolunay en etkileyici, ufuktan yeni yükselirken görünür.
              Bulunduğunuz ildeki doğuş saatine <Link href={PAGES.bugunAy.path}>Bugün Ay Nasıl?</Link> sayfasından
              bakabilirsiniz.
            </li>
            <li>
              <strong>Dürbünle bakın, ama teleskop beklemeyin.</strong> Dolunayda gölgeler kaybolduğu için kraterler düz
              görünür. Ayın parlak ışınlı kraterleri ve koyu denizleri ise en iyi dolunayda seçilir.
            </li>
            <li>
              <strong>Göz alışkanlığı:</strong> Dolunay o kadar parlaktır ki dürbünle uzun süre bakınca gözünüz
              kamaşabilir. Kısa aralıklarla bakın.
            </li>
          </ul>
        </Prose>

        <CalendarSubscribe />
        <PhaseNav current={PAGE} />
        <ArticleFooter
          page={PAGE}
          headline="Dolunay Ne Zaman? Önümüzdeki Dolunay Tarihleri ve Saatleri"
          updated={UPDATED}
          sources={[
            { label: "NASA Science, Moon Phases", href: "https://science.nasa.gov/moon/moon-phases/" },
            { label: "NASA Science, Eclipses", href: "https://science.nasa.gov/eclipses/" },
          ]}
        />
      </main>
    </>
  );
}

async function SelectedFinder({ searchParams }: Pick<PageProps<"/tr/dolunay">, "searchParams">) {
  const { il } = await searchParams;
  return <FullMoonRiseFinder slug={fullMoonCity(il).slug} />;
}

async function SelectedTable({ searchParams }: Pick<PageProps<"/tr/dolunay">, "searchParams">) {
  const { il } = await searchParams;
  return <FullMoonTable slug={fullMoonCity(il).slug} />;
}

/** Önümüzdeki 12 dolunay ve her birinin o gece seçilen ildeki en yüksek konumu. Saatte bir yenilenir. */
async function FullMoonTable({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const location = fullMoonCity(slug);
  const timeZone = location.timeZone;
  const fullMoons = getUpcomingPrincipalPhases(now, 52)
    .filter((p) => p.key === "full-moon")
    .slice(0, 12);

  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const weekday = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, weekday: "short" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

  const rows = fullMoons.map((p) => {
    // Dolunay anının 12 saat öncesi ile sonrası arasında, 10 dakikada bir bakılarak en yüksek konum bulunur.
    let max = -90;
    for (let m = -12 * 60; m <= 12 * 60; m += 10) {
      max = Math.max(max, getMoonAltitude(new Date(p.date.getTime() + m * MINUTE), location));
    }
    return { date: p.date, altitude: Math.round(max) };
  });

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-left">
        <thead className="bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950">
          <tr>
            <th className="px-4 py-3 font-medium sm:px-5">Tarih</th>
            <th className="px-4 py-3 font-medium sm:px-5">Saat</th>
            <th className="px-4 py-3 font-medium sm:px-5">En yüksek ({location.name})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map((r, i) => (
            <tr key={r.date.toISOString()} className={i === 0 ? "bg-indigo-50/60 dark:bg-indigo-950/30" : undefined}>
              <td className="px-4 py-3 sm:px-5">
                <time dateTime={r.date.toISOString()} className="font-medium">
                  {date.format(r.date)}
                </time>
                <span className="ml-1.5 text-sm text-zinc-500">{weekday.format(r.date)}</span>
              </td>
              <td className="px-4 py-3 tabular-nums sm:px-5">{time.format(r.date)}</td>
              <td className="px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-200 sm:w-24 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${(r.altitude / 90) * 100}%` }}
                    />
                  </div>
                  <span className="tabular-nums">{r.altitude}°</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
