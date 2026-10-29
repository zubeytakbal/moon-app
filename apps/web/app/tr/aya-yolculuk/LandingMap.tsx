import { cacheLife } from "next/cache";
import { getMoonPhase } from "@moon-app/moon";
import { siteConfig } from "@/site.config";

/**
 * Aya iniş yerlerinin haritası: sitedeki ay fotoğrafının üzerinde, ayın şu anki gölgesiyle.
 *
 * Fotoğraf (NASA SVS, 26 Ekim 2026 dolunayı) gökyüzündeki kuzeyi yukarı koyar; ayın kendi ekseni o gün
 * gökyüzünde yatıktı ve ay hafifçe salınmış (librasyon) görünüyordu. İşaretler bu yüzden fotoğrafın çekildiği
 * andaki yer altı noktasına ve eksen açısına göre izdüşürülür (astronomy-engine ile hesaplandı; Tycho,
 * Copernicus, Grimaldi, Plato ve Kriz Denizi fotoğraf üzerinde denetlendi).
 */
const PHOTO_SUB_EARTH = { lat: -5.94, lon: -4.13 };
const PHOTO_AXIS_ANGLE = -20.0;
const DEG = Math.PI / 180;

type Kind = "apollo" | "robot" | "ticari";

/** Yumuşak iniş yerleri (seleno-grafik enlem ve boylam, derece; doğu ve kuzey artı). */
const SITES: { name: string; lat: number; lon: number; kind: Kind; date: string; detail: string }[] = [
  { name: "Apollo 11", lat: 0.674, lon: 23.473, kind: "apollo", date: "1969", detail: "Sükûnet Denizi · Armstrong ve Aldrin" },
  { name: "Apollo 12", lat: -3.012, lon: -23.422, kind: "apollo", date: "1969", detail: "Fırtınalar Okyanusu · Conrad ve Bean" },
  { name: "Apollo 14", lat: -3.645, lon: -17.471, kind: "apollo", date: "1971", detail: "Fra Mauro · Shepard ve Mitchell" },
  { name: "Apollo 15", lat: 26.132, lon: 3.634, kind: "apollo", date: "1971", detail: "Hadley Vadisi · Scott ve Irwin" },
  { name: "Apollo 16", lat: -8.973, lon: 15.5, kind: "apollo", date: "1972", detail: "Descartes yaylası · Young ve Duke" },
  { name: "Apollo 17", lat: 20.191, lon: 30.772, kind: "apollo", date: "1972", detail: "Taurus-Littrow · Cernan ve Schmitt" },
  { name: "Luna 9", lat: 7.08, lon: -64.37, kind: "robot", date: "1966", detail: "Sovyetler Birliği · ilk yumuşak iniş" },
  { name: "Surveyor 1", lat: -2.47, lon: -43.34, kind: "robot", date: "1966", detail: "ABD · ilk Amerikan yumuşak inişi" },
  { name: "Chang'e 3", lat: 44.12, lon: -19.51, kind: "robot", date: "2013", detail: "Çin · Yutu gezgini" },
  { name: "Chandrayaan-3", lat: -69.37, lon: 32.32, kind: "robot", date: "2023", detail: "Hindistan · güney kutbu bölgesi" },
  { name: "SLIM", lat: -13.32, lon: 25.25, kind: "robot", date: "2024", detail: "Japonya · hassas iniş" },
  { name: "Odysseus", lat: -80.13, lon: 1.44, kind: "ticari", date: "2024", detail: "ABD, Intuitive Machines · ilk özel iniş" },
  { name: "Blue Ghost", lat: 18.56, lon: 61.81, kind: "ticari", date: "2025", detail: "ABD, Firefly · Kriz Denizi" },
];

/** Ayın uzak yüzündeki iniş yerleri (Dünya'dan görülmez). */
const FAR_SIDE: { name: string; lat: number; lon: number; date: string; detail: string }[] = [
  { name: "Chang'e 4", lat: -45.44, lon: 177.59, date: "2019", detail: "Çin · uzak yüze ilk iniş" },
  { name: "Chang'e 6", lat: -41.64, lon: -153.99, date: "2024", detail: "Çin · uzak yüzden örnek getirdi" },
];

const COLORS: Record<Kind, string> = { apollo: "#fbbf24", robot: "#7dd3fc", ticari: "#c4b5fd" };
const KIND_LABEL: Record<Kind, string> = { apollo: "Apollo (insanlı)", robot: "İnsansız, devlet", ticari: "İnsansız, özel şirket" };

/** Seleno-grafik konumu fotoğraftaki konuma (0-100 birim) çevirir. */
function project(lat: number, lon: number) {
  const { lat: b0, lon: l0 } = PHOTO_SUB_EARTH;
  const x = Math.cos(lat * DEG) * Math.sin((lon - l0) * DEG);
  const y = Math.cos(b0 * DEG) * Math.sin(lat * DEG) - Math.sin(b0 * DEG) * Math.cos(lat * DEG) * Math.cos((lon - l0) * DEG);
  const p = PHOTO_AXIS_ANGLE * DEG;
  return { x: 50 + 50 * (x * Math.cos(p) - y * Math.sin(p)), y: 50 - 50 * (x * Math.sin(p) + y * Math.cos(p)) };
}

/**
 * Bir yerde şu an Güneş ufkun üzerinde mi? Güneş'in tam tepede olduğu boylam evre açısından bulunur
 * (dolunayda yakın yüzün ortası, yeni ayda uzak yüzün ortası); güneşin enlemi (±1,5°) ihmal edilir.
 */
function isLit(lon: number, phaseAngle: number) {
  const subSolar = 180 - phaseAngle;
  const diff = ((((lon - subSolar) % 360) + 540) % 360) - 180;
  return Math.abs(diff) < 90;
}

/** Haritanın üzerindeki evre gölgesi (MoonPhaseIcon'daki çizimin aynısı), ayın eksenine göre döndürülür. */
function shadowPath(phaseAngle: number) {
  const k = Math.cos(phaseAngle * DEG);
  const rx = Math.abs(k) * 50;
  const waxing = phaseAngle < 180;
  const darkSweep = waxing ? 0 : 1;
  const terminatorSweep = waxing === k > 0 ? 0 : 1;
  return `M 50 0 A 50 50 0 0 ${darkSweep} 50 100 A ${rx} 50 0 0 ${terminatorSweep} 50 0 Z`;
}

/** Saatte bir yenilenir: gölge ve "şu an gündüz/gece" etiketleri ayın evresine göre değişir. */
export async function LandingMap() {
  "use cache";
  cacheLife("hours");

  const phase = getMoonPhase(new Date(), siteConfig.defaultLocation.timeZone);
  const sites = SITES.map((s, i) => ({ ...s, n: i + 1, lit: isLit(s.lon, phase.phaseAngle), ...project(s.lat, s.lon) }));
  const farSide = FAR_SIDE.map((s) => ({ ...s, lit: isLit(s.lon, phase.phaseAngle) }));
  const apollo11 = sites[0];
  const litApollo = sites.filter((s) => s.kind === "apollo" && s.lit).length;

  return (
    <section className="bg-[#05070d] text-white" aria-labelledby="inis-haritasi">
      <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <h2 id="inis-haritasi" className="text-xl font-semibold">
            Aya iniş yerleri haritası
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Ayın Dünya&apos;dan görünen yüzü ve üzerindeki iniş yerleri. Gölge, ayın şu anki evresidir (
            {phase.name.toLocaleLowerCase("tr-TR")}, %{Math.round(phase.illumination * 100)} aydınlık): gölgede kalan iniş
            yerlerinde şu an ay gecesi yaşanıyor.
          </p>

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <figure className="mx-auto w-full max-w-md">
              <svg viewBox="-2 -2 104 104" role="img" aria-label="İniş yerleri işaretli ay haritası" className="h-auto w-full">
                <defs>
                  <clipPath id="inis-disk">
                    <circle cx="50" cy="50" r="50" />
                  </clipPath>
                  <filter id="inis-yumusak" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="1.1" />
                  </filter>
                </defs>
                <g clipPath="url(#inis-disk)">
                  <image href="/moon/full-moon.webp" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
                  <path
                    d={shadowPath(phase.phaseAngle)}
                    fill="#03050b"
                    fillOpacity={0.72}
                    filter="url(#inis-yumusak)"
                    transform={`rotate(${-PHOTO_AXIS_ANGLE} 50 50)`}
                  />
                </g>
                {sites.map((s) => (
                  <g key={s.name}>
                    <title>{`${s.n}. ${s.name} (${s.date}): ${s.detail}`}</title>
                    <circle cx={s.x} cy={s.y} r="2.6" fill="#05070d" fillOpacity={0.55} stroke={COLORS[s.kind]} strokeWidth="0.7" />
                    <text x={s.x} y={s.y + 1.05} textAnchor="middle" fontSize="2.9" fontWeight="700" fill={COLORS[s.kind]}>
                      {s.n}
                    </text>
                  </g>
                ))}
              </svg>
              <figcaption className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: COLORS[k] }} /> {KIND_LABEL[k]}
                  </span>
                ))}
              </figcaption>
            </figure>

            <div>
              <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-200">
                {apollo11.lit
                  ? "Apollo 11'in indiği Sükûnet Denizi şu an güneş alıyor. Ay bu gece gökyüzündeyse, sağ tarafındaki koyu lekelerden biri olarak çıplak gözle bile görebilirsiniz."
                  : "Apollo 11'in indiği Sükûnet Denizi şu an ay gecesinde, karanlıkta."}{" "}
                Altı Apollo iniş yerinden {litApollo} tanesi şu an gündüzde.
              </p>
              <ol className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 text-sm">
                {sites.map((s) => (
                  <li key={s.name} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold"
                      style={{ borderColor: COLORS[s.kind], color: COLORS[s.kind] }}
                    >
                      {s.n}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="font-medium text-white">{s.name}</span>
                      <span className="text-zinc-500"> · {s.date}</span>
                      <span className="block text-xs text-zinc-400">{s.detail}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                        s.lit ? "bg-amber-300/15 text-amber-200" : "bg-white/5 text-zinc-400"
                      }`}
                    >
                      {s.lit ? "gündüz" : "gece"}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-zinc-400">
                Ayın uzak yüzünde, Dünya&apos;dan görülmeyen iniş yerleri:{" "}
                {farSide.map((s, i) => (
                  <span key={s.name}>
                    {i > 0 && ", "}
                    {s.name} ({s.date}, {s.detail}; şu an {s.lit ? "gündüz" : "gece"})
                  </span>
                ))}
                . Ayda bir gündüz ya da gece, Dünya&apos;daki yaklaşık iki haftaya denk gelir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
