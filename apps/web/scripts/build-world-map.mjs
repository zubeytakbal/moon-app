/**
 * Dünya kara sınırlarını tek bir SVG dosyasına çevirir: `public/images/world-land.svg` (eşdikdörtgen izdüşüm,
 * x = boylam + 180, y = 90 − enlem; 360x180 birimlik tuval). Haritalar bunu <image> olarak bir kez yükler (önbellekte kalır). Kaynak: Natural Earth 1:110m land (kamu malı, naturalearthdata.com).
 *
 * Kullanım (kökten): node apps/web/scripts/build-world-map.mjs <ne_110m_land.geojson>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const src = process.argv[2];
if (!src) throw new Error("ne_110m_land.geojson dosyasını verin.");
const geo = JSON.parse(readFileSync(src, "utf8"));
const r = (n) => Math.round(n * 10) / 10;
const rings = [];
for (const f of geo.features) {
  const g = f.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  for (const poly of polys) for (const ring of poly) rings.push(ring);
}
const d = rings
  .map((ring) => {
    let last = "";
    const pts = [];
    for (const [lon, lat] of ring) {
      const p = `${r(lon + 180)} ${r(90 - lat)}`;
      if (p !== last) pts.push(p);
      last = p;
    }
    return pts.length > 2 ? `M${pts.join("L")}Z` : "";
  })
  .join("");
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "world-land.svg");
writeFileSync(
  out,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180" width="360" height="180"><!-- Natural Earth 1:110m land, public domain --><path fill="#3f4656" d="${d}"/></svg>
`,
);
console.log(rings.length, "halka,", d.length, "karakter");
