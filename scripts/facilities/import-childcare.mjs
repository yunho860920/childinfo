import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  dedupeFacilities,
  validateFacilityRecord
} from '../../src/domain/facilities/facilitySchema.js';
import {
  extractChildcareRows,
  normalizeChildcareRecord,
  parseFlatChildcareXml
} from '../../src/domain/facilities/childcareAdapter.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const inputArg = args.find((arg) => !arg.startsWith('--'));
const outputFlagIndex = args.indexOf('--output');
const outputPath = outputFlagIndex >= 0 && args[outputFlagIndex + 1]
  ? path.resolve(root, args[outputFlagIndex + 1])
  : path.join(root, 'data', 'facilities-v2', 'childcare.snapshot.json');

if (!inputArg) {
  console.error('Usage: npm run facilities:import:childcare -- <input.json|input.xml> [--output <path>]');
  process.exit(1);
}

const inputPath = path.resolve(root, inputArg);
const extension = path.extname(inputPath).toLowerCase();
const rawText = fs.readFileSync(inputPath, 'utf8');
let rows;

if (extension === '.xml') {
  rows = parseFlatChildcareXml(rawText);
} else {
  rows = extractChildcareRows(JSON.parse(rawText));
}

const collectedAt = new Date().toISOString();
const normalized = rows.map((row) => normalizeChildcareRecord(row, { collectedAt }));
const invalid = normalized
  .map((record) => ({ id: record.id, errors: validateFacilityRecord(record) }))
  .filter((result) => result.errors.length > 0);
const { records, duplicates } = dedupeFacilities(normalized);

if (rows.length === 0) {
  throw new Error('No childcare rows were found in the source file.');
}
if (invalid.length > Math.max(5, Math.ceil(normalized.length * 0.05))) {
  throw new Error(`Import blocked: ${invalid.length}/${normalized.length} records failed validation.`);
}

const snapshot = {
  schemaVersion: 2,
  category: '어린이집',
  source: 'childcare-info-portal',
  collectedAt,
  inputFile: path.basename(inputPath),
  counts: {
    sourceRows: rows.length,
    records: records.length,
    duplicates: duplicates.length,
    invalid: invalid.length
  },
  invalid,
  duplicates,
  records
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
console.log(`[facility-import] wrote ${path.relative(root, outputPath)} (${records.length} records)`);
