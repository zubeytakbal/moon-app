import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { TURKEY_PROVINCES } from "@moon-app/moon";
import { EclipseDisc } from "@/components/EclipseDisc";
import { Faq } from "@/components/Faq";
import { NasaFigure } from "@/components/NasaFigure";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { FAQS } from "@/lib/faqs";
import { IMAGES } from "@/lib/images";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { centralProvinces, durationText, TURKEY_ECLIPSES, type TurkeyEclipse } from "@/lib/turkey-eclipses";
import { siteConfig } from "@/site.config";
import { parseInputs, TimeMachine } from "./TimeMachine";

const PAGE = PAGES.turkiyeTutulmalari;
const UPDATED = "2026-10-29";
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `Türkiye'den Görülen Güneş Tutulmaları: 1999, 2006 ve Gelecek Tam Tutulmalar | ${siteConfig.name}`,
  description:
    "11 Ağustos 1999 ve 29 Mart 2006 tam güneş tutulmaları hangi illerden görüldü, kaç dakika sürdü? İlinizden hayatınız boyunca görülen ve görülecek tutulmalar, 2100'e kadar Türkiye'nin tam ve halkalı tutulmaları.",
  // İl, doğum yılı ve seçili tutulma (?il=, ?dy=, ?t=) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

const byId = (id: string) => TURKEY_ECLIPSES.find((e) => e.id === id)!;
const names = (e: TurkeyEclipse) => centralProvinces(e).map((i) => TURKEY_PROVINCES[i].name);
/** Bir tutulmada il merkezleri arasında en uzun tam/halkalı evre. */
function longest(e: TurkeyEclipse) {
  let best = { name: "", seconds: 0 };
  e.local.forEach((v, i) => {
    if (v && v.centralSeconds > best.seconds) best = { name: TURKEY_PROVINCES[i].name, seconds: v.centralSeconds };
  });
  return best;
}
const dateText = (d: Date) =>
  new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" }).format(d);
const KIND_TR: Record<string, string> = { total: "Tam", annular: "Halkalı", partial: "Parçalı", hybrid: "Melez" };

export default function TurkeyEclipsesPage({ searchParams }: PageProps<"/tr/turkiye-gunes-tutulmalari">) {
  const e1999 = byId("1999-08-11");
  const e2006 = byId("2006-03-29");
  const l1999 = longest(e1999);
  const l2006 = longest(e2006);

  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={0}
        eyebrow="Tutulmalar"
        lead="11 Ağustos 1999'da ve 29 Mart 2006'da gündüz birkaç dakikalığına gece oldu. İlinizden hangi tutulmalar görüldü, hayatınızda hangilerini göreceksiniz?"
        aside={<NextCentral />}
        photo={IMAGES.solarCorona}
      />
      <section className="bg-[#05070d] text-white" aria-labelledby="zaman-makinesi">
        <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-2">
          <Suspense fallback={<TimeMachine slug={siteConfig.defaultLocation.slug} birthYear={null} id="1999-08-11" />}>
            <SelectedMachine searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>
            Türkiye son iki tam güneş tutulmasını 11 Ağustos 1999&apos;da ve 29 Mart 2006&apos;da yaşadı; ikisinde de bütün
            illerden Güneş&apos;in en az %80&apos;i örtüldü.
          </li>
          <li>Bir sonraki tam tutulma 30 Nisan 2060&apos;ta, Güneydoğu ve Doğu Anadolu&apos;dan görülecek.</li>
          <li>1 Haziran 2030&apos;da İstanbul dahil 13 ilden halkalı tutulma izlenecek.</li>
        </QuickFacts>

        <Prose>
          <h2>11 Ağustos 1999: yüzyılın son tam tutulması</h2>
          <p>
            Ay&apos;ın gölgesi o gün Kuzey Atlantik&apos;ten başlayıp Avrupa, Türkiye, Orta Doğu ve İran üzerinden
            Hindistan&apos;a uzanan bir şerit çizdi. Bu, 20. yüzyılın son tam güneş tutulmasıydı. Türkiye&apos;de tam
            tutulma şeridi Batı Karadeniz kıyısından girdi, Anadolu&apos;yu kuzeybatıdan güneydoğuya çaprazlama geçti. Tam
            tutulmanın il merkezinden görüldüğü iller şunlardı: {names(e1999).join(", ")}.
          </p>
          <p>
            İl merkezleri arasında tam tutulma en uzun {l1999.name} merkezinde, {durationText(l1999.seconds)} sürdü. Tutulma
            Türkiye saatiyle öğleden sonra, Güneş gökyüzünde yüksekteyken yaşandı; şeridin dışında kalan illerde de
            Güneş&apos;in büyük kısmı örtüldü ve gündüz belirgin biçimde karardı.
          </p>

          <h2>1999 tutulması ve Gölcük depremi</h2>
          <p>
            Tutulmadan altı gün sonra, 17 Ağustos 1999 gecesi Marmara Bölgesi&apos;ni büyük Gölcük depremi vurdu. İki
            olayın arka arkaya yaşanması, tutulmanın depremi tetiklediği inancını yaygınlaştırdı. Bilimsel olarak böyle bir
            bağlantı yoktur: Tutulma sırasında Ay ile Güneş&apos;in Dünya&apos;ya uyguladığı çekim, her yeni ayda yaşanan
            hizalanmanınkiyle aynıdır ve bu hizalanma her ay tekrarlanır. Deprem ise Kuzey Anadolu Fayı&apos;nda yüzyıllardır
            biriken gerilimin boşalmasıydı. Gelgit kuvvetleri ile depremler arasındaki ilişkiyi{" "}
            <Link href={PAGES.superAy.path}>Süper Ay</Link> sayfasında ayrıntılı ele aldık.
          </p>

          <h2>29 Mart 2006: Antalya&apos;dan Karadeniz&apos;e</h2>
          <p>
            Yedi yıl sonra gölge bu kez Afrika&apos;dan gelip Akdeniz&apos;i geçti ve Türkiye&apos;ye Antalya kıyılarından
            girdi. Şerit Anadolu&apos;yu güneybatıdan kuzeydoğuya katetti; tam tutulma şu il merkezlerinden görüldü:{" "}
            {names(e2006).join(", ")}. İl merkezleri arasında en uzunu {l2006.name} merkezinde,{" "}
            {durationText(l2006.seconds)}.
          </p>
          <p>
            Antalya&apos;nın Side ve Manavgat kıyıları şeridin ortasına yakındı; dünyanın dört bir yanından gökbilimciler
            ve meraklılar tutulmayı izlemek için bölgeye geldi. Tam tutulmada gökyüzü birkaç dakikalığına alacakaranlığa
            döner: parlak gezegenler ve yıldızlar belirir, Güneş&apos;in çevresinde inci beyazı taç (korona) görünür, hava
            belirgin biçimde serinler.
          </p>
        </Prose>

        <NasaFigure images={[IMAGES.solarCorona, IMAGES.solarDiamondRing]} />

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">2100&apos;e kadar Türkiye&apos;nin tam ve halkalı tutulmaları</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          İl merkezinden tam ya da halkalı görülecek tutulmalar ve o illerdeki en uzun süre. Aynı tarihte öteki illerden
          parçalı tutulma görülür; zaman makinesinden ilinizi seçebilirsiniz.
        </p>
        <FutureCentral />

        <Prose>
          <h2>Bir yerden tam tutulma neden bu kadar nadir görülür?</h2>
          <p>
            Dünya&apos;nın bir yerinde her yıl iki ile beş güneş tutulması olur, ama Ay&apos;ın tam gölgesi yeryüzünde en
            fazla birkaç yüz kilometre genişliğinde bir şerit çizer. Bu yüzden aynı noktadan tam tutulma ortalama 375 yılda
            bir görülür. Türkiye geniş bir ülke olduğu için daha şanslıdır: Yüzyıl içinde birkaç tam tutulma şeridi
            Türkiye&apos;nin bir bölümünden geçer. Yine de bir ilin merkezinden tam tutulma görmek, çoğu insan için hayatta
            ancak bir kez yaşanan bir olaydır; bunun için tutulma günü şeride doğru yolculuk etmek gerekir.
          </p>
          <p>
            Tutulmayı izlerken göz güvenliği ve tutulmanın nasıl oluştuğu için{" "}
            <Link href={PAGES.gunesTutulmasi.path}>Güneş Tutulması</Link> sayfasına bakabilirsiniz; orada ilinizden
            görülecek bir sonraki tutulmanın saatleri ve 2 Ağustos 2027 tutulmasının 81 ildeki görünüşü de yer alıyor.
          </p>
        </Prose>

        <Faq items={FAQS.turkiyeTutulmalari} />
        <ArticleFooter
          page={PAGE}
          headline="Türkiye'den Görülen Güneş Tutulmaları: 1999, 2006 ve Gelecek Tam Tutulmalar"
          updated={UPDATED}
          sources={[
            { label: "NASA, Eclipse Web Site: güneş tutulmaları kataloğu", href: "https://eclipse.gsfc.nasa.gov/solar.html" },
            { label: "NASA Science, Eclipses", href: "https://science.nasa.gov/eclipses/" },
          ]}
        />
      </main>
    </>
  );
}

async function SelectedMachine({ searchParams }: Pick<PageProps<"/tr/turkiye-gunes-tutulmalari">, "searchParams">) {
  const sp = await searchParams;
  return <TimeMachine {...parseInputs(sp)} />;
}

/** Giriş kutusu: Türkiye'de bir sonraki tam ya da halkalı tutulma ve kalan süre. Günde bir yenilenir. */
async function NextCentral() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const next = TURKEY_ECLIPSES.find((e) => e.peak > now && centralProvinces(e).length > 0)!;
  const days = Math.ceil((next.peak.getTime() - now.getTime()) / DAY_MS);
  const years = Math.floor(days / 365.25);
  const local = next.local.find((v) => v && v.kind !== "partial");

  return (
    <div className="rounded-2xl border border-white/15 bg-black/50 p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-zinc-400">Türkiye&apos;de bir sonraki merkezi tutulma</p>
      <p className="mt-1 text-2xl font-semibold">{dateText(next.peak)}</p>
      <p className="mt-0.5 text-zinc-300">
        {KIND_TR[local?.kind ?? next.globalKind]} tutulma · {centralProvinces(next).length} il merkezinden
      </p>
      <p className="mt-3 inline-block rounded-full bg-amber-400/20 px-3 py-1 text-sm font-medium text-amber-100">
        {years > 0 ? `${years} yıl ${Math.round(days - years * 365.25)} gün sonra` : `${days} gün sonra`}
      </p>
    </div>
  );
}

/** Gelecekteki tam ve halkalı tutulmalar: veri dosyasından, il listesi ve en uzun süreyle. Günde bir yenilenir. */
async function FutureCentral() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const list = TURKEY_ECLIPSES.filter((e) => e.peak > now && centralProvinces(e).length > 0);
  return (
    <ol className="mt-6 space-y-3">
      {list.map((e) => {
        const provinces = names(e);
        const best = longest(e);
        const kind = e.local.find((v) => v && v.kind !== "partial")!.kind;
        return (
          <li key={e.id} className="flex gap-4 rounded-2xl bg-[#05070d] p-5 text-white">
            <span className="shrink-0">
              <EclipseDisc separation={0} ratio={kind === "total" ? 1.04 : 0.94} size={56} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{KIND_TR[kind]} güneş tutulması</p>
              <p className="mt-0.5 text-lg font-semibold">{dateText(e.peak)}</p>
              <p className="mt-1 text-sm text-zinc-300">
                {provinces.length} il merkezi: {provinces.join(", ")}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                En uzun: {best.name}, {durationText(best.seconds)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
