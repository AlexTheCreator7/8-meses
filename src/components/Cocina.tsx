import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollTrigger } from "../lib/motion";
import { content } from "../content";
import Tore from "./Tore";
import Chibi, { MANO } from "./Chibi";

/*
 * La cocina, como programa de cocina "en vivo".
 * Alessandro, detrás del mostrador como presentador, le cuenta que cuando estén
 * juntos le va a cocinar pasta a la huancaína con lomo saltado. Mientras ella
 * baja: la pasta cae a la olla, los ingredientes vuelan a la licuadora, el lomo
 * salta en la sartén con fuego, la pasta, la salsa y el lomo vuelan al plato…
 * le falta algo, Tore salta, cae el quesito con perejil, y se van a la mesa.
 * Todo lo que vuela y la cámara avanzan de izquierda a derecha.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** punto de un arco de (x0,y0) a (x1,y1) con altura h */
const arco = (x0: number, y0: number, x1: number, y1: number, h: number, t: number) => ({
  x: lerp(x0, x1, t),
  y: lerp(y0, y1, t) - Math.sin(Math.PI * t) * h,
});

const FLOOR = 780;
const DETRAS = 628; // pies de Alessandro detrás del mostrador: solo se ve de la cintura para arriba
const S = 1.9;
const HEART = "M0 10 C-14 0 -18 -8 -11 -14 C-6 -18 -1 -15 0 -10 C1 -15 6 -18 11 -14 C18 -8 14 0 0 10 Z";
const CHISPA = "M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z";

/* ───────────── el plato ───────────── */
function Plato({ pasta, lomo, toque }: { pasta: number; lomo: number; toque: number }) {
  const piezas = [[-26, -16, -20], [-6, -24, 10], [16, -18, -8], [32, -10, 24], [-12, -8, 30]];
  return (
    <g>
      <ellipse cx={0} cy={0} rx={74} ry={20} fill="#fffdf8" stroke="#d8c7ac" strokeWidth={3} />
      <ellipse cx={0} cy={-1} rx={54} ry={13} fill="#f3eadf" />
      <g style={{ clipPath: `inset(0% ${100 - pasta * 100}% 0% 0%)` }}>
        <path d="M-56 -2 Q-48 -40 0 -44 Q48 -40 56 -2 Z" fill="#f4c34f" />
        <path d="M-44 -8 q10 -14 20 0 t20 0 t20 0 t20 0 M-36 -22 q10 -12 18 0 t18 0 t18 0 M-20 -34 q10 -8 20 0 t20 0" stroke="#e2a634" strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
      {piezas.map(([x, y, r], i) => {
        const k = clamp(lomo * piezas.length - i);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}>
            <rect x={-11} y={-5} width={22} height={10} rx={4} fill="#7a3f22" />
            <rect x={-8} y={-4} width={9} height={3} rx={1.5} fill="#9c5a34" />
            {i % 2 === 0 && <path d="M-14 8 q10 -8 22 -2" stroke="#b3436e" strokeWidth={3} fill="none" strokeLinecap="round" />}
            {i % 2 === 1 && <path d="M4 6 l10 0 l-5 -8 z" fill="#d9483b" />}
          </g>
        );
      })}
      {toque > 0 && (
        <g opacity={toque}>
          {[[-20, -40], [-4, -46], [12, -40], [26, -32], [-30, -28], [4, -34]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={3.6} fill="#4f8a3c" />
              <rect x={x + 5} y={y + 2} width={5} height={5} rx={1} fill="#fffdf2" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

/* ───────────── pared, ventana, letrero "en vivo" y focos ───────────── */
const Pared = memo(function Pared() {
  return (
    <g>
      <rect x={-900} y={-700} width={3700} height={1600} fill="#f7ead8" />
      {/* focos del set, de arriba hacia el mostrador */}
      <path d="M470 -40 L560 -40 L760 560 L300 560 Z" fill="#fff4cf" opacity={0.28} className="foco" />
      <path d="M1080 -40 L1170 -40 L1360 560 L900 560 Z" fill="#fff4cf" opacity={0.28} className="foco" style={{ animationDelay: "1.5s" }} />
      <g fill="#dfe8f3">
        {Array.from({ length: 44 }, (_, i) => (
          <rect key={i} x={340 + (i % 22) * 52} y={440 + Math.floor(i / 22) * 52} width={46} height={46} rx={4} />
        ))}
      </g>
      <g transform="translate(120 110)">
        <rect width={260} height={250} rx={10} fill="#bcd6e8" />
        <circle cx={190} cy={70} r={34} fill="#f6dfb8" />
        <path d="M0 200 Q80 160 160 190 T260 180 V250 H0Z" fill="#cdd3ad" />
        <path d="M130 0 V250 M0 125 H260" stroke="#f7ead8" strokeWidth={10} />
        <rect width={260} height={250} rx={10} fill="none" stroke="#c99a6b" strokeWidth={10} />
        <g className="swing" style={{ animationDuration: "5s" }}><path d="M-20 -10 H70 Q40 120 60 270 H-20 Z" fill="#e6a3a6" /></g>
        <g className="swing" style={{ animationDuration: "6s" }}><path d="M280 -10 H190 Q220 120 200 270 H280 Z" fill="#e6a3a6" /></g>
        <rect x={-30} y={-22} width={320} height={14} rx={7} fill="#a8784f" />
      </g>
      {/* letrero del programa */}
      <g transform="translate(830 255)">
        <rect x={-190} y={-46} width={380} height={92} rx={18} fill="#3b2a20" />
        <rect x={-180} y={-36} width={360} height={72} rx={12} fill="#4a3428" />
        <circle cx={-150} cy={0} r={11} fill="#e0303c" className="en-vivo" />
        <text x={-128} y={9} fontFamily="Cormorant Garamond" fontWeight={600} fontSize={26} fill="#fbf6ec" letterSpacing={2}>EN VIVO</text>
        <text x={20} y={10} fontFamily="Pinyon Script" fontSize={34} fill="#f6d58a">Cocinando con amor</text>
        {[-170, -110, -50, 10, 70, 130, 170].map((x, i) => (
          <circle key={x} cx={x} cy={-46} r={5} fill={i % 2 ? "#f6d58a" : "#fff1cf"} className="twinkle" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </g>
      {/* ollas colgadas y hierbas */}
      {[400, 1280].map((x, i) => (
        <g key={x} transform={`translate(${x} 200)`}>
          <g className="swing" style={{ animationDelay: `${-i * 0.7}s` }}>
            <path d="M0 0 V20" stroke="#6b4a36" strokeWidth={3} />
            {i === 0 ? (
              <g><circle cx={0} cy={50} r={28} fill="#c98a3a" /><rect x={-4} y={20} width={8} height={14} fill="#6b4a36" /></g>
            ) : (
              <path d="M0 20 C-20 40 -14 70 0 80 C14 70 20 40 0 20" fill="#7f9a6d" />
            )}
          </g>
        </g>
      ))}
      {/* repisa con frascos (de aquí cae el toque final) */}
      <rect x={1050} y={330} width={240} height={14} rx={4} fill="#a8784f" />
      <path d="M1070 344 v24 h16 M1270 344 v24 h-16" stroke="#8a6142" strokeWidth={5} fill="none" />
      <rect x={1062} y={276} width={30} height={54} rx={6} fill="#e6a3a6" opacity={0.85} />
      <rect x={1100} y={290} width={26} height={40} rx={5} fill="#a9c4e8" opacity={0.85} />
      <rect x={1220} y={282} width={34} height={48} rx={6} fill="#f2cf5b" opacity={0.85} />
      {/* comedor */}
      <rect x={2240} y={180} width={200} height={240} rx={10} fill="#bcd6e8" stroke="#c99a6b" strokeWidth={10} />
      <path d="M2340 180 V420 M2240 300 H2440" stroke="#c99a6b" strokeWidth={8} />
      {/* piso */}
      <rect x={-900} y={764} width={3700} height={136} fill="#e3c9a3" />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-900 + i * 130} 764 V900`} stroke="#d6b88f" strokeWidth={3} />)}
      <g transform="translate(2160 780)">
        <path d="M-24 0 h48 l-8 -50 h-32 z" fill="#c98a3a" />
        <path d="M0 -50 C-30 -90 -40 -130 -10 -160 M0 -50 C20 -100 40 -120 30 -170 M0 -50 C4 -100 -6 -140 6 -190" stroke="#7f9a6d" strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
});

/* ───────────── el mostrador (va delante del presentador) ───────────── */
const Mostrador = memo(function Mostrador() {
  return (
    <g>
      <rect x={330} y={560} width={1140} height={34} rx={6} fill="#c99a6b" />
      <rect x={340} y={594} width={1120} height={170} fill="#b5835a" />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <rect x={356 + i * 158} y={610} width={142} height={140} rx={8} fill="#c38f62" />
          <circle cx={356 + i * 158 + 71} cy={630} r={5} fill="#7a5233" />
        </g>
      ))}
      <rect x={470} y={548} width={330} height={14} rx={4} fill="#4a4a4f" />
      {/* bandeja de ingredientes */}
      <rect x={370} y={550} width={90} height={10} rx={4} fill="#d8b07a" />
    </g>
  );
});

export default function Cocina() {
  const c = content.cocina;
  const section = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [tick, setTick] = useState(0);
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < 768);
    window.addEventListener("resize", on);
    // pequeño reloj para los gestos del presentador y para comer
    const id = setInterval(() => setTick((t) => t + 1), 140);
    return () => { window.removeEventListener("resize", on); clearInterval(id); };
  }, []);

  useLayoutEffect(() => {
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "+=650%",
      pin: true,
      scrub: 0.6,
      onUpdate: (s) => setP(s.progress * 10),
    });
    return () => st.kill();
  }, []);

  /* ── cámara ── */
  const camX =
    p < 3 ? 680 :
    p < 3.6 ? lerp(680, 860, ease(seg(p, 3, 3.6))) :
    p < 5.2 ? 860 :
    p < 6 ? lerp(860, 1150, ease(seg(p, 5.2, 6))) :
    p < 6.5 ? 1150 : lerp(1150, 1850, ease(seg(p, 6.5, 8)));

  /* ── el presentador ── */
  const aX = p < 3.6 ? 640 : p < 4 ? lerp(640, 1080, ease(seg(p, 3.6, 4))) : p < 6.5 ? 1080 : p < 7.3 ? lerp(1080, 1540, ease(seg(p, 6.5, 7.3))) : lerp(1540, 1980, ease(seg(p, 7.3, 8)));
  const enMesa = p >= 8;
  const bajando = seg(aX, 1470, 1540); // sale de detrás del mostrador
  const aY = enMesa ? FLOOR - 40 : lerp(DETRAS, FLOOR, bajando);
  const caminaA = (p > 3.6 && p < 4) || (p > 6.5 && p < 8);
  const legA = caminaA ? Math.sin(p * 46) * 26 : 0;
  const gesto = p < 1.2 ? (tick % 6 < 3 ? -70 : -25) : p > 4.9 && p < 5.2 ? -80 : enMesa ? -40 + Math.sin(tick * 0.9) * 22 : -10 + Math.sin(tick * 0.5) * 6;
  const sinGorro = enMesa;

  /* ── la pasta cae a la olla ── */
  const nido = seg(p, 0.5, 1.1);
  const nidoP = arco(640, 400, 560, 470, 60, ease(nido));

  /* ── ingredientes a la licuadora ── */
  const ingredientes = [
    { tipo: "aji", x: 380 }, { tipo: "aji", x: 400 }, { tipo: "queso", x: 425 }, { tipo: "leche", x: 448 },
  ].map((it, i) => {
    const t = seg(p, 1.2 + i * 0.15, 1.6 + i * 0.15);
    return { ...it, t, pos: arco(it.x, 540, 930, 425, 170, ease(t)), r: t * 360 };
  });
  const salsa = seg(p, 1.6, 2.2);
  const licuando = p > 1.6 && p < 2.25;

  /* ── el lomo salta en la sartén ── */
  const salteando = p > 2.25 && p < 3.2;
  const fuego = seg(p, 2.2, 2.5) * (1 - seg(p, 3.0, 3.3));
  const brinco = salteando ? Math.abs(Math.sin(p * Math.PI * 4)) * 70 : 0;
  const giroSarten = salteando ? Math.sin(p * Math.PI * 8) * 8 : 0;

  /* ── todo vuela al plato ── */
  const vPasta = seg(p, 3.75, 4.15);
  const vSalsa = seg(p, 4.2, 4.5);
  const vLomo = seg(p, 4.5, 4.85);
  const pasta = ease(seg(p, 4.1, 4.45));
  const lomo = seg(p, 4.8, 5.1);
  const toque = seg(p, 6.05, 6.25);
  const llevando = p >= 6.5;
  const aplausos = p > 4.95 && p < 5.25;

  /* ── Tore ── */
  const tX = p < 5 ? 880 : p < 5.6 ? lerp(880, 1230, ease(seg(p, 5, 5.6))) : p < 6.5 ? 1230 : lerp(1230, 1850, ease(seg(p, 6.5, 8)));
  const salto = Math.sin(Math.PI * seg(p, 5.6, 5.9)) * 90;
  const toreCamina = (p > 5 && p < 5.6) || (p > 6.5 && p < 8);
  const toreFeliz = p > 6.05 || licuando || salteando;

  /* ── repisa y toque final ── */
  const tiembla = p > 5.7 && p < 6.1 ? Math.sin(p * 120) * 3 : 0;
  const cae = seg(p, 5.8, 6.1);
  const bowl = { x: lerp(1170, 1150, cae), y: lerp(318, 500, cae * cae), r: lerp(0, 120, cae) };

  /* ── Angie ── */
  const angX = lerp(1460, 1740, ease(seg(p, 6.8, 8)));
  const angLeg = p > 6.8 && p < 8 ? Math.sin(p * 46) * 26 : 0;

  const textos = [c.intro, c.huancaina, c.lomo, c.servir, c.tore, c.mesa, c.final];
  const paso = p < 1.2 ? 0 : p < 2.2 ? 1 : p < 3.2 ? 2 : p < 5.3 ? 3 : p < 6.5 ? 4 : p < 8.2 ? 5 : 6;

  const presentador = (
    <g transform={`translate(${aX} ${aY}) scale(${S})`}>
      <Chibi look={content.munecos.el} hair="short" flip={enMesa} leg={legA} wave={gesto} blink={tick % 28 === 0} />
      {!sinGorro && (
        <g transform="translate(0 -122)">
          <rect x={-22} y={-10} width={44} height={14} rx={4} fill="#fffdf8" stroke="#d8c7ac" strokeWidth={1.5} />
          <path d="M-24 -8 C-34 -30 -12 -40 -4 -30 C0 -46 22 -44 20 -28 C34 -34 38 -10 22 -8 Z" fill="#fffdf8" stroke="#d8c7ac" strokeWidth={1.5} />
        </g>
      )}
      {p < 3.6 && (
        <g transform={`translate(${MANO.x} ${MANO.y})`}>
          <g className="stir">
            <path d="M0 0 L18 -24" stroke="#a8784f" strokeWidth={4} strokeLinecap="round" />
            <ellipse cx={21} cy={-28} rx={6} ry={4} fill="#a8784f" />
          </g>
        </g>
      )}
      {llevando && !enMesa && (
        <g transform={`translate(${MANO.x} ${MANO.y - 8}) scale(0.55)`}>
          <Plato pasta={1} lomo={1} toque={1} />
        </g>
      )}
      {enMesa && (
        <g transform={`translate(-21 -37) rotate(${gesto})`}>
          <path d="M0 0 L-10 -18 M-12 -18 l0 -6 M-9 -19 l0 -6 M-6 -20 l0 -6" stroke="#9aa3ad" strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
    </g>
  );

  return (
    <section id="cocina" ref={section} className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#f7ead8]">
      <svg viewBox={narrow ? "0 0 720 1500" : "0 0 1300 731"} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <g transform={narrow ? `translate(${360 - camX} 600)` : `translate(${650 - camX} -169)`}>
          <Pared />

          {/* sillas del comedor */}
          {[1740, 1980].map((x) => (
            <g key={x}>
              <rect x={x - 46} y={470} width={92} height={150} rx={14} fill="#a8784f" />
              <rect x={x - 34} y={484} width={68} height={60} rx={10} fill="#c38f62" />
            </g>
          ))}

          {/* el presentador va detrás del mostrador */}
          {aX < 1470 && presentador}
          <Mostrador />

          {/* olla con agua hirviendo */}
          <g transform="translate(560 548)">
            <rect x={-56} y={-70} width={112} height={70} rx={10} fill="#9aa3ad" />
            <rect x={-70} y={-62} width={16} height={8} rx={4} fill="#6f7780" />
            <rect x={54} y={-62} width={16} height={8} rx={4} fill="#6f7780" />
            <ellipse cx={0} cy={-70} rx={56} ry={10} fill="#d9e3ec" />
            {[-30, -6, 20, 36].map((x, i) => <circle key={i} cx={x} cy={-72} r={4} fill="#fff" className="burbuja" style={{ animationDelay: `${i * 0.3}s` }} />)}
            {nido >= 1 && p < 3.75 && <path d="M-20 -72 q6 -26 0 -40 M0 -72 q-6 -30 2 -44 M18 -72 q6 -24 -2 -38" stroke="#f4d77a" strokeWidth={4} fill="none" strokeLinecap="round" />}
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M${-24 + i * 24} -90 c-10 -16 10 -24 0 -42`} stroke="#fffaf2" strokeWidth={5} fill="none" strokeLinecap="round" className="vapor" style={{ animationDelay: `${i * 0.6}s` }} />
            ))}
          </g>
          {/* nido de pasta cayendo a la olla */}
          {nido > 0 && nido < 1 && (
            <g transform={`translate(${nidoP.x} ${nidoP.y}) rotate(${nido * 200})`}>
              <ellipse rx={18} ry={10} fill="#f4d77a" stroke="#e2a634" strokeWidth={2} />
              <path d="M-12 0 q6 -6 12 0 t12 0" stroke="#e2a634" strokeWidth={2} fill="none" />
            </g>
          )}

          {/* sartén con el lomo saltando y el fuego */}
          <g transform={`translate(720 548) rotate(${giroSarten})`}>
            <g className="flama" opacity={0.85}>
              {[-30, -12, 6, 24].map((x, i) => <path key={i} d={`M${x} 0 q8 -14 0 -26 q14 10 8 26 z`} fill={i % 2 ? "#f2a33a" : "#f2cf5b"} />)}
            </g>
            <g transform={`translate(0 -10) scale(${1 + fuego * 2.4})`} opacity={fuego}>
              <path d="M-36 0 C-40 -50 -10 -60 -14 -90 C10 -60 4 -40 14 -70 C34 -40 40 -20 36 0 Z" fill="#f2a33a" className="flama" />
              <path d="M-20 0 C-22 -30 0 -40 -4 -60 C12 -40 22 -24 20 0 Z" fill="#f2cf5b" className="flama" />
            </g>
            <ellipse cx={0} cy={-8} rx={56} ry={12} fill="#3b3b40" />
            <rect x={52} y={-12} width={80} height={10} rx={5} fill="#3b3b40" />
            {p < 4.5 &&
              [-24, -6, 12, 28].map((x, i) => (
                <g key={i} transform={`translate(${x} ${-18 - brinco * (0.6 + (i % 2) * 0.4)}) rotate(${brinco * (i % 2 ? 3 : -3)})`}>
                  <rect x={-8} y={0} width={16} height={8} rx={3} fill="#7a3f22" />
                  {i % 2 === 0 && <path d="M-8 10 q8 -6 16 0" stroke="#b3436e" strokeWidth={2.5} fill="none" />}
                </g>
              ))}
            {fuego > 0.4 && [0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={-30 + i * 15} cy={-60 - (tick * 7 + i * 13) % 60} r={2.5} fill="#f6d58a" opacity={0.9} />
            ))}
          </g>

          {/* ingredientes en la bandeja y volando a la licuadora */}
          {ingredientes.map((it, i) =>
            it.t >= 1 ? null : (
              <g key={i} transform={`translate(${it.pos.x} ${it.pos.y}) rotate(${it.r}) scale(1.7)`}>
                {it.tipo === "aji" && <path d="M-4 -14 q12 4 8 26 q-4 6 -8 -2 q-6 -12 0 -24z" fill="#f2b01e" stroke="#c98a1c" strokeWidth={1.5} />}
                {it.tipo === "queso" && <rect x={-12} y={-9} width={24} height={18} rx={3} fill="#fffaf0" stroke="#e8dcc0" strokeWidth={2} />}
                {it.tipo === "leche" && (
                  <g>
                    <path d="M-10 -16 h20 v30 h-20 z" fill="#fbfbff" stroke="#a9c4e8" strokeWidth={2} />
                    <path d="M-10 -16 l10 -8 l10 8" fill="#a9c4e8" />
                  </g>
                )}
              </g>
            ),
          )}

          {/* licuadora con la huancaína */}
          <g transform="translate(930 560)" className={licuando ? "licuando" : undefined}>
            <rect x={-34} y={-30} width={68} height={30} rx={8} fill="#6b4a36" />
            <circle cx={0} cy={-15} r={6} fill={licuando ? "#e0303c" : "#f2cf5b"} />
            <path d="M-26 -30 L-32 -130 H32 L26 -30 Z" fill="#e8f1f7" opacity={0.85} stroke="#b9c8d4" strokeWidth={3} />
            <path d={`M-26 -30 L${-26 - 6 * salsa} ${-30 - 90 * salsa} H${26 + 6 * salsa} L26 -30 Z`} fill="#f4c34f" />
            {licuando && <path d="M-14 -40 L14 -34 M-14 -34 L14 -40" stroke="#6b4a36" strokeWidth={3} className="licua" />}
            <rect x={-30} y={-142} width={60} height={12} rx={5} fill="#6b4a36" />
          </g>

          {/* pasta, salsa y lomo volando al plato */}
          {vPasta > 0 && vPasta < 1 && (() => {
            const q = arco(560, 470, 1150, 520, 220, ease(vPasta));
            return (
              <g transform={`translate(${q.x} ${q.y}) rotate(${vPasta * 300})`}>
                <ellipse rx={22} ry={12} fill="#f4d77a" stroke="#e2a634" strokeWidth={2} />
                <path d="M-14 0 q7 -7 14 0 t14 0" stroke="#e2a634" strokeWidth={2} fill="none" />
              </g>
            );
          })()}
          {vSalsa > 0 && vSalsa < 1 && (() => {
            const q = arco(930, 420, 1150, 515, 160, ease(vSalsa));
            return <ellipse cx={q.x} cy={q.y} rx={16} ry={11} fill="#f4c34f" stroke="#e2a634" strokeWidth={2} />;
          })()}
          {vLomo > 0 && vLomo < 1 &&
            [0, 1, 2].map((i) => {
              const q = arco(720 + i * 12, 520, 1135 + i * 14, 520, 200 + i * 20, ease(clamp(vLomo * 1.2 - i * 0.1)));
              return <rect key={i} x={q.x - 9} y={q.y - 4} width={18} height={8} rx={3} fill="#7a3f22" transform={`rotate(${vLomo * 400} ${q.x} ${q.y})`} />;
            })}

          {/* el plato en el mostrador */}
          {!llevando && (
            <g transform="translate(1150 548)">
              <Plato pasta={pasta} lomo={lomo} toque={toque} />
              {(aplausos || (toque > 0.9 && p < 6.5)) &&
                [[-70, -60], [60, -70], [0, -96], [-30, -110], [40, -120]].map(([x, y], i) => (
                  <path key={i} d={CHISPA} fill="#f2cf5b" transform={`translate(${x} ${y}) scale(${1 + (i % 2) * 0.4})`} className="twinkle" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
            </g>
          )}

          {/* el cuenquito con quesito y perejil */}
          {cae < 1 && (
            <g transform={`translate(${bowl.x} ${bowl.y}) rotate(${bowl.r + tiembla})`}>
              <path d="M-22 0 Q-20 18 0 18 Q20 18 22 0 Z" fill="#fffdf8" stroke="#d8c7ac" strokeWidth={3} />
              <circle cx={-8} cy={-4} r={6} fill="#4f8a3c" /><circle cx={6} cy={-6} r={6} fill="#5f9a48" />
              <rect x={-2} y={-8} width={7} height={7} rx={1} fill="#fffdf2" />
            </g>
          )}
          {cae > 0.8 && toque < 1 &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx={1130 + i * 8} cy={lerp(490, 520, seg(p, 6.0, 6.2)) + (i % 2) * 6} r={3} fill={i % 2 ? "#fffdf2" : "#4f8a3c"} />
            ))}

          {/* burbuja del presentador */}
          {p < 1.2 && (
            <g transform={`translate(${aX + 70} ${DETRAS - 330})`}>
              <path d="M0 0 h230 a18 18 0 0 1 18 18 v44 a18 18 0 0 1 -18 18 h-190 l-30 24 l6 -24 h-16 a18 18 0 0 1 -18 -18 v-44 a18 18 0 0 1 18 -18z" fill="#fffdf8" stroke="#3b2a20" strokeWidth={3} />
              <text x={115} y={48} textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize={30} fill="#3b2a20">{c.burbuja}</text>
            </g>
          )}

          {/* Angie llega a la mesa */}
          {p > 6.8 && (
            <g transform={`translate(${angX} ${enMesa ? FLOOR - 40 : FLOOR}) scale(${S})`}>
              <Chibi look={content.munecos.ella} hair="long" leg={angLeg} wave={enMesa ? -40 + Math.sin(tick * 0.8 + 1) * 22 : 0} blink={tick % 31 === 0} />
              {enMesa && (
                <g transform={`translate(-21 -37) rotate(${-40 + Math.sin(tick * 0.8 + 1) * 22})`}>
                  <path d="M0 0 L-10 -18 M-12 -18 l0 -6 M-9 -19 l0 -6 M-6 -20 l0 -6" stroke="#9aa3ad" strokeWidth={2} strokeLinecap="round" />
                </g>
              )}
            </g>
          )}

          {/* el presentador ya fuera del mostrador */}
          {aX >= 1470 && presentador}

          {/* mesa */}
          <g transform="translate(1860 600)">
            <rect x={-200} y={0} width={400} height={20} rx={6} fill="#fbf6ec" />
            <path d="M-200 20 H200 V150 Q180 164 160 150 Q140 164 120 150 Q100 164 80 150 Q60 164 40 150 Q20 164 0 150 Q-20 164 -40 150 Q-60 164 -80 150 Q-100 164 -120 150 Q-140 164 -160 150 Q-180 164 -200 150 Z" fill="#fbf6ec" />
            <path d="M-200 60 H200 M-200 112 H200" stroke="#e6a3a6" strokeWidth={5} />
            <g transform="translate(-110 0)">
              <rect x={-6} y={-46} width={12} height={46} rx={3} fill="#fffdf2" />
              <path d="M0 -50 q-8 -12 0 -24 q8 12 0 24z" fill="#f2a33a" className="flama" />
            </g>
            <g transform="translate(120 0)">
              <path d="M-12 0 h24 l-4 -30 h-16z" fill="#a9c4e8" />
              <circle cx={-8} cy={-40} r={7} fill="#e6a3a6" /><circle cx={8} cy={-44} r={7} fill="#f2cf5b" /><circle cx={0} cy={-52} r={7} fill="#fbf6ec" />
            </g>
            {enMesa && (
              <g transform="translate(0 -4) scale(1.05)">
                <Plato pasta={1} lomo={1} toque={1} />
              </g>
            )}
          </g>

          {/* Tore, el ayudante del programa */}
          <g transform={`translate(${tX} ${FLOOR - 84 * 0.9 - salto}) scale(0.9)`}>
            <Tore pose={toreCamina ? "walk" : "sit"} eyes={toreFeliz ? "happy" : p < 5 ? "up" : "open"} mouth={toreFeliz ? "tongue" : "smile"} wag={toreFeliz || toreCamina ? "fast" : "slow"} paw={aplausos} />
            <g transform="translate(0 -112) scale(0.9)">
              <rect x={-20} y={-6} width={40} height={12} rx={4} fill="#fffdf8" stroke="#d8c7ac" strokeWidth={2} />
              <path d="M-22 -4 C-32 -26 -10 -36 -2 -26 C2 -42 22 -40 20 -24 C32 -30 36 -6 20 -4 Z" fill="#fffdf8" stroke="#d8c7ac" strokeWidth={2} />
            </g>
          </g>

          {enMesa &&
            [0, 1, 2, 3].map((i) => (
              <path key={i} d={HEART} className="zz" style={{ animationDelay: `${i * 0.6}s` }} transform={`translate(${1800 + i * 40} 420) scale(1.4)`} fill="#b3263a" />
            ))}
        </g>
      </svg>

      <div className="pointer-events-none relative px-4 pt-24 md:px-8 md:pt-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={paso}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
            className="max-w-[92vw] md:max-w-[46vw]"
          >
            <p className="max-w-[18ch] text-[clamp(1.9rem,4vw,3.6rem)] font-medium leading-[1.05]">{textos[paso]}</p>
            {paso === 0 && <p className="mt-4 font-script text-[clamp(2.6rem,5vw,4.6rem)] leading-[1.2] text-accent">{c.plato}</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="pointer-events-none absolute bottom-6 left-4 text-small md:left-8" style={{ opacity: p < 9.5 ? 1 : 0, transition: "opacity .4s" }}>
        {c.pista} →
      </p>
    </section>
  );
}
