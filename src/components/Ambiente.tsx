import { useEffect, useRef } from "react";
import { ScrollTrigger } from "../lib/motion";
import { rand } from "../lib/useCanvas";

/*
 * Vida de fondo: una capa fija con partículas que cambian según la sección
 * (pétalos, corazones, luciérnagas, burbujas, granos de café, destellos).
 * Todas viajan de izquierda a derecha.
 * Cada sección elige las suyas con data-ambient="petalos,destellos".
 */

type Kind = "petalos" | "corazones" | "luciernagas" | "burbujas" | "granos" | "destellos";
type P = { k: Kind; x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; ph: number; c: string; a: number; dying: boolean };

const COLORS: Record<Kind, string[]> = {
  petalos: ["#e6a3a6", "#f2c4c0", "#fbf6ec", "#f0b9a9"],
  corazones: ["#d97d86", "#e6a3a6", "#b3263a"],
  luciernagas: ["#ffe9a8", "#fff3d6"],
  burbujas: ["#ffffff", "#cfe0f2"],
  granos: ["#6b4128", "#7a4e33", "#4a2e1f"],
  destellos: ["#c9a24a", "#e8c77a", "#ffffff"],
};
const MAX: Record<Kind, number> = { petalos: 34, corazones: 18, luciernagas: 34, burbujas: 22, granos: 16, destellos: 20 };

function heart(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.45, -s * 1.05, 0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.45, -s * 1.05, s, -s * 0.3, 0, s * 0.35);
  ctx.fill();
}

export default function Ambiente({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const kinds = useRef<Kind[]>(["petalos", "destellos"]);

  useEffect(() => {
    if (!ready) return;
    const triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-ambient]")).map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (s) => { if (s.isActive) kinds.current = el.dataset.ambient!.split(",") as Kind[]; },
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, [ready]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, raf = 0, last = performance.now();
    let parts: P[] = [];
    const narrow = () => W < 768;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);

    const spawn = (k: Kind, anywhere: boolean): P => {
      const c = COLORS[k][Math.floor(Math.random() * COLORS[k].length)];
      const base = { k, c, a: 0, dying: false, ph: rand(0, 6), r: rand(0, 6), vr: rand(-1.5, 1.5) };
      const x = anywhere ? rand(0, W) : rand(-60, -10);
      switch (k) {
        case "petalos": return { ...base, x, y: rand(-20, H), vx: rand(22, 50), vy: rand(6, 22), s: rand(5, 10) };
        case "corazones": return { ...base, x, y: rand(H * 0.1, H), vx: rand(18, 36), vy: rand(-14, -4), s: rand(5, 10) };
        case "luciernagas": return { ...base, x, y: rand(H * 0.15, H), vx: rand(8, 22), vy: rand(-6, 6), s: rand(1.6, 3) };
        case "burbujas": return { ...base, x, y: rand(H * 0.2, H), vx: rand(16, 30), vy: rand(-18, -6), s: rand(4, 11) };
        case "granos": return { ...base, x, y: rand(0, H), vx: rand(20, 40), vy: rand(4, 14), s: rand(5, 8) };
        case "destellos": return { ...base, x: rand(0, W), y: rand(0, H), vx: rand(4, 10), vy: 0, s: rand(4, 9) };
      }
    };

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const time = t / 1000;
      ctx.clearRect(0, 0, W, H);
      const want = kinds.current;
      const scale = narrow() ? 0.55 : 1;

      for (const p of parts) if (!want.includes(p.k)) p.dying = true;
      for (const k of want) {
        const n = parts.filter((p) => p.k === k && !p.dying).length;
        const max = Math.round(MAX[k] * scale);
        if (n < max) parts.push(spawn(k, n < max * 0.5 && Math.random() < 0.5));
      }

      parts = parts.filter((p) => p.x < W + 60 && p.y > -80 && p.y < H + 80 && !(p.dying && p.a <= 0));
      for (const p of parts) {
        p.a = p.dying ? Math.max(0, p.a - dt * 1.5) : Math.min(1, p.a + dt * 0.8);
        p.x += p.vx * dt;
        p.y += p.vy * dt + Math.sin(time * 1.3 + p.ph) * 0.25;
        p.r += p.vr * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.c;
        ctx.strokeStyle = p.c;
        switch (p.k) {
          case "petalos":
            ctx.globalAlpha = p.a * 0.75;
            ctx.rotate(p.r);
            ctx.scale(1, 0.55 + 0.45 * Math.sin(time * 2 + p.ph));
            ctx.beginPath();
            ctx.ellipse(0, 0, p.s, p.s * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "corazones":
            ctx.globalAlpha = p.a * 0.7;
            ctx.rotate(Math.sin(time + p.ph) * 0.25);
            heart(ctx, p.s);
            break;
          case "luciernagas": {
            const glow = 0.5 + 0.5 * Math.sin(time * 2.4 + p.ph);
            ctx.globalAlpha = p.a * (0.25 + glow * 0.75);
            ctx.beginPath();
            ctx.arc(0, 0, p.s * (2.6 + glow), 0, Math.PI * 2);
            ctx.globalAlpha *= 0.25;
            ctx.fill();
            ctx.globalAlpha = p.a * (0.4 + glow * 0.6);
            ctx.beginPath();
            ctx.arc(0, 0, p.s, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case "burbujas":
            ctx.globalAlpha = p.a * 0.6;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(0, 0, p.s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(-p.s * 0.35, -p.s * 0.35, p.s * 0.22, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "granos":
            ctx.globalAlpha = p.a * 0.7;
            ctx.rotate(p.r);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.s, p.s * 0.68, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#c9a27e";
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(-p.s * 0.7, 0);
            ctx.bezierCurveTo(-p.s * 0.2, -p.s * 0.3, p.s * 0.2, p.s * 0.3, p.s * 0.7, 0);
            ctx.stroke();
            break;
          case "destellos": {
            const tw = Math.max(0, Math.sin(time * 1.8 + p.ph));
            ctx.globalAlpha = p.a * tw * 0.8;
            ctx.lineWidth = 1.4;
            ctx.lineCap = "round";
            const k = p.s * (0.6 + tw * 0.6);
            ctx.beginPath();
            ctx.moveTo(-k, 0); ctx.lineTo(k, 0);
            ctx.moveTo(0, -k * 1.4); ctx.lineTo(0, k * 1.4);
            ctx.stroke();
            if (tw < 0.02) { p.x = rand(0, W); p.y = rand(0, H); }
            break;
          }
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[5] h-full w-full" aria-hidden />;
}
