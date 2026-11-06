import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { getUpcomingPrincipalPhases } from "@moon-app/moon";
import { daytimeCity, DaytimeMoonFinder } from "@/components/DaytimeMoonFinder";
import { Faq } from "@/components/Faq";
import { DataTable, FactTable } from "@/components/InfoTables";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { NasaFigure } from "@/components/NasaFigure";
import {
  ArticleFooter, PhaseAnswer,
  fmt,
  NextPrincipal,
  PhaseHero,
  PhaseNav,
  UpcomingPrincipalTable,
} from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { FAQS } from "@/lib/faqs";
import { IMAGES } from "@/lib/images";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.sonDordun;
const UPDATED = "2026-11-05";
const HEADLINE = "Son Dördün Nedir? Özellikleri, Görseli ve Tarihleri";
const src = pageSources("nasaMoonPhases");
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `${HEADLINE} | ${siteConfig.name}`,
  description:
    "Son dördün nedir, ne zaman? Özellikleri, hangi harfe benzediği, nasıl çizildiği, önce ve sonra gelen evreler, önümüzdeki son dördün tarihleri.",
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
          { href: "#ozellikler", label: "Özellikleri" },
          { href: "#gunduz-ay", label: "Gündüz ayı" },
          { href: "#cizim", label: "Nasıl çizilir?" },
          { href: "#evreler", label: "Önceki-sonraki evre" },
          { href: "#onumuzdeki", label: "Tarihler" },
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

        <h2 id="ozellikler" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Son dördünün özellikleri</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Ders kitaplarında ve sınavlarda en çok sorulan bilgiler tek tabloda.
        </p>
        <FactTable
          rows={[
            {
              label: "Evre türü",
              value: "Ana evre",
              comment: "Dört ana evrenin dördüncüsü: yeni ay, ilk dördün, dolunay, son dördün. Ara evre değildir.",
            },
            {
              label: "Ay yaşı",
              value: "≈ 22 gün",
              comment: "Yeni aydan bu yana geçen süre. Bütün döngü yaklaşık 29,5 gündür.",
            },
            {
              label: "Aydınlık kısım",
              value: "%50",
              comment: "Türkiye'den bakınca sol yarı aydınlık, sağ yarı karanlık.",
            },
            {
              label: "Şekli",
              value: "Yarım daire",
              comment: "Aydınlık ile karanlık arasındaki sınır düz bir çizgi gibi görünür. C harfine benzer.",
            },
            {
              label: "Doğuş · batış",
              value: "≈ 00:00 · 12:00",
              comment: "Gece yarısı doğu ufkundan doğar, öğle saatlerinde batı ufkundan batar.",
            },
            {
              label: "En iyi görüldüğü",
              value: "Sabaha karşı",
              comment: "Gün doğarken güney gökyüzünde en yüksek noktasındadır; sabah mavi gökte de görülür.",
            },
            {
              label: "Güneş'e göre yeri",
              value: "90° batıda",
              comment: "Güneş, Dünya ve ay arasında dik açı vardır.",
            },
            {
              label: "Önceki · sonraki",
              value: "Dolunay · yeni ay",
              comment: "Arada küçülen şişkin ay (önce) ve küçülen hilal (sonra) görülür.",
            },
          ]}
        />
        <p className="mt-3 text-sm text-zinc-500">
          Evre adları ve 29,5 günlük döngü NASA&apos;nın evre anlatımına göredir.{src.ref("nasaMoonPhases")} Saatler
          ortalamadır; ilinize göre gerçek doğuş ve batış saatleri{" "}
          <Link href={PAGES.bugunAy.path} className="underline underline-offset-2">Bugün Ay</Link> sayfasında.
        </p>

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

        <h2 id="harf" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">
          Hangi harfe benzer: C mi, ters D mi?
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <LetterCard angle={270} letter="C" label="Son dördün" note="Küçülen ay" />
          <LetterCard angle={90} letter="D" label="İlk dördün" note="Büyüyen ay" />
        </div>
        <Prose>
          <p>
            Türkiye&apos;den bakınca son dördün <strong>C harfine</strong> benzer: aydınlık kısım soldadır, düz kenarı
            sağa bakar. İlk dördün ise D harfine benzer. Bazı kaynaklar son dördünü &quot;ters D&quot; diye anlatır; C ile
            aynı şeyi söyler.
          </p>
          <p>
            Bu kural yalnız yarım ay için değil, bütün döngü için kullanılabilir: kuzey yarımkürede büyüyen ay D&apos;ye,
            küçülen ay C&apos;ye benzer. Hilal akşam batıda sağı aydınlık görünüyorsa büyüyordur, sabah doğuda solu
            aydınlık görünüyorsa küçülüyordur.
          </p>
          <p>
            Güney yarımkürede (Avustralya, Güney Afrika, Arjantin) gökyüzüne bakan biri ayı ters görür. Orada son
            dördünün sağ yarısı aydınlıktır ve D harfine benzer. Ay aynı aydır; değişen, ona bakan kişinin başının yönüdür.
          </p>
        </Prose>

        <h2 id="cizim" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Son dördün nasıl çizilir?</h2>
        <DrawSteps />
        <Prose>
          <p>
            Yarım ayın gölge sınırı gerçekte de düz görünür; hilalde ve şişkin ayda ise kavislidir. Bu yüzden son dördünü
            çizerken ortadaki çizgiyi cetvelle çekmek doğrudur. Karartılan yarıyı tamamen silmek yerine koyu renkle
            boyamak, ayın orada olduğunu ama aydınlanmadığını daha iyi anlatır.
          </p>
        </Prose>
        <NasaFigure images={[IMAGES.lastQuarter]} className="mx-auto max-w-md" />

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

          <h2 id="gunes">Son dördünde Güneş nerede?</h2>
          <p>
            Son dördün anında Güneş, Dünya ve ay arasında dik açı vardır. Güneş ışığı aya yandan vurur, ayın Güneş&apos;e
            bakan yarısı aydınlanır. Biz bu aydınlık yarıyı yandan gördüğümüz için ayın yarısını aydınlık, yarısını
            karanlık görürüz.
          </p>
          <p>
            Gündelik dille: gün doğarken Güneş doğu ufkundadır, ay ise güney gökyüzünde en yüksek noktasındadır. Ayın
            aydınlık tarafı, ufkun altındaki ya da yeni doğan Güneş&apos;e, yani sola ve doğuya bakar. Öğleye doğru Güneş
            yükselirken ay batıya alçalır ve batar.
          </p>
        </Prose>
        <SunAngleDiagram />

        <Prose>
          <h2>Ayın yolculuğundan ilginç bir ayrıntı</h2>
          <p>
            Son dördünde ay, Dünya&apos;nın yörüngede ilerlediği yönün tam önündedir. Dünya, Güneş&apos;in etrafında
            saatte yaklaşık 107.000 kilometre hızla ilerler. Bu hızla Dünya, ayın son dördünde bulunduğu noktaya
            yaklaşık 3,5 saatte ulaşır.
          </p>
        </Prose>

        <h2 id="evreler" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">
          Son dördünden önce ve sonra hangi evre gelir?
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Bir sonraki son dördünün çevresindeki ana evreler, Türkiye saatiyle.
        </p>
        <AroundLastQuarter />
        <Prose>
          <p>
            Ana evreler aşağı yukarı birer hafta arayla gelir. Son dördünden <strong>bir hafta önce dolunay</strong>,{" "}
            <strong>bir hafta sonra yeni ay</strong> vardır. İki hafta sonra ilk dördün, üç hafta sonra yeniden dolunay
            gelir. Yani son dördün, dolunaydan bir önceki değil, bir sonraki ana evredir; dolunaydan önceki ana evre ilk
            dördündür.
          </p>
          <p>
            Ara evreler de aynı sırayı izler. Son dördünden önceki ara evre{" "}
            <Link href={PAGES.kuculenSiskinAy.path}>küçülen şişkin aydır</Link>. Son dördün ile yeni ay arasında ise sabahları
            doğu ufkunda incelen <Link href={PAGES.hilal.path}>küçülen hilal</Link> görülür. Ardından ay Güneş&apos;in
            parlaklığında kaybolur ve <Link href={PAGES.yeniAy.path}>yeni ay</Link> ile döngü yeniden başlar.
          </p>
        </Prose>

        <h2 id="onumuzdeki" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Önümüzdeki son dördün tarihleri</h2>
        <UpcomingPrincipalTable phase="last-quarter" count={6} />

        <Faq items={FAQS.sonDordun} />

        <PhaseNav current={PAGE} />
        <ArticleFooter page={PAGE} headline={HEADLINE} updated={UPDATED} src={src} />
      </main>
    </>
  );
}

/** Bir sonraki son dördün ve çevresindeki ana evreler (önceki dolunaydan sonraki dolunaya). Saatte bir yenilenir. */
async function AroundLastQuarter() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const list = getUpcomingPrincipalPhases(new Date(now.getTime() - 9 * DAY_MS), 10);
  const i = list.findIndex((p) => p.key === "last-quarter" && p.date > now);
  const lq = list[i];
  const rows = [
    { key: "once", label: "Dolunay (önceki ana evre)", p: list[i - 1] },
    { key: "lq", label: "Son dördün", p: lq },
    { key: "yeni", label: "Yeni ay", p: list[i + 1] },
    { key: "ilk", label: "İlk dördün", p: list[i + 2] },
    { key: "dolunay", label: "Dolunay", p: list[i + 3] },
  ];
  const f = fmt();
  const days = (ms: number) =>
    `${(Math.abs(ms) / DAY_MS).toLocaleString(siteConfig.locale, { maximumFractionDigits: 1 })} gün ${ms < 0 ? "önce" : "sonra"}`;

  return (
    <DataTable
      columns={["Evre", "Tarih ve saat", "Son dördüne göre"]}
      highlight="lq"
      rows={rows.map(({ key, label, p }) => ({
        key,
        cells: [
          label,
          <time key="t" dateTime={p.date.toISOString()}>
            {f.date.format(p.date)}, {f.time.format(p.date)}
          </time>,
          key === "lq" ? "Bu evre" : days(p.date.getTime() - lq.date.getTime()),
        ],
      }))}
    />
  );
}

function LetterCard({ angle, letter, label, note }: { angle: number; letter: string; label: string; note: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#05070d] p-5 text-white">
      <MoonPhaseIcon phaseAngle={angle} size={64} title={label} />
      <div>
        <p className="text-5xl font-extralight leading-none">{letter}</p>
        <p className="mt-2 text-sm font-semibold">{label}</p>
        <p className="text-xs text-zinc-400">{note}</p>
      </div>
    </div>
  );
}

/** Son dördün çizimi, üç adım. Kendi çizimimiz. */
function DrawSteps() {
  const r = 52;
  const steps = [
    { x: 90, label: "1. Bir daire çizin" },
    { x: 270, label: "2. Ortadan dikey bir çizgi" },
    { x: 450, label: "3. Sağ yarıyı karartın" },
  ];
  const cy = 78;
  return (
    <figure className="mt-6 rounded-2xl bg-[#05070d] p-4">
      <svg viewBox="0 0 540 170" className="h-auto w-full" role="img" aria-label="Son dördün üç adımda nasıl çizilir: daire, ortadan dikey çizgi, sağ yarıyı karartma">
        {steps.map((s, i) => (
          <g key={s.label}>
            {i === 2 && (
              <>
                <path d={`M${s.x},${cy - r} A${r},${r} 0 0 0 ${s.x},${cy + r} Z`} fill="#e4e4e7" />
                <path d={`M${s.x},${cy - r} A${r},${r} 0 0 1 ${s.x},${cy + r} Z`} fill="#3f3f46" />
              </>
            )}
            <circle cx={s.x} cy={cy} r={r} fill="none" stroke="#d4d4d8" strokeWidth={2} />
            {i >= 1 && <line x1={s.x} y1={cy - r} x2={s.x} y2={cy + r} stroke="#d4d4d8" strokeWidth={2} />}
            <text x={s.x} y={158} textAnchor="middle" fontSize={14} fill="#d4d4d8">
              {s.label}
            </text>
            {i < 2 && (
              <text x={s.x + 90} y={cy + 6} textAnchor="middle" fontSize={22} fill="#818cf8">
                →
              </text>
            )}
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-center text-xs text-zinc-400">
        Türkiye&apos;den görünüşe göre. Güney yarımküre için sol yarıyı karartın.
      </figcaption>
    </figure>
  );
}

/** Son dördünde Güneş, Dünya ve ayın yeri (kuzey kutbunun üstünden bakış). Kendi çizimimiz, ölçekli değil. */
function SunAngleDiagram() {
  const ex = 280;
  const ey = 170;
  const er = 32;
  const mr = 15;
  const my = ey + 120;
  return (
    <figure className="mt-6 rounded-2xl bg-[#05070d] p-4">
      <svg
        viewBox="0 0 640 380"
        className="h-auto w-full"
        role="img"
        aria-label="Kuzey kutbunun üstünden bakış: Güneş sağda, Dünya ortada, son dördündeki ay Dünya'nın altında; Güneş ve ay Dünya'dan bakınca dik açı yapıyor"
      >
        {/* Güneş ve ışık */}
        <circle cx={612} cy={ey} r={46} fill="#fbbf24" />
        <text x={600} y={ey + 70} textAnchor="middle" fontSize={14} fill="#fde68a">Güneş</text>
        {[ey - 60, ey, ey + 60].map((y) => (
          <g key={y}>
            <line x1={548} y1={y} x2={470} y2={y} stroke="#fbbf24" strokeWidth={2} strokeDasharray="6 5" />
            <polygon points={`462,${y} 474,${y - 6} 474,${y + 6}`} fill="#fbbf24" />
          </g>
        ))}

        {/* Ayın yörüngesi ve diğer ana evreler */}
        <circle cx={ex} cy={ey} r={120} fill="none" stroke="#52525b" strokeWidth={1.5} strokeDasharray="4 6" />
        {[
          { x: ex + 120, y: ey, label: "Yeni ay", dx: 0, dy: -22 },
          { x: ex, y: ey - 120, label: "İlk dördün", dx: 0, dy: -18 },
          { x: ex - 120, y: ey, label: "Dolunay", dx: 0, dy: -22 },
        ].map((m) => (
          <g key={m.label}>
            <circle cx={m.x} cy={m.y} r={9} fill="#3f3f46" />
            <text x={m.x + m.dx} y={m.y + m.dy} textAnchor="middle" fontSize={12} fill="#71717a">{m.label}</text>
          </g>
        ))}

        {/* Dünya: Güneş'e bakan yarı gündüz */}
        <path d={`M${ex},${ey - er} A${er},${er} 0 0 1 ${ex},${ey + er} Z`} fill="#60a5fa" />
        <path d={`M${ex},${ey - er} A${er},${er} 0 0 0 ${ex},${ey + er} Z`} fill="#1e3a8a" />
        <text x={ex - 44} y={ey + 5} textAnchor="end" fontSize={14} fill="#bfdbfe">Dünya</text>

        {/* Dik açı */}
        <line x1={ex} y1={ey} x2={ex + 110} y2={ey} stroke="#a5b4fc" strokeWidth={1.5} />
        <line x1={ex} y1={ey} x2={ex} y2={my - mr - 2} stroke="#a5b4fc" strokeWidth={1.5} />
        <path d={`M${ex},${ey + 46} L${ex + 46},${ey + 46} L${ex + 46},${ey}`} fill="none" stroke="#a5b4fc" strokeWidth={1.5} />
        <text x={ex + 54} y={ey + 64} fontSize={14} fill="#c7d2fe">90°</text>

        {/* Son dördündeki ay: Güneş'e bakan sağ yarısı aydınlık */}
        <path d={`M${ex},${my - mr} A${mr},${mr} 0 0 1 ${ex},${my + mr} Z`} fill="#e4e4e7" />
        <path d={`M${ex},${my - mr} A${mr},${mr} 0 0 0 ${ex},${my + mr} Z`} fill="#3f3f46" />
        <text x={ex + 26} y={my + 5} fontSize={15} fontWeight={600} fill="#ffffff">Son dördün</text>

        {/* Gözlemci: Dünya'nın aya bakan noktası, sabah */}
        <circle cx={ex} cy={ey + er} r={4.5} fill="#f472b6" />
        <line x1={ex - 4} y1={ey + er + 4} x2={150} y2={322} stroke="#f472b6" strokeWidth={1} />
        <text x={20} y={340} fontSize={13} fill="#fbcfe8">Burada saat sabah 6 civarı:</text>
        <text x={20} y={360} fontSize={13} fill="#fbcfe8">Güneş doğu ufkunda, ay güneyde tepede</text>
      </svg>
      <figcaption className="mt-2 text-center text-xs text-zinc-400">
        Kuzey kutbunun üstünden bakış. Uzaklıklar ve boyutlar ölçekli değildir.
      </figcaption>
    </figure>
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
