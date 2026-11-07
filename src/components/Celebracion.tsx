import { useEffect, useRef } from "react";
import { rand } from "../lib/useCanvas";

/*
 * Capa a pantalla completa para las sorpresas:
 *  - "lluvia": corazones, granos de café y pétalos que caen
 *  - "estrellas": una lluvia de estrellas fugaces
 * Se dispara desde cualquier parte con celebrate("lluvia").
 */
type Kind = "lluvia" | "estrellas";
const listeners = new Set<(k: Kind) => void>();
export const celebrate = (k: Kind) => listeners.forEach((f) => f(k));

type P = {
  kind: "shard" | "bean" | "star" | "petal";
  x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; c: string; pts?: number[]; life: number; trail?: { x: number; y: number }[];
};
const SHARD = ["#b3263a", "#d97d86", "#e6a3a6", "#4a6fa5", "#c9455a"];

export default function Celebracion() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let parts: P[] = [];
    let raf = 0;
    let running = false;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);

    const shardPoly = () => {
      const n = Math.floor(rand(4, 7));
      const pts: number[] = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
        const d = rand(0.55, 1);
        pts.push(Math.cos(a) * d, Math.sin(a) * d);
      }
      return pts;
    };

    const spawn = (k: Kind) => {
      const W = innerWidth, Hh = innerHeight;
      if (k === "lluvia") {
        for (let i = 0; i < 160; i++) {
          const roll = Math.random();
          if (roll < 0.25) {
            parts.push({ kind: "petal", x: rand(-W * 0.3, W * 0.6), y: rand(-Hh * 0.6, -20), vx: rand(60, 160), vy: rand(30, 90), r: rand(0, 6), vr: rand(-3, 3), s: rand(6, 10), c: Math.random() < 0.6 ? "#e6a3a6" : "#f8f3ea", life: 8 });
            continue;
          }
          const bean = roll < 0.55;
          parts.push({
            kind: bean ? "bean" : "shard",
            x: rand(-W * 0.2, W), y: rand(-Hh * 0.8, -20), vx: rand(20, 80), vy: rand(60, 220),
            r: rand(0, 6), vr: rand(-4, 4), s: bean ? rand(7, 11) : rand(6, 16),
            c: bean ? "#4a2c1a" : SHARD[Math.floor(Math.random() * SHARD.length)],
            pts: bean ? undefined : shardPoly(), life: 7,
          });
        }
      } else {
        for (let i = 0; i < 26; i++) {
          const sp = rand(700, 1100);
          const a = rand(0.35, 0.55);
          parts.push({ kind: "star", x: rand(-W * 0.3, W * 0.7), y: rand(-Hh * 0.4, Hh * 0.3) - i * 30, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 0, vr: 0, s: rand(1.5, 3), c: "#e8b86a", life: rand(1.6, 2.6), trail: [] });
        }
      }
      if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
    };

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 80);
      for (const p of parts) {
        p.life -= dt;
        if (p.kind === "petal") { p.vy = Math.min(p.vy + 40 * dt, 110); p.x += Math.sin(p.y * 0.02) * 0.6; }
        else if (p.kind !== "star") { p.vy += 260 * dt; p.vx = Math.abs(p.vx) * 0.995; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        const fade = Math.min(1, p.life / 0.6);
        ctx.globalAlpha = fade;
        if (p.kind === "star") {
          p.trail!.unshift({ x: p.x, y: p.y });
          if (p.trail!.length > 18) p.trail!.pop();
          ctx.strokeStyle = p.c;
          for (let i = 1; i < p.trail!.length; i++) {
            ctx.globalAlpha = fade * (1 - i / p.trail!.length);
            ctx.lineWidth = p.s * (1 - i / p.trail!.length);
            ctx.beginPath();
            ctx.moveTo(p.trail![i - 1].x, p.trail![i - 1].y);
            ctx.lineTo(p.trail![i].x, p.trail![i].y);
            ctx.stroke();
          }
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.kind === "petal") {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "bean") {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.s, p.s * 0.68, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#c9a27e";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-p.s * 0.75, 0);
          ctx.bezierCurveTo(-p.s * 0.25, -p.s * 0.3, p.s * 0.25, p.s * 0.3, p.s * 0.75, 0);
          ctx.stroke();
        } else {
          const k = p.s;
          ctx.beginPath();
          ctx.moveTo(0, k * 0.35);
          ctx.bezierCurveTo(-k, -k * 0.3, -k * 0.45, -k * 1.05, 0, -k * 0.45);
          ctx.bezierCurveTo(k * 0.45, -k * 1.05, k, -k * 0.3, 0, k * 0.35);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (parts.length) raf = requestAnimationFrame(loop);
      else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    };

    listeners.add(spawn);

    // Sorpresa: escribir "angie" en el teclado lanza estrellas; "cafe" lanza granos
    let buf = "";
    const key = (e: KeyboardEvent) => {
      buf = (buf + e.key.toLowerCase()).slice(-8);
      if (buf.endsWith("angie")) { spawn("estrellas"); buf = ""; }
      if (buf.endsWith("cafe") || buf.endsWith("café")) { spawn("lluvia"); buf = ""; }
    };
    addEventListener("keydown", key);

    return () => {
      listeners.delete(spawn);
      removeEventListener("resize", resize);
      removeEventListener("keydown", key);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[80] h-full w-full" aria-hidden />;
}
