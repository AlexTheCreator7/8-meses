import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, getLenis, ScrollTrigger, SplitText, reducedMotion } from "../lib/motion";
import { HIDDEN, SHOWN } from "../lib/ltr";
import { seeded } from "../lib/seeded";
import { content } from "../content";
import Tore from "./Tore";
import Chibi, { MANO } from "./Chibi";
import { Objeto } from "./Puente";
import { Cloud, Flower } from "./Escenas";
import { Pajaros } from "./Decor";

/*
 * La entrega de la carta.
 * Al fondo del camino, Alessandro le da la carta a Tore (son cómplices).
 * Tore viene corriendo hacia la pantalla con la carta en la boca, salta,
 * la lanza, y la carta se abre hasta ocupar toda la pantalla.
 * El camino siempre avanza hacia la derecha mientras se acerca.
 */

type Pt = { x: number; y: number };
const W = 1600, H = 900;

// dos tramos de curva; en ambos la x solo crece (izquierda → derecha)
const SEGS: [Pt, Pt, Pt, Pt][] = [
  [{ x: 690, y: 420 }, { x: 760, y: 430 }, { x: 780, y: 520 }, { x: 820, y: 560 }],
  [{ x: 820, y: 560 }, { x: 855, y: 620 }, { x: 870, y: 760 }, { x: 885, y: 880 }],
];

function bez([a, b, c, d]: [Pt, Pt, Pt, Pt], t: number): Pt {
  const m = 1 - t;
  return {
    x: m * m * m * a.x + 3 * m * m * t * b.x + 3 * m * t * t * c.x + t * t * t * d.x,
    y: m * m * m * a.y + 3 * m * m * t * b.y + 3 * m * t * t * c.y + t * t * t * d.y,
  };
}

const SAMPLES: Pt[] = [
  ...Array.from({ length: 50 }, (_, k) => bez(SEGS[0], k / 50)),
  ...Array.from({ length: 51 }, (_, k) => bez(SEGS[1], k / 50)),
];
const LENS = SAMPLES.reduce<number[]>((acc, p, i) => (i === 0 ? [0] : [...acc, acc[i - 1] + Math.hypot(p.x - SAMPLES[i - 1].x, p.y - SAMPLES[i - 1].y)]), []);
const TOTAL = LENS[LENS.length - 1];

function at(u: number): Pt {
  const target = u * TOTAL;
  let i = 1;
  while (i < LENS.length - 1 && LENS[i] < target) i++;
  const a = SAMPLES[i - 1], b = SAMPLES[i];
  const f = (target - LENS[i - 1]) / (LENS[i] - LENS[i - 1] || 1);
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

const scaleAt = (u: number) => 0.17 + 1.38 * Math.pow(u, 1.7);
const widthAt = (u: number) => 6 + 560 * Math.pow(u, 1.6);

// la boca de Tore en coordenadas de la escena
function mouthAt(u: number) {
  const p = at(u), s = scaleAt(u);
  return { x: p.x, y: p.y - 84 * s - 14 * s, s };
}

const EL = { x: 640, y: 428, s: 0.55 }; // Alessandro al fondo del camino
const HAND = { x: EL.x + MANO.x * EL.s, y: EL.y + MANO.y * EL.s };

export default function Entrega() {
  const e = content.entrega;
  const c = content.carta;
  const section = useRef<HTMLElement>(null);
  const tore = useRef<SVGGElement>(null);
  const toreInner = useRef<SVGGElement>(null);
  const mouthEnv = useRef<SVGGElement>(null);
  const fly = useRef<SVGGElement>(null);
  const puffs = useRef<SVGGElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const [phase, setPhase] = useState<"espera" | "plan" | "corre" | "lanza" | "fin">("espera");
  const [open, setOpen] = useState(false);
  const [wave, setWave] = useState(0);
  const [run, setRun] = useState(0);

  const { road, flowers, pebbles } = useMemo(() => {
    // el camino: más angosto al fondo, ancho al frente
    const left: Pt[] = [], right: Pt[] = [];
    for (let i = 0; i <= 80; i++) {
      const u = i / 80, p = at(u), q = at(Math.min(1, u + 0.01));
      const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len, w = widthAt(u) / 2;
      left.push({ x: p.x + nx * w, y: p.y + ny * w });
      right.push({ x: p.x - nx * w, y: p.y - ny * w });
    }
    const road = "M" + left.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L") + " L" + right.reverse().map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L") + " Z";
    const r = seeded(9);
    const flowers = Array.from({ length: 70 }, () => {
      const u = r(0.05, 1), side = r() < 0.5 ? -1 : 1, p = at(u);
      const off = widthAt(u) / 2 + r(20, 260) * (0.3 + u);
      return { x: p.x + side * off, y: p.y + r(-10, 30) * u, s: 3 + 10 * u, c: ["#fbf6ec", "#f2cf5b", "#8fa9d6", "#e6a3a6"][Math.floor(r(0, 4))], delay: r(0, 4) };
    }).sort((a, b) => a.y - b.y);
    const pebbles = Array.from({ length: 40 }, () => {
      const u = r(0.1, 1), p = at(u);
      return { x: p.x + r(-0.4, 0.4) * widthAt(u), y: p.y + r(-6, 6), r: 1 + 5 * u };
    });
    return { road, flowers, pebbles };
  }, []);

  // él saluda mientras Tore se va corriendo
  useEffect(() => {
    if (phase !== "corre" && phase !== "lanza") return;
    let up = false;
    const id = setInterval(() => { up = !up; setWave(up ? -70 : -30); }, 260);
    return () => clearInterval(id);
  }, [phase]);

  const placeTore = (u: number, hop = 0) => {
    const p = at(u), s = scaleAt(u);
    tore.current?.setAttribute("transform", `translate(${p.x} ${p.y - 84 * s - hop}) scale(${s})`);
  };

  const puff = (u: number) => {
    const g = puffs.current;
    if (!g) return;
    const p = at(u), s = scaleAt(u);
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", String(p.x - 30 * s));
    c.setAttribute("cy", String(p.y - 4 * s));
    c.setAttribute("r", String(10 * s + 2));
    c.setAttribute("fill", "#e9dcc4");
    g.appendChild(c);
    gsap.to(c, { attr: { r: 26 * s + 4, cx: p.x - 70 * s }, opacity: 0, duration: 0.8, ease: "power1.out", onComplete: () => c.remove() });
  };

  const abrirCarta = () => {
    const env = fly.current!.getBoundingClientRect();
    setOpen(true);
    requestAnimationFrame(() => {
      const el = overlay.current!;
      const vw = window.innerWidth, vh = window.innerHeight;
      const tl = gsap.timeline({ onComplete: () => setPhase("fin") });
      tl.fromTo(
        el,
        { x: env.left, y: env.top, scaleX: env.width / vw, scaleY: env.height / vh, transformOrigin: "0 0" },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.9, ease: "power3.inOut" },
      )
        .set(fly.current, { opacity: 0 })
        // la solapa del sobre se abre de izquierda a derecha
        .to(el.querySelector(".solapa"), { clipPath: "inset(0% 0% 0% 100%)", duration: 0.8, ease: "power2.inOut" })
        .fromTo(el.querySelector(".carta-titulo"), { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: "expo.out" }, "-=0.3");
      const split = SplitText.create(el.querySelectorAll(".carta-p"), { type: "words", wordsClass: "split-word" });
      tl.fromTo(split.words, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.035, ease: "power1.out" }, "-=0.4")
        .fromTo(el.querySelector(".carta-firma"), { clipPath: HIDDEN }, { clipPath: SHOWN, duration: 1.4, ease: "power2.inOut" })
        .fromTo(el.querySelectorAll(".carta-pie > *"), { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "expo.out" }, "-=0.6");
    });
  };

  const play = () => {
    setPhase("plan");
    gsap.set([mouthEnv.current, fly.current], { opacity: 0 });
    gsap.set(toreInner.current, { scaleY: 1, transformOrigin: "50% 100%" });
    placeTore(0);
    const env = { x: HAND.x, y: HAND.y, s: 0.22 };
    const runner = { u: 0 };
    let lastPuff = 0;
    const tl = gsap.timeline();
    // 1. él le pasa la carta a Tore
    tl.set(fly.current, { opacity: 1, attr: { transform: `translate(${env.x} ${env.y}) scale(${env.s})` } })
      .to(env, {
        x: mouthAt(0).x, y: mouthAt(0).y, s: 0.6 * mouthAt(0).s, duration: 1.1, delay: 0.6, ease: "power1.inOut",
        onUpdate: () => fly.current?.setAttribute("transform", `translate(${env.x} ${env.y}) scale(${env.s})`),
      })
      .set(fly.current, { opacity: 0 })
      .set(mouthEnv.current, { opacity: 1 })
      .add(() => setPhase("corre"), "+=0.3")
      // 2. Tore viene corriendo por el camino
      .to(runner, {
        u: 1, duration: 3.6, ease: "power1.in",
        onUpdate: () => {
          const bob = Math.abs(Math.sin(runner.u * 60)) * 18 * scaleAt(runner.u);
          placeTore(runner.u, bob);
          if (runner.u - lastPuff > 0.06) { lastPuff = runner.u; puff(runner.u); }
        },
      })
      // 3. se agacha, salta y lanza la carta
      .add(() => setPhase("lanza"))
      .to(toreInner.current, { scaleY: 0.86, duration: 0.18, ease: "power2.out" })
      .to(toreInner.current, { scaleY: 1.05, y: -60, duration: 0.25, ease: "power2.out" })
      .add(() => {
        const m = mouthAt(1);
        const f = { x: m.x, y: m.y - 60, s: 0.6 * m.s, r: -18 };
        gsap.set(mouthEnv.current, { opacity: 0 });
        gsap.set(fly.current, { opacity: 1 });
        gsap.to(f, {
          x: W * 0.5, y: H * 0.42, s: 5.5, r: 0, duration: 0.75, ease: "power2.out",
          onUpdate: () => fly.current?.setAttribute("transform", `translate(${f.x} ${f.y}) rotate(${f.r}) scale(${f.s})`),
          onComplete: abrirCarta,
        });
      })
      .to(toreInner.current, { scaleY: 1, y: 0, duration: 0.35, ease: "bounce.out" });
  };

  // empieza cuando ella llega a esta parte
  useLayoutEffect(() => {
    placeTore(0);
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top 55%",
      onEnter: () => {
        if (played.current) return;
        played.current = true;
        const lenis = getLenis();
        if (reducedMotion) { setOpen(true); setPhase("fin"); return; }
        if (lenis) {
          const y = section.current!.getBoundingClientRect().top + window.scrollY;
          lenis.scrollTo(y, { duration: 1.1, lock: true, force: true, onComplete: () => { lenis.stop(); play(); } });
        } else {
          section.current!.scrollIntoView({ behavior: "smooth" });
          setTimeout(play, 800);
        }
      },
    });
    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const cerrar = (otraVez: boolean) => {
    gsap.to(overlay.current, {
      clipPath: "inset(0% 0% 0% 100%)", duration: 0.8, ease: "power2.inOut",
      onComplete: () => {
        setOpen(false);
        const lenis = getLenis();
        if (otraVez) { setRun((r) => r + 1); played.current = true; setTimeout(play, 300); return; }
        lenis?.start();
        setPhase("espera");
        const fin = document.querySelector<HTMLElement>("#final");
        if (lenis && fin) lenis.scrollTo(fin.getBoundingClientRect().top + window.scrollY, { duration: 1.6 });
        else fin?.scrollIntoView({ behavior: "smooth" });
      },
    });
  };

  const caption = phase === "plan" ? e.plan : phase === "corre" ? e.corre : phase === "lanza" ? e.lanza : e.espera;

  return (
    <section id="entrega" ref={section} data-ambient="petalos,destellos" className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#f6e8d3]">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <g transform="translate(1180 230)">
          <g className="spin-slow">
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d="M0 -84 V-104" stroke="#e8c77a" strokeWidth={5} strokeLinecap="round" transform={`rotate(${i * 30})`} />
            ))}
          </g>
          <circle r={62} fill="#f6dfb8" />
        </g>
        <g className="drift" style={{ animationDuration: "50s" }}>
          <Cloud x={380} y={160} s={0.9} fill="#fbf6ec" />
          <Cloud x={980} y={110} s={0.7} fill="#fbf6ec" />
        </g>
        <Pajaros y={140} n={4} dur={24} />
        {/* colinas lejanas con arbolitos */}
        <path d="M0 460 Q300 380 640 420 T1240 400 T1600 420 V900 H0Z" fill="#e2d5b9" />
        {[220, 330, 1120, 1260, 1400].map((x, i) => (
          <g key={x} transform={`translate(${x} ${400 + (i % 2) * 12})`}>
            <rect x={-3} y={0} width={6} height={22} fill="#8a6142" />
            <circle cy={-6} r={18} fill={i % 2 ? "#9fae79" : "#b5bf8c"} />
          </g>
        ))}
        <path d="M0 520 Q380 450 760 470 T1600 470 V900 H0Z" fill="#cdd3ad" />
        <path d="M0 640 Q420 560 800 590 T1600 600 V900 H0Z" fill="#bcc697" />

        {/* el camino */}
        <path d={road} fill="#ead9b7" />
        {pebbles.map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.6} fill="#d6c19a" />)}
        {flowers.map((f, i) => <Flower key={i} {...f} />)}

        {/* Alessandro al fondo, cómplice */}
        <g transform={`translate(${EL.x} ${EL.y}) scale(${EL.s})`}>
          <Chibi look={content.munecos.el} hair="short" wave={wave} />
        </g>

        <g ref={puffs} />

        {/* Tore con la carta en la boca */}
        <g ref={tore}>
          <g ref={toreInner}>
            <Tore pose={phase === "corre" ? "walk" : "sit"} eyes={phase === "lanza" ? "happy" : "open"} mouth="smile" wag={phase === "espera" ? "slow" : "fast"} />
            <g ref={mouthEnv} transform="translate(0 -14) rotate(-8) scale(0.6)" opacity={0}>
              <Objeto tipo="carta" />
            </g>
          </g>
        </g>

        {/* la carta que vuela (en la mano de él, luego lanzada) */}
        <g ref={fly} opacity={0}>
          <Objeto tipo="carta" />
        </g>
      </svg>

      <div className="pointer-events-none relative px-4 pt-24 md:px-8 md:pt-28">
        <AnimatePresence mode="wait">
          <motion.p
            key={caption}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.9, 0.2, 1] }}
            className="max-w-[16ch] text-display font-medium"
          >
            {caption}
          </motion.p>
        </AnimatePresence>
      </div>

      {phase === "espera" && played.current && (
        <button
          onClick={() => { played.current = true; play(); getLenis()?.stop(); }}
          className="absolute bottom-6 left-4 rounded-full bg-ink px-6 py-3 text-small font-semibold text-paper md:left-8"
        >
          {e.otraVez}
        </button>
      )}

      {open && (
        <div
          ref={overlay}
          data-lenis-prevent
          className="fixed left-0 top-0 z-[70] h-[100svh] w-screen overflow-y-auto bg-paper"
          style={{ clipPath: "inset(0% 0% 0% 0%)" }}
        >
          {/* solapa del sobre, se abre al llegar */}
          <svg className="solapa pointer-events-none absolute inset-x-0 top-0 h-[38svh] w-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
            <path d="M0 0 H100 L50 40 Z" fill="#efe2cc" />
            <path d="M44 22 C38 16 38 11 42 9.5 C45 8.6 47 10 50 13 C53 10 55 8.6 58 9.5 C62 11 62 16 56 22 L50 28 Z" fill="#b3263a" transform="translate(0 4) scale(1 0.9)" />
          </svg>

          <div className="mx-auto flex min-h-full max-w-[860px] flex-col justify-center px-6 py-20 md:px-10">
            <h2 className="carta-titulo text-display font-medium">{c.titulo}</h2>
            <div className="mt-10 space-y-8">
              {c.parrafos.map((p, i) => (
                <p key={i} className="carta-p max-w-[34ch] text-[clamp(1.6rem,3vw,2.6rem)] italic leading-[1.25]">
                  {p}
                </p>
              ))}
            </div>
            <p className="carta-firma script-pad mt-8 inline-block self-start font-script text-[clamp(3.5rem,7vw,6rem)] leading-[1.3] text-accent">
              {content.firma}
            </p>
            <div className="carta-pie mt-8 flex flex-wrap items-end gap-4">
              <svg viewBox="-110 -140 220 240" className="w-[96px]" aria-hidden>
                <Tore pose="sit" eyes="happy" mouth="tongue" wag="fast" paw />
              </svg>
              <p className="mb-4 max-w-[26ch] text-small">{e.firmaTore}</p>
              <span className="flex-1" />
              <button onClick={() => cerrar(true)} className="rounded-full bg-ground px-6 py-3 text-small font-semibold hover:bg-sand">
                {e.otraVez}
              </button>
              <button onClick={() => cerrar(false)} className="rounded-full bg-accent px-8 py-3 text-small font-semibold text-paper">
                {e.seguir}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
