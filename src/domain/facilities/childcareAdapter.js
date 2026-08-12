import {
  FACILITY_CATEGORIES,
  FACILITY_SOURCES,
  normalizeFacility
} from './facilitySchema.js';

const CHILDCARE_SOURCE_URL = 'https://www.data.go.kr/data/15101154/openapi.do';

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row[key] !== '') return row[key];
  }
  return null;
}

function daycareSubtype(typeValue) {
  const type = String(typeValue || '').trim();
  if (/국공립/.test(type)) return 'public-daycare';
  if (/사회복지법인/.test(type)) return 'social-welfare-daycare';
  if (/법인.?단체/.test(type)) return 'corporate-daycare';
  if (/민간/.test(type)) return 'private-daycare';
  if (/가정/.test(type)) return 'home-daycare';
  if (/협동/.test(type)) return 'cooperative-daycare';
  if (/직장/.test(type)) return 'workplace-daycare';
  return 'daycare';
}

export function normalizeChildcareRecord(row, options = {}) {
  const sourceId = pick(row, 'STCODE', 'stcode', '어린이집코드', '시설코드', 'fcltCd');
  const name = pick(row, 'CRNAME', 'crname', '어린이집명', '보육시설명', 'fcltNm');
  const type = pick(row, 'CRTYPENAME', 'crtypename', '어린이집유형', '어린이집유형구분');
  const sourceUpdatedAt = pick(row, 'DATASTDRDT', 'datastdrdt', '데이터기준일자');

  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.DAYCARE,
    subtype: daycareSubtype(type),
    status: pick(row, 'CRSTATUSNAME', 'crstatusname', '운영현황'),
    region: pick(row, 'SIDONAME', 'sidoname', '시도명', '시도'),
    subRegion: pick(row, 'SIGUNNAME', 'sigunname', '시군구명', '시군구'),
    address: pick(row, 'CRADDR', 'craddr', '상세주소', '주소'),
    phone: pick(row, 'CRTELNO', 'crtelno', '전화번호', '어린이집전화번호'),
    homepage: pick(row, 'CRHOME', 'crhome', '홈페이지주소', 'URL'),
    latitude: pick(row, 'LA', 'la', '위도', '시설위도'),
    longitude: pick(row, 'LO', 'lo', '경도', '시설경도'),
    coordinateReferenceSystem: pick(row, 'coordinateReferenceSystem', '좌표계'),
    capacity: pick(row, 'CRCAPAT', 'crcapat', '정원', '정원수'),
    currentEnrollment: pick(row, 'CRCHCNT', 'crchcnt', '현원', '현원수'),
    sourceUpdatedAt
  }, {
    source: FACILITY_SOURCES.CHILDCARE_PORTAL,
    sourceId,
    sourceUrl: CHILDCARE_SOURCE_URL,
    sourceUpdatedAt,
    collectedAt: options.collectedAt
  });
}

export function extractChildcareRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const candidates = [
    payload.rows,
    payload.items,
    payload.item,
    payload.response?.body?.items?.item,
    payload.response?.body?.items,
    payload.data
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === 'object') return [candidate];
  }
  return [];
}

function decodeXml(value) {
  return String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

export function parseFlatChildcareXml(xmlText) {
  const xml = String(xmlText || '');
  const blocks = [...xml.matchAll(/<(?:item|row)\b[^>]*>([\s\S]*?)<\/(?:item|row)>/gi)];

  return blocks.map((block) => {
    const row = {};
    for (const field of block[1].matchAll(/<([A-Za-z0-9_]+)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
      row[field[1]] = decodeXml(field[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'));
    }
    return row;
  });
}

export const CHILDCARE_SOURCE_METADATA = Object.freeze({
  id: FACILITY_SOURCES.CHILDCARE_PORTAL,
  name: '한국사회보장정보원 어린이집별 기본정보',
  sourceUrl: CHILDCARE_SOURCE_URL,
  format: ['XML', 'CSV'],
  requiresSeparateApproval: true
});
