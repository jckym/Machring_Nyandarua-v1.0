#!/usr/bin/env node
/**
 * Automated route test: verifies /register loads from a production build.
 * Usage: node scripts/test-register-route.mjs
 * Assumes `npm run build` has already produced frontend/dist (or dist).
 */
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = process.env.PORT || 4173;
const HOST = '127.0.0.1';
const ROUTES = ['/', '/register', '/auth'];

function log(...a) { console.log('[route-test]', ...a); }
function fail(msg) { console.error('[route-test] FAIL:', msg); process.exit(1); }

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await delay(300);
  }
  throw new Error(`Server did not start at ${url} within ${timeoutMs}ms`);
}

async function main() {
  log('starting vite preview on', `${HOST}:${PORT}`);
  const preview = spawn(
    'npx',
    ['vite', 'preview', '--config', 'frontend/vite.config.ts', '--host', HOST, '--port', String(PORT), '--strictPort'],
    { stdio: ['ignore', 'inherit', 'inherit'], env: process.env }
  );

  let exitCode = 0;
  try {
    await waitForServer(`http://${HOST}:${PORT}/`);
    for (const route of ROUTES) {
      const url = `http://${HOST}:${PORT}${route}`;
      const res = await fetch(url);
      const body = await res.text();
      if (res.status !== 200) fail(`${route} returned ${res.status}`);
      if (!/<div id="root"/.test(body)) fail(`${route} did not serve SPA index.html (no #root div)`);
      if (!/<script[^>]+type="module"/.test(body)) fail(`${route} missing built module script`);
      log('OK', route, '→ 200, SPA shell served');
    }
    log('all routes passed ✔');
  } catch (e) {
    console.error('[route-test]', e);
    exitCode = 1;
  } finally {
    preview.kill('SIGTERM');
    await delay(200);
    process.exit(exitCode);
  }
}

main();
