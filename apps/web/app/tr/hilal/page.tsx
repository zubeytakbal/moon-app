import type { Metadata } from "next";
import Link from "next/link";
import { ArticleFooter, NextPeriod, PhaseHero, PhaseNav, UpcomingPeriodTable } from "@/components/phase/PhaseParts";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.hilal;
const UPDATED = "2026-10-27";

export const metadata: Metadata = {
  title: `Hilal Nedir? Büyüyen ve Küçülen Hilal Ne Zaman Görülür? | ${siteConfig.name}`,
  description:
    "Büyüyen hilal akşam batıda, küçülen hilal sabah doğuda görülür. Hilal dönemlerinin tarihleri, ayın karanlık kısmındaki soluk ışık (Dünya ışığı) ve hilalin mevsime göre duruşu.",
  alternates: { canonical: PAGE.path },
};

export default function CrescentPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={40}
        eyebrow="Ay evreleri · 2 ve 8"
        lead="Ayın yarısından azının aydınlık göründüğü ince yay. Ay döngüsünde iki kez yaşanır: yeni aydan sonra büyüyen hilal, yeni aydan önce küçülen hilal."
        aside={<NextPeriod from="new-moon" to="first-quarter" label="büyüyen hilal dönemi" />}
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>Büyüyen hilal akşamları, gün batımından sonra batı ufkunda görülür. Sağ tarafı aydınlıktır.</li>
          <li>Küçülen hilal sabaha karşı, gün doğmadan önce doğu ufkunda görülür. Sol tarafı aydınlıktır.</li>
          <li>Hilal evresinde ayın aydınlık oranı %50&apos;nin altındadır.</li>
        </QuickFacts>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CrescentCard
            angle={40}
            title="Büyüyen hilal"
            when="Akşam, gün batımından sonra"
            where="Batı ufku"
            age="Ay yaşı 1-6 gün"
          />
          <CrescentCard
            angle={320}
            title="Küçülen hilal"
            when="Sabaha karşı, gün doğumundan önce"
            where="Doğu ufku"
            age="Ay yaşı 23-29 gün"
          />
        </div>

        <Prose>
          <h2>Akşam hilali, sabah hilali</h2>
          <p>
            Hilal, ay Güneş&apos;e gökyüzünde yakınken görülür. Bu yüzden onu gecenin ortasında aramak boşunadır. Ya
            Güneş battıktan hemen sonra ya da Güneş doğmadan hemen önce, ufka yakın bir yerde durur.
          </p>
          <p>
            <strong>Büyüyen hilal</strong> yeni aydan sonraki günlerde görülür. Ay her akşam bir öncekinden biraz daha
            yüksekte ve biraz daha kalın olur. Türkiye&apos;den bakınca aydınlık kısmı sağdadır, yani batmakta olan
            Güneş&apos;e doğru bakar.
          </p>
          <p>
            <strong>Küçülen hilal</strong> ise son dördünden sonraki sabahlarda görülür ve her sabah biraz daha incelir.
            Aydınlık kısmı soldadır, yani doğmak üzere olan Güneş&apos;in yönüne bakar. Erken kalkanların gördüğü bu
            hilal, akşam hilali kadar bilinmez.
          </p>
          <p>
            Hilalin ucuna, yani &quot;boynuzlarına&quot; bakarak da yön bulabilirsiniz: boynuzlar her zaman
            Güneş&apos;in tersine bakar.
          </p>
        </Prose>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Önümüzdeki büyüyen hilal dönemleri</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Büyüyen hilal, yeni ay ile ilk dördün arasındaki günlerde görülür. İlk bir iki akşam hilal çok incedir ve
          çıplak gözle bulunması zordur.
        </p>
        <UpcomingPeriodTable from="new-moon" to="first-quarter" count={4} />

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Önümüzdeki küçülen hilal dönemleri</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Küçülen hilal, son dördün ile yeni ay arasındaki sabahlarda görülür.
        </p>
        <UpcomingPeriodTable from="last-quarter" to="new-moon" count={4} />

        <Prose>
          <h2>Ayın karanlık kısmı neden hafifçe görünür?</h2>
          <p>
            Hilal evresinde dikkatli bakarsanız, ayın karanlık kalan kısmının da soluk, kül rengi bir ışıkla
            seçilebildiğini görürsünüz. Bu ışığa <strong>Dünya ışığı</strong> denir.
          </p>
          <p>
            Kaynağı Dünya&apos;nın kendisidir. Güneş ışığı Dünya&apos;daki bulutlardan, okyanuslardan ve buzullardan
            yansıyarak aya ulaşır, oradan da tekrar bize döner. Hilal evresinde aydan bakılınca Dünya neredeyse tamamen
            aydınlıktır, bu yüzden ayın gece tarafına epey ışık gönderir. Bu olayı ilk doğru açıklayan kişi,
            1500&apos;lerin başında Leonardo da Vinci olmuştur.
          </p>
          <p>
            Dünya ışığı en iyi, alacakaranlıktan biraz sonra, hilal henüz inceyken görülür. Dürbünle bakıldığında
            karanlık kısımdaki büyük lekeler bile seçilebilir.
          </p>

          <h2>Hilal neden bazen yatık, bazen dik durur?</h2>
          <p>
            Hilalin gökyüzündeki duruşu mevsime göre değişir. Bunun nedeni, ayın ve Güneş&apos;in gökyüzünde izlediği
            yolun (ekliptiğin) akşam ufkuyla yaptığı açının yıl boyunca değişmesidir.
          </p>
          <ul>
            <li>
              <strong>İlkbahar akşamlarında</strong> bu yol ufka diktir. Büyüyen hilal hızla yükselir, boynuzları yukarı
              bakan bir kayık gibi görünür ve uzun süre gökyüzünde kalır.
            </li>
            <li>
              <strong>Sonbahar akşamlarında</strong> yol ufka yatıktır. Hilal ufka yakın kalır, yana eğik durur ve kısa
              sürede batar.
            </li>
          </ul>
          <p>
            Sabah hilalinde durum tersine döner: küçülen hilal en iyi sonbahar sabahlarında görülür. Ekvatora yakın
            ülkelerde ise hilal hemen her zaman yatık, kayık gibi görünür.
          </p>

          <h2>Hilal ve Hicri takvim</h2>
          <p>
            Hicri takvimde her ay, <Link href={PAGES.yeniAy.path}>yeni aydan</Link> sonra ilk hilalin görülebildiği
            akşam başlar. Bu yüzden hilalin ilk kez görüldüğü an yüzyıllardır özenle gözlenir. Çok ince bir hilali
            görebilmek için ayın Güneş&apos;ten yeterince uzaklaşmış olması, havanın açık ve batı ufkunun engelsiz
            olması gerekir.
          </p>
          <p>
            Türk bayrağındaki ay da bir hilaldir. Bayraktaki hilalin dış kenarı solda, açık tarafı sağdadır. Yani
            gökyüzündeki küçülen hilale benzer.
          </p>

          <h3>Bir uyarı</h3>
          <p>
            İnce hilal, Güneş&apos;e çok yakın olduğu için onu dürbün ya da teleskopla ararken çok dikkatli olun. Güneş
            tamamen batmadan bu araçlarla ufka bakmayın. Güneş&apos;e dürbünle bakmak kalıcı göz hasarına yol açabilir.
          </p>
        </Prose>

        <PhaseNav current={PAGE} />
        <ArticleFooter
          page={PAGE}
          headline="Hilal Nedir? Büyüyen ve Küçülen Hilal Ne Zaman Görülür?"
          updated={UPDATED}
          sources={[{ label: "NASA Science, Moon Phases", href: "https://science.nasa.gov/moon/moon-phases/" }]}
        />
      </main>
    </>
  );
}

function CrescentCard({
  angle,
  title,
  when,
  where,
  age,
}: {
  angle: number;
  title: string;
  when: string;
  where: string;
  age: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#05070d] p-5 text-white">
      <MoonPhaseIcon phaseAngle={angle} size={72} title={title} />
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-zinc-300">{when}</p>
        <p className="text-sm text-zinc-400">
          {where} · {age}
        </p>
      </div>
    </div>
  );
}
