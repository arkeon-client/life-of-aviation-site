// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

export default defineConfig({
  // CHANGE 1: Set output to 'server'
  output: 'server',
  
  integrations: [
    tailwind({ applyBaseStyles: true }), 
    react()
  ],
  
  // CHANGE 2: Ensure adapter is set
  adapter: netlify(),
});