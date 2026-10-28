import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { findProvince, TURKEY_PROVINCES } from "@moon-app/moon";
import { CitySelect } from "@/components/CitySelect";
import {
  ArticleFooter,
  NextPrincipal,
  PhaseHero,
  PhaseNav,
  UpcomingPrincipalTable,
} from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { IMAGES } from "@/lib/images";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { OrbitTiltDiagram } from "@/components/EclipseDiagrams";
import { DarkNights } from "./DarkNights";

const PAGE = PAGES.yeniAy;
const UPDATED = "2026-10-28";
const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));

export const metadata: Metadata = {
  title: `Yeni Ay Nedir, Ne Zaman? Neden Görünmez? | ${siteConfig.name}`,
  description:
    "Yeni ay ne zaman? Önümüzdeki yeni ay tarihleri ve saatleri (Türkiye saati), ilinize göre yıldız gözlemi için karanlık geceler. Yeni ay neden görünmez, Hicri ayın başlangıcından farkı ne, güneş tutulması neden sadece yeni ayda olur?",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function NewMoonPage({ searchParams }: PageProps<"/tr/yeni-ay">) {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={0}
        eyebrow="Ay evreleri · 1"
        lead="Ay ile Güneş'in gökyüzünde aynı yönde buluştuğu an. Döngünün başlangıcıdır ama ayın görünmediği tek evredir."
        aside={<NextPrincipal phase="new-moon" />}
        photo={IMAGES.earthset}
      />
      <section className="bg-[#05070d] text-white" aria-labelledby="karanlik-geceler">
        <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <Suspense fallback={<DarkSkyPlanner slug={siteConfig.defaultLocation.slug} />}>
              <SelectedPlanner searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>Yeni ayda ay, Güneş ile Dünya arasındadır. Aydınlık yüzü bize ters bakar.</li>
          <li>Ay bu sırada Güneş&apos;le birlikte doğar ve batar, Güneş&apos;in parlaklığı içinde kaybolur.</li>
          <li>Ay döngüsü yeni ayla başlar. Ay yaşı sıfırdır, aydınlık oranı %0&apos;a yakındır.</li>
        </QuickFacts>

        <Prose>
          <h2>Yeni ay neden görünmez?</h2>
          <p>
            Ayın her zaman Güneş&apos;e bakan yarısı aydınlıktır. Yeni ayda ay, Dünya ile Güneş arasına girdiği için bu
            aydınlık yarı tam olarak bize ters düşer. Bize dönük olan yüz, ayın gece yaşayan tarafıdır.
          </p>
          <p>
            Bir sebep daha var: Ay o gün gökyüzünde Güneş&apos;in hemen yanındadır. Onunla birlikte sabah doğar, akşam
            batar. Gündüz gökyüzü o kadar parlaktır ki ayın karanlık yüzünü seçmek mümkün olmaz. Gece olduğunda ise ay
            çoktan batmıştır.
          </p>
        </Prose>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Önümüzdeki yeni ay tarihleri</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Saatler, ayın Güneş ile aynı boylama geldiği andır (Türkiye saati).
        </p>
        <UpcomingPrincipalTable phase="new-moon" count={6} />

        <Prose>
          <h2>Yeni ay ile Hicri ayın başı aynı şey mi?</h2>
          <p>
            Hayır, ve karıştırılması çok yaygındır. Astronomide <strong>yeni ay</strong>, ayın Güneş ile aynı boylama
            geldiği andır ve bu an gözle görülemez. Hicri takvimde ise ay, yeni aydan sonra ilk ince{" "}
            <Link href={PAGES.hilal.path}>hilalin</Link> görülebildiği akşam başlar.
          </p>
          <p>
            Hilal, yeni aydan hemen sonra görünmez. Ayın Güneş&apos;ten yeterince uzaklaşması ve gün batımından sonra
            ufkun üzerinde kalması gerekir. Bu genellikle yeni aydan bir iki gün sonrasına denk gelir. Bu yüzden
            takvimdeki yeni ay tarihi ile Ramazan ya da bayram gibi Hicri ayların ilk günü çoğu zaman aynı gün değildir.
          </p>
          <p>
            Türkiye&apos;de Diyanet, hilalin görülebilirliğine dair astronomik ölçütlere dayanan hesaplı bir takvim
            kullanır. Resmî dinî günler için her zaman Diyanet&apos;in takvimine bakmak gerekir. Bu sayfadaki tarihler
            yalnızca astronomik yeni ayı gösterir.
          </p>

          <h2>Güneş tutulması neden sadece yeni ayda olur?</h2>
          <p>
            Güneş tutulması, ayın Güneş&apos;in önünden geçip onu kısmen ya da tamamen örtmesidir. Bunun için ayın Dünya
            ile Güneş&apos;in arasında olması gerekir. Bu da yalnızca yeni ayda olur.
          </p>
          <p>
            Peki neden her yeni ayda tutulma olmuyor? Çünkü ayın yörüngesi, Dünya&apos;nın Güneş etrafındaki yörüngesine
            göre yaklaşık 5 derece eğiktir. Çoğu yeni ayda ay, Güneş&apos;in biraz üstünden ya da altından geçer.
            Tutulma ancak yeni ay, iki yörüngenin kesiştiği noktaya yakın bir zamana denk geldiğinde yaşanır. Bu durum
            yılda iki ile beş kez gerçekleşir ve her tutulma Dünya&apos;nın yalnızca bir bölümünden görülür.
          </p>

          <OrbitTiltDiagram />

          <h2>Yıldız gözlemi için en iyi hafta</h2>
          <p>
            Yeni ay günleri, gökyüzü meraklılarının en çok beklediği zamandır. Ayın ışığı geceyi aydınlatmadığı için
            sönük yıldızlar, Samanyolu ve meteor yağmurları çok daha iyi görülür. Yeni aydan önceki ve sonraki birkaç
            gece de ay ya çok geç doğar ya da çok erken batar, gökyüzü yine karanlık kalır.
          </p>
          <p>
            Şehir ışıklarından uzak bir yere gidecekseniz, sayfanın başındaki planlayıcıdan ilinizi seçip önümüzdeki
            iki haftanın en karanlık gecelerini görebilirsiniz.
          </p>

          <h3>Karanlık saatleri nasıl hesaplıyoruz?</h3>
          <p>
            Güneş battıktan sonra gökyüzü hemen kararmaz; Güneş ufkun 18 derece altına inene kadar alacakaranlık sürer.
            Gökbilimciler bu noktadan sonrasına &quot;astronomik gece&quot; der: sönük yıldızlar ve Samanyolu ancak o
            zaman tam olarak görünür. Planlayıcı her gece için önce bu astronomik geceyi bulur, sonra ayın ufkun
            üzerinde olduğu saatleri çıkarır. Geriye kalan, gökyüzünün hem Güneş hem ay ışığından arındığı saatlerdir.
            Hesap seçtiğiniz ilin konumuna göre yapılır; doğudaki illerde gece daha erken başlar, kuzeydeki illerde yaz
            geceleri daha kısadır.
          </p>
          <p>
            Bu saatler gökyüzünün kendisini anlatır; bulutları ve ışık kirliliğini hesaba katamaz. Şehir merkezinde
            en karanlık gecede bile yalnızca parlak yıldızlar görülür. Gözlem için ışıklardan en az birkaç on kilometre
            uzaklaşmak ve gözlerin karanlığa alışması için 20-30 dakika beklemek gerekir.
          </p>

          <h2>Aydan bakınca: &quot;dolu Dünya&quot;</h2>
          <p>
            Yeni ayda ayın bize bakan yüzü karanlıktır, ama o yüzde duran biri için durum tam tersidir. Aydan bakan biri
            gökyüzünde neredeyse tamamı aydınlık bir Dünya görürdü. Ay ve Dünya evreleri birbirinin tersidir: bizde yeni
            ay varken ayda &quot;dolu Dünya&quot; vardır. Bu parlak Dünya ışığı, birkaç gün sonra hilalin karanlık
            kısmını hafifçe aydınlatan ışıktır.
          </p>
        </Prose>

        <PhaseNav current={PAGE} />
        <ArticleFooter
          page={PAGE}
          headline="Yeni Ay Nedir, Ne Zaman? Neden Görünmez?"
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

async function SelectedPlanner({ searchParams }: Pick<PageProps<"/tr/yeni-ay">, "searchParams">) {
  const { il } = await searchParams;
  const city = findProvince(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
  return <DarkSkyPlanner slug={city.slug} />;
}

/** Yıldız gözlemi için karanlık gece planlayıcı: başlık, il seçici ve 14 gecelik çizelge. */
function DarkSkyPlanner({ slug }: { slug: string }) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="karanlik-geceler" className="text-xl font-semibold">
            Yıldız gözlemi için karanlık geceler
          </h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-400">
            Önümüzdeki 14 gece: gökyüzünün tamamen karardığı ve ayın ufkun altında olduğu saatler.
          </p>
        </div>
        <div className="rounded-xl bg-white p-1 text-zinc-900">
          <CitySelect action={PAGE.path} options={CITY_OPTIONS} selected={slug} />
        </div>
      </div>
      <DarkNights slug={slug} />
    </>
  );
}
