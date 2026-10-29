"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

/**
 * Çerez bildirimi ve Google Analytics.
 * Analytics yalnız ziyaretçi "Kabul et" derse yüklenir; reddedilirse Google'a hiçbir şey gönderilmez.
 * Seçim kendi çerezimizde 13 ay saklanır (Çerez Politikası tablosundaki "Çerez tercihi").
 * AdSense gelince Google'ın sertifikalı bildirimine (CMP) geçilecek; reklam izinleri şimdiden "reddedildi" başlar.
 */

const COOKIE = "lunatlas_cerez";
const MAX_AGE = 60 * 60 * 24 * 395;
/** Alt bilgideki "Çerez tercihleri" düğmesi bu olayla bildirimi yeniden açar. */
export const OPEN_CONSENT_EVENT = "lunatlas:cerez-tercihleri";

type Choice = "evet" | "hayir" | null;
type State = { choice: Choice; open: boolean };

let state: State = { choice: null, open: false };
const listeners = new Set<() => void>();

function readChoice(): Choice {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=(evet|hayir)`));
  return (m?.[1] as Choice) ?? null;
}

function setState(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    const choice = readChoice();
    state = { choice, open: choice === null };
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const SERVER_STATE: State = { choice: null, open: false };

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let analyticsLoaded = false;

function loadAnalytics() {
  if (analyticsLoaded) return;
  // Yerel geliştirmede ve önizlemelerde sayma.
  if (location.hostname !== new URL(siteConfig.url).hostname) return;
  analyticsLoaded = true;
  const id = siteConfig.gaMeasurementId;
  window.dataLayer = window.dataLayer || [];
  // gtag, argümanları dizi olarak değil "arguments" nesnesi olarak bekler.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  }
  gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  gtag("js", new Date());
  gtag("config", id);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
}

/** İzin geri alınınca Analytics çerezlerini siler (alan adının kendisinde ve üst alanında). */
function clearAnalyticsCookies() {
  const host = location.hostname;
  for (const part of document.cookie.split("; ")) {
    const name = part.split("=")[0];
    if (name === "_ga" || name.startsWith("_ga_")) {
      for (const domain of ["", `; domain=${host}`, `; domain=.${host}`]) {
        document.cookie = `${name}=; max-age=0; path=/${domain}`;
      }
    }
  }
}

function decide(choice: "evet" | "hayir") {
  const previous = state.choice;
  document.cookie = `${COOKIE}=${choice}; max-age=${MAX_AGE}; path=/; samesite=lax; secure`;
  setState({ choice, open: false });
  if (choice === "evet") loadAnalytics();
  else if (previous === "evet") {
    clearAnalyticsCookies();
    // Yüklenmiş Analytics ancak sayfa yenilenince tamamen durur.
    if (analyticsLoaded) location.reload();
  }
}

export function CookieConsent() {
  const { choice, open } = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );

  useEffect(() => {
    if (choice === "evet") loadAnalytics();
  }, [choice]);

  useEffect(() => {
    const reopen = () => setState({ ...state, open: true });
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Çerez bildirimi"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0b0f1a]/95 p-5 text-zinc-300 shadow-2xl shadow-black/50 backdrop-blur sm:flex sm:items-center sm:gap-6">
        <p className="text-sm leading-relaxed">
          Hangi sayfaların okunduğunu görmek için Google Analytics çerezlerini kullanmak istiyoruz. İzin vermezseniz
          site aynen çalışır ve Google&apos;a hiçbir ziyaret bilgisi gönderilmez.{" "}
          <Link href={PAGES.cerez.path} className="text-indigo-300 underline-offset-2 hover:underline">
            Çerez Politikası
          </Link>
        </p>
        <div className="mt-4 grid shrink-0 grid-cols-2 gap-2 sm:mt-0 sm:w-64">
          <button
            type="button"
            onClick={() => decide("hayir")}
            className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Reddet
          </button>
          <button
            type="button"
            onClick={() => decide("evet")}
            className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Kabul et
          </button>
        </div>
      </div>
    </div>
  );
}

/** Alt bilgideki "Çerez tercihleri" bağlantısı: bildirimi yeniden açar. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))} className={className}>
      Çerez tercihleri
    </button>
  );
}
