// tailwind.config.js
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          from: "#6B46FF", // purple
          to: "#08D6B9",   // teal
        },
        muted: "var(--muted)",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(2,6,23,0.45)",
        strong: "0 12px 40px rgba(2,6,23,0.55)",
      },
      borderRadius: {
        xl2: "18px", // custom radius used in cards
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"), // for .line-clamp-{n}
    require("@tailwindcss/aspect-ratio"), // for consistent previews
  ],
};
