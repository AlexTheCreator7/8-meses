# Para mi chiquita

Página interactiva, dibujada por completo con código, hecha con Vite, React, TypeScript, Tailwind, GSAP (ScrollTrigger, SplitText, DrawSVG), Lenis y Framer Motion.

## Abrirlo en VS Code

1. Instala Node.js 18 o superior.
2. Abre esta carpeta en VS Code y en la terminal (Ctrl + ñ) corre:

```bash
npm install
npm run dev
```

3. Abre el enlace que aparece (normalmente http://localhost:5173).

## Personalizar

- **Todo el texto** (carta, frases, cafés, la pregunta final, la fecha del contador) está en `src/content.ts`.
- **Música**: `public/musica.mp3` (Married Life). Empieza con un fade suave cuando ella toca "Abrir, con música" en la pantalla de carga; se pausa o vuelve a sonar con el botón de arriba a la derecha. Para cambiarla, reemplaza el archivo con el mismo nombre.
- **Colores**: en `src/index.css`, variables `--ground` (beige), `--ink` (espresso) y `--accent` (azul).
- **Los muñequitos** (dibujados a partir de su foto: ella con cabello largo ondulado, blusa celeste con lacito, jean ancho, zapatillas blancas y su tatuajito; él con rulos y polera blanca): colores en `content.munecos`, dibujo en `src/components/Chibi.tsx`.
- **Tore** (su shih tzu: crema y esponjoso, orejitas beige, ojos grandes, moñito azul) vive en `src/components/Tore.tsx`; sus poses se eligen con props (`pose`: sit, lie, walk; `eyes`; `mouth`; `wag`).

## Regla de la casa

Todas las animaciones van de izquierda a derecha. Los helpers de `src/lib/ltr.ts` (`wipe`, `slide`) son la forma de animar entradas; úsalos si agregas secciones.

## Qué tiene

- **Portada ilustrada**: colinas, sol que gira, nubes, flores y mariposas. Tore entra corriendo de izquierda a derecha y se sienta; si lo tocas, ladra "¡Guau!" y suelta corazones.
- **Fondos con vida**: cada sección tiene su capa animada (pétalos, corazones, luciérnagas, burbujas, granos de café, destellos), todo viajando hacia la derecha.
- **El hilo rojo del destino** recorre toda la página. Ella (blusa azul, jean ancho, zapatillas blancas) lo va siguiendo mientras bajas; al final él (polera blanca) entra caminando y la espera con el otro extremo.
- **Tore reacciona en cada sección**: salta cada vez que sube el contador, se dibuja solo y se emociona cuando ella dibuja, duerme en el campo y mueve la cola cuando planta flores, mira las estrellas y celebra cada deseo, ladra con cada barquito, huele el café y se alegra al servirlo, duerme junto a la firma y salta en el final.
- **Puentes**: entre secciones Tore cruza llevando algo (un hueso, una flor, una estrella, un barquito, un café, la carta) y deja huellitas detrás.
- **Campo**: cada 10 flores que ella planta, Tore se levanta, recoge una y se la lleva; ella va armando su ramito.
- **Mar**: cada barquito lleva a Alessandro y a Tore navegando hacia ella, que los espera en la orilla; al llegar sale un corazón.
- **Café**: su favorito, caramel macchiato, servido por capas mientras Tore se asoma desde el borde del vaso.
- **Fondos con vida** (`src/components/Decor.tsx`): pájaros y un arbolito en la portada, tendedero de corazones y cartitas en el contador, garabatos que se dibujan solos, mariquita, abejitas y viento en el campo, luna con halo y colinas en la noche, nubes, barco lejano, destellos y un cangrejito en el mar, lamparitas, guirnalda y ventana con lluvia en el café, banderines y globos de corazón en el final.
- **Colores en armonía**: los puentes y fundidos pasan suavemente de un color de sección al siguiente.
- Lo que ella hace se recuerda al final: flores, deseos, barquitos, el café que eligió y su dibujo.
- **La cocina**: un programa de cocina "en vivo" que avanza mientras ella baja. Alessandro, detrás del mostrador como presentador, le dice que, cuando estén juntos, le va a cocinar pasta a la huancaína con lomo saltado; prepara la huancaína en la licuadora, flambea el lomo y sirve el plato, pero le falta algo… Tore salta, la repisa tiembla y cae justo el quesito con perejil encima. Luego llevan el plato a la mesa, ella llega y comen juntos. Textos en `content.cocina`.
- **La entrega de la carta**: al fondo de un camino, Alessandro le da la carta a Tore (son cómplices). Tore viene corriendo hacia la pantalla con la carta en la boca, salta y la lanza; el sobre se abre hasta ocupar toda la pantalla y la carta se escribe palabra por palabra. Al final: "Seguir" o "Que la traiga otra vez". Los textos de la escena están en `content.entrega`.
- Contador en vivo desde el 9 de marzo, cafetería interactiva, pregunta final con un "No" que huye.
- Música: Married Life, empieza al tocar "Abrir, con música".
- Sorpresas: escribir `angie` o `cafe` en el teclado.

## Publicarlo para mandarle el link

```bash
npm run build
```

Sube la carpeta `dist/` a Netlify Drop (arrastrar y soltar) o a Vercel / GitHub Pages.
