import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "../lib/motion";
import { slide } from "../lib/ltr";
import Tore, { C } from "./Tore";

const G = { line: C.line, accent: C.bandana };


/*
 * Puente entre secciones: Tore cruza de izquierda a derecha llevando algo
 * de la sección anterior a la siguiente.
 */

export type Carga = "hueso" | "flor" | "estrella" | "barco" | "taza" | "carta";

export function Objeto({ tipo }: { tipo: Carga }) {
  const line = { stroke: G.line, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (tipo) {
    case "hueso":
      return (
        <path
          d="M-28 -8 a9 9 0 1 1 6 -12 h44 a9 9 0 1 1 6 12 a9 9 0 1 1 -6 12 h-44 a9 9 0 1 1 -6 -12 z"
          fill="#fbf6ec"
          {...line}
        />
      );
    case "flor":
      return (
        <g>
          <path d="M0 26 Q4 6 0 -6" stroke="#5f7c4f" strokeWidth={4} fill="none" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx={0} cy={-22} rx={8} ry={12} fill="#e6a3a6" stroke={G.line} strokeWidth={3} transform={`rotate(${r} 0 -10)`} />
          ))}
          <circle cx={0} cy={-10} r={7} fill="#f2cf5b" stroke={G.line} strokeWidth={3} />
        </g>
      );
    case "estrella":
      return <path d="M0 -30 L8 -8 L30 0 L8 8 L0 30 L-8 8 L-30 0 L-8 -8 Z" fill="#f2cf5b" {...line} />;
    case "barco":
      return (
        <g>
          <path d="M-32 0 H32 L20 16 H-20 Z" fill="#f8f3ea" {...line} />
          <path d="M-2 -2 V-36 L22 -2 Z" fill="#e6a3a6" {...line} />
        </g>
      );
    case "taza":
      return (
        <g>
          <path d="M-22 -14 H22 L18 18 A6 6 0 0 1 12 24 H-12 A6 6 0 0 1 -18 18 Z" fill={G.accent} {...line} />
          <path d="M22 -6 A9 9 0 0 1 22 12" fill="none" {...line} />
          <path d="M-8 -22 c-5 -6 5 -9 0 -16 M6 -22 c-5 -6 5 -9 0 -16" fill="none" {...line} strokeWidth={3.5} />
        </g>
      );
    case "carta":
      return (
        <g>
          <rect x={-34} y={-22} width={68} height={46} rx={4} fill="#f8f3ea" {...line} />
          <path d="M-34 -20 L0 6 L34 -20" fill="none" {...line} />
          <path d="M0 18 C-12 8 -14 0 -8 -3 C-4 -5 -1 -3 0 0 C1 -3 4 -5 8 -3 C14 0 12 8 0 18 Z" fill="#b3263a" stroke="none" />
        </g>
      );
  }
}

function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useLayoutEffect(() => {
    const on = () => setNarrow(window.innerWidth < 768);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return narrow;
}

export default function Puente({ carga, texto, dark = false, from, to }: { carga: Carga; texto?: string; dark?: boolean; from: string; to: string }) {
  const root = useRef<HTMLDivElement>(null);
  const walker = useRef<SVGGElement>(null);
  const clip = useRef<SVGRectElement>(null);
  const clipId = "huellas" + carga;
  const narrow = useNarrow();
  const W = narrow ? 720 : 1440;
  const H = 300;

  useLayoutEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      // Tore cruza de izquierda a derecha mientras bajas
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 20%", scrub: 0.6 } });
      tl.fromTo(walker.current, { x: -120 }, { x: W + 120, duration: 1 }, 0);
      // las huellitas aparecen detrás de él, de izquierda a derecha
      tl.fromTo(clip.current, { attr: { width: 0 } }, { attr: { width: W + 240 }, duration: 1 }, 0);
            if (texto) slide(".pt-texto", el);
    }, el);
    return () => ctx.revert();
  }, [texto, W]);

  return (
    <div ref={root} className="overflow-hidden px-4 pt-16 md:px-8 md:pt-24" style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden>
        <defs>
          <clipPath id={clipId}>
            <rect ref={clip} x={-120} y={0} width={0} height={H} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`} fill="#3b2a20" opacity={0.22}>
          {Array.from({ length: Math.floor(W / 46) }, (_, i) => {
            const x = 20 + i * 46;
            const y = H - 18 + (i % 2 === 0 ? -9 : 9);
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(90)`}>
                <ellipse cx={0} cy={0} rx={6} ry={5} />
                <circle cx={-6} cy={-7} r={2.4} />
                <circle cx={0} cy={-9} r={2.4} />
                <circle cx={6} cy={-7} r={2.4} />
              </g>
            );
          })}
        </g>
        <g ref={walker}>
          <g transform={`translate(0 ${H - 70}) scale(0.62)`}>
            <g className="pt-paso">
              <Tore pose="walk" eyes="happy" mouth="tongue" wag="fast" />
              <g transform="translate(0 -150)">
                <g className="breathe">
                  <Objeto tipo={carga} />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
      {texto && <p className={`pt-texto pb-4 text-small ${dark ? "text-paper" : ""}`}>{texto}</p>}
    </div>
  );
}
