import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'node',
    // Real Chromium launches + several bindings: give slow CI machines room.
    testTimeout: 30_000,
    server: {
      deps: {
        // The Svelte binding ships uncompiled .svelte files; Node can't load
        // those directly, so they must go through Vite's plugin pipeline.
        inline: [/@tingard\/ictk-svelte/],
      },
    },
  },
});
