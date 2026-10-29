"use client";

import { useState, type ReactNode } from "react";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";

export interface FaceSample {
  /** Zaman (ms). */
  t: number;
  /** Dünya'dan görülen evre açısı (0 yeni ay, 180 dolunay). */
  phaseAngle: number;
  /** Ön yüzün aydınlık oranı (0-1). */
  illumination: number;
}

const fmt = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  day: "numeric",
  month: "long",
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
});

/** Ön yüz ve arka yüz yan yana; kaydırıcıyla önümüzdeki 30 gün. Veriler sunucuda 6 saatte bir hesaplanır. */
export function TwoFaces({ samples, newMoonIndex }: { samples: FaceSample[]; newMoonIndex: number }) {
  const [i, setI] = useState(0);
  const s = samples[i];
  const near = Math.round(s.illumination * 100);
  // Arka yüzün aydınlık oranı, ön yüzünkinin tümleyenidir (Güneş ayın her zaman yarısını aydınlatır).
  const far = 100 - near;

  return (
    <div className="overflow-hidden rounded-2xl bg-[#05070d] p-5 text-white shadow-sm sm:p-7">
      <div className="grid grid-cols-2 gap-4 sm:gap-10">
        <Face label="Bize bakan yüz" percent={near} note={near < 3 ? "Gece" : near > 97 ? "Tam gündüz" : undefined}>
          <MoonPhaseIcon phaseAngle={s.phaseAngle} size={260} title={`Ayın bize bakan yüzü, %${near} aydınlık`} />
        </Face>
        <Face label="Arka yüz" percent={far} note={far < 3 ? "Gece" : far > 97 ? "Tam gündüz" : undefined}>
          <MoonPhaseIcon
            side="far"
            phaseAngle={s.phaseAngle}
            size={260}
            title={`Ayın arka yüzü, %${far} aydınlık`}
          />
        </Face>
      </div>

      <div className="mt-6">
        <label htmlFor="gun" className="text-sm text-zinc-300">
          {i === 0 ? "Şu an" : fmt.format(new Date(s.t))}
        </label>
        <input
          id="gun"
          type="range"
          min={0}
          max={samples.length - 1}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          className="mt-2 w-full accent-indigo-400"
          aria-valuetext={fmt.format(new Date(s.t))}
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>Bugün</span>
          <span>30 gün sonra</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setI(0)}
            className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:border-white/30"
          >
            Şu ana dön
          </button>
          {newMoonIndex >= 0 && (
            <button
              type="button"
              onClick={() => setI(newMoonIndex)}
              className="rounded-full border border-indigo-400/50 bg-indigo-500/15 px-3 py-1.5 text-sm text-indigo-100 hover:border-indigo-300"
            >
              Yeni aya git: arka yüz tamamen aydınlık
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Face({
  label,
  percent,
  note,
  children,
}: {
  label: string;
  percent: number;
  note?: string;
  children: ReactNode;
}) {
  return (
    <figure className="flex flex-col items-center text-center">
      <div className="w-full max-w-[260px]">{children}</div>
      <figcaption className="mt-3">
        <p className="text-xs uppercase tracking-wider text-zinc-400">{label}</p>
        <p className="mt-1 text-3xl font-extralight tabular-nums sm:text-4xl">%{percent}</p>
        <p className="text-sm text-zinc-400">{note ?? "aydınlık"}</p>
      </figcaption>
    </figure>
  );
}
