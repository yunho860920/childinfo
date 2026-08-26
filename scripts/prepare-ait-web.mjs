import { mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(projectRoot, 'dist-ait');
const webDir = path.join(outDir, 'web');

if (path.dirname(outDir) !== projectRoot || path.dirname(webDir) !== outDir) {
  throw new Error(`Refusing to prepare unexpected output path: ${webDir}`);
}

const outputEntries = (await readdir(outDir, { withFileTypes: true }))
  .sort((left, right) => left.name.localeCompare(right.name));
if (!outputEntries.some((entry) => entry.isFile() && entry.name === 'index.html')) {
  throw new Error('AIT web output is missing dist-ait/index.html.');
}

await mkdir(webDir);
for (const entry of outputEntries) {
  if (entry.name === 'web') continue;
  await rename(path.join(outDir, entry.name), path.join(webDir, entry.name));
}

const webEntries = await readdir(webDir);
if (!webEntries.includes('index.html')) {
  throw new Error('AIT prepared output is missing dist-ait/web/index.html.');
}

console.log(`[ait:prepare] Prepared ${webEntries.length} web root entries in ${webDir}`);
