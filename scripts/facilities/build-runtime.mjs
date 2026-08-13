import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const snapshotDirectory = path.join(root, 'data', 'facilities-v2');
const outputPath = path.join(root, 'public', 'data', 'facilities-v2.json');
const allowedStatuses = new Set(['active', 'unknown', 'paused']);

function increment(target, key) {
  target[key] = (target[key] || 0) + 1;
}

function toRuntimeRecord(record) {
  return {
    id: record.id,
    name: record.name,
    type: record.category,
    subtype: record.subtype,
    status: record.status,
    region: record.region,
    subRegion: record.subRegion,
    dong: record.dong,
    address: record.address,
    lat: record.latitude,
    lng: record.longitude,
    phone: record.phone,
    homepage: record.homepage,
    mapUrl: record.mapUrl,
    source: record.source,
    sourceUpdatedAt: record.provenance?.sourceUpdatedAt || null
  };
}

const snapshotFiles = fs.readdirSync(snapshotDirectory)
  .filter((name) => name.endsWith('.snapshot.json'))
  .sort();
const snapshots = snapshotFiles.map((name) => JSON.parse(
  fs.readFileSync(path.join(snapshotDirectory, name), 'utf8')
));
const sourceCollectedAt = snapshots
  .map((snapshot) => snapshot.collectedAt)
  .filter(Boolean)
  .sort()
  .at(-1) || null;
const excludedByStatus = {};
const byCategory = {};
const bySource = {};
const records = [];

for (const snapshot of snapshots) {
  for (const record of snapshot.records || []) {
    if (!allowedStatuses.has(record.status)) {
      increment(excludedByStatus, record.status || 'missing');
      continue;
    }
    const runtimeRecord = toRuntimeRecord(record);
    records.push(runtimeRecord);
    increment(byCategory, runtimeRecord.type);
    increment(bySource, snapshot.source);
  }
}

records.sort((left, right) => (
  left.region.localeCompare(right.region, 'ko')
  || left.subRegion.localeCompare(right.subRegion, 'ko')
  || left.name.localeCompare(right.name, 'ko')
));

const payload = {
  schemaVersion: 2,
  sourceCollectedAt,
  counts: {
    sources: snapshots.length,
    records: records.length,
    byCategory,
    bySource,
    excludedByStatus
  },
  records
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload)}\n`, 'utf8');
console.log(`[facility-runtime] wrote ${path.relative(root, outputPath)} (${records.length} records)`);
