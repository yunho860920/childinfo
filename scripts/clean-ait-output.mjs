import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(projectRoot, 'dist-ait');

if (path.dirname(outDir) !== projectRoot) {
  throw new Error(`Refusing to clean unexpected output path: ${outDir}`);
}

await rm(outDir, { recursive: true, force: true });
console.log(`[ait:clean] Removed ${outDir}`);
