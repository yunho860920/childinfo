// src/utils/regionUtils.js

/**
 * 주소 문자열과 시설 명칭을 기반으로 지역(시/도), 시/군/구, 읍/면/동 정보를 추출합니다.
 */
const MANUAL_DONG_CORRECTIONS = {
  '서울창포원': '도봉동',
  '창포원': '도봉동',
  '서울숲': '성수동',
  '올림픽공원': '방이동',
  '어린이대공원': '능동',
  '월드컵공원': '성산동',
  '보라매공원': '신대방동'
};

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

export function normalizeRegionName(value) {
  const cleaned = String(value || '').replace(/[()]/g, '').trim();
  if (!cleaned) return '기타';
  if (REGION_ALIASES.has(cleaned)) return REGION_ALIASES.get(cleaned);
  const firstToken = cleaned.split(/\s+/)[0];
  if (REGION_ALIASES.has(firstToken)) return REGION_ALIASES.get(firstToken);
  for (const [alias, canonical] of REGION_ALIASES) {
    if (cleaned.startsWith(alias)) return canonical;
  }
  return '기타';
}

export function parseAggressiveRegion(addrStr, facName = "") {
  // 수동 보정 데이터 확인
  for (const [key, value] of Object.entries(MANUAL_DONG_CORRECTIONS)) {
    if (facName && facName.includes(key)) {
      const base = parseAggressiveRegionBase(addrStr, facName);
      return { ...base, dong: value };
    }
  }

  return parseAggressiveRegionBase(addrStr, facName);
}

function parseAggressiveRegionBase(addrStr, facName = "") {
  const parts = (addrStr || "").split(" ").filter(p => p.trim());
  let region = '기타';
  let subRegion = '전체';
  let dong = '전체';

  if (parts.length > 0) {
    const first = parts[0];
    
    // 주요 광역시/도 매핑 (간략화된 SIGGUNGU_DICT logic)
    region = normalizeRegionName(first);
    
    // 시/군/구 추출
    if (parts.length >= 2) {
      const second = parts[1];
      if (second.endsWith('구') || second.endsWith('시') || second.endsWith('군')) {
        subRegion = second;
      } else if (parts[2] && (parts[2].endsWith('구') || parts[2].endsWith('시'))) {
        subRegion = parts[2];
      } else {
        subRegion = second;
      }
    }
    
    // 읍/면/동 추출 (모든 파트를 스캔하여 가장 적합한 것 선택)
    for (let i = 2; i < parts.length; i++) {
      // 괄호 제거 (예: (창동) -> 창동)
      let p = parts[i].replace(/[()]/g, '').trim();
      
      // '동', '읍', '면'으로 끝나고 길이가 2자 이상인 토큰 검색
      if ((p.endsWith('동') || p.endsWith('읍') || p.endsWith('면')) && p.length > 1) {
        // '로', '길'로 끝나는 도로명 주소 토큰은 제외 (단, '동'으로 끝나는 도로명은 드물지만 처리)
        if (!p.endsWith('로') && !p.endsWith('길')) {
          dong = p;
          break;
        }
      }
    }
  }

  // Fallback: 주소에 동 정보가 없으면 시설 명칭에서 추출 시도
  if (dong === '전체' && facName) {
    // 시설명에서 '이마트', '홈플러스' 등 브랜드명 제외 후 추출 시도
    const cleanName = facName.replace(/이마트|홈플러스|하나로마트|롯데마트|신세계|현대백화점/g, '');
    // '창동', '쌍문동' 등 2~4자의 동/읍/면 명칭 검색
    const dongMatch = cleanName.match(/([가-힣]{2,4}(?:동|읍|면))/);
    if (dongMatch) {
      // 추출된 명칭이 너무 길면(예: '도봉산역점'에서 '도봉산역' 등) 제외하고 순수 지역명만 선택
      dong = dongMatch[1];
    }
  }

  // 기타 지역 보정
  if (region === '기타') {
    if (facName.includes('서울')) region = '서울';
    else if (facName.includes('경기')) region = '경기';
    else if (facName.includes('부산')) region = '부산';
  }

  return { region, subRegion, dong };
}

/**
 * 행정동 명칭을 법정동 명칭으로 정규화합니다. (예: 창1동 -> 창동)
 */
export function normalizeDong(dong) {
  if (!dong || dong === '전체') return '전체';
  return dong.replace(/\d+동$/, '동').replace(/\s/g, '');
}

/**
 * 명칭이 유효한 행정/법정동 단위(동/읍/면)인지 확인합니다.
 */
export function isValidDong(name) {
  if (!name || name === '전체') return false;
  const p = name.replace(/[()]/g, '').trim();
  return (p.endsWith('동') || p.endsWith('읍') || p.endsWith('면')) && !p.endsWith('로') && !p.endsWith('길') && p.length > 1;
}
