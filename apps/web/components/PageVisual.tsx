import { PAGES, type SitePage } from "@/lib/pages";
import { ZODIAC_SYMBOLS } from "@/lib/zodiac";
import { MoonPhaseIcon } from "./MoonPhaseIcon";

/** Bölümlere göre kart arka planı. Yıldız dokusu (`starfield`) arka plan görselini kullandığı için renk düz verilir. */
const GROUP_BG: Record<SitePage["group"], string> = {
  bugun: "bg-[#10162e]",
  evreler: "bg-[#0b0e16]",
  takvim: "bg-[#10162e]",
  tutulmalar: "bg-[#1c1006]",
  hicri: "bg-[#0b1a12]",
  "gelenek-burclar": "bg-[#1a1030]",
  bilgi: "bg-[#0b0e16]",
  kurumsal: "bg-[#0b0e16]",
};

const RED_FILTER = "grayscale(1) sepia(1) saturate(3.5) hue-rotate(-28deg) brightness(0.55) contrast(1.1)";

/** Takvim sayfaları için küçük takvim ızgarası; vurgulu günler ay evresine benzer biçimde. */
function MiniCalendar({ accent }: { accent: string }) {
  const cells = Array.from({ length: 28 }, (_, i) => i);
  return (
    <svg viewBox="0 0 140 84" width="140" height="84" aria-hidden="true">
      {cells.map((i) => {
        const x = (i % 7) * 20;
        const y = Math.floor(i / 7) * 21;
        const lit = i % 7 >= 2 && i % 7 <= 4 && Math.floor(i / 7) % 2 === 1;
        return (
          <g key={i}>
            <rect
              x={x + 1}
              y={y + 1}
              width="17"
              height="18"
              rx="3"
              fill={lit ? accent : "#ffffff"}
              fillOpacity={lit ? 0.35 : 0.06}
            />
            <circle cx={x + 9.5} cy={y + 10} r="4.5" fill="#e4e4e7" fillOpacity={0.15 + (i % 14) / 20} />
          </g>
        );
      })}
    </svg>
  );
}

function Scissors() {
  return (
    <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#fcd34d" strokeWidth="1.6" aria-hidden="true">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12" />
    </svg>
  );
}

function Sprout() {
  return (
    <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#86efac" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 21v-9M12 12C12 8 9 5 4 5c0 5 3 7 8 7zM12 12c0-3 2-6 8-6 0 5-3 6-8 6z" />
      <path d="M7 21h10" />
    </svg>
  );
}

/** Kart görseli: radyanttan saçılan meteor izleri ve köşede ince ay. */
function Meteors() {
  return (
    <svg viewBox="0 0 120 96" className="h-24 w-32" aria-hidden="true">
      {[
        [30, 20, 70, 52],
        [52, 12, 96, 40],
        [20, 38, 58, 74],
        [70, 28, 110, 62],
      ].map(([x1, y1, x2, y2], i) => (
        <g key={i} strokeLinecap="round">
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c7d2fe" strokeOpacity={0.25} strokeWidth={1.2} />
          <line x1={(x1 + 2 * x2) / 3} y1={(y1 + 2 * y2) / 3} x2={x2} y2={y2} stroke="#fff" strokeWidth={i === 1 ? 2 : 1.5} />
        </g>
      ))}
    </svg>
  );
}

function SolarEclipse() {
  return (
    <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">
      <defs>
        <radialGradient id="pv-sun">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="85%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#fde68a" fillOpacity="0.15" />
      <circle cx="50" cy="50" r="34" fill="url(#pv-sun)" />
      <circle cx="62" cy="40" r="35" fill="#05070d" />
    </svg>
  );
}

/** Ana sayfa kartının üst kısmındaki, sayfanın konusunu anlatan görsel. */
export function PageVisual({ page }: { page: SitePage }) {
  const { path } = page;
  let visual: React.ReactNode;

  if (path === PAGES.ayTakvimi.path) visual = <MiniCalendar accent="#818cf8" />;
  else if (path === PAGES.sacKesim.path)
    visual = (
      <div className="flex items-center gap-3">
        <MoonPhaseIcon phaseAngle={100} size={64} title="" />
        <Scissors />
      </div>
    );
  else if (path === PAGES.ekimDikim.path)
    visual = (
      <div className="flex items-center gap-3">
        <MoonPhaseIcon phaseAngle={70} size={64} title="" />
        <Sprout />
      </div>
    );
  else if (path === PAGES.kanliAy.path)
    visual = (
      <div style={{ filter: RED_FILTER }}>
        <MoonPhaseIcon phaseAngle={180} size={96} title="" />
      </div>
    );
  else if (path === PAGES.ayTutulmalari.path)
    visual = (
      <div className="relative h-24 w-24">
        <MoonPhaseIcon phaseAngle={180} size={96} title="" />
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 15% 30%, rgba(40,8,4,0.92) 45%, transparent 46%)" }}
        />
      </div>
    );
  else if (path === PAGES.gunesTutulmasi.path || path === PAGES.yeniayTarihleri.path) visual = <SolarEclipse />;
  else if (path === PAGES.ayHangiBurcta.path || path === PAGES.ayBurcu.path || path === PAGES.aybosluk.path) {
    const index = path === PAGES.ayBurcu.path ? 3 : path === PAGES.aybosluk.path ? 11 : 1;
    visual = (
      <div className="flex items-center gap-3">
        <span className="text-5xl text-amber-200">{ZODIAC_SYMBOLS[index]}</span>
        <MoonPhaseIcon phaseAngle={page.cardPhaseAngle} size={64} title="" />
      </div>
    );
  } else if (page.group === "hicri")
    visual = (
      <div className="relative">
        <MoonPhaseIcon phaseAngle={page.cardPhaseAngle} size={96} title="" />
        <span className="absolute -right-3 top-2 text-xl text-amber-200" aria-hidden="true">
          ✦
        </span>
      </div>
    );
  else if (path === PAGES.meteorYagmurlari.path) visual = <Meteors />;
  else if (path === PAGES.ayinKaranlikYuzu.path)
    visual = <MoonPhaseIcon side="far" phaseAngle={30} size={96} title="" />;
  else if (path === PAGES.superAy.path) visual = <MoonPhaseIcon phaseAngle={180} size={112} glow title="" />;
  else visual = <MoonPhaseIcon phaseAngle={page.cardPhaseAngle} size={96} title="" />;

  return (
    <div className={`starfield flex h-36 items-center justify-center ${GROUP_BG[page.group]}`}>
      {visual}
    </div>
  );
}
