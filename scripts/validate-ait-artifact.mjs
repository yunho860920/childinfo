import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AITReader } from '@apps-in-toss/ait-format';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactPath = path.resolve(
  projectRoot,
  process.argv[2] || 'myfirstinfantcare.ait',
);
const MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024;
const EXPECTED_APP_NAME = 'myfirstinfantcare';
const REQUIRED_ENTRIES = [
  'web/index.html',
  'web/data/facilities-v2.json',
];

const bytes = await readFile(artifactPath);
const reader = AITReader.fromBuffer(bytes);
const entries = reader.listEntries();
const normalizedEntries = entries.map((entry) => entry.replace(/\\/g, '/'));
const entryNames = new Set(normalizedEntries);

if (reader.appName !== EXPECTED_APP_NAME) {
  throw new Error(`Unexpected AIT app name: ${reader.appName}`);
}
for (const requiredEntry of REQUIRED_ENTRIES) {
  if (!entryNames.has(requiredEntry)) {
    throw new Error(`AIT artifact is missing required entry: ${requiredEntry}`);
  }
}
const appScriptIndex = normalizedEntries.findIndex(
  (entry) => /^web\/assets\/app-.*\.js$/.test(entry),
);
if (appScriptIndex === -1) {
  throw new Error('AIT artifact is missing the built web application script.');
}
if (!normalizedEntries.some((entry) => /^web\/assets\/app-.*\.css$/.test(entry))) {
  throw new Error('AIT artifact is missing the built web application styles.');
}

const appScript = new TextDecoder('utf-8', { fatal: true }).decode(
  await reader.readEntry(entries[appScriptIndex]),
);
const brokenRechartsDefaultImport = /\{CartesianGrid:[^}]{0,512}\}=[\w$]+\.default(?:[;,])/;
if (brokenRechartsDefaultImport.test(appScript)) {
  throw new Error(
    'AIT artifact contains the Recharts UMD default-import startup crash.',
  );
}

const uncompressedBytes = reader.bundle.index.reduce(
  (total, entry) => total + Number(entry.uncompressedSize),
  0,
);
if (!Number.isSafeInteger(uncompressedBytes)) {
  throw new Error('AIT artifact uncompressed size is not a safe integer.');
}
if (uncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
  throw new Error(
    `AIT artifact exceeds 100 MiB uncompressed: ${uncompressedBytes} bytes.`,
  );
}

const sha256 = createHash('sha256').update(bytes).digest('hex');
const formatMiB = (value) => `${(value / (1024 * 1024)).toFixed(2)} MiB`;

console.log(`[ait:validate] deploymentId: ${reader.deploymentId}`);
console.log(`[ait:validate] entries: ${entries.length}`);
console.log(
  `[ait:validate] compressed: ${formatMiB(bytes.length)}; `
  + `uncompressed: ${formatMiB(uncompressedBytes)} / 100.00 MiB`,
);
console.log(`[ait:validate] sha256: ${sha256}`);
