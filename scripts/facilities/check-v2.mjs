import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FACILITY_CATEGORIES,
  FACILITY_SOURCES,
  dedupeFacilities,
  normalizeCoordinates,
  normalizeFacility,
  normalizeRegionName,
  validateFacilityRecord
} from '../../src/domain/facilities/facilitySchema.js';
import {
  normalizeChildcareRecord,
  parseFlatChildcareXml
} from '../../src/domain/facilities/childcareAdapter.js';
import {
  isCounselingHealthCenterRecord,
  isFamilyPlayParkRecord,
  isPediatricHospitalRecord,
  normalizeCityParkRecord,
  normalizeCommunityChildCenterRecord,
  normalizeDevelopmentalRehabRecord,
  normalizeFamilyCounselingRecord,
  normalizeFestivalRecord,
  normalizeHiraHospitalRecord,
  normalizeLibraryRecord,
  normalizeMentalHealthCenterRecord,
  normalizeMuseumRecord,
  normalizeNursingRoomRecord,
  normalizeSharedChildcareRecord,
  normalizeYouthCounselingRecord
} from '../../src/domain/facilities/publicSourceAdapters.js';

assert.equal(normalizeRegionName('서울특별시'), '서울');
assert.equal(normalizeRegionName('전북특별자치도 전주시'), '전북');
assert.equal(normalizeRegionName('강원특별자치도'), '강원');

assert.deepEqual(normalizeCoordinates('37.5', '127.1'), {
  latitude: 37.5,
  longitude: 127.1,
  coordinateReferenceSystem: 'EPSG:4326',
  sourceCoordinates: null
});
assert.equal(normalizeCoordinates('451234', '205678', 'EPSG:5181').latitude, null);

const daycare = normalizeChildcareRecord({
  STCODE: 'test-001',
  CRNAME: '테스트 국공립어린이집',
  CRTYPENAME: '국공립',
  CRSTATUSNAME: '정상',
  SIDONAME: '서울특별시',
  SIGUNNAME: '강남구',
  CRADDR: '서울특별시 강남구 테헤란로 1',
  CRTELNO: '02-0000-0000',
  LA: '37.5',
  LO: '127.1',
  CRCAPAT: '30',
  CRCHCNT: '24',
  DATASTDRDT: '2026-08-01'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });

assert.equal(daycare.category, FACILITY_CATEGORIES.DAYCARE);
assert.equal(daycare.source, FACILITY_SOURCES.CHILDCARE_PORTAL);
assert.equal(daycare.region, '서울');
assert.equal(daycare.subRegion, '강남구');
assert.equal(daycare.status, 'active');
assert.deepEqual(validateFacilityRecord(daycare), []);

const xmlRows = parseFlatChildcareXml(`
  <response><items><item><STCODE>xml-1</STCODE><CRNAME><![CDATA[XML 어린이집]]></CRNAME></item></items></response>
`);
assert.equal(xmlRows.length, 1);
assert.equal(xmlRows[0].CRNAME, 'XML 어린이집');

const legacy = normalizeFacility({
  id: 'legacy-1',
  name: '테스트 국공립어린이집',
  type: '어린이집',
  region: '서울',
  subRegion: '강남구',
  address: '서울 강남구 테헤란로 1'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });
const deduped = dedupeFacilities([legacy, legacy]);
assert.equal(deduped.records.length, 1);
assert.equal(deduped.duplicates.length, 1);

const park = normalizeCityParkRecord({
  관리번호: 'park-1',
  공원명: '아이사랑어린이공원',
  소재지도로명주소: '부산광역시 해운대구 센텀로 1',
  위도: 35.17,
  경도: 129.13,
  '공원보유시설(유희시설)': '조합놀이대',
  데이터기준일자: '2026-07-01'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });
assert.equal(isFamilyPlayParkRecord({ 공원명: '어린이공원' }), true);
assert.equal(park.category, FACILITY_CATEGORIES.PLAY);
assert.equal(park.region, '부산');

const care = normalizeCommunityChildCenterRecord({
  센터명: '행복지역아동센터',
  시도명: '전북특별자치도',
  시군구명: '전주시',
  소재지도로명주소: '전북특별자치도 전주시 완산구 행복로 1',
  위도: 35.82,
  경도: 127.14,
  정원수: 30,
  데이터기준일자: '2026-07-01'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });
assert.equal(care.category, FACILITY_CATEGORIES.CARE);
assert.equal(care.region, '전북');

const museum = normalizeMuseumRecord({
  시설명: '어린이곤충박물관',
  소재지도로명주소: '경기도 여주시 명성로 1',
  위도: 37.25,
  경도: 127.66,
  어린이관람료: 3000,
  데이터기준일자: '2026-07-01'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });
assert.equal(museum.category, FACILITY_CATEGORIES.PLAY);
assert.equal(museum.details.fees.includes('어린이 3000원'), true);

const library = normalizeLibraryRecord({
  도서관명: '꿈나무어린이도서관',
  시도명: '서울특별시',
  시군구명: '강동구',
  소재지도로명주소: '서울특별시 강동구 천호대로 1',
  평일운영시작시각: '09:00',
  평일운영종료시각: '18:00'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });
assert.equal(library.subtype, 'library');
assert.equal(library.region, '서울');

const festival = normalizeFestivalRecord({
  축제명: '지난 가족축제',
  축제시작일자: '2026-01-01',
  축제종료일자: '2026-01-02',
  소재지도로명주소: '부산광역시 해운대구 센텀로 1'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });
assert.equal(festival.status, 'inactive');

const mentalHealth = normalizeMentalHealthCenterRecord({
  건강증진센터명: '아이마음 정신건강복지센터',
  건강증진센터구분: '정신보건',
  건강증진업무내용: '아동청소년 정신건강 상담',
  소재지도로명주소: '경상남도 창원시 성산구 중앙대로 1'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });
assert.equal(isCounselingHealthCenterRecord({ 건강증진업무내용: '아동청소년 정신건강 상담' }), true);
assert.equal(mentalHealth.category, FACILITY_CATEGORIES.MEDICAL);

const rehab = normalizeDevelopmentalRehabRecord({
  기관명: '햇살아동발달센터',
  시도명: '충청남도',
  시군구명: '천안시',
  소재지도로명주소: '충청남도 천안시 서북구 불당로 1',
  사업구분명: '발달재활'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });
assert.equal(rehab.subtype, 'developmental-rehabilitation');
assert.equal(rehab.region, '충남');

const sharedChildcare = normalizeSharedChildcareRecord({
  연번: 1,
  시도: '대전광역시',
  시군구: '서구',
  '주소(도로명)': '대전광역시 서구 둔산로 1',
  운영기관: '대전서구가족센터',
  연락처: '042-000-0000'
}, { collectedAt: '2026-08-11T00:00:00.000Z', sourceUpdatedAt: '2025-11-10' });
assert.equal(sharedChildcare.name, '대전서구가족센터 공동육아나눔터');
assert.equal(sharedChildcare.category, FACILITY_CATEGORIES.FAMILY);
assert.equal(sharedChildcare.sourceId, 'shared-childcare:1');

const familyCounseling = normalizeFamilyCounselingRecord({
  지역: '제주',
  센터명: '제주시가족센터',
  주소: '제주특별자치도 제주시 중앙로 1',
  전화번호: '064-000-0000',
  인증년도: '2025'
}, { collectedAt: '2026-08-11T00:00:00.000Z', sourceUpdatedAt: '2025-09-25' });
assert.equal(familyCounseling.subtype, 'family-counseling');
assert.equal(familyCounseling.region, '제주');

const youthCounseling = normalizeYouthCounselingRecord({
  센터명: '서울시청소년상담복지센터',
  시도: '서울특별시',
  시군구: '잘못된구',
  주소1: '서울특별시 중구 을지로 1',
  주소2: ', 7층',
  위도: 37.56,
  경도: 126.98,
  대표전화번호: '02-000-0000'
}, { collectedAt: '2026-08-11T00:00:00.000Z', sourceUpdatedAt: '2025-09-08' });
assert.equal(youthCounseling.subtype, 'youth-counseling-welfare');
assert.equal(youthCounseling.region, '서울');
assert.equal(youthCounseling.subRegion, '중구');
assert.equal(youthCounseling.address, '서울특별시 중구 을지로 1 7층');

const hospital = normalizeHiraHospitalRecord({
  ykiho: 'hospital-1',
  yadmNm: '아이사랑소아청소년과의원',
  dgsbjtCdNm: '소아청소년과',
  addr: '대전광역시 서구 둔산로 1',
  YPos: 36.35,
  XPos: 127.38,
  telno: '042-000-0000'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });
assert.equal(isPediatricHospitalRecord({ dgsbjtCdNm: '소아청소년과' }), true);
assert.equal(hospital.subtype, 'pediatrics');

const nursingRoom = normalizeNursingRoomRecord({
  roomNo: 'room-1',
  roomName: '시청 가족수유실',
  zoneName: '서울특별시',
  cityName: '중구',
  address: '서울특별시 중구 세종대로 1',
  gpsLat: 37.56,
  gpsLong: 126.97,
  fatherUseCode: '1'
}, { collectedAt: '2026-08-11T00:00:00.000Z' });
assert.equal(nursingRoom.category, FACILITY_CATEGORIES.NURSING);
assert.equal(nursingRoom.attributes.fatherAllowed, true);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const snapshotDirectory = path.join(root, 'data', 'facilities-v2');
const runtimePath = path.join(root, 'public', 'data', 'facilities-v2.json');
const snapshotFiles = fs.readdirSync(snapshotDirectory)
  .filter((name) => name.endsWith('.snapshot.json'))
  .sort();
const expectedRegions = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];
const coveredRegions = new Set();
let snapshotRecordCount = 0;

assert.ok(snapshotFiles.length > 0, 'No V2 facility snapshots were found.');
for (const snapshotFile of snapshotFiles) {
  const snapshotPath = path.join(snapshotDirectory, snapshotFile);
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  assert.ok(Array.isArray(snapshot.records), `${snapshotFile}: records must be an array.`);
  assert.equal(snapshot.records.length, snapshot.counts?.records, `${snapshotFile}: record count mismatch.`);
  assert.equal(snapshot.invalid?.length || 0, snapshot.counts?.invalid || 0, `${snapshotFile}: invalid count mismatch.`);

  for (const record of snapshot.records) {
    const errors = validateFacilityRecord(record);
    assert.deepEqual(errors, [], `${snapshotFile}: ${record.id} failed: ${errors.join(', ')}`);
    if (expectedRegions.includes(record.region)) coveredRegions.add(record.region);
  }
  snapshotRecordCount += snapshot.records.length;
}

assert.deepEqual(
  expectedRegions.filter((region) => !coveredRegions.has(region)),
  [],
  'V2 facility snapshots do not cover all 17 regions.'
);

assert.ok(fs.existsSync(runtimePath), 'Facility V2 runtime dataset was not generated.');
const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
assert.equal(runtime.schemaVersion, 2, 'Facility V2 runtime schema is invalid.');
assert.equal(runtime.records?.length, runtime.counts?.records, 'Facility V2 runtime count mismatch.');
assert.ok(runtime.records.some((record) => record.type === FACILITY_CATEGORIES.MEDICAL), 'Medical facilities are missing from the runtime dataset.');
assert.ok(runtime.records.every((record) => record.status !== 'inactive' && record.status !== 'review_required'), 'Blocked facility statuses leaked into the runtime dataset.');

console.log(`[facility-v2] schema, adapters and ${snapshotFiles.length} snapshots (${snapshotRecordCount} records, 17 regions) passed.`);
