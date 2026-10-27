import Link from "next/link";

/** Takvim sayfalarındaki önceki/sonraki ay düğmesi. */
export function MonthLink({ href, label, children }: { href: string; label: string; children: string }) {
  return (
    <Link
      href={href}
      // Sonsuz ay bağlantılarının taranmasını önler; sayfanın tek adresi canonical ile belirtilir.
      rel="nofollow"
      scroll={false}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-xl text-zinc-200 hover:border-white/30 hover:text-white"
    >
      {children}
    </Link>
  );
}
