import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonDistanceKm } from "@moon-app/moon";
import { Faq } from "@/components/Faq";
import { NasaFigure } from "@/components/NasaFigure";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { FAQS } from "@/lib/faqs";
import { IMAGES } from "@/lib/images";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { LandingMap } from "./LandingMap";

const PAGE = PAGES.ayaYolculuk;
const UPDATED = "2026-10-29";
/** "Son gelişmeler" bölümünün en son elle güncellendiği gün. Önemli bir gelişmede bölümle birlikte güncellenir. */
const NEWS_CHECKED = "29 Ekim 2026";
const LIGHT_KM_S = 299_792.458;

export const metadata: Metadata = {
  title: `Aya Yolculuk: Aya İnsan Gitti mi? Apollo'dan Artemis'e, Türkiye'nin Ay Aracı | ${siteConfig.name}`,
  description:
    "Aya insan gitti mi, inişin kanıtları neler? Apollo'nun altı inişi ve aya ayak basan 12 astronot, aya iniş yapan ülkeler, aya gitmek kaç gün sürer, Artemis programı ve Türkiye'nin ay aracının son durumu.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

/** Apollo'nun aya inen altı görevi. Tarihler inişin evrensel zamana göre günüdür. */
const APOLLO_LANDINGS = [
  { mission: "Apollo 11", date: "20 Temmuz 1969", crew: "Neil Armstrong, Buzz Aldrin", site: "Sükûnet Denizi" },
  { mission: "Apollo 12", date: "19 Kasım 1969", crew: "Pete Conrad, Alan Bean", site: "Fırtınalar Okyanusu" },
  { mission: "Apollo 14", date: "5 Şubat 1971", crew: "Alan Shepard, Edgar Mitchell", site: "Fra Mauro tepeleri" },
  { mission: "Apollo 15", date: "30 Temmuz 1971", crew: "David Scott, James Irwin", site: "Hadley Vadisi" },
  { mission: "Apollo 16", date: "21 Nisan 1972", crew: "John Young, Charles Duke", site: "Descartes yaylası" },
  { mission: "Apollo 17", date: "11 Aralık 1972", crew: "Eugene Cernan, Harrison Schmitt", site: "Taurus-Littrow Vadisi" },
];

/** Aya yumuşak iniş yapan ülkeler ve ilk başarılı inişleri. */
const LANDING_COUNTRIES = [
  { who: "Sovyetler Birliği", first: "Luna 9", date: "3 Şubat 1966", note: "Aya yumuşak inen ilk araç; yüzeyden ilk fotoğrafları gönderdi." },
  { who: "ABD", first: "Surveyor 1", date: "2 Haziran 1966", note: "Üç yıl sonra Apollo 11 ile insanlı iniş." },
  { who: "Çin", first: "Chang'e 3", date: "14 Aralık 2013", note: "2019'da ayın uzak yüzüne inen ilk araç (Chang'e 4); 2024'te uzak yüzden örnek getirdi (Chang'e 6)." },
  { who: "Hindistan", first: "Chandrayaan-3", date: "23 Ağustos 2023", note: "Ayın güney kutbu bölgesine inen ilk araç." },
  { who: "Japonya", first: "SLIM", date: "19 Ocak 2024", note: "Hedeflediği noktanın yaklaşık 100 metre yakınına indi." },
];

export default function MoonJourneyPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={150}
        eyebrow="Ay bilgisi"
        lead="1969'dan 1972'ye 12 astronot aya ayak bastı. Yarım yüzyıl sonra insanlık yeniden yola çıktı: Artemis II astronotları 2026'da ayın çevresini dolaştı, Türkiye'nin ay aracı fırlatılmaya hazırlanıyor."
        aside={<LiveDistance />}
        photo={IMAGES.apollo11}
      />
      <LandingMap />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>Aya 1969-1972 arasında altı kez inildi; 12 astronot ay yüzeyinde yürüdü.</li>
          <li>Aya yumuşak iniş yapan ülkeler: Sovyetler Birliği, ABD, Çin, Hindistan ve Japonya.</li>
          <li>
            Artemis II Nisan 2026&apos;da dört astronotla ayın çevresini dolaştı; yeniden iniş 2028&apos;de hedefleniyor.
          </li>
          <li>Türkiye&apos;nin ilk ay aracının 2027&apos;nin ilk yarısında fırlatılması planlanıyor.</li>
        </QuickFacts>

        <Prose>
          <h2>Aya insan gitti mi? Kanıtlar</h2>
          <p>
            Evet. Apollo inişleri, bugün hâlâ ölçülebilen ve farklı ülkelerin doğrulayabildiği izler bıraktı. Ayın sahte
            olduğu iddiası yıllardır dolaşıyor, ama en güçlü cevap tek tek kanıtlara bakmaktır:
          </p>
          <ul>
            <li>
              <strong>Hâlâ çalışan aynalar.</strong> Apollo 11, 14 ve 15 astronotları ay yüzeyine lazer yansıtıcıları
              bıraktı. Dünya&apos;daki gözlemevleri bugün de bu aynalara lazer gönderip yansımanın dönüş süresini ölçüyor;
              ayın uzaklığı milimetre düzeyinde bu yolla biliniyor. Ayın her yıl yaklaşık 3,8 santimetre uzaklaştığı da bu
              ölçümlerden öğrenildi.
            </li>
            <li>
              <strong>Uydudan görünen iniş yerleri.</strong> NASA&apos;nın 2009&apos;dan beri ayın çevresinde dönen LRO
              uydusu, altı iniş yerinin hepsini fotoğrafladı: yüzeyde kalan iniş araçları, astronotların ayak izleriyle
              oluşan patikalar ve ay arabalarının tekerlek izleri görülüyor. Hindistan&apos;ın Chandrayaan-2 sondası da
              Apollo 11 ve 12&apos;nin iniş yerlerini görüntüledi.
            </li>
            <li>
              <strong>382 kilogram ay kayacı.</strong> Apollo astronotlarının getirdiği kayaçlar elli yıldır dünyanın
              dört bir yanındaki laboratuvarlarda inceleniyor. Dünya kayaçlarından farklıdır: hiç su içermez, yüzeyleri
              havası olmayan bir ortamda küçük göktaşlarının çarpmasıyla delik deşik olmuştur. Sovyetler Birliği&apos;nin
              insansız Luna araçlarıyla ayrıca getirdiği örnekler de aynı özellikleri taşır.
            </li>
            <li>
              <strong>Bağımsız takip.</strong> Görevler, Soğuk Savaş&apos;ın en sert döneminde, ABD ile yarışan Sovyetler
              Birliği dahil pek çok ülkenin gözlemevleri tarafından izlendi. Sahte bir iniş, rakibin bunu ortaya
              çıkarmadan geçmesine izin vermeyecek kadar büyük bir iddiaydı.
            </li>
          </ul>
        </Prose>

        <NasaFigure images={[IMAGES.apollo11]} />

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Aya kaç kez gidildi? Apollo&apos;nun altı inişi</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Her görevde üç astronot vardı: ikisi aya indi, biri yörüngede bekledi. Apollo 13 (Nisan 1970) bir patlama yüzünden
          inişten vazgeçti ve ayın çevresinden dolaşarak Dünya&apos;ya güvenle döndü.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm sm:text-base">
            <thead className="bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-5">Görev ve tarih</th>
                <th className="px-4 py-3 font-medium sm:px-5">Aya inen astronotlar</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell sm:px-5">İniş yeri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {APOLLO_LANDINGS.map((m) => (
                <tr key={m.mission}>
                  <td className="px-4 py-3 sm:px-5">
                    <span className="block font-semibold">{m.mission}</span>
                    <span className="block text-sm text-zinc-500">{m.date}</span>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    {m.crew}
                    <span className="block text-sm text-zinc-500 sm:hidden">{m.site}</span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell sm:px-5">{m.site}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Prose>
          <h2>Aya ilk kim ayak bastı?</h2>
          <p>
            Neil Armstrong, 21 Temmuz 1969&apos;da, Türkiye&apos;de sabahın erken saatlerinde, ay yüzeyine ayak basan ilk
            insan oldu. Yaklaşık 20 dakika sonra Buzz Aldrin onu izledi. Üçüncü astronot Michael Collins, ikisi yüzeydeyken
            ayın çevresinde dönen komuta modülünde tek başına bekledi. Armstrong ile Aldrin ayda 21 saat kaldı ve bunun iki buçuk
            saatini iniş aracının dışında, yüzeyde yürüyerek geçirdi. Sonraki görevlerde aydaki kalış üç güne kadar uzadı ve
            son üç görevde astronotlar ay arabasıyla kilometrelerce yol aldı.
          </p>
          <p>
            Aydan ayrılan son insan, 14 Aralık 1972&apos;de Apollo 17&apos;nin komutanı Eugene Cernan&apos;dı. O günden bu
            yana kimse ay yüzeyine inmedi.
          </p>

          <h2>Aya iniş yapan ülkeler</h2>
          <p>
            İnsanlı iniş yalnızca ABD&apos;ye ait; ama insansız araçlarla aya yumuşak iniş yapan, yani aracını yüzeye sağlam
            indiren beş ülke var:
          </p>
        </Prose>
        <ol className="mt-4 space-y-3">
          {LANDING_COUNTRIES.map((c) => (
            <li key={c.who} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-semibold">{c.who}</span>
                <span className="text-sm text-zinc-500">
                  {c.first} · {c.date}
                </span>
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{c.note}</p>
            </li>
          ))}
        </ol>

        <Prose>
          <p>
            Son yıllarda özel şirketler de aya inmeye başladı. Intuitive Machines şirketinin Odysseus aracı Şubat
            2024&apos;te inerken yan yattı ama çalışmayı sürdürdü; Firefly şirketinin Blue Ghost aracı Mart 2025&apos;te
            sorunsuz indi. İsrail ve Japonya&apos;dan özel kuruluşların denemeleri ise çarpışmayla sonuçlandı. Ayın yumuşak
            inişe izin vermeyen, havasız ve engebeli yüzeyi, yarım yüzyıl sonra bile kolay bir hedef değil.
          </p>

          <h2>Aya gitmek kaç gün sürer?</h2>
          <p>
            Apollo astronotları ayın yörüngesine yaklaşık üç günde ulaşıyordu; Apollo 11 16 Temmuz&apos;da fırlatıldı, 19
            Temmuz&apos;da ayın yörüngesine girdi. Artemis II&apos;nin on günlük görevi de benzer bir yol izledi: astronotlar
            altıncı gün ayın arkasından geçti.
          </p>
          <p>
            İnsansız araçlar ise çoğu zaman acele etmez. Yakıt tasarrufu için Dünya&apos;nın çevresinde giderek büyüyen
            turlar atar ya da daha uzun ama daha az enerji isteyen yollar izlerler. Hindistan&apos;ın Chandrayaan-3 aracı
            aya yaklaşık 40 günde, Japonya&apos;nın SLIM aracı dört ayı aşkın sürede vardı. Türkiye&apos;nin ay aracı için
            öngörülen yolculuk süresi yaklaşık iki aydır.
          </p>

          <h2>Artemis: aya dönüş</h2>
          <p>
            NASA&apos;nın Artemis programı, Apollo&apos;dan sonra insanları yeniden aya indirmeyi ve orada kalıcı bir
            varlık kurmayı amaçlıyor. Program adını Yunan mitolojisinde Apollon&apos;un ikiz kız kardeşi Artemis&apos;ten
            alıyor.
          </p>
          <ul>
            <li>
              <strong>Artemis I (Kasım-Aralık 2022):</strong> Mürettebatsız Orion kapsülü ayın çevresinde dolaşıp döndü.
            </li>
            <li>
              <strong>Artemis II (1-10 Nisan 2026):</strong> Reid Wiseman, Victor Glover, Christina Koch ve Kanadalı Jeremy
              Hansen ayın arkasından dolaşıp döndü. 1972&apos;den beri aya giden ilk insanlar oldular ve insanların
              Dünya&apos;dan en çok uzaklaştığı mesafenin rekorunu kırdılar.
            </li>
            <li>
              <strong>Artemis III (2027 yazı, plan):</strong> NASA&apos;nın Ekim 2026&apos;daki açıklamasına göre bu görev
              iniş yapmayacak; dört astronot Dünya yörüngesinde, ileride kullanılacak ay iniş araçlarıyla buluşma ve
              kenetlenme denemesi yapacak.
            </li>
            <li>
              <strong>Artemis IV (2028, plan):</strong> Apollo 17&apos;den sonraki ilk insanlı ay inişi olarak
              hedefleniyor. İniş, ayın güney kutbu bölgesine yapılacak; burada gölgede kalan kraterlerde donmuş su
              bulunduğu düşünülüyor.
            </li>
          </ul>
          <p>
            Uzay takvimleri sık sık kayar; buradaki tarihler NASA&apos;nın son açıkladığı planlardır. Çin de 2030&apos;dan
            önce kendi astronotlarını aya indirmeyi hedefliyor.
          </p>

          <h2>Türkiye&apos;nin ay aracı</h2>
          <p>
            Türkiye&apos;nin Ay Araştırma Programı&apos;nın ilk aşamasında, TÜBİTAK UZAY&apos;ın geliştirdiği insansız bir
            uzay aracı aya gönderilecek. TÜBİTAK&apos;ın Ekim 2026&apos;daki açıklamasına göre aracın üretimi ve
            entegrasyonu tamamlandı; yaklaşık 3,5 ton ağırlığındaki aracın 65 kritik bileşeninden 56&apos;sı yerli
            imkânlarla üretildi. Araç, uzay koşullarını taklit eden çevresel testlerden sonra ABD&apos;deki Kennedy Uzay
            Merkezi&apos;ne gönderilecek; fırlatmanın 2027&apos;nin ilk yarısında yapılması planlanıyor.
          </p>
          <p>
            Planlanan görev şöyle: Araç yaklaşık iki aylık bir yolculuktan sonra ayın kutuplarının üzerinden geçen, yüzeyden
            100 kilometre yükseklikteki bir yörüngeye girecek. Bu yörüngede en az üç ay, performansına göre bir buçuk yıla
            kadar çalışacak; ikisi yerli, ikisi uluslararası iş birliğiyle geliştirilen dört bilimsel cihaz taşıyacak. Görev
            sonunda araç, yerli olarak geliştirilen hibrit roket motoruyla kontrollü olarak ay yüzeyine indirilecek. Bu bir
            yumuşak iniş değil, aracın yüzeye çarptığı bir &quot;sert iniş&quot;tir. Programın ikinci aşamasında ise ay
            yüzeyine yumuşak iniş yapacak bir araç hedefleniyor.
          </p>

          <h2>Son gelişmeler</h2>
          <p className="text-sm text-zinc-500">Son kontrol: {NEWS_CHECKED}</p>
          <ul>
            <li>
              <strong>23 Ekim 2026:</strong> NASA, Artemis III&apos;ün 2027 yazında Dünya yörüngesinde bir kenetlenme
              denemesi olarak uçacağını, ilk insanlı inişin Artemis IV ile 2028&apos;de hedeflendiğini açıkladı.
            </li>
            <li>
              <strong>6 Ekim 2026:</strong> TÜBİTAK, Türkiye&apos;nin ay aracının entegrasyonunun tamamlandığını ve aracın
              çevresel testlere gönderildiğini duyurdu.
            </li>
            <li>
              <strong>Ağustos 2026:</strong> Çin, ayın güney kutbunu inceleyecek Chang&apos;e 7 görevinin 2026 fırlatma
              penceresine yetişemeyeceğini açıkladı; yeni tarih verilmedi.
            </li>
            <li>
              <strong>1-10 Nisan 2026:</strong> Artemis II, dört astronotla ayın çevresini dolaşıp Pasifik Okyanusu&apos;na
              indi.
            </li>
          </ul>
          <p>
            Ayın kendisini, bu gece hangi evrede olduğunu ve bulunduğunuz ilden ne zaman doğacağını{" "}
            <Link href={PAGES.bugunAy.path}>Bugün Ay Nasıl?</Link> sayfasında görebilirsiniz.
          </p>
        </Prose>

        <Faq items={FAQS.ayaYolculuk} />
        <ArticleFooter
          page={PAGE}
          headline="Aya Yolculuk: Apollo'dan Artemis'e, Türkiye'nin Ay Aracı"
          updated={UPDATED}
          sources={[
            { label: "NASA, Apollo 11 görev özeti", href: "https://www.nasa.gov/history/apollo-11-mission-overview/" },
            { label: "NASA Science, Lunar Reconnaissance Orbiter (LRO)", href: "https://science.nasa.gov/mission/lro/" },
            {
              label: "NASA, Artemis II görev özeti",
              href: "https://www.nasa.gov/centers-and-facilities/johnson/artemis-ii-mission-milestones-an-image-and-video-recap/",
            },
            { label: "NASA, Artemis III haberleri", href: "https://www.nasa.gov/artemis-iii-news-and-updates/" },
            { label: "TÜBİTAK, Ay uzay aracının entegrasyonu (Ekim 2026)", href: "https://tubitak.gov.tr/en/node/19226" },
          ]}
        />
      </main>
    </>
  );
}

/** Giriş kutusu: ay şu an ne kadar uzakta, ışık ve Apollo bu yolu ne kadar sürede alır. Saatte bir yenilenir. */
async function LiveDistance() {
  "use cache";
  cacheLife("hours");

  const km = getMoonDistanceKm(new Date());
  const nf = new Intl.NumberFormat(siteConfig.locale);
  const pf = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 1 });

  return (
    <div className="rounded-2xl border border-white/15 bg-black/50 p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-zinc-400">Ay şu an</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{nf.format(Math.round(km))} km</p>
      <p className="mt-0.5 text-zinc-300">uzakta</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-zinc-400">Işık bu yolu</dt>
          <dd className="font-medium">{pf.format(km / LIGHT_KM_S)} saniyede alır</dd>
        </div>
        <div>
          <dt className="text-zinc-400">Apollo astronotları</dt>
          <dd className="font-medium">yaklaşık 3 günde</dd>
        </div>
      </dl>
      <Link href={PAGES.ayUzaklik.path} className="mt-4 inline-block text-sm text-indigo-300 underline hover:text-indigo-200">
        Ay ne kadar uzak? Arabayla kaç günde gidilir?
      </Link>
    </div>
  );
}
