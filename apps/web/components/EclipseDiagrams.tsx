import type { ReactNode } from "react";

/**
 * Tutulmaları anlatan şematik çizimler. Boyutlar ve uzaklıklar ölçekli değildir; ölçekli çizilse Güneş
 * sayfaya sığmaz, Ay bir nokta kadar kalırdı. Renkler koyu kart üzerinde iki temada da aynıdır.
 */

const SUN = "#fcd34d";
const EARTH = "#3b82f6";
const MOON = "#d4d4d8";
const LABEL = "#d4d4d8";
const MUTED = "#a1a1aa";

function DiagramFrame({ label, caption, children }: { label: string; caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="mt-8">
      <div className="starfield overflow-hidden rounded-2xl bg-[#05070d] p-3 sm:p-5">
        <svg viewBox="0 0 720 300" role="img" aria-label={label} className="h-auto w-full">
          {children}
        </svg>
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {caption} <span className="text-zinc-500">Ölçekli değildir.</span>
      </figcaption>
    </figure>
  );
}

function Sun({ cx, r }: { cx: number; r: number }) {
  return (
    <>
      <circle cx={cx} cy={150} r={r + 14} fill={SUN} fillOpacity={0.12} />
      <circle cx={cx} cy={150} r={r} fill={SUN} />
    </>
  );
}

/** Güneş tutulması: Ay'ın tam gölgesi Dünya'da dar bir alana, yarı gölgesi geniş bir alana düşer. */
export function SolarEclipseDiagram() {
  return (
    <DiagramFrame
      label="Güneş tutulması çizimi: Güneş, Ay ve Dünya aynı hizada; Ay'ın gölgesi Dünya'ya düşüyor"
      caption="Güneş tutulması: Ay, Güneş ile Dünya'nın arasına girer. Koyu tam gölgenin düştüğü dar şeritte tam tutulma, çevresindeki geniş yarı gölgede parçalı tutulma görülür."
    >
      <Sun cx={40} r={70} />
      {/* yarı gölge ve tam gölge */}
      <polygon points="400,131 400,169 610,218 610,82" fill="#64748b" fillOpacity={0.35} />
      <polygon points="400,131 400,169 584,150" fill="#020617" fillOpacity={0.95} />
      <circle cx={660} cy={150} r={78} fill={EARTH} />
      <polygon points="400,131 400,169 610,218 610,82" fill="#0f172a" fillOpacity={0.45} />
      <circle cx={585} cy={150} r={5} fill="#020617" />
      <circle cx={400} cy={150} r={19} fill={MOON} />
      <text x={40} y={250} fill={LABEL} fontSize={18} textAnchor="middle">
        Güneş
      </text>
      <text x={400} y={110} fill={LABEL} fontSize={18} textAnchor="middle">
        Ay
      </text>
      <text x={660} y={260} fill={LABEL} fontSize={18} textAnchor="middle">
        Dünya
      </text>
      <text x={470} y={60} fill={MUTED} fontSize={14} textAnchor="middle">
        Yarı gölge: parçalı tutulma
      </text>
      <line x1={520} y1={66} x2={560} y2={100} stroke={MUTED} strokeWidth={1} />
      <text x={470} y={262} fill={MUTED} fontSize={14} textAnchor="middle">
        Tam gölge: tam tutulma
      </text>
      <line x1={520} y1={248} x2={576} y2={158} stroke={MUTED} strokeWidth={1} />
    </DiagramFrame>
  );
}

/** Ay tutulması: dolunay Dünya'nın gölgesine girer. */
export function LunarEclipseDiagram() {
  return (
    <DiagramFrame
      label="Ay tutulması çizimi: Güneş, Dünya ve Ay aynı hizada; Ay, Dünya'nın gölgesinin içinde"
      caption="Ay tutulması: Dolunayda ay, Dünya'nın gölgesinden geçer. Tam gölgeye girdiğinde kararır ama kaybolmaz; atmosferden kırılan kızıl ışık onu aydınlatır."
    >
      <Sun cx={30} r={60} />
      <polygon points="290,112 290,188 700,250 700,50" fill="#64748b" fillOpacity={0.3} />
      <polygon points="290,112 290,188 700,168 700,132" fill="#020617" fillOpacity={0.95} />
      <circle cx={290} cy={150} r={40} fill={EARTH} />
      <circle cx={600} cy={150} r={14} fill="#9a3412" />
      <circle cx={600} cy={150} r={14} fill="#7f1d1d" fillOpacity={0.5} />
      <circle cx={600} cy={66} r={12} fill={MOON} fillOpacity={0.55} />
      <text x={30} y={240} fill={LABEL} fontSize={18} textAnchor="middle">
        Güneş
      </text>
      <text x={290} y={225} fill={LABEL} fontSize={18} textAnchor="middle">
        Dünya
      </text>
      <text x={630} y={155} fill={LABEL} fontSize={14} textAnchor="start">
        Ay
      </text>
      <text x={480} y={28} fill={MUTED} fontSize={14} textAnchor="middle">
        Yarı gölgede ay yalnızca biraz solar
      </text>
      <line x1={560} y1={34} x2={590} y2={58} stroke={MUTED} strokeWidth={1} />
      <text x={470} y={282} fill={MUTED} fontSize={14} textAnchor="middle">
        Tam gölgede ay kızarır
      </text>
      <line x1={520} y1={268} x2={592} y2={162} stroke={MUTED} strokeWidth={1} />
    </DiagramFrame>
  );
}

/**
 * Yandan bakış: Ay'ın yörüngesi Dünya'nınkine göre eğik olduğu için çoğu yeni ayda Ay'ın gölgesi
 * Dünya'nın üstünden ya da altından geçer. Tutulma ancak Ay iki yörüngenin kesiştiği yerdeyse olur.
 */
export function OrbitTiltDiagram() {
  /** `tilt`: yörüngenin çizimdeki eğikliği (derece). Ay, yörüngenin Güneş'e bakan ucunda. */
  const panel = (x: number, tilt: number, title: string, note: string, hit: boolean) => {
    const earthX = x + 260;
    const rad = (tilt * Math.PI) / 180;
    const moonX = earthX - 90 * Math.cos(rad);
    const moonY = 150 - 90 * Math.sin(rad);
    const shadow = `${moonX},${moonY - 8} ${moonX},${moonY + 8} ${earthX + 45},${moonY + 3} ${earthX + 45},${moonY - 3}`;
    return (
      <g>
        <text x={x + 170} y={30} fill={LABEL} fontSize={16} fontWeight={600} textAnchor="middle">
          {title}
        </text>
        <line x1={x + 20} y1={150} x2={x + 340} y2={150} stroke={MUTED} strokeDasharray="4 5" strokeOpacity={0.6} />
        <circle cx={x + 40} cy={150} r={36} fill={SUN} fillOpacity={0.12} />
        <circle cx={x + 40} cy={150} r={26} fill={SUN} />
        {/* Ay'ın yörüngesi, hafif yukarıdan bakılmış gibi */}
        <ellipse
          cx={earthX}
          cy={150}
          rx={90}
          ry={18}
          fill="none"
          stroke="#a5b4fc"
          strokeOpacity={0.7}
          strokeWidth={1.5}
          transform={`rotate(${tilt} ${earthX} 150)`}
        />
        <polygon points={shadow} fill="#64748b" fillOpacity={0.55} />
        <circle cx={earthX} cy={150} r={22} fill={EARTH} />
        {hit && <circle cx={earthX - 21} cy={150} r={4} fill="#020617" />}
        <circle cx={moonX} cy={moonY} r={8} fill={MOON} />
        <text x={x + 170} y={250} fill={hit ? "#fcd34d" : MUTED} fontSize={14} textAnchor="middle">
          {note}
        </text>
      </g>
    );
  };

  return (
    <DiagramFrame
      label="Yandan bakış: solda Ay'ın gölgesi Dünya'nın üstünden geçiyor, sağda Dünya'ya düşüyor"
      caption="Yandan bakış. Kesikli çizgi Dünya'nın Güneş çevresindeki yörünge düzlemi, mor halka Ay'ın yörüngesi. Ay'ın yörüngesi yaklaşık 5 derece eğik (çizimde abartıldı); bu yüzden çoğu yeni ayda gölge Dünya'yı ıskalar. Yörüngenin düzlemi kestiği noktalar Güneş yönüne denk geldiğinde tutulma olur."
    >
      {panel(0, 20, "Çoğu yeni ay", "Gölge Dünya'nın üstünden geçer: tutulma yok", false)}
      <line x1={360} y1={20} x2={360} y2={270} stroke="#ffffff" strokeOpacity={0.1} />
      {panel(370, 0, "Kesişme noktasında yeni ay", "Gölge Dünya'ya düşer: güneş tutulması", true)}
    </DiagramFrame>
  );
}
