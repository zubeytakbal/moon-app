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
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.ilkDordun;
const UPDATED = "2026-10-27";

export const metadata: Metadata = {
  title: `İlk Dördün Nedir? Ne Zaman, Nasıl Görülür? | ${siteConfig.name}`,
  description:
    "İlk dördün ne zaman? Önümüzdeki ilk dördün tarihleri. Yarım görünen aya neden dördün denir, neden öğleden sonra gündüz görülür, kraterleri izlemek için neden en iyi zamandır?",
  alternates: { canonical: PAGE.path },
};

/** Ayın gökyüzündeki günlük yolu, ilk dördün günü (yaklaşık, Türkiye). */
const DAY_PATH = [
  { time: "~12:00", text: "Doğu ufkundan doğar. Gündüz gökyüzünde soluk bir yarım daire olarak görülebilir." },
  { time: "~18:00", text: "Güneş batarken ay güneyde, gökyüzünün en yüksek noktasına yakındır." },
  { time: "Akşam", text: "Hava karardıkça parlaklaşır. Gözlem için en verimli saatler bunlardır." },
  { time: "~00:00", text: "Batı ufkunda batar. Gecenin ikinci yarısında gökyüzünde ay yoktur." },
];

export default function FirstQuarterPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={90}
        eyebrow="Ay evreleri · 3"
        lead="Ayın sağ yarısının aydınlık göründüğü an. Yeni aydan yaklaşık bir hafta sonra gelir; ay, döngüsünün dörtte birini tamamlamıştır."
        aside={<NextPrincipal phase="first-quarter" />}
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>İlk dördünde ayın tam yarısı aydınlık görünür. Türkiye&apos;den bakınca aydınlık kısım sağdadır.</li>
          <li>Ay öğle saatlerinde doğar, gece yarısına doğru batar. Öğleden sonra gündüz gökyüzünde de görülür.</li>
          <li>Ay yaşı yaklaşık 7,4 gündür.</li>
        </QuickFacts>

        <Prose>
          <h2>Yarım görünüyorsa neden &quot;dördün&quot;?</h2>
          <p>
            Bu evrede gördüğümüz şekil yarım bir dairedir, ama adı &quot;dörtte bir&quot; anlamına gelir. Ad, ayın
            görünüşünden değil, yolculuğundan gelir: ay, bir yeni aydan ötekine uzanan döngüsünün{" "}
            <strong>dörtte birini</strong> tamamlamıştır. İngilizcedeki &quot;first quarter&quot; adı da aynı mantıkla
            verilmiştir.
          </p>
          <p>
            Bu anda ay, gökyüzünde Güneş&apos;ten tam 90 derece doğudadır. Güneş ışığı aya yandan vurur, biz de ayın
            aydınlık yarısının tam yarısını görürüz. Sonuçta diskin yarısı aydınlık kalır.
          </p>
        </Prose>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">İlk dördün gününde ayın yolu</h2>
        <ol className="mt-6 space-y-0 border-l-2 border-indigo-200 dark:border-indigo-900">
          {DAY_PATH.map((step) => (
            <li key={step.time} className="relative pb-6 pl-6 last:pb-0">
              <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-indigo-500" aria-hidden="true" />
              <p className="font-semibold tabular-nums">{step.time}</p>
              <p className="text-zinc-700 dark:text-zinc-300">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-zinc-500">
          Saatler yaklaşıktır ve mevsime göre değişir. Bulunduğunuz il için kesin saatler:{" "}
          <Link href={PAGES.bugunAy.path} className="underline">
            {PAGES.bugunAy.title}
          </Link>
        </p>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Önümüzdeki ilk dördün tarihleri</h2>
        <UpcomingPrincipalTable phase="first-quarter" count={6} />

        <Prose>
          <h2>Gündüz görülen ay</h2>
          <p>
            Birçok kişi ayı yalnızca gece görülen bir gök cismi sanır. Oysa ilk dördün civarında ay öğle saatlerinde
            doğduğu için öğleden sonra mavi gökyüzünde rahatça görülür. Okuldan ya da işten dönerken doğu ve güneydoğu
            yönüne bakarsanız soluk bir yarım ay bulmanız çok olasıdır.
          </p>

          <h2>Kraterleri izlemenin en iyi zamanı</h2>
          <p>
            Çoğu kişi ayı izlemek için dolunayı bekler, ama gözlemciler için en verimli zaman ilk dördün civarıdır.
            Bunun nedeni, aydınlık ile karanlığın birleştiği çizgidir (terminatör). Bu çizginin üzerinde Güneş ayın
            yüzeyine çok yatık bir açıyla vurur. Krater duvarları ve dağlar uzun gölgeler düşürür, yüzey üç boyutlu
            görünür.
          </p>
          <p>
            Dolunayda ise Güneş ışığı yüzeye tepeden vurur, gölgeler kaybolur ve ay düz bir disk gibi görünür. İlk
            dördünde basit bir dürbün bile terminatör boyunca dizilmiş kraterleri göstermeye yeter.
          </p>
          <ul>
            <li>
              <strong>Sükûnet Denizi:</strong> Ayın sağ yarısındaki büyük koyu düzlüktür. 1969&apos;da Apollo 11 bu
              bölgeye inmiştir.
            </li>
            <li>
              <strong>Kriz Denizi:</strong> Sağ kenara yakın, tek başına duran oval koyu lekedir. Çıplak gözle bile
              seçilebilir.
            </li>
            <li>
              <strong>Terminatör çizgisi:</strong> Dürbünle bakıldığında üzerindeki krater ağızları ışıkla gölgenin
              arasında parlayan halkalar gibi görünür.
            </li>
          </ul>

          <h2>İlk dördünden sonra</h2>
          <p>
            İlk dördünden sonra aydınlık kısım yarıdan büyük olur ve ay{" "}
            <Link href={PAGES.buyuyenSiskinAy.path}>büyüyen şişkin ay</Link> evresine geçer. Yaklaşık bir hafta sonra da{" "}
            <Link href={PAGES.dolunay.path}>dolunay</Link> gelir.
          </p>
        </Prose>

        <PhaseNav current={PAGE} />
        <ArticleFooter
          page={PAGE}
          headline="İlk Dördün Nedir? Ne Zaman, Nasıl Görülür?"
          updated={UPDATED}
          sources={[
            { label: "NASA Science, Moon Phases", href: "https://science.nasa.gov/moon/moon-phases/" },
            { label: "NASA Science, Earth's Moon", href: "https://science.nasa.gov/moon/" },
          ]}
        />
      </main>
    </>
  );
}
