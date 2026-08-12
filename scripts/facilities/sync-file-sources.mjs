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

const FILE_SOURCES = Object.freeze([
  { sourceId: 'shared-childcare', publicDataPk: '15055830', category: '가족센터' },
  { sourceId: 'family-counseling', publicDataPk: '15042341', category: '병원·상담' },
  { sourceId: 'youth-counseling-centers', publicDataPk: '15088388', category: '병원·상담' }
]);

const requestedSourceIds = new Set(process.argv.slice(2));
const selectedSources = requestedSourceIds.size
  ? FILE_SOURCES.filter((source) => requestedSourceIds.has(source.sourceId))
  : [...FILE_SOURCES];

if (selectedSources.length === 0) {
  console.error(`Unknown source. Available: ${FILE_SOURCES.map((source) => source.sourceId).join(', ')}`);
  process.exit(1);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchResponse(url, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: '*/*',
          Referer: `${portalOrigin}/`,
          'User-Agent': 'Childinfo facility updater/2.0'
        },
        signal: AbortSignal.timeout(180_000)
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body.slice(0, 160)}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await delay(attempt * 2_000);
    }
  }
  throw new Error(`${label} failed after 3 attempts: ${lastError?.message || lastError}`);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (character !== '\r') {
      field += character;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [rawHeaders = [], ...dataRows] = rows;
  const headers = rawHeaders.map((header, index) => {
    const cleaned = header.replace(/^\uFEFF/, '').trim();
    return cleaned || `column_${index + 1}`;
  });

  return dataRows
    .filter((values) => values.some((value) => value.trim()))
    .map((values) => Object.fromEntries(headers.map((header, index) => [
      header,
      (values[index] || '').trim()
    ])));
}

function decodeCsv(arrayBuffer) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(arrayBuffer), encoding: 'UTF-8' };
  } catch {
    return { text: new TextDecoder('euc-kr').decode(arrayBuffer), encoding: 'EUC-KR' };
  }
}

function extractSourceUpdatedAt(catalog) {
  const compactDate = String(catalog.alternateName || '').match(/_(\d{4})(\d{2})(\d{2})$/);
  if (compactDate) return `${compactDate[1]}-${compactDate[2]}-${compactDate[3]}`;
  return catalog.dateModified || catalog.datePublished || null;
}

async function fetchFileSource(source) {
  const pageUrl = `${portalOrigin}/data/${source.publicDataPk}/fileData.do`;
  const [pageResponse, catalogResponse] = await Promise.all([
    fetchResponse(pageUrl, `${source.sourceId} page`),
    fetchResponse(`${portalOrigin}/catalog/${source.publicDataPk}/fileData.json`, `${source.sourceId} catalog`)
  ]);
  const [page, catalogText] = await Promise.all([pageResponse.text(), catalogResponse.text()]);
  const contentUrl = page.match(/contentUrl"\s*:\s*"([^"]+)"/)?.[1]?.replaceAll('&amp;', '&');
  if (!contentUrl?.startsWith(`${portalOrigin}/cmm/cmm/fileDownload.do?`)) {
    throw new Error(`${source.sourceId}: an approved data.go.kr download URL was not found.`);
  }

  let catalog;
  try {
    catalog = JSON.parse(catalogText);
  } catch {
    throw new Error(`${source.sourceId}: catalog response was not JSON.`);
  }

  const downloadResponse = await fetchResponse(contentUrl, `${source.sourceId} CSV`);
  const decoded = decodeCsv(await downloadResponse.arrayBuffer());
  const rows = parseCsv(decoded.text);
  if (rows.length === 0) throw new Error(`${source.sourceId}: CSV has no data rows.`);

  return {
    rows,
    encoding: decoded.encoding,
    sourceName: catalog.name,
    sourceUpdatedAt: extractSourceUpdatedAt(catalog),
    downloadUrl: contentUrl,
    sourceUrl: pageUrl
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

function preservePreviousSnapshot(outputPath) {
  if (!fs.existsSync(outputPath)) return null;
  const rollbackDirectory = path.join(outputDirectory, 'rollback', rollbackStamp);
  fs.mkdirSync(rollbackDirectory, { recursive: true });
  const rollbackPath = path.join(rollbackDirectory, path.basename(outputPath));
  fs.copyFileSync(outputPath, rollbackPath);
  return path.relative(root, rollbackPath).replaceAll('\\', '/');
}

function assertNoUnexpectedDrop(sourceId, previous, currentCount) {
  const previousCount = previous?.records?.length || previous?.counts?.records || 0;
  if (previousCount >= 20 && currentCount < previousCount * 0.75) {
    throw new Error(`${sourceId}: record count dropped from ${previousCount} to ${currentCount}; keeping the previous snapshot.`);
  }
}

async function syncSource(source) {
  const adapter = PUBLIC_SOURCE_ADAPTERS[source.sourceId];
  if (!adapter) throw new Error(`${source.sourceId}: adapter is missing.`);

  console.log(`[facility-file] fetching ${source.sourceId}`);
  const fetched = await fetchFileSource(source);
  const includedRows = adapter.include ? fetched.rows.filter(adapter.include) : fetched.rows;
  const normalized = includedRows.map((row) => adapter.normalize(row, {
    collectedAt,
    sourceUpdatedAt: fetched.sourceUpdatedAt
  }));
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
    sourceUrl: fetched.sourceUrl,
    accessMethod: 'public-file-download-no-key',
    encoding: fetched.encoding,
    collectedAt,
    sourceUpdatedAt: fetched.sourceUpdatedAt,
    category: source.category,
    columns: Object.keys(fetched.rows[0] || {}),
    counts: {
      sourceRows: fetched.rows.length,
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
  console.log(`[facility-file] wrote ${path.relative(root, outputPath)} (${records.length} records)`);
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
        console.error(`[facility-file] ${source.sourceId} failed: ${error.message}`);
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
  accessMethod: 'public-file-download-no-key',
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
writeJsonAtomically(path.join(outputDirectory, 'file-sync-report.json'), report);
console.log(`[facility-file] completed ${succeeded.length}/${selectedSources.length} sources (${report.totals.records} records)`);

if (failed.length) process.exit(1);
