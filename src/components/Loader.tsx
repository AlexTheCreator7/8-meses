import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* Su nombre se escribe a mano, de izquierda a derecha, mientras carga. */
export default function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 2600;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setPct(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // abrir con un toque: así el navegador deja sonar la canción
  const abrir = () => {
    if (pct < 100) return;
    window.dispatchEvent(new Event("angie:abrir"));
    onDone();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-ground p-6 md:p-8"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 0% 100%)" }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <p className="text-small">Preparando algo para ti</p>
      <div className="flex flex-1 items-center">
        <span
          className="script-pad font-script text-mega text-ink"
          style={{ clipPath: `inset(0% ${100 - pct}% 0% 0%)` }}
        >
          Angie
        </span>
      </div>
      <div className="flex items-center justify-between gap-6">
        {pct < 100 ? (
          <>
            <div className="h-[6px] flex-1 bg-sand">
              <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <span className="nums w-[3ch] text-right text-body">{pct}</span>
          </>
        ) : (
          <motion.button
            onClick={abrir}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.2, 0.9, 0.2, 1] }}
            data-cursor="Abrir"
            className="rounded-full bg-accent px-10 py-4 text-body font-semibold text-paper"
          >
            Abrir, con música
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
