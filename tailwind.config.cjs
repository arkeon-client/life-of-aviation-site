/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        aviation: {
          deep: '#020617',    // The main background (Dark Navy/Black)
          slate: '#1e293b',   // Lighter sections
        },
        pelican: {
          coral: '#FF6F61',   // Accent
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        // The new gradient: White -> Ice Blue -> Silver
        'gradient-platinum': 'linear-gradient(to right, #ffffff, #cceeff, #94a3b8)', 
      }
    },
  },
  plugins: [],
};