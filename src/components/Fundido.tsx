/* Transición suave de color entre dos secciones, para que nada salte de golpe. */
export default function Fundido({ from, to, alto = 220 }: { from: string; to: string; alto?: number }) {
  return <div aria-hidden style={{ height: alto, background: `linear-gradient(to bottom, ${from}, ${to})` }} />;
}
