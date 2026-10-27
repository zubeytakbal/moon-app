import Link from "next/link";
import { GROUP_NAMES, HOME_PATH, type SitePage } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { JsonLd } from "./JsonLd";

/** Sayfa yolu: Ana Sayfa › Grup › Sayfa. Google için BreadcrumbList verisi de üretir. */
export function Breadcrumb({ page, tone = "light" }: { page: SitePage; tone?: "light" | "dark" }) {
  // Grup sayfaları henüz yok; grup adı bağlantısız gösterilir.
  const items: { name: string; path?: string }[] = [
    { name: "Ana Sayfa", path: HOME_PATH },
    { name: GROUP_NAMES[page.group] },
    { name: page.title, path: page.path },
  ];
  const linked = items.filter((i) => i.path);
  const colors =
    tone === "dark"
      ? "text-zinc-400 [&_a:hover]:text-white"
      : "text-zinc-500 [&_a:hover]:text-zinc-900 dark:[&_a:hover]:text-zinc-100";

  return (
    <nav aria-label="Sayfa yolu" className={`text-sm ${colors}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.name} className="flex items-center gap-2">
              {item.path && !isLast ? (
                <Link href={item.path} className="hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.name}</span>
              )}
              {!isLast && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: linked.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: new URL(item.path!, siteConfig.url).toString(),
          })),
        }}
      />
    </nav>
  );
}
