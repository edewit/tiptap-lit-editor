import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demo',
  base: '/tiptap-lit-editor/',
  build: {
    outDir: '../demo/dist-demo',
    emptyOutDir: true,
  },
});
