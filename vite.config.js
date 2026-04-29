import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const runtimeFiles = [
  'app.js',
  'enhancements.js',
  'inspiration-system.js',
  'devlog-data.js',
  'devlog-module.js',
  'photo-records-data.js',
  'life-records.js',
  'life-record-form.js',
  'dynamic-greeting.js',
  'image-lazy-loader.js',
  'default-shortcuts.json',
  'icon8-host-slugs.json',
  'site-content.json',
];

function copyRuntimeAssets() {
  return {
    name: 'copy-runtime-assets',
    async buildStart() {
      await rm(resolve(__dirname, 'dist'), { recursive: true, force: true });
    },
    async closeBundle() {
      const outDir = resolve(__dirname, 'dist');
      await mkdir(outDir, { recursive: true });

      await Promise.all(runtimeFiles.map(async (file) => {
        const from = resolve(__dirname, file);
        if (!existsSync(from)) return;
        await copyFile(from, resolve(outDir, file));
      }));

      const assetCopies = [
        ['assets/generated', 'assets/generated'],
        ['assets/photos', 'assets/photos'],
        ['assets/forest.mp3', 'assets/forest.mp3'],
        ['assets/leaves.mp4', 'assets/leaves.mp4'],
      ];

      await Promise.all(assetCopies.map(async ([fromRel, toRel]) => {
        const from = resolve(__dirname, fromRel);
        if (!existsSync(from)) return;
        await cp(from, resolve(outDir, toRel), { recursive: true });
      }));
    },
  };
}

export default defineConfig({
  root: '.',
  base: './',
  plugins: [copyRuntimeAssets()],

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },

    // Optimize chunk size
    chunkSizeWarningLimit: 1000,

    // Keep the legacy script build simple while this page is migrated to modules.
    minify: 'esbuild',
  },

  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  preview: {
    port: 4173,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [],
  },

  // CSS options
  css: {
    devSourcemap: true,
  },
});
