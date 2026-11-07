import type { Metadata } from "next";
import type { SitePage } from "@/lib/pages";
import { siteConfig } from "@/site.config";

/** Sayfa yolunun paylaşım görseli adresindeki karşılığı: "/tr/dolunay" → "tr_dolunay". */
export function ogSlug(path: string) {
  return path.replace(/^\//, "").replaceAll("/", "_");
}

/** İngilizce sayfanın paylaşım bilgileri (görsel aynı `/og/[slug]` rotasında, İngilizce metinle üretilir). */
export function enPageOpenGraph(page: { path: string; title: string; description: string }): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    url: page.path,
    title: page.title,
    description: page.description,
    images: [{ url: `/og/${ogSlug(page.path)}`, width: 1200, height: 630, alt: page.title }],
  };
}

/** Bir sayfanın paylaşım (Open Graph) bilgileri; görsel `/og/[slug]` rotasında derlemede üretilir. */
export function pageOpenGraph(page: Pick<SitePage, "path" | "title" | "description">): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "tr_TR",
    siteName: siteConfig.name,
    url: page.path,
    title: page.title,
    description: page.description,
    images: [{ url: `/og/${ogSlug(page.path)}`, width: 1200, height: 630, alt: page.title }],
  };
}
