import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/motion";

/*
 * Cursor propio: un punto azul que se agranda y muestra
 * una palabra sobre cualquier elemento con data-cursor="texto".
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setEnabled(fine);
    if (!fine) return;
    document.body.classList.add("has-cursor");
    const el = dot.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button");
      const text = target?.dataset.cursor ?? (target ? " " : "");
      setLabel(text);
    };
    const down = () => gsap.to(el, { scale: 0.8, duration: 0.15 });
    const up = () => gsap.to(el, { scale: 1, duration: 0.3, ease: "back.out(3)" });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const big = label.trim().length > 0;
  const hover = label.length > 0;

  return (
    <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[90]" style={{ display: enabled ? "block" : "none" }} aria-hidden>
      <div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-paper transition-[width,height] duration-300 ease-out"
        style={{ width: big ? 96 : hover ? 40 : 12, height: big ? 96 : hover ? 40 : 12 }}
      >
        <span className="text-small font-semibold" style={{ opacity: big ? 1 : 0, transition: "opacity .2s" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
