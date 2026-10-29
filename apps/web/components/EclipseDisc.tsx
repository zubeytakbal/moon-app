import { useId } from "react";

/**
 * Güneş tutulmasının gerçek oranlı çizimi: Güneş diski ve önündeki ay. `separation` merkezler arası
 * uzaklık (Güneş yarıçapı cinsinden), `ratio` ay/Güneş görünen yarıçap oranı. Ayın kayma yönü
 * temsilidir; örtülme miktarı gerçek orana göredir. Tanım kimlikleri her çizimde benzersizdir
 * (aynı sayfada birden çok çizim olabilir).
 */
export function EclipseDisc({ separation, ratio, size }: { separation: number; ratio: number; size: number }) {
  const id = `ecl-${useId().replace(/:/g, "")}`;
  const r = 40;
  const offset = separation * r;
  const dx = offset * Math.SQRT1_2;
  return (
    <svg viewBox="-14 -14 148 148" width={size} height={size} aria-hidden="true" style={{ maxWidth: "100%", height: "auto" }}>
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="60%" stopColor="#fde68a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="80%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill={`url(#${id}-glow)`} />
      <circle cx="60" cy="60" r={r} fill={`url(#${id}-sun)`} />
      <circle cx={60 + dx} cy={60 - dx} r={r * ratio} fill="#05070d" />
    </svg>
  );
}
