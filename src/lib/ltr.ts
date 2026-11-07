import { gsap } from "./motion";

/*
 * Regla de la casa: TODO entra de izquierda a derecha.
 * Estos helpers son la única forma en que las secciones animan entradas.
 */

const HIDDEN = "inset(0% 100% 0% 0%)";
const SHOWN = "inset(0% 0% 0% 0%)";

/** Se revela como una cortina que corre de izquierda a derecha. */
export function wipe(target: gsap.TweenTarget, trigger?: Element | string | null, opts: gsap.TweenVars = {}) {
  return gsap.fromTo(
    target,
    { clipPath: HIDDEN },
    {
      clipPath: SHOWN,
      duration: 1.6,
      ease: "expo.inOut",
      ...(trigger ? { scrollTrigger: { trigger, start: "top 80%" } } : {}),
      ...opts,
    },
  );
}

/** Entra deslizándose desde la izquierda, uno tras otro. */
export function slide(target: gsap.TweenTarget, trigger?: Element | string | null, opts: gsap.TweenVars = {}) {
  return gsap.from(target, {
    x: -56,
    opacity: 0,
    duration: 1.2,
    stagger: 0.1,
    ease: "expo.out",
    ...(trigger ? { scrollTrigger: { trigger, start: "top 82%" } } : {}),
    ...opts,
  });
}

/** Ordena elementos por su posición horizontal, para escalonarlos de izquierda a derecha. */
export function byX<T extends Element>(els: T[]) {
  return [...els].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
}

export { HIDDEN, SHOWN };
