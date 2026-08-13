import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  dedupeFacilities,
  validateFacilityRecord
} from '../../src/domain/facilities/facilitySchema.js';
import { parseFlatChildcareXml } from '../../src/domain/facilities/childcareAdapter.js';
import { PUBLIC_SOURCE_ADAPTERS } from '../../src/domain/facilities/publicSourceAdapters.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outputDirectory = path.join(root, 'data', 'facilities-v2');
const collectedAt = new Date().toISOString();
const rollbackStamp = collectedAt.replace(/[:.]/g, '-');

const KEYED_SOURCES = Object.freeze({
  'nursing-rooms': {
    category: '유아휴게소',
    sourceName: '수유정보 알리미 전국 수유시설',
    sourceUrl: 'https://www.sooyusil.com/home',
    apiUrl: 'https://sooyusil.com/api/nursingRoomJSON.do',
    envName: 'NURSING_API_KEY',
    keyParam: 'confirmApiKey',
    paginated: false,
    getRows: (payload) => payload?.roomList || []
  },
  'hira-pediatrics': {
    category: '병원·상담',
    sourceName: '건강보험심사평가원 소아청소년과 병원정보',
    sourceUrl: 'https://www.data.go.kr/data/15001698/openapi.do',
    apiUrl: 'https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList',
    envName: 'HIRA_API_KEY',
    fallbackEnvName: 'PUBLIC_DATA_API_KEY',
    keyParam: 'ServiceKey',
    paginated: true,
    defaults: { dgsbjtCd: '11', _type: 'json' }
  },
  'tour-api': {
    category: '놀이·체험',
    sourceName: '한국관광공사 국문 관광정보 서비스',
    sourceUrl: 'https://www.data.go.kr/data/15101578/openapi.do',
    apiUrl: 'https://apis.data.go.kr/B551011/KorService2/areaBasedList2',
    envName: 'TOUR_API_KEY',
    fallbackEnvName: 'PUBLIC_DATA_API_KEY',
    keyParam: 'serviceKey',
    paginated: true,
    defaults: { MobileOS: 'ETC', MobileApp: 'Childinfo', _type: 'json', arrange: 'A' }
  }
});

const requestedSourceIds = process.argv.slice(2);
const selectedSourceIds = requestedSourceIds.length
  ? requestedSourceIds
  : Object.keys(KEYED_SOURCES);

for (const sourceId of selectedSourceIds) {
  if (!KEYED_SOURCES[sourceId]) {
    console.error(`Unknown source: ${sourceId}. Available: ${Object.keys(KEYED_SOURCES).join(', ')}`);
    process.exit(1);
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function decodedKey(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function fetchText(url, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json, application/xml;q=0.9, text/xml;q=0.8' },
        signal: AbortSignal.timeout(180_000)
      });
      const body = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${body.slice(0, 160)}`);
      if (/SERVICE_KEY_IS_NOT_REGISTERED_ERROR|SERVICE ACCESS DENIED/i.test(body)) {
        throw new Error('the API key is not approved for this service.');
      }
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await delay(attempt * 2_000);
    }
  }
  throw new Error(`${label} failed after 3 attempts: ${lastError?.message || lastError}`);
}

function parsePayload(body) {
  try {
    return JSON.parse(body);
  } catch {
    return {
      response: {
        body: {
          items: { item: parseFlatChildcareXml(body) },
          totalCount: Number(body.match(/<totalCount>(\d+)<\/totalCount>/)?.[1] || 0)
        }
      }
    };
  }
}

function nestedValue(value, paths) {
  for (const keys of paths) {
    let current = value;
    for (const key of keys) current = current?.[key];
    if (current !== undefined && current !== null) return current;
  }
  return null;
}

function standardRows(payload) {
  const rows = nestedValue(payload, [
    ['response', 'body', 'items', 'item'],
    ['response', 'body', 'items'],
    ['body', 'items', 'item'],
    ['items', 'item'],
    ['items']
  ]);
  if (!rows) return [];
  return Array.isArray(rows) ? rows : [rows];
}

function totalCount(payload, fallback) {
  const raw = nestedValue(payload, [
    ['response', 'body', 'totalCount'],
    ['body', 'totalCount'],
    ['totalCount']
  ]);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

async function fetchSourceRows(sourceId, config) {
  const key = decodedKey(process.env[config.envName] || process.env[config.fallbackEnvName] || '');
  if (!key) throw new Error(`${config.envName} is not configured.`);

  if (!config.paginated) {
    const url = new URL(config.apiUrl);
    url.searchParams.set(config.keyParam, key);
    const payload = parsePayload(await fetchText(url, sourceId));
    const rawRows = config.getRows(payload);
    const rows = Array.isArray(rawRows) ? rawRows : rawRows ? [rawRows] : [];
    if (!rows.length) throw new Error(`${sourceId}: no rows were returned.`);
    return rows;
  }

  const rows = [];
  const perPage = 1000;
  let expectedTotal = null;
  for (let pageNo = 1; expectedTotal === null || rows.length < expectedTotal; pageNo += 1) {
    const url = new URL(config.apiUrl);
    url.searchParams.set(config.keyParam, key);
    url.searchParams.set('pageNo', String(pageNo));
    url.searchParams.set('numOfRows', String(perPage));
    for (const [name, value] of Object.entries(config.defaults || {})) url.searchParams.set(name, value);
    const payload = parsePayload(await fetchText(url, `${sourceId} page ${pageNo}`));
    const pageRows = standardRows(payload);
    if (expectedTotal === null) expectedTotal = totalCount(payload, pageRows.length);
    rows.push(...pageRows);
    if (!pageRows.length || pageRows.length < perPage) break;
    if (pageNo >= 100) throw new Error(`${sourceId}: pagination exceeded the safety limit.`);
  }
  if (!rows.length) throw new Error(`${sourceId}: no rows were returned.`);
  if (expectedTotal !== null && rows.length < expectedTotal) {
    throw new Error(`${sourceId}: expected ${expectedTotal} rows but received ${rows.length}.`);
  }
  return rows;
}

function writeJsonAtomically(targetPath, value) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value)}\n`, 'utf8');
  fs.renameSync(temporaryPath, targetPath);
}

function preservePreviousSnapshot(outputPath) {
  if (!fs.existsSync(outputPath)) return null;
  const rollbackDirectory = path.join(outputDirectory, 'rollback', rollbackStamp);
  fs.mkdirSync(rollbackDirectory, { recursive: true });
  const rollbackPath = path.join(rollbackDirectory, path.basename(outputPath));
  fs.copyFileSync(outputPath, rollbackPath);
  return path.relative(root, rollbackPath).replaceAll('\\', '/');
}

function assertNoUnexpectedDrop(sourceId, outputPath, currentCount) {
  if (!fs.existsSync(outputPath)) return;
  const previous = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  const previousCount = previous?.records?.length || previous?.counts?.records || 0;
  if (previousCount >= 20 && currentCount < previousCount * 0.75) {
    throw new Error(`${sourceId}: record count dropped from ${previousCount} to ${currentCount}; keeping the previous snapshot.`);
  }
}

async function syncSource(sourceId) {
  const config = KEYED_SOURCES[sourceId];
  const adapter = PUBLIC_SOURCE_ADAPTERS[sourceId];
  if (!adapter) throw new Error(`${sourceId}: adapter is missing.`);
  console.log(`[facility-keyed] fetching ${sourceId}`);
  const sourceRows = await fetchSourceRows(sourceId, config);
  const includedRows = adapter.include ? sourceRows.filter(adapter.include) : sourceRows;
  const normalized = includedRows.map((row) => adapter.normalize(row, { collectedAt }));
  const validationResults = normalized.map((record) => ({
    record,
    errors: validateFacilityRecord(record)
  }));
  const invalid = validationResults
    .filter((result) => result.errors.length > 0)
    .map(({ record, errors }) => ({ id: record.id, errors }));
  const validRecords = validationResults
    .filter((result) => result.errors.length === 0)
    .map((result) => result.record);
  const { records, duplicates } = dedupeFacilities(validRecords);
  const reviewRequired = records.filter((record) => record.status === 'review_required').length;
  if (invalid.length > Math.max(5, Math.ceil(normalized.length * 0.05))) {
    throw new Error(`${sourceId}: ${invalid.length}/${normalized.length} records failed validation.`);
  }

  const outputPath = path.join(outputDirectory, `${sourceId}.snapshot.json`);
  assertNoUnexpectedDrop(sourceId, outputPath, records.length);
  const rollbackFile = preservePreviousSnapshot(outputPath);
  const snapshot = {
    schemaVersion: 2,
    source: sourceId,
    sourceName: config.sourceName,
    sourceUrl: config.sourceUrl,
    accessMethod: 'approved-api-key',
    collectedAt,
    category: config.category,
    counts: {
      sourceRows: sourceRows.length,
      includedRows: includedRows.length,
      records: records.length,
      duplicates: duplicates.length,
      invalid: invalid.length,
      reviewRequired
    },
    invalid,
    duplicates,
    records
  };
  writeJsonAtomically(outputPath, snapshot);
  console.log(`[facility-keyed] wrote ${path.relative(root, outputPath)} (${records.length} records)`);
  return {
    sourceId,
    sourceName: config.sourceName,
    category: config.category,
    outputFile: path.relative(root, outputPath).replaceAll('\\', '/'),
    rollbackFile,
    counts: snapshot.counts
  };
}

const succeeded = [];
const failed = [];
for (const sourceId of selectedSourceIds) {
  try {
    succeeded.push(await syncSource(sourceId));
  } catch (error) {
    console.error(`[facility-keyed] ${sourceId} failed: ${error.message}`);
    failed.push({ sourceId, reason: error.message });
  }
}

const report = {
  schemaVersion: 2,
  collectedAt,
  accessMethod: 'approved-api-key',
  selectedSources: selectedSourceIds,
  succeeded,
  failed,
  totals: succeeded.reduce((totals, source) => ({
    sourceRows: totals.sourceRows + source.counts.sourceRows,
    includedRows: totals.includedRows + source.counts.includedRows,
    records: totals.records + source.counts.records,
    invalid: totals.invalid + source.counts.invalid,
    reviewRequired: totals.reviewRequired + source.counts.reviewRequired
  }), { sourceRows: 0, includedRows: 0, records: 0, invalid: 0, reviewRequired: 0 })
};
writeJsonAtomically(path.join(outputDirectory, 'keyed-sync-report.json'), report);
console.log(`[facility-keyed] completed ${succeeded.length}/${selectedSourceIds.length} sources (${report.totals.records} records)`);
if (failed.length) process.exit(1);
