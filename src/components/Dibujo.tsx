import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "../lib/motion";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { slide } from "../lib/ltr";
import Tore from "./Tore";
import { Wobble, useWobbleId } from "./Wobble";
import { useRecuerdos } from "../lib/store";
import { useBlip } from "../lib/useBlip";
import { Garabatos } from "./Decor";
import { content } from "../content";
import { setRecuerdos } from "../lib/store";

gsap.registerPlugin(DrawSVGPlugin);

const PAD = ["#3b2a20", "#4a6fa5", "#d48a45", "#e6a3a6", "#f2cf5b"];

/* Tore se dibuja trazo a trazo, siempre de izquierda a derecha, y luego cobra vida. */
function ToreSeDibuja({ run, feliz }: { run: number; feliz: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const wob = useWobbleId();

  useLayoutEffect(() => {
    const el = svg.current!;
    const ctx = gsap.context(() => {
      const shapes = Array.from(el.querySelectorAll<SVGGeometryElement>(".who path, .who ellipse, .who circle"));
      const ordered = shapes
        .map((s) => ({ s, x: s.getBBox().x }))
        .sort((a, b) => a.x - b.x)
        .map((o) => o.s);
      const stroked = ordered.filter((s) => s.getAttribute("stroke") && s.getAttribute("stroke") !== "none");
      const flat = ordered.filter((s) => !stroked.includes(s));

      const tl = gsap.timeline({ scrollTrigger: run ? undefined : { trigger: el, start: "top 70%" } });
      tl.set(ordered, { fillOpacity: 0 })
        .set(flat, { opacity: 0 })
        .fromTo(stroked, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.7, stagger: 0.09, ease: "power2.inOut" })
        .to(ordered, { fillOpacity: 1, duration: 0.6, stagger: 0.02 }, "-=0.3")
        .to(flat, { opacity: 1, duration: 0.4, stagger: 0.05 }, "<")
        .set(el.querySelectorAll(".canelo-tail"), { clearProps: "transform" });
    }, el);
    return () => ctx.revert();
  }, [run]);

  return (
    <svg ref={svg} viewBox="-120 -140 240 240" className="h-full w-full" aria-label="Tore, un shih tzu que mueve la cola">
      <defs><Wobble id={wob} scale={2} /></defs>
      <g filter={`url(#${wob})`} className="who">
        <Tore pose="sit" eyes={feliz ? "happy" : "open"} mouth={feliz ? "open" : "tongue"} wag={feliz ? "fast" : "slow"} />
      </g>
    </svg>
  );
}

function Lienzo() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(PAD[1]);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const prep = () => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== Math.round(r.width * dpr)) {
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      const ctx = c.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#f8f3ea";
      ctx.fillRect(0, 0, r.width, r.height);
    }
    return { ctx: c.getContext("2d")!, r };
  };

  const line = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const { ctx, r } = prep();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top, w: e.pressure || 0.5 };
    const l = last.current ?? p;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3 + p.w * 6;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const clear = () => {
    const { ctx, r } = prep();
    ctx.fillStyle = "#f8f3ea";
    ctx.fillRect(0, 0, r.width, r.height);
    setRecuerdos({ dibujo: null });
  };

  const save = () => {
    const a = document.createElement("a");
    a.download = "dibujo-para-tore.png";
    a.href = canvas.current!.toDataURL("image/png");
    a.click();
  };

  return (
    <div>
      <canvas
        ref={canvas}
        className="aspect-[4/3] w-full bg-paper"
        style={{ touchAction: "none" }}
        data-cursor=" "
        onPointerDown={(e) => { drawing.current = true; last.current = null; (e.target as HTMLElement).setPointerCapture(e.pointerId); line(e); }}
        onPointerMove={line}
        onPointerUp={() => { drawing.current = false; last.current = null; setRecuerdos({ dibujo: canvas.current!.toDataURL("image/png") }); }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {PAD.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            className="h-10 w-10 rounded-full transition-transform"
            style={{ background: c, transform: color === c ? "scale(1.2)" : "scale(1)" }}
          />
        ))}
        <span className="flex-1" />
        <button onClick={clear} className="rounded-full bg-paper px-6 py-3 text-small font-semibold hover:bg-ground">
          Borrar
        </button>
        <button onClick={save} className="rounded-full bg-ink px-6 py-3 text-small font-semibold text-paper hover:bg-accent">
          Guardar dibujo
        </button>
      </div>
    </div>
  );
}

export default function Dibujo() {
  const d = content.dibujo;
  const root = useRef<HTMLElement>(null);
  const [run, setRun] = useState(0);
  // cada vez que ella dibuja algo, Tore se emociona
  const feliz = useBlip(useRecuerdos().dibujo, 1600);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => slide(".dib-copy > *", ".dib-copy"), root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="tore" ref={root} data-ambient="destellos,petalos" className="relative isolate bg-sand px-4 py-32 md:px-8 md:py-48">
      <Garabatos />
      <div className="grid gap-16 md:grid-cols-12 md:gap-8">
        <div className="dib-copy md:col-span-5">
          <h2 className="text-display font-medium">{d.titulo}</h2>
          <p className="mt-8 max-w-[36ch] text-body">{d.texto}</p>
          <div className="mt-6 aspect-square w-full max-w-[420px]" data-cursor="Hola">
            <ToreSeDibuja run={run} key={run} feliz={feliz} />
          </div>
          <button onClick={() => setRun((r) => r + 1)} className="mt-6 rounded-full bg-ink px-6 py-3 text-small font-semibold text-paper hover:bg-accent">
            Dibújalo otra vez
          </button>
        </div>
        <div className="md:col-span-6 md:col-start-7 md:self-end">
          <p className="mb-6 text-body">{d.lienzo}</p>
          <Lienzo />
        </div>
      </div>
    </section>
  );
}
