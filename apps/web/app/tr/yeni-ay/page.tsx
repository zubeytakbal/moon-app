import type { Metadata } from "next";
import Link from "next/link";
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
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.yeniAy;
const UPDATED = "2026-10-27";

export const metadata: Metadata = {
  title: `Yeni Ay Nedir, Ne Zaman? Neden Görünmez? | ${siteConfig.name}`,
  description:
    "Yeni ay ne zaman? Önümüzdeki yeni ay tarihleri ve saatleri (Türkiye saati). Yeni ay neden görünmez, Hicri ayın başlangıcından farkı ne, güneş tutulması neden sadece yeni ayda olur?",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function NewMoonPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={0}
        eyebrow="Ay evreleri · 1"
        lead="Ay ile Güneş'in gökyüzünde aynı yönde buluştuğu an. Döngünün başlangıcıdır ama ayın görünmediği tek evredir."
        aside={<NextPrincipal phase="new-moon" />}
      />
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

          <h2>Yıldız gözlemi için en iyi hafta</h2>
          <p>
            Yeni ay günleri, gökyüzü meraklılarının en çok beklediği zamandır. Ayın ışığı geceyi aydınlatmadığı için
            sönük yıldızlar, Samanyolu ve meteor yağmurları çok daha iyi görülür. Yeni aydan önceki ve sonraki birkaç
            gece de ay ya çok geç doğar ya da çok erken batar, gökyüzü yine karanlık kalır.
          </p>
          <p>
            Şehir ışıklarından uzak bir yere gidecekseniz, yukarıdaki tablodan bir sonraki yeni ayın tarihini seçip
            planınızı o haftaya göre yapabilirsiniz.
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
