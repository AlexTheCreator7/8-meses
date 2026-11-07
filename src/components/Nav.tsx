import { useEffect, useRef, useState } from "react";
import { getLenis, gsap } from "../lib/motion";
import { asset } from "../lib/assets";

const links = [
  ["Contador", "#contador"],
  ["Tore", "#tore"],
  ["Café", "#cafe"],
  ["Cocina", "#cocina"],
  ["Carta", "#entrega"],
] as const;

/*
 * Navegación plana. El botón de música solo aparece si existe
 * public/musica.mp3 (pon ahí la canción de ustedes).
 */
export default function Nav({ nombre }: { nombre: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [hasSong, setHasSong] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

  // se esconde al bajar y vuelve al subir
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 120 && y > lastY);
      setSolid(y > 40);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const a = audio.current!;
    const ok = () => setHasSong(true);
    a.addEventListener("canplay", ok);
    a.load();
    return () => a.removeEventListener("canplay", ok);
  }, []);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(href, { duration: 1.6 });
    else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  // entra suave, sin golpe de volumen
  const play = () => {
    const a = audio.current!;
    a.volume = 0;
    a.play()
      .then(() => {
        setPlaying(true);
        gsap.to(a, { volume: 0.6, duration: 3, ease: "sine.out" });
      })
      .catch(() => {});
  };

  const toggle = () => {
    const a = audio.current!;
    if (a.paused) play();
    else {
      gsap.to(a, { volume: 0, duration: 0.6, onComplete: () => { a.pause(); setPlaying(false); } });
    }
  };

  // la canción empieza cuando ella abre la página (toca "Abrir")
  useEffect(() => {
    const start = () => play();
    window.addEventListener("angie:abrir", start);
    return () => window.removeEventListener("angie:abrir", start);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 text-ink transition-[transform,background-color] duration-500 md:px-8 md:py-4" style={{ transform: hidden ? "translateY(-110%)" : "none", backgroundColor: solid ? "var(--ground)" : "transparent" }}>
      <a href="#inicio" onClick={(e) => go(e, "#inicio")} className="font-script text-[2rem] leading-none">
        {nombre}
      </a>
      <nav className="hidden gap-7 text-small md:flex">
        {links.map(([t, h]) => (
          <a key={h} href={h} onClick={(e) => go(e, h)} className="transition-opacity hover:opacity-60">
            {t}
          </a>
        ))}
      </nav>
      <audio ref={audio} src={asset("musica.mp3")} loop preload="auto" />
      {hasSong ? (
        <button onClick={toggle} className="flex items-center gap-2 text-small font-semibold" data-cursor={playing ? "Pausa" : "Play"}>
          <span className="flex h-3 items-end gap-[2px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[2px] bg-current"
                style={{
                  height: playing ? undefined : 3,
                  animation: playing ? `eq 0.${7 + i}s ease-in-out ${i * 0.1}s infinite alternate` : "none",
                }}
              />
            ))}
          </span>
          {playing ? "Sonando" : "Nuestra canción"}
        </button>
      ) : (
        <a href="#final" onClick={(e) => go(e, "#final")} className="text-small font-semibold">
          Al final
        </a>
      )}
      <style>{`@keyframes eq{from{height:3px}to{height:12px}}`}</style>
    </header>
  );
}
