import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "../lib/motion";
import { HIDDEN, SHOWN } from "../lib/ltr";
import { seeded } from "../lib/seeded";
import { content } from "../content";
import Tore from "./Tore";
import { Butterfly, Cloud, Flower } from "./Escenas";
import { Wobble, useWobbleId } from "./Wobble";
import { Pajaros } from "./Decor";

const FLOWER = ["#fbf6ec", "#f2cf5b", "#8fa9d6", "#e6a3a6"];

/* Portada: un paisaje dibujado donde Tore llega corriendo y se sienta. Si lo tocas, ladra. */
export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const dog = useRef<SVGGElement>(null);
  const wob = useWobbleId();
  const [pose, setPose] = useState<"walk" | "sit">("walk");
  const [bark, setBark] = useState(0);
  const [barking, setBarking] = useState(false);
  const barkTimer = useRef(0);

  const { flowers, tufts } = useMemo(() => {
    const r = seeded(3);
    const flowers = Array.from({ length: 60 }, () => ({ x: r(10, 1590), y: r(700, 790), s: r(6, 10), c: FLOWER[Math.floor(r(0, 4))], delay: r(0, 4) }));
    const tufts = Array.from({ length: 160 }, () => {
      const x = r(0, 1600), y = r(680, 800), h = r(8, 16);
      return `M${x} ${y} q2 ${-h / 2} 4 ${-h} M${x + 5} ${y} q1 ${-h / 2} 3 ${-h * 0.8}`;
    });
    return { flowers, tufts };
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(".hero-name", { clipPath: HIDDEN }, { clipPath: SHOWN, duration: 2.2, ease: "power2.inOut" })
        .from(".hero-line", { x: -48, opacity: 0, duration: 1.2, stagger: 0.12, ease: "expo.out" }, 0.3)
        .fromTo(".hero-scene", { clipPath: HIDDEN }, { clipPath: SHOWN, duration: 1.8, ease: "expo.inOut" }, 0)
        // Tore entra corriendo desde la izquierda y se sienta
        .fromTo(dog.current, { x: -1300 }, { x: 0, duration: 2.6, ease: "power2.out", onComplete: () => setPose("sit") }, 0.6);

      gsap.to(".hero-name", {
        xPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  const ladrar = () => {
    if (pose !== "sit") return;
    setBark((b) => b + 1);
    setBarking(true);
    clearTimeout(barkTimer.current);
    barkTimer.current = window.setTimeout(() => setBarking(false), 1700);
  };

  return (
    <section id="inicio" ref={root} data-ambient="petalos,destellos" className="relative flex h-[100svh] min-h-[640px] flex-col justify-end overflow-hidden px-4 pb-6 md:px-8 md:pb-10">
      <div className="hero-scene absolute inset-x-0 top-0 h-[62%] md:h-full">
        <svg viewBox="0 0 1600 800" preserveAspectRatio="xMaxYMax slice" className="h-full w-full">
          <defs><Wobble id={wob} /></defs>
          {/* sol con rayos que giran */}
          <g transform="translate(1360 230)">
            <g className="spin-slow">
              {Array.from({ length: 12 }, (_, i) => (
                <path key={i} d="M0 -96 V-118" stroke="#e8c77a" strokeWidth={5} strokeLinecap="round" transform={`rotate(${i * 30})`} />
              ))}
            </g>
            <circle r={72} fill="#f6dfb8" />
          </g>
          <g className="drift" style={{ animationDuration: "46s" }}>
            <Cloud x={420} y={150} s={1.1} fill="#fbf6ec" />
            <Cloud x={1000} y={330} s={0.8} fill="#fbf6ec" />
          </g>
          <g className="drift" style={{ animationDuration: "30s" }}>
            <Cloud x={1520} y={110} s={0.7} fill="#f8f0e2" />
            <Cloud x={760} y={90} s={0.6} fill="#f8f0e2" />
          </g>
          <Pajaros y={170} n={3} dur={26} />
          {/* colinas */}
          <path d="M0 600 Q300 540 620 580 T1180 520 T1600 500 V800 H0Z" fill="#e2d5b9" />
          <path d="M0 660 Q340 610 700 640 T1260 596 T1600 580 V800 H0Z" fill="#cdd3ad" />
          <path d="M0 720 Q380 680 760 704 T1320 660 T1600 650 V800 H0Z" fill="#bcc697" />
          <g stroke="#9fae79" strokeWidth={2.2} strokeLinecap="round" fill="none">
            {tufts.map((d, i) => <path key={i} d={d} />)}
          </g>
          {/* un arbolito que se mece en la colina */}
          <g transform="translate(640 650)">
            <rect x={-7} y={-10} width={14} height={60} rx={4} fill="#8a6142" />
            <g className="sway" style={{ animationDuration: "6s" }}>
              <circle cx={0} cy={-46} r={46} fill="#9fae79" />
              <circle cx={-30} cy={-24} r={30} fill="#aebb86" />
              <circle cx={30} cy={-22} r={32} fill="#93a36c" />
              <circle cx={-12} cy={-58} r={6} fill="#e6a3a6" /><circle cx={18} cy={-40} r={6} fill="#e6a3a6" /><circle cx={-26} cy={-30} r={5} fill="#fbf6ec" />
            </g>
          </g>
          {flowers.map((f, i) => <Flower key={i} {...f} />)}
          <Butterfly path="M-40 420 C400 360 700 480 1000 400 S1400 330 1640 380" dur={14} color="#e6a3a6" begin={1} />
          <Butterfly path="M-40 560 C300 500 700 600 1000 520 S1400 460 1640 500" dur={19} color="#f2cf5b" begin={7} />

          {/* Tore */}
          <g ref={dog} style={{ cursor: "pointer" }} onClick={ladrar} data-cursor="Tócalo">
            <g transform="translate(1390 630) scale(1.25)" filter={`url(#${wob})`}>
              <Tore pose={pose} paw={barking} eyes={barking ? "happy" : "open"} mouth={barking ? "open" : "tongue"} wag={barking ? "fast" : "slow"} />
            </g>
            {barking && (
              <g key={bark} transform="translate(1250 360)">
                <g className="bark-pop">
                  <path d="M0 0 h150 a18 18 0 0 1 18 18 v40 a18 18 0 0 1 -18 18 h-110 l-26 22 l4 -22 h-18 a18 18 0 0 1 -18 -18 v-40 a18 18 0 0 1 18 -18z" fill="#fbf6ec" stroke="#3b2a20" strokeWidth={4} />
                  <text x={75} y={50} textAnchor="middle" fontFamily="Cormorant Garamond" fontSize={38} fontStyle="italic" fill="#3b2a20">
                    ¡Guau!
                  </text>
                </g>
                {[0, 1, 2].map((i) => (
                  <path
                    key={i}
                    className="zz"
                    style={{ animationDelay: `${i * 0.35}s`, animationIterationCount: 1 }}
                    transform={`translate(${-30 + i * 26} ${120})`}
                    d="M0 10 C-14 0 -18 -8 -11 -14 C-6 -18 -1 -15 0 -10 C1 -15 6 -18 11 -14 C18 -8 14 0 0 10 Z"
                    fill="#b3263a"
                  />
                ))}
              </g>
            )}
          </g>
        </svg>
      </div>

      <div className="pointer-events-none relative">
        <p className="hero-line max-w-[28ch] text-body">{content.hero.linea}</p>
        <h1 className="hero-name script-pad -ml-2 font-script text-mega text-ink">{content.hero.titulo}</h1>
        <p className="hero-line">
          <span className="pista-nudge inline-flex items-center gap-3 rounded-full bg-accent px-5 py-3 text-body font-semibold text-paper">
            <svg viewBox="-14 -14 28 28" className="h-6 w-6" aria-hidden>
              <ellipse cx={0} cy={4} rx={6.5} ry={5.5} fill="currentColor" />
              <circle cx={-7} cy={-4} r={3} fill="currentColor" />
              <circle cx={-2.5} cy={-8.5} r={3} fill="currentColor" />
              <circle cx={2.5} cy={-8.5} r={3} fill="currentColor" />
              <circle cx={7} cy={-4} r={3} fill="currentColor" />
            </svg>
            {content.hero.pista}
            <span aria-hidden>→</span>
          </span>
        </p>
      </div>
    </section>
  );
}
