import type { MetadataRoute } from "next";
import { EN_ALL_PAGES, EN_HOME_PATH } from "@/lib/en/pages";
import { ALL_PAGES, HOME_PATH, PAGES, type PageGroup } from "@/lib/pages";
import { isLanguagePublished } from "@/lib/shell";
import { siteConfig } from "@/site.config";

/** İçeriği her gün değişen bölümler. */
const DAILY = new Set<PageGroup>(["bugun", "gelenek-burclar"]);

/**
 * Site haritası yalnızca elle tutulan sayfa listelerinden üretilir (bkz. CLAUDE.md, kırmızı çizgiler). İngilizce sayfalar
 * dil yayına açılınca (`published: true`) eklenir. Aynı soruya cevap veren Türkçe ve İngilizce sayfalar hreflang ile
 * birbirine bağlanır (Google'a "bu sayfanın öbür dildeki karşılığı şu"); x-default İngilizce sürümdür.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteConfig.url).toString();
  const english = isLanguagePublished("en");
  const pairs = new Map<string, string>(english ? [[HOME_PATH, EN_HOME_PATH], ...EN_ALL_PAGES.filter((p) => p.tr).map((p) => [p.tr!, p.path] as [string, string])] : []);
  const enToTr = new Map([...pairs].map(([tr, en]) => [en, tr]));
  const languages = (tr: string, en: string) => ({ languages: { "tr-TR": url(tr), "en-US": url(en), "x-default": url(en) } });

  const tr: MetadataRoute.Sitemap = [
    { url: url(HOME_PATH), changeFrequency: "daily", priority: 1, ...(pairs.has(HOME_PATH) ? { alternates: languages(HOME_PATH, pairs.get(HOME_PATH)!) } : {}) },
    ...ALL_PAGES.map((p) => ({
      url: url(p.path),
      changeFrequency: (DAILY.has(p.group) || p.path === PAGES.ayTakvimi.path ? "daily" : "weekly") as "daily" | "weekly",
      priority: p.featured ? 0.8 : 0.6,
      ...(pairs.has(p.path) ? { alternates: languages(p.path, pairs.get(p.path)!) } : {}),
    })),
  ];
  if (!english) return tr;

  const en: MetadataRoute.Sitemap = [
    { url: url(EN_HOME_PATH), changeFrequency: "daily", priority: 1, alternates: languages(HOME_PATH, EN_HOME_PATH) },
    ...EN_ALL_PAGES.map((p) => ({
      url: url(p.path),
      changeFrequency: (p.group === "about" ? "monthly" : "daily") as "monthly" | "daily",
      priority: p.group === "about" ? 0.3 : p.featured ? 0.8 : 0.6,
      ...(enToTr.has(p.path) ? { alternates: languages(enToTr.get(p.path)!, p.path) } : {}),
    })),
  ];
  return [...tr, ...en];
}
