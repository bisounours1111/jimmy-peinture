export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette professionnelle "Peinture"
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9", // Sky blue - Trust & Professionalism
          600: "#0284c7",
          900: "#0c4a6e",
        },
        secondary: {
          500: "#64748b", // Slate - Neutral
        },
        accent: {
          500: "#f59e0b", // Amber - Action buttons (Add to cart)
        },
      },
    },
  },
  plugins: [],
};
