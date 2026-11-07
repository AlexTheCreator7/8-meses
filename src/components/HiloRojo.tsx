import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../lib/motion";
import Chibi, { MANO } from "./Chibi";
import { content } from "../content";

/*
 * El hilo rojo del destino.
 * Un solo hilo recorre toda la página. Ella aparece al principio agarrada
 * de él y lo va siguiendo mientras bajas; detrás de ella el hilo se vuelve
 * rojo intenso. Al final, él la espera sosteniendo el otro extremo.
 *
 * El hilo siempre avanza hacia la derecha: cada tramo va más a la derecha
 * que el anterior, así que todo lo que se dibuja va de izquierda a derecha.
 */

const RED = "#b3263a";
const ANCHOR = 0.42; // altura de la pantalla donde la verás colgada

type Geo = { W: number; H: number; d: string; end: { x: number; y: number }; narrow: boolean };

function buildGeo(): Geo {
  const W = document.documentElement.clientWidth;
  const H = document.documentElement.scrollHeight;
  const vh = window.innerHeight;
  const narrow = W < 768;
  const x0 = W * (narrow ? 0.22 : 0.36);
  const x1 = W * (narrow ? 0.8 : 0.84);
  const y0 = vh * ANCHOR;
  const y1 = H - vh * (1 - ANCHOR);
  const n = Math.max(6, Math.round((y1 - y0) / 650));
  const step = (x1 - x0) / n;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const wobble = i === 0 || i === n ? 0 : Math.sin(i * 1.7) * step * 0.42; // nunca retrocede
    return { x: x0 + (x1 - x0) * t + wobble, y: y0 + (y1 - y0) * t };
  });
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[i + 1], h = (b.y - a.y) / 2;
    d += ` C${a.x} ${a.y + h} ${b.x} ${b.y - h} ${b.x} ${b.y}`;
  }
  return { W, H, d, end: pts[n], narrow };
}

export default function HiloRojo({ ready }: { ready: boolean }) {
  const [geo, setGeo] = useState<Geo | null>(null);
  const solid = useRef<SVGPathElement>(null);
  const her = useRef<SVGGElement>(null);
  const himWalk = useRef<SVGGElement>(null);
  const [leg, setLeg] = useState(0);
  const [himLeg, setHimLeg] = useState(0);
  const [blink, setBlink] = useState(false);
  const [arrived, setArrived] = useState(false);
  const { ella, el } = content.munecos;

  // recalcula el recorrido cuando cambia el alto de la página
  useEffect(() => {
    if (!ready) return;
    let t = 0;
    const update = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        setGeo((g) => {
          const n = buildGeo();
          return g && g.W === n.W && Math.abs(g.H - n.H) < 2 ? g : n;
        });
      }, 120);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); clearTimeout(t); };
  }, [ready]);

  // parpadeo de los dos
  useEffect(() => {
    const id = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 140); }, 3600);
    return () => clearInterval(id);
  }, []);

  // ella sigue el hilo según el scroll
  useLayoutEffect(() => {
    if (!geo || !solid.current) return;
    const path = solid.current;
    const total = path.getTotalLength();
    const lut: { l: number; y: number }[] = [];
    for (let i = 0; i <= 900; i++) {
      const l = (total * i) / 900;
      lut.push({ l, y: path.getPointAtLength(l).y });
    }
    const lengthAtY = (y: number) => {
      if (y <= lut[0].y) return 0;
      if (y >= lut[lut.length - 1].y) return total;
      let lo = 0, hi = lut.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (lut[m].y < y) lo = m; else hi = m; }
      const a = lut[lo], b = lut[hi];
      return a.l + ((y - a.y) / (b.y - a.y || 1)) * (b.l - a.l);
    };

    path.style.strokeDasharray = `${total} ${total}`;
    const scale = geo.narrow ? 0.72 : 1;
    let cur = lengthAtY(window.scrollY + window.innerHeight * ANCHOR);
    let phase = 0, swing = 0, raf = 0, lastArr = false;

    const frame = (time: number) => {
      const target = lengthAtY(window.scrollY + window.innerHeight * ANCHOR);
      const prev = cur;
      cur += (target - cur) * 0.12;
      const v = cur - prev;
      path.style.strokeDashoffset = String(total - cur);
      const p = path.getPointAtLength(cur);
      phase += Math.abs(v) * 0.09;
      swing += (Math.max(-16, Math.min(16, -v * 1.4)) - swing) * 0.1;
      const t = time / 1000;
      const moving = Math.min(1, Math.abs(v) / 2.5);
      setLeg(Math.sin(phase) * 30 * moving + Math.sin(t * 2.2) * 6 * (1 - moving));
      her.current?.setAttribute(
        "transform",
        `translate(${p.x} ${p.y}) rotate(${swing + Math.sin(t * 1.6) * 3}) scale(${scale}) translate(${-MANO.x} ${-MANO.y})`,
      );
      const arr = cur > total - 4;
      if (arr !== lastArr) { lastArr = arr; setArrived(arr); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [geo]);

  // él entra caminando de izquierda a derecha cuando aparece el final
  useLayoutEffect(() => {
    if (!geo || !himWalk.current) return;
    const g = himWalk.current;
    const dist = geo.W * 0.4;
    const walk = { x: -dist };
    const st = ScrollTrigger.create({
      trigger: "#final",
      start: "top 75%",
      once: true,
      onEnter: () => {
        gsap.to(walk, {
          x: 0,
          duration: 2.6,
          ease: "power1.inOut",
          onUpdate: () => {
            g.setAttribute("transform", `translate(${walk.x} 0)`);
            setHimLeg(Math.sin(walk.x * 0.09) * 26);
          },
          onComplete: () => setHimLeg(0),
        });
      },
    });
    g.setAttribute("transform", `translate(${walk.x} 0)`);
    return () => st.kill();
  }, [geo]);

  if (!geo) return null;
  const scale = geo.narrow ? 0.72 : 1;
  // la mano de él (espejado) queda justo en el final del hilo
  const himT = `translate(${geo.end.x} ${geo.end.y}) scale(${scale}) translate(${MANO.x} ${-MANO.y})`;

  return (
    <>
      {/* el hilo, detrás del contenido */}
      <svg className="pointer-events-none absolute left-0 top-0 z-[1]" width={geo.W} height={geo.H} aria-hidden>
        <path d={geo.d} fill="none" stroke={RED} strokeOpacity={0.22} strokeWidth={2} strokeDasharray="2 9" strokeLinecap="round" />
        <path ref={solid} d={geo.d} fill="none" stroke={RED} strokeWidth={geo.narrow ? 2.5 : 3} strokeLinecap="round" />
      </svg>

      {/* ellos dos, por delante */}
      <svg className="pointer-events-none absolute left-0 top-0 z-30" width={geo.W} height={geo.H} aria-hidden>
        <g transform={himT}>
          <g ref={himWalk}>
            <g className={arrived ? "hop" : undefined} style={{ animationDelay: ".12s" }}>
              <Chibi look={el} hair="short" flip leg={himLeg} wave={arrived ? -40 : 0} blink={blink} />
            </g>
          </g>
        </g>
        <g ref={her}>
          <g className={arrived ? "hop" : undefined}>
            <Chibi look={ella} hair="long" leg={leg} blink={blink} wave={arrived ? -40 : 0} />
          </g>
        </g>
        {arrived && (
          <g transform={`translate(${geo.end.x} ${geo.end.y - 70 * scale})`}>
            <path className="pop-heart" d="M0 22 C-18 10 -24 -2 -15 -10 C-9 -15 -3 -12 0 -6 C3 -12 9 -15 15 -10 C24 -2 18 10 0 22 Z" fill={RED} />
          </g>
        )}
      </svg>
    </>
  );
}
