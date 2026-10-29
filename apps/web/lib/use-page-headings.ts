"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CONTENT_ID } from "@/lib/content-id";

/**
 * Bir bölüm başlığı. Başlığa doğrudan öğe olarak bakılır; sayfanın HTML'i değiştirilmez (kimlik eklemek,
 * sonradan yüklenen parçalarda React'in sunucu HTML'iyle uyuşmazlık uyarısı vermesine yol açar).
 */
export interface PageHeading {
  key: string;
  text: string;
  el: HTMLElement;
}

/**
 * Sayfanın bölüm başlıkları (içerik alanındaki h2'ler), içindekiler için. `data-toc-skip` taşıyan başlıklar
 * ("Kısaca", "Kaynaklar" gibi her sayfada tekrarlananlar) atlanır; `data-toc-label` başlığın içindekiler
 * adını değiştirir. Sayfa parça parça yüklendiği (Suspense) için içerik değiştikçe yeniden okunur.
 */
export function usePageHeadings(): PageHeading[] {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<PageHeading[]>([]);

  useEffect(() => {
    const root = document.getElementById(CONTENT_ID);
    if (!root) return;
    const read = () => {
      const list: PageHeading[] = [...root.querySelectorAll<HTMLElement>("h2:not([data-toc-skip])")]
        .map((el, i) => ({ key: `${i}-${el.textContent}`, text: (el.dataset.tocLabel ?? el.textContent)?.trim() ?? "", el }))
        .filter((h) => h.text);
      setHeadings((prev) =>
        prev.length === list.length && prev.every((h, i) => h.el === list[i].el && h.text === list[i].text) ? prev : list,
      );
    };
    read();
    let timer: number | undefined;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(read, 200);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return headings;
}

/** Başlığa yumuşak kaydırma; başlığın kendi kimliği varsa adrese de yazılır (paylaşılan bağlantı o bölümü açar). */
export function goToHeading(h: PageHeading) {
  h.el.scrollIntoView({ behavior: "smooth", block: "start" });
  if (h.el.id) history.replaceState(null, "", `#${h.el.id}`);
}
