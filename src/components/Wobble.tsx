import { useEffect, useId, useRef } from "react";

/*
 * Filtro de "línea viva": desplaza levemente el trazo y cambia la semilla
 * varias veces por segundo, como un dibujo animado hecho a mano.
 */
export function Wobble({ id, scale = 2.4 }: { id: string; scale?: number }) {
  const turb = useRef<SVGFETurbulenceElement>(null);
  useEffect(() => {
    let seed = 1;
    const t = setInterval(() => {
      seed = (seed % 4) + 1;
      turb.current?.setAttribute("seed", String(seed));
    }, 140);
    return () => clearInterval(t);
  }, []);
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1" />
      <feDisplacementMap in="SourceGraphic" scale={scale} />
    </filter>
  );
}

export function useWobbleId() {
  return "wob" + useId().replace(/:/g, "");
}
