import Link from "next/link";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

/** "Zübeyt Akbal tarafından · Son güncelleme: …" imzası. İçerik sayfalarında başlığın altında durur. */
export function Byline({ updated, tone = "dark" }: { updated: string; tone?: "dark" | "light" }) {
  const updatedText = new Intl.DateTimeFormat(siteConfig.locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${updated}T12:00:00Z`));
  const muted = tone === "dark" ? "text-zinc-400" : "text-zinc-500";
  const strong = tone === "dark" ? "text-zinc-100" : "text-zinc-900 dark:text-white";
  return (
    <p className={`mt-4 text-sm ${muted}`}>
      <Link href={PAGES.yazar.path} className={`font-medium ${strong} underline-offset-2 hover:underline`} rel="author">
        {siteConfig.author.name}
      </Link>{" "}
      tarafından · Son güncelleme: <time dateTime={updated}>{updatedText}</time>
    </p>
  );
}
