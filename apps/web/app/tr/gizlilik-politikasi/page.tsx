import type { Metadata } from "next";
import Link from "next/link";
import { CorporatePage } from "@/components/CorporatePage";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.gizlilik;

export const metadata: Metadata = {
  title: `Gizlilik Politikası | ${siteConfig.name}`,
  description: `${siteConfig.name} hangi bilgileri, ne amaçla işler? Google Analytics, reklamlar, konum ve kişisel verilerinizle ilgili haklarınız (KVKK).`,
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function PrivacyPage() {
  const email = siteConfig.contactEmail;
  const name = siteConfig.name;
  return (
    <CorporatePage
      page={PAGE}
      updated="2026-10-29"
      lead="Bu sayfada sitemizi kullanırken hangi bilgilerin işlendiğini, neden işlendiğini ve bu konudaki haklarınızı anlatıyoruz."
    >
      <QuickFacts>
        <li>Üyelik yok; adınızı, telefonunuzu ya da adresinizi istemiyoruz.</li>
        <li>
          Ziyaret istatistikleri için Google Analytics, reklamlar için Google AdSense kullanılır; ikisi de çerez kullanır.
        </li>
        <li>&quot;Konumumu kullan&quot; özelliğinde konumunuz yalnızca kendi cihazınızda kullanılır, bize gönderilmez.</li>
      </QuickFacts>

      <Prose>
        <h2>Veri sorumlusu</h2>
        <p>
          Bu sitenin işletmecisi {name}&apos;tır (bundan sonra &quot;biz&quot;). Kişisel verilerinizle ilgili her
          konuda <a href={`mailto:${email}`}>{email}</a> adresinden bize ulaşabilirsiniz. Bu metin, 6698 sayılı
          Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aydınlatma amacıyla hazırlanmıştır.
        </p>

        <h2>Hangi bilgiler işlenir?</h2>
        <h3>Teknik bilgiler</h3>
        <p>
          Siteyi açtığınızda tarayıcınız, sitemizin barındırıldığı Cloudflare&apos;in sunucularına bazı teknik
          bilgiler gönderir: IP adresi, tarayıcı ve cihaz türü, ziyaret zamanı ve açılan sayfanın adresi. Bu bilgiler
          sitenin çalışması, güvenliği ve saldırılara karşı korunması için gereklidir.
        </p>

        <h3>Ziyaret istatistikleri (Google Analytics)</h3>
        <p>
          Hangi sayfaların okunduğunu, ziyaretçilerin siteye nereden geldiğini ve hangi cihazları kullandığını görmek
          için Google Analytics kullanıyoruz. Google Analytics bunun için çerez kullanır ve sizi adınızla değil, rastgele
          bir kimlik numarasıyla tanır. Google&apos;ın açıklamasına göre Google Analytics 4 IP adreslerini kaydetmez.
          Bu istatistikleri yalnızca siteyi geliştirmek için kullanırız. Google Analytics, çerez bildiriminde izin
          vermezseniz hiç yüklenmez ve Google&apos;a ziyaretinizle ilgili bilgi gönderilmez.
        </p>

        <h3>Reklamlar (Google AdSense)</h3>
        <p>Sitede Google AdSense aracılığıyla reklam gösterilebilir. Bu durumda:</p>
        <ul>
          <li>
            Google dahil üçüncü taraf reklam sağlayıcıları, sizin bu siteye ya da başka sitelere önceki ziyaretlerinize
            dayanarak reklam göstermek için çerez kullanır.
          </li>
          <li>
            Google&apos;ın reklam çerezlerini kullanması, Google&apos;ın ve iş ortaklarının bu siteye ve/veya
            internetteki başka sitelere yaptığınız ziyaretlere göre size reklam göstermesini sağlar.
          </li>
          <li>
            Kişiselleştirilmiş reklamları{" "}
            <a href="https://myadcenter.google.com/" target="_blank" rel="noopener">
              Google Reklam Merkezim
            </a>{" "}
            sayfasından kapatabilirsiniz. Diğer reklam sağlayıcılarının çerezlerini{" "}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener">
              aboutads.info
            </a>{" "}
            üzerinden yönetebilirsiniz.
          </li>
        </ul>
        <p>
          Google&apos;ın verileri nasıl kullandığını{" "}
          <a href="https://policies.google.com/technologies/partner-sites?hl=tr" target="_blank" rel="noopener">
            Google&apos;ın iş ortaklarının sitelerindeki veri kullanımı
          </a>{" "}
          sayfasında okuyabilirsiniz.
        </p>

        <h3>Araçlara girdiğiniz bilgiler</h3>
        <p>
          &quot;Doğduğum Gün Ay Nasıldı?&quot; ve &quot;Ay Burcu Hesaplama&quot; gibi araçlara girdiğiniz tarih ve saat,
          sonucu hesaplamak için sayfa adresinin parçası olarak sunucumuza gönderilir. Bu bilgileri bir veritabanına
          kaydetmiyor, kimliğinizle eşleştirmiyoruz. Yine de sayfa adresi olarak yukarıdaki teknik kayıtlarda ve ziyaret
          istatistiklerinde görünebilir. Hicri-Miladi çevirici ve evre modeli gibi bazı araçlar ise tamamen tarayıcınızda
          çalışır; girdiğiniz bilgiler hiçbir yere gönderilmez.
        </p>

        <h3>Konum</h3>
        <p>
          &quot;Konumumu kullan&quot; düğmesine basarsanız tarayıcınız sizden izin ister. İzin verirseniz konumunuz yalnızca
          ayın gökyüzündeki yerini hesaplamak için kendi cihazınızda kullanılır; bize ya da başka birine gönderilmez,
          kaydedilmez. Telefon pusulası verisi için de aynısı geçerlidir.
        </p>

        <h3>E-posta yazışmaları</h3>
        <p>
          Bize e-posta gönderirseniz, e-posta adresinizi ve mesajınızı yalnızca size cevap vermek ve bildirdiğiniz
          konuyu incelemek için kullanırız.
        </p>

        <h2>Bilgiler kimlerle paylaşılır?</h2>
        <p>
          Bilgilerinizi satmıyoruz. Yukarıda anlatılan hizmetler için yalnızca şu hizmet sağlayıcılar bilgi işler:
          Cloudflare (barındırma ve güvenlik), Google (Google Analytics ve Google AdSense). Bu şirketlerin sunucuları
          yurt dışında, ağırlıklı olarak ABD&apos;de bulunabilir; bu nedenle veriler yurt dışına aktarılmış olur. Yasal
          bir zorunluluk olduğunda, yetkili kurumların talebi üzerine bilgi paylaşılabilir.
        </p>

        <h2>Ne kadar süre saklanır?</h2>
        <ul>
          <li>Google Analytics verileri en fazla 14 ay saklanır, sonra silinir.</li>
          <li>Teknik kayıtlar, barındırma sağlayıcısının güvenlik ihtiyacı kadar kısa bir süre tutulur.</li>
          <li>E-posta yazışmaları, konu sonuçlandıktan sonra gerekmedikçe saklanmaz.</li>
        </ul>

        <h2>Haklarınız</h2>
        <p>KVKK&apos;nın 11. maddesine göre şu haklara sahipsiniz:</p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenmek ve işlendiyse bilgi istemek,</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenmek,</li>
          <li>Yurt içinde ya da yurt dışında aktarıldığı üçüncü kişileri bilmek,</li>
          <li>Eksik ya da yanlış işlenmişse düzeltilmesini, gerekli şartlar oluştuğunda silinmesini istemek,</li>
          <li>Otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuca itiraz etmek,</li>
          <li>Kanuna aykırı işleme nedeniyle zarara uğrarsanız zararın giderilmesini talep etmek.</li>
        </ul>
        <p>
          Bu haklarınızı kullanmak için <a href={`mailto:${email}`}>{email}</a> adresine yazabilirsiniz. Talebinizi en
          geç 30 gün içinde cevaplarız.
        </p>

        <h2>Çerezler</h2>
        <p>
          Hangi çerezlerin kullanıldığını ve nasıl yönetebileceğinizi{" "}
          <Link href={PAGES.cerez.path}>Çerez Politikası</Link> sayfasında ayrıntılı olarak anlatıyoruz.
        </p>

        <h2>Değişiklikler</h2>
        <p>
          Bu politikayı sitede yeni bir hizmet kullanmaya başladığımızda ya da yasal düzenlemeler değiştiğinde
          güncelleriz. Güncel metin her zaman bu sayfadadır; son güncelleme tarihi aşağıda yazılıdır.
        </p>
      </Prose>
    </CorporatePage>
  );
}
