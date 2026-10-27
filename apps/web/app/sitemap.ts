import type { MetadataRoute } from "next";
import { ALL_PAGES, HOME_PATH } from "@/lib/pages";
import { siteConfig } from "@/site.config";

/** Site haritası yalnızca elle tutulan sayfa listesinden üretilir (bkz. CLAUDE.md, kırmızı çizgiler). */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteConfig.url).toString();
  return [
    { url: url(HOME_PATH), changeFrequency: "daily", priority: 1 },
    ...ALL_PAGES.map((p) => ({
      url: url(p.path),
      changeFrequency: (p.group === "araclar" || p.group === "burclar" ? "daily" : "weekly") as "daily" | "weekly",
      priority: p.featured ? 0.8 : 0.6,
    })),
  ];
}
