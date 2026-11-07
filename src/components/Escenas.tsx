import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "../lib/motion";
import { byX, slide, wipe } from "../lib/ltr";
import { rand, useCanvas } from "../lib/useCanvas";
import { seeded } from "../lib/seeded";
import Tore from "./Tore";
import { Wobble, useWobbleId } from "./Wobble";
import { useBlip } from "../lib/useBlip";
import { content } from "../content";
import { setRecuerdos, useRecuerdos } from "../lib/store";
import Puente from "./Puente";
import Chibi from "./Chibi";
import { VidaCampo } from "./Decor";

const [campoTxt, nocheTxt, marTxt] = content.escenas;

/* ═══════════════════════════ Pequeñas piezas de dibujo ═══════════════════════════ */

const FLOWER = ["#fbf6ec", "#f2cf5b", "#8fa9d6", "#e6a3a6", "#fbf6ec", "#f2cf5b"];

export function Flower({ x, y, s, c, delay }: { x: number; y: number; s: number; c: string; delay: number }) {
  const center = c === "#f2cf5b" ? "#c98a2a" : "#f2cf5b";
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="flower-pop" data-x={x}>
        <g className="sway" style={{ animationDelay: `${-delay}s` }}>
          <path d={`M0 0 q${s * 0.3} ${s * 1.6} 0 ${s * 3}`} stroke="#5f7c4f" strokeWidth={2.2} fill="none" strokeLinecap="round" transform={`translate(0 0)`} />
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx={0} cy={-s * 0.62} rx={s * 0.42} ry={s * 0.62} fill={c} transform={`rotate(${r})`} />
          ))}
          <circle r={s * 0.38} fill={center} />
        </g>
      </g>
    </g>
  );
}

export function Butterfly({ path, dur, color, begin }: { path: string; dur: number; color: string; begin: number }) {
  return (
    <g>
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} rotate="auto" begin={`${-begin}s`} />
      <ellipse cx={-4} cy={-7} rx={8} ry={6} fill={color}>
        <animate attributeName="ry" values="6;1.5;6" dur="0.32s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx={-4} cy={7} rx={8} ry={6} fill={color}>
        <animate attributeName="ry" values="6;1.5;6" dur="0.32s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx={0} cy={0} rx={7} ry={2} fill="#3b2a20" />
    </g>
  );
}

export function Cloud({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <circle cx={-70} cy={10} r={40} />
      <circle cx={-20} cy={-18} r={56} />
      <circle cx={42} cy={-6} r={48} />
      <circle cx={92} cy={16} r={34} />
      <rect x={-110} y={10} width={236} height={40} rx={20} />
    </g>
  );
}

/* ═══════════════════════════ Capas interactivas en canvas ═══════════════════════════ */

type PFlower = { x: number; y: number; born: number; color: string; size: number; rot: number; stem: number };

function PlantarFlores({ onCount }: { onCount: (n: number) => void }) {
  const flowers = useRef<PFlower[]>([]);
  const time = useRef(0);
  const down = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const plant = (x: number, y: number) => {
    flowers.current.push({ x, y, born: time.current, color: FLOWER[Math.floor(Math.random() * FLOWER.length)], size: rand(7, 12), rot: rand(0, 6), stem: rand(16, 28) });
    if (flowers.current.length > 240) flowers.current.shift();
    onCount(flowers.current.length);
  };

  const canvas = useCanvas((ctx, w, h, t) => {
    time.current = t;
    ctx.clearRect(0, 0, w, h);
    for (const f of flowers.current) {
      const age = t - f.born;
      const grow = Math.min(1, age / 0.4);
      const b = Math.max(0, Math.min(1, (age - 0.3) / 0.5));
      const pop = b < 1 ? 1 - Math.pow(1 - b, 3) * Math.cos(b * 9) : 1;
      const sway = Math.sin(t * 1.5 + f.x * 0.03) * 2.5;
      ctx.strokeStyle = "#5f7c4f";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(f.x, f.y + f.stem);
      ctx.quadraticCurveTo(f.x, f.y + f.stem * 0.5, f.x + sway * grow, f.y + f.stem * (1 - grow));
      ctx.stroke();
      if (b <= 0) continue;
      ctx.save();
      ctx.translate(f.x + sway, f.y);
      ctx.rotate(f.rot);
      ctx.scale(pop, pop);
      ctx.fillStyle = f.color;
      for (let i = 0; i < 5; i++) {
        ctx.rotate((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -f.size * 0.62, f.size * 0.42, f.size * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = f.color === "#f2cf5b" ? "#c98a2a" : "#f2cf5b";
      ctx.beginPath();
      ctx.arc(0, 0, f.size * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <canvas
      ref={canvas}
      className="absolute inset-0 h-full w-full"
      data-cursor="Planta"
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => { down.current = true; const p = pos(e); last.current = p; plant(p.x, p.y); }}
      onPointerUp={() => (down.current = false)}
      onPointerLeave={() => (down.current = false)}
      onPointerMove={(e) => {
        if (!down.current) return;
        const p = pos(e);
        if (Math.hypot(p.x - last.current!.x, p.y - last.current!.y) > 30) { plant(p.x, p.y); last.current = p; }
      }}
    />
  );
}

type Shot = { x: number; y: number; vx: number; vy: number; life: number; trail: { x: number; y: number }[] };

function CieloEstrellado({ onWish }: { onWish: () => void }) {
  const stars = useRef<{ x: number; y: number; r: number; p: number }[]>([]);
  const shots = useRef<Shot[]>([]);
  const nextAuto = useRef(1.5);

  // siempre viajan de izquierda a derecha
  const launch = (x: number, y: number) => {
    const sp = rand(520, 720);
    const a = rand(0.18, 0.36);
    shots.current.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.5, trail: [] });
  };

  const canvas = useCanvas((ctx, w, h, t, dt) => {
    if (stars.current.length === 0 && w > 0) {
      stars.current = Array.from({ length: 90 }, () => ({ x: rand(0, w), y: rand(0, h * 0.68), r: rand(0.6, 1.7), p: rand(0, 6) }));
    }
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff3d6";
    for (const s of stars.current) {
      ctx.globalAlpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2 + s.p));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    nextAuto.current -= dt;
    if (nextAuto.current <= 0) { launch(rand(-40, w * 0.4), rand(0, h * 0.3)); nextAuto.current = rand(2.5, 5); }
    shots.current = shots.current.filter((s) => s.life > 0);
    for (const s of shots.current) {
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.trail.unshift({ x: s.x, y: s.y });
      if (s.trail.length > 30) s.trail.pop();
      const fade = Math.min(1, s.life / 0.45);
      ctx.strokeStyle = "#fff3d6";
      ctx.lineCap = "round";
      for (let i = 1; i < s.trail.length; i++) {
        ctx.globalAlpha = (1 - i / s.trail.length) * fade;
        ctx.lineWidth = 2.2 * (1 - i / s.trail.length);
        ctx.beginPath();
        ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y);
        ctx.lineTo(s.trail[i].x, s.trail[i].y);
        ctx.stroke();
      }
      ctx.globalAlpha = fade;
      ctx.lineWidth = 1.2;
      const k = 9 + Math.sin(t * 22) * 2;
      ctx.beginPath();
      ctx.moveTo(s.x - k, s.y); ctx.lineTo(s.x + k, s.y);
      ctx.moveTo(s.x, s.y - k * 1.5); ctx.lineTo(s.x, s.y + k * 1.5);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });

  return (
    <canvas
      ref={canvas}
      className="absolute inset-0 h-full w-full"
      data-cursor="Deseo"
      onClick={(e) => {
        const r = canvas.current!.getBoundingClientRect();
        launch(e.clientX - r.left, e.clientY - r.top);
        onWish();
      }}
    />
  );
}

type Boat = { x: number; y: number; v: number; p: number; c: string; llego?: boolean; fade?: number };

function MarConBarquitos({ onBoat }: { onBoat: () => void }) {
  const boats = useRef<Boat[]>([]);
  const corazones = useRef<{ x: number; y: number; life: number }[]>([]);
  const canvas = useCanvas((ctx, w, h, t, dt) => {
    ctx.clearRect(0, 0, w, h);
    const top = h * 0.43, bottom = h * 0.82;
    // espuma: líneas que avanzan hacia la derecha
    ctx.lineCap = "round";
    for (let i = 0; i < 9; i++) {
      const y0 = top + 14 + ((bottom - top - 30) * i) / 8;
      const amp = 2 + i * 0.7;
      const speed = 0.5 + i * 0.12;
      ctx.strokeStyle = "#f8f3ea";
      ctx.globalAlpha = 0.25 + i * 0.07;
      ctx.lineWidth = 1.2 + i * 0.35;
      const seg = 60 + i * 14;
      const off = ((t * speed * 40) % (seg * 2));
      for (let x = -seg * 2 + off; x < w; x += seg * 2) {
        ctx.beginPath();
        for (let k = 0; k <= seg; k += 4) {
          const xx = x + k;
          const yy = y0 + Math.sin(xx * 0.03 - t * speed * 2 + i) * amp;
          k === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    // barquitos de papel, con Alessandro y Tore adentro, navegando hacia ella
    const k = Math.max(0.7, Math.min(1.25, w / 480));
    const llegada = w * 0.72;
    for (const b of boats.current) {
      if (b.x > llegada && !b.llego) {
        b.llego = true;
        corazones.current.push({ x: b.x, y: b.y - 50 * k, life: 1.6 });
      }
    }
    boats.current = boats.current.filter((b) => !(b.llego && (b.fade = (b.fade ?? 1) - dt * 1.4) <= 0));
    for (const b of boats.current) {
      if (!b.llego) b.x += b.v * dt;
      const bob = Math.sin(t * 2.4 + b.p) * 3;
      const tilt = Math.sin(t * 2.4 + b.p + 1) * 0.07;
      ctx.save();
      ctx.globalAlpha = b.llego ? Math.max(0, b.fade ?? 1) : 1;
      ctx.translate(b.x, b.y + bob);
      ctx.rotate(tilt);
      ctx.scale(k, k);
      ctx.lineWidth = 2.2;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#3b2a20";
      // él
      ctx.fillStyle = "#fbfaf6";
      ctx.beginPath(); ctx.roundRect(-30, -22, 18, 24, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e2b291";
      ctx.beginPath(); ctx.arc(-21, -31, 9.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1f140e";
      ctx.beginPath(); ctx.arc(-21, -33, 9.8, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
      ctx.fillStyle = "#3b2a20";
      ctx.beginPath(); ctx.arc(-18, -30, 1.4, 0, Math.PI * 2); ctx.arc(-24, -30, 1.4, 0, Math.PI * 2); ctx.fill();
      // Tore
      ctx.fillStyle = "#dcc3a1";
      ctx.beginPath(); ctx.ellipse(-6, -14, 4, 8, 0.2, 0, Math.PI * 2); ctx.ellipse(12, -14, 4, 8, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fffaf2";
      ctx.beginPath(); ctx.arc(3, -17, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#1f1410";
      ctx.beginPath(); ctx.arc(-0.5, -18, 1.8, 0, Math.PI * 2); ctx.arc(6.5, -18, 1.8, 0, Math.PI * 2); ctx.arc(3, -13.5, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#4a6fa5";
      ctx.beginPath(); ctx.arc(3, -28, 2.6, 0, Math.PI * 2); ctx.fill();
      // casco y vela
      ctx.fillStyle = "#f8f3ea";
      ctx.beginPath();
      ctx.moveTo(-42, 0); ctx.lineTo(42, 0); ctx.lineTo(30, 16); ctx.lineTo(-30, 16); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = b.c;
      ctx.beginPath();
      ctx.moveTo(22, -2); ctx.lineTo(22, -48); ctx.lineTo(42, -2); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // corazones cuando un barquito llega a ella
    corazones.current = corazones.current.filter((c) => c.life > 0);
    for (const c of corazones.current) {
      c.life -= dt;
      c.y -= 30 * dt;
      c.x += 12 * dt;
      ctx.save();
      ctx.globalAlpha = Math.min(1, c.life);
      ctx.translate(c.x, c.y);
      ctx.scale(k * 1.3, k * 1.3);
      ctx.fillStyle = "#b3263a";
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.bezierCurveTo(-14, 0, -18, -8, -11, -14);
      ctx.bezierCurveTo(-6, -18, -1, -15, 0, -10);
      ctx.bezierCurveTo(1, -15, 6, -18, 11, -14);
      ctx.bezierCurveTo(18, -8, 14, 0, 0, 10);
      ctx.fill();
      ctx.restore();
    }
  });

  return (
    <canvas
      ref={canvas}
      className="absolute inset-0 h-full w-full"
      data-cursor="Zarpa"
      onClick={(e) => {
        const r = canvas.current!.getBoundingClientRect();
        const h = r.height;
        const y = Math.min(h * 0.76, Math.max(h * 0.52, e.clientY - r.top));
        boats.current.push({ x: -60, y, v: rand(45, 75), p: rand(0, 6), c: Math.random() < 0.5 ? "#e6a3a6" : "#4a6fa5" });
        onBoat();
      }}
    />
  );
}

/* ═══════════════════════════ Ilustraciones ═══════════════════════════ */

function IlustracionCampo({ feliz, regalos }: { feliz: boolean; regalos: number }) {
  const wob = useWobbleId();
  const { tufts, flowers } = useMemo(() => {
    const r = seeded(7);
    const tufts = Array.from({ length: 260 }, () => {
      const x = r(0, 800), y = r(0, 1000), h = r(10, 22), lean = r(-6, 6);
      return { d: `M${x} ${y} q${lean} ${-h * 0.5} ${lean * 1.6} ${-h} M${x + 4} ${y} q${lean * 0.5} ${-h * 0.4} ${lean} ${-h * 0.8}`, c: r() < 0.7 ? "#7f9a6d" : "#6c875c" };
    });
    const flowers: { x: number; y: number; s: number; c: string; delay: number }[] = [];
    while (flowers.length < 70) {
      const x = r(20, 780), y = r(30, 980);
      const dx = (x - 400) / 200, dy = (y - 500) / 240;
      if (dx * dx + dy * dy < 1) continue;
      flowers.push({ x, y, s: r(7, 12), c: FLOWER[Math.floor(r(0, FLOWER.length))], delay: r(0, 4) });
    }
    return { tufts, flowers };
  }, []);

  // cada 10 flores, Tore se levanta, recoge una y se la lleva a ella
  const toreG = useRef<SVGGElement>(null);
  const [modo, setModo] = useState<"duerme" | "va" | "da">("duerme");
  const [ramo, setRamo] = useState(0);
  const [beso, setBeso] = useState(0);
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    if (regalos <= 0) return;
    const g = toreG.current!;
    const pos = { x: 400, y: 520, s: 1.5 };
    const put = () => g.setAttribute("transform", `translate(${pos.x} ${pos.y}) scale(${pos.s})`);
    const tl = gsap.timeline();
    tl.add(() => setModo("va"))
      .to(pos, { x: 590, y: 846, s: 1.05, duration: 1.8, ease: "power1.inOut", onUpdate: put })
      .add(() => { setModo("da"); setRamo(regalos); setBeso((b) => b + 1); })
      .to(g, { opacity: 0, duration: 0.45, delay: 1.6 })
      .add(() => { pos.x = 400; pos.y = 520; pos.s = 1.5; put(); setModo("duerme"); })
      .to(g, { opacity: 1, duration: 0.6 });
    return () => { tl.kill(); };
  }, [regalos]);

  return (
    <svg viewBox="0 0 800 1000" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs><Wobble id={wob} /></defs>
      <rect width="800" height="1000" fill="#9db48a" />
      <ellipse cx="400" cy="500" rx="290" ry="330" fill="#a7bd93" />
      <ellipse cx="400" cy="500" rx="210" ry="250" fill="#b2c69e" />
      <g strokeWidth={2.4} strokeLinecap="round" fill="none">
        {tufts.map((t, i) => <path key={i} d={t.d} stroke={t.c} />)}
      </g>
      {flowers.map((f, i) => <Flower key={i} {...f} />)}
      <VidaCampo />
      {/* ella espera sus flores */}
      <g transform="translate(700 935) scale(1.3)">
        <Chibi look={content.munecos.ella} hair="long" flip wave={ramo > 0 ? -25 : 0} />
      </g>
      {ramo > 0 && (
        <g transform="translate(726 880)">
          {Array.from({ length: Math.min(ramo, 7) }, (_, i) => {
            const a = -Math.PI / 2 + (i - (Math.min(ramo, 7) - 1) / 2) * 0.45;
            return (
              <g key={i}>
                <path d={`M0 0 L${Math.cos(a) * 26} ${Math.sin(a) * 26}`} stroke="#5f7c4f" strokeWidth={2.5} />
                <circle cx={Math.cos(a) * 28} cy={Math.sin(a) * 28} r={7} fill={FLOWER[i % FLOWER.length]} stroke="#6b4a36" strokeWidth={1.5} />
                <circle cx={Math.cos(a) * 28} cy={Math.sin(a) * 28} r={2.5} fill="#f2cf5b" />
              </g>
            );
          })}
        </g>
      )}
      {beso > 0 && (
        <path key={beso} className="zz" style={{ animationIterationCount: 1 }} transform="translate(690 740) scale(1.6)" d="M0 10 C-14 0 -18 -8 -11 -14 C-6 -18 -1 -15 0 -10 C1 -15 6 -18 11 -14 C18 -8 14 0 0 10 Z" fill="#b3263a" />
      )}
      <g ref={toreG} transform="translate(400 520) scale(1.5)">
        <g filter={`url(#${wob})`}>
          {modo === "duerme" && <Tore pose="lie" eyes={feliz ? "happy" : "closed"} mouth={feliz ? "tongue" : "smile"} wag={feliz ? "fast" : "none"} />}
          {modo === "va" && <Tore pose="walk" eyes="happy" mouth="smile" flor wag="fast" />}
          {modo === "da" && <Tore pose="sit" eyes="happy" mouth="tongue" paw wag="fast" />}
        </g>
      </g>
      {!feliz && modo === "duerme" && (
        <g fontFamily="Cormorant Garamond" fontStyle="italic" fill="#3b2a20" fontSize={34}>
          {[0, 1, 2].map((i) => (
            <text key={i} x={470 + i * 6} y={330} className="zz" style={{ animationDelay: `${i * 0.8}s` }}>z</text>
          ))}
        </g>
      )}
      <Butterfly path="M-40 300 C200 220 300 380 520 280 S760 200 860 260" dur={16} color="#f8f3ea" begin={2} />
      <Butterfly path="M-40 760 C160 700 340 820 560 720 S760 640 860 700" dur={21} color="#f2cf5b" begin={9} />
    </svg>
  );
}

function IlustracionNoche({ layer, feliz = false }: { layer: "back" | "front"; feliz?: boolean }) {
  const wob = useWobbleId();
  const uid = useWobbleId();

  const cielo = useMemo(() => {
    const r = seeded(23);
    // estrellitas de la vía láctea, concentradas en una banda diagonal
    const via = Array.from({ length: 280 }, () => {
      const t = r(), off = (r() + r() + r() - 1.5) * 110;
      return { x: t * 1600, y: 620 - t * 520 + off, r: r(0.5, 1.7), tw: r() < 0.18, d: r(0, 3) };
    });
    const sueltas = Array.from({ length: 90 }, () => ({ x: r(0, 1600), y: r(0, 620), r: r(0.6, 2), tw: r() < 0.4, d: r(0, 3) }));
    return { via, sueltas };
  }, []);

  const pasto = useMemo(() => {
    const r = seeded(11);
    const capa = (n: number, base: number, hMin: number, hMax: number, colors: string[]) =>
      Array.from({ length: n }, () => {
        const x = r(-30, 1630), h = r(hMin, hMax), lean = r(-36, 46), w = r(5, 11);
        const c = colors[Math.floor(r(0, colors.length))];
        return {
          d: `M${x - w} ${base} C${x - w * 0.6} ${base - h * 0.45} ${x + lean * 0.35} ${base - h * 0.75} ${x + lean} ${base - h} C${x + lean * 0.5 + w * 0.5} ${base - h * 0.7} ${x + w * 0.9} ${base - h * 0.4} ${x + w} ${base} Z`,
          hl: `M${x - w * 0.2} ${base - 4} C${x} ${base - h * 0.4} ${x + lean * 0.3} ${base - h * 0.7} ${x + lean * 0.9} ${base - h * 0.95}`,
          c,
        };
      });
    const flores = Array.from({ length: 22 }, () => ({ x: r(20, 1580), y: r(800, 880), s: r(4, 7), c: r() < 0.5 ? "#fdf3d6" : "#b9cdf5", d: r(0, 3) }));
    const luciernagas = Array.from({ length: 18 }, () => ({ x: r(0, 1600), y: r(640, 860), d: r(0, 6), dur: r(10, 18) }));
    return {
      atras: [0, 1].map(() => capa(60, 880, 70, 150, ["#2d4637", "#34503f", "#283f33"])),
      medio: [0, 1].map(() => capa(55, 900, 100, 190, ["#46663f", "#527449", "#3d5b3b"])),
      frente: [0, 1].map(() => capa(34, 930, 120, 220, ["#5f8650", "#6c9459", "#557a4a"])),
      flores,
      luciernagas,
    };
  }, []);

  if (layer === "back") {
    // corazón de estrellas (constelación)
    const corazon = [[400, 300], [350, 240], [372, 196], [420, 200], [440, 236], [460, 200], [508, 196], [530, 240], [480, 300], [440, 340]];
    const linea = corazon.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ") + " Z";
    return (
      <svg viewBox="0 0 1600 900" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id={`cielo-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f162b" />
            <stop offset="45%" stopColor="#1d2850" />
            <stop offset="78%" stopColor="#38407a" />
            <stop offset="100%" stopColor="#6a5a8e" />
          </linearGradient>
        </defs>
        <rect width="1600" height="900" fill={`url(#cielo-${uid})`} />
        {/* vía láctea */}
        <g transform="rotate(-18 800 360)">
          <ellipse cx={800} cy={380} rx={900} ry={90} fill="#9aa6ee" opacity={0.07} />
          <ellipse cx={700} cy={370} rx={600} ry={55} fill="#c8a9ec" opacity={0.07} />
          <ellipse cx={980} cy={390} rx={420} ry={40} fill="#f0c9e6" opacity={0.06} />
        </g>
        {cielo.via.concat(cielo.sueltas).map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#fff6e4" className={st.tw ? "twinkle" : undefined} style={st.tw ? { animationDelay: `${-st.d}s` } : { opacity: 0.75 }} />
        ))}
        {/* constelación de corazón que se dibuja de izquierda a derecha */}
        <path d={linea} pathLength={1} className="constelacion" fill="none" stroke="#fff3d6" strokeWidth={1.6} strokeDasharray="1" />
        {corazon.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.6} fill="#fff3d6" className="twinkle" style={{ animationDelay: `${i * 0.25}s` }} />
        ))}
        <g className="drift" style={{ animationDuration: "60s" }}>
          <Cloud x={260} y={470} s={1.5} fill="#2e3866" />
          <Cloud x={1180} y={420} s={1.7} fill="#2e3866" />
        </g>
        <g className="drift" style={{ animationDuration: "40s" }}>
          <Cloud x={720} y={520} s={1.0} fill="#3a4580" />
          <Cloud x={120} y={580} s={1.1} fill="#3a4580" />
        </g>
        {/* luna con halo */}
        <g transform="translate(1300 170)">
          <circle r={120} fill="#fff3d6" className="halo" />
          <circle r={86} fill="#fff3d6" className="halo" style={{ animationDelay: "1s" }} />
          <circle r={58} fill="#fff6e4" />
          <circle cx={24} cy={-12} r={52} fill="#141c35" />
        </g>
        {/* montañas a lo lejos */}
        <path d="M0 700 L180 610 L320 670 L520 570 L700 660 L880 590 L1060 670 L1260 580 L1440 650 L1600 600 V900 H0Z" fill="#2b3264" />
        <path d="M0 740 Q300 660 640 710 T1300 670 T1600 690 V900 H0Z" fill="#232a52" />
        <g className="twinkle" stroke="#fff3d6" strokeLinecap="round">
          <path d="M210 90 V190 M160 140 H260" strokeWidth={2.2} />
          <circle cx={210} cy={140} r={6} fill="#fff3d6" stroke="none" />
        </g>
      </svg>
    );
  }

  const Capa = ({ blades, dur, delay, brillo }: { blades: { d: string; hl: string; c: string }[]; dur: number; delay: number; brillo?: boolean }) => (
    <g className="sway" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      {blades.map((b, i) => (
        <g key={i}>
          <path d={b.d} fill={b.c} />
          {brillo && <path d={b.hl} stroke="#a8cf86" strokeWidth={1.6} fill="none" opacity={0.45} strokeLinecap="round" />}
        </g>
      ))}
    </g>
  );

  return (
    <svg viewBox="0 0 1600 900" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs><Wobble id={wob} /></defs>
      <rect x={0} y={860} width={1600} height={40} fill="#22382c" />
      {pasto.atras.map((b, i) => <Capa key={`a${i}`} blades={b} dur={6 + i} delay={-i * 1.3} />)}
      {/* florecitas que brillan en la oscuridad */}
      {pasto.flores.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          <path d={`M0 0 V${f.s * 5}`} stroke="#3d5b3b" strokeWidth={2} />
          <circle r={f.s * 3} fill={f.c} opacity={0.12} className="twinkle" style={{ animationDelay: `${-f.d}s` }} />
          {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx={0} cy={-f.s * 0.8} rx={f.s * 0.5} ry={f.s * 0.8} fill={f.c} transform={`rotate(${r})`} />)}
          <circle r={f.s * 0.45} fill="#f2cf5b" />
        </g>
      ))}
      {pasto.medio.map((b, i) => <Capa key={`m${i}`} blades={b} dur={5 + i} delay={-i * 0.8} brillo />)}
      <g filter={`url(#${wob})`}>
        <Tore pose="sit" eyes={feliz ? "happy" : "up"} mouth={feliz ? "open" : "smile"} wag={feliz ? "fast" : "slow"} transform="translate(700 742) scale(1.15)" />
      </g>
      {/* diente de león que se mece */}
      {[220, 1180, 1460].map((x, i) => (
        <g key={x} transform={`translate(${x} 900)`}>
          <g className="sway" style={{ animationDuration: `${4 + i}s` }}>
            <path d="M0 0 Q6 -90 0 -190" stroke="#7a9a5c" strokeWidth={3} fill="none" />
            <circle cx={0} cy={-196} r={20} fill="#fdf3d6" opacity={0.15} />
            {Array.from({ length: 14 }, (_, k) => {
              const a = (k / 14) * Math.PI * 2;
              return <path key={k} d={`M0 -196 L${Math.cos(a) * 18} ${-196 + Math.sin(a) * 18}`} stroke="#fdf3d6" strokeWidth={1.2} opacity={0.8} />;
            })}
          </g>
        </g>
      ))}
      {pasto.frente.map((b, i) => <Capa key={`f${i}`} blades={b} dur={4.5 + i * 1.2} delay={-i * 1.7} brillo />)}
      {/* luciérnagas entre el pasto, flotando hacia la derecha */}
      {pasto.luciernagas.map((l, i) => (
        <g key={i}>
          <animateMotion dur={`${l.dur}s`} repeatCount="indefinite" begin={`${-l.d}s`} path={`M${l.x - 200} ${l.y} q100 -40 200 0 t200 0`} />
          <circle r={9} fill="#ffe9a8" opacity={0.18} className="twinkle" style={{ animationDelay: `${-l.d}s` }} />
          <circle r={2.6} fill="#fff6c8" className="twinkle" style={{ animationDelay: `${-l.d}s` }} />
        </g>
      ))}
    </svg>
  );
}

function IlustracionMar({ layer, feliz = false }: { layer: "back" | "front"; feliz?: boolean }) {
  const wob = useWobbleId();
  if (layer === "back") {
    return (
      <svg viewBox="0 0 800 1000" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect width="800" height="1000" fill="#a9c4d3" />
        <circle cx="590" cy="300" r="52" fill="#f6dfb8" />
        <g fill="none" stroke="#3b2a20" strokeWidth={3} strokeLinecap="round">
          {[0, 1, 2].map((i) => (
            <path key={i} d="M-8 -4 q8 -8 8 0 q0 -8 8 0">
              <animateMotion dur={`${18 + i * 5}s`} repeatCount="indefinite" begin={`${-i * 6}s`} path={`M-40 ${150 + i * 50} C 240 ${120 + i * 40} 520 ${200 + i * 30} 860 ${140 + i * 40}`} />
            </path>
          ))}
        </g>
        <g className="drift" style={{ animationDuration: "40s" }}>
          <Cloud x={160} y={120} s={0.55} fill="#f8f3ea" />
          <Cloud x={470} y={210} s={0.4} fill="#f8f3ea" />
        </g>
        <rect y="430" width="800" height="400" fill="#2f6f8f" />
        <rect y="430" width="800" height="36" fill="#285f7b" />
        {/* barco lejano cruzando el horizonte */}
        <g>
          <animateMotion dur="48s" repeatCount="indefinite" path="M-80 428 L880 428" />
          <path d="M-24 0 H24 L18 8 H-18 Z" fill="#3b2a20" />
          <path d="M-2 0 V-26 L14 0 Z" fill="#f8f3ea" />
        </g>
        {/* destellos del sol sobre el agua */}
        {[[560, 470], [610, 490], [585, 520], [640, 455], [530, 505], [600, 550]].map(([x, y], i) => (
          <path key={i} d={`M${x - 10} ${y} H${x + 10}`} stroke="#fff3d6" strokeWidth={3} strokeLinecap="round" className="glint" style={{ animationDelay: `${i * 0.37}s` }} />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 800 1000" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs><Wobble id={wob} /></defs>
      <path fill="#ead9b9">
        <animate attributeName="d" dur="5s" repeatCount="indefinite"
          values="M0 830 Q200 810 400 830 T800 826 V1000 H0Z;M0 822 Q200 842 400 822 T800 834 V1000 H0Z;M0 830 Q200 810 400 830 T800 826 V1000 H0Z" />
      </path>
      <path fill="none" stroke="#f8f3ea" strokeWidth={5} strokeLinecap="round">
        <animate attributeName="d" dur="5s" repeatCount="indefinite"
          values="M0 828 Q200 806 400 828 T800 824;M0 820 Q200 840 400 820 T800 832;M0 828 Q200 806 400 828 T800 824" />
      </path>
      <g filter={`url(#${wob})`}>
        {/* conchitas, estrella de mar y un cangrejito que camina hacia la derecha */}
        <g>
          <path d="M120 960 q10 -16 20 0 z" fill="#f2c4c0" stroke="#3b2a20" strokeWidth={2} />
          <path d="M300 985 l6 -14 l6 14 l-14 -9 h16 z" fill="#f0a35e" stroke="#3b2a20" strokeWidth={1.6} />
          <path d="M520 972 q8 -12 16 0 z" fill="#fbf6ec" stroke="#3b2a20" strokeWidth={2} />
        </g>
        <g>
          <animateMotion dur="24s" repeatCount="indefinite" path="M-40 978 L860 978" />
          <ellipse cx={0} cy={0} rx={14} ry={9} fill="#d9564a" stroke="#3b2a20" strokeWidth={2} />
          <path d="M-12 4 l-8 6 M-8 6 l-5 8 M12 4 l8 6 M8 6 l5 8 M-10 -6 l-8 -8 M10 -6 l8 -8" stroke="#3b2a20" strokeWidth={2} strokeLinecap="round" />
          <circle cx={-5} cy={-8} r={2} fill="#3b2a20" /><circle cx={5} cy={-8} r={2} fill="#3b2a20" />
        </g>
        {/* ella espera en la orilla los barquitos que vienen hacia ella */}
        <g transform="translate(655 935) scale(1.55)">
          <Chibi look={content.munecos.ella} hair="long" flip wave={feliz ? -60 : -10} />
        </g>
      </g>
    </svg>
  );
}

/* ═══════════════════════════ Composición ═══════════════════════════ */

export default function Escenas() {
  const root = useRef<HTMLDivElement>(null);
  const { flores, deseos, barcos } = useRecuerdos();
  const floresFeliz = useBlip(flores);
  const deseoFeliz = useBlip(deseos);
  const barcoFeliz = useBlip(barcos);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".esc-frame").forEach((el) => {
        wipe(el, el, { duration: 1.8 });
      });
      gsap.utils.toArray<HTMLElement>(".esc-copy").forEach((el) => slide(el.children, el));
      // las flores aparecen de izquierda a derecha cuando se abre la escena
      const pops = byX(gsap.utils.toArray<SVGGElement>(".flower-pop")).sort(
        (a, b) => Number(a.dataset.x) - Number(b.dataset.x),
      );
      gsap.from(pops, {
        scale: 0,
        transformOrigin: "50% 50%",
        duration: 0.6,
        ease: "back.out(3)",
        stagger: 0.02,
        scrollTrigger: { trigger: ".esc-campo", start: "top 60%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root}>
      {/* Campo: ilustración vertical a la izquierda, texto a la derecha */}
      <section data-ambient="petalos,destellos" className="bg-ground esc-campo grid gap-10 px-4 py-32 md:grid-cols-12 md:gap-8 md:px-8 md:py-48">
        <div className="esc-frame relative aspect-[4/5] overflow-hidden md:col-span-6">
          <IlustracionCampo feliz={floresFeliz} regalos={Math.floor(flores / 10)} />
          <PlantarFlores onCount={(n) => setRecuerdos({ flores: n })} />
        </div>
        <div className="esc-copy flex flex-col justify-end md:col-span-5 md:col-start-8">
          <h2 className="text-display font-medium">{campoTxt.titulo}</h2>
          <p className="mt-8 max-w-[34ch] text-body">{campoTxt.texto}</p>
          <p className="nums mt-12 text-display text-accent">{flores}</p>
          <p className="text-small">flores plantadas</p>
          {flores >= 10 && (
            <p className="mt-6 text-body italic">
              Tore ya te trajo {Math.floor(flores / 10)} {Math.floor(flores / 10) === 1 ? "flor" : "flores"}.
            </p>
          )}
        </div>
      </section>

      {/* Noche: a todo lo ancho, texto debajo */}
      <Puente carga="flor" texto={content.puentes.flor} dark from="#f1e8da" to="#1e2740" />

      <section data-ambient="luciernagas" className="bg-night py-32 text-paper md:py-48">
        <div className="esc-frame relative aspect-[4/5] overflow-hidden md:aspect-[16/9]">
          <IlustracionNoche layer="back" />
          <CieloEstrellado onWish={() => setRecuerdos((r) => ({ deseos: r.deseos + 1 }))} />
          <IlustracionNoche layer="front" feliz={deseoFeliz} />
        </div>
        <div className="esc-copy mt-14 grid gap-8 px-4 md:grid-cols-12 md:px-8">
          <h2 className="text-display font-medium md:col-span-6">{nocheTxt.titulo}</h2>
          <p className="max-w-[32ch] self-end text-body md:col-span-3 md:col-start-8">{nocheTxt.texto}</p>
          <p className="self-end text-body md:col-span-2 md:col-start-11">
            <span className="nums block text-display text-[#a9c4e8]">{deseos}</span>
            {deseos === 1 ? "deseo" : "deseos"}
          </p>
        </div>
      </section>

      <Puente carga="estrella" texto={content.puentes.estrella} from="#1e2740" to="#f1e8da" />

      {/* Mar: texto a la izquierda, ilustración a la derecha */}
      <section data-ambient="burbujas,corazones" className="bg-ground grid items-center gap-10 px-4 py-32 md:grid-cols-12 md:gap-8 md:px-8 md:py-48">
        <div className="esc-copy md:col-span-6">
          <h2 className="text-display font-medium">{marTxt.titulo}</h2>
          <p className="mt-8 max-w-[34ch] text-body">{marTxt.texto}</p>
          <p className="mt-12 text-small">
            <span className="nums mr-3 text-display text-accent">{barcos}</span>
            {barcos === 1 ? "barquito navegando hacia ti" : "barquitos navegando hacia ti"}
          </p>
        </div>
        <div className="esc-frame relative aspect-[4/5] overflow-hidden md:col-span-5 md:col-start-8">
          <IlustracionMar layer="back" />
          <MarConBarquitos onBoat={() => setRecuerdos((r) => ({ barcos: r.barcos + 1 }))} />
          <IlustracionMar layer="front" feliz={barcoFeliz} />
        </div>
      </section>
    </div>
  );
}
