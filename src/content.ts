/*
 * ─────────────────────────────────────────────────────────────
 *  TODO EL TEXTO DE LA PÁGINA VIVE AQUÍ.
 *  Cambia lo que quieras: el resto del código se adapta solo.
 * ─────────────────────────────────────────────────────────────
 */

export const content = {
  nombre: "Angie",
  firma: "Alessandro",

  hero: {
    linea: "Hice esto con mucho amor y con todo lo bonito que me haces sentir.",
    titulo: "Mi amor",
    pista: "Toca a Tore, quiere saludarte",
  },

  // Contador que sube en vivo. Formato: AAAA-MM-DDTHH:mm:ss (hora local de quien lo abre)
  contador: {
    desde: "2026-03-09T00:00:00",
    titulo: "Desde el 9 de marzo",
    frase: "he pensado en ti tantas veces que tuve que ponerle un contador.",
    unidad: "veces, y contando",
    // Cuántos segundos cuentan como "una vez". 60 = una por minuto (siendo modesto).
    segundosPorVez: 60,
  },

  dibujo: {
    titulo: "Aquí está tu Tore",
    texto: "Lo hice para ti. Mueve la colita, se dibuja solito y te va a acompañar en todo lo que sigue.",
    lienzo: "Dibújale algo, le va a encantar.",
  },

  escenas: [
    {
      titulo: "Un campo entero para ti",
      texto: "Tore se quedó dormido entre flores. Toca el campo y planta más: cada 10 flores, Tore se levanta y te trae una.",
    },
    {
      titulo: "Pide un deseo",
      texto: "Toca el cielo. Cada estrella fugaz es un deseo tuyo que se va a cumplir.",
    },
    {
      titulo: "Aunque haya mar de por medio",
      texto: "Ningún kilómetro alcanza para separarnos. Lo que siento no se cansa y no se va: cruza el mar entero solo para llegar a ti. Toca el agua y manda un barquito.",
    },
  ],

  // Los muñequitos del hilo rojo. Cambia los colores para que se parezcan a ustedes.
  munecos: {
    ella: { pelo: "#3a2419", piel: "#ecc8ab", ropa: "#a9c4e8", piernas: "#4a6a9c", detalle: "#b3263a" }, // blusa azul, jean ancho, zapatillas blancas
    el: { pelo: "#1c120c", piel: "#e2b291", ropa: "#fbfaf6", piernas: "#3b2a20", detalle: "#c9c2b4" }, // polera blanca
  },

  // Lo que hace Tore mientras cruza de una sección a otra
  puentes: {
    hueso: "Tore encontró un huesito y se fue corriendo al campo.",
    flor: "Arrancó una flor para llevársela al cielo.",
    estrella: "Atrapó una estrella fugaz y la llevó hasta el mar.",
    barco: "Volvió con un barquito, directo a la cafetería.",
    taza: "Te sirvió un café y salió corriendo a la cocina: Alessandro lo estaba esperando.",
    sobremesa: "Tore se ganó un huesito por ayudar… y salió corriendo: Alessandro tenía otro encargo para él.",
    carta: "Y aquí te la trae.",
  },

  cafe: {
    titulo: "Un café contigo",
    texto: "Tu favorito, ya lo sé. Yo invito este y todos los que vengan.",
    bebida: "Caramel macchiato",
    servir: "Servir",
    nota: "Leche, espresso, espumita y caramelo por encima. Tore ya está revisando que esté perfecto.",
  },

  // La cocina: la historia que avanza mientras ella baja
  cocina: {
    burbuja: "¡Esto es para ti!",
    intro: "Cuando estemos juntos, te voy a cocinar esto:",
    plato: "Pasta a la huancaína con lomo saltado",
    huancaina: "Primero la huancaína: ají amarillo, quesito fresco y mucho cariño.",
    lomo: "Luego el lomo, al fuego y bien jugosito.",
    servir: "Lo sirvo con todo mi amor… pero siento que le falta algo.",
    tore: "¡Tore! Ups… cayó justo el toque final. Ahora sí, perfecto.",
    mesa: "Y nos vamos a la mesa, los tres.",
    final: "A comer juntos, como siempre lo soñé. Buen provecho, mi amor.",
    pista: "Baja para seguir la historia",
  },

  // La escena donde Tore trae la carta corriendo
  entrega: {
    espera: "Alessandro y Tore estaban tramando algo…",
    plan: "Él le da algo a Tore. Son cómplices.",
    corre: "¡Ahí viene Tore con algo para ti!",
    lanza: "¡Atrápala!",
    firmaTore: "Entregado por Tore, cartero oficial y cómplice.",
    seguir: "Seguir",
    otraVez: "Que la traiga otra vez",
  },

  carta: {
    titulo: "Para ti",
    // Cada string es un párrafo. Escribe aquí lo tuyo; esto es solo un comienzo.
    parrafos: [
      "Mi chiquita: desde el 9 de marzo mi vida tiene otro orden. Todo lo bonito que me pasa, lo primero que quiero es contártelo a ti.",
      "Me acuerdo de cuando armábamos tu maleta con listas y más listas, de los vuelos, de las escalas, de como seria tus primeros dias. Estoy muy orgulloso de ti, de lo valiente que eres.",
      "Te extraño de una forma que no sé explicar bien. Extraño tu voz sin una pantalla de por medio, tus abrazos, reírme contigo de cualquier tontería. A veces miro la hora y solo pienso que avance mas rapido para poder estar contigo.",
      "Pero también aprendí algo: la distancia no nos hace más lejanos, nos hace más nuestros. Cada llamada a destiempo, cada buenos días que para mí llega de madrugada, cada foto que me mandas, me confirma que contigo lo quiero todo.",
      "Ya falta menos para febrero. Cuento los días para verte, abrazarte fuerte y no soltarte.",
      "Te amo, mi chiquita. Hoy, mañana y en todos los kilómetros que haga falta.",
    ],

  },

  final: {
    // {cafe} se reemplaza por el café que ella eligió (o "un café" si no eligió)
    pregunta: "¿Te tomas {cafe} conmigo?",
    si: "Sí",
    no: "No",
    respuesta: "Sabía que dirías que sí.",
    cierre: "Te amo en cada kilómetro, en cada hora de diferencia y en todos los días que faltan para volver a abrazarte.",
    recuerdo: "Hoy plantaste {flores}, pediste {deseos} y mandaste {barcos}. Tore lo guardó todo.",
    tuDibujo: "Lo que le dibujaste a Tore",
  },
};
