import Link from "next/link";
import { ALL_PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

export function SiteHeader() {
  const links = ALL_PAGES.filter((p) => p.inHeader);

  return (
    <header className="border-b border-white/10 bg-[#05070d] text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span aria-hidden="true" className="inline-block h-5 w-5 rounded-full bg-[#ecebe4] shadow-[inset_-6px_0_0_#1f2433]" />
          {siteConfig.name}
        </Link>
        <nav aria-label="Ana menü">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-300">
            {links.map((p) => (
              <li key={p.path}>
                <Link href={p.path} className="hover:text-white">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
