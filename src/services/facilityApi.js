// facilityApi.js - Unified Query Engine for Nationwide Infrastructure
import { seoulInfra } from '../data/infrastructure/seoul/index';
import { gyeonggiInfra } from '../data/infrastructure/gyeonggi/index';
import { incheonInfra } from '../data/infrastructure/incheon/index';
import { busanInfra } from '../data/infrastructure/busan/index';
import { daeguInfra } from '../data/infrastructure/daegu/index';
import { daejeonInfra } from '../data/infrastructure/daejeon/index';
import { gwangjuInfra } from '../data/infrastructure/gwangju/index';
import { ulsanInfra } from '../data/infrastructure/ulsan/index';
import { sejongInfra } from '../data/infrastructure/sejong/index';
import { gangwonInfra } from '../data/infrastructure/gangwon/index';
import { chungbukInfra } from '../data/infrastructure/chungbuk/index';
import { chungnamInfra } from '../data/infrastructure/chungnam/index';
import { jeonbukInfra } from '../data/infrastructure/jeonbuk/index';
import { jeonnamInfra } from '../data/infrastructure/jeonnam/index';
import { gyeongbukInfra } from '../data/infrastructure/gyeongbuk/index';
import { gyeongnamInfra } from '../data/infrastructure/gyeongnam/index';
import { jejuInfra } from '../data/infrastructure/jeju/index';
import { hospitalsInfra } from '../data/infrastructure/hospitals_infra';
import { nursingRoomsInfra } from '../data/infrastructure/nursing_rooms';
import { fetchNursingRoomsFromApi } from './nursingRoomService';
import { parseAggressiveRegion } from '../utils/regionUtils';

// System Database: High-density verified data
const SYSTEM_DATABASE = [
  ...seoulInfra,
  ...gyeonggiInfra,
  ...incheonInfra,
  ...busanInfra,
  ...daeguInfra,
  ...daejeonInfra,
  ...gwangjuInfra,
  ...ulsanInfra,
  ...sejongInfra,
  ...gangwonInfra,
  ...chungbukInfra,
  ...chungnamInfra,
  ...jeonbukInfra,
  ...jeonnamInfra,
  ...gyeongbukInfra,
  ...gyeongnamInfra,
  ...jejuInfra,
  ...hospitalsInfra,
  ...nursingRoomsInfra
];

const SIGGUNGU_DICT = {
  '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  // ... (Preserved internally)
  '경기': ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
  '인천': ['강화군', '계양구', '미추홀구', '남동구', '동구', '부평구', '서구', '연수구', '옹진군', '중구'],
  '부산': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  '대구': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구', '군위군'],
  '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
  '광주': ['광산구', '남구', '동구', '북구', '서구'],
  '울산': ['남구', '동구', '북구', '울주군', '중구'],
  '세종': ['세종시'],
  '강원': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
  '충북': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
  '충남': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
  '전북': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '진안군', '정읍시'],
  '전남': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
  '경북': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
  '경남': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
  '제주': ['제주시', '서귀포시']
};

export async function fetchChildFacilities() {
  const apiKey = import.meta.env.VITE_BW_API_KEY;
  const nursingApiKey = import.meta.env.VITE_NURSING_API_KEY;
  let apiFacilities = [];

  if (apiKey) {
    const pagesToFetch = [1, 2, 10, 80];
    try {
      const requests = pagesToFetch.map(page => {
        const url = `https://apis.data.go.kr/B554287/sclWlfrFcltInfoInqirService1/getFcltListInfoInqire?serviceKey=${encodeURIComponent(apiKey)}&pageNo=${page}&numOfRows=200&_type=json`;
        return fetch(url, { signal: AbortSignal.timeout(10000) })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null);
      });

      const results = await Promise.all(requests);
      for (const data of results) {
        if (!data?.response?.body?.items) continue;
        let items = data.response.body.items.item || [];
        if (!Array.isArray(items)) items = [items];
        
        const filtered = items.filter(fac => {
          const name = (fac.fcltNm || "").toLowerCase();
          if (name.includes('노인') || name.includes('경로')) return false;
          const type = (fac.fcltKindNm || "").toLowerCase();
          const keywords = ['아동', '육아', '어린이', '가족', '키움', '보육', '다함께', '상담', '심리', '병원'];
          return keywords.some(k => type.includes(k) || name.includes(k));
        });

        apiFacilities.push(...filtered.map(fac => {
          const fullAddr = fac.jrsdSggNm || "";
          const name = fac.fcltNm || "시설";
          const { region, subRegion, dong } = parseAggressiveRegion(fullAddr, name);
          
          return {
            id: fac.fcltCd,
            name: name,
            type: mapFacilityType(fac.fcltKindNm || '', name),
            region: region,
            subRegion: subRegion,
            dong: dong,
            address: fullAddr,
            mapUrl: `https://map.kakao.com/?q=${encodeURIComponent(name)}`
          };
        }));
      }
    } catch (e) { console.error(e); }
  }

  // --- NEW: Fetch Nursing Rooms via separate API ---
  let apiNursingRooms = [];
  try {
    // Attempt to use the same API key if applicable, or the service handles its own logic
    apiNursingRooms = await fetchNursingRoomsFromApi(nursingApiKey);
  } catch (e) {
    console.error("Nursing Room API Fetch Failed:", e);
  }

  // Normalize System Database types to match UI categories
  const normalizedSystem = SYSTEM_DATABASE.map(fac => ({
    ...fac,
    type: mapFacilityType(fac.type || '', fac.name)
  }));

  const allData = [...normalizedSystem, ...apiFacilities, ...apiNursingRooms];
  const seenNames = new Set();
  return allData.filter(fac => {
    const uniqueKey = `${fac.name}-${fac.region}-${fac.subRegion}`;
    if (seenNames.has(uniqueKey)) return false;
    seenNames.add(uniqueKey);
    return true;
  });
}

// EXACT categories from uiConstants.js to avoid middle-dot (·) mismatches
const CAT_CARE = '돌봄·지원센터';
const CAT_HOSPITAL = '병원·상담';
const CAT_FAMILY = '가족센터';
const CAT_DAYCARE = '어린이집';
const CAT_PLAY = '놀이·체험';
const CAT_NURSING = '유아휴게소';

const CATEGORY_KEYWORDS = {
  [CAT_DAYCARE]: ['어린이집', '보육', '유치원', '집'],
  [CAT_FAMILY]: ['가족센터', '건강가정', '다문화', '가족'],
  [CAT_HOSPITAL]: ['병원', '의원', '상담', '발달', '소아과', '정신', '치료', '심리', '허그맘'],
  [CAT_PLAY]: ['키즈카페', '놀이터', '박물관', '체험', '과학관', '도서관', '장난감', '미술관', '생태', '숲체험', '문화센터', '상상나라', '아트홀', '극단', '체육', '공원'],
  [CAT_CARE]: ['키움', '지원센터', '나눔터', '아동복지', '아동센터', '육아종합', '다함께', '지역아동', '꿈나무', '돌봄', '방과후'],
  [CAT_NURSING]: ['유아휴게소', '수유실', '휴게실']
};

function normalizeCategory(typeStr, nameStr) {
  const t = (typeStr + nameStr).toLowerCase();
  
  if (t.includes('어린이집')) return CAT_DAYCARE;
  if (t.includes('가족센터') || t.includes('건강가정') || t.includes('다문화')) return CAT_FAMILY;
  if (t.includes('병원') || t.includes('의원') || t.includes('상담') || t.includes('발달') || t.includes('소아과') || t.includes('정신') || t.includes('심리')) return CAT_HOSPITAL;
  
  for (const k of CATEGORY_KEYWORDS[CAT_PLAY]) {
    if (t.includes(k)) return CAT_PLAY;
  }

  for (const k of CATEGORY_KEYWORDS[CAT_NURSING]) {
    if (t.includes(k)) return CAT_NURSING;
  }

  for (const k of CATEGORY_KEYWORDS[CAT_CARE]) {
    if (t.includes(k)) return CAT_CARE;
  }
  
  return CAT_CARE; // Default fall-through
}

export const getFilteredFacilities = (facilities, region, subRegion, dong, query, category = '전체') => {
  if (!facilities || !Array.isArray(facilities)) return [];
  
  return facilities.filter(f => {
    // 1. Precise Category Normalization
    const facilityCat = normalizeCategory(f.type || '', f.name || '');
    const matchCategory = category === '전체' || facilityCat === category;

    // 2. Geographic Filtering (Region/SubRegion)
    const matchRegion = region === '전체' || f.region === region;
    const matchSub = subRegion === '전체' || f.subRegion === subRegion;
    // Fix: If a specific dong is selected, show facilities belonging to that dong.
    // If a facility has '전체' dong, it only matches if the filter is '전체' OR if the name/address contains the dong.
    const matchDong = !dong || dong === '전체' || f.dong === dong || (f.dong === '전체' && (f.name.includes(dong) || f.address.includes(dong)));
    
    // 3. Search Query (Name/Address/Category)
    const lowerQuery = (query || "").toLowerCase();
    const matchQuery = !query || 
      (f.name || "").toLowerCase().includes(lowerQuery) || 
      (f.address || "").toLowerCase().includes(lowerQuery) ||
      (facilityCat).toLowerCase().includes(lowerQuery);
      
    return matchRegion && matchSub && matchDong && matchCategory && matchQuery;
  });
}

function mapFacilityType(rawType, name) {
  return normalizeCategory(rawType, name);
}
// Local helper moved to regionUtils.js

