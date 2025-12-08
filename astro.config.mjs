// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      // Disabling base styles here allows us to control them in global.css if needed,
      // but keeping it true is standard for rapid development.
      applyBaseStyles: true,
    }), 
    react()
  ],
});