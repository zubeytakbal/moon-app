import type { Metadata } from "next";
import Link from "next/link";
import { CorporatePage } from "@/components/CorporatePage";
import { Prose } from "@/components/Prose";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.hakkimizda;

export const metadata: Metadata = {
  title: `Hakkımızda | ${siteConfig.name}`,
  description: `${siteConfig.name} nedir, kim hazırlıyor, içerikler ve hesaplar nasıl hazırlanıyor?`,
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function AboutPage() {
  return (
    <CorporatePage
      page={PAGE}
      updated="2026-10-28"
      lead={`${siteConfig.name}, ayla ilgili her soruya tek bir yerden, doğru ve anlaşılır bir cevap vermek için hazırlanan bağımsız bir sitedir.`}
    >
      <Prose>
        <h2>Ne yapıyoruz?</h2>
        <p>
          Ay her gece gökyüzünde, ama onunla ilgili bilgi dağınık: evre bir sitede, doğuş saati başka bir sitede, tutulma
          tarihi bir haberde, Hicri ay başı bambaşka bir yerde. {siteConfig.name}&apos;ta bunları bir araya getiriyoruz:
          bugünün ayı, ay takvimi, 81 il için doğuş ve batış saatleri, dolunay ve tutulma tarihleri, Hicri takvim ve
          ayla ilgili gelenekler.
        </p>
        <p>
          Amacımız yalnızca bir tarih ya da rakam vermek değil, o rakamın ne anlama geldiğini de anlatmak. Bu yüzden her
          aracın yanında, sorunun cevabını sade bir dille açıklayan bir yazı bulunur.
        </p>

        <h2>İçerikler nasıl hazırlanıyor?</h2>
        <ul>
          <li>
            <strong>Hesaplar:</strong> Ay ve Güneş konumları açık kaynaklı bir astronomi kütüphanesiyle, Türkiye saatine
            göre hesaplanır. Başka sitelerden tarih kopyalanmaz.
          </li>
          <li>
            <strong>Doğrulama:</strong> Sonuçları NASA, ABD Deniz Gözlemevi ve Diyanet&apos;in yayımladığı tarihlerle
            karşılaştırıyoruz. Karşılaştırmaların tamamı{" "}
            <Link href={PAGES.yontem.path}>Yöntem ve Doğruluk</Link> sayfasında.
          </li>
          <li>
            <strong>Kaynaklar:</strong> Her yazının sonunda yararlandığımız kaynaklar listelenir.
          </li>
          <li>
            <strong>Güncelleme:</strong> &quot;Bugün&quot; sayfaları kendiliğinden güncellenir. Tarih listelerini her yıl
            yeni yıla göre elden geçiriyoruz.
          </li>
        </ul>

        <h2>Bilim ve gelenek</h2>
        <p>
          Sitenin büyük bölümü astronomidir. Ay burcu, saç kesimi ya da ekim-dikim gibi konuları ise &quot;geleneksel
          takvim&quot; olarak, bilimin bu konuda ne dediğini de yazarak sunuyoruz. Burç yorumu yapmıyoruz.
        </p>
        <p>
          Hicri takvim ve dinî günlerle ilgili sayfalarımız bilgilendirme amaçlıdır. Ramazan, bayram ve kandil tarihleri
          için resmî kaynak Diyanet İşleri Başkanlığı&apos;dır.
        </p>

        <h2>Kimiz?</h2>
        <p>
          {siteConfig.name}, gökyüzüne ve özellikle aya meraklı küçük bir ekip tarafından hazırlanıyor. Herhangi bir
          kurum, şirket ya da devlet kuruluşuyla bağımız yoktur; NASA ve Diyanet gibi kaynaklara yalnızca bilgi kaynağı
          olarak başvururuz.
        </p>
        <p>
          Sitenin giderlerini karşılamak için sayfalarda reklam gösterilebilir. Reklamlar içeriği etkilemez; hiçbir
          tarih ya da bilgi reklam veren birinin isteğine göre yazılmaz.
        </p>

        <h2>Bize ulaşın</h2>
        <p>
          Bir hata gördüyseniz ya da bir öneriniz varsa{" "}
          <Link href={PAGES.iletisim.path}>İletişim</Link> sayfasından bize yazabilirsiniz. Hata bildirimlerini
          önemsiyoruz; doğrulanan her düzeltmeyi sayfaya yansıtırız.
        </p>
      </Prose>
    </CorporatePage>
  );
}
