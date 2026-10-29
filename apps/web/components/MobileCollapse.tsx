"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Telefonda uzun bir tabloyu ya da listeyi ilk satırlarıyla gösterir; altında "+ N ... daha göster" düğmesi olur.
 * Gizlenecek satırlara sunucuda `data-extra` verilir (örn. `data-extra={i >= 10 || undefined}`).
 * Satırlar sayfanın HTML'inde kalır, yalnız telefonda ekranda kapalı durur. Geniş ekranda düğme görünmez.
 */
export function MobileCollapse({
  hiddenCount,
  noun,
  children,
  className,
  variant = "table",
}: {
  /** Telefonda gizlenen satır sayısı. */
  hiddenCount: number;
  /** Düğmede sayının yanında yazan kelime: "il", "tutulma", "dolunay"... */
  noun: string;
  children: ReactNode;
  className?: string;
  /** "table": düğme kutunun alt satırı gibi; "cards": kartların altında ayrı, yuvarlak düğme. */
  variant?: "table" | "cards";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Sayfa içi bağlantı (#çapa) gizli bir satırı gösteriyorsa kutuyu açıp oraya git.
  useEffect(() => {
    function reveal() {
      const id = decodeURIComponent(location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      const root = ref.current;
      if (!target || !root || !root.contains(target) || !target.closest("[data-extra]")) return;
      setOpen(true);
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    }
    const first = requestAnimationFrame(reveal);
    window.addEventListener("hashchange", reveal);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("hashchange", reveal);
    };
  }, []);

  function toggle() {
    if (open) {
      // Kapatınca liste kısalır; ziyaretçi sayfanın çok aşağısında kalmasın.
      const top = ref.current?.getBoundingClientRect().top ?? 0;
      // 150 px: yapışkan üst menünün altında kalsın.
      if (top < 0) window.scrollTo({ top: window.scrollY + top - 150 });
    }
    setOpen(!open);
  }

  return (
    <div ref={ref} data-collapsed={open ? undefined : ""} className={className}>
      {children}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-indigo-600 hover:bg-zinc-50 sm:hidden dark:text-indigo-300 dark:hover:bg-zinc-800/50 ${
            variant === "cards"
              ? "mt-3 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              : "border-t border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <span aria-hidden className="text-base leading-none">
            {open ? "−" : "+"}
          </span>
          {open ? "Daha az göster" : `${hiddenCount} ${noun} daha göster`}
        </button>
      )}
    </div>
  );
}
