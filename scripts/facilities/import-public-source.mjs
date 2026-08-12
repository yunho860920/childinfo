import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  dedupeFacilities,
  validateFacilityRecord
} from '../../src/domain/facilities/facilitySchema.js';
import { PUBLIC_SOURCE_ADAPTERS } from '../../src/domain/facilities/publicSourceAdapters.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const sourceId = args[0];
const inputArg = args[1];
const adapter = PUBLIC_SOURCE_ADAPTERS[sourceId];

if (!adapter || !inputArg) {
  console.error(`Usage: npm run facilities:import -- <source> <input.json>\nSources: ${Object.keys(PUBLIC_SOURCE_ADAPTERS).join(', ')}`);
  process.exit(1);
}

const inputPath = path.resolve(root, inputArg);
const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

function findRows(value, depth = 0) {
  if (depth > 8 || value === null || value === undefined) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'object') return [];

  for (const key of ['rows', 'data', 'items', 'item', 'records']) {
    if (Array.isArray(value[key])) return value[key];
  }
  for (const key of ['response', 'body', 'result']) {
    const nested = findRows(value[key], depth + 1);
    if (nested.length) return nested;
  }
  return [];
}

const sourceRows = findRows(payload);
const includedRows = adapter.include ? sourceRows.filter(adapter.include) : sourceRows;
const collectedAt = new Date().toISOString();
const normalized = includedRows.map((row) => adapter.normalize(row, { collectedAt }));
const invalid = normalized
  .map((record) => ({ id: record.id, errors: validateFacilityRecord(record) }))
  .filter((result) => result.errors.length > 0);
const { records, duplicates } = dedupeFacilities(normalized);

if (sourceRows.length === 0) throw new Error('No rows were found in the source JSON.');
if (invalid.length > Math.max(5, Math.ceil(normalized.length * 0.05))) {
  throw new Error(`Import blocked: ${invalid.length}/${normalized.length} records failed validation.`);
}

const outputPath = path.join(root, 'data', 'facilities-v2', `${sourceId}.snapshot.json`);
const snapshot = {
  schemaVersion: 2,
  source: sourceId,
  collectedAt,
  inputFile: path.basename(inputPath),
  counts: {
    sourceRows: sourceRows.length,
    includedRows: includedRows.length,
    records: records.length,
    duplicates: duplicates.length,
    invalid: invalid.length
  },
  invalid,
  duplicates,
  records
};

fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
console.log(`[facility-import] wrote ${path.relative(root, outputPath)} (${records.length} records)`);
