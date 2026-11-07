import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { getLenis, ScrollTrigger, startLenis } from "./lib/motion";
import { content } from "./content";
import Loader from "./components/Loader";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Contador from "./components/Contador";
import Escenas from "./components/Escenas";
import Dibujo from "./components/Dibujo";
import Cafe from "./components/Cafe";
import Entrega from "./components/Entrega";
import Cocina from "./components/Cocina";
import Final from "./components/Final";
import Celebracion from "./components/Celebracion";
import Puente from "./components/Puente";
import Fundido from "./components/Fundido";
import HiloRojo from "./components/HiloRojo";
import Ambiente from "./components/Ambiente";

export default function App() {
  const [loading, setLoading] = useState(true);
  const done = useCallback(() => setLoading(false), []);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const lenis = startLenis();
    lenis?.stop();
  }, []);

  useEffect(() => {
    if (loading) return;
    getLenis()?.start();
    const id = setTimeout(() => ScrollTrigger.refresh(), 300);
    window.addEventListener("load", () => ScrollTrigger.refresh());
    return () => clearTimeout(id);
  }, [loading]);

  return (
    <>
      <AnimatePresence>{loading && <Loader onDone={done} />}</AnimatePresence>
      <Cursor />
      <Nav nombre={content.nombre} />
      <div className="relative">
      <HiloRojo ready={!loading} />
      <main>
        <Hero ready={!loading} />
        <Fundido from="#f1e8da" to="#e6d9c3" />
        <Contador />
        <Dibujo />
        <Puente carga="hueso" texto={content.puentes.hueso} from="#e6d9c3" to="#f1e8da" />
        <Escenas />
        <Puente carga="barco" texto={content.puentes.barco} dark from="#f1e8da" to="#3b2a20" />
        <Cafe />
        <Puente carga="taza" texto={content.puentes.taza} from="#3b2a20" to="#f7ead8" />
        <Cocina />
        <Puente carga="hueso" texto={content.puentes.sobremesa} from="#f7ead8" to="#f6e8d3" />
        <Entrega />
        <Fundido from="#f6e8d3" to="#e6d9c3" alto={160} />
        <Final />
      </main>
      </div>
      <Ambiente ready={!loading} />
      <Celebracion />
    </>
  );
}
