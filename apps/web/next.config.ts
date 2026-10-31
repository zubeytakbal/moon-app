import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
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
