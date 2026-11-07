import { useEffect, useRef, useState } from "react";

/** true durante `ms` cada vez que `value` cambia (para que Tore reaccione). */
export function useBlip(value: unknown, ms = 1400) {
  const [on, setOn] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setOn(true);
    const t = setTimeout(() => setOn(false), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return on;
}
