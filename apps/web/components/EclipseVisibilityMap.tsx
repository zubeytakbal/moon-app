import type { LunarVisibilityGrid } from "@moon-app/moon";

/**
 * Ay tutulması görünürlük haritası (eşdikdörtgen dünya, 80° K - 60° G arası). Kara sınırları tek bir statik dosyadan
 * (`/images/world-land.svg`, Natural Earth, kamu malı) yüklenir; üstüne görünürlük hücreleri, satır başına aynı
 * değerli komşular tek dikdörtgende birleştirilerek çizilir (sayfa hafif kalsın).
 */
export function EclipseVisibilityMap({
  grid,
  title,
  marker,
}: {
  grid: LunarVisibilityGrid;
  title: string;
  /** İsteğe bağlı işaret (ör. seçilen şehir). */
  marker?: { latitude: number; longitude: number; label: string };
}) {
  const { step, rows } = grid;
  const rects: { x: number; y: number; w: number; v: number }[] = [];
  rows.forEach((row, r) => {
    let start = 0;
    for (let c = 1; c <= row.length; c++) {
      if (c === row.length || row[c] !== row[start]) {
        if (row[start] > 0) rects.push({ x: start * step, y: r * step, w: (c - start) * step, v: row[start] });
        start = c;
      }
    }
  });
  return (
    <figure>
      <svg viewBox="0 10 360 140" className="w-full rounded-xl bg-[#0b1020]" role="img" aria-label={title}>
        <image href="/images/world-land.svg" x={0} y={0} width={360} height={180} />
        {rects.map((q, i) => (
          <rect key={i} x={q.x} y={q.y} width={q.w} height={step + 0.06} fill="#fbbf24" fillOpacity={q.v === 2 ? 0.42 : 0.16} shapeRendering="crispEdges" />
        ))}
        {marker && (
          <g transform={`translate(${marker.longitude + 180} ${90 - marker.latitude})`}>
            <circle r={2.6} fill="#fff" stroke="#05070d" strokeWidth={0.8} />
          </g>
        )}
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-amber-400/60" /> whole eclipse visible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-amber-400/25" /> moon rises or sets during it
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-[#0b1020] ring-1 ring-zinc-600" /> not visible
        </span>
      </figcaption>
    </figure>
  );
}
