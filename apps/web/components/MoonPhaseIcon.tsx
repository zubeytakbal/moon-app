interface MoonPhaseIconProps {
  /** Ay ile Güneş arasındaki boylam farkı (0-360). 0 yeni ay, 180 dolunay. */
  phaseAngle: number;
  size?: number;
  /** Güney yarımkürede ay sağ-sol ters görünür. */
  southern?: boolean;
  title: string;
}

/**
 * Ay evresinin SVG çizimi.
 *
 * Aydınlık bölge iki yaydan oluşur: diskin aydınlık tarafındaki yarım daire ve
 * aydınlık ile karanlığı ayıran sınır (terminatör). Terminatör, genişliği
 * evre açısının kosinüsüyle değişen bir elipsin yarısıdır.
 */
export function MoonPhaseIcon({ phaseAngle, size = 200, southern = false, title }: MoonPhaseIconProps) {
  const r = 48;
  const c = 50;
  const k = Math.cos((phaseAngle * Math.PI) / 180);
  const rx = Math.abs(k) * r;
  const waxing = phaseAngle < 180;

  // Kuzey yarımkürede büyüyen ayın sağ tarafı aydınlıktır.
  const outerSweep = waxing ? 1 : 0;
  // Hilalde (k > 0) terminatör aydınlık tarafa, şişkin ayda karanlık tarafa doğru kavislenir.
  const terminatorSweep = waxing === k > 0 ? 0 : 1;

  const litPath = [
    `M ${c} ${c - r}`,
    `A ${r} ${r} 0 0 ${outerSweep} ${c} ${c + r}`,
    `A ${rx} ${r} 0 0 ${terminatorSweep} ${c} ${c - r}`,
    "Z",
  ].join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      style={southern ? { transform: "scaleX(-1)" } : undefined}
    >
      <title>{title}</title>
      <defs>
        <radialGradient id="moon-lit" cx="40%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#fbfaf5" />
          <stop offset="100%" stopColor="#d9d6cb" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={r} fill="#1f2433" />
      <path d={litPath} fill="url(#moon-lit)" />
      <circle cx={c} cy={c} r={r} fill="none" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={0.6} />
    </svg>
  );
}
