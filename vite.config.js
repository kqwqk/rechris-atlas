import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const siteConfig = JSON.parse(readFileSync(resolve(__dirname, 'site-config.json'), 'utf8'));

const runtimeFiles = [
  'default-shortcuts.json',
  'default-worklog.json',
  'icon8-host-slugs.json',
  'site-content.json',
];

async function removeBuildJunk(dir) {
  if (!existsSync(dir)) return;
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const entryPath = resolve(dir, entry.name);
    if (entry.name === '.DS_Store') {
      await rm(entryPath, { force: true });
      return;
    }
    if (entry.isDirectory()) {
      await removeBuildJunk(entryPath);
    }
  }));
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function normalizeWorklogPayload(input = {}) {
  const months = {};
  if (input.months && typeof input.months === 'object') {
    Object.entries(input.months).forEach(([monthKey, value]) => {
      const projects = Array.isArray(value?.projects)
        ? value.projects.map((item) => String(item).trim()).filter(Boolean)
        : Array.isArray(value)
          ? value.map((item) => String(item).trim()).filter(Boolean)
          : [];
      if (projects.length) months[monthKey] = projects;
    });
  }
  const records = {};
  if (input.records && typeof input.records === 'object') {
    Object.entries(input.records).forEach(([dateKey, value]) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !value?.projects) return;
      const projects = {};
      Object.entries(value.projects).forEach(([name, mark]) => {
        if (mark) projects[name] = true;
      });
      if (Object.keys(projects).length) records[dateKey] = { projects };
    });
  }
  return { months, records };
}

function readJsonBody(req) {
  return new Promise((resolveBody, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolveBody(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function readPhotoRecords() {
  const filePath = resolve(__dirname, 'photo-records-data.js');
  const source = await readFile(filePath, 'utf8');
  const runnable = source
    .replace(/^\s*export\s+const\s+PHOTO_RECORDS\s*=/, 'window.PHOTO_RECORDS =')
    .replace(/if \(typeof window !== 'undefined'\) \{\s*window\.PHOTO_RECORDS = PHOTO_RECORDS;\s*\}\s*$/s, '');
  const sandbox = { window: {} };
  vm.runInNewContext(runnable, sandbox, { filename: filePath });
  return Array.isArray(sandbox.window.PHOTO_RECORDS) ? sandbox.window.PHOTO_RECORDS : [];
}

async function writePhotoRecords(records) {
  const filePath = resolve(__dirname, 'photo-records-data.js');
  const source = [
    `export const PHOTO_RECORDS = ${JSON.stringify(records, null, 2)};`,
    '',
    "if (typeof window !== 'undefined') {",
    '  window.PHOTO_RECORDS = PHOTO_RECORDS;',
    '}',
    ''
  ].join('\n');
  await writeFile(filePath, source, 'utf8');
}

function localAdminPlugin() {
  return {
    name: 'local-admin-file-api',
    configureServer(server) {
      server.middlewares.use('/__local-admin/status', (req, res) => {
        if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
        return sendJson(res, 200, { ok: true });
      });

      server.middlewares.use('/__local-admin/shortcuts', async (req, res) => {
        try {
          if (req.method === 'GET') {
            const data = JSON.parse(await readFile(resolve(__dirname, 'default-shortcuts.json'), 'utf8'));
            return sendJson(res, 200, data);
          }
          if (req.method === 'POST') {
            const body = await readJsonBody(req);
            if (!Array.isArray(body.shortcuts)) return sendJson(res, 400, { error: 'Expected shortcuts array' });
            await writeFile(resolve(__dirname, 'default-shortcuts.json'), `${JSON.stringify(body.shortcuts, null, 2)}\n`, 'utf8');
            return sendJson(res, 200, { ok: true, count: body.shortcuts.length });
          }
          return sendJson(res, 405, { error: 'Method not allowed' });
        } catch (error) {
          return sendJson(res, 500, { error: error.message || 'Local admin write failed' });
        }
      });

      server.middlewares.use('/__local-admin/worklog', async (req, res) => {
        const worklogPath = resolve(__dirname, 'default-worklog.json');
        try {
          if (req.method === 'GET') {
            const data = JSON.parse(await readFile(worklogPath, 'utf8'));
            return sendJson(res, 200, normalizeWorklogPayload(data));
          }
          if (req.method === 'POST') {
            const body = await readJsonBody(req);
            const payload = normalizeWorklogPayload(body);
            await writeFile(worklogPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
            return sendJson(res, 200, { ok: true, ...payload });
          }
          return sendJson(res, 405, { error: 'Method not allowed' });
        } catch (error) {
          return sendJson(res, 500, { error: error.message || 'Local admin write failed' });
        }
      });

      server.middlewares.use('/__local-admin/photos', async (req, res) => {
        try {
          if (req.method === 'GET') {
            return sendJson(res, 200, await readPhotoRecords());
          }
          if (req.method === 'POST') {
            const body = await readJsonBody(req);
            const patch = body.record;
            if (!patch || !patch.id) return sendJson(res, 400, { error: 'Expected record with id' });
            const records = await readPhotoRecords();
            const index = records.findIndex(record => record.id === patch.id);
            if (index < 0) return sendJson(res, 404, { error: 'Photo record not found' });
            records[index] = {
              ...records[index],
              title: String(patch.title || '').trim(),
              content: String(patch.content || '').trim(),
              date: String(patch.date || '').trim(),
              time: String(patch.time || '').trim(),
              location: String(patch.location || '').trim(),
              lens: String(patch.lens || '').trim()
            };
            await writePhotoRecords(records);
            return sendJson(res, 200, { ok: true, record: records[index] });
          }
          return sendJson(res, 405, { error: 'Method not allowed' });
        } catch (error) {
          return sendJson(res, 500, { error: error.message || 'Local admin write failed' });
        }
      });
    }
  };
}

function siteMetadataPlugin() {
  const siteUrl = String(siteConfig.siteUrl || 'https://kqwqk.pw').replace(/\/+$/, '');
  return {
    name: 'site-metadata',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', siteUrl);
    }
  };
}

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
        ['assets/icons', 'assets/icons'],
        ['assets/generated/display', 'assets/generated/display'],
        ['assets/photos/thumbs', 'assets/photos/thumbs'],
        ['assets/leaves.mp4', 'assets/leaves.mp4'],
      ];

      await Promise.all(assetCopies.map(async ([fromRel, toRel]) => {
        const from = resolve(__dirname, fromRel);
        if (!existsSync(from)) return;
        await cp(from, resolve(outDir, toRel), { recursive: true });
      }));

      // Copy original photos (excluding subdirectories)
      const photosDir = resolve(__dirname, 'assets/photos');
      const distPhotosDir = resolve(outDir, 'assets/photos');
      await mkdir(distPhotosDir, { recursive: true });
      const photoFiles = await readdir(photosDir, { withFileTypes: true });
      await Promise.all(photoFiles
        .filter(entry => entry.isFile() && /\.(jpg|jpeg)$/i.test(entry.name))
        .map(entry => copyFile(resolve(photosDir, entry.name), resolve(distPhotosDir, entry.name)))
      );

      await removeBuildJunk(outDir);
    },
  };
}

export default defineConfig({
  root: '.',
  base: './',
  plugins: [siteMetadataPlugin(), react(), localAdminPlugin(), copyRuntimeAssets()],

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.SOURCE_MAPS === 'true',

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
