export const FACILITY_SCHEMA_VERSION = 2;

export const FACILITY_CATEGORIES = Object.freeze({
  DAYCARE: '어린이집',
  PLAY: '놀이·체험',
  CARE: '돌봄·지원센터',
  FAMILY: '가족센터',
  NURSING: '유아휴게소',
  MEDICAL: '병원·상담'
});

export const FACILITY_STATUSES = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAUSED: 'paused',
  UNKNOWN: 'unknown',
  REVIEW_REQUIRED: 'review_required'
});

export const FACILITY_SOURCES = Object.freeze({
  LEGACY: 'childinfo-legacy',
  CHILDCARE_PORTAL: 'childcare-info-portal',
  PUBLIC_DATA: 'data-go-kr',
  TOUR_API: 'visit-korea-tour-api',
  NURSING_INFO: 'sooyusil',
  HIRA: 'hira',
  EMERGENCY_MEDICAL: 'e-gen'
});

const REGION_ALIASES = new Map([
  ['서울', '서울'], ['서울시', '서울'], ['서울특별시', '서울'],
  ['경기', '경기'], ['경기도', '경기'],
  ['인천', '인천'], ['인천시', '인천'], ['인천광역시', '인천'],
  ['부산', '부산'], ['부산시', '부산'], ['부산광역시', '부산'],
  ['대구', '대구'], ['대구시', '대구'], ['대구광역시', '대구'],
  ['대전', '대전'], ['대전시', '대전'], ['대전광역시', '대전'],
  ['광주', '광주'], ['광주시', '광주'], ['광주광역시', '광주'],
  ['울산', '울산'], ['울산시', '울산'], ['울산광역시', '울산'],
  ['세종', '세종'], ['세종시', '세종'], ['세종특별자치시', '세종'],
  ['강원', '강원'], ['강원도', '강원'], ['강원특별자치도', '강원'],
  ['충북', '충북'], ['충청북도', '충북'],
  ['충남', '충남'], ['충청남도', '충남'],
  ['전북', '전북'], ['전라북도', '전북'], ['전북특별자치도', '전북'],
  ['전남', '전남'], ['전라남도', '전남'],
  ['경북', '경북'], ['경상북도', '경북'],
  ['경남', '경남'], ['경상남도', '경남'],
  ['제주', '제주'], ['제주도', '제주'], ['제주특별자치도', '제주']
]);
const LEGACY_GWANGJU_DISTRICTS = new Set(['광산구', '남구', '동구', '북구', '서구']);

const CATEGORY_VALUES = new Set(Object.values(FACILITY_CATEGORIES));
const OFFICIAL_SOURCE_PRIORITY = new Map([
  [FACILITY_SOURCES.CHILDCARE_PORTAL, 100],
  [FACILITY_SOURCES.HIRA, 100],
  [FACILITY_SOURCES.EMERGENCY_MEDICAL, 100],
  [FACILITY_SOURCES.PUBLIC_DATA, 90],
  [FACILITY_SOURCES.TOUR_API, 85],
  [FACILITY_SOURCES.NURSING_INFO, 85],
  [FACILITY_SOURCES.LEGACY, 10]
]);

function cleanText(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function nullableText(value) {
  const cleaned = cleanText(value);
  return cleaned || null;
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function nullableInteger(value) {
  const parsed = finiteNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}

export function normalizeRegionName(value) {
  const cleaned = cleanText(value).replace(/[()]/g, '');
  if (!cleaned) return '기타';
  if (REGION_ALIASES.has(cleaned)) return REGION_ALIASES.get(cleaned);

  const firstToken = cleaned.split(' ')[0];
  if (REGION_ALIASES.has(firstToken)) return REGION_ALIASES.get(firstToken);

  for (const [alias, canonical] of REGION_ALIASES) {
    if (cleaned.startsWith(alias)) return canonical;
  }
  return '기타';
}

export function normalizeSubRegionName(value, region = '기타') {
  const cleaned = cleanText(value).replace(/[(),]/g, '');
  if (!cleaned || cleaned === '전체') return '전체';
  if (region === '세종' && ['세종', '세종시', '세종특별자치시'].includes(cleaned)) return '세종시';
  return cleaned;
}

export function parseFacilityAddress(address, preferred = {}) {
  const cleanedAddress = cleanText(address);
  const tokens = cleanedAddress.split(' ').filter(Boolean);
  const rawRegion = cleanText(preferred.region || tokens[0]).replace(/[()]/g, '');
  const rawSubRegion = cleanText(preferred.subRegion || tokens[1]).replace(/[(),]/g, '');
  let region = normalizeRegionName(rawRegion);
  let compatibleSubRegion = rawSubRegion;
  if (rawRegion.startsWith('전남광주') || cleanedAddress.startsWith('전남광주통합특별시')) {
    const formerGwangjuSubRegion = rawSubRegion.replace(/^광주/, '');
    if (LEGACY_GWANGJU_DISTRICTS.has(formerGwangjuSubRegion)) {
      region = '광주';
      compatibleSubRegion = formerGwangjuSubRegion;
    } else {
      region = '전남';
      compatibleSubRegion = rawSubRegion.replace(/^전남/, '');
    }
  }

  let subRegion = normalizeSubRegionName(compatibleSubRegion, region);
  if (subRegion === '전체') {
    const candidate = tokens.slice(1, 4).find((token) => /(?:시|군|구)$/.test(token));
    subRegion = normalizeSubRegionName(candidate, region);
  }

  let dong = cleanText(preferred.dong);
  if (!dong || dong === '전체') {
    const candidate = tokens
      .map((token) => token.replace(/[(),]/g, ''))
      .find((token) => /(?:읍|면|동)$/.test(token) && token.length > 1);
    dong = candidate || '전체';
  }

  return { region, subRegion, dong, address: cleanedAddress };
}

export function normalizeFacilityStatus(value) {
  const status = cleanText(value).toLowerCase();
  if (!status) return FACILITY_STATUSES.UNKNOWN;
  if (/(폐지|폐업|말소|종료|운영중단|inactive|closed)/i.test(status)) return FACILITY_STATUSES.INACTIVE;
  if (/(휴지|휴업|일시중단|paused|suspended)/i.test(status)) return FACILITY_STATUSES.PAUSED;
  if (/(정상|운영|영업|active|open)/i.test(status)) return FACILITY_STATUSES.ACTIVE;
  return FACILITY_STATUSES.UNKNOWN;
}

export function normalizeCoordinates(latitudeValue, longitudeValue, coordinateReferenceSystem) {
  const rawLatitude = finiteNumber(latitudeValue);
  const rawLongitude = finiteNumber(longitudeValue);
  const declaredCrs = nullableText(coordinateReferenceSystem);

  if (rawLatitude !== null && rawLongitude !== null
    && rawLatitude >= 32 && rawLatitude <= 40
    && rawLongitude >= 123 && rawLongitude <= 133) {
    return {
      latitude: rawLatitude,
      longitude: rawLongitude,
      coordinateReferenceSystem: 'EPSG:4326',
      sourceCoordinates: null
    };
  }

  if (rawLatitude !== null || rawLongitude !== null) {
    return {
      latitude: null,
      longitude: null,
      coordinateReferenceSystem: declaredCrs || 'unknown',
      sourceCoordinates: { latitude: rawLatitude, longitude: rawLongitude }
    };
  }

  return {
    latitude: null,
    longitude: null,
    coordinateReferenceSystem: declaredCrs || null,
    sourceCoordinates: null
  };
}

function inferCategory(rawCategory, name = '') {
  const category = cleanText(rawCategory);
  if (CATEGORY_VALUES.has(category)) return category;

  const haystack = `${category} ${cleanText(name)}`;
  if (/어린이집|보육시설/.test(haystack)) return FACILITY_CATEGORIES.DAYCARE;
  if (/가족센터|건강가정|다문화가족/.test(haystack)) return FACILITY_CATEGORIES.FAMILY;
  if (/수유실|가족수유실|유아휴게소|모유수유/.test(haystack)) return FACILITY_CATEGORIES.NURSING;
  if (/병원|의원|응급|상담|정신건강|발달센터/.test(haystack)) return FACILITY_CATEGORIES.MEDICAL;
  if (/박물관|미술관|과학관|체험|공원|놀이터|키즈|도서관/.test(haystack)) return FACILITY_CATEGORIES.PLAY;
  if (/돌봄|지역아동|육아종합|키움센터|공동육아|나눔터|지원센터/.test(haystack)) return FACILITY_CATEGORIES.CARE;
  return null;
}

function inferSubtype(category, rawSubtype, name = '') {
  const provided = nullableText(rawSubtype);
  if (provided) return provided;

  const haystack = cleanText(name);
  if (category === FACILITY_CATEGORIES.DAYCARE) return 'daycare';
  if (/응급/.test(haystack)) return 'emergency-room';
  if (/소아청소년과|소아과/.test(haystack)) return 'pediatrics';
  if (/상담|정신건강|발달/.test(haystack)) return 'counseling';
  if (/가족수유실/.test(haystack)) return 'family-nursing-room';
  if (/수유실|모유수유/.test(haystack)) return 'nursing-room';
  if (/공동육아나눔터/.test(haystack)) return 'shared-childcare-space';
  if (/가족센터|건강가정|다문화가족/.test(haystack)) return 'family-center';
  if (/지역아동센터/.test(haystack)) return 'community-child-center';
  if (/다함께|키움센터/.test(haystack)) return 'public-after-school-care';
  if (/육아종합지원센터/.test(haystack)) return 'childcare-support-center';
  if (category === FACILITY_CATEGORIES.PLAY) return 'play-experience';
  return 'other';
}

function normalizedKeyPart(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[()\[\]{}.,·ㆍ\-_/\\]/g, '')
    .replace(/\s/g, '');
}

export function buildFacilityDedupeKey(facility) {
  const source = cleanText(facility?.source || facility?.provenance?.source);
  const sourceId = cleanText(facility?.sourceId || facility?.provenance?.sourceId);
  if (source && sourceId) return `source:${source}:${sourceId}`;

  const name = normalizedKeyPart(facility?.name);
  const address = normalizedKeyPart(facility?.roadAddress || facility?.address);
  if (name && address) return `place:${name}:${address}`;

  return `record:${normalizedKeyPart(facility?.id || `${name}:${facility?.region}:${facility?.subRegion}`)}`;
}

export function normalizeFacility(input, options = {}) {
  const source = cleanText(options.source || input.source || FACILITY_SOURCES.LEGACY);
  const sourceId = cleanText(options.sourceId || input.sourceId || input.id);
  const name = cleanText(input.name);
  const roadAddress = nullableText(input.roadAddress || input.roadAddr || input.address);
  const location = parseFacilityAddress(roadAddress, {
    region: input.region,
    subRegion: input.subRegion,
    dong: input.dong
  });
  const category = inferCategory(options.category || input.category || input.type, name);
  const coordinates = normalizeCoordinates(
    input.latitude ?? input.lat ?? input.LA ?? input.la,
    input.longitude ?? input.lng ?? input.LO ?? input.lo,
    input.coordinateReferenceSystem
  );
  const now = options.collectedAt || new Date().toISOString();

  const record = {
    schemaVersion: FACILITY_SCHEMA_VERSION,
    id: sourceId ? `${source}:${sourceId}` : `${source}:${normalizedKeyPart(`${name}:${roadAddress}`)}`,
    source,
    sourceId: sourceId || null,
    name,
    category,
    type: category,
    subtype: inferSubtype(category, options.subtype || input.subtype, name),
    status: normalizeFacilityStatus(options.status || input.status || input.operatingStatus),
    region: location.region,
    subRegion: location.subRegion,
    dong: location.dong,
    address: location.address,
    roadAddress,
    ...coordinates,
    phone: nullableText(input.phone || input.tel || input.telephone),
    homepage: nullableText(input.homepage || input.homepageUrl || input.url),
    mapUrl: nullableText(input.mapUrl) || (name ? `https://map.kakao.com/?q=${encodeURIComponent(name)}` : null),
    details: {
      hours: nullableText(input.hours || input.operatingHours),
      ageRange: nullableText(input.ageRange),
      fees: nullableText(input.fees),
      reservation: nullableText(input.reservation),
      capacity: nullableInteger(input.capacity),
      currentEnrollment: nullableInteger(input.currentEnrollment)
    },
    attributes: input.attributes && typeof input.attributes === 'object'
      ? { ...input.attributes }
      : {},
    provenance: {
      source,
      sourceId: sourceId || null,
      sourceUrl: nullableText(options.sourceUrl || input.sourceUrl),
      collectedAt: now,
      sourceUpdatedAt: nullableText(options.sourceUpdatedAt || input.sourceUpdatedAt),
      legacyId: nullableText(options.legacyId || input.legacyId)
    }
  };

  if (!record.name || !record.category || record.region === '기타') {
    record.status = record.status === FACILITY_STATUSES.INACTIVE
      ? FACILITY_STATUSES.INACTIVE
      : FACILITY_STATUSES.REVIEW_REQUIRED;
  }

  return record;
}

function recordCompleteness(record) {
  const fields = [
    record.name, record.category, record.subtype, record.address, record.roadAddress,
    record.latitude, record.longitude, record.phone, record.homepage,
    record.provenance?.sourceUpdatedAt
  ];
  return fields.filter((value) => value !== null && value !== undefined && value !== '').length;
}

function choosePreferredRecord(left, right) {
  const leftPriority = OFFICIAL_SOURCE_PRIORITY.get(left.source) || 0;
  const rightPriority = OFFICIAL_SOURCE_PRIORITY.get(right.source) || 0;
  if (leftPriority !== rightPriority) return leftPriority > rightPriority ? left : right;
  return recordCompleteness(left) >= recordCompleteness(right) ? left : right;
}

function mergeFacilityRecords(preferred, secondary) {
  const merged = { ...secondary, ...preferred };
  merged.details = { ...(secondary.details || {}), ...(preferred.details || {}) };
  merged.provenance = { ...(secondary.provenance || {}), ...(preferred.provenance || {}) };
  merged.mergedRecordIds = Array.from(new Set([
    ...(preferred.mergedRecordIds || []),
    ...(secondary.mergedRecordIds || []),
    secondary.id
  ].filter(Boolean)));
  return merged;
}

export function dedupeFacilities(records) {
  const keptByKey = new Map();
  const duplicates = [];

  for (const record of records || []) {
    const key = buildFacilityDedupeKey(record);
    const existing = keptByKey.get(key);
    if (!existing) {
      keptByKey.set(key, record);
      continue;
    }

    const preferred = choosePreferredRecord(existing, record);
    const secondary = preferred === existing ? record : existing;
    keptByKey.set(key, mergeFacilityRecords(preferred, secondary));
    duplicates.push({ key, keptId: preferred.id, mergedId: secondary.id });
  }

  return { records: Array.from(keptByKey.values()), duplicates };
}

export function validateFacilityRecord(record) {
  const errors = [];
  if (record?.schemaVersion !== FACILITY_SCHEMA_VERSION) errors.push('invalid_schema_version');
  if (!cleanText(record?.id)) errors.push('missing_id');
  if (!cleanText(record?.name)) errors.push('missing_name');
  if (!CATEGORY_VALUES.has(record?.category)) errors.push('invalid_category');
  if (!cleanText(record?.source)) errors.push('missing_source');
  if (!cleanText(record?.sourceId)) errors.push('missing_source_id');
  if (!cleanText(record?.address)) errors.push('missing_address');
  if (!cleanText(record?.provenance?.collectedAt)) errors.push('missing_collected_at');
  if (!cleanText(record?.provenance?.sourceUrl)) errors.push('missing_source_url');
  if (record?.latitude !== null && record?.longitude !== null) {
    if (record.latitude < 32 || record.latitude > 40 || record.longitude < 123 || record.longitude > 133) {
      errors.push('coordinates_outside_korea');
    }
  }
  return errors;
}
