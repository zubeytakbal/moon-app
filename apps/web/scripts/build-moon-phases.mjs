/**
 * Ay evresi görsellerini üretir: `public/moon/phases/p00-160.webp` … `p59-640.webp` (her 6°'lik evre için bir görüntü).
 *
 * Kaynak: NASA SVS "Moon Phase and Libration, 2026" (svs.gsfc.nasa.gov/5587), 730×730 kareler, kamu malı.
 * Kare N = 2026'nın başından itibaren UTC saat (N − 1). Her hedef evre açısı (0°, 6°, … 354°) için 2026'da açısı
 * ±1,2° içinde kalan saatlerden, ayın ortalama uzaklığa (384.400 km) en yakın olduğu kare seçilir; böylece bütün
 * görüntülerde ay aynı boyda görünür. Disk, dolunay karesinden ölçülen yarıçapın uzaklıkla ölçeklenmesiyle kesilir,
 * dışı saydam bırakılır (açık zeminde ay, karanlık yanıyla birlikte yuvarlak görünür).
 *
 * Kullanım (kökten): node apps/web/scripts/build-moon-phases.mjs <ham-kare-klasörü>
 * İndirilen kareler projeye konmaz; yalnız çıktı WebP'ler `public/moon/phases/` altına yazılır.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import * as A from "astronomy-engine";

const RAW = process.argv[2];
if (!RAW) throw new Error("Ham kare klasörünü verin.");
mkdirSync(RAW, { recursive: true });
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "moon", "phases");
mkdirSync(OUT, { recursive: true });

const STEP = 6;
const SIZES = [160, 640];
const MEAN_KM = 384_400;
/** Ölçüm için dolunay karesi (26 Ekim 2026). */
const FULL_FRAME = 7157;

const T0 = Date.UTC(2026, 0, 1);
const hours = [];
for (let n = 1; n <= 8760; n++) {
  const t = new Date(T0 + (n - 1) * 3_600_000);
  const v = A.GeoMoon(t);
  hours.push({ n, angle: A.MoonPhase(t), km: Math.hypot(v.x, v.y, v.z) * A.KM_PER_AU });
}

const frameUrl = (n) =>
  `https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005587/frames/730x730_1x1_30p/moon.${String(n).padStart(4, "0")}.jpg`;

async function frame(n) {
  const f = join(RAW, `${n}.jpg`);
  if (!existsSync(f)) {
    const r = await fetch(frameUrl(n));
    if (!r.ok) throw new Error(`Kare ${n}: ${r.status}`);
    writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  return f;
}

// Dolunay karesinde parlak piksellerin sınırları diski verir.
const full = await sharp(await frame(FULL_FRAME)).greyscale().raw().toBuffer({ resolveWithObject: true });
let x0 = Infinity, x1 = -1, y0 = Infinity, y1 = -1;
for (let y = 0; y < full.info.height; y++) {
  for (let x = 0; x < full.info.width; x++) {
    if (full.data[y * full.info.width + x] > 40) {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
}
const cx = (x0 + x1) / 2;
const cy = (y0 + y1) / 2;
const r0 = (x1 - x0 + (y1 - y0)) / 4;
const km0 = hours[FULL_FRAME - 1].km;
console.log(`Dolunay diski: merkez ${cx},${cy}, yarıçap ${r0} px, ${Math.round(km0)} km`);

const picks = [];
for (let k = 0; k < 360 / STEP; k++) {
  const target = k * STEP;
  const diff = (a) => Math.abs(((a - target + 540) % 360) - 180);
  const near = hours.filter((h) => diff(h.angle) < 1.2);
  const best = (near.length ? near : [...hours].sort((a, b) => diff(a.angle) - diff(b.angle)).slice(0, 1)).sort(
    (a, b) => Math.abs(a.km - MEAN_KM) - Math.abs(b.km - MEAN_KM),
  )[0];
  picks.push({ k, target, ...best });
}

for (const p of picks) {
  // Ay bu karede, dolunay karesine göre uzaklıkla ters orantılı büyüklükte görünür. Kenarda 1 px pay bırakılır.
  const r = (r0 * km0) / p.km + 1;
  const side = Math.round(r * 2);
  const left = Math.round(cx - r);
  const top = Math.round(cy - r);
  const disc = await sharp(await frame(p.n)).extract({ left, top, width: side, height: side }).toBuffer();
  const mask = Buffer.from(
    `<svg width="${side}" height="${side}"><circle cx="${side / 2}" cy="${side / 2}" r="${side / 2 - 0.5}" fill="#fff"/></svg>`,
  );
  const round = await sharp(disc).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  for (const size of SIZES) {
    await sharp(round)
      .resize(size, size)
      .webp({ quality: size > 200 ? 78 : 82, alphaQuality: 90 })
      .toFile(join(OUT, `p${String(p.k).padStart(2, "0")}-${size}.webp`));
  }
  console.log(`${p.target}° ← kare ${p.n} (${p.angle.toFixed(1)}°, ${Math.round(p.km)} km)`);
}
