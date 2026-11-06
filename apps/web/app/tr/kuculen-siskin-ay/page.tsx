import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/Faq";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { NasaFigure } from "@/components/NasaFigure";
import { ArticleFooter, PhaseAnswer, NextPeriod, PhaseHero, PhaseNav, UpcomingPeriodTable } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { FAQS } from "@/lib/faqs";
import { IMAGES } from "@/lib/images";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.kuculenSiskinAy;
const UPDATED = "2026-11-05";
const HEADLINE = "Küçülen Şişkin Ay Nedir? Görseli ve Ay Evreleri Maketi";
const src = pageSources("nasaMoonPhases");

export const metadata: Metadata = {
  title: `${HEADLINE} | ${siteConfig.name}`,
  description:
    "Küçülen şişkin ay nedir, ne zaman? Gerçek görseli, hangi taraftan eksildiği, lamba ve topla ay evreleri maketi (proje ödevi), önümüzdeki dönemler.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

/** Dolunaydan son dördüne, ayın yaklaşık doğuş saati (Türkiye, ortalama). */
const RISE_SHIFT = [
  { day: "Dolunay", rise: "Gün batımı", note: "Bütün gece gökyüzünde" },
  { day: "2 gün sonra", rise: "Akşam, ~1,5 saat geç", note: "Akşam yemeğinden sonra doğar" },
  { day: "4 gün sonra", rise: "Gece ~21:00-23:00", note: "Gece yarısından önce yükselir" },
  { day: "Son dördüne doğru", rise: "Gece yarısı civarı", note: "Sabah gökyüzüne kalır" },
];

export default function WaningGibbousPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={225}
        eyebrow="Ay evreleri · 6"
        lead="Dolunay geçti, ay eksilmeye başladı. Her gece biraz daha geç doğar ve günün ilk saatlerinde batı gökyüzünde kalır."
        aside={<NextPeriod from="full-moon" to="last-quarter" label="küçülen şişkin ay dönemi" />}
        updated={UPDATED}
      />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Ne zaman?" },
          { href: "#hangi-taraf", label: "Görseli" },
          { href: "#maket", label: "Maket ve proje ödevi" },
          { href: "#gec-dogar", label: "Geç doğar" },
          { href: "#sabah", label: "Sabah gökyüzünde" },
          { href: "#onumuzdeki", label: "Dönemler" },
        ]}
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <PhaseAnswer
          question="Küçülen şişkin ay ne zaman?"
          periods={[{ from: "full-moon", to: "last-quarter", label: "küçülen şişkin ay dönemi", rowLabel: "Küçülen şişkin ay" }]}
          facts={[
            { label: "Nedir?", value: "Dolunay ile son dördün arasındaki yaklaşık bir haftalık dönem." },
            { label: "Nasıl görünür?", value: "%99-51 aydınlık; Türkiye'den bakınca sağ kenarından eksilir." },
            { label: "Ne zaman görülür?", value: "Akşam geç doğar; sabah batı gökyüzünde görülür." },
          ]}
        />

        <Prose>
          <h2 id="hangi-taraf">Ay hangi taraftan eksilir?</h2>
          <p>
            Ay dolarken de eksilirken de değişim sağ taraftan başlar. Büyüyen ayda sağ kenar ilk aydınlanan yerdi.
            Dolunaydan sonra karanlık da aynı yerden, sağ kenardan girer. Böylece küçülen şişkin ayın aydınlık kısmı
            sola doğru kayar.
          </p>
          <p>
            Ay yüzeyinde duran biri için bu, gün batımının yaklaşmasıdır. Dolunayda ayın bize bakan yüzünün her yerinde
            öğle vaktidir. Küçülen şişkin ayda sağ kenarda gün batmış, gece başlamıştır. Bu karanlık çizgi her gün
            yaklaşık 12 derece ilerler.
          </p>
        </Prose>
        <NasaFigure images={[IMAGES.waningGibbous]} className="mx-auto max-w-md" />

        <h2 id="maket" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">
          Ay evreleri maketi ve proje ödevi
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Şişkin ay dahil sekiz evrenin nasıl oluştuğunu evde göstermenin en kolay iki yolu.
        </p>
        <Prose>
          <h3>1. Lamba ve topla canlandırma</h3>
          <p>
            Gereken: abajuru çıkarılmış tek ampullü bir lamba (Güneş), bir kaleme ya da çubuğa takılmış beyaz bir
            strafor top (ay) ve karanlık bir oda. Siz Dünya&apos;sınız, gözleriniz Dünya&apos;daki gözlemci.
          </p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Lambayı göz hizanızda, odanın bir kenarına koyun ve odayı karartın.</li>
            <li>
              Lambaya dönün, topu kolunuz uzanmış halde lambanın önüne, başınızdan biraz yukarıda tutun. Topun size bakan
              yüzü karanlıktır: <strong>yeni ay</strong>.
            </li>
            <li>
              Kolunuzu uzatmış halde yerinizde yavaşça sola doğru dönün. Topun sağ kenarında ince bir ışık belirir:{" "}
              <strong>büyüyen hilal</strong>.
            </li>
            <li>
              Çeyrek tur döndüğünüzde lamba sağınızda kalır ve topun sağ yarısı aydınlıktır: <strong>ilk dördün</strong>.
              Biraz daha dönünce aydınlık kısım yarıyı geçer: <strong>büyüyen şişkin ay</strong>.
            </li>
            <li>
              Sırtınız lambaya dönükken top tamamen aydınlıktır: <strong>dolunay</strong>. Topu başınızın gölgesine
              sokarsanız küçük bir ay tutulması görürsünüz; bu yüzden topu biraz yukarıda tutun.
            </li>
            <li>
              Dönmeye devam edin. Karanlık bu kez sağ kenardan girer: önce <strong>küçülen şişkin ay</strong>, lamba
              solunuza gelince <strong>son dördün</strong>, ardından <strong>küçülen hilal</strong> ve yeniden yeni ay.
            </li>
          </ol>
          <p>
            Bu deneyin gösterdiği şey şudur: top hiçbir zaman şekil değiştirmez, yarısı hep aydınlıktır. Değişen, o
            aydınlık yarının ne kadarını gördüğünüzdür. Ayın evreleri de tam olarak böyle oluşur.{src.ref("nasaMoonPhases")}
          </p>

          <h3>2. Strafor toplarla maket</h3>
          <p>
            Proje ödevleri için 8 küçük strafor top, ortaya Dünya için mavi bir top ve kenara Güneş için sarı bir top
            ya da daire yeterlidir. Topları bir kartonun üzerine, Dünya&apos;nın çevresinde bir çember halinde dizin.
          </p>
          <p>
            En sık yapılan hata, her topu &quot;o evrede nasıl görünüyorsa&quot; boyamaktır. Doğrusu, sekiz topun
            hepsinin <strong>Güneş&apos;e bakan yarısını</strong> açık renge, öbür yarısını koyu renge boyamaktır: yukarıdan
            bakınca her ay aynı yönden aydınlanır. Evrenin şekli ancak Dünya&apos;dan bakınca ortaya çıkar. İsterseniz
            çemberin dışına, her topun yanına o evrenin Dünya&apos;dan görünüşünü küçük bir çizimle ekleyin; aşağıdaki
            çizim bu düzeni gösteriyor.
          </p>
        </Prose>
        <OrbitModel />

        <h2 id="gec-dogar" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Ay her gece daha geç doğar</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Dolunaydan sonra doğuş saati her gün ortalama 50 dakika gecikir:
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RISE_SHIFT.map((r) => (
            <div
              key={r.day}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm text-zinc-500">{r.day}</p>
              <p className="mt-1 text-xl font-semibold">{r.rise}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{r.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Saatler yaklaşıktır, mevsime göre değişir. Bugünün kesin saatleri:{" "}
          <Link href={PAGES.bugunAy.path} className="underline">
            {PAGES.bugunAy.title}
          </Link>
        </p>

        <Prose>
          <h2 id="sabah">Sabah gökyüzündeki ay</h2>
          <p>
            Küçülen şişkin ay, gün doğduğunda hâlâ gökyüzündedir ve sabah saatlerinde batı yönünde, mavi gökyüzünün
            üzerinde soluk bir disk olarak görülür. Sabah işe ya da okula giderken batıya bakan birçok kişi ayı bu
            dönemde görür ve &quot;ay neden gündüz çıkmış?&quot; diye şaşırır. Aslında ay doğmamış, henüz batmamıştır.
          </p>
          <p>
            Akşamları ise durum terstir: dolunaydan birkaç gün sonra akşam saatlerinde ay gökyüzünde yoktur. Ay ancak
            gece ilerlediğinde doğu ufkundan, çoğu zaman turuncu ve iri görünerek yükselir.
          </p>

          <h2>Doğarken neden turuncu görünür?</h2>
          <p>
            Ufka yakın ayın ışığı, bize ulaşmak için atmosferin çok daha kalın bir katmanını geçer. Bu yolda mavi ışık
            daha çok saçılır, kırmızı ve turuncu ışık ise geçer. Gün batımında Güneş&apos;in kızarmasının nedeni de
            budur. Ay yükseldikçe ışığın geçtiği hava katmanı incelir ve ay yeniden beyazlaşır.
          </p>

          <h2>Gözlem için</h2>
          <p>
            Bu dönemde aydınlık ile karanlığın sınırı ayın sağ tarafındadır ve kraterler o kenarda yeniden gölgeli,
            belirgin görünür. Ama ayın gece geç doğması, akşam gözlemlerini zorlaştırır. Erken kalkanlar için şafaktan
            önceki saatler en iyi zamandır.
          </p>
          <p>
            Sırada <Link href={PAGES.sonDordun.path}>son dördün</Link> var: ayın sol yarısının aydınlık göründüğü, gece
            yarısı doğan yarım ay.
          </p>
        </Prose>

        <h2 id="onumuzdeki" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Önümüzdeki küçülen şişkin ay dönemleri</h2>
        <UpcomingPeriodTable from="full-moon" to="last-quarter" count={4} />

        <Faq items={FAQS.kuculenSiskinAy} />

        <PhaseNav current={PAGE} />
        <ArticleFooter page={PAGE} headline={HEADLINE} updated={UPDATED} src={src} />
      </main>
    </>
  );
}

/** Maket düzeni: yukarıdan bakış, sekiz konum (hepsi Güneş tarafından aydınlanır) ve Dünya'dan görünüşleri. Kendi çizimimiz. */
const MODEL_POSITIONS = [
  { deg: 180, name: "Yeni ay", angle: 0 },
  { deg: 225, name: "Büyüyen hilal", angle: 45 },
  { deg: 270, name: "İlk dördün", angle: 90 },
  { deg: 315, name: "Büyüyen şişkin", angle: 135 },
  { deg: 0, name: "Dolunay", angle: 180 },
  { deg: 45, name: "Küçülen şişkin", angle: 225 },
  { deg: 90, name: "Son dördün", angle: 270 },
  { deg: 135, name: "Küçülen hilal", angle: 315 },
];

function OrbitModel() {
  const cx = 330;
  const cy = 200;
  const R = 130;
  const mr = 16;
  return (
    <figure className="mt-6 rounded-2xl bg-[#05070d] p-4 text-white">
      <svg
        viewBox="0 0 640 400"
        className="h-auto w-full"
        role="img"
        aria-label="Ay evreleri maketi, yukarıdan bakış: solda Güneş, ortada Dünya, çevresinde sekiz ay; her ayın Güneş'e bakan sol yarısı aydınlık"
      >
        <circle cx={-10} cy={cy} r={70} fill="#fbbf24" />
        <text x={8} y={cy + 96} fontSize={14} fill="#fde68a">Güneş (lamba)</text>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#52525b" strokeWidth={1.5} strokeDasharray="4 6" />
        <path d={`M${cx},${cy - 26} A26,26 0 0 0 ${cx},${cy + 26} Z`} fill="#60a5fa" />
        <path d={`M${cx},${cy - 26} A26,26 0 0 1 ${cx},${cy + 26} Z`} fill="#1e3a8a" />
        <text x={cx} y={cy + 46} textAnchor="middle" fontSize={13} fill="#bfdbfe">Dünya (siz)</text>
        {MODEL_POSITIONS.map((m) => {
          const rad = (m.deg * Math.PI) / 180;
          const x = cx + R * Math.cos(rad);
          const y = cy - R * Math.sin(rad);
          const lx = cx + (R + 46) * Math.cos(rad);
          const ly = cy - (R + 46) * Math.sin(rad);
          return (
            <g key={m.name}>
              <path d={`M${x},${y - mr} A${mr},${mr} 0 0 0 ${x},${y + mr} Z`} fill="#e4e4e7" />
              <path d={`M${x},${y - mr} A${mr},${mr} 0 0 1 ${x},${y + mr} Z`} fill="#3f3f46" />
              <text x={lx} y={ly + 4} textAnchor="middle" fontSize={12} fill="#d4d4d8">{m.name}</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-4 text-center text-xs uppercase tracking-wider text-zinc-400">Dünya&apos;dan görünüşleri (Türkiye)</p>
      <ol className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-8">
        {MODEL_POSITIONS.map((m) => (
          <li key={m.name} className="flex flex-col items-center gap-1 text-center">
            <MoonPhaseIcon phaseAngle={m.angle} size={44} title={m.name} />
            <span className="text-[11px] leading-tight text-zinc-300">{m.name}</span>
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 text-center text-xs text-zinc-400">
        Yukarıdan bakış; ay saatin tersi yönünde döner. Her ayın Güneş&apos;e bakan yarısı aydınlıktır. Ölçekli değildir.
      </figcaption>
    </figure>
  );
}
