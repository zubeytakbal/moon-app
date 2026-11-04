"use client";

import { useMemo, useState } from "react";

/**
 * Ay ve yıldız fotoğrafı hesaplayıcı (tamamen tarayıcıda, anında):
 * - Ay fotoğrafta ne kadar büyük çıkar (35 mm eşdeğeri odak uzaklığına göre),
 * - Fotoğraf makinesi için başlangıç pozlaması ("Looney 11": f/11, enstantane = 1/ISO dolunayda; evre inceldikçe
 *   ışık azalır, pozlama uzatılır; yaygın fotoğrafçı kuralı),
 * - Yıldız fotoğrafı için en uzun pozlama ("500 kuralı": 500 / eşdeğer odak uzaklığı, saniye).
 * Sayfadan bu gecenin ay bilgisi gelir (aydınlık oranı ve ayın görünen çapı).
 */

const PHONE_ZOOMS = [
  { label: "1x (ana kamera)", eq: 26 },
  { label: "2x", eq: 52 },
  { label: "3x", eq: 77 },
  { label: "5x", eq: 120 },
  { label: "10x", eq: 240 },
  { label: "30x (dijital)", eq: 720 },
  { label: "100x (dijital)", eq: 2300 },
];
const SENSORS = [
  { label: "Tam kare", crop: 1 },
  { label: "APS-C (Canon)", crop: 1.6 },
  { label: "APS-C (Nikon, Sony, Fujifilm)", crop: 1.5 },
  { label: "Micro 4/3", crop: 2 },
];
const ISOS = [100, 200, 400, 800];
/** Tam kare sensörün genişliği (mm); 35 mm eşdeğeri hesap bunun üzerinden. */
const FRAME_WIDTH_MM = 36;

/** Looney 11'den evreye göre diyafram önerisi (aynı enstantane ile): ışık azaldıkça diyafram açılır. */
function apertureFor(illumination: number) {
  if (illumination > 0.9) return { f: "f/11", note: "dolunay ve dolunaya yakın" };
  if (illumination > 0.6) return { f: "f/8", note: "şişkin ay (1 durak fazla ışık)" };
  if (illumination > 0.35) return { f: "f/5.6", note: "dördün (2 durak fazla ışık)" };
  return { f: "f/4", note: "hilal (3 durak fazla ışık)" };
}

export function MoonPhotoCalculator({ illumination, moonDiameterDeg }: { illumination: number; moonDiameterDeg: number }) {
  const [device, setDevice] = useState<"telefon" | "makine">("telefon");
  const [zoom, setZoom] = useState(3);
  const [focal, setFocal] = useState(300);
  const [crop, setCrop] = useState(1.5);
  const [iso, setIso] = useState(100);

  const eq = device === "telefon" ? PHONE_ZOOMS[zoom].eq : focal * crop;
  const result = useMemo(() => {
    const moonOnFrameMm = eq * Math.tan((moonDiameterDeg * Math.PI) / 180);
    const share = moonOnFrameMm / FRAME_WIDTH_MM;
    // Tipik 24 megapiksel (6000 piksel genişlik) bir kare için ayın piksel çapı.
    const pixels = Math.round(share * 6000);
    const starSeconds = Math.floor(500 / eq);
    return { share, pixels, starSeconds };
  }, [eq, moonDiameterDeg]);
  const aperture = apertureFor(illumination);
  const pct = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: result.share < 0.1 ? 1 : 0 }).format(result.share * 100);

  const field = "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900";
  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Neyle çekiyorsunuz?
          <select className={field} value={device} onChange={(e) => setDevice(e.target.value as "telefon" | "makine")}>
            <option value="telefon">Telefon</option>
            <option value="makine">Fotoğraf makinesi</option>
          </select>
        </label>
        {device === "telefon" ? (
          <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            Yakınlaştırma
            <select className={field} value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>
              {PHONE_ZOOMS.map((z, i) => (
                <option key={z.label} value={i}>
                  {z.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
              Lens (mm)
              <input
                className={`${field} w-28`}
                type="number"
                min={10}
                max={3000}
                value={focal}
                onChange={(e) => setFocal(Math.max(10, Math.min(3000, Number(e.target.value) || 10)))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
              Sensör
              <select className={field} value={crop} onChange={(e) => setCrop(Number(e.target.value))}>
                {SENSORS.map((s) => (
                  <option key={s.label} value={s.crop}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
              ISO
              <select className={field} value={iso} onChange={(e) => setIso(Number(e.target.value))}>
                {ISOS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[#05070d] p-4 text-white">
          <dt className="text-xs font-semibold uppercase tracking-wider text-amber-300">Ay karede ne kadar?</dt>
          <dd className="mt-1 text-2xl font-light tabular-nums">%{pct}</dd>
          <dd className="mt-0.5 text-xs text-zinc-400">
            karenin genişliğinin; 24 MP bir karede ~{result.pixels.toLocaleString("tr-TR")} piksel
          </dd>
        </div>
        <div className="rounded-xl bg-[#05070d] p-4 text-white">
          <dt className="text-xs font-semibold uppercase tracking-wider text-amber-300">Bu gece için pozlama</dt>
          {device === "telefon" ? (
            <>
              <dd className="mt-1 text-lg font-light">Parlaklığı düşürün</dd>
              <dd className="mt-0.5 text-xs text-zinc-400">
                Aya dokunup basılı tutun, ay beyaz değil gri görünene kadar parlaklığı aşağı çekin.
              </dd>
            </>
          ) : (
            <>
              <dd className="mt-1 text-2xl font-light tabular-nums">
                {aperture.f} · 1/{iso} sn · ISO {iso}
              </dd>
              <dd className="mt-0.5 text-xs text-zinc-400">Başlangıç ayarı: {aperture.note}; deneyip düzeltin.</dd>
            </>
          )}
        </div>
        <div className="rounded-xl bg-[#05070d] p-4 text-white">
          <dt className="text-xs font-semibold uppercase tracking-wider text-amber-300">Yıldız fotoğrafı (500 kuralı)</dt>
          <dd className="mt-1 text-2xl font-light tabular-nums">
            {result.starSeconds > 0 ? `en çok ${result.starSeconds} sn` : "1 sn'den kısa"}
          </dd>
          <dd className="mt-0.5 text-xs text-zinc-400">Bundan uzun pozlamada yıldızlar çizgi gibi uzar.</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-zinc-500">
        Hesap 35 mm eşdeğeri odak uzaklığıyla yapılır ({Math.round(eq)} mm). Telefonların yakınlaştırma değerleri
        modele göre biraz değişir; yaklaşık değerlerdir. Ayın bu geceki görünen çapı: {moonDiameterDeg.toFixed(3).replace(".", ",")}°.
      </p>
    </div>
  );
}
