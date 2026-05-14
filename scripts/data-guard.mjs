import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcData = path.join(root, 'src', 'data');
const infraDir = path.join(srcData, 'infrastructure');

const requiredFiles = [
  'src/data/practicalInfo.js',
  'src/data/milestones.js',
  'src/data/healthInfo.js',
  'src/data/growthStandard.js',
  'src/data/infrastructure/nursing_rooms.js',
  'src/data/infrastructure/hospitals_infra.js',
  'src/services/facilityApi.js',
  'src/services/welfareApi.js',
  'src/constants/uiConstants.js',
];

const requiredRegionDirs = [
  'seoul',
  'gyeonggi',
  'incheon',
  'busan',
  'daegu',
  'daejeon',
  'gwangju',
  'ulsan',
  'sejong',
  'gangwon',
  'chungbuk',
  'chungnam',
  'jeonbuk',
  'jeonnam',
  'gyeongbuk',
  'gyeongnam',
  'jeju',
];

const requiredLabels = [
  '전체',
  '서울',
  '경기',
  '어린이집',
  '놀이·체험',
  '돌봄·지원센터',
  '가족센터',
  '유아휴게소',
  '병원·상담',
  '임신 준비',
  '취학 전',
];

function fail(message) {
  console.error(`[data-guard] ${message}`);
  process.exitCode = 1;
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

for (const relativePath of requiredFiles) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`Required data/code file is missing: ${relativePath}`);
  }
}

for (const region of requiredRegionDirs) {
  const regionPath = path.join(infraDir, region);
  const indexPath = path.join(regionPath, 'index.js');
  if (!fs.existsSync(regionPath) || !fs.statSync(regionPath).isDirectory()) {
    fail(`Required infrastructure region directory is missing: ${region}`);
  }
  if (!fs.existsSync(indexPath)) {
    fail(`Required infrastructure index is missing: ${region}/index.js`);
  }
}

const dataFiles = listFiles(srcData).filter((file) => file.endsWith('.js'));
const infraFiles = listFiles(infraDir).filter((file) => file.endsWith('.js'));
if (dataFiles.length < 180) {
  fail(`Unexpectedly low src/data file count: ${dataFiles.length}`);
}
if (infraFiles.length < 170) {
  fail(`Unexpectedly low infrastructure file count: ${infraFiles.length}`);
}

const constantsText = readText('src/constants/uiConstants.js');
for (const label of requiredLabels) {
  if (!constantsText.includes(label)) {
    fail(`Required UI/data label is missing from uiConstants.js: ${label}`);
  }
}

const welfareText = readText('src/services/welfareApi.js');
const welfareItemCount = (welfareText.match(/\bid:\s*['"](?:nat|reg)_/g) || []).length;
if (welfareItemCount < 50) {
  fail(`Unexpectedly low welfare item count: ${welfareItemCount}`);
}

const facilityText = readText('src/services/facilityApi.js');
for (const expectedImport of requiredRegionDirs) {
  if (!facilityText.includes(`../data/infrastructure/${expectedImport}/index`)) {
    fail(`facilityApi.js no longer imports infrastructure/${expectedImport}/index`);
  }
}

if (!process.exitCode) {
  console.log(`[data-guard] OK: ${dataFiles.length} data files, ${infraFiles.length} infrastructure files, ${welfareItemCount} welfare items.`);
}
