import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import autoprefixer from 'autoprefixer';
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import tailwindConfig from '../tailwind.config.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(projectRoot, 'dist-ait');
const entryPoint = path.join(projectRoot, 'src', 'main.jsx');
const indexCssPath = path.join(projectRoot, 'src', 'index.css');

// The AIT package adds its native runtime bundles after this web build. Keeping
// the web payload below 60 MiB leaves enough room under the 100 MB uncompressed
// package limit for those bundles.
const MAX_WEB_BYTES = 60 * 1024 * 1024;
const MAP_ASSET_PATTERN = /^[a-z]+_map\.svg$/;
const ACTIVE_MAP_ASSETS = new Set([
  'busan_map.svg',
  'gyeonggi_map.svg',
  'incheon_map.svg',
  'seoul_map.svg',
]);

const formatMiB = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
const aliases = new Map([
  ['framer-motion', path.join(
    projectRoot,
    'node_modules',
    'framer-motion',
    'dist',
    'cjs',
    'index.js',
  )],
  ['lucide-react', path.join(projectRoot, 'src', 'vendor', 'lucide-react-ait.js')],
  ['recharts', path.join(projectRoot, 'src', 'vendor', 'recharts-ait.js')],
]);
const loaderByExtension = new Map([
  ['.cjs', 'js'],
  ['.css', 'css'],
  ['.gif', 'file'],
  ['.jpeg', 'file'],
  ['.jpg', 'file'],
  ['.js', 'js'],
  ['.json', 'json'],
  ['.jsx', 'jsx'],
  ['.mjs', 'js'],
  ['.png', 'file'],
  ['.svg', 'file'],
  ['.webp', 'file'],
]);

function parseEnvValue(rawValue) {
  let value = rawValue.trim();
  const quote = value[0];

  if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
    value = value.slice(1, -1);
    if (quote === '"') {
      value = value
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
    return value;
  }

  return value.replace(/\s+#.*$/, '').trim();
}

async function loadClientEnv() {
  const loaded = {};
  const envFiles = ['.env', '.env.local', '.env.production', '.env.production.local'];

  for (const envFile of envFiles) {
    try {
      const contents = await readFile(path.join(projectRoot, envFile), 'utf8');
      for (const line of contents.split(/\r?\n/)) {
        const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (match) loaded[match[1]] = parseEnvValue(match[2]);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  const clientKeys = [
    'VITE_API_BASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_URL',
  ];

  return Object.fromEntries(clientKeys.map((key) => [
    key,
    process.env[key] ?? loaded[key] ?? '',
  ]));
}

async function firstExistingPath(basePath) {
  const candidates = [
    basePath,
    `${basePath}.js`,
    `${basePath}.jsx`,
    `${basePath}.json`,
    path.join(basePath, 'index.js'),
    path.join(basePath, 'index.jsx'),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue through the extension order used by this app.
    }
  }

  throw new Error(`Cannot resolve local module: ${basePath}`);
}

async function resolveModule(specifier, importer) {
  if (aliases.has(specifier)) return aliases.get(specifier);
  if (path.isAbsolute(specifier)) return specifier;
  if (specifier.startsWith('.')) {
    return firstExistingPath(path.resolve(path.dirname(importer || entryPoint), specifier));
  }
  return createRequire(importer || entryPoint).resolve(specifier);
}

function sandboxFilesPlugin() {
  return {
    name: 'sandbox-files',
    setup(buildContext) {
      buildContext.onResolve({ filter: /.*/ }, async (args) => {
        // Framer Motion treats this as an optional dependency inside try/catch.
        if (args.path === '@emotion/is-prop-valid') {
          return { path: args.path, namespace: 'optional-missing' };
        }

        const resolved = args.kind === 'entry-point'
          ? entryPoint
          : await resolveModule(args.path, args.importer);

        if (resolved.startsWith('node:')) {
          return { errors: [{ text: `Unsupported browser builtin: ${resolved}` }] };
        }
        return { path: resolved, namespace: 'sandbox-file' };
      });

      buildContext.onLoad({ filter: /.*/, namespace: 'optional-missing' }, () => ({
        contents: 'throw new Error("optional dependency unavailable");',
        loader: 'js',
      }));

      buildContext.onLoad({ filter: /.*/, namespace: 'sandbox-file' }, async (args) => {
        const loader = loaderByExtension.get(path.extname(args.path).toLowerCase());
        if (!loader) throw new Error(`No loader configured for ${args.path}`);

        if (args.path === indexCssPath) {
          const source = await readFile(args.path, 'utf8');
          const processed = await postcss([
            tailwindcss(tailwindConfig),
            autoprefixer(),
          ]).process(source, { from: args.path });
          return { contents: processed.css, loader };
        }

        return { contents: await readFile(args.path), loader };
      });
    },
  };
}

async function directorySize(directory) {
  const entries = (await readdir(directory, { withFileTypes: true }))
    .sort((left, right) => left.name.localeCompare(right.name));

  let bytes = 0;
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    bytes += entry.isDirectory()
      ? await directorySize(entryPath)
      : (await stat(entryPath)).size;
  }
  return bytes;
}

if (path.dirname(outDir) !== projectRoot) {
  throw new Error(`Refusing to replace unexpected output path: ${outDir}`);
}

await rm(outDir, { recursive: true, force: true });
await cp(path.join(projectRoot, 'public'), outDir, { recursive: true });

const clientEnv = await loadClientEnv();
const missingClientKeys = [
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_URL',
].filter((key) => !clientEnv[key]);
if (missingClientKeys.length > 0) {
  throw new Error(
    `AIT build is missing required client configuration: ${missingClientKeys.join(', ')}`,
  );
}
const buildResult = await build({
  entryPoints: ['ait-entry'],
  outdir: outDir,
  entryNames: 'assets/app-[hash]',
  assetNames: 'assets/[name]-[hash]',
  bundle: true,
  charset: 'utf8',
  define: {
    'import.meta.env': JSON.stringify(clientEnv),
    'process.env.NODE_ENV': '"production"',
  },
  format: 'esm',
  legalComments: 'eof',
  minify: true,
  platform: 'browser',
  plugins: [sandboxFilesPlugin()],
  target: ['es2015', 'safari12', 'chrome87', 'firefox78', 'edge88'],
  write: false,
});

for (const outputFile of buildResult.outputFiles) {
  const relativeOutputPath = path.relative(outDir, outputFile.path);
  if (relativeOutputPath.startsWith('..') || path.isAbsolute(relativeOutputPath)) {
    throw new Error(`Refusing to write output outside dist-ait: ${outputFile.path}`);
  }
  await mkdir(path.dirname(outputFile.path), { recursive: true });
  await writeFile(outputFile.path, outputFile.contents);
}

const appScript = buildResult.outputFiles.find((file) => file.path.endsWith('.js'));
const appStyles = buildResult.outputFiles.find((file) => file.path.endsWith('.css'));
if (!appScript || !appStyles) {
  throw new Error('AIT web build did not produce both JavaScript and CSS outputs.');
}

const outputUrl = (file) => `/${path.relative(outDir, file.path).split(path.sep).join('/')}`;
const sourceIndexHtml = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
const entryTagPattern = /<script\s+type="module"\s+src="\/src\/main\.jsx"><\/script>/;
if (!entryTagPattern.test(sourceIndexHtml)) {
  throw new Error('Could not locate the Vite entry script in index.html.');
}
const builtIndexHtml = sourceIndexHtml.replace(
  entryTagPattern,
  `<link rel="stylesheet" href="${outputUrl(appStyles)}" />\n    `
    + `<script type="module" src="${outputUrl(appScript)}"></script>`,
);
await writeFile(path.join(outDir, 'index.html'), builtIndexHtml, 'utf8');

const rootEntries = (await readdir(outDir, { withFileTypes: true }))
  .sort((left, right) => left.name.localeCompare(right.name));
const rootFileNames = new Set(
  rootEntries.filter((entry) => entry.isFile()).map((entry) => entry.name),
);

for (const activeMap of ACTIVE_MAP_ASSETS) {
  if (!rootFileNames.has(activeMap)) {
    throw new Error(`AIT build is missing active StampTour map: ${activeMap}`);
  }
}

const prunedMaps = rootEntries
  .filter((entry) => (
    entry.isFile()
    && MAP_ASSET_PATTERN.test(entry.name)
    && !ACTIVE_MAP_ASSETS.has(entry.name)
  ))
  .map((entry) => entry.name);

for (const mapAsset of prunedMaps) {
  await rm(path.join(outDir, mapAsset));
}

const uncompressedBytes = await directorySize(outDir);

console.log(`[ait:web] Pruned ${prunedMaps.length} inactive StampTour map(s).`);
console.log(
  `[ait:web] Uncompressed web payload: ${formatMiB(uncompressedBytes)} `
  + `(${uncompressedBytes} bytes); budget: ${formatMiB(MAX_WEB_BYTES)}.`,
);

if (uncompressedBytes > MAX_WEB_BYTES) {
  throw new Error(
    `AIT web payload exceeds its ${formatMiB(MAX_WEB_BYTES)} budget by `
    + `${formatMiB(uncompressedBytes - MAX_WEB_BYTES)}.`,
  );
}
