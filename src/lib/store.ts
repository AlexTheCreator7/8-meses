import { useSyncExternalStore } from "react";

/*
 * Memoria compartida entre secciones: lo que ella hace en una parte
 * aparece más adelante (flores, deseos, barquitos, su café, su dibujo).
 */
export type Recuerdos = {
  flores: number;
  deseos: number;
  barcos: number;
  cafe: string | null;
  dibujo: string | null;
};

let state: Recuerdos = { flores: 0, deseos: 0, barcos: 0, cafe: null, dibujo: null };
const subs = new Set<() => void>();

export function setRecuerdos(patch: Partial<Recuerdos> | ((s: Recuerdos) => Partial<Recuerdos>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  subs.forEach((f) => f());
}

export function useRecuerdos() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => state,
  );
}
