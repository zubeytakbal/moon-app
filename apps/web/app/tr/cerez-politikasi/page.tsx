import type { Metadata } from "next";
import Link from "next/link";
import { CorporatePage } from "@/components/CorporatePage";
import { Prose } from "@/components/Prose";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.cerez;

export const metadata: Metadata = {
  title: `Çerez Politikası | ${siteConfig.name}`,
  description: `${siteConfig.name} hangi çerezleri, ne amaçla kullanır? Zorunlu, istatistik ve reklam çerezleri ve bunları nasıl yönetebileceğiniz.`,
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

const COOKIES: { group: string; rows: { name: string; owner: string; purpose: string; duration: string }[] }[] = [
  {
    group: "Zorunlu çerezler",
    rows: [
      {
        name: "lunatlas_cerez (çerez tercihi)",
        owner: siteConfig.name,
        purpose: "Çerez bildiriminde yaptığınız seçimi hatırlar.",
        duration: "13 aya kadar",
      },
      {
        name: "__cf_bm",
        owner: "Cloudflare",
        purpose: "Siteyi otomatik saldırılara ve kötü amaçlı botlara karşı korur. Yalnızca gerektiğinde konur.",
        duration: "30 dakika",
      },
    ],
  },
  {
    group: "İstatistik çerezleri (izninizle)",
    rows: [
      {
        name: "_ga, _ga_*",
        owner: "Google Analytics",
        purpose: "Ziyaretleri sayar; aynı tarayıcının tekrar geldiğini rastgele bir kimlikle ayırt eder.",
        duration: "2 yıla kadar",
      },
    ],
  },
  {
    group: "Reklam çerezleri (izninizle)",
    rows: [
      {
        name: "__gads, __gpi, __eoi",
        owner: "Google AdSense",
        purpose: "Reklam gösterimini ölçer, aynı reklamın sürekli tekrarlanmasını önler.",
        duration: "6-13 ay",
      },
      {
        name: "IDE ve benzerleri",
        owner: "Google (doubleclick.net)",
        purpose: "İlgi alanlarınıza göre reklam gösterilmesini sağlar.",
        duration: "13 aya kadar",
      },
    ],
  },
];

export default function CookiePage() {
  return (
    <CorporatePage
      page={PAGE}
      updated="2026-10-29"
      lead="Çerezler, bir siteyi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Bu sayfada hangilerini, neden kullandığımızı anlatıyoruz."
    >
      <Prose>
        <h2>Çerezleri neden kullanıyoruz?</h2>
        <p>
          Sitemizin araçları (ay takvimi, doğuş-batış saatleri, çeviriciler) çalışmak için çereze ihtiyaç duymaz. Çerezleri
          üç amaçla kullanıyoruz: sitenin güvenliği, hangi sayfaların ne kadar okunduğunu görmek (Google Analytics) ve
          reklam göstermek (Google AdSense).
        </p>
        <p>
          Zorunlu çerezler dışındaki çerezler, ancak sitemize ilk girdiğinizde gösterilen çerez bildiriminde izin
          verirseniz kullanılır. İzin vermezseniz site yine tam olarak çalışır; reklamlar gösterilebilir ama
          kişiselleştirilmez.
        </p>

        <h2>Kullanılan çerezler</h2>
      </Prose>

      <div className="mt-6 space-y-8">
        {COOKIES.map((g) => (
          <section key={g.group}>
            <h3 className="text-lg font-semibold">{g.group}</h3>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Çerez</th>
                    <th className="px-4 py-2.5 font-medium">Sahibi</th>
                    <th className="px-4 py-2.5 font-medium">Amacı</th>
                    <th className="px-4 py-2.5 font-medium">Süresi</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.name} className="border-t border-zinc-200 align-top dark:border-zinc-800">
                      <td className="px-4 py-3 font-mono text-xs">{r.name}</td>
                      <td className="px-4 py-3">{r.owner}</td>
                      <td className="px-4 py-3">{r.purpose}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <Prose>
        <p>
          Google&apos;ın kullandığı çerezlerin güncel listesi ve süreleri için{" "}
          <a href="https://policies.google.com/technologies/cookies?hl=tr" target="_blank" rel="noopener">
            Google&apos;ın çerez sayfasına
          </a>{" "}
          bakabilirsiniz. Google çerez adlarını ve sürelerini zaman zaman değiştirebilir.
        </p>

        <h2>Çerezleri nasıl yönetebilirsiniz?</h2>
        <ul>
          <li>
            <strong>Çerez bildirimi:</strong> Seçiminizi sayfanın altındaki &quot;Çerez tercihleri&quot; bağlantısından
            istediğiniz zaman değiştirebilirsiniz.
          </li>
          <li>
            <strong>Tarayıcı ayarları:</strong> Tarayıcınızın ayarlarından çerezleri silebilir ya da tamamen
            engelleyebilirsiniz.
          </li>
          <li>
            <strong>Kişiselleştirilmiş reklamlar:</strong>{" "}
            <a href="https://myadcenter.google.com/" target="_blank" rel="noopener">
              Google Reklam Merkezim
            </a>{" "}
            sayfasından kapatabilirsiniz.
          </li>
          <li>
            <strong>Google Analytics:</strong>{" "}
            <a href="https://tools.google.com/dlpage/gaoptout?hl=tr" target="_blank" rel="noopener">
              Google Analytics devre dışı bırakma eklentisi
            </a>{" "}
            ile ziyaretlerinizin sayılmasını engelleyebilirsiniz.
          </li>
        </ul>

        <h2>Daha fazla bilgi</h2>
        <p>
          Kişisel verilerinizin nasıl işlendiğini <Link href={PAGES.gizlilik.path}>Gizlilik Politikası</Link> sayfasında
          anlatıyoruz. Sorularınız için <Link href={PAGES.iletisim.path}>İletişim</Link> sayfasından bize yazabilirsiniz.
        </p>
      </Prose>
    </CorporatePage>
  );
}
