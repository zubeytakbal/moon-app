import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { daytimeCity, DaytimeMoonFinder } from "@/components/DaytimeMoonFinder";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import {
  ArticleFooter, PhaseAnswer,
  NextPrincipal,
  PhaseHero,
  PhaseNav,
  UpcomingPrincipalTable,
} from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.sonDordun;
const UPDATED = "2026-11-01";
const src = pageSources("nasaMoonPhases");

export const metadata: Metadata = {
  title: `Son Dördün Nedir? Ne Zaman Doğar, Nasıl Görülür? | ${siteConfig.name}`,
  description:
    "Son dördün ne zaman? Önümüzdeki son dördün tarihleri. Gece yarısı doğan, sol yarısı aydınlık ay: ilk dördünden farkı, sabah gökyüzünde nerede görüldüğü.",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function LastQuarterPage({ searchParams }: PageProps<"/tr/son-dordun">) {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={270}
        eyebrow="Ay evreleri · 7"
        lead="Ayın sol yarısının aydınlık göründüğü an. Gece yarısına doğru doğar, sabah gökyüzüne kalır. Döngünün son çeyreği başlar."
        aside={<NextPrincipal phase="last-quarter" />}
        updated={UPDATED}
      />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Ne zaman?" },
          { href: "#gunduz-ay", label: "Gündüz ayı nerede?" },
          { href: "#ilk-son", label: "İlk dördünle farkı" },
          { href: "#onumuzdeki", label: "Önümüzdeki tarihler" },
          { href: "#adi", label: "Adı nereden gelir?" },
        ]}
      />
      <Suspense fallback={<DaytimeMoonFinder slug={siteConfig.defaultLocation.slug} action={PAGE.path} />}>
        <SelectedFinder searchParams={searchParams} />
      </Suspense>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <PhaseAnswer
          question="Son dördün ne zaman?"
          principal="last-quarter"
          facts={[
            { label: "Nasıl görünür?", value: "Ayın tam yarısı aydınlık; Türkiye'den bakınca sol yarısı." },
            { label: "Ne zaman görülür?", value: "Gece yarısı civarında doğar, sabah güneyde en yükseğe çıkar, öğle saatlerinde batar." },
            { label: "Ay yaşı", value: "Yaklaşık 22 gün. Bazı kaynaklarda \"üçüncü dördün\" olarak geçer." },
          ]}
        />

        <h2 id="ilk-son" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">İlk dördün ile son dördün</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          İkisi de yarım ay, ama gökyüzünde neredeyse hiç karşılaşmazlar.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Compare
            angle={90}
            title="İlk dördün"
            rows={[
              ["Aydınlık taraf", "Sağ"],
              ["Doğuş", "Öğle"],
              ["Batış", "Gece yarısı"],
              ["En iyi görüldüğü", "Akşam"],
            ]}
            href={PAGES.ilkDordun.path}
          />
          <Compare
            angle={270}
            title="Son dördün"
            rows={[
              ["Aydınlık taraf", "Sol"],
              ["Doğuş", "Gece yarısı"],
              ["Batış", "Öğle"],
              ["En iyi görüldüğü", "Sabaha karşı"],
            ]}
          />
        </div>

        <Prose>
          <h2>Gece kuşlarının ve erken kalkanların ayı</h2>
          <p>
            Son dördün gece yarısına doğru doğu ufkundan yükselir. Akşam saatlerinde gökyüzüne bakanlar onu göremez.
            Gece geç saatte ya da sabaha karşı dışarıda olanlar ise ayı güney gökyüzünde, sol yarısı parlak bir yarım
            daire olarak görür.
          </p>
          <p>
            Gün doğduktan sonra da ay gökyüzünde kalır. Sabah saatlerinde güney ve güneybatı yönünde, mavi gökyüzünde
            soluk bir yarım ay olarak seçilir ve öğle saatlerinde batar. Son dördün, sabahları en kolay görülen ay
            evresidir.
          </p>
          <p>
            Sabah ayı ne zaman ve nerede arayacağınızı sayfanın başındaki &quot;Gündüz ayı nerede?&quot; kutusu
            gösterir: ilinizi seçin, bugünün ve önümüzdeki günlerin saatlerini, ayın yönünü ve yüksekliğini görün.
          </p>

          <h2 id="adi">Bu adı nereden alıyor?</h2>
          <p>
            Tıpkı <Link href={PAGES.ilkDordun.path}>ilk dördünde</Link> olduğu gibi, &quot;dördün&quot; ayın görünüşünü
            değil, yolculuğunu anlatır. Ay, yeni aydan bu yana döngüsünün dörtte üçünü tamamlamıştır; geriye son çeyrek
            kalır. Bu anda ay, gökyüzünde Güneş&apos;ten 90 derece batıdadır ve Güneş ışığı ona yine yandan, bu kez öbür
            taraftan vurur.
          </p>

          <h2>Ayın yolculuğundan ilginç bir ayrıntı</h2>
          <p>
            Son dördünde ay, Dünya&apos;nın yörüngede ilerlediği yönün tam önündedir. Dünya, Güneş&apos;in etrafında
            saatte yaklaşık 107.000 kilometre hızla ilerler. Bu hızla Dünya, ayın son dördünde bulunduğu noktaya
            yaklaşık 3,5 saatte ulaşır.
          </p>

          <h2>Son dördünden sonra</h2>
          <p>
            Son dördünden sonra ay bir hafta boyunca incelir ve sabahları doğu ufkunda görülen{" "}
            <Link href={PAGES.hilal.path}>küçülen hilale</Link> dönüşür. Ardından ay Güneş&apos;in parlaklığında
            kaybolur ve <Link href={PAGES.yeniAy.path}>yeni ay</Link> ile döngü yeniden başlar.
          </p>
        </Prose>

        <h2 id="onumuzdeki" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Önümüzdeki son dördün tarihleri</h2>
        <UpcomingPrincipalTable phase="last-quarter" count={6} />

        <PhaseNav current={PAGE} />
        <ArticleFooter
          page={PAGE}
          headline="Son Dördün Nedir? Ne Zaman Doğar, Nasıl Görülür?"
          updated={UPDATED}
          src={src}
        />
      </main>
    </>
  );
}

function Compare({
  angle,
  title,
  rows,
  href,
}: {
  angle: number;
  title: string;
  rows: [string, string][];
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-4">
        <MoonPhaseIcon phaseAngle={angle} size={64} title={title} />
        <p className="text-xl font-semibold">{title}</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-zinc-400">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );
  const cls = "block rounded-2xl bg-[#05070d] p-5 text-white";
  return href ? (
    <Link href={href} className={`${cls} transition hover:bg-[#0d111c]`}>
      {content}
    </Link>
  ) : (
    <div className={`${cls} ring-2 ring-indigo-400`}>{content}</div>
  );
}

async function SelectedFinder({ searchParams }: Pick<PageProps<"/tr/son-dordun">, "searchParams">) {
  const { il } = await searchParams;
  return <DaytimeMoonFinder slug={daytimeCity(il).slug} action={PAGE.path} />;
}
