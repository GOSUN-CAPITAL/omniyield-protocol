import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b11",
        surface: "#101622",
        surfaceBorder: "#1f293d",
        primaryGreen: "#00ec97",
        accentCyan: "#00d2ff",
      },
    },
  },
  plugins: [],
};
export default config;

