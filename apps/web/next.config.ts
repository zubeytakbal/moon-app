import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // Kök adres Türkçe ana sayfaya KALICI (308) yönlenir: geçici (307) yönlendirmede Google ana sayfayı
  // "lunatlas.com/" olarak dizinde tutuyordu (Search Console, 5 Kasım 2026). İngilizce yayına çıkınca
  // kökün ne yapacağına yeniden karar verilecek (ingilizce kolunda şimdilik geçici yönlendirme var).
  async redirects() {
    return [{ source: "/", destination: "/tr", permanent: true }];
  },
  cacheComponents: true,
  // Cloudflare Workers'ta süresi dolan sayfanın sunucuda yeniden üretimi takılıyor (Next "setTimeout" uyarısı,
  // Error 1101; 31 Ekim 2026). Kesin yenileme süresi 30 güne çekildi: yenileme başarısız olsa da önceki sayfa
  // sunulur, site çökmez. Sayfalar her gece zamanlanmış yeniden yayınla tazelenir (.github/workflows/gunluk-yayin.yml).
  cacheLife: {
    hours: { stale: 300, revalidate: 3600, expire: 2_592_000 },
    days: { stale: 300, revalidate: 86_400, expire: 2_592_000 },
  },
  // Görseller zaten doğru boyutta WebP olarak hazırlanıyor; Cloudflare'de ayrı görsel servisi gerekmesin.
  images: { unoptimized: true },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
