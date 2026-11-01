import type { Metadata } from "next";
import Link from "next/link";
import { CorporatePage } from "@/components/CorporatePage";
import { JsonLd } from "@/components/JsonLd";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.yazar;
const { name, initials, role } = siteConfig.author;

export const metadata: Metadata = {
  title: `${name}, ${role} | ${siteConfig.name}`,
  description: `${name}: ${siteConfig.name}'ın kurucusu ve editörü. Kimya mühendisliği mezunu; ay evreleri, tutulmalar ve Hicri takvim hesaplarını kaynağıyla birlikte sunan Türkçe siteler geliştiriyor.`,
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

/**
 * Yazar sayfası (Feriatlas'taki yazar sayfasıyla aynı düzen): ad ve görev, eğitim, sitede ne yaptığı, kendi ağzından
 * birkaç cümle, diğer çalışmaları. Adres isimsiz (/tr/yazar), isim site.config'den. Fotoğraf yok.
 * Metin değişikliği kullanıcı onayıyla yapılır.
 */
export default function AuthorPage() {
  return (
    <CorporatePage page={PAGE} updated="2026-11-01" lead={`${name}, ${siteConfig.name}'ın kurucusu ve editörü.`}>
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 place-items-center rounded-full bg-indigo-700 text-xl font-semibold text-white"
        >
          {initials}
        </span>
        <p>
          <strong className="block text-xl text-zinc-950 dark:text-white">{name}</strong>
          <span className="text-zinc-500">{role}</span>
        </p>
      </div>

      <div className="mt-8 space-y-4 text-[1.0625rem] leading-relaxed text-zinc-800 dark:text-zinc-200 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-zinc-950 dark:[&_h2]:text-white [&_a]:underline [&_a]:underline-offset-2">
        <h2>Hakkında</h2>
        <p>
          {name}, Beykent Üniversitesi Kimya Mühendisliği bölümünden mezun oldu. Mühendislik eğitiminden gelen ölçme ve
          hesap titizliğini web projelerine taşıyor; hesap gerektiren konularda doğru ve kaynağı belli bilgi sunan siteler
          geliştiriyor.
        </p>

        <h2>Neden {siteConfig.name}?</h2>
        <p>
          Ay evreleri, dolunay tarihleri, tutulmalar ve Hicri takvim Türkiye&apos;de çok aranan konular. Ama bu konulardaki
          Türkçe kaynakların çoğu ya her ay yeniden yazılan kısa haberlerden ya da yabancı sitelerin çevirilerinden
          oluşuyordu; saatler çoğu zaman Türkiye&apos;ye göre değildi, kaynağı da yazmıyordu. {siteConfig.name}&apos;taki
          her tarih ve saat Türkiye saatine göre hesaplanıyor ve NASA, ABD Deniz Gözlemevi (USNO) ve Diyanet verileriyle
          karşılaştırılıyor. Nasıl hesapladığımız <Link href={PAGES.yontem.path}>Yöntem ve Doğruluk</Link> sayfasında,
          hangi bilgiyi nereden aldığımız <Link href={PAGES.kaynaklar.path}>Kaynaklar</Link> sayfasında açıkça yazıyor.
        </p>
        <blockquote className="border-l-4 border-indigo-300 pl-4 italic">
          <p>
            &quot;Bu gece ay hangi evrede, bir sonraki tutulma Türkiye&apos;den görülecek mi gibi soruların cevabı basit
            olmalı. {siteConfig.name}&apos;ı, bu cevabı tek bakışta, doğru ve kaynağıyla birlikte veren bir yer olsun diye
            hazırlıyorum. Bir hata görürseniz lütfen yazın; düzeltmeyi bir sorumluluk olarak görüyorum.&quot;
          </p>
          <p className="not-italic">
            <strong>{name}</strong>, {role}
          </p>
        </blockquote>

        <h2>Diğer çalışmaları</h2>
        <ul className="list-disc pl-6">
          <li>
            <a href="https://feriatlas.com" rel="noopener">
              Feriatlas
            </a>
            : Türkiye&apos;nin resmî tatilleri, izin planlama ve &quot;kaç gün kaldı&quot; soruları üzerine Türkçe rehber.
          </li>
        </ul>
        <p>
          Hata bildirimi ve sorular için: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: new URL(PAGE.path, siteConfig.url).toString(),
          mainEntity: {
            "@type": "Person",
            name,
            jobTitle: role,
            alumniOf: { "@type": "CollegeOrUniversity", name: "Beykent Üniversitesi" },
            worksFor: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          },
        }}
      />
    </CorporatePage>
  );
}
