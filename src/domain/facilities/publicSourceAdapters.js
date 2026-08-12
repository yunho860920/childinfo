import {
  FACILITY_CATEGORIES,
  FACILITY_SOURCES,
  normalizeFacility
} from './facilitySchema.js';

const SOURCE_URLS = Object.freeze({
  tour: 'https://www.data.go.kr/data/15101578/openapi.do',
  parks: 'https://www.data.go.kr/data/15012890/standard.do',
  communityCare: 'https://www.data.go.kr/data/15129438/standard.do',
  museums: 'https://www.data.go.kr/data/15017323/standard.do',
  libraries: 'https://www.data.go.kr/data/15013109/standard.do',
  festivals: 'https://www.data.go.kr/data/15013104/standard.do',
  healthCenters: 'https://www.data.go.kr/data/15021137/standard.do',
  developmentalRehab: 'https://www.data.go.kr/data/15155702/standard.do',
  sharedChildcare: 'https://www.data.go.kr/data/15055830/fileData.do',
  familyCounseling: 'https://www.data.go.kr/data/15042341/fileData.do',
  youthCounseling: 'https://www.data.go.kr/data/15088388/fileData.do',
  hira: 'https://www.data.go.kr/data/15001698/openapi.do',
  nursing: 'https://www.sooyusil.com/home'
});

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row[key] !== '') return row[key];
  }
  return null;
}

function sourceOptions(source, sourceId, sourceUrl, row, options = {}) {
  return {
    source,
    sourceId,
    sourceUrl,
    sourceUpdatedAt: options.sourceUpdatedAt || pick(row, '데이터기준일자', 'modifiedtime', 'sourceUpdatedAt'),
    collectedAt: options.collectedAt
  };
}

export function normalizeTourRecord(row, options = {}) {
  const sourceId = pick(row, 'contentid', 'contentId', '콘텐츠ID');
  return normalizeFacility({
    id: sourceId,
    name: pick(row, 'title', '관광지명', '시설명'),
    category: FACILITY_CATEGORIES.PLAY,
    subtype: 'tour-experience',
    status: '운영',
    address: [pick(row, 'addr1', '주소'), pick(row, 'addr2', '상세주소')].filter(Boolean).join(' '),
    phone: pick(row, 'tel', '전화번호'),
    homepage: pick(row, 'homepage', '홈페이지'),
    latitude: pick(row, 'mapy', '위도'),
    longitude: pick(row, 'mapx', '경도'),
    sourceUpdatedAt: pick(row, 'modifiedtime', '데이터기준일자'),
    attributes: {
      contentTypeId: pick(row, 'contenttypeid', 'contentTypeId'),
      category1: pick(row, 'cat1'),
      category2: pick(row, 'cat2'),
      category3: pick(row, 'cat3'),
      image: pick(row, 'firstimage', 'firstImage')
    }
  }, sourceOptions(FACILITY_SOURCES.TOUR_API, sourceId, SOURCE_URLS.tour, row, options));
}

export function isFamilyPlayTourRecord(row) {
  const text = [
    pick(row, 'title', '관광지명', '시설명'),
    pick(row, 'overview', '개요'),
    pick(row, 'cat1'), pick(row, 'cat2'), pick(row, 'cat3')
  ].filter(Boolean).join(' ');
  return /어린이|유아|가족|키즈|체험|박물관|미술관|과학관|생태|놀이|공원|도서관/.test(text);
}

export function normalizeCityParkRecord(row, options = {}) {
  const sourceId = pick(row, '관리번호', 'mngNo', 'parkId');
  return normalizeFacility({
    id: sourceId,
    name: pick(row, '공원명', 'parkNm', '시설명'),
    category: FACILITY_CATEGORIES.PLAY,
    subtype: 'city-park',
    status: '운영',
    region: pick(row, '시도명'),
    subRegion: pick(row, '시군구명'),
    roadAddress: pick(row, '소재지도로명주소', 'rdnmadr'),
    address: pick(row, '소재지도로명주소', 'rdnmadr', '소재지지번주소', 'lnmadr'),
    latitude: pick(row, '위도', 'latitude'),
    longitude: pick(row, '경도', 'longitude'),
    phone: pick(row, '전화번호', 'phoneNumber'),
    sourceUpdatedAt: pick(row, '데이터기준일자', 'referenceDate'),
    attributes: {
      parkType: pick(row, '공원구분', 'parkSe'),
      playFacilities: pick(row, '공원보유시설(유희시설)', 'playFclty'),
      convenienceFacilities: pick(row, '공원보유시설(편익시설)', 'cnvnncFclty'),
      educationFacilities: pick(row, '공원보유시설(교양시설)', 'clturFclty'),
      areaSquareMeters: pick(row, '공원면적', 'parkAr')
    }
  }, sourceOptions(FACILITY_SOURCES.PUBLIC_DATA, sourceId, SOURCE_URLS.parks, row, options));
}

export function isFamilyPlayParkRecord(row) {
  const name = String(pick(row, '공원명', 'parkNm', '시설명') || '');
  const playFacilities = String(pick(row, '공원보유시설(유희시설)', 'playFclty') || '').trim();
  return Boolean(playFacilities) || /어린이|유아|가족|놀이|키즈/.test(name);
}

export function normalizeCommunityChildCenterRecord(row, options = {}) {
  const name = pick(row, '센터명', '시설명', 'name');
  const address = pick(row, '소재지도로명주소', '도로명주소', '소재지지번주소', '주소');
  const sourceId = pick(row, '관리번호', '센터ID') || `${name}:${address}`;
  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.CARE,
    subtype: 'community-child-center',
    status: pick(row, '운영현황', '상태') || '운영',
    region: pick(row, '시도명'),
    subRegion: pick(row, '시군구명'),
    roadAddress: pick(row, '소재지도로명주소', '도로명주소'),
    address,
    latitude: pick(row, '위도', 'latitude'),
    longitude: pick(row, '경도', 'longitude'),
    phone: pick(row, '전화번호'),
    capacity: pick(row, '정원수', '정원'),
    currentEnrollment: pick(row, '현원수', '현원'),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      operatorType: pick(row, '운영기관유형'),
      staffCount: pick(row, '종사자수')
    }
  }, sourceOptions(FACILITY_SOURCES.PUBLIC_DATA, sourceId, SOURCE_URLS.communityCare, row, options));
}

function joinHours(...parts) {
  const values = parts.filter(Boolean);
  return values.length ? values.join(' / ') : null;
}

export function normalizeMuseumRecord(row, options = {}) {
  const name = pick(row, '시설명', '박물관미술관명', '기관명');
  const address = pick(row, '소재지도로명주소', '소재지지번주소', '주소');
  const sourceId = pick(row, '관리번호', '시설ID') || `${name}:${address}`;
  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.PLAY,
    subtype: 'museum-art-museum',
    status: '운영',
    roadAddress: pick(row, '소재지도로명주소'),
    address,
    latitude: pick(row, '위도'),
    longitude: pick(row, '경도'),
    phone: pick(row, '운영기관전화번호', '관리기관전화번호', '전화번호'),
    homepage: pick(row, '운영홈페이지', '홈페이지주소', '홈페이지'),
    hours: joinHours(
      pick(row, '평일관람시작시각') && `평일 ${pick(row, '평일관람시작시각')}~${pick(row, '평일관람종료시각') || ''}`,
      pick(row, '공휴일관람시작시각') && `공휴일 ${pick(row, '공휴일관람시작시각')}~${pick(row, '공휴일관람종료시각') || ''}`,
      pick(row, '휴관정보') && `휴관 ${pick(row, '휴관정보')}`
    ),
    fees: joinHours(
      pick(row, '어른관람료') !== null && `어른 ${pick(row, '어른관람료')}원`,
      pick(row, '청소년관람료') !== null && `청소년 ${pick(row, '청소년관람료')}원`,
      pick(row, '어린이관람료') !== null && `어린이 ${pick(row, '어린이관람료')}원`,
      pick(row, '관람료기타정보')
    ),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      facilityType: pick(row, '박물관미술관구분'),
      operator: pick(row, '운영기관명'),
      amenities: pick(row, '편의시설정보'),
      introduction: pick(row, '박물관미술관소개'),
      transit: pick(row, '교통안내정보')
    }
  }, sourceOptions(FACILITY_SOURCES.PUBLIC_DATA, sourceId, SOURCE_URLS.museums, row, options));
}

export function normalizeLibraryRecord(row, options = {}) {
  const name = pick(row, '도서관명', '시설명');
  const address = pick(row, '소재지도로명주소', '소재지지번주소', '주소');
  const sourceId = pick(row, '도서관ID', '관리번호') || `${name}:${address}`;
  const closure = String(pick(row, '휴관일') || '');
  const status = /임시휴무|장기휴관|운영중단/.test(closure) ? '휴업' : '운영';
  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.PLAY,
    subtype: 'library',
    status,
    region: pick(row, '시도명'),
    subRegion: pick(row, '시군구명'),
    roadAddress: pick(row, '소재지도로명주소'),
    address,
    latitude: pick(row, '위도'),
    longitude: pick(row, '경도'),
    phone: pick(row, '도서관전화번호', '전화번호'),
    homepage: pick(row, '홈페이지주소', '홈페이지'),
    hours: joinHours(
      pick(row, '평일운영시작시각') && `평일 ${pick(row, '평일운영시작시각')}~${pick(row, '평일운영종료시각') || ''}`,
      pick(row, '토요일운영시작시각') && `토요일 ${pick(row, '토요일운영시작시각')}~${pick(row, '토요일운영종료시각') || ''}`,
      pick(row, '공휴일운영시작시각') && `공휴일 ${pick(row, '공휴일운영시작시각')}~${pick(row, '공휴일운영종료시각') || ''}`,
      closure && `휴관 ${closure}`
    ),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      libraryType: pick(row, '도서관유형'),
      operator: pick(row, '운영기관명'),
      seats: pick(row, '열람좌석수'),
      books: pick(row, '자료수(도서)'),
      loanLimit: pick(row, '대출가능권수'),
      loanDays: pick(row, '대출가능일수')
    }
  }, sourceOptions(FACILITY_SOURCES.PUBLIC_DATA, sourceId, SOURCE_URLS.libraries, row, options));
}

function festivalOperatingStatus(row, options = {}) {
  const endDate = String(pick(row, '축제종료일자') || '');
  const collectedDate = String(options.collectedAt || new Date().toISOString()).slice(0, 10);
  return endDate && endDate < collectedDate ? '종료' : '운영';
}

export function normalizeFestivalRecord(row, options = {}) {
  const name = pick(row, '축제명', '행사명');
  const address = pick(row, '소재지도로명주소', '소재지지번주소', '개최장소');
  const sourceId = pick(row, '관리번호') || `${name}:${pick(row, '축제시작일자')}:${address}`;
  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.PLAY,
    subtype: 'cultural-festival',
    status: festivalOperatingStatus(row, options),
    roadAddress: pick(row, '소재지도로명주소'),
    address,
    latitude: pick(row, '위도'),
    longitude: pick(row, '경도'),
    phone: pick(row, '전화번호'),
    homepage: pick(row, '홈페이지주소', '홈페이지'),
    hours: joinHours(pick(row, '축제시작일자'), pick(row, '축제종료일자')),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      venue: pick(row, '개최장소'),
      startDate: pick(row, '축제시작일자'),
      endDate: pick(row, '축제종료일자'),
      description: pick(row, '축제내용'),
      organizer: pick(row, '주관기관명'),
      host: pick(row, '주최기관명'),
      relatedInfo: pick(row, '관련정보')
    }
  }, sourceOptions(FACILITY_SOURCES.PUBLIC_DATA, sourceId, SOURCE_URLS.festivals, row, options));
}

export function normalizeMentalHealthCenterRecord(row, options = {}) {
  const name = pick(row, '건강증진센터명', '센터명', '시설명');
  const address = pick(row, '소재지도로명주소', '소재지지번주소', '주소');
  const sourceId = pick(row, '관리번호') || `${name}:${address}`;
  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.MEDICAL,
    subtype: 'mental-health-counseling',
    status: '운영',
    roadAddress: pick(row, '소재지도로명주소'),
    address,
    latitude: pick(row, '위도'),
    longitude: pick(row, '경도'),
    phone: pick(row, '운영기관전화번호', '관리기관전화번호', '전화번호'),
    hours: joinHours(
      pick(row, '운영시작시각') && `${pick(row, '운영시작시각')}~${pick(row, '운영종료시각') || ''}`,
      pick(row, '휴무일정보') && `휴무 ${pick(row, '휴무일정보')}`
    ),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      centerType: pick(row, '건강증진센터구분'),
      services: pick(row, '건강증진업무내용'),
      guide: pick(row, '기타이용안내'),
      operator: pick(row, '운영기관명'),
      socialWorkers: pick(row, '사회복지사수')
    }
  }, sourceOptions(FACILITY_SOURCES.PUBLIC_DATA, sourceId, SOURCE_URLS.healthCenters, row, options));
}

export function isCounselingHealthCenterRecord(row) {
  const text = [
    pick(row, '건강증진센터명', '센터명'),
    pick(row, '건강증진센터구분'),
    pick(row, '건강증진업무내용')
  ].filter(Boolean).join(' ');
  return /정신|상담|심리|자살예방|중독|아동청소년/.test(text);
}

export function normalizeDevelopmentalRehabRecord(row, options = {}) {
  const name = pick(row, '기관명', '시설명');
  const address = pick(row, '소재지도로명주소', '소재지지번주소', '주소');
  const sourceId = pick(row, '관리번호', '기관ID') || `${name}:${address}`;
  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.MEDICAL,
    subtype: 'developmental-rehabilitation',
    status: '운영',
    region: pick(row, '시도명'),
    subRegion: pick(row, '시군구명'),
    roadAddress: pick(row, '소재지도로명주소'),
    address,
    latitude: pick(row, '위도'),
    longitude: pick(row, '경도'),
    phone: pick(row, '전화번호'),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      serviceType: pick(row, '사업구분명'),
      managingOrganization: pick(row, '관리기관명', '관리기관'),
      managingOrganizationPhone: pick(row, '관리기관전화번호')
    }
  }, sourceOptions(FACILITY_SOURCES.PUBLIC_DATA, sourceId, SOURCE_URLS.developmentalRehab, row, options));
}

export function normalizeSharedChildcareRecord(row, options = {}) {
  const operator = pick(row, '운영기관');
  const rawName = pick(row, '기관명', '시설명', '나눔터명', '센터명') || operator;
  const name = rawName && /공동육아나눔터/.test(String(rawName))
    ? rawName
    : rawName && `${rawName} 공동육아나눔터`;
  const address = pick(row, '주소', '주소(도로명)', '소재지', '도로명주소', '소재지도로명주소');
  const rowId = pick(row, '연번', '기관ID', '관리번호');
  const sourceId = rowId ? `shared-childcare:${rowId}` : `${name}:${address}`;
  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.FAMILY,
    subtype: 'shared-childcare-space',
    status: pick(row, '운영현황', '상태') || '운영',
    region: pick(row, '시도', '시도명'),
    subRegion: pick(row, '시군구', '시군구명'),
    roadAddress: pick(row, '도로명주소', '주소(도로명)', '소재지도로명주소'),
    address,
    latitude: pick(row, '위도', 'latitude'),
    longitude: pick(row, '경도', 'longitude'),
    phone: pick(row, '전화번호', '연락처'),
    homepage: pick(row, '홈페이지', '홈페이지주소'),
    hours: pick(row, '운영시간'),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      operator
    }
  }, sourceOptions(FACILITY_SOURCES.PUBLIC_DATA, sourceId, SOURCE_URLS.sharedChildcare, row, options));
}

export function normalizeFamilyCounselingRecord(row, options = {}) {
  const name = pick(row, '센터명', '기관명');
  const address = pick(row, '주소', '소재지도로명주소');
  const sourceId = `${name}:${address}`;
  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.MEDICAL,
    subtype: 'family-counseling',
    status: '운영',
    region: pick(row, '지역', '시도'),
    roadAddress: address,
    address,
    phone: pick(row, '전화번호', '연락처'),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      certificationYear: pick(row, '인증년도'),
      certificationPeriod: pick(row, '인증기간'),
      certifiedExcellentCenter: true
    }
  }, sourceOptions(FACILITY_SOURCES.PUBLIC_DATA, sourceId, SOURCE_URLS.familyCounseling, row, options));
}

export function normalizeYouthCounselingRecord(row, options = {}) {
  const name = pick(row, '센터명', '기관명');
  const address = [pick(row, '주소1', '주소'), pick(row, '주소2', '상세주소')]
    .filter(Boolean)
    .map((part) => String(part).replace(/^[,\s]+/, '').trim())
    .join(' ');
  const sourceId = `${name}:${address}`;
  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.MEDICAL,
    subtype: 'youth-counseling-welfare',
    status: '운영',
    region: pick(row, '시도', '시도명'),
    roadAddress: address,
    address,
    latitude: pick(row, '위도'),
    longitude: pick(row, '경도'),
    phone: pick(row, '대표전화번호', '전화번호'),
    homepage: pick(row, '홈페이지', '홈페이지주소'),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      postalCode: pick(row, '우편번호'),
      fax: pick(row, 'FAX번호', '팩스번호')
    }
  }, sourceOptions(FACILITY_SOURCES.PUBLIC_DATA, sourceId, SOURCE_URLS.youthCounseling, row, options));
}

export function normalizeHiraHospitalRecord(row, options = {}) {
  const sourceId = pick(row, 'ykiho', '암호화요양기호', '기관ID');
  const name = pick(row, 'yadmNm', '병원명', '요양기관명');
  const subjectText = [
    pick(row, 'dgsbjtCdNm', '진료과목명'),
    pick(row, 'clCdNm', '종별코드명'),
    name
  ].filter(Boolean).join(' ');
  const subtype = /소아청소년과|소아과/.test(subjectText) ? 'pediatrics' : 'medical-facility';

  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.MEDICAL,
    subtype,
    status: pick(row, '운영현황', '상태') || '운영',
    region: pick(row, 'sidoCdNm', '시도명'),
    subRegion: pick(row, 'sgguCdNm', '시군구명'),
    address: pick(row, 'addr', '주소'),
    latitude: pick(row, 'YPos', 'yPos', '위도'),
    longitude: pick(row, 'XPos', 'xPos', '경도'),
    phone: pick(row, 'telno', '전화번호'),
    homepage: pick(row, 'hospUrl', '홈페이지'),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      institutionType: pick(row, 'clCdNm', '종별코드명'),
      medicalSubject: pick(row, 'dgsbjtCdNm', '진료과목명')
    }
  }, sourceOptions(FACILITY_SOURCES.HIRA, sourceId, SOURCE_URLS.hira, row, options));
}

export function isPediatricHospitalRecord(row) {
  const text = [
    pick(row, 'yadmNm', '병원명', '요양기관명'),
    pick(row, 'dgsbjtCdNm', '진료과목명')
  ].filter(Boolean).join(' ');
  return /소아청소년과|소아과|어린이병원/.test(text);
}

export function normalizeNursingRoomRecord(row, options = {}) {
  const name = pick(row, 'roomName', '시설명') || '유아휴게실';
  const address = pick(row, 'address', '주소');
  const sourceId = pick(row, 'roomNo', '관리번호') || `${name}:${address}`;
  return normalizeFacility({
    id: sourceId,
    name,
    category: FACILITY_CATEGORIES.NURSING,
    subtype: pick(row, 'roomTypeName') === '가족수유실' ? 'family-nursing-room' : 'nursing-room',
    status: pick(row, '운영현황') || '운영',
    region: pick(row, 'zoneName', '시도명'),
    subRegion: pick(row, 'cityName', '시군구명'),
    dong: pick(row, 'townName', '읍면동명'),
    address,
    latitude: pick(row, 'gpsLat', '위도'),
    longitude: pick(row, 'gpsLong', '경도'),
    phone: pick(row, 'managerTelNo', '전화번호'),
    sourceUpdatedAt: pick(row, '데이터기준일자'),
    attributes: {
      fatherAllowed: pick(row, 'fatherUseCode') === '1',
      roomType: pick(row, 'roomTypeName'),
      locationDetail: pick(row, 'location')
    }
  }, sourceOptions(FACILITY_SOURCES.NURSING_INFO, sourceId, SOURCE_URLS.nursing, row, options));
}

export const PUBLIC_SOURCE_ADAPTERS = Object.freeze({
  'tour-api': { normalize: normalizeTourRecord, include: isFamilyPlayTourRecord },
  'city-parks': { normalize: normalizeCityParkRecord, include: isFamilyPlayParkRecord },
  'community-child-centers': { normalize: normalizeCommunityChildCenterRecord },
  'museums-art-museums': { normalize: normalizeMuseumRecord },
  'libraries': { normalize: normalizeLibraryRecord },
  'cultural-festivals': { normalize: normalizeFestivalRecord },
  'mental-health-centers': { normalize: normalizeMentalHealthCenterRecord, include: isCounselingHealthCenterRecord },
  'developmental-rehab': { normalize: normalizeDevelopmentalRehabRecord },
  'shared-childcare': { normalize: normalizeSharedChildcareRecord },
  'family-counseling': { normalize: normalizeFamilyCounselingRecord },
  'youth-counseling-centers': { normalize: normalizeYouthCounselingRecord },
  'hira-pediatrics': { normalize: normalizeHiraHospitalRecord, include: isPediatricHospitalRecord },
  'nursing-rooms': { normalize: normalizeNursingRoomRecord }
});
