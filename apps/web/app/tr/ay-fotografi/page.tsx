import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  findProvince,
  getMoonDistanceKm,
  getMoonPhase,
  getMoonRiseSet,
  getSunDay,
  TURKEY_PROVINCES,
} from "@moon-app/moon";
import { AnswerBox } from "@/components/InfoTables";
import { CitySelect } from "@/components/CitySelect";
import { Faq } from "@/components/Faq";
import { MoonPhotoCalculator } from "@/components/MoonPhotoCalculator";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { FAQS } from "@/lib/faqs";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.ayFotografi;
const UPDATED = "2026-11-04";
const src = pageSources("nasaPhotoGuide", "samsungMoon");
const timeZone = siteConfig.defaultLocation.timeZone;
const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));
/** Ay doğuşu/batışı gün batımına/doğumuna bu kadar yakınsa gökyüzü alacakaranlıktadır: manzarayla birlikte en güzel kare. */
const TWILIGHT_MINUTES = 60;

export const metadata: Metadata = {
  title: `Ay Fotoğrafı Nasıl Çekilir? Telefonla Ay Fotoğrafı Ayarları (iPhone, Samsung) | ${siteConfig.name}`,
  description:
    "Telefonla net ay fotoğrafı nasıl çekilir? iPhone, Samsung ve Xiaomi için adım adım ayarlar, ay neden beyaz leke çıkar, Samsung'un ay fotoğrafı gerçek mi? Bu gece ilinizde en iyi saat, ayın karede ne kadar büyük çıkacağı ve yıldız fotoğrafı için 500 kuralı hesaplayıcı.",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function MoonPhotoPage({ searchParams }: PageProps<"/tr/ay-fotografi">) {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={110}
        eyebrow="Ay Bilgisi"
        lead="Ay fotoğrafı telefonda çoğu zaman bulanık, beyaz bir lekeye dönüşür. Sorun telefonda değil, ayarlarda: ay, gökyüzüne göre çok parlaktır. Birkaç dokunuşla kraterleri bile seçebilirsiniz."
        aside={
          <div className="rounded-2xl border border-white/15 bg-black/40 p-5 text-sm text-zinc-200 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Üç altın kural</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Telefonu sabitleyin.</li>
              <li>Aya dokunarak odaklayın.</li>
              <li>Ay gri görünene kadar parlaklığı düşürün.</li>
            </ol>
          </div>
        }
        updated={UPDATED}
      />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Kısaca nasıl?" },
          { href: "#bu-gece", label: "Bu gece" },
          { href: "#hesaplayici", label: "Hesaplayıcı" },
          { href: "#telefonla", label: "iPhone, Samsung" },
          { href: "#samsung", label: "Samsung gerçek mi?" },
          { href: "#makine", label: "Fotoğraf makinesi" },
          { href: "#sss", label: "Sık sorulanlar" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <PhotoAnswer />
        </div>

        <Suspense fallback={<TonightSection slug={siteConfig.defaultLocation.slug} />}>
          <SelectedTonight searchParams={searchParams} />
        </Suspense>

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2 id="telefonla">Telefonla ay fotoğrafı: adım adım</h2>
            <p>
              Telefonun otomatik ayarı kareyi bütün olarak değerlendirir: gökyüzü kapkaranlık olduğu için pozlamayı
              artırır ve ayı patlatır. Çözüm, telefona ölçümü aya göre yaptırmak ve parlaklığı elle düşürmektir. NASA&apos;nın önerisi
              de budur: ay beyaz değil, gri görünmeli.{src.ref("nasaPhotoGuide")}
            </p>
            <ol className="list-decimal space-y-1 pl-6">
              <li>
                <strong>Telefonu sabitleyin.</strong> Tripod yoksa telefonu bir duvara, arabanın tavanına ya da bir
                kitaba dayayın. Elinizin titremesi, yakınlaştırınca en büyük düşmandır.
              </li>
              <li>
                <strong>Flaşı kapatın, aya dokunarak odaklayın.</strong>
                {src.ref("nasaPhotoGuide")}
              </li>
              <li>
                <strong>Parlaklığı düşürün.</strong> Ay beyaz bir daire olmaktan çıkıp üzerindeki koyu lekeler (ay
                denizleri) belirene kadar.
              </li>
              <li>
                <strong>Optik yakınlaştırmayı kullanın.</strong> Telefonunuzda 3x ya da 5x gibi ayrı bir telefoto
                kamera varsa onu seçin; daha ötesi dijital büyütmedir ve ayrıntı eklemez, yalnız görüntüyü büyütür.
              </li>
              <li>
                <strong>Zamanlayıcıyla çekin.</strong> Deklanşöre dokunmak telefonu sarsar; 3 saniyelik zamanlayıcı bunu
                önler.{src.ref("nasaPhotoGuide")}
              </li>
            </ol>

            <h3>iPhone&apos;da</h3>
            <p>
              Kamerayı açın ve en yüksek optik yakınlaştırmayı (modelinize göre 2x, 3x ya da 5x) seçin. Ekranda aya
              dokunup basılı tutun; &quot;AE/AF Kilidi&quot; yazısı çıkınca odak ve pozlama sabitlenir. Ardından
              parmağınızı aşağı kaydırarak parlaklığı düşürün. Gece modu ayda genellikle işe yaramaz, çünkü ay zaten
              parlaktır; gece modu simgesi sarıysa kapatın. Live Photo kapalı olursa kare daha keskin olur.
            </p>
            <h3>Samsung&apos;da</h3>
            <p>
              Galaxy telefonlarda kamera ayı otomatik tanır ve yüksek yakınlaştırmada ekranda yardımcı bir çerçeve
              gösterir; telefonu yatay tutup iki elle sabitlemek ve çerçeve sarıya döndüğünde çekmek önerilir.
              {src.ref("samsungMoon")} Ayarları kendiniz yönetmek isterseniz &quot;Pro&quot; modunda ISO&apos;yu
              100&apos;e indirip enstantaneyi 1/125 ile 1/500 saniye arasında deneyin.
            </p>
            <h3>Xiaomi, Redmi ve diğer Android telefonlarda</h3>
            <p>
              &quot;Pro&quot; (manuel) modunu açın: ISO&apos;yu 100 civarına indirin, enstantaneyi 1/250 saniyeden
              başlatın, odağı elle sonsuza (dağ ya da ∞ simgesi) alın. Ay hâlâ beyazsa enstantaneyi kısaltın
              (1/500, 1/1000), çok karanlıksa uzatın.{src.ref("nasaPhotoGuide")}
            </p>

            <h2 id="bulanik">Ay neden bulanık ya da beyaz bir leke çıkıyor?</h2>
            <ul>
              <li>
                <strong>Beyaz leke:</strong> Pozlama çok fazla. Parlaklığı düşürün ya da enstantaneyi kısaltın.
              </li>
              <li>
                <strong>Bulanık:</strong> Ya telefon titriyor ya da odak gökyüzünde. Telefonu sabitleyin, aya dokunarak
                odaklayın, zamanlayıcı kullanın.
              </li>
              <li>
                <strong>Çok küçük:</strong> Ay gökyüzünde sanıldığından çok küçüktür (yaklaşık yarım derece). Ana
                kamerayla karenin genişliğinin %1&apos;inden azını kaplar; yukarıdaki hesaplayıcıda yakınlaştırmaya göre ne kadar
                büyüdüğünü görebilirsiniz.
              </li>
              <li>
                <strong>Titrek, dalgalı:</strong> Ay ufka yakınken ışığı kalın bir hava tabakasından geçer. Ay yükseldikçe
                görüntü netleşir.
              </li>
            </ul>

            <h2 id="samsung">Samsung&apos;un ay fotoğrafı gerçek mi?</h2>
            <p>
              Kısmen. Samsung&apos;un kendi açıklamasına göre Galaxy S21 serisinden beri kamera ayı bir nesne olarak
              tanır. Çekimde 10&apos;dan fazla kareyi birleştirir (süper çözünürlük), ardından derin öğrenmeye dayalı
              bir yapay zekâ &quot;ayrıntı geliştirme motoru&quot; gürültüyü siler ve ayrıntıyı güçlendirir; arka planı
              da karartarak ayı belirginleştirir.{src.ref("samsungMoon")} Yani sonuç, sensörün o an yakaladığı ışıkla
              yapay zekânın ayın nasıl görünmesi gerektiği bilgisinin birleşimidir. Yapay zekâ desteği olmadan çekmek
              isteyenler için Samsung, kamera ayarlarından &quot;Sahne Optimize Edici&quot;nin (Scene Optimiser)
              kapatılabileceğini belirtir.{src.ref("samsungMoon")}
            </p>

            <h2 id="makine">Fotoğraf makinesiyle: Looney 11 kuralı</h2>
            <p>
              Fotoğraf makinesinde ayı manuel modda çekin. Başlangıç noktası, fotoğrafçıların &quot;Looney 11&quot; dediği
              kuraldır: diyaframı f/11&apos;e ayarlayın, ISO ile enstantaneyi aynı yapın; örneğin ISO 100&apos;de 1/100
              saniye.{src.ref("nasaPhotoGuide")} Bu ayar dolunay içindir; ay inceldikçe aydınlık yüzey azalır ve
              pozlamayı artırmak gerekir. Hesaplayıcı bu gecenin evresine göre başlangıç diyaframını öneriyor. Tripod,
              uzaktan deklanşör ya da zamanlayıcı ve görüntü sabitlemenin tripodda kapatılması keskinliği belirgin
              artırır.
            </p>
            <p>
              Ayın fotoğrafta büyük çıkması için uzun odak gerekir: 200 mm&apos;lik bir lensle ay karede hâlâ küçüktür,
              ayrıntı için 400 mm ve üstü idealdir. Teleskopla çekilen ay fotoğrafları için yine kısa pozlama ve düşük ISO
              geçerlidir.
            </p>

            <h2>Yıldız fotoğrafı: 500 kuralı</h2>
            <p>
              Dünya döndüğü için yıldızlar gökyüzünde yavaşça kayar; pozlama uzun olursa nokta yerine çizgi gibi çıkarlar.
              Fotoğrafçıların &quot;500 kuralı&quot;na göre bir yıldız fotoğrafının en uzun pozlaması, 500&apos;ün 35 mm
              eşdeğeri odak uzaklığına bölümüdür (saniye): 20 mm geniş açı lensle 25 saniye, 50 mm&apos;lik lensle 10
              saniye. Hesaplayıcı bunu sizin lensinize göre veriyor. Yıldız fotoğrafı için ayın gökyüzünde olmadığı karanlık
              geceleri <Link href={PAGES.yeniAy.path}>Yeni Ay</Link> sayfasındaki planlayıcıdan bulabilirsiniz.
            </p>

            <h2>Tutulma, süper ay ve dolunay fotoğrafı</h2>
            <p>
              Ay tutulmasında ay giderek karardığı için pozlamayı adım adım artırmak gerekir; kızıl evrede ay dolunaydan
              binlerce kez daha sönüktür ve tripod şarttır. Süper ay ya da dolunay en etkileyici, ufuktan yeni
              doğarken bir binanın, minarenin ya da dağın yanında çekildiğinde görünür; ilinizde dolunayın saat kaçta ve
              hangi yönden doğacağını <Link href={PAGES.dolunay.path}>Dolunay</Link> sayfasında, tutulma tarihlerini{" "}
              <Link href={PAGES.ayTutulmalari.path}>Ay Tutulmaları</Link> sayfasında bulabilirsiniz.
            </p>
          </Prose>
          <Faq items={FAQS.ayFotografi} />
          <ArticleFooter
            page={PAGE}
            headline="Ay Fotoğrafı Nasıl Çekilir? Telefonla Ay Fotoğrafı Ayarları"
            updated={UPDATED}
            src={src}
          />
        </div>
      </main>
    </>
  );
}

/** Sayfanın sorusunun cevabı, en üstte: beş adım ve bu gece İstanbul için kısa not. Saatte bir yenilenir. */
async function PhotoAnswer() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const phase = getMoonPhase(now, timeZone);
  return (
    <AnswerBox
      question="Telefonla ay fotoğrafı nasıl çekilir?"
      answer="Telefonu sabitleyin, optik yakınlaştırmayı seçin, aya dokunarak odaklayın ve ay beyaz değil gri görünene kadar parlaklığı düşürün; zamanlayıcıyla çekin."
      rows={[
        { label: "En sık hata", value: "Parlaklığı düşürmemek: ay beyaz bir leke olarak çıkar." },
        { label: "En iyi zaman", value: "Ay alacakaranlıkta, gökyüzünden çok parlak değilken; ya da ay yükseldikten sonra." },
        { label: "Fotoğraf makinesiyle", value: "f/11, ISO 100, 1/100 sn ile başlayın (Looney 11 kuralı)." },
        {
          label: "Bu gece ay",
          value: `${phase.name}, %${Math.round(phase.illumination * 100)} aydınlık`,
        },
        {
          label: "Kraterler için en iyi evre",
          value: (
            <>
              Dolunay değil, dördün ve hilal: gölgeler kraterleri belirginleştirir.{" "}
              <Link href={PAGES.ilkDordun.path} className="underline underline-offset-2">
                İlk dördün
              </Link>
            </>
          ),
        },
      ]}
      note={
        <>
          Telefon ve fotoğraf makinesi ayarları NASA&apos;nın ay fotoğrafçılığı rehberine dayanır.{src.ref("nasaPhotoGuide")}{" "}
          İlinizde bu gece ayın saatlerini ve ayın karede ne kadar büyük çıkacağını{" "}
          <a href="#bu-gece" className="underline underline-offset-2">
            aşağıda
          </a>{" "}
          görebilirsiniz.
        </>
      }
    />
  );
}

async function SelectedTonight({ searchParams }: Pick<PageProps<"/tr/ay-fotografi">, "searchParams">) {
  const { il } = await searchParams;
  const city = findProvince(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
  return <TonightSection slug={city.slug} />;
}

/**
 * "Bu gece ay fotoğrafı": seçilen ilde ayın doğuş/batışı, gün batımı ve doğumuna göre alacakaranlık fırsatı, ve
 * hesaplayıcı (bu gecenin aydınlık oranı ve ayın görünen çapıyla). Saatte bir yenilenir.
 */
async function TonightSection({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = findProvince(slug) ?? siteConfig.defaultLocation;
  const now = new Date();
  const phase = getMoonPhase(now, timeZone);
  const moon = getMoonRiseSet(now, city);
  const sun = getSunDay(now, city);
  const km = getMoonDistanceKm(now);
  const diameterDeg = (2 * Math.atan(1737.4 / km) * 180) / Math.PI;
  const t = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const near = (a: Date | null, b: Date | null) => !!a && !!b && Math.abs(a.getTime() - b.getTime()) <= TWILIGHT_MINUTES * 60_000;
  const eveningTwilight = near(moon.rise, sun.set);
  const morningTwilight = near(moon.set, sun.rise);

  return (
    <section aria-labelledby="bu-gece" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Bu gece ay fotoğrafı</p>
          <h2 id="bu-gece" className="mt-1 scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
            {city.name}: {phase.name}, %{Math.round(phase.illumination * 100)} aydınlık
          </h2>
        </div>
        <CitySelect action={PAGE.path} options={CITY_OPTIONS} selected={city.slug} />
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Ay doğuşu", moon.rise ? t.format(moon.rise) : "bugün yok"],
          ["Ay batışı", moon.set ? t.format(moon.set) : "bugün yok"],
          ["Gün batımı", sun.set ? t.format(sun.set) : "-"],
          ["Gün doğumu", sun.rise ? t.format(sun.rise) : "-"],
        ].map(([label, value]) => (
          <li key={label} className="rounded-2xl bg-[#05070d] p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{label}</p>
            <p className="mt-1 text-2xl font-light tabular-nums">{value}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        {eveningTwilight
          ? `Bu akşam ay gün batımına yakın doğuyor (${t.format(moon.rise!)}): ufuktaki ayı manzarayla birlikte, gökyüzü henüz tam kararmadan çekmek için ideal bir akşam.`
          : morningTwilight
            ? `Bu sabah ay gün doğumuna yakın batıyor (${t.format(moon.set!)}): batı ufkunda alacakaranlıkta manzaralı bir kare için iyi bir fırsat.`
            : phase.illumination < 0.05
              ? "Ay bu günlerde Güneş'e çok yakın; fotoğraf için birkaç gün bekleyin. Bu karanlık geceler ise yıldız fotoğrafı için idealdir."
              : "Ay gökyüzündeyken ufuktan yükselmesini bekleyin: yükseldikçe görüntü netleşir. Kraterleri seçmek için dördün ve hilal evreleri en iyisidir."}
      </p>

      <h3 id="hesaplayici" className="mt-8 scroll-mt-32 text-xl font-semibold">
        Hesaplayıcı: ay karede ne kadar büyük çıkar, hangi ayarla çekilir?
      </h3>
      <MoonPhotoCalculator illumination={phase.illumination} moonDiameterDeg={diameterDeg} />
    </section>
  );
}
