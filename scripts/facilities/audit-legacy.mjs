import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
  buildFacilityDedupeKey,
  normalizeFacility,
  validateFacilityRecord
} from '../../src/domain/facilities/facilitySchema.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const infrastructureRoot = path.join(root, 'src', 'data', 'infrastructure');
const outputPath = path.join(root, 'data', 'facilities-v2', 'legacy-audit.json');
const shouldWrite = process.argv.includes('--write');

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function loadDirectExports(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  if (/^\s*import\s/m.test(source)) return [];

  const transformed = source.replace(
    /\bexport\s+const\s+([\p{ID_Start}_$][\p{ID_Continue}$]*)\s*=/gu,
    (_match, identifier) => `exports[${JSON.stringify(identifier)}] =`
  );
  const sandbox = { exports: Object.create(null) };
  vm.runInNewContext(transformed, sandbox, { filename: filePath, timeout: 1000 });
  return Object.values(sandbox.exports).flatMap((value) => Array.isArray(value) ? value : []);
}

function increment(target, key) {
  const normalizedKey = key || '(없음)';
  target[normalizedKey] = (target[normalizedKey] || 0) + 1;
}

const files = listFiles(infrastructureRoot).filter((file) => file.endsWith('.js'));
const records = [];
const fileHashes = [];
const parseErrors = [];

for (const file of files) {
  const relativePath = path.relative(root, file).replaceAll('\\', '/');
  const bytes = fs.readFileSync(file);
  fileHashes.push({
    path: relativePath,
    bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex')
  });

  try {
    for (const raw of loadDirectExports(file)) {
      if (!raw || typeof raw !== 'object' || !raw.name) continue;
      records.push({ raw, relativePath });
    }
  } catch (error) {
    parseErrors.push({ path: relativePath, error: error.message });
  }
}

const rawTypes = {};
const rawRegions = {};
const normalizedCategories = {};
const normalizedRegions = {};
const exactKeys = new Map();
let missingAddress = 0;
let missingCoordinates = 0;
let reviewRequired = 0;
let invalidRecords = 0;

for (const { raw, relativePath } of records) {
  increment(rawTypes, raw.type);
  increment(rawRegions, raw.region);
  if (!raw.address) missingAddress += 1;

  const normalized = normalizeFacility(raw, {
    legacyId: raw.id,
    collectedAt: '2026-08-11T00:00:00.000Z'
  });
  increment(normalizedCategories, normalized.category);
  increment(normalizedRegions, normalized.region);
  if (normalized.latitude === null || normalized.longitude === null) missingCoordinates += 1;
  if (normalized.status === 'review_required') reviewRequired += 1;
  if (validateFacilityRecord(normalized).length > 0) invalidRecords += 1;

  const key = buildFacilityDedupeKey({
    ...normalized,
    id: null,
    source: null,
    sourceId: null,
    provenance: null
  });
  const matches = exactKeys.get(key) || [];
  matches.push({ id: raw.id || null, name: raw.name, address: raw.address || null, path: relativePath });
  exactKeys.set(key, matches);
}

const duplicateGroups = Array.from(exactKeys.entries())
  .filter(([, matches]) => matches.length > 1)
  .map(([key, matches]) => ({ key, count: matches.length, matches }));

const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  scope: 'legacy-read-only-audit',
  files: {
    scanned: files.length,
    parsedWithDirectExports: files.length - parseErrors.length,
    parseErrors
  },
  records: {
    total: records.length,
    missingAddress,
    missingCoordinates,
    reviewRequired,
    invalidRecords,
    duplicateGroups: duplicateGroups.length,
    duplicateRecordsBeyondFirst: duplicateGroups.reduce((sum, group) => sum + group.count - 1, 0)
  },
  distributions: {
    rawTypes,
    rawRegions,
    normalizedCategories,
    normalizedRegions
  },
  duplicateGroups,
  fileHashes
};

if (shouldWrite) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`[facility-audit] wrote ${path.relative(root, outputPath)}`);
}

console.log(JSON.stringify({ files: report.files, records: report.records }, null, 2));
