"use client";

import { useState } from "react";
import { ShareButton } from "@/components/ShareButton";

const NF = new Intl.NumberFormat("tr-TR");
const NF1 = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

/** Hızlar km/saat. Uzay araçları için Aya Yolculuk sayfasına bağlanır; burada gündelik araçlar var. */
const VEHICLES = [
  { key: "yuruyus", label: "Yürüyerek", speed: 5, note: "Saatte 5 km, hiç durmadan" },
  { key: "bisiklet", label: "Bisikletle", speed: 20, note: "Saatte 20 km" },
  { key: "araba", label: "Arabayla", speed: 100, note: "Otoyolda saatte 100 km" },
  { key: "tren", label: "Hızlı trenle", speed: 250, note: "Saatte 250 km" },
  { key: "ucak", label: "Yolcu uçağıyla", speed: 900, note: "Saatte 900 km" },
  { key: "ses", label: "Ses hızıyla", speed: 1235, note: "Havada saatte 1.235 km (uzayda ses yayılmaz, yalnız karşılaştırma)" },
  { key: "isik", label: "Işık hızıyla", speed: 299_792.458 * 3600, note: "Saniyede 299.792 km" },
] as const;

type VehicleKey = (typeof VEHICLES)[number]["key"];

/** Süreyi en anlaşılır birimle yazar: yıl, gün, saat ya da saniye. */
function durationText(hours: number) {
  if (hours < 1 / 60) return `${NF1.format(hours * 3600)} saniye`;
  if (hours < 48) return `${NF1.format(hours)} saat`;
  const days = hours / 24;
  if (days < 730) return `${NF.format(Math.round(days))} gün`;
  const years = days / 365.25;
  return `${NF1.format(years)} yıl`;
}

export function TravelCalculator({ km }: { km: number }) {
  const [key, setKey] = useState<VehicleKey>("araba");
  const v = VEHICLES.find((x) => x.key === key)!;
  const hours = km / v.speed;

  return (
    <div className="overflow-hidden rounded-2xl bg-[#05070d] p-5 text-white shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Aya kaç günde gidilir?</p>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Ulaşım aracı">
        {VEHICLES.map((x) => (
          <button
            key={x.key}
            type="button"
            role="radio"
            aria-checked={key === x.key}
            onClick={() => setKey(x.key)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              key === x.key ? "border-indigo-400 bg-indigo-500/20" : "border-white/15 text-zinc-300 hover:border-white/30"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <p className="mt-6 text-sm text-zinc-400">{v.label}, şu anki uzaklıkla ({NF.format(Math.round(km))} km):</p>
      <p className="mt-1 text-4xl font-extralight tabular-nums sm:text-5xl">{durationText(hours)}</p>
      <p className="mt-2 text-sm text-zinc-400">{v.note}.</p>
    </div>
  );
}

/** Lazerle ölçülen ortalama uzaklaşma hızı (NASA): yılda 3,8 cm. */
const CM_PER_YEAR = 3.8;

function compare(cm: number) {
  if (cm < 8) return "bir silginin boyu kadar";
  if (cm < 20) return "bir kurşun kalemin boyu kadar";
  if (cm < 35) return "bir okul cetvelinin boyu kadar";
  if (cm < 60) return "bir kolun dirsekten parmak ucuna kadarki boyu kadar";
  if (cm < 110) return "bir masanın yüksekliği kadar";
  if (cm < 200) return "bir kapının yüksekliğine yakın";
  return "iki metreyi aşan bir mesafe";
}

export function RecessionCalculator({ currentYear }: { currentYear: number }) {
  const [year, setYear] = useState("");
  const y = Number(year);
  const valid = year.length === 4 && y >= 1900 && y <= currentYear;
  const years = valid ? currentYear - y + 0.5 : 0;
  const cm = years * CM_PER_YEAR;
  const text = valid
    ? `Ben ${y} yılında doğduğumdan beri ay Dünya'dan yaklaşık ${NF.format(Math.round(cm))} santimetre uzaklaştı.`
    : "";

  return (
    <div className="overflow-hidden rounded-2xl bg-[#05070d] p-5 text-white shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
        Siz doğduğunuzdan beri ay ne kadar uzaklaştı?
      </p>
      <label htmlFor="dogum-yili" className="mt-3 block text-sm text-zinc-300">
        Doğum yılınız
      </label>
      <input
        id="dogum-yili"
        inputMode="numeric"
        maxLength={4}
        placeholder="örn. 1990"
        value={year}
        onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
        className="mt-1 w-32 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-lg tabular-nums text-white placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none"
      />
      {valid ? (
        <>
          <p className="mt-5 text-4xl font-extralight tabular-nums sm:text-5xl">
            {NF.format(Math.round(cm))} <span className="text-2xl">cm</span>
          </p>
          <p className="mt-2 text-zinc-300">
            {y} yılından bu yana ay Dünya&apos;dan yaklaşık bu kadar uzaklaştı: {compare(cm)}.
          </p>
          <div className="mt-4">
            <ShareButton title="Ay benden ne kadar uzaklaştı?" text={text} />
          </div>
        </>
      ) : (
        <p className="mt-5 text-sm text-zinc-400">
          Ay her yıl ortalama {NF1.format(CM_PER_YEAR)} santimetre uzaklaşıyor; tırnaklarımızın uzama hızına yakın.
          Doğum yılınızı yazın, sizin ömrünüzdeki payını hesaplayalım.
        </p>
      )}
    </div>
  );
}
