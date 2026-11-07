import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "../lib/motion";
import { slide, wipe } from "../lib/ltr";
import { content } from "../content";
import { useBlip } from "../lib/useBlip";
import Tore from "./Tore";
import { Tendedero } from "./Decor";

/* Cada cifra que cambia entra deslizándose desde la izquierda. */
function Digits({ value }: { value: number }) {
  const text = value.toLocaleString("es");
  return (
    <span className="nums inline-flex" aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={`${text.length - i}-${ch}`} className="digit-in inline-block" aria-hidden>
          {ch}
        </span>
      ))}
    </span>
  );
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Contador() {
  const c = content.contador;
  const now = useNow();
  const since = new Date(c.desde).getTime();
  const secs = Math.max(0, Math.floor((now - since) / 1000));
  const veces = Math.floor(secs / c.segundosPorVez);
  const parts = [
    ["días", Math.floor(secs / 86400)],
    ["horas", Math.floor(secs / 3600) % 24],
    ["minutos", Math.floor(secs / 60) % 60],
    ["segundos", secs % 60],
  ] as const;

  const root = useRef<HTMLElement>(null);
  const salta = useBlip(veces, 1600);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      slide(".cnt-head > *", ".cnt-head");
      wipe(".cnt-big", ".cnt-big", { duration: 2 });
      slide(".cnt-part", ".cnt-parts", { stagger: 0.12 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="contador" ref={root} data-ambient="corazones,destellos" className="relative isolate bg-sand px-4 pb-32 pt-72 md:px-8 md:pb-48 md:pt-80">
      <Tendedero />
      <div className="cnt-head grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <h2 className="text-display font-medium">{c.titulo}</h2>
        </div>
        <p className="max-w-[34ch] self-end text-body md:col-span-4 md:col-start-8">{c.frase}</p>
      </div>

      <div className="mt-20 flex flex-wrap items-end gap-x-10 gap-y-6 md:mt-32">
        <div className="cnt-big">
          <div className="text-[clamp(5rem,17vw,18rem)] font-medium leading-none text-accent">
            <Digits value={veces} />
          </div>
          <p className="mt-4 text-body">{c.unidad}</p>
        </div>
        {/* Tore cuenta contigo: cada vez que sube el número, salta */}
        <svg viewBox="-110 -150 220 250" className="w-[150px] md:w-[210px]" aria-hidden data-cursor="Guau">
          <g className={salta ? "hop" : undefined}>
            <Tore pose="sit" eyes={salta ? "happy" : "open"} mouth={salta ? "open" : "tongue"} wag={salta ? "fast" : "slow"} />
          </g>
        </svg>
      </div>

      <div className="cnt-parts mt-24 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {parts.map(([label, v]) => (
          <div key={label} className="cnt-part">
            <div className="text-display font-medium"><span className="nums">{String(v).padStart(2, "0").split("").map((ch, i) => <span key={`${i}-${ch}`} className="digit-in inline-block">{ch}</span>)}</span></div>
            <div className="mt-2 text-small">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
