"use client";

import { useEffect, useId, useState } from "react";
import { MoonPhaseIcon } from "./MoonPhaseIcon";

const SYNODIC = 29.530589;

/** Evre adları. Ana evreler bir an olduğu için açının ±6° yakınında o ad verilir. */
function phaseName(angle: number) {
  const principal: [number, string][] = [
    [0, "Yeni ay"],
    [90, "İlk dördün"],
    [180, "Dolunay"],
    [270, "Son dördün"],
    [360, "Yeni ay"],
  ];
  for (const [a, name] of principal) if (Math.abs(angle - a) <= 6) return name;
  if (angle < 90) return "Büyüyen hilal";
  if (angle < 180) return "Büyüyen şişkin ay";
  if (angle < 270) return "Küçülen şişkin ay";
  return "Küçülen hilal";
}

/** Saat (ondalık) → "18:00". Kaba hesap olduğu için yarım saate yuvarlanır. */
function clock(hours: number) {
  const h = (((Math.round(hours * 2) / 2) % 24) + 24) % 24;
  return `${String(Math.floor(h)).padStart(2, "0")}:${h % 1 ? "30" : "00"}`;
}

const CX = 160;
const CY = 160;
const ORBIT = 105;

/**
 * Etkileşimli evre modeli: kaydırıcı ayı yörüngede döndürür, sağda ayın Dünya'dan görünüşü,
 * aydınlık oranı ve yaklaşık doğuş-batış saatleri değişir. `todayAngle` bugünün evre açısıdır.
 */
export function PhaseModel({ todayAngle }: { todayAngle: number }) {
  const id = useId();
  const [angle, setAngle] = useState(Math.round(todayAngle));
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setAngle((a) => (a + 2) % 360), 60);
    return () => clearInterval(timer);
  }, [playing]);

  const t = ((180 + angle) * Math.PI) / 180;
  const moon = { x: CX + ORBIT * Math.cos(t), y: CY - ORBIT * Math.sin(t) };
  const illumination = (1 - Math.cos((angle * Math.PI) / 180)) / 2;
  const ageDays = (angle / 360) * SYNODIC;
  // Ay, Güneş'ten her gün ~12° geri kalır: evre açısı / 15 saat kadar geç doğar (ekinoks civarı, kaba).
  const lag = angle / 15;

  return (
    <section
      aria-labelledby={`${id}-baslik`}
      className="starfield mt-12 overflow-hidden rounded-3xl bg-[#05070d] p-5 text-white sm:p-8"
    >
      <p className="text-sm font-medium uppercase tracking-wider text-indigo-300">Kendiniz deneyin</p>
      <h2 id={`${id}-baslik`} className="mt-1 text-2xl font-semibold tracking-tight">
        Ayı yörüngesinde döndürün
      </h2>
      <p className="mt-2 text-zinc-300">
        Kaydırıcıyı oynatın: soldaki çizimde ay Dünya&apos;nın etrafında dolaşır, sağda aynı anda Türkiye&apos;den
        nasıl göründüğü değişir.
      </p>

      <div className="mt-6 grid items-center gap-6 md:grid-cols-2">
        <svg viewBox="0 0 320 320" className="mx-auto h-auto w-full max-w-[320px]" role="img" aria-label="Ayın Dünya etrafındaki konumu">
          {[-110, -55, 0, 55, 110].map((dy) => (
            <line key={dy} x1={4} y1={CY + dy} x2={34} y2={CY + dy} stroke="#fbbf24" strokeWidth={2} strokeOpacity={0.8} />
          ))}
          <text x={4} y={30} fill="#fbbf24" fontSize={13} fontWeight={600}>
            Güneş ışığı →
          </text>
          <circle cx={CX} cy={CY} r={ORBIT} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeDasharray="4 6" />
          <circle cx={CX} cy={CY} r={20} fill="#2563eb" />
          <path d={`M ${CX} ${CY - 20} A 20 20 0 0 1 ${CX} ${CY + 20} Z`} fill="#000" fillOpacity={0.55} />
          {/* Dünya'dan aya bakış çizgisi */}
          <line x1={CX} y1={CY} x2={moon.x} y2={moon.y} stroke="#a5b4fc" strokeOpacity={0.5} strokeDasharray="2 4" />
          <circle cx={moon.x} cy={moon.y} r={12} fill="#1f2433" stroke="#ffffff" strokeOpacity={0.25} />
          <path d={`M ${moon.x} ${moon.y - 12} A 12 12 0 0 0 ${moon.x} ${moon.y + 12} Z`} fill="#ecebe4" />
        </svg>

        <div className="flex items-center gap-5 sm:gap-8">
          <div className="w-32 shrink-0 sm:w-40">
            <MoonPhaseIcon phaseAngle={angle} size={160} title={phaseName(angle)} />
          </div>
          <div aria-live="polite">
            <p className="text-2xl font-semibold sm:text-3xl">{phaseName(angle)}</p>
            <p className="mt-1 text-zinc-300">
              %{Math.round(illumination * 100)} aydınlık · {ageDays.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}{" "}
              günlük
            </p>
            <dl className="mt-3 space-y-0.5 text-sm text-zinc-400">
              <div>
                <dt className="inline">Doğuş: </dt>
                <dd className="inline tabular-nums text-zinc-200">~{clock(6 + lag)}</dd>
              </div>
              <div>
                <dt className="inline">En yüksekte: </dt>
                <dd className="inline tabular-nums text-zinc-200">~{clock(12 + lag)}</dd>
              </div>
              <div>
                <dt className="inline">Batış: </dt>
                <dd className="inline tabular-nums text-zinc-200">~{clock(18 + lag)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor={`${id}-aci`} className="sr-only">
          Ayın yörüngedeki konumu (gün)
        </label>
        <input
          id={`${id}-aci`}
          type="range"
          min={0}
          max={359}
          value={angle}
          onChange={(e) => {
            setPlaying(false);
            setAngle(Number(e.target.value));
          }}
          className="w-full accent-indigo-400"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>Yeni ay</span>
          <span>İlk dördün</span>
          <span>Dolunay</span>
          <span>Son dördün</span>
          <span>Yeni ay</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
          >
            {playing ? "Durdur" : "Bir ayı oynat"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setAngle(Math.round(todayAngle));
            }}
            className="rounded-xl border border-white/25 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Bugüne dön
          </button>
        </div>
      </div>
      <p className="mt-4 text-xs text-zinc-500">
        Saatler kabacadır: ay her gün ortalama 50 dakika geç doğar. Gerçek saatler mevsime ve ile göre değişir; bugünün
        saatleri için Bugün Ay Nasıl? sayfasına bakın.
      </p>
    </section>
  );
}
