"use client";

import { useCallback, useEffect, useState } from "react";
import type { GeoLocation, MoonPosition } from "@moon-app/moon";

type MoonLib = typeof import("@moon-app/moon");

const DIRECTIONS = ["kuzey", "kuzeydoğu", "doğu", "güneydoğu", "güney", "güneybatı", "batı", "kuzeybatı"];
const TIME = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" });
const WEEKDAY_TIME = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function directionName(azimuth: number) {
  return DIRECTIONS[Math.round(azimuth / 45) % 8];
}

function capitalize(text: string) {
  return text.charAt(0).toLocaleUpperCase("tr-TR") + text.slice(1);
}

interface State {
  position: MoonPosition;
  /** Ay ufkun altındaysa bir sonraki doğuş, üstündeyse bir sonraki batış. */
  next: { kind: "rise" | "set"; date: Date; azimuth: number } | null;
}

/** iOS Safari pusula verisini ayrıca verir; diğer tarayıcılar `deviceorientationabsolute` olayını kullanır. */
interface CompassEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

type PermissionApi = { requestPermission?: () => Promise<"granted" | "denied"> };

/**
 * "Ay şu an nerede?": gökyüzü haritası (merkez tepe noktası, kenar ufuk) ve isteğe bağlı telefon
 * pusulası. Hesap tarayıcıda yapılır; konum paylaşılırsa cihazdan dışarı gönderilmez.
 */
export function MoonCompass({ city }: { city: GeoLocation }) {
  const [lib, setLib] = useState<MoonLib | null>(null);
  const [location, setLocation] = useState<GeoLocation>(city);
  const [state, setState] = useState<State | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // Hesap kütüphanesi sayfa açıldıktan sonra ayrı yüklenir; ilk görüntüyü yavaşlatmaz.
  useEffect(() => {
    import("@moon-app/moon").then(setLib);
  }, []);

  useEffect(() => setLocation(city), [city]);

  useEffect(() => {
    if (!lib) return;
    const update = () => {
      const now = new Date();
      const position = lib.getMoonPosition(now, location);
      const kind = position.altitude > 0 ? "set" : "rise";
      const date = lib.getNextMoonEvent(now, location, kind);
      setState({
        position,
        next: date ? { kind, date, azimuth: lib.getMoonPosition(date, location).azimuth } : null,
      });
    };
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, [lib, location]);

  const shareLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setMessage("Tarayıcınız konum paylaşmayı desteklemiyor.");
      return;
    }
    setMessage("Konum alınıyor…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          name: "Konumunuz",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          elevation: 0,
          timeZone: "Europe/Istanbul",
        });
        setMessage("");
      },
      () => setMessage("Konum alınamadı. Tarayıcı izinlerini kontrol edin ya da yukarıdan il seçin."),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 600_000 },
    );
  }, []);

  const startCompass = useCallback(async () => {
    const api = DeviceOrientationEvent as unknown as PermissionApi;
    if (typeof api.requestPermission === "function") {
      const result = await api.requestPermission().catch(() => "denied" as const);
      if (result !== "granted") {
        setMessage("Pusula izni verilmedi.");
        return;
      }
    }
    const onOrientation = (e: Event) => {
      const ev = e as CompassEvent;
      if (typeof ev.webkitCompassHeading === "number") setHeading(ev.webkitCompassHeading);
      else if (ev.absolute && typeof ev.alpha === "number") setHeading((360 - ev.alpha) % 360);
    };
    window.addEventListener("deviceorientationabsolute", onOrientation);
    window.addEventListener("deviceorientation", onOrientation);
    setMessage("Telefonu yere paralel tutun; harita baktığınız yöne göre döner.");
    setTimeout(() => setHeading((h) => (h === null ? -1 : h)), 3000);
  }, []);

  const pos = state?.position;
  const above = pos ? pos.altitude > 0 : false;
  const compassOn = heading !== null && heading >= 0;
  const rotation = compassOn ? -heading! : 0;

  // Gökyüzü haritası: merkez tepe noktası (90°), çember ufuk (0°).
  const R = 120;
  const marker = pos
    ? (() => {
        const r = above ? R * (1 - pos.altitude / 90) : R + 14;
        const a = (pos.azimuth * Math.PI) / 180;
        return { x: 150 + r * Math.sin(a), y: 150 - r * Math.cos(a) };
      })()
    : null;

  return (
    <section
      aria-labelledby="ay-nerede"
      className="starfield mt-12 overflow-hidden rounded-3xl bg-[#05070d] p-5 text-white sm:p-8"
    >
      <p className="text-sm font-medium uppercase tracking-wider text-indigo-300">Araç</p>
      <h2 id="ay-nerede" className="mt-1 text-2xl font-semibold tracking-tight">
        Ay şu an nerede?
      </h2>

      <div className="mt-6 grid items-center gap-8 md:grid-cols-[300px_1fr]">
        <div className="mx-auto w-full max-w-[300px]">
          <svg viewBox="0 0 300 300" role="img" aria-label="Gökyüzü haritası: ayın yönü ve yüksekliği" className="h-auto w-full">
            <g transform={`rotate(${rotation} 150 150)`} style={{ transition: "transform 0.3s" }}>
              <circle cx={150} cy={150} r={R} fill="#0b1226" stroke="#ffffff" strokeOpacity={0.25} />
              <circle cx={150} cy={150} r={R * (2 / 3)} fill="none" stroke="#ffffff" strokeOpacity={0.08} />
              <circle cx={150} cy={150} r={R / 3} fill="none" stroke="#ffffff" strokeOpacity={0.08} />
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i * 45 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={150}
                    y1={150}
                    x2={150 + R * Math.sin(a)}
                    y2={150 - R * Math.cos(a)}
                    stroke="#ffffff"
                    strokeOpacity={0.07}
                  />
                );
              })}
              {(["K", "D", "G", "B"] as const).map((l, i) => {
                const a = (i * 90 * Math.PI) / 180;
                return (
                  <text
                    key={l}
                    x={150 + (R + 16) * Math.sin(a)}
                    y={150 - (R + 16) * Math.cos(a) + 5}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight={600}
                    fill={l === "K" ? "#fca5a5" : "#a1a1aa"}
                    transform={`rotate(${-rotation} ${150 + (R + 16) * Math.sin(a)} ${150 - (R + 16) * Math.cos(a)})`}
                  >
                    {l}
                  </text>
                );
              })}
              {marker && (
                <g>
                  <line x1={150} y1={150} x2={marker.x} y2={marker.y} stroke="#fde68a" strokeOpacity={0.35} strokeDasharray="3 4" />
                  <circle cx={marker.x} cy={marker.y} r={13} fill="#fde68a" fillOpacity={above ? 0.18 : 0.05} />
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={8}
                    fill={above ? "#f4f4f5" : "none"}
                    stroke="#f4f4f5"
                    strokeDasharray={above ? undefined : "2 2"}
                  />
                </g>
              )}
            </g>
            {compassOn && <path d="M150 8 l-7 12 h14 z" fill="#818cf8" />}
          </svg>
          <p className="mt-2 text-center text-xs text-zinc-400">
            Merkez: tepeniz · Çember: ufuk{compassOn ? " · Üstteki ok: baktığınız yön" : ""}
          </p>
        </div>

        <div aria-live="polite">
          <p className="text-sm text-zinc-400">{location.name}</p>
          {pos ? (
            above ? (
              <>
                <p className="mt-1 text-3xl font-semibold sm:text-4xl">{capitalize(directionName(pos.azimuth))} yönünde</p>
                <p className="mt-2 text-lg text-zinc-200">
                  Ufuktan <span className="tabular-nums">{Math.round(pos.altitude)}°</span> yüksekte · pusula yönü{" "}
                  <span className="tabular-nums">{Math.round(pos.azimuth)}°</span>
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-3xl font-semibold sm:text-4xl">Ufkun altında</p>
                <p className="mt-2 text-lg text-zinc-200">
                  Ay şu an görünmüyor; {directionName(pos.azimuth)} yönünde, ufkun{" "}
                  <span className="tabular-nums">{Math.round(-pos.altitude)}°</span> altında.
                </p>
              </>
            )
          ) : (
            <p className="mt-1 text-3xl font-semibold text-zinc-500">Hesaplanıyor…</p>
          )}
          {state?.next && (
            <p className="mt-3 text-zinc-300">
              {state.next.kind === "rise" ? "Doğuş" : "Batış"}: {WEEKDAY_TIME.format(state.next.date)},{" "}
              {directionName(state.next.azimuth)} yönünde
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={shareLocation}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
            >
              Konumumu kullan
            </button>
            <button
              type="button"
              onClick={startCompass}
              className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Pusulayı aç (telefon)
            </button>
          </div>
          {heading === -1 && (
            <p className="mt-3 text-sm text-amber-200">Bu cihazda pusula bulunamadı. Harita kuzey yukarıda kalır.</p>
          )}
          {message && heading !== -1 && <p className="mt-3 text-sm text-zinc-300">{message}</p>}
          <p className="mt-4 text-xs text-zinc-500">
            Konumunuz yalnızca bu cihazda hesap için kullanılır, hiçbir yere gönderilmez. Telefon pusulası birkaç derece
            sapabilir. Saat {state ? TIME.format(new Date()) : "--:--"} itibarıyla, 30 saniyede bir yenilenir.
          </p>
        </div>
      </div>
    </section>
  );
}
