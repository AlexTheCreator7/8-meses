// Rutas relativas a /public, válidas tanto en `npm run dev` como en el build.
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
