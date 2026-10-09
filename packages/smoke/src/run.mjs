// Consumer-level smoke test. Everything the workspace-linked tests can't
// see lives here: what `pnpm pack` actually ships, whether it installs and
// resolves under plain npm (no workspace, no hoisting), whether the types
// resolve under both `Bundler` and `NodeNext` module resolution, and
// whether SSR output hydrates cleanly in a real browser.
//
// Needs network access (npm install of react/svelte/vite into the
// throwaway consumers) and Chromium (`playwright install chromium`).
import { execFileSync, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const work = mkdtempSync(join(tmpdir(), 'ictk-smoke-'));
const failures = [];
const check = (ok, message) => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${message}`);
  if (!ok) failures.push(message);
};
// Children never inherit NODE_ENV: vite.preview()/build set it to 'production'
// in *this* process, which would make a later `npm install` silently skip
// devDependencies (and run SSR with the wrong React/Svelte build).
const cleanEnv = () => {
  const { NODE_ENV, ...rest } = process.env;
  return rest;
};
const sh = (cmd, args, cwd, opts = {}) =>
  execFileSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: cleanEnv(),
    ...opts,
  });
const tryRun = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', env: cleanEnv() });
  return { ok: r.status === 0, out: `${r.stdout}${r.stderr}` };
};

// --- 1. build + pack ---------------------------------------------------
console.log('\n# pack');
sh('pnpm', ['-r', '--filter', './packages/*', 'build'], repo);
const tarballs = {};
for (const name of ['core', 'react', 'svelte']) {
  const dest = join(work, 'tarballs');
  mkdirSync(dest, { recursive: true });
  const before = new Set(sh('ls', [dest], repo).split('\n'));
  sh('pnpm', ['pack', '--pack-destination', dest], join(repo, 'packages', name));
  const file = sh('ls', [dest], repo)
    .split('\n')
    .find((f) => f && !before.has(f));
  tarballs[name] = join(dest, file);

  const files = sh('tar', ['-tzf', tarballs[name]], repo).split('\n').filter(Boolean);
  const manifest = JSON.parse(sh('tar', ['-xzOf', tarballs[name], 'package/package.json'], repo));
  check(files.includes('package/LICENSE'), `${name}: tarball includes LICENSE`);
  check(
    files.some((f) => f.startsWith('package/dist/')),
    `${name}: tarball includes dist/`,
  );
  check(!files.some((f) => /\.test\.|\/test\//.test(f)), `${name}: tarball has no test files`);
  check(
    !files.some((f) => f.startsWith('package/src/') && !f.endsWith('styles.css')),
    `${name}: tarball has no stray src/`,
  );
  check(
    !JSON.stringify(manifest).includes('workspace:'),
    `${name}: packed manifest has no workspace: specifiers`,
  );
  check(manifest.license === 'MIT', `${name}: manifest declares MIT license`);
  for (const target of Object.values(manifest.exports ?? {}).flatMap((v) =>
    typeof v === 'string' ? [v] : Object.values(v),
  )) {
    check(
      files.includes(`package/${target.replace('./', '')}`),
      `${name}: exports target ${target} exists in tarball`,
    );
  }
}

// --- 2. consumers ------------------------------------------------------
const deps = (extra) => ({
  '@tingard/ictk-core': `file:${tarballs.core}`,
  ...extra,
});

const consumers = {
  react: {
    pkg: {
      dependencies: deps({
        '@tingard/ictk-react': `file:${tarballs.react}`,
        react: '^18.3.1',
        'react-dom': '^18.3.1',
      }),
      devDependencies: {
        '@types/react': '^18.3.0',
        '@types/react-dom': '^18.3.0',
        '@vitejs/plugin-react': '^4.3.0',
        typescript: '^5.6.0',
        vite: '^5.4.0',
      },
    },
    files: {
      'vite.config.ts': `import react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\nexport default defineConfig({ plugins: [react()] });\n`,
      'src/App.tsx': `import { HexagonFrame, Icon, SquareFrame } from '@tingard/ictk-react';
import '@tingard/ictk-react/style.css';

const gradient = { type: 'gradient' as const, stops: [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }] };

export function App() {
  return (
    <div>
      <Icon size={40} frame={<SquareFrame fill={gradient} />} icon="A" amplifiers={{ T: 'top' }} />
      <Icon size={40} frame={<HexagonFrame fill={gradient} stroke={{ color: '#000', width: 2 }} />} icon="B" />
    </div>
  );
}
`,
      'src/entry-server.tsx': `import { renderToString } from 'react-dom/server';\nimport { App } from './App';\nexport const render = () => renderToString(<App />);\n`,
      'src/entry-client.tsx': `import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
const el = document.getElementById('root') as HTMLElement;
if (el.hasChildNodes()) hydrateRoot(el, <App />); else createRoot(el).render(<App />);
`,
      'src/entry': 'src/entry-client.tsx',
      'src/ssr': '/src/entry-server.tsx',
    },
    tsconfig: (resolution) => ({
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM'],
        module: resolution === 'NodeNext' ? 'NodeNext' : 'ESNext',
        moduleResolution: resolution,
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: false, // we want our own .d.ts files checked
        types: ['vite/client'],
      },
      include: resolution === 'NodeNext' ? ['src/App.tsx'] : ['src'],
    }),
    typecheck: (dir) => tryRun('npx', ['tsc', '-p', 'tsconfig.json'], dir),
  },
  svelte: {
    pkg: {
      dependencies: deps({ '@tingard/ictk-svelte': `file:${tarballs.svelte}`, svelte: '^5.20.0' }),
      devDependencies: {
        '@sveltejs/vite-plugin-svelte': '^4.0.4',
        'svelte-check': '^4.0.0',
        typescript: '^5.6.0',
        vite: '^5.4.0',
      },
    },
    files: {
      'vite.config.ts': `import { svelte } from '@sveltejs/vite-plugin-svelte';\nimport { defineConfig } from 'vite';\nexport default defineConfig({ plugins: [svelte()] });\n`,
      'svelte.config.js': `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';\nexport default { preprocess: vitePreprocess() };\n`,
      'src/App.svelte': `<script lang="ts">
  import { HexagonFrame, Icon, SquareFrame } from '@tingard/ictk-svelte';
  import '@tingard/ictk-svelte/style.css';

  const gradient = { type: 'gradient' as const, stops: [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }] };
</script>

<div>
  <Icon size={40} icon="A" amplifiers={{ T: 'top' }}>
    {#snippet frame()}<SquareFrame fill={gradient} />{/snippet}
  </Icon>
  <Icon size={40} icon="B">
    {#snippet frame()}<HexagonFrame fill={gradient} stroke={{ color: '#000', width: 2 }} />{/snippet}
  </Icon>
</div>
`,
      'src/entry-server.ts': `import { render as ssr } from 'svelte/server';\nimport App from './App.svelte';\nexport const render = () => ssr(App).body;\n`,
      'src/entry-client.ts': `import { hydrate, mount } from 'svelte';
import App from './App.svelte';
const target = document.getElementById('root') as HTMLElement;
if (target.hasChildNodes()) hydrate(App, { target }); else mount(App, { target });
`,
      'src/entry': 'src/entry-client.ts',
      'src/ssr': '/src/entry-server.ts',
    },
    tsconfig: (resolution) => ({
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM'],
        module: resolution === 'NodeNext' ? 'NodeNext' : 'ESNext',
        moduleResolution: resolution,
        verbatimModuleSyntax: true,
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        types: ['svelte', 'vite/client'],
      },
      include: ['src'],
    }),
    typecheck: (dir) =>
      tryRun(
        'npx',
        ['svelte-check', '--tsconfig', './tsconfig.json', '--threshold', 'warning'],
        dir,
      ),
  },
};

// Load the consumer's own Vite via its ESM entry (createRequire would hand
// back the deprecated CJS build, which lacks parts of the Node API).
async function importVite(dir) {
  const pkgJson = createRequire(join(dir, 'package.json')).resolve('vite/package.json');
  return import(pathToFileURL(join(dirname(pkgJson), 'dist/node/index.js')).href);
}

const indexHtml = (entry, ssr = false) =>
  `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root">${ssr ? '<!--ssr-->' : ''}</div><script type="module" src="/${entry}"></script></body></html>`;

const browser = await chromium.launch();

async function inspect(name, url, { expectHydration }) {
  const page = await browser.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on(
    'console',
    (m) => ['error', 'warning'].includes(m.type()) && problems.push(`${m.type()}: ${m.text()}`),
  );
  await page.goto(url);
  await page.waitForSelector('.ictk-icon');
  await page.waitForTimeout(300);
  const info = await page.evaluate(() => {
    const icons = [...document.querySelectorAll('.ictk-icon')];
    const grads = [...document.querySelectorAll('linearGradient')].map((g) => g.id);
    const fills = [...document.querySelectorAll('.ictk-frame [fill^="url("]')].map((e) =>
      e.getAttribute('fill'),
    );
    const box = icons[0]?.getBoundingClientRect();
    return {
      count: icons.length,
      display: icons[0] && getComputedStyle(icons[0]).display,
      width: box?.width,
      height: box?.height,
      grads,
      gradsUnique: new Set(grads).size === grads.length && grads.length === 2,
      fillsResolve:
        fills.length === 2 &&
        fills.every((f) => {
          const m = /^url\(#(.+)\)$/.exec(f ?? '');
          return m && document.getElementById(m[1]);
        }),
      amp: document.querySelector('.ictk-amplifier--T')?.textContent,
    };
  });
  check(info.count === 2, `${name}: renders 2 icons`);
  check(info.display === 'inline-grid', `${name}: stylesheet applied (display: inline-grid)`);
  check(
    Math.abs(info.width - 40) < 0.5 && Math.abs(info.height - 40) < 0.5,
    `${name}: icon box is exactly 40x40`,
  );
  check(info.gradsUnique, `${name}: gradient ids unique per instance (${info.grads.join(', ')})`);
  check(info.fillsResolve, `${name}: every gradient fill url(#id) resolves to a <linearGradient>`);
  check(info.amp === 'top', `${name}: plain-text amplifier rendered`);
  check(
    problems.length === 0,
    `${name}: no console errors/warnings${expectHydration ? ' (incl. hydration mismatches)' : ''}${problems.length ? ` — ${problems.join(' | ')}` : ''}`,
  );
  await page.close();
}

for (const [fw, spec] of Object.entries(consumers)) {
  console.log(`\n# ${fw} consumer`);
  const dir = join(work, `consumer-${fw}`);
  mkdirSync(join(dir, 'src'), { recursive: true });
  const entry = spec.files['src/entry'];
  const ssrEntry = spec.files['src/ssr'];
  for (const [f, content] of Object.entries(spec.files)) {
    if (f === 'src/entry' || f === 'src/ssr') continue;
    writeFileSync(join(dir, f), content);
  }
  writeFileSync(join(dir, 'index.html'), indexHtml(entry));
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify(
      {
        name: `consumer-${fw}`,
        private: true,
        type: 'module',
        ...spec.pkg,
        // The packed manifests depend on the *registry* version of core, which
        // isn't published yet — point every copy at the local tarball.
        overrides: { '@tingard/ictk-core': `file:${tarballs.core}` },
      },
      null,
      2,
    ),
  );

  const install = tryRun('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], dir);
  check(
    install.ok,
    `${fw}: npm install of tarballs succeeds${install.ok ? '' : `\n${install.out}`}`,
  );
  if (!install.ok) continue;
  const peerWarn = /ERESOLVE|peer dep/i.test(install.out);
  check(!peerWarn, `${fw}: no peer-dependency conflicts`);

  for (const resolution of ['Bundler', 'NodeNext']) {
    writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify(spec.tsconfig(resolution), null, 2));
    const r = spec.typecheck(dir);
    check(
      r.ok,
      `${fw}: types resolve and check under moduleResolution=${resolution}${r.ok ? '' : `\n${r.out.split('\n').slice(0, 12).join('\n')}`}`,
    );
  }
  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify(spec.tsconfig('Bundler'), null, 2));

  // Production build + preview (client-render only).
  const build = tryRun('npx', ['vite', 'build'], dir);
  check(build.ok, `${fw}: vite production build succeeds${build.ok ? '' : `\n${build.out}`}`);
  if (build.ok) {
    const vite = await importVite(dir);
    process.env.NODE_ENV = 'production';
    const preview = await vite.preview({ root: dir, logLevel: 'silent', preview: { port: 0 } });
    const url = preview.resolvedUrls.local[0];
    await inspect(`${fw} (prod build)`, url, { expectHydration: false });
    await preview.close();
  }

  // Dev-server SSR + hydration.
  const vite = await importVite(dir);
  process.env.NODE_ENV = 'development';
  const dev = await vite.createServer({
    root: dir,
    appType: 'custom',
    server: { middlewareMode: true },
    logLevel: 'silent',
  });
  const http = createServer((req, res) => {
    dev.middlewares(req, res, async () => {
      try {
        const template = await dev.transformIndexHtml(req.url, indexHtml(entry, true));
        const { render } = await dev.ssrLoadModule(ssrEntry);
        res.setHeader('content-type', 'text/html');
        res.end(template.replace('<!--ssr-->', render()));
      } catch (e) {
        dev.ssrFixStacktrace(e);
        res.statusCode = 500;
        res.end(String(e.stack));
      }
    });
  });
  await new Promise((r) => http.listen(0, r));
  try {
    await inspect(`${fw} (SSR + hydrate)`, `http://localhost:${http.address().port}/`, {
      expectHydration: true,
    });
  } catch (e) {
    check(false, `${fw}: SSR + hydrate page failed to load — ${e.message}`);
  }
  http.close();
  await dev.close();
}

await browser.close();
if (process.env.SMOKE_KEEP) console.log(`kept ${work}`);
else rmSync(work, { recursive: true, force: true });
console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nall checks passed');
process.exit(failures.length ? 1 : 0);
