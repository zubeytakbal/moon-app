"use client";

import { useCallback, useState } from "react";
import type { SunDay } from "@moon-app/moon";

const DIRECTIONS = ["kuzey", "kuzeydoğu", "doğu", "güneydoğu", "güney", "güneybatı", "batı", "kuzeybatı"];
const direction = (azimuth: number | null) => (azimuth === null ? "" : DIRECTIONS[Math.round(azimuth / 45) % 8]);

function hm(minutes: number) {
  const m = Math.round(minutes);
  return `${Math.floor(m / 60)} sa ${m % 60} dk`;
}

/**
 * "Konumumu kullan": bulunduğunuz yerde bugün gün doğumu ve batımı, kendi saat diliminizle. Hesap tarayıcıda
 * yapılır (kütüphane düğmeye basınca yüklenir); konum cihazdan dışarı gönderilmez. Dünyanın her yerinde çalışır.
 */
export function SunHere() {
  const [state, setState] = useState<{ sun: SunDay; timeZone: string } | null>(null);
  const [message, setMessage] = useState("");

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setMessage("Tarayıcınız konum paylaşmayı desteklemiyor.");
      return;
    }
    setMessage("Konum alınıyor…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lib = await import("@moon-app/moon");
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul";
        const sun = lib.getSunDay(new Date(), {
          name: "Konumunuz",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          elevation: 0,
          timeZone,
        });
        setState({ sun, timeZone });
        setMessage("");
      },
      () => setMessage("Konum alınamadı. Tarayıcı izinlerini kontrol edin ya da yukarıdan bir yer seçin."),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 600_000 },
    );
  }, []);

  const t = (d: Date | null) =>
    d && state ? new Intl.DateTimeFormat("tr-TR", { timeZone: state.timeZone, hour: "2-digit", minute: "2-digit" }).format(d) : "-";

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Tam bulunduğunuz yer için</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            İlçede, tatilde ya da yurt dışındaysanız: konumunuza ve kendi saatinize göre bugünün saatleri.
          </p>
        </div>
        <button
          type="button"
          onClick={locate}
          className="rounded-xl bg-[#05070d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Konumumu kullan
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>}
      {state && (
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-zinc-500">Gün doğumu</dt>
            <dd className="text-lg font-semibold tabular-nums">{t(state.sun.rise)}</dd>
            <dd className="text-xs text-zinc-500">{direction(state.sun.riseAzimuth)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Gün batımı</dt>
            <dd className="text-lg font-semibold tabular-nums">{t(state.sun.set)}</dd>
            <dd className="text-xs text-zinc-500">{direction(state.sun.setAzimuth)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Hava kararır</dt>
            <dd className="text-lg font-semibold tabular-nums">{t(state.sun.civilDusk)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Gündüz</dt>
            <dd className="text-lg font-semibold tabular-nums">{hm(state.sun.minutes)}</dd>
          </div>
        </dl>
      )}
      {state && <p className="mt-3 text-xs text-zinc-500">Saatler cihazınızın saat dilimiyle ({state.timeZone}). Konumunuz hiçbir yere gönderilmez.</p>}
    </div>
  );
}
