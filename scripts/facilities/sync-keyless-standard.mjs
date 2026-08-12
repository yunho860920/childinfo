import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  dedupeFacilities,
  validateFacilityRecord
} from '../../src/domain/facilities/facilitySchema.js';
import { PUBLIC_SOURCE_ADAPTERS } from '../../src/domain/facilities/publicSourceAdapters.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outputDirectory = path.join(root, 'data', 'facilities-v2');
const portalOrigin = 'https://www.data.go.kr';
const collectedAt = new Date().toISOString();
const rollbackStamp = collectedAt.replace(/[:.]/g, '-');

const STANDARD_SOURCES = Object.freeze([
  { sourceId: 'city-parks', publicDataPk: '15012890', category: '놀이·체험' },
  { sourceId: 'community-child-centers', publicDataPk: '15129438', category: '돌봄·지원센터' },
  { sourceId: 'museums-art-museums', publicDataPk: '15017323', category: '놀이·체험' },
  { sourceId: 'libraries', publicDataPk: '15013109', category: '놀이·체험' },
  { sourceId: 'cultural-festivals', publicDataPk: '15013104', category: '놀이·체험' },
  { sourceId: 'mental-health-centers', publicDataPk: '15021137', category: '병원·상담' },
  { sourceId: 'developmental-rehab', publicDataPk: '15155702', category: '병원·상담' }
]);

const requestedSourceIds = new Set(process.argv.slice(2));
const selectedSources = requestedSourceIds.size
  ? STANDARD_SOURCES.filter((source) => requestedSourceIds.has(source.sourceId))
  : [...STANDARD_SOURCES];

if (selectedSources.length === 0) {
  console.error(`Unknown source. Available: ${STANDARD_SOURCES.map((source) => source.sourceId).join(', ')}`);
  process.exit(1);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchJson(url, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Referer: `${portalOrigin}/`,
          'User-Agent': 'Childinfo facility updater/2.0'
        },
        signal: AbortSignal.timeout(180_000)
      });
      const body = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${body.slice(0, 160)}`);
      try {
        return JSON.parse(body);
      } catch {
        throw new Error(`Non-JSON response: ${body.slice(0, 160)}`);
      }
    } catch (error) {
      lastError = error;
      if (attempt < 3) await delay(attempt * 2_000);
    }
  }
  throw new Error(`${label} failed after 3 attempts: ${lastError?.message || lastError}`);
}

function getPayloadRows(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ['value', 'rows', 'records', 'data']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function translateRows(rows, header) {
  const namesByCode = new Map(header.columList.map((column) => [column.columCode, column.columNm]));
  return rows.map((row) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [namesByCode.get(key) || key, value])
  ));
}

async function fetchStandardRows(source) {
  const headerUrl = new URL('/download/columList.json', portalOrigin);
  headerUrl.searchParams.set('pk', source.publicDataPk);
  headerUrl.searchParams.set('ext', 'JSON');
  const header = await fetchJson(headerUrl, `${source.sourceId} header`);
  const totalCount = Number(header.totalCount || 0);

  if (!header?.tableVO?.svcTableNm || !Array.isArray(header?.tableVO?.colNmList)) {
    throw new Error(`${source.sourceId}: public download metadata is incomplete.`);
  }
  if (totalCount < 1) throw new Error(`${source.sourceId}: source has no rows.`);
  if (totalCount > 50_000) {
    throw new Error(`${source.sourceId}: ${totalCount} rows exceed the portal's keyless download limit.`);
  }

  const perPage = 10_000;
  const pageCount = Math.ceil(totalCount / perPage);
  const rows = [];
  for (let page = 1; page <= pageCount; page += 1) {
    const dataUrl = new URL('/download/standard.json', portalOrigin);
    dataUrl.searchParams.set('publicDataPk', source.publicDataPk);
    for (const columnName of header.tableVO.colNmList) {
      dataUrl.searchParams.append('colNmList', columnName);
    }
    dataUrl.searchParams.set('totalCount', String(totalCount));
    dataUrl.searchParams.set('svcTableNm', header.tableVO.svcTableNm);
    dataUrl.searchParams.set('perPage', String(perPage));
    dataUrl.searchParams.set('page', String(page));
    const payload = await fetchJson(dataUrl, `${source.sourceId} page ${page}/${pageCount}`);
    rows.push(...getPayloadRows(payload));
  }

  if (rows.length !== totalCount) {
    throw new Error(`${source.sourceId}: expected ${totalCount} rows but received ${rows.length}.`);
  }

  return {
    rows: translateRows(rows, header),
    sourceName: header.fileName,
    totalCount,
    pageCount,
    columns: header.columList.map((column) => column.columNm)
  };
}

function writeJsonAtomically(targetPath, value) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value)}\n`, 'utf8');
  fs.renameSync(temporaryPath, targetPath);
}

function readPreviousSnapshot(outputPath) {
  if (!fs.existsSync(outputPath)) return null;
  return JSON.parse(fs.readFileSync(outputPath, 'utf8'));
}

function assertNoUnexpectedDrop(sourceId, previous, currentCount) {
  const previousCount = previous?.records?.length || previous?.counts?.records || 0;
  if (previousCount >= 20 && currentCount < previousCount * 0.75) {
    throw new Error(`${sourceId}: record count dropped from ${previousCount} to ${currentCount}; keeping the previous snapshot.`);
  }
}

function preservePreviousSnapshot(outputPath) {
  if (!fs.existsSync(outputPath)) return null;
  const rollbackDirectory = path.join(outputDirectory, 'rollback', rollbackStamp);
  fs.mkdirSync(rollbackDirectory, { recursive: true });
  const rollbackPath = path.join(rollbackDirectory, path.basename(outputPath));
  fs.copyFileSync(outputPath, rollbackPath);
  return path.relative(root, rollbackPath).replaceAll('\\', '/');
}

async function syncSource(source) {
  const adapter = PUBLIC_SOURCE_ADAPTERS[source.sourceId];
  if (!adapter) throw new Error(`${source.sourceId}: adapter is missing.`);

  console.log(`[facility-keyless] fetching ${source.sourceId}`);
  const fetched = await fetchStandardRows(source);
  const includedRows = adapter.include ? fetched.rows.filter(adapter.include) : fetched.rows;
  const normalized = includedRows.map((row) => adapter.normalize(row, { collectedAt }));
  const invalid = normalized
    .map((record) => ({ id: record.id, errors: validateFacilityRecord(record) }))
    .filter((result) => result.errors.length > 0);
  const { records, duplicates } = dedupeFacilities(normalized);
  const reviewRequired = records.filter((record) => record.status === 'review_required').length;

  if (invalid.length > Math.max(5, Math.ceil(normalized.length * 0.05))) {
    throw new Error(`${source.sourceId}: ${invalid.length}/${normalized.length} records failed validation.`);
  }

  const outputPath = path.join(outputDirectory, `${source.sourceId}.snapshot.json`);
  assertNoUnexpectedDrop(source.sourceId, readPreviousSnapshot(outputPath), records.length);
  const rollbackFile = preservePreviousSnapshot(outputPath);
  const snapshot = {
    schemaVersion: 2,
    source: source.sourceId,
    sourceName: fetched.sourceName,
    sourceUrl: `${portalOrigin}/data/${source.publicDataPk}/standard.do`,
    accessMethod: 'public-standard-download-no-key',
    collectedAt,
    category: source.category,
    columns: fetched.columns,
    counts: {
      sourceRows: fetched.totalCount,
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
  console.log(`[facility-keyless] wrote ${path.relative(root, outputPath)} (${records.length} records)`);
  return {
    sourceId: source.sourceId,
    sourceName: fetched.sourceName,
    category: source.category,
    outputFile: path.relative(root, outputPath).replaceAll('\\', '/'),
    rollbackFile,
    counts: snapshot.counts
  };
}

async function runWorkers(sources, concurrency = 2) {
  const results = [];
  let cursor = 0;
  async function worker() {
    while (cursor < sources.length) {
      const source = sources[cursor];
      cursor += 1;
      try {
        results.push({ status: 'fulfilled', value: await syncSource(source) });
      } catch (error) {
        console.error(`[facility-keyless] ${source.sourceId} failed: ${error.message}`);
        results.push({ status: 'rejected', sourceId: source.sourceId, reason: error.message });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, sources.length) }, () => worker()));
  return results;
}

fs.mkdirSync(outputDirectory, { recursive: true });
const results = await runWorkers(selectedSources);
const succeeded = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
const failed = results.filter((result) => result.status === 'rejected');
const report = {
  schemaVersion: 2,
  collectedAt,
  accessMethod: 'public-standard-download-no-key',
  selectedSources: selectedSources.map((source) => source.sourceId),
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
writeJsonAtomically(path.join(outputDirectory, 'keyless-sync-report.json'), report);
console.log(`[facility-keyless] completed ${succeeded.length}/${selectedSources.length} sources (${report.totals.records} records)`);

if (failed.length) process.exit(1);
