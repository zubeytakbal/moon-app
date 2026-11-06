"use client";

import { useState } from "react";

/** Telefon ekranına uygun dikey kart (9:16). */
const W = 1080;
const H = 1920;
/** Ayın kart üzerindeki merkezi ve yarıçapı. */
const CX = W / 2;
const CY = 820;
const R = 410;

/**
 * "Doğduğum gün ay nasıldı" sonucunu indirilebilir bir görsele çevirir (duvar kâğıdı / paylaşım).
 * Her şey tarayıcıda çizilir; sunucuya istek gitmez. Ay, NASA SVS'nin kamu malı dolunay fotoğrafıdır;
 * evre gölgesi `MoonPhaseIcon` ile aynı geometriyle (yarım daire + terminatör elipsi) bindirilir.
 */
export function MoonCardDownload({
  phaseAngle,
  dateLabel,
  phaseName,
  detail,
  fullMoonName,
  fileName,
}: {
  phaseAngle: number;
  /** "12 Mart 1995 Pazar, saat 14:30" */
  dateLabel: string;
  phaseName: string;
  /** "%67 aydınlık · büyüyordu" */
  detail: string;
  fullMoonName?: string;
  /** Uzantısız dosya adı. */
  fileName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function download() {
    setBusy(true);
    setFailed(false);
    try {
      const blob = await drawCard({ phaseAngle, dateLabel, phaseName, detail, fullMoonName });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
        </svg>
        {busy ? "Hazırlanıyor…" : "Görseli indir"}
      </button>
      {failed && <p className="mt-2 text-sm text-red-300">Görsel hazırlanamadı. Sayfayı yenileyip tekrar deneyin.</p>}
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Rastgele görünen ama her seferinde aynı yıldızlar (aynı tarih aynı kartı versin). */
function stars(ctx: CanvasRenderingContext2D) {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 220; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    if (Math.hypot(x - CX, y - CY) < R + 40) continue;
    ctx.globalAlpha = 0.15 + rnd() * 0.55;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + rnd() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Evre gölgesi: kuzey yarımküreden görünüş. Geometri `MoonPhaseIcon` ile aynı. */
function shadowPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, phaseAngle: number) {
  const k = Math.cos((phaseAngle * Math.PI) / 180);
  const waxing = phaseAngle < 180;
  // Büyüyen ayda sol yarı karanlık: üstten sola dolaşarak alta.
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, waxing);
  // Terminatör: hilalde aydınlık tarafa, şişkin ayda karanlık tarafa kavislenir.
  const bulgeRight = waxing ? k > 0 : k < 0;
  ctx.ellipse(cx, cy, Math.max(Math.abs(k) * r, 0.01), r, 0, Math.PI / 2, -Math.PI / 2, bulgeRight);
  ctx.closePath();
}

async function drawCard(o: {
  phaseAngle: number;
  dateLabel: string;
  phaseName: string;
  detail: string;
  fullMoonName?: string;
}): Promise<Blob> {
  const [moon] = await Promise.all([loadImage("/moon/full-moon-2000.webp"), document.fonts?.ready]);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const font = getComputedStyle(document.body).fontFamily || "sans-serif";

  // Arka plan: sitenin koyu uzay tonu, hafif yıldızlar.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#05070d");
  bg.addColorStop(1, "#0b1020");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  stars(ctx);

  // Ayın etrafındaki hafif hale.
  const glow = ctx.createRadialGradient(CX, CY, R * 0.9, CX, CY, R * 1.35);
  glow.addColorStop(0, "rgba(199,210,254,0.16)");
  glow.addColorStop(1, "rgba(199,210,254,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, CY - R * 1.4, W, R * 2.8);

  // Ay fotoğrafı.
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(moon, CX - R, CY - R, R * 2, R * 2);
  // Gölge: küçük bir tuvalde çizilip büyütülür; böylece kenarı her tarayıcıda yumuşak olur
  // (Safari tuvalde bulanıklaştırma filtresini desteklemiyor).
  const s = 1 / 10;
  const small = document.createElement("canvas");
  small.width = Math.ceil(R * 2 * s) + 8;
  small.height = small.width;
  const sctx = small.getContext("2d")!;
  shadowPath(sctx, small.width / 2, small.height / 2, R * s, o.phaseAngle);
  sctx.fillStyle = "rgba(3,5,11,0.93)";
  sctx.fill();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const size = small.width / s;
  ctx.drawImage(small, CX - size / 2, CY - size / 2, size, size);
  ctx.restore();

  // Yazılar.
  ctx.textAlign = "center";
  ctx.fillStyle = "#a5b4fc";
  ctx.font = `600 34px ${font}`;
  ctx.fillText("DOĞDUĞUM GÜN AY", CX, 190);
  ctx.fillStyle = "#e4e4e7";
  ctx.font = `400 44px ${font}`;
  fitText(ctx, o.dateLabel, CX, 262, W - 120);

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 104px ${font}`;
  fitText(ctx, o.phaseName, CX, CY + R + 190, W - 120);
  ctx.fillStyle = "#d4d4d8";
  ctx.font = `300 50px ${font}`;
  fitText(ctx, o.detail, CX, CY + R + 270, W - 120);

  if (o.fullMoonName) {
    const y = CY + R + 400;
    ctx.font = `500 44px ${font}`;
    const label = `Doğum dolunayı: ${o.fullMoonName}`;
    const tw = Math.min(ctx.measureText(label).width, W - 160);
    ctx.fillStyle = "rgba(251,191,36,0.12)";
    ctx.strokeStyle = "rgba(252,211,77,0.35)";
    ctx.lineWidth = 2;
    roundRect(ctx, CX - tw / 2 - 40, y - 56, tw + 80, 84, 42);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fef3c7";
    fitText(ctx, label, CX, y, W - 160);
  }

  ctx.fillStyle = "#e4e4e7";
  ctx.font = `500 40px ${font}`;
  ctx.fillText("lunatlas.com", CX, H - 130);
  ctx.fillStyle = "#71717a";
  ctx.font = `400 26px ${font}`;
  ctx.fillText("Ay fotoğrafı: NASA Scientific Visualization Studio", CX, H - 80);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/png"),
  );
}

/** Yazı genişliği aşarsa yazı tipini küçültür. */
function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number) {
  const base = ctx.font;
  let px = Number(/(\d+)px/.exec(base)?.[1] ?? 40);
  while (ctx.measureText(text).width > max && px > 20) {
    px -= 2;
    ctx.font = base.replace(/\d+px/, `${px}px`);
  }
  ctx.fillText(text, x, y);
  ctx.font = base;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
