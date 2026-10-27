import Link from "next/link";
import { pagesByGroup } from "@/lib/pages";
import { siteConfig } from "@/site.config";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-[#05070d] text-zinc-300">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-12 sm:grid-cols-[2fr_3fr]">
        <div>
          <p className="font-semibold text-white">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            Ay evreleri, ay takvimi ve doğuş-batış saatleri. Hesaplamalar astronomik modellerle, Türkiye saatine göre
            yapılır.
          </p>
        </div>
        <nav aria-label="Site haritası" className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {pagesByGroup().map((g) => (
            <div key={g.group}>
              <p className="text-sm font-semibold text-white">{g.name}</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                {g.pages.map((p) => (
                  <li key={p.path}>
                    <Link href={p.path} className="hover:text-white hover:underline">
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
