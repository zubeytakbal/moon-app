import { PHASE_NAMES_TR, type PhaseKey } from "@moon-app/moon";
import { MoonPhaseIcon } from "./MoonPhaseIcon";

const PHASES: { key: PhaseKey; angle: number }[] = [
  { key: "new-moon", angle: 0 },
  { key: "waxing-crescent", angle: 45 },
  { key: "first-quarter", angle: 90 },
  { key: "waxing-gibbous", angle: 135 },
  { key: "full-moon", angle: 180 },
  { key: "waning-gibbous", angle: 225 },
  { key: "last-quarter", angle: 270 },
  { key: "waning-crescent", angle: 315 },
];

const W = 640;
const H = 600;
const CX = 340;
const CY = 300;
const ORBIT = 130;
const INSET = 215;
const MOON_R = 13;
const INSET_R = 24;

/**
 * Güneş ışığı soldan gelir. Ay, Dünya'nın etrafında (kuzeyden bakınca) saat yönünün tersine döner.
 * Yörüngedeki her ayın Güneş'e bakan yarısı aydınlıktır. Dışarıdaki küçük çizimler ayın o konumda
 * Dünya'dan (kuzey yarımküreden) nasıl göründüğünü gösterir.
 */
export function OrbitDiagram() {
  // Evre açısı 0 (yeni ay) Güneş yönünde, yani solda. Ekranda y aşağı doğru arttığı için sin eksi alınır.
  const at = (angle: number, radius: number) => {
    const t = ((180 + angle) * Math.PI) / 180;
    return { x: CX + radius * Math.cos(t), y: CY - radius * Math.sin(t) };
  };

  return (
    <figure className="mt-8 overflow-hidden starfield rounded-2xl bg-[#05070d] p-4 text-white sm:p-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-labelledby="orbit-title orbit-desc">
        <title id="orbit-title">Ay evrelerinin oluşumu</title>
        <desc id="orbit-desc">
          Güneş ışığı soldan gelir. Ay, Dünya etrafında dönerken her zaman Güneş&apos;e bakan yarısı aydınlıktır. Dünya&apos;dan
          bu aydınlık yarının ne kadarı görüldüğüne göre yeni aydan dolunaya ve tekrar yeni aya kadar sekiz evre oluşur.
        </desc>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Güneş ışığı */}
        {[-180, -90, 0, 90, 180].map((dy) => (
          <line
            key={dy}
            x1={8}
            y1={CY + dy}
            x2={70}
            y2={CY + dy}
            stroke="#fbbf24"
            strokeWidth={2.5}
            markerEnd="url(#arrow)"
          />
        ))}
        <text x={8} y={CY - 205} fill="#fbbf24" fontSize={18} fontWeight={600}>
          Güneş ışığı
        </text>

        {/* Yörünge ve dönüş yönü */}
        <circle cx={CX} cy={CY} r={ORBIT} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeDasharray="4 6" />
        <path
          d={`M ${CX + ORBIT * Math.cos(Math.PI * 1.04)} ${CY - ORBIT * Math.sin(Math.PI * 1.04)} A ${ORBIT} ${ORBIT} 0 0 0 ${CX + ORBIT * Math.cos(Math.PI * 1.2)} ${CY - ORBIT * Math.sin(Math.PI * 1.2)}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.6}
          strokeWidth={2}
          markerEnd="url(#arrow)"
        />

        {/* Dünya: Güneş'e bakan yarısı gündüz */}
        <circle cx={CX} cy={CY} r={26} fill="#2563eb" />
        <path d={`M ${CX} ${CY - 26} A 26 26 0 0 1 ${CX} ${CY + 26} Z`} fill="#000" fillOpacity={0.55} />
        <text x={CX} y={CY + 50} fill="#cbd5e1" fontSize={16} textAnchor="middle">
          Dünya
        </text>

        {PHASES.map(({ key, angle }) => {
          const moon = at(angle, ORBIT);
          const inset = at(angle, INSET);
          const labelBelow = inset.y >= CY - 10;
          return (
            <g key={key}>
              {/* Yörüngedeki ay: Güneş'e bakan (sol) yarısı aydınlık */}
              <circle cx={moon.x} cy={moon.y} r={MOON_R} fill="#1f2433" stroke="#ffffff" strokeOpacity={0.2} />
              <path
                d={`M ${moon.x} ${moon.y - MOON_R} A ${MOON_R} ${MOON_R} 0 0 0 ${moon.x} ${moon.y + MOON_R} Z`}
                fill="#ecebe4"
              />
              {/* Dünya'dan görünüşü */}
              <svg x={inset.x - INSET_R} y={inset.y - INSET_R} width={INSET_R * 2} height={INSET_R * 2}>
                <MoonPhaseIcon phaseAngle={angle} size={INSET_R * 2} title={PHASE_NAMES_TR[key]} />
              </svg>
              <text
                x={inset.x}
                y={labelBelow ? inset.y + INSET_R + 20 : inset.y - INSET_R - 10}
                fill="#e2e8f0"
                fontSize={17}
                textAnchor="middle"
              >
                {PHASE_NAMES_TR[key]}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-sm text-zinc-400">
        İç halka: ayın Dünya etrafındaki konumu, Güneş&apos;e bakan yarısı her zaman aydınlık. Dış halka: aynı anda ayın
        Türkiye&apos;den nasıl göründüğü.
      </figcaption>
    </figure>
  );
}
