import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { getMoonDistanceKm } from "@moon-app/moon";
import { Faq } from "@/components/Faq";
import { AnswerBox, DataTable } from "@/components/InfoTables";
import { NasaFigure } from "@/components/NasaFigure";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { pageSources } from "@/components/Sources";
import { FAQS } from "@/lib/faqs";
import { IMAGES } from "@/lib/images";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { LandingMap } from "./LandingMap";

const PAGE = PAGES.ayaYolculuk;
const UPDATED = "2026-11-02";
const src = pageSources(
  "nasaApollo11",
  "svsLroApollo",
  "nasaLunarSamples",
  "nasaMoonFactSheet",
  "nasaArtemis2",
  "nasaArtemis3",
  "tubitakLunar",
);
/** "Son gelişmeler" bölümünün en son elle güncellendiği gün. Önemli bir gelişmede bölümle birlikte güncellenir. */
const NEWS_CHECKED = "2 Kasım 2026";
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
        updated={UPDATED}
      />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Gidildi mi?" },
          { href: "#inis-haritasi", label: "İniş haritası" },
          { href: "#kanitlar", label: "Kanıtlar" },
          { href: "#apollo", label: "Apollo inişleri" },
          { href: "#ulkeler", label: "Ülkeler" },
          { href: "#sure", label: "Kaç gün?" },
          { href: "#artemis", label: "Artemis" },
          { href: "#turkiye", label: "Türkiye" },
          { href: "#gelismeler", label: "Son gelişmeler" },
        ]}
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <JourneyAnswer />
      </div>
      <LandingMap />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">

        <Prose>
          <h2 id="kanitlar">Aya insan gitti mi? Kanıtlar</h2>
          <p>
            Evet. Apollo inişleri, bugün hâlâ ölçülebilen ve farklı ülkelerin doğrulayabildiği izler bıraktı. Ayın sahte
            olduğu iddiası yıllardır dolaşıyor, ama en güçlü cevap tek tek kanıtlara bakmaktır:
          </p>
          <ul>
            <li>
              <strong>Hâlâ çalışan aynalar.</strong> Apollo 11, 14 ve 15 astronotları ay yüzeyine lazer yansıtıcıları
              bıraktı. Dünya&apos;daki gözlemevleri bugün de bu aynalara lazer gönderip yansımanın dönüş süresini ölçüyor;
              ayın uzaklığı milimetre düzeyinde bu yolla biliniyor. Ayın her yıl yaklaşık 3,8 santimetre uzaklaştığı da bu
              ölçümlerden öğrenildi.{src.ref("nasaMoonFactSheet")}
            </li>
            <li>
              <strong>Uydudan görünen iniş yerleri.</strong> NASA&apos;nın 2009&apos;dan beri ayın çevresinde dönen LRO
              uydusu Apollo iniş yerlerini fotoğrafladı. Apollo 12, 14 ve 17&apos;nin görüntülerinde iniş araçlarının
              yüzeyde kalan bölümleri, ay arabası ve astronotların yürürken bıraktığı izler seçiliyor.
              {src.ref("svsLroApollo")} Hindistan&apos;ın Chandrayaan-2 sondası da
              Apollo 11 ve 12&apos;nin iniş yerlerini görüntüledi.
            </li>
            <li>
              <strong>382 kilogram ay kayacı.</strong> Apollo astronotlarının getirdiği 2.196 örnek elli yıldır dünyanın
              dört bir yanındaki laboratuvarlarda inceleniyor.{src.ref("nasaLunarSamples")} Dünya kayaçlarından
              farklıdır: içlerinde su bulunmadı, yüzeyleri
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

        <h2 id="apollo" className="mt-12 scroll-mt-32 text-2xl font-semibold tracking-tight">
          Aya kaç kez gidildi? Apollo&apos;nun altı inişi
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Her görevde üç astronot vardı: ikisi aya indi, biri yörüngede bekledi. Apollo 13 (Nisan 1970) bir patlama yüzünden
          inişten vazgeçti ve ayın çevresinden dolaşarak Dünya&apos;ya güvenle döndü.
        </p>
        <DataTable
          columns={["Görev", "İniş", "Aya inen astronotlar", "İniş yeri"]}
          rows={APOLLO_LANDINGS.map((m) => ({ key: m.mission, cells: [m.mission, m.date, m.crew, m.site] }))}
        />

        <Prose>
          <h2>Aya ilk kim ayak bastı?</h2>
          <p>
            Neil Armstrong, 21 Temmuz 1969&apos;da, Türkiye&apos;de sabahın erken saatlerinde, ay yüzeyine ayak basan ilk
            insan oldu. Yaklaşık 20 dakika sonra Buzz Aldrin onu izledi. Üçüncü astronot Michael Collins, ikisi yüzeydeyken
            ayın çevresinde dönen komuta modülünde tek başına bekledi. Armstrong ile Aldrin ayda 21 saat kaldı ve bunun iki buçuk
            saatini iniş aracının dışında, yüzeyde yürüyerek geçirdi.{src.ref("nasaApollo11")} Sonraki görevlerde aydaki kalış üç güne kadar uzadı ve
            son üç görevde astronotlar ay arabasıyla kilometrelerce yol aldı.
          </p>
          <p>
            Aydan ayrılan son insan, 14 Aralık 1972&apos;de Apollo 17&apos;nin komutanı Eugene Cernan&apos;dı. O günden bu
            yana kimse ay yüzeyine inmedi.
          </p>

          <h2 id="ulkeler">Aya iniş yapan ülkeler</h2>
          <p>
            İnsanlı iniş yalnızca ABD&apos;ye ait; ama insansız araçlarla aya yumuşak iniş yapan, yani aracını yüzeye sağlam
            indiren beş ülke var:
          </p>
        </Prose>
        <DataTable
          columns={["Ülke", "İlk yumuşak iniş", "Tarih", "Not"]}
          rows={LANDING_COUNTRIES.map((c) => ({ key: c.who, cells: [c.who, c.first, c.date, c.note] }))}
        />

        <Prose>
          <p>
            Son yıllarda özel şirketler de aya inmeye başladı. Intuitive Machines şirketinin Odysseus aracı Şubat
            2024&apos;te inerken yan yattı ama çalışmayı sürdürdü; Firefly şirketinin Blue Ghost aracı Mart 2025&apos;te
            sorunsuz indi. İsrail ve Japonya&apos;dan özel kuruluşların denemeleri ise çarpışmayla sonuçlandı. Ayın yumuşak
            inişe izin vermeyen, havasız ve engebeli yüzeyi, yarım yüzyıl sonra bile kolay bir hedef değil.
          </p>

          <h2 id="sure">Aya gitmek kaç gün sürer?</h2>
          <p>
            Apollo astronotları ayın yörüngesine yaklaşık üç günde ulaşıyordu; Apollo 11 16 Temmuz&apos;da fırlatıldı, 19
            Temmuz&apos;da ayın yörüngesine girdi.{src.ref("nasaApollo11")} Artemis II&apos;nin on günlük görevi de benzer
            bir yol izledi: astronotlar altıncı gün ayın arkasından geçti.{src.ref("nasaArtemis2")}
          </p>
          <p>
            İnsansız araçlar ise çoğu zaman acele etmez. Yakıt tasarrufu için Dünya&apos;nın çevresinde giderek büyüyen
            turlar atar ya da daha uzun ama daha az enerji isteyen yollar izlerler. Hindistan&apos;ın Chandrayaan-3 aracı
            aya yaklaşık 40 günde, Japonya&apos;nın SLIM aracı dört ayı aşkın sürede vardı. Türkiye&apos;nin ay aracı için
            öngörülen yolculuk süresi yaklaşık iki aydır.
          </p>

          <h2 id="artemis">Artemis: aya dönüş</h2>
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
              Dünya&apos;dan en çok uzaklaştığı mesafenin rekorunu kırdılar.{src.ref("nasaArtemis2")}
            </li>
            <li>
              <strong>Artemis III (2027, plan):</strong> NASA&apos;nın açıklamasına göre bu görev aya inmeyecek;
              astronotlar Dünya yörüngesinde, ileride kullanılacak ticari ay iniş araçlarıyla buluşma ve kenetlenme
              denemesi yapacak.{src.ref("nasaArtemis3")}
            </li>
            <li>
              <strong>Artemis IV (2028, plan):</strong> Apollo 17&apos;den sonraki ilk insanlı ay inişi olarak
              hedefleniyor; NASA ilk Artemis inişini 2028 başına planlıyor.{src.ref("nasaArtemis3")} İniş, ayın güney kutbu bölgesine yapılacak; burada gölgede kalan kraterlerde donmuş su
              bulunduğu düşünülüyor.
            </li>
          </ul>
          <p>
            Uzay takvimleri sık sık kayar; buradaki tarihler NASA&apos;nın son açıkladığı planlardır. Çin de 2030&apos;dan
            önce kendi astronotlarını aya indirmeyi hedefliyor.
          </p>

          <h2 id="turkiye">Türkiye&apos;nin ay aracı</h2>
          <p>
            Türkiye&apos;nin Ay Araştırma Programı&apos;nın ilk aşamasında, TÜBİTAK UZAY&apos;ın geliştirdiği insansız bir
            uzay aracı aya gönderilecek. TÜBİTAK&apos;ın Ekim 2026&apos;daki açıklamasına göre aracın üretimi ve
            entegrasyonu tamamlandı; yaklaşık 3,5 ton ağırlığındaki aracın 65 kritik bileşeninden 56&apos;sı yerli
            imkânlarla üretildi. Araç, uzay koşullarını taklit eden çevresel testlerden sonra ABD&apos;deki Kennedy Uzay
            Merkezi&apos;ne gönderilecek; fırlatmanın 2027&apos;nin ilk yarısında yapılması planlanıyor.
            {src.ref("tubitakLunar")}
          </p>
          <p>
            Planlanan görev şöyle: Araç yaklaşık iki aylık bir yolculuktan sonra ayın kutuplarının üzerinden geçen, yüzeyden
            yaklaşık 100 kilometre yükseklikteki bir yörüngeye girecek ve dört bilimsel cihaz taşıyacak. Yörüngeye çıkış
            ve görevin sonundaki manevralar, yerli olarak geliştirilen hibrit roket motoruyla yapılacak; araç görev sonunda
            kontrollü manevralarla ay yüzeyine ulaşacak.{src.ref("tubitakLunar")} Programın ikinci aşamasında ise ay
            yüzeyine yumuşak iniş yapacak bir araç hedefleniyor.
          </p>

          <h2 id="gelismeler">Son gelişmeler</h2>
          <p className="text-sm text-zinc-500">Son kontrol: {NEWS_CHECKED}</p>
          <ul>
            <li>
              <strong>23 Ekim 2026:</strong> NASA, Artemis III&apos;ün 2027&apos;de Dünya yörüngesinde gelecekteki ay iniş
              araçlarının işlemlerini deneyeceğini açıkladı; ilk Artemis inişi 2028 başı için hedefleniyor.
              {src.ref("nasaArtemis3")}
            </li>
            <li>
              <strong>6 Ekim 2026:</strong> TÜBİTAK, Türkiye&apos;nin ay aracının entegrasyonunun tamamlandığını ve aracın
              çevresel testlere gönderildiğini duyurdu.{src.ref("tubitakLunar")}
            </li>
            <li>
              <strong>Ağustos 2026:</strong> Çin, ayın güney kutbunu inceleyecek Chang&apos;e 7 görevinin 2026 fırlatma
              penceresine yetişemeyeceğini açıkladı; yeni tarih verilmedi.
            </li>
            <li>
              <strong>1-10 Nisan 2026:</strong> Artemis II, dört astronotla ayın çevresini dolaşıp Pasifik Okyanusu&apos;na
              indi.{src.ref("nasaArtemis2")}
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
          src={src}
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

/** Sayfanın sorusunun cevabı, en üstte (timeanddate düzeni): aya insan gitti mi, kaç kez, şimdi ne oluyor. */
function JourneyAnswer() {
  return (
    <AnswerBox
      question="Aya insan gitti mi?"
      answer="Evet. 1969-1972 arasında altı Apollo görevi aya indi ve 12 astronot ay yüzeyinde yürüdü."
      rows={[
        {
          label: "İlk ayak basan",
          value: (
            <>
              Neil Armstrong, 21 Temmuz 1969 (Türkiye saatiyle sabaha karşı){src.ref("nasaApollo11")}
            </>
          ),
        },
        { label: "Son ayrılan", value: "Eugene Cernan, 14 Aralık 1972 (Apollo 17)" },
        {
          label: "Getirilen örnek",
          value: (
            <>
              382 kg kayaç ve toprak, 2.196 örnek{src.ref("nasaLunarSamples")}
            </>
          ),
        },
        { label: "Aya iniş yapan ülkeler", value: "Sovyetler Birliği, ABD, Çin, Hindistan, Japonya (insanlı yalnız ABD)" },
        {
          label: "Yeniden aya",
          value: (
            <>
              Artemis II Nisan 2026&apos;da ayın çevresini dolaştı{src.ref("nasaArtemis2")}; ilk Artemis inişi 2028 başı
              için hedefleniyor{src.ref("nasaArtemis3")}
            </>
          ),
        },
        {
          label: "Türkiye'nin ay aracı",
          value: (
            <>
              Entegrasyonu tamamlandı; fırlatma 2027&apos;nin ilk yarısında hedefleniyor{src.ref("tubitakLunar")}
            </>
          ),
        },
      ]}
      note={<>Görev tarihleri sık değişir; son kontrol: {NEWS_CHECKED}.</>}
    />
  );
}
