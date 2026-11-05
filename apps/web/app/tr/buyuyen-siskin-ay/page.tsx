import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonPhase, getUpcomingPrincipalPhases } from "@moon-app/moon";
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

const PAGE = PAGES.buyuyenSiskinAy;
const UPDATED = "2026-11-05";
const HEADLINE = "Büyüyen Şişkin Ay Nedir? Görseli, Çizimi ve Dolunaydan Farkı";
const src = pageSources("nasaMoonPhases");
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `${HEADLINE} | ${siteConfig.name}`,
  description:
    "Büyüyen şişkin ay nedir, ne zaman? Gerçek görseli, nasıl çizildiği, diğer adları, dolunaydan farkı, gün gün aydınlık oranı ve büyüyen ay dönemleri.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function WaxingGibbousPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={135}
        eyebrow="Ay evreleri · 4"
        lead="İlk dördünden sonra ayın yarıdan fazlası aydınlanır ama henüz tam yuvarlak değildir. Dolunaya giden son haftadır."
        aside={<NextPeriod from="first-quarter" to="full-moon" label="büyüyen şişkin ay dönemi" />}
        updated={UPDATED}
      />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Ne zaman?" },
          { href: "#ne-demek", label: "Görseli" },
          { href: "#cizim", label: "Nasıl çizilir?" },
          { href: "#ayirt", label: "Dolunaydan farkı" },
          { href: "#gun-gun", label: "Gün gün" },
          { href: "#buyuyen-ay", label: "Büyüyen ay ne zaman?" },
        ]}
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <PhaseAnswer
          question="Büyüyen şişkin ay ne zaman?"
          periods={[{ from: "first-quarter", to: "full-moon", label: "büyüyen şişkin ay dönemi", rowLabel: "Büyüyen şişkin ay" }]}
          facts={[
            { label: "Nedir?", value: "İlk dördün ile dolunay arasındaki yaklaşık bir haftalık dönem." },
            { label: "Nasıl görünür?", value: "%51-99 aydınlık; sol kenarı hâlâ biraz eksik." },
            { label: "Ne zaman görülür?", value: "Öğleden sonra doğar; akşam ve gecenin büyük kısmında gökyüzündedir." },
          ]}
        />

        <Prose>
          <h2 id="ne-demek">&quot;Şişkin&quot; ne demek?</h2>
          <p>
            Ay bu evrede yarım dairenin ötesine geçmiş, ama henüz tam bir daire olmamıştır. Aydınlık kısmın sınırı dışa
            doğru bombelidir, ay sanki şişmiş gibi görünür. Adı buradan gelir. Batı dillerinde kullanılan
            &quot;gibbous&quot; kelimesi de Latincede &quot;kambur, tümsekli&quot; anlamına gelen <em>gibbus</em>
            kelimesinden türemiştir.
          </p>
          <p>
            Ders kitaplarında ve sitelerde aynı evre <strong>ilk şişkin ay</strong> adıyla da geçer; dolunaydan sonraki
            eşine ise <Link href={PAGES.kuculenSiskinAy.path}>son şişkin ay</Link> denir. Bazıları &quot;kambur ay&quot;
            der, bu da &quot;gibbous&quot; kelimesinin anlamıyla örtüşür. İngilizcesi <em>waxing gibbous</em>
            (büyüyen şişkin); NASA da evreyi bu adla anar.{src.ref("nasaMoonPhases")} Emojisi 🌔.
          </p>
        </Prose>
        <NasaFigure images={[IMAGES.waxingGibbous]} className="mx-auto max-w-md" />

        <h2 id="cizim" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Şişkin ay nasıl çizilir ve boyanır?</h2>
        <GibbousDrawSteps />
        <Prose>
          <p>
            Şişkin ayı yarım aydan ayıran tek şey gölge sınırıdır. <Link href={PAGES.sonDordun.path}>Yarım ayda</Link>{" "}
            bu sınır düz bir çizgidir; şişkin ayda ise karanlık tarafa doğru kavis yapar. Kavisi ne kadar dışa
            çekerseniz ay o kadar dolunaya yakın görünür: ilk dördünden sonraki gün kavis neredeyse düzdür, dolunaydan
            bir gün önce karanlık kısım kenarda ince bir şerittir.
          </p>
          <p>
            Boyarken aydınlık kısmı açık gri ya da açık sarıyla, karanlık şeridi koyu lacivert ya da koyu griyle
            doldurmak gerçeğe en yakın sonucu verir. Karanlık kısmı hiç boyamamak ayın orada olmadığı izlenimini verir;
            gerçekte ay oradadır, yalnızca Güneş ışığı almaz. Küçülen şişkin ay aynı şekilde, yalnızca ayna görüntüsü
            olarak çizilir. Evreleri lamba ve topla canlandırmak ya da maket yapmak isterseniz{" "}
            <Link href={`${PAGES.kuculenSiskinAy.path}#maket`}>ay evreleri maketi</Link> bölümüne bakın.
          </p>

          <h2 id="ayirt">Dolunaydan nasıl ayırt edilir?</h2>
          <p>
            Dolunaydan bir iki gün önce ay çıplak gözle neredeyse yuvarlak görünür ve sık sık dolunay sanılır. Ayırt
            etmenin üç kolay yolu var:
          </p>
          <ul>
            <li>
              <strong>Sol kenara bakın.</strong> Türkiye&apos;den bakınca büyüyen şişkin ayın sol kenarı hafifçe basık
              ya da bulanıktır. Dolunayda iki kenar da aynı keskinliktedir.
            </li>
            <li>
              <strong>Doğuş saatine bakın.</strong> Dolunay gün batımıyla birlikte doğar. Büyüyen şişkin ay ise Güneş
              batmadan, öğleden sonra doğmuştur. Hava kararırken ay gökyüzünde zaten yüksekteyse dolunay değildir.
            </li>
            <li>
              <strong>Takvime bakın.</strong> Aşağıdaki tablo bu dönemde ayın her gün yüzde kaç aydınlık olduğunu
              gösteriyor.
            </li>
          </ul>
        </Prose>

        <h2 id="gun-gun" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Dolunaya doğru gün gün</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Bir sonraki büyüyen şişkin ay döneminde, her akşam saat 21:00&apos;de ayın aydınlık oranı:
        </p>
        <DailyIllumination />

        <Prose>
          <h2>Ay neden dolunaya yaklaştıkça hızla parlaklaşır?</h2>
          <p>
            İlk dördünde ayın yarısı aydınlıktır. Bu yüzden ayın, dolunayın yarısı kadar parlak olmasını bekleriz.
            Gerçekte ilk dördündeki ay, dolunayın <strong>yalnızca onda biri</strong> kadar parlaktır.
          </p>
          <p>
            Bunun nedeni ayın yüzeyindeki toz ve kayalardır. Güneş ışığı yüzeye yandan vurduğunda her taş, her toz
            tanesi ve her krater arkasına bir gölge düşürür. Yüzeyin büyük kısmı küçük gölgelerle kaplanır. Ay dolunaya
            yaklaştıkça ışık tepeden vurmaya başlar, gölgeler küçülür ve sonunda neredeyse tamamen kaybolur. Bu yüzden
            ayın parlaklığı son birkaç günde çok hızlı artar. Dolunay gecesinin bu kadar aydınlık olmasının sırrı budur.
          </p>

          <h2 id="ne-zaman">Ne zaman ve nerede görülür?</h2>
          <p>
            Büyüyen şişkin ay her gün yaklaşık 50 dakika daha geç doğar. Dönemin başında öğle saatlerinden sonra,
            sonunda ise gün batımından hemen önce doğar. Akşam saatlerinde güneydoğu ve güney gökyüzünde, gecenin büyük
            kısmında ise yüksekte görülür. Sabaha karşı batar.
          </p>
          <p>
            Bu, akşam yürüyüşleri ve çocuklarla ay gözlemi için en rahat dönemdir: ay erken saatlerde gökyüzündedir,
            parlaktır ve teleskopla bakıldığında aydınlık ile karanlığın sınırındaki kraterler hâlâ gölgeli ve
            belirgindir. Kraterleri izlemek için <Link href={PAGES.ilkDordun.path}>ilk dördün</Link> sayfasındaki
            ipuçlarına da bakabilirsiniz.
          </p>
        </Prose>

        <h2 id="onumuzdeki" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Önümüzdeki büyüyen şişkin ay dönemleri</h2>
        <UpcomingPeriodTable from="first-quarter" to="full-moon" count={4} />

        <h2 id="buyuyen-ay" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">Büyüyen ay ne zaman?</h2>
        <WaxingNow />
        <Prose>
          <p>
            &quot;Büyüyen ay&quot;, yeni aydan dolunaya kadar süren yaklaşık 15 günlük dönemin genel adıdır. Bu dönem
            büyüyen hilali, ilk dördünü ve büyüyen şişkin ayı kapsar. Dolunaydan sonraki 15 gün ise küçülen aydır.
            Ayın her gece biraz daha geç doğması ve aydınlık kısmın sağdan sola doğru büyümesi, büyüyen ayın
            işaretleridir.
          </p>
          <p>
            Halk takvimlerinde &quot;büyüyen ayda&quot; denince bu dönem kastedilir. Bu takvimlere göre hesaplanmış
            günler için <Link href={PAGES.sacKesim.path}>saç kesim günleri</Link> ve{" "}
            <Link href={PAGES.ekimDikim.path}>ekim dikim takvimi</Link> sayfalarına bakabilirsiniz.
          </p>
        </Prose>
        <UpcomingPeriodTable from="new-moon" to="full-moon" count={4} />

        <Faq items={FAQS.buyuyenSiskinAy} />

        <PhaseNav current={PAGE} />
        <ArticleFooter page={PAGE} headline={HEADLINE} updated={UPDATED} src={src} />
      </main>
    </>
  );
}

/** Bir sonraki (ya da içinde bulunulan) büyüyen şişkin ay döneminde her akşam 21:00 aydınlık oranı. */
async function DailyIllumination() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const timeZone = siteConfig.defaultLocation.timeZone;
  const phases = getUpcomingPrincipalPhases(new Date(now.getTime() - 9 * DAY_MS), 8);
  let firstQuarter = phases.find((p, i) => p.key === "first-quarter" && phases[i + 1]?.date > now)!;
  if (!firstQuarter) firstQuarter = phases.find((p) => p.key === "first-quarter")!;
  const fullMoon = phases.find((p) => p.key === "full-moon" && p.date > firstQuarter.date)!;

  // Türkiye UTC+3: yerel 21:00 = 18:00 UTC.
  const days: Date[] = [];
  const startDay = new Date(firstQuarter.date);
  startDay.setUTCHours(18, 0, 0, 0);
  if (startDay < firstQuarter.date) startDay.setUTCDate(startDay.getUTCDate() + 1);
  for (
    let d = new Date(startDay);
    d <= new Date(fullMoon.date.getTime() + DAY_MS / 2);
    d = new Date(d.getTime() + DAY_MS)
  ) {
    days.push(d);
  }

  const fmt = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "short",
    weekday: "short",
  });

  return (
    <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {days.map((d) => {
        const p = getMoonPhase(d, timeZone);
        const pct = Math.round(p.illumination * 100);
        return (
          <li key={d.toISOString()} className="flex items-center gap-3 rounded-xl bg-[#05070d] px-3 py-2.5 text-white">
            <MoonPhaseIcon phaseAngle={p.phaseAngle} size={36} title={p.name} />
            <div className="leading-tight">
              <p className="text-xs text-zinc-400">{fmt.format(d)}</p>
              <p className="font-semibold tabular-nums">%{pct}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Ay şu an büyüyor mu, küçülüyor mu? Saatte bir yenilenir. */
async function WaxingNow() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const p = getMoonPhase(now, siteConfig.defaultLocation.timeZone);
  const waxing = p.phaseAngle < 180;
  return (
    <div className="mt-4 flex items-center gap-4 rounded-2xl bg-[#05070d] p-5 text-white">
      <MoonPhaseIcon phaseAngle={p.phaseAngle} size={56} title={p.name} />
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-400">Şu an</p>
        <p className="text-xl font-semibold">Ay {waxing ? "büyüyor" : "küçülüyor"}</p>
        <p className="text-sm text-zinc-300">
          {p.name}, %{Math.round(p.illumination * 100)} aydınlık.{" "}
          {waxing ? "Dolunaya kadar her gece daha çok aydınlanacak." : "Yeni aya kadar her gece biraz daha incelecek."}
        </p>
      </div>
    </div>
  );
}

/** Şişkin ay çizimi: büyüyen için üç adım, küçülen için ayna görüntüsü. Kendi çizimimiz. */
function GibbousDrawSteps() {
  const r = 52;
  const cy = 78;
  const rx = 30; // gölge sınırının yatay yarıçapı (yaklaşık yüzde 80 aydınlık)
  const waxDark = (x: number) => `M${x},${cy - r} A${r},${r} 0 0 0 ${x},${cy + r} A${rx},${r} 0 0 1 ${x},${cy - r} Z`;
  const waneDark = (x: number) => `M${x},${cy - r} A${r},${r} 0 0 1 ${x},${cy + r} A${rx},${r} 0 0 0 ${x},${cy - r} Z`;
  const curve = (x: number) => `M${x},${cy - r} A${rx},${r} 0 0 0 ${x},${cy + r}`;
  const panels = [
    { x: 90, label: "1. Bir daire çizin" },
    { x: 270, label: "2. Solda kavisli çizgi" },
    { x: 450, label: "3. Soldaki şeridi karartın" },
    { x: 630, label: "Küçülen şişkin: aynası" },
  ];
  return (
    <figure className="mt-6 rounded-2xl bg-[#05070d] p-4">
      <svg
        viewBox="0 0 720 170"
        className="h-auto w-full"
        role="img"
        aria-label="Büyüyen şişkin ay üç adımda nasıl çizilir: daire, solda dışa bombeli kavisli çizgi, soldaki ince şeridi karartma; küçülen şişkin ay bunun ayna görüntüsüdür"
      >
        {panels.map((p, i) => (
          <g key={p.label}>
            {i === 2 && (
              <>
                <circle cx={p.x} cy={cy} r={r} fill="#e4e4e7" />
                <path d={waxDark(p.x)} fill="#3f3f46" />
              </>
            )}
            {i === 3 && (
              <>
                <circle cx={p.x} cy={cy} r={r} fill="#e4e4e7" />
                <path d={waneDark(p.x)} fill="#3f3f46" />
              </>
            )}
            <circle cx={p.x} cy={cy} r={r} fill="none" stroke="#d4d4d8" strokeWidth={2} />
            {i === 1 && <path d={curve(p.x)} fill="none" stroke="#d4d4d8" strokeWidth={2} />}
            <text x={p.x} y={158} textAnchor="middle" fontSize={14} fill="#d4d4d8">
              {p.label}
            </text>
            {i < 2 && (
              <text x={p.x + 90} y={cy + 6} textAnchor="middle" fontSize={22} fill="#818cf8">
                →
              </text>
            )}
          </g>
        ))}
        <line x1={540} y1={20} x2={540} y2={136} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4 4" />
      </svg>
      <figcaption className="mt-2 text-center text-xs text-zinc-400">
        Türkiye&apos;den görünüşe göre. Güney yarımkürede iki çizim yer değiştirir.
      </figcaption>
    </figure>
  );
}
