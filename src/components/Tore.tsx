/*
 * Tore: un shih tzu original, crema y esponjoso, con orejitas beige claro,
 * ojos grandes y brillantes, naricita negra y un moñito azul.
 * Coordenadas locales: centro de la cara cerca de (0,-44), patas en y≈84.
 */

export const C = {
  fur: "#fffaf2",
  shade: "#f1e5d3",
  tan: "#ecd9bf",
  ear: "#dcc3a1",
  earStreak: "#c3a580",
  line: "#6b4a36",
  pink: "#f2a7ad",
  bandana: "#4a6fa5", // el moñito
};

type Eyes = "open" | "closed" | "up" | "down" | "happy";
type Pose = "sit" | "lie" | "stand" | "walk";
type Mouth = "smile" | "open" | "tongue";

export type ToreProps = {
  pose?: Pose;
  eyes?: Eyes;
  mouth?: Mouth;
  wag?: "none" | "slow" | "fast";
  /** levanta la patita para saludar */
  paw?: boolean;
  /** lleva una florcita en la boca */
  flor?: boolean;
  className?: string;
  transform?: string;
};

const ln = { stroke: C.line, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** contorno esponjoso: una elipse con rizos suaves alrededor */
function fluffy(cx: number, cy: number, rx: number, ry: number, bumps = 14, amp = 0.08) {
  const pts: [number, number][] = [];
  const n = bumps * 2;
  for (let i = 0; i <= n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const k = i % 2 === 0 ? 1 : 1 + amp;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i += 2) {
    d += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`;
  }
  return d + " Z";
}

const HEAD = fluffy(0, -44, 54, 47, 20, 0.06);
const BODY_SIT = fluffy(0, 42, 40, 40, 14, 0.08);
const BODY_STAND = fluffy(0, 40, 40, 34, 14, 0.08);
const HAUNCH_L = fluffy(-35, 64, 19, 16, 8, 0.1);
const HAUNCH_R = fluffy(35, 64, 19, 16, 8, 0.1);
const PUFF = fluffy(0, -92, 18, 11, 9, 0.18);
const MUZZLE = fluffy(0, -24, 24, 16, 10, 0.1);

function Ears() {
  return (
    <>
      <g className="canelo-ear-l">
        <path d="M-40 -78 C-70 -80 -78 -36 -72 -6 C-70 4 -64 8 -60 4 C-58 10 -50 10 -48 2 C-46 -24 -40 -52 -40 -78 Z" fill={C.ear} {...ln} />
        <path d="M-62 -48 q4 14 0 30 M-54 -56 q4 14 0 34" stroke={C.earStreak} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </g>
      <g className="canelo-ear-r">
        <path d="M40 -78 C70 -80 78 -36 72 -6 C70 4 64 8 60 4 C58 10 50 10 48 2 C46 -24 40 -52 40 -78 Z" fill={C.ear} {...ln} />
        <path d="M62 -48 q-4 14 0 30 M54 -56 q-4 14 0 34" stroke={C.earStreak} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </g>
    </>
  );
}

function Face({ eyes, mouth, flor }: { eyes: Eyes; mouth: Mouth; flor: boolean }) {
  const ey = eyes === "up" ? -52 : -46;
  const py = eyes === "down" ? 3 : eyes === "up" ? -2 : 0;
  return (
    <>
      {/* sombrita tostada suave alrededor de los ojos, como en los shih tzu */}
      <ellipse cx={-21} cy={-45} rx={14} ry={12} fill={C.tan} />
      <ellipse cx={21} cy={-45} rx={14} ry={12} fill={C.tan} />
      <path d="M-12 -82 q3 7 1 12 M0 -86 q2 7 0 13 M12 -82 q-3 7 -1 12" stroke={C.shade} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d={MUZZLE} fill="#e4c6a2" />
      <path d="M-10 -12 q10 6 20 0" stroke="#cfa77c" strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={-35} cy={-25} rx={8} ry={4.5} fill={C.pink} opacity={0.75} />
      <ellipse cx={35} cy={-25} rx={8} ry={4.5} fill={C.pink} opacity={0.75} />
      {eyes === "closed" ? (
        <path d="M-29 -44 q8 7 16 0 M13 -44 q8 7 16 0" fill="none" {...ln} strokeWidth={3.6} />
      ) : eyes === "happy" ? (
        <path d="M-29 -42 q8 -9 16 0 M13 -42 q8 -9 16 0" fill="none" {...ln} strokeWidth={3.6} />
      ) : (
        <g className="canelo-eyes">
          <ellipse cx={-21} cy={ey} rx={10.5} ry={11.5} fill="#2a1a12" />
          <ellipse cx={21} cy={ey} rx={10.5} ry={11.5} fill="#2a1a12" />
          <ellipse cx={-21} cy={ey + 1 + py} rx={7} ry={7.5} fill="#4a2f22" />
          <ellipse cx={21} cy={ey + 1 + py} rx={7} ry={7.5} fill="#4a2f22" />
          <circle cx={-17} cy={ey - 4 + py} r={3.8} fill="#fff" />
          <circle cx={25} cy={ey - 4 + py} r={3.8} fill="#fff" />
          <circle cx={-24} cy={ey + 4 + py} r={1.7} fill="#fff" />
          <circle cx={18} cy={ey + 4 + py} r={1.7} fill="#fff" />
        </g>
      )}
      {/* naricita */}
      <path d="M-9 -33 Q0 -38 9 -33 Q8 -25 0 -24 Q-8 -25 -9 -33 Z" fill="#1f1410" />
      <ellipse cx={-3} cy={-33} rx={3} ry={1.6} fill="#fff" opacity={0.6} />
      {mouth === "open" ? (
        <path d="M-7 -19 Q0 -8 7 -19 Z" fill={C.pink} {...ln} strokeWidth={2.8} />
      ) : (
        <path d="M0 -24 V-20 M-8 -18 Q-4 -14 0 -18 Q4 -14 8 -18" fill="none" {...ln} strokeWidth={2.8} />
      )}
      {mouth === "tongue" && <path d="M-4 -17 Q-5 -7 0 -7 Q5 -7 4 -17 Z" fill={C.pink} stroke={C.line} strokeWidth={2.2} />}
      {flor && (
        <g transform="translate(10 -16) rotate(18)">
          <path d="M0 0 L22 6" stroke="#5f7c4f" strokeWidth={3} strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx={26} cy={-2} rx={4.5} ry={7} fill="#f2a7ad" transform={`rotate(${r} 26 6)`} />
          ))}
          <circle cx={26} cy={6} r={4} fill="#f2cf5b" />
        </g>
      )}
    </>
  );
}

function TopKnot() {
  return (
    <g>
      <path d={PUFF} fill={C.fur} {...ln} strokeWidth={3.2} />
      <path d="M0 -100 L-16 -109 L-14 -92 Z M0 -100 L16 -109 L14 -92 Z" fill={C.bandana} {...ln} strokeWidth={2.8} />
      <circle cx={0} cy={-100} r={4.2} fill={C.bandana} stroke={C.line} strokeWidth={2.8} />
    </g>
  );
}

function Tail({ wag }: { wag: ToreProps["wag"] }) {
  return (
    <path
      className={`canelo-tail ${wag === "fast" ? "wag-fast" : wag === "slow" ? "wag-slow" : ""}`}
      d="M30 46 C46 44 56 32 56 16 C56 4 66 -2 73 5 C81 14 76 30 66 40 C56 50 41 54 30 52 Z"
      fill={C.ear}
      {...ln}
    />
  );
}

function Leg({ x, className }: { x: number; className?: string }) {
  return (
    <g className={className}>
      <rect x={x} y={44} width={17} height={38} rx={8.5} fill={C.fur} {...ln} />
      <path d={`M${x + 6} 80 v-5 M${x + 11} 80 v-5`} stroke={C.line} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
}

function Limb({ from, to }: { from: [number, number]; to: [number, number] }) {
  const d = `M${from[0]} ${from[1]} L${to[0]} ${to[1]}`;
  return (
    <>
      <path d={d} stroke={C.line} strokeWidth={19} strokeLinecap="round" />
      <path d={d} stroke={C.fur} strokeWidth={11} strokeLinecap="round" />
    </>
  );
}

/** patita levantada saludando: sale del hombro y termina en una almohadilla rosada */
function PawUp() {
  return (
    <g className="paw-wave">
      <Limb from={[16, 30]} to={[56, 0]} />
      <g transform="translate(60 -6)">
        <ellipse cx={0} cy={0} rx={11} ry={10} fill={C.fur} {...ln} />
        <ellipse cx={0} cy={2.5} rx={4.5} ry={3.8} fill={C.pink} />
        <circle cx={-5.5} cy={-4} r={2} fill={C.pink} />
        <circle cx={0} cy={-6.5} r={2} fill={C.pink} />
        <circle cx={5.5} cy={-4} r={2} fill={C.pink} />
      </g>
    </g>
  );
}

export default function Tore({ pose = "sit", eyes = "open", mouth = "smile", wag = "slow", paw = false, flor = false, className, transform }: ToreProps) {
  const walking = pose === "walk";
  const standing = pose === "stand" || walking;

  return (
    <g className={className} transform={transform}>
      <g className={walking ? "canelo-bounce" : undefined}>
        <Tail wag={wag} />

        {pose === "sit" && (
          <>
            <path d={HAUNCH_L} fill={C.fur} {...ln} />
            <path d={HAUNCH_R} fill={C.fur} {...ln} />
          </>
        )}
        {standing && (
          <>
            <g className={walking ? "leg-b" : undefined}>
              <rect x={-42} y={46} width={15} height={36} rx={7} fill={C.shade} {...ln} />
            </g>
            <g className={walking ? "leg-a" : undefined}>
              <rect x={27} y={46} width={15} height={36} rx={7} fill={C.shade} {...ln} />
            </g>
          </>
        )}
        {pose === "lie" && (
          <>
            <Limb from={[-24, 64]} to={[-46, 96]} />
            <Limb from={[24, 64]} to={[46, 96]} />
          </>
        )}

        {/* cuerpo esponjoso, con el lomo un poquito tostado */}
        <path d={standing ? BODY_STAND : BODY_SIT} fill={C.fur} {...ln} />
        <path d="M-30 18 Q0 4 30 18 Q20 10 0 9 Q-20 10 -30 18 Z" fill={C.tan} opacity={0.7} />
        <path d="M-12 24 q4 10 0 20 M0 28 q4 10 0 20 M12 24 q-4 10 0 20" stroke={C.shade} strokeWidth={3} fill="none" strokeLinecap="round" />

        {/* patas delanteras */}
        {pose === "lie" ? (
          <>
            <Limb from={[-30, 22]} to={[-64, -4]} />
            <Limb from={[30, 22]} to={[64, -4]} />
          </>
        ) : (
          <>
            <Leg x={-26} className={walking ? "leg-a" : undefined} />
            {!paw && <Leg x={9} className={walking ? "leg-b" : undefined} />}
          </>
        )}

        {/* cabeza */}
        <Ears />
        <path d={HEAD} fill={C.fur} {...ln} />
        <Face eyes={eyes} mouth={mouth} flor={flor} />
        <TopKnot />
        {paw && pose !== "lie" && <PawUp />}
      </g>
    </g>
  );
}
