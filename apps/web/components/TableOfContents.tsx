"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CONTENT_ID } from "@/lib/content-id";
import { goToHeading, usePageHeadings, type PageHeading as Heading } from "@/lib/use-page-headings";

/** Sol kutunun yeri ve genişliği (px). Kutu ekranın sol kenarında durur, içeriğe yaslanmaz. */
const BOX_LEFT = 20;
const WIDTH = 220;
const BOX_TOP = 144;
/** Kullanıcı kutuyu kapattıysa tarayıcıda hatırlanır. */
const STORAGE_KEY = "lunatlas-icindekiler-kapali";

function readClosed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeClosed(value: boolean) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Tarayıcı depolamayı engelliyorsa tercih yalnızca bu sayfa için geçerli olur.
  }
}

/**
 * Sayfanın bölüm başlıklarından (h2) kendiliğinden oluşan içindekiler. Geniş ekranda sol kenarda sabit
 * durur ve okunan bölümü işaretler; yanındaki içerikle çakışacaksa, kullanıcı kapattıysa ya da ekran
 * darsa sağ alttaki düğmeyle alttan açılır. Üçten az bölümü olan sayfada görünmez.
 */
export function TableOfContents() {
  const pathname = usePathname();
  const headings = usePageHeadings();
  const [active, setActive] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [boxFits, setBoxFits] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLElement>(null);
  /** Kutuyla çakışabilecek içerik blokları (geniş ama tam ekran genişliğinde olmayan öğeler). */
  const blocksRef = useRef<HTMLElement[]>([]);

  useEffect(() => setClosed(readClosed()), []);

  // Okunan bölüm, görünme ve kutunun yanındaki içerikle çakışıp çakışmadığı.
  useEffect(() => {
    if (headings.length < 3) return;
    const root = document.getElementById(CONTENT_ID);
    const collectBlocks = () => {
      const vw = window.innerWidth;
      blocksRef.current = root
        ? [...root.querySelectorAll<HTMLElement>("main, section, div, table, figure, ol, ul, p, h1, h2, h3, img, svg")].filter(
            (el) => el.offsetWidth >= 120 && el.offsetWidth < vw * 0.95,
          )
        : [];
    };
    collectBlocks();

    let frame = 0;
    const compute = () => {
        // Yapışkan menünün (~120 px) hemen altına gelen başlık okunan bölüm sayılır.
        let current: string | null = null;
        for (const h of headings) {
          if (h.el.isConnected && h.el.getBoundingClientRect().top <= 240) current = h.key;
        }
        setActive(current ?? headings[0].key);

        // İlk başlığa gelince görün; içerik bitip "İlgili sayfalar" ve alt bilgi gelince kaybol.
        const isStarted = headings[0].el.getBoundingClientRect().top < window.innerHeight * 0.85;
        const contentBottom = root?.getBoundingClientRect().bottom ?? Infinity;
        const boxBottom = BOX_TOP + (boxRef.current?.offsetHeight ?? 420) + 16;
        setStarted(isStarted);
        setButtonVisible(isStarted && contentBottom > window.innerHeight * 0.6);

        // Kutunun hizasında, kutunun sağ kenarından sola uzanan bir içerik varsa çakışır.
        const limit = BOX_LEFT + WIDTH + 16;
        const overlaps = blocksRef.current.some((el) => {
          if (!el.isConnected) return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.top < boxBottom && r.bottom > BOX_TOP && r.left < limit;
        });
        setBoxFits(window.innerWidth >= 1024 && !overlaps && contentBottom > boxBottom);
    };
    // Kaydırırken her karede en fazla bir kez hesaplanır; ilk hesap hemen yapılır.
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(compute);
    };
    const onResize = () => {
      collectBlocks();
      update();
    };
    compute();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, [headings]);

  // Sayfa değişince alttan açılan listeyi kapat.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  if (headings.length < 3) return null;

  const showBox = started && boxFits && !closed;

  const go = (h: Heading) => {
    goToHeading(h);
    setOpen(false);
  };

  const list = (
    <ol className="space-y-0.5 text-sm">
      {headings.map((h) => (
        <li key={h.key}>
          <a
            href={h.el.id ? `#${h.el.id}` : "#"}
            onClick={(e) => {
              e.preventDefault();
              go(h);
            }}
            aria-current={active === h.key ? "location" : undefined}
            className={`block rounded-lg border-l-2 px-3 py-1.5 leading-snug transition ${
              active === h.key
                ? "border-indigo-500 bg-indigo-50 font-medium text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-100"
                : "border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      {/* Geniş ekran: sol kenarda sabit kutu (yalnızca içerikle çakışmıyorsa) */}
      <nav
        ref={boxRef}
        aria-label="İçindekiler"
        aria-hidden={!showBox}
        className={`fixed z-30 hidden max-h-[calc(100vh-11rem)] overflow-y-auto rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-sm backdrop-blur transition-opacity duration-300 lg:block dark:border-zinc-800 dark:bg-zinc-900/95 ${
          showBox ? "opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
        style={{ left: BOX_LEFT, top: BOX_TOP, width: WIDTH }}
      >
        <div className="flex items-center justify-between pb-2 pl-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">İçindekiler</p>
          <button
            type="button"
            onClick={() => {
              setClosed(true);
              writeClosed(true);
            }}
            aria-label="İçindekileri gizle"
            title="Gizle"
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {list}
      </nav>

      {/* Kutu görünmüyorsa: sağ altta küçük düğme, dokununca liste açılır */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="icindekiler-listesi"
        aria-label="İçindekiler"
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#05070d]/90 p-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/15 backdrop-blur transition-opacity duration-300 sm:px-4 ${
          buttonVisible && !showBox && !open ? "opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">İçindekiler</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="İçindekiler">
          <button type="button" aria-label="Kapat" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <nav
            id="icindekiler-listesi"
            className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-3xl bg-white p-4 pb-8 shadow-2xl sm:inset-x-auto sm:bottom-20 sm:right-4 sm:w-80 sm:rounded-3xl dark:bg-zinc-900"
          >
            <div className="mb-2 flex items-center justify-between px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">İçindekiler</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Kapat
              </button>
            </div>
            {list}
            {closed && (
              <button
                type="button"
                onClick={() => {
                  setClosed(false);
                  writeClosed(false);
                  setOpen(false);
                }}
                className="mt-3 hidden w-full rounded-xl px-3 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50 lg:block dark:text-indigo-300 dark:hover:bg-indigo-950/40"
              >
                Kenar kutusunu yeniden göster
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
