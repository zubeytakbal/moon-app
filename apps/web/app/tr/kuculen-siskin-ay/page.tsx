import type { Metadata } from "next";
import Link from "next/link";
import { ArticleFooter, NextPeriod, PhaseHero, PhaseNav, UpcomingPeriodTable } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.kuculenSiskinAy;
const UPDATED = "2026-10-27";

export const metadata: Metadata = {
  title: `Küçülen Şişkin Ay Nedir? Ne Zaman Doğar, Nerede Görülür? | ${siteConfig.name}`,
  description:
    "Dolunaydan sonraki küçülen şişkin ay: ay neden her gece daha geç doğar, neden sabah gökyüzünde batıda görülür, hangi taraftan eksilir? Önümüzdeki küçülen şişkin ay dönemleri.",
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
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>Küçülen şişkin ay, dolunay ile son dördün arasındaki yaklaşık bir haftalık dönemdir.</li>
          <li>Ayın %99 ile %51 arası aydınlıktır. Türkiye&apos;den bakınca sağ kenarından eksilir.</li>
          <li>Akşam geç doğar, sabah gökyüzünde batıda görülür.</li>
        </QuickFacts>

        <Prose>
          <h2>Ay hangi taraftan eksilir?</h2>
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

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Ay her gece daha geç doğar</h2>
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
          <h2>Sabah gökyüzündeki ay</h2>
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

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Önümüzdeki küçülen şişkin ay dönemleri</h2>
        <UpcomingPeriodTable from="full-moon" to="last-quarter" count={4} />

        <PhaseNav current={PAGE} />
        <ArticleFooter
          page={PAGE}
          headline="Küçülen Şişkin Ay Nedir? Ne Zaman Doğar, Nerede Görülür?"
          updated={UPDATED}
          sources={[{ label: "NASA Science, Moon Phases", href: "https://science.nasa.gov/moon/moon-phases/" }]}
        />
      </main>
    </>
  );
}
