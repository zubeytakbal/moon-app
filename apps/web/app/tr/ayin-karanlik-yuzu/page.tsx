import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonPhase, getNextNewMoon } from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Faq } from "@/components/Faq";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { NasaFigure } from "@/components/NasaFigure";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { FAQS } from "@/lib/faqs";
import { IMAGES } from "@/lib/images";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { TwoFaces, type FaceSample } from "./TwoFaces";

const PAGE = PAGES.ayinKaranlikYuzu;
const UPDATED = "2026-10-29";
const timeZone = siteConfig.defaultLocation.timeZone;
const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

export const metadata: Metadata = {
  title: `Ayın Karanlık Yüzü: Gerçekten Karanlık mı, Neden Göremiyoruz? | ${siteConfig.name}`,
  description:
    "Ayın karanlık (arka) yüzü aslında karanlık değil. Şu an yüzde kaçı aydınlık, neden Dünya'dan hiç görünmez, orada ne var ve onu kimler gördü?",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

const dateTime = new Intl.DateTimeFormat(siteConfig.locale, {
  timeZone,
  day: "numeric",
  month: "long",
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export default function DarkSidePage() {
  return (
    <>
      <Hero />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>
              &quot;Karanlık yüz&quot;, ayın Dünya&apos;dan hiç görünmeyen arka yüzüdür. Adı yanıltıcıdır: o da ön yüz
              kadar Güneş ışığı alır.
            </li>
            <li>
              Biz ayı göremediğimiz yeni ay gecelerinde, arka yüzün tamamı gündüzdür. Dolunayda ise arka yüzün tamamı
              gecedir.
            </li>
            <li>
              Ay kendi çevresindeki bir turunu, Dünya çevresindeki turuyla aynı sürede tamamlar; bu yüzden bize hep aynı
              yüzünü gösterir.
            </li>
          </QuickFacts>
        </div>

        <TwoFacesSection />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Neden &quot;karanlık&quot; deniyor?</h2>
            <p>
              Eski dilde &quot;karanlık&quot;, ışıksız değil &quot;bilinmeyen&quot; anlamında da kullanılırdı. Ayın arka
              yüzünü 1959&apos;a kadar hiçbir insan görmemişti; orada ne olduğu tam anlamıyla bir karanlıktı. Ad bu
              yüzden kaldı ve 1973&apos;te Pink Floyd&apos;un ünlü albümü, 2011&apos;de de Transformers filminin Türkçe
              adıyla iyice yaygınlaştı. Gökbilimciler ise yanlış anlaşılmasın diye &quot;arka yüz&quot; ya da &quot;uzak
              yüz&quot; demeyi tercih eder.
            </p>
            <p>
              Güneş ayı tıpkı Dünya&apos;yı aydınlattığı gibi her zaman yarım küre olarak aydınlatır. Ay döndükçe bu
              aydınlık yarım küre ayın yüzeyinde dolaşır; ayın her noktası yaklaşık iki hafta gündüz, iki hafta gece
              yaşar. Ön yüzde gece olduğunda arka yüzde gündüz olur. Yukarıdaki iki görsel bu yüzden hep birbirinin tersi
              aydınlıktır: ikisinin aydınlık oranlarının toplamı her zaman %100&apos;dür.
            </p>

            <h2>Arka yüzü neden hiç göremiyoruz?</h2>
            <p>
              Ay, Dünya çevresindeki bir turunu yaklaşık 27,3 günde tamamlar; kendi ekseni etrafındaki bir turu da tam
              olarak bu kadar sürer. Bu eşitlik bir rastlantı değildir. Dünya&apos;nın çekim kuvveti ayı hafifçe uzatarak
              bir yumurta gibi şişirir; milyarlarca yıl boyunca bu şişkinliği çeken Dünya, ayın dönüşünü yavaşlatarak
              yörüngesiyle aynı hıza kilitlemiştir. Gökbilimciler buna <strong>eş zamanlı dönme</strong> (kütle çekimsel
              kilitlenme) der.
            </p>
          </Prose>
          <TidalLockDiagram />
          <Prose>
            <p>
              Sonuç olarak ay Dünya&apos;nın çevresinde dolanırken bize dönük yüzünü de çevirir: tıpkı bir masanın
              çevresinde, yüzünü hep masaya dönerek yürüyen biri gibi. Masadakiler o kişinin sırtını hiç görmez, ama
              odadaki bir pencereden bakan biri onun her yanını görür.
            </p>

            <h2>Ayın yüzde kaçını görüyoruz?</h2>
            <p>
              Ayın tam yarısını değil, zaman içinde <strong>yaklaşık %59&apos;unu</strong> görebiliriz. Ayın yörüngesi
              tam bir çember değildir ve ekseni yörüngesine göre biraz eğiktir; bu yüzden ay bize bir ay boyunca hafifçe
              sağa sola ve aşağı yukarı &quot;sallanıyormuş&quot; gibi görünür. Bu sallanmaya{" "}
              <strong>librasyon</strong> denir. Librasyon sayesinde arka yüzün kenarlarındaki ince bir şeridi zaman zaman
              görebiliriz.
            </p>
          </Prose>
          <LibrationBar />
          <Prose>
            <h2>Arka yüzde ne var?</h2>
            <p>
              Arka yüzün ilk fotoğrafları geldiğinde gökbilimciler şaşırdı: ön yüzü süsleyen büyük karanlık lekeler,
              yani eski lav akıntılarının doldurduğu &quot;ay denizleri&quot;, arka yüzde neredeyse yoktu. Arka yüz baştan
              sona kraterlerle kaplı, açık renkli, dağlık bir arazidir. Bunun en güçlü açıklaması, arka yüzdeki kabuğun
              ön yüzdekinden onlarca kilometre daha kalın olmasıdır; derinlerden yükselen lav bu kalın kabuğu çoğu yerde
              delip yüzeye çıkamamıştır.
            </p>
          </Prose>
          <NasaFigure images={[IMAGES.farSide]} />
          <Prose>
            <p>Arka yüzün en dikkat çekici yerleri:</p>
            <ul>
              <li>
                <strong>Güney Kutbu-Aitken havzası:</strong> Yaklaşık 2.500 kilometre genişliğinde ve 8 kilometreye varan
                derinliğiyle Güneş sisteminin bilinen en büyük çarpma çukurlarından biridir. Arka yüzün güney yarısını
                kaplar; görüntünün alt kısmındaki koyu lekeler onun içindedir.
              </li>
              <li>
                <strong>Moskova Denizi (Mare Moscoviense):</strong> Arka yüzdeki az sayıdaki karanlık ovadan biri. Adını,
                arka yüzü ilk fotoğraflayan Sovyet aracı Luna 3&apos;ün görüntülerini inceleyen Sovyet bilim insanları
                vermiştir; görüntünün sol üstündeki koyu lekedir.
              </li>
              <li>
                <strong>Tsiolkovsky krateri:</strong> Tabanı koyu lavla dolmuş, ortasında parlak bir tepe bulunan 180
                kilometrelik krater. Adını roket biliminin öncülerinden Konstantin Tsiolkovsky&apos;den alır.
              </li>
            </ul>
            <p>
              Arka yüzün bir özelliği daha var: Dünya&apos;nın radyo gürültüsünden ayın kendisi tarafından korunan,
              Güneş sisteminin en sessiz yerlerinden biridir. Bu yüzden gelecekte evrenin ilk dönemlerinden gelen zayıf
              radyo sinyallerini dinleyecek teleskoplar için en iyi aday yer olarak görülüyor.
            </p>

            <h2>Arka yüzü ilk kim gördü?</h2>
          </Prose>
          <Timeline />
          <NasaFigure images={[IMAGES.artemisFarSide]} />
          <Prose>
            <p>
              Aya insanlı yolculukları ve iniş yerlerini <Link href={PAGES.ayaYolculuk.path}>Aya Yolculuk</Link>{" "}
              sayfasındaki haritada görebilirsiniz; arka yüzdeki iki iniş de orada işaretli.
            </p>
          </Prose>

          <Faq items={FAQS.ayinKaranlikYuzu} />
          <ArticleFooter
            page={PAGE}
            headline="Ayın Karanlık Yüzü: Gerçekten Karanlık mı, Neden Göremiyoruz?"
            updated={UPDATED}
            sources={[
              { label: "NASA Scientific Visualization Studio, The Moon's Far Side", href: "https://svs.gsfc.nasa.gov/11747" },
              {
                label: "NASA Scientific Visualization Studio, Moon Phase and Libration, from the Other Side",
                href: "https://svs.gsfc.nasa.gov/4253",
              },
              { label: "NASA Science, Earth's Moon", href: "https://science.nasa.gov/moon/" },
            ]}
          />
        </div>
      </main>
    </>
  );
}

/** Giriş: arka yüzün şu anki hâli. Saatte bir yenilenir. */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const phase = getMoonPhase(now, timeZone);
  const far = 100 - Math.round(phase.illumination * 100);

  return (
    <section className="starfield relative overflow-hidden bg-[#05070d] text-white">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 pb-14 pt-6 md:grid-cols-[1fr_auto] md:pb-20">
        <div className="order-2 md:order-1">
          <Breadcrumb page={PAGE} tone="dark" />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Ay bilgisi</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-7xl">{PAGE.title}</h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-200">
            Ayın Dünya&apos;dan hiç görünmeyen yüzü aslında karanlık değil. Şu an orada gündüz mü, gece mi? Neden onu
            hiç göremiyoruz ve orada ne var?
          </p>
          <div className="mt-8 max-w-md rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Şu an ayın arka yüzü</p>
            <p className="mt-1 text-4xl font-extralight tabular-nums">%{far} aydınlık</p>
            <p className="mt-1 text-zinc-300">
              {far > 97
                ? "Arka yüzün tamamı gündüz: biz ayı göremiyoruz."
                : far < 3
                  ? "Arka yüzün tamamı gece: bizim için dolunay."
                  : far > 50
                    ? "Arka yüzün büyük kısmı gündüz."
                    : "Arka yüzün büyük kısmı gece."}
            </p>
            <a href="#iki-yuz" className="mt-3 inline-block text-sm text-zinc-300 underline hover:text-white">
              İki yüzü yan yana görün
            </a>
          </div>
        </div>
        <div className="order-1 flex justify-center md:order-2">
          <div className="w-[min(70vw,340px)]">
            <MoonPhaseIcon side="far" phaseAngle={phase.phaseAngle} size={340} glow title={`Ayın arka yüzü, şu an %${far} aydınlık`} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Ön ve arka yüz yan yana, önümüzdeki 30 gün (6 saatte bir örnek). Saatte bir yenilenir. */
async function TwoFacesSection() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const samples: FaceSample[] = [];
  for (let t = now.getTime(); t <= now.getTime() + 30 * DAY_MS; t += 6 * HOUR_MS) {
    const p = getMoonPhase(new Date(t), timeZone);
    samples.push({ t, phaseAngle: p.phaseAngle, illumination: p.illumination });
  }
  const newMoon = getNextNewMoon(now);
  const newMoonIndex = Math.round((newMoon.getTime() - now.getTime()) / (6 * HOUR_MS));

  return (
    <section aria-labelledby="iki-yuz" className="mt-12">
      <h2 id="iki-yuz" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Ayın iki yüzü, şu an
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Solda her gece gördüğümüz yüz, sağda hiç göremediğimiz arka yüz. Kaydırıcıyla günleri ilerletin: biri aydınlanırken
        öbürü kararır. Arka yüzün tamamen aydınlandığı bir sonraki an, yeni ay: {dateTime.format(newMoon)}.
      </p>
      <div className="mt-6">
        <TwoFaces samples={samples} newMoonIndex={newMoonIndex < samples.length ? newMoonIndex : -1} />
      </div>
    </section>
  );
}

/** Kendi çizimimiz: dönen ay hep aynı yüzünü gösterir; dönmeseydi her yanını görürdük. */
function TidalLockDiagram() {
  const positions = [0, 90, 180, 270];
  const panel = (title: string, locked: boolean, ox: number) => (
    <g transform={`translate(${ox} 0)`}>
      <text x="150" y="24" textAnchor="middle" className="fill-zinc-200 text-[14px] font-semibold">
        {title}
      </text>
      <circle cx="150" cy="160" r="95" fill="none" stroke="#60a5fa" strokeOpacity="0.45" strokeDasharray="4 5" />
      <circle cx="150" cy="160" r="22" fill="#3b82f6" />
      <circle cx="141" cy="152" r="6" fill="#86efac" fillOpacity="0.8" />
      {positions.map((deg) => {
        const a = (deg * Math.PI) / 180;
        const x = 150 + 95 * Math.cos(a);
        const y = 160 + 95 * Math.sin(a);
        // İşaretin yönü: kilitliyse hep Dünya'ya, değilse hep sağa (uzayda sabit).
        const face = locked ? a + Math.PI : 0;
        return (
          <g key={deg}>
            <circle cx={x} cy={y} r="14" fill="#d4d4d8" />
            <circle cx={x + 9 * Math.cos(face)} cy={y + 9 * Math.sin(face)} r="4" fill="#ef4444" />
          </g>
        );
      })}
    </g>
  );
  return (
    <figure className="my-8 overflow-hidden rounded-2xl bg-[#05070d] p-4 text-white">
      <svg viewBox="0 0 640 290" className="w-full" role="img" aria-label="Eş zamanlı dönen ay ile dönmeyen ayın karşılaştırması">
        {panel("Gerçekte: ay döner", true, 10)}
        {panel("Dönmeseydi", false, 330)}
      </svg>
      <figcaption className="mt-2 text-sm text-zinc-400">
        Kırmızı nokta ayın yüzeyinde sabit bir yer. Solda ay, bir turda kendi çevresinde de bir kez döndüğü için
        kırmızı nokta hep Dünya&apos;ya bakar; bu yüzden hep aynı yüzü görürüz. Sağda ay hiç dönmeseydi, bir ay boyunca
        her yanını görürdük. Ölçekli değildir.
      </figcaption>
    </figure>
  );
}

/** Ayın yüzeyinin ne kadarını Dünya'dan görebildiğimiz (librasyonla birlikte). */
function LibrationBar() {
  const parts = [
    { pct: 41, label: "Her zaman görünür", className: "bg-indigo-500 text-white" },
    { pct: 18, label: "Zaman zaman", className: "bg-indigo-300 text-indigo-950" },
    { pct: 41, label: "Hiç görünmez", className: "bg-zinc-800 text-zinc-200" },
  ];
  return (
    <figure className="my-8">
      <div className="flex h-14 overflow-hidden rounded-2xl text-sm font-medium">
        {parts.map((p) => (
          <div key={p.label} className={`flex items-center justify-center ${p.className}`} style={{ width: `${p.pct}%` }}>
            %{p.pct}
          </div>
        ))}
      </div>
      <figcaption className="mt-3 grid grid-cols-3 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        {parts.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </figcaption>
    </figure>
  );
}

const MILESTONES: { year: string; title: string; text: string }[] = [
  {
    year: "1959",
    title: "İlk fotoğraf: Luna 3",
    text: "Sovyet aracı Luna 3, 7 Ekim 1959'da arka yüzün ilk fotoğraflarını çekti. Görüntüler bulanıktı ama insanlık ayın öbür yüzünü ilk kez gördü.",
  },
  {
    year: "1968",
    title: "İlk insan gözü: Apollo 8",
    text: "Frank Borman, Jim Lovell ve William Anders, Aralık 1968'de ayın çevresinde dolaşırken arka yüzü kendi gözleriyle gören ilk insanlar oldu.",
  },
  {
    year: "2019",
    title: "İlk iniş: Chang'e 4",
    text: "Çin'in Chang'e 4 aracı 3 Ocak 2019'da arka yüzdeki Von Kármán kraterine indi; Yutu-2 gezgini orada yıllarca dolaştı.",
  },
  {
    year: "2024",
    title: "İlk örnek: Chang'e 6",
    text: "Chang'e 6, Haziran 2024'te Güney Kutbu-Aitken havzasından aldığı yaklaşık iki kilogram toprağı Dünya'ya getirdi; arka yüzden gelen ilk örnekler bunlar.",
  },
  {
    year: "2026",
    title: "Yarım asır sonra yeniden insanlar: Artemis II",
    text: "Artemis II astronotları Nisan 2026'da ayın arkasından geçti. Arka yüzle ön yüzün sınırındaki dev Orientale havzasını bütünüyle gören ilk insanlar oldular.",
  },
];

function Timeline() {
  return (
    <ol className="mt-4 space-y-4 border-l border-zinc-200 pl-6 dark:border-zinc-800">
      {MILESTONES.map((m) => (
        <li key={m.year} className="relative">
          <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-zinc-950" />
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{m.year}</p>
          <p className="font-semibold">{m.title}</p>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">{m.text}</p>
        </li>
      ))}
    </ol>
  );
}
