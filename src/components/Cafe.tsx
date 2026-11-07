import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "../lib/motion";
import { slide } from "../lib/ltr";
import { setRecuerdos } from "../lib/store";
import { content } from "../content";
import Tore from "./Tore";
import { Cafeteria } from "./Decor";

/*
 * Su favorito: caramel macchiato. Se sirve por capas (leche, espresso,
 * espumita y un hilo de caramelo que se dibuja de izquierda a derecha)
 * mientras Tore, trepado en el borde del vaso, mira qué hay adentro.
 */

const RIM = 40;
const BOTTOM = 300;
const GLASS = "M70 40 H250 L234 296 Q232 310 218 310 H102 Q88 310 86 296 Z";
const CAPAS = [
  { c: "#f1e6d4", h: 0.46, d: 0 },    // leche
  { c: "#8a5634", h: 0.16, d: 0.9 },  // espresso
  { c: "#c58e5c", h: 0.07, d: 1.4 },  // donde se mezclan
  { c: "#fbf6ec", h: 0.17, d: 1.8 },  // espumita
];

export default function Cafe() {
  const c = content.cafe;
  const root = useRef<HTMLElement>(null);
  const [servido, setServido] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      slide(".cafe-copy > *", ".cafe-copy");
      gsap.from(".cafe-cup", { x: -80, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".cafe-cup", start: "top 80%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  const servir = () => {
    setServido((s) => s + 1);
    setRecuerdos({ cafe: c.bebida.toLowerCase() });
  };

  const H = BOTTOM - RIM - 20;
  let acc = 0;
  const capas = CAPAS.map((l) => {
    const h = l.h * H;
    const y = BOTTOM - acc - h;
    acc += h;
    return { ...l, y, hh: h };
  });
  const top = BOTTOM - acc;
  const lleno = servido > 0;

  return (
    <section id="cafe" ref={root} data-ambient="granos,destellos" className="relative isolate bg-coffee px-4 py-32 text-paper md:px-8 md:py-48">
      <Cafeteria />
      <div className="grid items-center gap-16 md:grid-cols-12 md:gap-8">
        <div className="cafe-copy md:col-span-5">
          <h2 className="text-display font-medium">{c.titulo}</h2>
          <p className="mt-8 max-w-[30ch] text-body">{c.texto}</p>
          <p className="mt-14 text-display font-medium text-[#e8b97e]">{c.bebida}</p>
          <button onClick={servir} data-cursor="Servir" className="mt-8 rounded-full bg-accent px-10 py-4 text-body font-semibold text-paper hover:scale-105">
            {lleno ? "Otro, por favor" : c.servir}
          </button>
          <div className="mt-8 min-h-[4.5em]">
            <AnimatePresence mode="wait">
              {lleno && (
                <motion.p
                  key={servido}
                  className="max-w-[32ch] text-body"
                  initial={{ x: -24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 2.4 }}
                >
                  {c.nota}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <svg viewBox="0 -130 320 470" className="cafe-cup mx-auto w-full max-w-[460px]" aria-label="Un caramel macchiato con Tore asomándose">
            <defs>
              <clipPath id="vaso"><path d={GLASS} /></clipPath>
              <clipPath id="sobre-borde"><rect x={-200} y={-400} width={800} height={RIM + 400 + 6} /></clipPath>
            </defs>

            {/* Tore trepado en el borde, mirando adentro */}
            <g clipPath="url(#sobre-borde)">
              <g transform={`translate(176 ${RIM - 30}) scale(0.62)`}>
                <Tore pose="sit" eyes={lleno ? "happy" : "down"} mouth={lleno ? "tongue" : "smile"} wag={lleno ? "fast" : "slow"} />
              </g>
            </g>

            {/* chorro que sirve, de arriba al vaso */}
            <motion.rect
              key={`chorro-${servido}`}
              x={112} width={9} rx={4} fill="#f1e6d4"
              initial={{ y: -130, height: 0, opacity: 0 }}
              animate={lleno ? { y: [-130, -130, top], height: [0, top + 130, 0], opacity: [1, 1, 1] } : {}}
              transition={{ duration: 2, times: [0, 0.4, 1], ease: "easeInOut" }}
            />

            {/* el vaso de vidrio y sus capas */}
            <g clipPath="url(#vaso)">
              <rect x={0} y={0} width={320} height={320} fill="#f8f3ea" opacity={0.1} />
              {capas.map((l, i) => (
                <motion.rect
                  key={`${i}-${servido}`}
                  x={0} width={320} fill={l.c}
                  initial={{ y: BOTTOM, height: 0 }}
                  animate={lleno ? { y: l.y, height: l.hh + 2 } : { y: BOTTOM, height: 0 }}
                  transition={{ duration: 0.9, delay: l.d, ease: [0.2, 0.9, 0.2, 1] }}
                />
              ))}
            </g>
            {/* hilo de caramelo encima, se dibuja de izquierda a derecha */}
            {lleno && (
              <motion.path
                key={`caramelo-${servido}`}
                d={`M100 ${top + 8} L124 ${top + 20} L148 ${top + 6} L172 ${top + 20} L196 ${top + 6} L220 ${top + 18}`}
                fill="none" stroke="#c98a3a" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 2.5, ease: "easeInOut" }}
              />
            )}
            <path d={GLASS} fill="none" stroke="#f8f3ea" strokeWidth={6} strokeLinejoin="round" />
            <path d="M92 70 L104 280" stroke="#f8f3ea" strokeWidth={4} strokeLinecap="round" opacity={0.35} />
            {/* patitas de Tore sobre el borde */}
            <ellipse cx={160} cy={RIM - 2} rx={11} ry={7} fill="#fffaf2" stroke="#6b4a36" strokeWidth={3} />
            <ellipse cx={192} cy={RIM - 2} rx={11} ry={7} fill="#fffaf2" stroke="#6b4a36" strokeWidth={3} />
            <path d="M40 326 H280" stroke="#f8f3ea" strokeWidth={6} strokeLinecap="round" />

            {lleno &&
              [58, 262].map((x, i) => (
                <motion.path
                  key={`${x}-${servido}`}
                  d={`M${x} 20c-12-12 12-20 0-36`}
                  fill="none" stroke="#f8f3ea" strokeWidth={4} strokeLinecap="round"
                  animate={{ pathLength: [0, 1, 1], pathOffset: [0, 0, 1], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: 3 + i * 0.7, ease: "easeInOut" }}
                />
              ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
