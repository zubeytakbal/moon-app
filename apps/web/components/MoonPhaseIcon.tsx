import { useId } from "react";

/** Evre görüntüleri arasındaki açı adımı (derece). */
const PHASE_STEP = 6;

interface MoonPhaseIconProps {
  /** Ay ile Güneş arasındaki boylam farkı (0-360). 0 yeni ay, 180 dolunay. */
  phaseAngle: number;
  size?: number;
  /** Güney yarımkürede ay sağ-sol ters görünür. */
  southern?: boolean;
  title: string;
  /** Büyük görsellerde ayın etrafına hafif bir ışık halesi ekler. */
  glow?: boolean;
  /**
   * "far": ayın arka yüzü (NASA SVS 11747), arkadan bakılmış gibi. `phaseAngle` yine Dünya'dan görülen evredir;
   * arka yüzün evresi 180° fazlasıdır (yeni ayda arka yüz "dolunay"dır). Arkadan bakıldığında Güneş öbür
   * yanda kaldığı için aynı gölge formülü doğru yöne düşer.
   */
  side?: "near" | "far";
}

/**
 * Ayın gerçek fotoğrafı (NASA SVS dolunay görüntüsü) üzerine, evre açısına göre hesaplanan
 * gölgenin bindirilmesiyle oluşan görsel.
 *
 * Gölge iki yaydan oluşur: diskin karanlık tarafındaki yarım daire ve aydınlık ile karanlığı
 * ayıran sınır (terminatör). Terminatör, genişliği evre açısının kosinüsüyle değişen bir
 * elipsin yarısıdır. Gerçekte terminatör keskin değildir, bu yüzden hafifçe yumuşatılır.
 */
export function MoonPhaseIcon({
  phaseAngle,
  size = 200,
  southern = false,
  title,
  glow = false,
  side = "near",
}: MoonPhaseIconProps) {
  const r = 50;
  const c = 50;
  const angle = side === "far" ? (phaseAngle + 180) % 360 : phaseAngle;
  const k = Math.cos((angle * Math.PI) / 180);
  const rx = Math.abs(k) * r;
  const waxing = angle < 180;

  // Kuzey yarımkürede büyüyen ayın sol tarafı karanlıktır.
  const darkSweep = waxing ? 0 : 1;
  // Hilalde (k > 0) terminatör aydınlık tarafa, şişkin ayda karanlık tarafa doğru kavislenir.
  const terminatorSweep = waxing === k > 0 ? 0 : 1;
  const shadowPath = [
    `M ${c} ${c - r}`,
    `A ${r} ${r} 0 0 ${darkSweep} ${c} ${c + r}`,
    `A ${rx} ${r} 0 0 ${terminatorSweep} ${c} ${c - r}`,
    "Z",
  ].join(" ");

  // Her çizimin tanımları (kesme şablonu, filtre) benzersiz kimlik taşımalı: aynı kimlik sayfada birden çok kez
  // geçerse tarayıcı ilkini kullanır; ilki gizli bir menüdeyse ikon hiç görünmez.
  const id = `moon-${useId().replace(/:/g, "")}`;
  const pad = glow ? 12 : 0;

  // Yakın yüzde ve 400 px'e kadar: NASA SVS'nin o evredeki gerçek görüntüsü (gölge sınırında kraterlerin gölgeleri,
  // karanlık yanda Dünya ışığı). 6°'lik adımlarla 60 görüntü, `scripts/build-moon-phases.mjs` ile üretilir.
  // Daha büyük çizimlerde (giriş alanlarındaki dev ay) yüksek çözünürlüklü fotoğraf + hesaplanan gölge kullanılır.
  if (side === "near" && size <= 400) {
    const index = Math.round(angle / PHASE_STEP) % (360 / PHASE_STEP);
    const file = `/moon/phases/p${String(index).padStart(2, "0")}-${size <= 80 ? 160 : 640}.webp`;
    return (
      <svg
        viewBox={`${-pad} ${-pad} ${100 + pad * 2} ${100 + pad * 2}`}
        width={size}
        height={size}
        role="img"
        aria-label={title}
        style={{ maxWidth: "100%", height: "auto", transform: southern ? "scaleX(-1)" : undefined }}
      >
        <title>{title}</title>
        {glow && (
          <defs>
            <radialGradient id={`${id}-glow`}>
              <stop offset="70%" stopColor="#c7d2fe" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity={0} />
            </radialGradient>
          </defs>
        )}
        {glow && <circle cx={c} cy={c} r={r + pad} fill={`url(#${id}-glow)`} />}
        <image href={file} x={0} y={0} width={100} height={100} />
      </svg>
    );
  }

  const src =
    side === "far"
      ? size <= 80
        ? "/moon/far-side-160.webp"
        : "/moon/far-side.webp"
      : size <= 80
        ? "/moon/full-moon-160.webp"
        : size <= 500
          ? "/moon/full-moon.webp"
          : "/moon/full-moon-2000.webp";
  const blur = size <= 80 ? 0.6 : size <= 500 ? 1.1 : 0.8;

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${100 + pad * 2} ${100 + pad * 2}`}
      width={size}
      height={size}
      role="img"
      aria-label={title}
      style={{ maxWidth: "100%", height: "auto", transform: southern ? "scaleX(-1)" : undefined }}
    >
      <title>{title}</title>
      <defs>
        <clipPath id={`${id}-disc`}>
          <circle cx={c} cy={c} r={r} />
        </clipPath>
        <filter id={`${id}-soft`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
        {glow && (
          <radialGradient id={`${id}-glow`}>
            <stop offset="70%" stopColor="#c7d2fe" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#c7d2fe" stopOpacity={0} />
          </radialGradient>
        )}
      </defs>
      {glow && <circle cx={c} cy={c} r={r + pad} fill={`url(#${id}-glow)`} />}
      <g clipPath={`url(#${id}-disc)`}>
        <image href={src} x={0} y={0} width={100} height={100} preserveAspectRatio="xMidYMid slice" />
        {/* Karanlık taraf tamamen siyah değildir: Dünya'dan yansıyan ışık (Dünya ışığı) onu çok hafif aydınlatır. */}
        <path d={shadowPath} fill="#03050b" fillOpacity={0.93} filter={`url(#${id}-soft)`} />
      </g>
    </svg>
  );
}
