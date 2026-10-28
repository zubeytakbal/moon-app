import type { Metadata } from "next";
import Link from "next/link";
import { CorporatePage } from "@/components/CorporatePage";
import { Prose } from "@/components/Prose";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.iletisim;

export const metadata: Metadata = {
  title: `İletişim | ${siteConfig.name}`,
  description: `${siteConfig.name} ile iletişim: hata bildirimi, öneri ve sorularınız için e-posta adresimiz.`,
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function ContactPage() {
  const email = siteConfig.contactEmail;
  return (
    <CorporatePage
      page={PAGE}
      updated="2026-10-28"
      lead="Bir hata mı gördünüz, bir öneriniz mi var? Bize e-postayla yazabilirsiniz."
    >
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">E-posta</p>
        <a
          href={`mailto:${email}`}
          className="mt-2 inline-block break-all text-2xl font-semibold text-indigo-700 underline-offset-4 hover:underline dark:text-indigo-300 sm:text-3xl"
        >
          {email}
        </a>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Mesajları okuyup mümkün olan en kısa sürede cevaplamaya çalışıyoruz.
        </p>
      </div>

      <Prose>
        <h2>Hata bildirirken</h2>
        <p>Bir tarihin ya da saatin yanlış olduğunu düşünüyorsanız, kontrol etmemizi kolaylaştırmak için şunları yazın:</p>
        <ul>
          <li>Hangi sayfa (adresini kopyalayabilirsiniz)</li>
          <li>Hangi tarih ya da bilgi, varsa seçtiğiniz il</li>
          <li>Karşılaştırdığınız kaynak (örneğin bir gözlemevi ya da resmî takvim)</li>
        </ul>
        <p>
          Hesaplarımızı nasıl doğruladığımızı <Link href={PAGES.yontem.path}>Yöntem ve Doğruluk</Link> sayfasında
          bulabilirsiniz. Doğrulanan hataları düzeltip sayfayı güncelliyoruz.
        </p>

        <h2>Bilmeniz gerekenler</h2>
        <ul>
          <li>
            Ramazan, bayram ve kandil tarihleri hakkında resmî bilgi veremiyoruz; bunun için Diyanet İşleri
            Başkanlığı&apos;na başvurun.
          </li>
          <li>Kişisel burç yorumu ya da fal hizmeti vermiyoruz.</li>
          <li>
            E-postanızdaki bilgileri yalnızca size cevap vermek için kullanırız. Ayrıntılar{" "}
            <Link href={PAGES.gizlilik.path}>Gizlilik Politikası</Link> sayfasında.
          </li>
        </ul>
      </Prose>
    </CorporatePage>
  );
}
