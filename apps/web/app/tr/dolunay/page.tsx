import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { getMoonAltitude, getMoonDistanceKm, getUpcomingLunarEclipses, getUpcomingPrincipalPhases } from "@moon-app/moon";
import { Faq } from "@/components/Faq";
import { FAQS } from "@/lib/faqs";
import { ArticleFooter, countdown, NextPrincipal, PhaseHero, PhaseNav } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { AnswerBox } from "@/components/InfoTables";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { nearestNamedFullMoon } from "@/lib/full-moon-names";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { NasaFigure } from "@/components/NasaFigure";
import { IMAGES } from "@/lib/images";
import { CalendarSubscribe } from "@/components/CalendarSubscribe";
import { fullMoonCity, FullMoonRiseFinder } from "./FullMoonRise";

const PAGE = PAGES.dolunay;
const UPDATED = "2026-11-01";
const src = pageSources("nasaMoonPhases", "nasaMoonFactSheet", "nasaEclipseTypes");
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
        updated={UPDATED}
      />
      <Suspense fallback={<FullMoonRiseFinder slug={siteConfig.defaultLocation.slug} />}>
        <SelectedFinder searchParams={searchParams} />
      </Suspense>
      <QuickLinks
        links={[
          { href: "#cevap", label: "Dolunay ne zaman?" },
          { href: "#dolunay-dogusu", label: "Doğuşu nereden izlerim?" },
          { href: "#onumuzdeki", label: "Önümüzdeki 12 dolunay" },
          { href: "#kis-yaz", label: "Kışın neden yüksekte?" },
          { href: "#ay-yanilsamasi", label: "Ufukta neden büyük?" },
          { href: "#tutulma", label: "Tutulma olur mu?" },
          { href: "#sss", label: "Sık sorulanlar" },
        ]}
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <FullMoonAnswer />

        <h2 id="onumuzdeki" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Önümüzdeki dolunaylar</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Saat, ayın Güneş&apos;in tam karşısına geldiği andır (Türkiye saati). Son sütun, ayın o gece seçtiğiniz ilde
          ufuktan en fazla kaç derece yükseldiğini gösterir.
        </p>
        <Suspense fallback={<FullMoonTable slug={siteConfig.defaultLocation.slug} />}>
          <SelectedTable searchParams={searchParams} />
        </Suspense>

        <Prose>
          <h2 id="kis-yaz">Dolunay neden kışın yüksekte, yazın alçakta?</h2>
          <p>
            Tablodaki son sütuna bakın: aralık dolunayı neredeyse tepemize çıkar; İstanbul&apos;da 70 dereceyi geçer, güneydeki
            illerde daha da yükselir. Haziran dolunayı ise ufuktan ancak 20 derece kadar yükselir. Doğuş yönü de buna
            uyar: kış dolunayı kuzeydoğudan, yaz dolunayı güneydoğudan doğar.
          </p>
          <p>
            Nedeni basittir: dolunay, gökyüzünde her zaman Güneş&apos;in tam karşısındadır.{src.ref("nasaMoonPhases")} Kışın Güneş öğle vakti bile
            alçakta kalır, bu yüzden karşısındaki dolunay gece yüksekten geçer. Yazın Güneş öğlen tepemize yakındır,
            karşısındaki dolunay ise gece alçakta kalır. Yani dolunay, kendinden altı ay önceki ya da sonraki
            Güneş&apos;in yolunu izler.
          </p>
          <p>
            Bunun güzel bir sonucu var: kış gecelerinin uzun ve karanlık olduğu dönemde dolunay en uzun süre ve en
            yüksekten aydınlatır. Kar varsa gece neredeyse gündüz gibi aydınlık olur.
          </p>

          <h2 id="ay-yanilsamasi">Dolunay ufukta neden daha büyük görünür?</h2>
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

          <h2 id="tutulma">Her dolunayda ay tutulması olur mu?</h2>
          <p>
            Ay tutulması yalnızca dolunayda olur, çünkü ancak o zaman ay Dünya&apos;nın gölgesine girebilir.{src.ref("nasaEclipseTypes")} Ama ayın
            yörüngesi yaklaşık 5 derece eğik olduğu için{src.ref("nasaMoonFactSheet")} çoğu dolunayda ay, gölgenin biraz üstünden ya da altından
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
        <Faq items={FAQS.dolunay} />
        <ArticleFooter
          page={PAGE}
          headline="Dolunay Ne Zaman? Önümüzdeki Dolunay Tarihleri ve Saatleri"
          updated={UPDATED}
          src={src}
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

const ECLIPSE_KIND_TR = {
  total: "tam ay tutulması (kanlı ay)",
  partial: "parçalı ay tutulması",
  penumbral: "yarı gölge tutulması",
} as const;

/** Sayfanın sorusunun cevabı, en üstte (timeanddate düzeni). Saatte bir yenilenir. */
async function FullMoonAnswer() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const timeZone = siteConfig.defaultLocation.timeZone;
  const [next, after] = getUpcomingPrincipalPhases(now, 9).filter((p) => p.key === "full-moon");
  const name = nearestNamedFullMoon(next.date, timeZone).name;
  const km = getMoonDistanceKm(next.date);
  const eclipse = getUpcomingLunarEclipses(now, 1).find((e) => Math.abs(e.peak.getTime() - next.date.getTime()) < 86_400_000);
  const day = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const kmText = `${Math.round(km).toLocaleString("tr-TR")} km`;

  return (
    <AnswerBox
      question="Dolunay ne zaman?"
      answer={`Bir sonraki dolunay ${day.format(next.date)}, saat ${time.format(next.date)} (Türkiye saati).`}
      rows={[
        { label: "Kaç gün kaldı?", value: countdown(next.date.getTime() - now.getTime()) },
        ...(name
          ? [
              {
                label: "Geleneksel adı",
                value: (
                  <Link href={PAGES.dolunayIsimleri.path} className="underline underline-offset-2">
                    {name}
                  </Link>
                ),
              },
            ]
          : []),
        {
          label: "Süper ay mı?",
          value: km < SUPERMOON_KM ? `Evet: ay ${kmText} uzaklıkta, Dünya'ya yakın.` : `Hayır: ay ${kmText} uzaklıkta.`,
        },
        {
          label: "Ay tutulması var mı?",
          value: eclipse ? (
            <>
              Evet, {ECLIPSE_KIND_TR[eclipse.kind]}.{" "}
              <Link href={PAGES.ayTutulmalari.path} className="underline underline-offset-2">
                Ayrıntılar
              </Link>
            </>
          ) : (
            "Hayır."
          ),
        },
        { label: "Ondan sonraki dolunay", value: `${day.format(after.date)}, ${time.format(after.date)}` },
      ]}
      note={
        <>
          Dolunay, ayın Güneş&apos;in tam karşısına geldiği andır; ay gün batımında doğar ve bütün gece görünür. İlinizde
          saat kaçta doğacağını{" "}
          <a href="#dolunay-dogusu" className="underline underline-offset-2">
            yukarıdaki araçta
          </a>{" "}
          görebilirsiniz.
        </>
      }
    />
  );
}
