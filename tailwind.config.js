/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "var(--ground)",
        ink: "var(--ink)",
        accent: "var(--accent)",
        paper: "var(--paper)",
        sand: "var(--sand)",
        coffee: "var(--coffee)",
        night: "var(--night)",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        script: ['"Pinyon Script"', "cursive"],
      },
      fontSize: {
        mega: ["clamp(6rem, 21vw, 22rem)", { lineHeight: "1.15", letterSpacing: "0" }],
        display: ["clamp(3rem, 7vw, 7.5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        body: ["clamp(1.25rem, 1.55vw, 1.5rem)", { lineHeight: "1.5" }],
        small: ["1.0625rem", { lineHeight: "1.45" }],
      },
    },
  },
  plugins: [],
};
