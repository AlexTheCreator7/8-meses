import { useMemo } from "react";
import { seeded } from "../lib/seeded";

/*
 * Decorados animados para el fondo de las secciones.
 * Van dentro de una sección con "relative isolate" y se quedan detrás del contenido.
 * Todo lo que se desplaza lo hace de izquierda a derecha.
 */

const capa = "pointer-events-none absolute inset-0 -z-10 overflow-hidden";

const HEART = "M0 10 C-14 0 -18 -8 -11 -14 C-6 -18 -1 -15 0 -10 C1 -15 6 -18 11 -14 C18 -8 14 0 0 10 Z";

/** pájaros que cruzan el cielo hacia la derecha, aleteando */
export function Pajaros({ y = 120, n = 3, color = "#3b2a20", dur = 22, w = 1600 }: { y?: number; n?: number; color?: string; dur?: number; w?: number }) {
  return (
    <g fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <animateMotion dur={`${dur + i * 3}s`} repeatCount="indefinite" begin={`${-i * 2.2}s`} path={`M-60 ${y + i * 26} C ${w * 0.3} ${y - 30 + i * 18} ${w * 0.6} ${y + 40 + i * 10} ${w + 60} ${y + i * 20}`} />
          <path d="M-10 0 Q-5 -7 0 0 Q5 -7 10 0">
            <animate attributeName="d" values="M-10 0 Q-5 -7 0 0 Q5 -7 10 0;M-10 -4 Q-5 2 0 0 Q5 2 10 -4;M-10 0 Q-5 -7 0 0 Q5 -7 10 0" dur="0.5s" repeatCount="indefinite" />
          </path>
        </g>
      ))}
    </g>
  );
}

/** tendedero con corazones, cartitas y fotitos que se mecen (contador) */
export function Tendedero() {
  const items = useMemo(() => {
    const r = seeded(31);
    return Array.from({ length: 14 }, (_, i) => {
      const t = (i + 0.5) / 14;
      const x = t * 1440;
      const y = 60 + 4 * 80 * t * (1 - t); // cuerda que cuelga
      return { x, y, k: i % 3, d: r(0, 3), c: ["#e6a3a6", "#b3263a", "#a9c4e8", "#f2cf5b"][i % 4] };
    });
  }, []);
  return (
    <div className={capa}>
      <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMin slice" className="absolute inset-x-0 top-0 h-[320px] w-full">
        <path d="M-10 58 Q720 222 1450 58" fill="none" stroke="#a88b6a" strokeWidth={2.5} />
        {items.map((it, i) => (
          <g key={i} transform={`translate(${it.x} ${it.y})`}>
            <g className="swing" style={{ animationDelay: `${-it.d}s` }}>
              <rect x={-3} y={-6} width={6} height={12} rx={1.5} fill="#c9a27e" />
              {it.k === 0 && <path d={HEART} transform="translate(0 24) scale(1.3)" fill={it.c} />}
              {it.k === 1 && (
                <g transform="translate(0 30)">
                  <rect x={-22} y={-16} width={44} height={50} fill="#fbf6ec" stroke="#d8c7ac" strokeWidth={2} />
                  <rect x={-17} y={-11} width={34} height={30} fill={it.c} opacity={0.55} />
                  <path d={HEART} transform="translate(0 4) scale(0.7)" fill="#fbf6ec" />
                </g>
              )}
              {it.k === 2 && (
                <g transform="translate(0 26)">
                  <rect x={-20} y={-12} width={40} height={28} rx={3} fill="#fbf6ec" stroke="#d8c7ac" strokeWidth={2} />
                  <path d="M-20 -12 L0 4 L20 -12" fill="none" stroke="#d8c7ac" strokeWidth={2} />
                  <path d={HEART} transform="translate(0 6) scale(0.45)" fill="#b3263a" />
                </g>
              )}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** garabatos de lápiz que se dibujan solos, de izquierda a derecha (sección de Tore) */
export function Garabatos() {
  const doodles = useMemo(() => {
    const r = seeded(77);
    const shapes = [
      "M-14 0 L-4 -4 L0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 Z", // estrella
      HEART,
      "M-16 0 C-16 -10 0 -10 0 0 C0 8 12 8 12 0 C12 -6 4 -6 4 0", // espiral
      "M-18 4 Q-9 -10 0 4 T18 4", // ola
      "M-8 6 a4 4 0 1 1 0.1 0 M-12 -4 a2.6 2.6 0 1 1 0.1 0 M-4 -8 a2.6 2.6 0 1 1 0.1 0 M4 -8 a2.6 2.6 0 1 1 0.1 0 M10 -4 a2.6 2.6 0 1 1 0.1 0", // huellita
    ];
    return Array.from({ length: 22 }, (_, i) => ({ x: r(2, 98), y: r(4, 96), s: r(1.2, 2.4), rot: r(-25, 25), d: shapes[i % shapes.length], delay: r(0, 6) }));
  }, []);
  return (
    <div className={capa}>
      {doodles.map((g, i) => (
        <svg key={i} className="absolute h-16 w-16" style={{ left: `${g.x}%`, top: `${g.y}%`, transform: `rotate(${g.rot}deg)` }} viewBox="-24 -24 48 48">
          <path d={g.d} pathLength={1} className="garabato" style={{ animationDelay: `${g.delay}s` }} fill="none" stroke="#8a6a52" strokeWidth={2 / g.s + 0.6} strokeLinecap="round" strokeLinejoin="round" transform={`scale(${g.s / 1.6})`} />
        </svg>
      ))}
    </div>
  );
}

/** cafetería: lamparitas que se mecen, guirnalda de luces y una ventana con lluvia */
export function Cafeteria() {
  const lights = Array.from({ length: 18 }, (_, i) => i);
  const drops = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 26 }, () => ({ x: r(0, 220), d: r(0, 1.4), l: r(10, 22) }));
  }, []);
  return (
    <div className={capa}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" className="h-full w-full">
        {/* guirnalda de luces */}
        <path d="M-10 40 Q360 120 720 50 T1450 60" fill="none" stroke="#6b4a36" strokeWidth={2} />
        {lights.map((i) => {
          const t = i / 17;
          const x = t * 1440;
          const y = 40 + Math.sin(t * Math.PI * 2) * -30 + 40 * Math.sin(t * Math.PI);
          return <circle key={i} cx={x} cy={y + 10} r={6} fill={i % 3 === 0 ? "#f6d58a" : i % 3 === 1 ? "#f2a7ad" : "#fff1cf"} className="twinkle" style={{ animationDelay: `${(i % 5) * 0.4}s` }} />;
        })}
        {/* lamparitas colgantes */}
        {[260, 1180].map((x, i) => (
          <g key={x} transform={`translate(${x} 0)`}>
            <g className="swing" style={{ animationDuration: `${5 + i}s` }}>
              <path d="M0 0 V150" stroke="#6b4a36" strokeWidth={2} />
              <circle cx={0} cy={200} r={70} fill="#f6d58a" opacity={0.06} />
              <circle cx={0} cy={200} r={44} fill="#f6d58a" opacity={0.08} />
              <path d="M-34 186 Q-30 150 0 150 Q30 150 34 186 Z" fill="#c98a3a" />
              <circle cx={0} cy={190} r={9} fill="#fff1cf" />
            </g>
          </g>
        ))}
        {/* ventana con lluvia (cae inclinada hacia la derecha) */}
        <g transform="translate(600 440)" className="max-md:hidden">
          <rect x={0} y={0} width={240} height={300} rx={8} fill="#2a1d16" />
          <rect x={10} y={10} width={220} height={280} rx={4} fill="#33415f" />
          <g stroke="#a9c4e8" strokeWidth={2} strokeLinecap="round" opacity={0.7}>
            {drops.map((d, i) => (
              <line key={i} x1={10 + d.x} y1={10} x2={10 + d.x + d.l * 0.3} y2={10 + d.l} className="lluvia" style={{ animationDelay: `${-d.d}s` }} />
            ))}
          </g>
          <path d="M120 10 V290 M10 150 H230" stroke="#2a1d16" strokeWidth={8} />
          <rect x={-10} y={290} width={260} height={14} rx={4} fill="#3e2c22" />
          <g transform="translate(60 286)">
            <path d="M-14 0 H14 L10 -24 H-10 Z" fill="#c98a3a" />
            <path d="M0 -24 C-10 -40 -16 -50 -8 -58 M0 -24 C6 -44 16 -48 14 -60 M0 -24 C2 -40 0 -52 2 -64" stroke="#7f9a6d" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/** guirnalda y globos de corazón flotando (final) */
export function Fiesta() {
  return (
    <div className={capa}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" className="h-full w-full">
        <path d="M-10 30 Q240 110 480 40 T960 40 T1450 40" fill="none" stroke="#a88b6a" strokeWidth={2} />
        {Array.from({ length: 24 }, (_, i) => {
          const x = (i / 23) * 1440;
          const y = 34 + Math.abs(Math.sin((i / 23) * Math.PI * 3)) * 50;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <g className="swing" style={{ animationDelay: `${-(i % 6) * 0.5}s` }}>
                <path d="M-12 0 H12 L0 24 Z" fill={["#e6a3a6", "#a9c4e8", "#f2cf5b", "#fbf6ec"][i % 4]} />
              </g>
            </g>
          );
        })}
        {[{ x: 1240, y: 260, c: "#b3263a" }, { x: 1320, y: 330, c: "#e6a3a6" }, { x: 1170, y: 360, c: "#d97d86" }, { x: 120, y: 420, c: "#e6a3a6" }].map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y})`}>
            <g className="flota" style={{ animationDelay: `${-i * 0.8}s` }}>
              <path d="M0 40 Q-6 90 4 150" stroke="#a88b6a" strokeWidth={1.6} fill="none" />
              <path d={HEART} transform="translate(0 0) scale(3.4)" fill={b.c} />
              <ellipse cx={-14} cy={-22} rx={6} ry={10} fill="#fff" opacity={0.35} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** pequeños bichitos del campo: mariquita caminando, abejitas y ráfagas de viento */
export function VidaCampo() {
  return (
    <g>
      <g>
        <animateMotion dur="26s" repeatCount="indefinite" path="M-40 960 C200 930 400 990 860 940" rotate="auto" />
        <ellipse cx={0} cy={0} rx={11} ry={9} fill="#c9455a" stroke="#3b2a20" strokeWidth={2} />
        <path d="M0 -9 V9" stroke="#3b2a20" strokeWidth={1.6} />
        <circle cx={-4} cy={-3} r={1.8} fill="#3b2a20" /><circle cx={4} cy={3} r={1.8} fill="#3b2a20" />
        <circle cx={11} cy={0} r={4.5} fill="#3b2a20" />
      </g>
      {[0, 1].map((i) => (
        <g key={i}>
          <animateMotion dur={`${12 + i * 5}s`} repeatCount="indefinite" begin={`${-i * 4}s`} path={`M-40 ${180 + i * 380} C 150 ${120 + i * 380} 260 ${260 + i * 380} 420 ${190 + i * 380} S 700 ${130 + i * 380} 860 ${200 + i * 380}`} />
          <ellipse cx={0} cy={0} rx={8} ry={6} fill="#f2cf5b" stroke="#3b2a20" strokeWidth={1.8} />
          <path d="M-2 -6 V6 M3 -6 V6" stroke="#3b2a20" strokeWidth={1.6} />
          <ellipse cx={-2} cy={-9} rx={5} ry={4} fill="#fff" opacity={0.85}>
            <animate attributeName="ry" values="4;1;4" dur="0.15s" repeatCount="indefinite" />
          </ellipse>
        </g>
      ))}
      <g stroke="#f8f3ea" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.55}>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(0 ${260 + i * 260})`}>
            <path d="M0 0 q40 -16 80 0 t80 0" className="viento" style={{ animationDelay: `${i * 2.3}s` }} />
          </g>
        ))}
      </g>
    </g>
  );
}
