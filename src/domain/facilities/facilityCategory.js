export const UI_FACILITY_CATEGORIES = Object.freeze({
  CARE: '돌봄·지원센터',
  HOSPITAL: '병원·상담',
  FAMILY: '가족센터',
  DAYCARE: '어린이집',
  PLAY: '놀이·체험',
  NURSING: '유아휴게소'
});

const {
  CARE,
  HOSPITAL,
  FAMILY,
  DAYCARE,
  PLAY,
  NURSING
} = UI_FACILITY_CATEGORIES;

const CANONICAL_FACILITY_TYPES = new Set(Object.values(UI_FACILITY_CATEGORIES));

const CATEGORY_KEYWORDS = {
  [FAMILY]: ['가족센터', '건강가정', '다문화', '가족'],
  [HOSPITAL]: ['병원', '의원', '상담', '발달', '소아과', '정신', '치료', '심리', '허그맘'],
  [PLAY]: ['키즈카페', '놀이터', '박물관', '체험', '과학관', '도서관', '장난감', '미술관', '생태', '숲체험', '문화센터', '상상나라', '아트홀', '극단', '체육', '공원'],
  [CARE]: ['키움', '지원센터', '나눔터', '아동복지', '아동센터', '육아종합', '다함께', '지역아동', '꿈나무', '돌봄', '방과후'],
  [NURSING]: ['유아휴게소', '수유실', '휴게실']
};

export function normalizeFacilityCategory(typeValue, nameValue) {
  const rawType = String(typeValue || '').trim();
  const rawName = String(nameValue || '').trim();
  if (CANONICAL_FACILITY_TYPES.has(rawType)) return rawType;

  const normalizedType = rawType.toLowerCase();
  const normalizedName = rawName.toLowerCase();
  if (/(어린이집|보육시설|유치원|daycare|kindergarten)/.test(normalizedType)
    || /(어린이집|유치원)/.test(normalizedName)) {
    return DAYCARE;
  }

  const searchable = `${normalizedType} ${normalizedName}`;
  for (const category of [FAMILY, HOSPITAL, PLAY, NURSING, CARE]) {
    if (CATEGORY_KEYWORDS[category].some((keyword) => searchable.includes(keyword))) {
      return category;
    }
  }

  return CARE;
}

export function isDeferredDaycareFacility(facility) {
  const subtype = String(facility?.subtype || '').trim().toLowerCase();
  if (/^(daycare|kindergarten)$/.test(subtype)) return true;

  const explicitCategory = [facility?.type, facility?.category]
    .map((value) => String(value || '').trim())
    .find((value) => CANONICAL_FACILITY_TYPES.has(value));
  if (explicitCategory) return explicitCategory === DAYCARE;

  return normalizeFacilityCategory(
    [facility?.type, facility?.category].filter(Boolean).join(' '),
    facility?.name || ''
  ) === DAYCARE;
}
