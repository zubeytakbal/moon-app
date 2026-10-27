import Link from "next/link";
import { pagesByGroup } from "@/lib/pages";
import { siteConfig } from "@/site.config";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid w-full max-w-2xl gap-8 px-4 py-10 sm:grid-cols-2">
        <div>
          <p className="font-semibold">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
            Ay evreleri, ay takvimi ve doğuş-batış saatleri. Hesaplamalar astronomik modellerle, Türkiye saatine göre
            yapılır.
          </p>
        </div>
        <nav aria-label="Site haritası" className="grid grid-cols-2 gap-6">
          {pagesByGroup().map((g) => (
            <div key={g.group}>
              <p className="text-sm font-semibold">{g.name}</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                {g.pages.map((p) => (
                  <li key={p.path}>
                    <Link href={p.path} className="hover:text-zinc-900 hover:underline dark:hover:text-zinc-100">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
