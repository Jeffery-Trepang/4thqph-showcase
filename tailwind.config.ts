import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Kept only for the About "JOHN PIZZA" section background.
          teal: "#0d9488",
        },
        // Site-wide hover/focus accent color.
        roseGold: "#8C703E",
        "roseGold-dark": "#775f35",
      },
    },
  },
  plugins: [],
};

export default config;
