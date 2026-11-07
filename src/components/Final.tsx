import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "../lib/motion";
import { HIDDEN, SHOWN, slide } from "../lib/ltr";
import { celebrate } from "./Celebracion";
import Tore from "./Tore";
import { Fiesta } from "./Decor";
import { content } from "../content";
import { useRecuerdos } from "../lib/store";

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

const EXCUSAS = ["¿Segura?", "Piénsalo bien", "Se escapa solo", "No se deja", "Mejor el otro", "Casi"];

export default function Final() {
  const f = content.final;
  const root = useRef<HTMLElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const [yes, setYes] = useState(false);
  const [no, setNo] = useState<{ x: number; y: number; i: number } | null>(null);
  const r = useRecuerdos();
  const pregunta = f.pregunta.replace("{cafe}", r.cafe ? `un ${r.cafe}` : "un café");
  const recuerdo = f.recuerdo
    .replace("{flores}", plural(r.flores, "flor", "flores"))
    .replace("{deseos}", plural(r.deseos, "deseo", "deseos"))
    .replace("{barcos}", plural(r.barcos, "barquito", "barquitos"));
  const hizoAlgo = r.flores + r.deseos + r.barcos > 0;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      slide(".fin-q > *", ".fin-q");
      gsap.fromTo(".fin-name", { clipPath: HIDDEN }, { clipPath: SHOWN, duration: 2.4, ease: "power2.inOut", scrollTrigger: { trigger: ".fin-name", start: "top 90%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  // el botón "No" huye a otro lugar del área
  const flee = () => {
    const r = area.current!.getBoundingClientRect();
    setNo((prev) => ({ x: Math.random() * (r.width - 170), y: Math.random() * (r.height - 64), i: (prev?.i ?? -1) + 1 }));
  };

  const accept = () => {
    setYes(true);
    celebrate("lluvia");
    setTimeout(() => celebrate("estrellas"), 900);
  };

  return (
    <section id="final" ref={root} data-ambient="corazones,petalos" className="relative isolate bg-sand flex min-h-[100svh] flex-col justify-between px-4 pb-6 pt-40 md:px-8 md:pb-8">
      <Fiesta />
      <AnimatePresence mode="wait">
        {!yes ? (
          <motion.div key="q" exit={{ x: 80, opacity: 0 }} transition={{ duration: 0.5 }} className="fin-q flex flex-1 flex-col">
            <h2 className="max-w-[14ch] text-display font-medium">{pregunta}</h2>
            <div ref={area} className="relative mt-16 min-h-[240px] flex-1">
              <button onClick={accept} data-cursor="Sí" className="rounded-full bg-accent px-12 py-5 text-body font-semibold text-paper transition-transform hover:scale-105">
                {f.si}
              </button>
              <motion.button
                onPointerEnter={flee}
                onClick={flee}
                animate={no ? { left: no.x, top: no.y } : { left: 170, top: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="absolute rounded-full bg-ink px-10 py-5 text-body font-semibold text-paper"
                style={{ left: 170, top: 0 }}
              >
                {no ? EXCUSAS[no.i % EXCUSAS.length] : f.no}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="a"
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.2, 0.9, 0.2, 1] }}
            className="grid flex-1 items-center gap-10 md:grid-cols-12"
          >
            <div className="md:col-span-7">
              <h2 className="max-w-[14ch] text-display font-medium">{f.respuesta}</h2>
              <p className="mt-8 max-w-[32ch] text-body">{f.cierre}</p>
              {hizoAlgo && <p className="mt-4 max-w-[36ch] text-body italic">{recuerdo}</p>}
              <button onClick={() => celebrate("lluvia")} className="mt-10 rounded-full bg-ink px-8 py-4 text-small font-semibold text-paper">
                Otra vez
              </button>
            </div>
            <div className="flex items-end gap-6 md:col-span-5 md:col-start-8">
              <svg viewBox="-110 -140 220 240" className="w-1/2 max-w-[280px] shrink-0" aria-hidden>
                <g className="hop-loop">
                  <Tore pose="sit" paw eyes="happy" mouth="open" wag="fast" />
                </g>
              </svg>
              {r.dibujo && (
                <figure className="w-1/2 max-w-[260px] -rotate-2 bg-paper p-3">
                  <img src={r.dibujo} alt="Su dibujo para Tore" className="block w-full" />
                  <figcaption className="mt-2 text-small">{f.tuDibujo}</figcaption>
                </figure>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-24">
        <p className="fin-name script-pad -ml-2 inline-block font-script text-mega">{content.nombre}</p>
        <div className="mt-2 flex flex-wrap justify-between gap-4 text-small">
          <span>Hecho a mano por {content.firma}</span>
          <span className="hidden md:inline">Escribe "angie" o "cafe" en el teclado</span>
        </div>
      </footer>
    </section>
  );
}
