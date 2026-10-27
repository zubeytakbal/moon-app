interface MoonPhaseIconProps {
  /** Ay ile Güneş arasındaki boylam farkı (0-360). 0 yeni ay, 180 dolunay. */
  phaseAngle: number;
  size?: number;
  /** Güney yarımkürede ay sağ-sol ters görünür. */
  southern?: boolean;
  title: string;
  /** Büyük görsellerde ayın etrafına hafif bir ışık halesi ekler. */
  glow?: boolean;
}

/**
 * Ayın gerçek fotoğrafı (NASA SVS dolunay görüntüsü) üzerine, evre açısına göre hesaplanan
 * gölgenin bindirilmesiyle oluşan görsel.
 *
 * Gölge iki yaydan oluşur: diskin karanlık tarafındaki yarım daire ve aydınlık ile karanlığı
 * ayıran sınır (terminatör). Terminatör, genişliği evre açısının kosinüsüyle değişen bir
 * elipsin yarısıdır. Gerçekte terminatör keskin değildir, bu yüzden hafifçe yumuşatılır.
 */
export function MoonPhaseIcon({ phaseAngle, size = 200, southern = false, title, glow = false }: MoonPhaseIconProps) {
  const r = 50;
  const c = 50;
  const k = Math.cos((phaseAngle * Math.PI) / 180);
  const rx = Math.abs(k) * r;
  const waxing = phaseAngle < 180;

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

  // Aynı sayfada aynı evre birden çok kez çizilse bile tanımlar aynı olduğu için çakışma sorun yaratmaz.
  const id = `moon-${Math.round(phaseAngle * 10)}-${size <= 80 ? "s" : "l"}`;
  const src = size <= 80 ? "/moon/full-moon-160.webp" : "/moon/full-moon.webp";
  const blur = size <= 80 ? 0.6 : 1.1;
  const pad = glow ? 12 : 0;

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
