import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    // Araçlardaki seçim adresleri (?il=, ?ay=, ?bitki= …) hep ana adresi canonical gösterir; Google bunları
    // da tarayıp zamanını harcıyordu (5 Kasım 2026). Yalnız sayfa adresleri kapatılır, /_next dosyaları açık kalır.
    rules: { userAgent: "*", allow: "/", disallow: "/tr/*?" },
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
  };
}
