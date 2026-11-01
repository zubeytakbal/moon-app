import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { getMoonPhase, getUpcomingPrincipalPhases, PHASE_NAMES_TR, type PhaseKey } from "@moon-app/moon";
import Link from "next/link";
import { Faq } from "@/components/Faq";
import { FAQS } from "@/lib/faqs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { OrbitDiagram } from "@/components/OrbitDiagram";
import { PhaseModel } from "@/components/PhaseModel";
import { Prose } from "@/components/Prose";
import { AnswerBox, DataTable } from "@/components/InfoTables";
import { Byline } from "@/components/Byline";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { NasaFigure } from "@/components/NasaFigure";
import { IMAGES } from "@/lib/images";

const PAGE = PAGES.ayEvreleri;
/** İçerik son kez elle güncellendiğinde değiştirilir. */
const CONTENT_UPDATED = "2026-11-01";
const src = pageSources("nasaMoonPhases", "nasaPhaseCatalog", "nasaMoonFactSheet");

export const metadata: Metadata = {
  title: `Ay Evreleri Nedir? 8 Evrenin Adı, Sırası ve Anlamı | ${siteConfig.name}`,
  description:
    "Ay evreleri nasıl oluşur? Yeni aydan dolunaya 8 evrenin adı, sırası, ay yaşı ve görünüşü. Bir döngü kaç gün sürer, Türkiye'den ay hangi taraftan dolar? Önümüzdeki evre tarihleri.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

/** Evre tablosu. Yaş ve oran aralıkları yaklaşık, ortalama bir döngüye göredir. */
const PHASE_ROWS: { key: PhaseKey; angle: number; age: string; lit: string; look: string }[] = [
  { key: "new-moon", angle: 0, age: "0", lit: "%0", look: "Görünmez. Ay, Güneş ile aynı yöndedir." },
  {
    key: "waxing-crescent",
    angle: 45,
    age: "1-6",
    lit: "%1-49",
    look: "Akşam batıda ince bir yay, sağ tarafı aydınlık.",
  },
  { key: "first-quarter", angle: 90, age: "~7,4", lit: "%50", look: "Sağ yarısı aydınlık yarım daire." },
  { key: "waxing-gibbous", angle: 135, age: "8-14", lit: "%51-99", look: "Dolunaya az kalmış, sol kenarı hâlâ eksik." },
  { key: "full-moon", angle: 180, age: "~14,8", lit: "~%100", look: "Tamamen yuvarlak, gün batımında doğar." },
  { key: "waning-gibbous", angle: 225, age: "16-21", lit: "%99-51", look: "Sağ kenarından eksilmeye başlamış." },
  { key: "last-quarter", angle: 270, age: "~22,1", lit: "%50", look: "Sol yarısı aydınlık yarım daire." },
  {
    key: "waning-crescent",
    angle: 315,
    age: "23-29",
    lit: "%49-1",
    look: "Sabaha karşı doğuda ince bir yay, sol tarafı aydınlık.",
  },
];

export default function MoonPhasesPage() {
  return (
    <>
      <section className="starfield bg-[#05070d] text-white">
        <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:pb-16">
          <Breadcrumb page={PAGE} tone="dark" />
          <h1 className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Ay Evreleri Nedir?</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300">
            Ay her gece biraz farklı görünür: ince bir hilalden yarım daireye, oradan dolunaya ve tekrar geriye. Bu
            sayfada bu değişimin nedenini, sekiz evrenin adını ve sırasını anlatıyoruz.
          </p>
          <Byline updated={CONTENT_UPDATED} />
          <ol className="mt-10 grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-8" aria-label="Ayın 8 evresi">
            {PHASE_ROWS.map((row) => (
              <li key={row.key}>
                <Link
                  href={PHASE_PAGE[row.key]}
                  className="group flex flex-col items-center text-center transition hover:-translate-y-0.5"
                >
                  <MoonPhaseIcon phaseAngle={row.angle} size={88} title={PHASE_NAMES_TR[row.key]} />
                  <span className="mt-2 text-xs leading-tight text-zinc-300 group-hover:text-white sm:text-sm">
                    {PHASE_NAMES_TR[row.key]}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <QuickLinks
        links={[
          { href: "#cevap", label: "Ay şu an hangi evrede?" },
          { href: "#nasil-olusur", label: "Nasıl oluşur?" },
          { href: "#sekiz-evre", label: "8 evre tablosu" },
          { href: "#kac-gun", label: "Kaç gün sürer?" },
          { href: "#hangi-taraf", label: "Hangi taraftan dolar?" },
          { href: "#sss", label: "Sık sorulanlar" },
        ]}
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <PhasesAnswer />

        <Prose>
          <h2 id="nasil-olusur">Ay evreleri nasıl oluşur?</h2>
          <p>
            Güneş, ayın her zaman bir yarısını aydınlatır.{src.ref("nasaMoonPhases")} Tıpkı Dünya&apos;da olduğu gibi ayda da bir gündüz yarısı ve
            bir gece yarısı vardır. Ay Dünya&apos;nın etrafında dönerken biz bu gündüz yarısının bazen tamamını, bazen
            bir kısmını, bazen de hiçbir yerini göremeyiz.
          </p>
          <p>
            Ay, Güneş ile Dünya&apos;nın arasındayken aydınlık yarısı bize ters düşer ve ayı göremeyiz. Buna{" "}
            <strong>yeni ay</strong> denir. Ay yörüngesinde ilerledikçe aydınlık yarının giderek daha büyük bir kısmı
            görünür hale gelir. Ay Dünya&apos;nın Güneş&apos;e göre tam arka tarafına geldiğinde aydınlık yarının
            tamamını görürüz. Bu da <strong>dolunaydır</strong>. Sonra aynı yol geriye doğru izlenir.
          </p>
        </Prose>

        <OrbitDiagram />
        <TodayPhaseModel />

        <Prose>
          <p>
            Sık yapılan bir yanılgı, ayın karanlık kısmının Dünya&apos;nın gölgesi olduğunu düşünmektir. Öyle değildir.
            Dünya&apos;nın gölgesi aya yalnızca ay tutulmalarında düşer ve bu durum yılda en fazla birkaç kez, sadece
            dolunay sırasında yaşanır. Evrelerde gördüğümüz karanlık kısım, ayın o an gece yaşayan tarafıdır.
          </p>

          <NasaFigure images={[IMAGES.earthrise]} />

          <h2 id="sekiz-evre">Ayın 8 evresi</h2>
          <p>
            Bir ay döngüsünde dört <strong>ana evre</strong> ve aralarında dört <strong>ara evre</strong> bulunur.
            Aşağıdaki tabloda evreler sırasıyla yer alıyor. Ay yaşı, son yeni aydan bu yana geçen gün sayısıdır.
          </p>
        </Prose>

        <PhaseTable />

        <Prose>
          <h2>Ana evreler bir an, ara evreler bir dönemdir</h2>
          <p>
            Yeni ay, ilk dördün, dolunay ve son dördün aslında tek bir andır. Örneğin dolunay, ayın Güneş&apos;in tam
            karşısına geldiği dakikadır. Takvimlerde bu anın düştüğü günün tamamı &quot;dolunay günü&quot; olarak
            gösterilir. Hilal ve şişkin ay ise ana evreler arasındaki yaklaşık bir haftalık dönemlerin adıdır.
          </p>
          <p>
            Gözle bakıldığında fark biraz daha esnektir. Ay, dolunaydan bir gün önce ve bir gün sonra da neredeyse
            yuvarlak görünür. Bu yüzden &quot;dolunay üç gün sürer&quot; denir. Astronomik olarak ise dolunay tek bir
            andır.
          </p>

          <h2 id="kac-gun">Bir ay döngüsü kaç gün sürer?</h2>
          <p>
            İki yeni ay arasında ortalama <strong>29 gün 12 saat 44 dakika</strong> (29,53 gün) geçer.{src.ref("nasaPhaseCatalog")} Buna
            sinodik ay denir. Ancak her döngü aynı uzunlukta değildir. Ayın Dünya etrafındaki yörüngesi tam bir daire değil, hafif
            bir elips olduğu için hızı değişir. 2000-2100 yılları arasındaki bütün döngüleri hesapladık: en kısası 29,27
            gün, en uzunu 29,82 gün sürüyor.
          </p>
          <p>
            Ay, Dünya&apos;nın etrafındaki asıl turunu aslında daha kısa sürede, yaklaşık 27,3 günde tamamlar.{src.ref("nasaMoonFactSheet")} Fakat bu
            sürede Dünya da Güneş&apos;in etrafında ilerlediği için ayın Güneş&apos;e göre aynı konuma gelmesi iki gün
            kadar daha sürer. Evreleri belirleyen de Güneş&apos;e göre konumdur.
          </p>

          <h2 id="hangi-taraf">Türkiye&apos;den bakınca ay hangi taraftan dolar?</h2>
          <p>
            Türkiye kuzey yarımkürededir. Buradan bakıldığında ay <strong>sağ taraftan dolmaya başlar</strong>: büyüyen
            hilalin ve ilk dördünün sağ tarafı aydınlıktır. Dolunaydan sonra yine <strong>sağ taraftan eksilir</strong>:
            küçülen ayın aydınlık kısmı sol tarafta kalır.
          </p>
          <p>
            Kısacası, ayın sağ tarafı aydınlıksa ay büyüyor, sol tarafı aydınlıksa küçülüyor demektir. Akşam saatlerinde
            batı ufkunda görülen ince hilal her zaman büyüyen hilaldir. Sabaha karşı doğuda görülen ise küçülen
            hilaldir.
          </p>

          <h3>Güney yarımkürede tersi geçerli</h3>
          <p>
            Avustralya, Güney Afrika ya da Arjantin gibi güney yarımküre ülkelerinden bakıldığında ay baş aşağı görünür.
            Bu yüzden orada büyüyen ayın sol tarafı aydınlıktır. Ekvatora yakın ülkelerde ise hilal yana yatmış, bir
            kayık gibi görünür.
          </p>

          <h2>Ay evreleri ve takvimler</h2>
          <p>
            Ay evreleri insanlığın ilk takvimlerinden biridir. &quot;Ay&quot; kelimesinin hem gökteki cismi hem de bir
            takvim ayını anlatması bundandır. Bugün de Hicri takvimde her ay, yeni aydan sonra hilalin görülmesiyle
            başlar. Ramazan&apos;ın başlangıcı ve bayram tarihleri bu yüzden her yıl yaklaşık 11 gün öne kayar.
          </p>
          <p>
            Bugün ayın hangi evrede olduğunu, kaç günlük olduğunu ve bulunduğunuz ilde ne zaman doğacağını görmek için{" "}
            <Link href={PAGES.bugunAy.path}>Bugün Ay Nasıl?</Link> sayfasına bakabilirsiniz.
          </p>

        </Prose>
        <Faq items={FAQS.ayEvreleri} />
        <ArticleFooter
          page={PAGE}
          headline="Ay Evreleri Nedir? 8 Evrenin Adı, Sırası ve Anlamı"
          updated={CONTENT_UPDATED}
          src={src}
        />
      </main>
    </>
  );
}

/** Her evrenin kendi sayfası (iki hilal aynı sayfada anlatılır). */
const PHASE_PAGE: Record<PhaseKey, string> = {
  "new-moon": PAGES.yeniAy.path,
  "waxing-crescent": PAGES.hilal.path,
  "first-quarter": PAGES.ilkDordun.path,
  "waxing-gibbous": PAGES.buyuyenSiskinAy.path,
  "full-moon": PAGES.dolunay.path,
  "waning-gibbous": PAGES.kuculenSiskinAy.path,
  "last-quarter": PAGES.sonDordun.path,
  "waning-crescent": PAGES.hilal.path,
};

/** 8 evre tablosu (timeanddate düzeni): sıra, evre (sayfasına bağlantı), ay yaşı, aydınlık oranı, görünüşü. */
function PhaseTable() {
  return (
    <DataTable
      columns={["Sıra", "Evre", "Ay yaşı (gün)", "Aydınlık", "Türkiye'den görünüşü"]}
      rows={PHASE_ROWS.map((row, i) => ({
        key: row.key,
        cells: [
          <span key="i" className="tabular-nums">{i + 1}</span>,
          <Link key="e" href={PHASE_PAGE[row.key]} className="flex items-center gap-2.5 font-semibold underline-offset-2 hover:underline">
            <span className="shrink-0 rounded-full bg-[#05070d] p-1">
              <MoonPhaseIcon phaseAngle={row.angle} size={30} title="" />
            </span>
            <span className="whitespace-nowrap">{PHASE_NAMES_TR[row.key]}</span>
          </Link>,
          <span key="y" className="whitespace-nowrap tabular-nums">{row.age}</span>,
          <span key="a" className="whitespace-nowrap tabular-nums">{row.lit}</span>,
          <span key="g" className="text-zinc-600 dark:text-zinc-400">{row.look}</span>,
        ],
      }))}
    />
  );
}

/** Şu anki evre ve önümüzdeki ana evreler. Saatte bir yenilenir. */
/** Etkileşimli model bugünün evresiyle açılır; saatte bir yenilenir. */
async function TodayPhaseModel() {
  "use cache";
  cacheLife("hours");
  return <PhaseModel todayAngle={getMoonPhase(new Date(), siteConfig.defaultLocation.timeZone).phaseAngle} />;
}

/** Sayfanın sorusunun cevabı, en üstte (timeanddate düzeni): tanım, şu anki evre, önümüzdeki ana evreler. Saatte bir yenilenir. */
async function PhasesAnswer() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const timeZone = siteConfig.defaultLocation.timeZone;
  const phase = getMoonPhase(now, timeZone);
  const upcoming = getUpcomingPrincipalPhases(now, 4);
  const fmt = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AnswerBox
      question="Ay evreleri nedir?"
      answer={
        <>
          Ay evreleri, ayın Güneş&apos;le aydınlanan yarısını ay Dünya&apos;nın etrafında dönerken farklı açılardan
          görmemizle oluşan 8 görünüştür. Ay şu an <Link href={PHASE_PAGE[phase.key]} className="underline underline-offset-4">{phase.name}</Link>{" "}
          evresinde.
        </>
      }
      rows={[
        { label: "Şu an", value: `${phase.name}, %${Math.round(phase.illumination * 100)} aydınlık` },
        ...upcoming.map((p) => ({
          label: p.name,
          value: <time dateTime={p.date.toISOString()}>{fmt.format(p.date)}</time>,
        })),
        { label: "Bir döngü", value: "Ortalama 29 gün 12 saat 44 dakika (yeni aydan yeni aya)" },
        {
          label: "Sırası",
          value: "Yeni ay, büyüyen hilal, ilk dördün, büyüyen şişkin ay, dolunay, küçülen şişkin ay, son dördün, küçülen hilal",
        },
      ]}
      note={
        <>
          Saatler Türkiye saatidir. Günlük ayrıntı için <Link href={PAGES.bugunAy.path} className="underline underline-offset-2">Bugün Ay</Link>,
          ay ay bütün evreler için <Link href={PAGES.ayTakvimi.path} className="underline underline-offset-2">Ay Takvimi</Link>.
        </>
      }
    />
  );
}
