import type { Metadata } from "next";
import type { SitePage } from "@/lib/pages";
import { siteConfig } from "@/site.config";

/** Bir sayfanın paylaşım (Open Graph) bilgileri; görsel `/og` rotasında üretilir. */
export function pageOpenGraph(page: Pick<SitePage, "path" | "title" | "description">): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "tr_TR",
    siteName: siteConfig.name,
    url: page.path,
    title: page.title,
    description: page.description,
    images: [{ url: `/og?p=${encodeURIComponent(page.path)}`, width: 1200, height: 630, alt: page.title }],
  };
}
