"use client";

import { useEffect, useRef, useState } from "react";

type Sky = "sehir" | "kenar" | "koy" | "karanlik";

const SKIES: { key: Sky; label: string; hint: string; stars: number; glow: number }[] = [
  { key: "sehir", label: "Şehir merkezi", hint: "Sokak lambaları, en parlak yıldızlar seçilir", stars: 35, glow: 0.55 },
  { key: "kenar", label: "Şehir kenarı", hint: "Banliyö, site bahçesi, şehir dışı yol kenarı", stars: 160, glow: 0.3 },
  { key: "koy", label: "Köy / kırsal", hint: "Samanyolu seçilebiliyor", stars: 520, glow: 0.1 },
  { key: "karanlik", label: "Karanlık dağ başı", hint: "En yakın şehirden 50+ km uzak", stars: 950, glow: 0 },
];

/**
 * Hızlandırma (ekrandaki 1 saniye = gökyüzünde kaç dakika). Zayıf yağmurlarda ekranda birkaç saniyede bir
 * meteor görünsün diye, şehir kenarı sayısına göre seçilir; bütün gökyüzü türlerinde aynıdır ki
 * karşılaştırma doğru olsun.
 */
function speedupFor(kenarRate: number) {
  for (const minutes of [1, 2, 5, 10]) if ((kenarRate * minutes) / 60 >= 1 / 3) return minutes * 60;
  return 600;
}

interface Meteor {
  x: number;
  y: number;
  dx: number;
  dy: number;
  len: number;
  born: number;
  life: number;
  bright: number;
}

/**
 * "Saatte kaç meteor görürsünüz?" Gökyüzü türüne göre beklenen sayı ve hızlandırılmış canlandırma.
 * Sayılar sunucuda hesaplanır (radyant yüksekliği, ay, gökyüzü karanlığı); burada yalnız gösterilir.
 */
export function MeteorSimulator({
  showerName,
  rates,
  moonNote,
}: {
  showerName: string;
  rates: Record<Sky, number>;
  moonNote: string;
}) {
  const [sky, setSky] = useState<Sky>("kenar");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rate = rates[sky];
  const perHour = Math.round(rate);
  const everyMinutes = rate > 0 ? 60 / rate : Infinity;
  const speedup = speedupFor(rates.kenar);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const conf = SKIES.find((s) => s.key === sky)!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    // Yıldızlar her gökyüzü türünde aynı konumda; şehirde yalnız en parlakları kalır.
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const stars = Array.from({ length: 950 }, () => ({ x: rand(), y: rand(), m: rand() }))
      .sort((a, b) => a.m - b.m)
      .slice(0, conf.stars);

    function resize() {
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const meteors: Meteor[] = [];
    // Radyant: çerçevenin sol üst köşesinin biraz dışında; meteorlar oradan uzaklaşır.
    const rx = -0.15;
    const ry = -0.2;
    const perSecond = (rate * speedup) / 3600;
    let last = performance.now();
    let raf = 0;
    let visible = true;

    function spawn(now: number) {
      const x = 0.1 + Math.random() * 0.9;
      const y = 0.05 + Math.random() * 0.75;
      const ang = Math.atan2(y - ry, x - rx) + (Math.random() - 0.5) * 0.15;
      meteors.push({
        x,
        y,
        dx: Math.cos(ang),
        dy: Math.sin(ang),
        len: 0.06 + Math.random() * 0.16,
        born: now,
        life: 350 + Math.random() * 500,
        bright: 0.5 + Math.random() * 0.5,
      });
    }

    function draw(now: number) {
      const sk = ctx!.createLinearGradient(0, 0, 0, h);
      sk.addColorStop(0, "#03050c");
      sk.addColorStop(1, conf.glow ? `rgba(120, 80, 40, ${conf.glow})` : "#070b18");
      ctx!.fillStyle = "#03050c";
      ctx!.fillRect(0, 0, w, h);
      ctx!.fillStyle = sk;
      ctx!.fillRect(0, 0, w, h);
      for (const s of stars) {
        const a = 0.35 + (1 - s.m) * 0.65;
        ctx!.fillStyle = `rgba(255,255,255,${a})`;
        const r = s.m < 0.05 ? 1.3 : s.m < 0.3 ? 0.9 : 0.6;
        ctx!.fillRect(s.x * w, s.y * h, r, r);
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const p = (now - m.born) / m.life;
        if (p >= 1) {
          meteors.splice(i, 1);
          continue;
        }
        const head = Math.min(1, p * 1.6);
        const fade = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4;
        const hx = (m.x + m.dx * m.len * head) * w;
        const hy = (m.y + m.dy * m.len * head) * h;
        const tx = (m.x + m.dx * m.len * Math.max(0, head - 0.7)) * w;
        const ty = (m.y + m.dy * m.len * Math.max(0, head - 0.7)) * h;
        const g = ctx!.createLinearGradient(tx, ty, hx, hy);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(1, `rgba(255,255,255,${m.bright * fade})`);
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 1.6;
        ctx!.beginPath();
        ctx!.moveTo(tx, ty);
        ctx!.lineTo(hx, hy);
        ctx!.stroke();
      }
    }

    function frame(now: number) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // Poisson süreci: her karede dt · oran olasılıkla yeni meteor.
      let expected = perSecond * dt;
      while (expected > 0) {
        if (Math.random() < Math.min(1, expected)) spawn(now);
        expected -= 1;
      }
      draw(now);
      if (visible) raf = requestAnimationFrame(frame);
    }

    if (reduce) {
      // Hareket istemeyenler için tek kare: dakikalık ortalama kadar iz.
      const n = Math.min(12, Math.round(rate / 6));
      const now = performance.now();
      for (let i = 0; i < n; i++) spawn(now - 200);
      draw(now);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduce) {
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [sky, rate, speedup]);

  const current = SKIES.find((s) => s.key === sky)!;

  return (
    <div className="overflow-hidden rounded-2xl bg-[#05070d] text-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[1fr_1.2fr]">
        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Gökyüzünüz nasıl?</p>
          <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Gökyüzü türü">
            {SKIES.map((s) => (
              <button
                key={s.key}
                type="button"
                role="radio"
                aria-checked={sky === s.key}
                onClick={() => setSky(s.key)}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  sky === s.key
                    ? "border-indigo-400 bg-indigo-500/20 text-white"
                    : "border-white/15 text-zinc-300 hover:border-white/30"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-400">{current.hint}</p>

          <p className="mt-6 text-sm text-zinc-400">{showerName}, en iyi saatte:</p>
          <p className="mt-1 text-5xl font-extralight tabular-nums">
            {perHour < 1 ? "<1" : `~${perHour}`}
            <span className="ml-2 text-lg font-normal text-zinc-300">meteor / saat</span>
          </p>
          <p className="mt-2 text-zinc-300">
            {everyMinutes === Infinity
              ? "Bu koşullarda meteor görmek çok zor."
              : everyMinutes < 1
                ? "Dakikada birden fazla meteor."
                : `Ortalama ${Math.round(everyMinutes)} dakikada bir meteor.`}
          </p>
          <p className="mt-3 text-sm text-zinc-400">{moonNote}</p>
          <p className="mt-4 text-xs text-zinc-500">
            Tahmindir: IMO&apos;nun saatlik zenit sayısından (ZHR), yağmurun geldiği noktanın yüksekliği, ay ışığı ve
            gökyüzü karanlığına göre hesaplanır. Gerçek sayı yıldan yıla değişebilir.
          </p>
        </div>
        <div className="relative min-h-64 md:min-h-full">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={`${current.label} gökyüzünde meteor yağmuru canlandırması`}
          />
          <p className="absolute bottom-2 right-3 rounded bg-black/50 px-2 py-0.5 text-[11px] text-zinc-300">
            Hızlandırılmış: 1 saniye = {speedup / 60} dakika
          </p>
        </div>
      </div>
    </div>
  );
}
