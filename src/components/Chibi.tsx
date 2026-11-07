/*
 * Los muñequitos de ella y de él, dibujados a partir de su foto.
 * Ella: cabello largo ondulado con raya al costado, blusa celeste con lacito
 * y mangas abullonadas, jean ancho, zapatillas blancas y su tatuajito en el brazo.
 * Él: rulos oscuros, polera blanca, pantalón oscuro.
 * Coordenadas locales con los pies en (0,0). La mano que sostiene el hilo rojo queda en MANO.
 */

export const MANO = { x: 24, y: -112 };

export type Look = { pelo: string; piel: string; ropa: string; piernas: string; detalle: string };

type Props = {
  look: Look;
  hair: "long" | "short";
  /** ángulo de las piernas en grados (0 = quietas) */
  leg?: number;
  /** espejado para mirar a la izquierda */
  flip?: boolean;
  /** brazo libre saludando */
  wave?: number;
  blink?: boolean;
};

const INK = "#3b2a20";

function Zapatilla({ x }: { x: number }) {
  return (
    <g>
      <path d={`M${x - 9} -2 Q${x - 9} -9 ${x - 2} -9 L${x + 4} -9 Q${x + 11} -7 ${x + 11} -2 Z`} fill="#ffffff" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d={`M${x - 9} -2 H${x + 11}`} stroke="#c9c2b4" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

// rulos (pocos y sueltos): una base de pelo y unos cuantos risos encima
const RULOS = Array.from({ length: 8 }, (_, i) => {
  const a = Math.PI * (1.0 + (i / 7) * 1.0);
  return { x: Math.cos(a) * 26, y: -100 + Math.sin(a) * 24, r: 8 + (i % 2) };
});
const RULOS_FRENTE = [
  { x: -12, y: -119, r: 7.5 }, { x: 4, y: -121, r: 8 }, { x: 17, y: -115, r: 7 },
];

function Ojos({ blink, her }: { blink: boolean; her: boolean }) {
  if (blink) return <path d="M-8 -92 q4 3 8 0 M8 -92 q4 3 8 0" stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />;
  return (
    <>
      <ellipse cx={-4} cy={-93} rx={her ? 3.4 : 2.9} ry={her ? 4.4 : 3.6} fill="#24160f" />
      <ellipse cx={12} cy={-93} rx={her ? 3.4 : 2.9} ry={her ? 4.4 : 3.6} fill="#24160f" />
      <circle cx={-3} cy={-94.5} r={1.2} fill="#fff" />
      <circle cx={13} cy={-94.5} r={1.2} fill="#fff" />
      {her && <path d="M-8 -96 l-2 -2 M16 -96 l2 -2" stroke="#24160f" strokeWidth={1.4} strokeLinecap="round" />}
    </>
  );
}

export default function Chibi({ look, hair, leg = 0, flip = false, wave = 0, blink = false }: Props) {
  const her = hair === "long";
  return (
    <g transform={flip ? "scale(-1 1)" : undefined}>
      {/* cabello largo y ondulado por detrás */}
      {her && (
        <path
          d="M-30 -104 C-38 -84 -30 -76 -36 -62 C-40 -52 -30 -46 -32 -38 C-20 -34 -10 -40 0 -38 C10 -40 22 -34 32 -38 C30 -46 40 -52 36 -62 C30 -76 38 -84 30 -104 Z"
          fill={look.pelo}
        />
      )}

      {/* piernas */}
      <g transform={`rotate(${leg} -7 -28)`}>
        {her ? (
          <>
            <path d="M-12 -31 L-3 -31 L-1 -6 L-17 -6 Z" fill={look.piernas} />
            <path d="M-7.5 -27 L-8.5 -9" stroke="#7d9bc8" strokeWidth={1.3} strokeDasharray="2 2" />
            <Zapatilla x={-8} />
          </>
        ) : (
          <>
            <rect x={-11} y={-30} width={9} height={27} rx={4} fill={look.piernas} />
            <path d="M-14 -2 Q-14 -8 -7 -8 H-2 Q3 -7 3 -2 Z" fill="#2b1d16" />
          </>
        )}
      </g>
      <g transform={`rotate(${-leg} 6 -28)`}>
        {her ? (
          <>
            <path d="M3 -31 L12 -31 L16 -6 L0 -6 Z" fill={look.piernas} />
            <path d="M7.5 -27 L8.5 -9" stroke="#7d9bc8" strokeWidth={1.3} strokeDasharray="2 2" />
            <Zapatilla x={9} />
          </>
        ) : (
          <>
            <rect x={2} y={-30} width={9} height={27} rx={4} fill={look.piernas} />
            <path d="M-1 -2 Q-1 -8 6 -8 H11 Q16 -7 16 -2 Z" fill="#2b1d16" />
          </>
        )}
      </g>

      {/* cuerpo */}
      {her ? (
        <>
          <rect x={-13} y={-38} width={26} height={11} rx={3} fill={look.piernas} />
          <path d="M-13 -68 H13 L18 -34 Q0 -29 -18 -34 Z" fill={look.ropa} />
          {/* lacito del cuello */}
          <path d="M-4 -67 L0 -63 L4 -67 M0 -63 L-3 -56 M0 -63 L3 -56" stroke="#7f9fcc" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <path d="M-10 -50 q10 4 20 0" stroke="#bfd3ee" strokeWidth={1.4} fill="none" />
        </>
      ) : (
        <>
          <path d="M-14 -70 Q0 -60 14 -70 L14 -64 Q0 -54 -14 -64 Z" fill={look.ropa} stroke={look.detalle} strokeWidth={1.5} />
          <rect x={-17} y={-70} width={34} height={44} rx={11} fill={look.ropa} stroke={look.detalle} strokeWidth={1.5} />
          <rect x={-10} y={-44} width={20} height={9} rx={3} fill="none" stroke={look.detalle} strokeWidth={1.5} />
          <path d="M-5 -66 V-52 M5 -66 V-52" stroke={look.detalle} strokeWidth={2.5} strokeLinecap="round" />
        </>
      )}

      {/* brazo libre (con su tatuajito: lunita, estrellita y mariposas) */}
      <g transform={`rotate(${wave} -12 -60)`}>
        {her && <circle cx={-13} cy={-62} r={7} fill={look.ropa} />}
        <path d="M-12 -60 L-21 -38" stroke={look.piel} strokeWidth={7} strokeLinecap="round" />
        <circle cx={-21} cy={-37} r={4.5} fill={look.piel} />
        {her && (
          <>
            <path d="M-17.5 -50 a1.6 1.6 0 1 0 1.2 -2.6" stroke="#2b1d16" strokeWidth={0.9} fill="none" />
            <path d="M-19.5 -45 l1 0 M-19 -45.5 l0 1" stroke="#2b1d16" strokeWidth={0.8} />
            <circle cx={-20.5} cy={-42} r={0.6} fill="#2b1d16" />
            <circle cx={-21.8} cy={-36} r={1.1} fill="#d8b24a" />
          </>
        )}
      </g>

      {/* brazo que sostiene el hilo */}
      {her ? (
        <>
          <circle cx={13} cy={-62} r={7} fill={look.ropa} />
          <path d={`M14 -62 L${MANO.x} ${MANO.y + 4}`} stroke={look.piel} strokeWidth={7} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d={`M12 -62 L${MANO.x} ${MANO.y + 4}`} stroke={look.detalle} strokeWidth={10} strokeLinecap="round" />
          <path d={`M12 -62 L${MANO.x} ${MANO.y + 4}`} stroke={look.ropa} strokeWidth={8} strokeLinecap="round" />
        </>
      )}
      <circle cx={MANO.x} cy={MANO.y} r={5} fill={look.piel} />

      {/* cabeza y rulos de él por detrás */}
      {!her && (
        <>
          <path d="M-28 -92 C-30 -120 -12 -128 0 -127 C14 -128 30 -120 28 -92 C22 -104 10 -110 0 -110 C-12 -110 -22 -104 -28 -92 Z" fill={look.pelo} />
          {RULOS.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={look.pelo} />)}
        </>
      )}
      <path d="M-6 -70 h12 v6 h-12 z" fill={look.piel} />
      <ellipse cx={0} cy={-94} rx={27} ry={28} fill={look.piel} />
      <ellipse cx={-27} cy={-92} rx={3.5} ry={5} fill={look.piel} />
      <ellipse cx={27} cy={-92} rx={3.5} ry={5} fill={look.piel} />

      {her ? (
        <>
          {/* raya al costado y mechones ondulados que caen a los lados de la cara */}
          <path d="M-30 -92 C-32 -116 -14 -128 -6 -126 C6 -128 30 -120 30 -96 C22 -112 8 -116 -4 -114 C-14 -110 -22 -104 -30 -92 Z" fill={look.pelo} />
          <path d="M-28 -100 C-34 -86 -26 -78 -32 -66 C-35 -58 -28 -52 -30 -44 L-22 -46 C-24 -56 -20 -62 -24 -72 C-27 -80 -22 -88 -24 -98 Z" fill={look.pelo} />
          <path d="M29 -100 C34 -86 27 -78 32 -66 C35 -58 28 -52 30 -44 L22 -46 C24 -56 20 -62 24 -72 C27 -80 22 -88 25 -98 Z" fill={look.pelo} />
        </>
      ) : (
        RULOS_FRENTE.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={c.r} fill={look.pelo} />
            <circle cx={c.x - c.r * 0.3} cy={c.y - c.r * 0.3} r={c.r * 0.35} fill="#3a2a20" opacity={0.6} />
          </g>
        ))
      )}

      {/* cara (mira hacia la derecha) */}
      <path d={her ? "M-9 -101 q4 -2 7 0 M8 -101 q4 -2 7 0" : "M-9 -101 q4 -2.5 8 0 M7 -101 q4 -2.5 8 0"} stroke={look.pelo} strokeWidth={her ? 1.6 : 2.6} fill="none" strokeLinecap="round" />
      <Ojos blink={blink} her={her} />
      <path d="M5 -88 q1.5 2 -1 3" stroke="#a46d4e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <ellipse cx={-11} cy={-84} rx={5} ry={2.8} fill="#e8a5a0" opacity={0.85} />
      <ellipse cx={20} cy={-84} rx={5} ry={2.8} fill="#e8a5a0" opacity={0.85} />
      {her ? (
        <path d="M0 -80 q4.5 3.5 9 0 q-4.5 1.5 -9 0 Z" fill="#c9696f" stroke="#c9696f" strokeWidth={1.2} strokeLinejoin="round" />
      ) : (
        <path d="M1 -80 q4 3 8 -0.5" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}
