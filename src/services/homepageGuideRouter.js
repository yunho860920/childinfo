import { vaccinationSchedule } from '../data/healthInfo.js';
import { milestonesData } from '../data/milestones.js';
import { fetchWelfareServices } from './welfareApi.js';

const REGION_DEFINITIONS = [
  { id: 'seoul', label: '서울', aliases: ['서울', '서울특별시'] },
  { id: 'gyeonggi', label: '경기', aliases: ['경기', '경기도'] },
  { id: 'incheon', label: '인천', aliases: ['인천', '인천광역시'] },
  { id: 'busan', label: '부산', aliases: ['부산', '부산광역시'] },
  { id: 'daegu', label: '대구', aliases: ['대구', '대구광역시'] },
  { id: 'daejeon', label: '대전', aliases: ['대전', '대전광역시'] },
  { id: 'gwangju', label: '광주', aliases: ['광주', '광주광역시'] },
  { id: 'ulsan', label: '울산', aliases: ['울산', '울산광역시'] },
  { id: 'sejong', label: '세종', aliases: ['세종', '세종시', '세종특별자치시'] },
  { id: 'gangwon', label: '강원', aliases: ['강원', '강원도', '강원특별자치도'] },
  { id: 'chungbuk', label: '충북', aliases: ['충북', '충청북도'] },
  { id: 'chungnam', label: '충남', aliases: ['충남', '충청남도'] },
  { id: 'jeonbuk', label: '전북', aliases: ['전북', '전라북도', '전북특별자치도'] },
  { id: 'jeonnam', label: '전남', aliases: ['전남', '전라남도'] },
  { id: 'gyeongbuk', label: '경북', aliases: ['경북', '경상북도'] },
  { id: 'gyeongnam', label: '경남', aliases: ['경남', '경상남도'] },
  { id: 'jeju', label: '제주', aliases: ['제주', '제주도', '제주특별자치도'] }
];

const PLACE_INTENT = /(놀러|나들이|가\s*볼\s*만\s*한\s*곳|가볼\s*만한\s*곳|가볼\s*곳|갈\s*만한|외출|(?:아이|아기|아동|어린이)(?:와|랑|과)\s*(?:갈|가볼|놀|체험)|장소\s*추천|체험(?:시설|장소)?\s*추천|어디(?:에|로)?\s*(?:갈|놀))/;
const FACILITY_INTENT = /(소아과|소아청소년과|병원|의원|응급실|상담|심리|발달센터|수유실|어린이집|육아종합지원센터|가족센터|유아휴게소|돌봄센터|놀이시설|체험시설|시설)/;
const WELFARE_INTENT = /(복지|혜택|지원금|수당|바우처|부모급여|첫만남이용권|육아휴직|보육료)/;
const VACCINE_INTENT = /(예방접종|접종|백신)/;
const LOCATION_WORDS = /(근처|주변|가까운|내\s*위치|현재\s*위치|우리\s*동네)/;

const GUIDE_TOPICS = [
  { id: 'feeding', pattern: /(수유량|수유|분유|모유|이유식|밥\s*안\s*먹|편식|식사)/, words: ['수유', '분유', '모유', '이유식', '식습관', '식사', '편식'] },
  { id: 'sleep', pattern: /(잠|수면|낮잠|밤낮|재우)/, words: ['수면', '잠', '밤낮'] },
  { id: 'play', pattern: /(놀아\s*(?:주|줘)|놀이\s*방법|장난감|터미타임|배밀이)/, words: ['놀이', '장난감', '터미타임', '배밀이', '신체'] },
  { id: 'dental', pattern: /(치아|이앓이|양치|칫솔|유치)/, words: ['치아', '이앓이', '양치', '유치'] },
  { id: 'walking', pattern: /(걷기|걸음마|잡고\s*서|서기)/, words: ['걷기', '걸음마', '잡고', '서기'] },
  { id: 'diaper', pattern: /(기저귀\s*떼|배변|변기)/, words: ['기저귀', '배변', '변기'] },
  { id: 'language', pattern: /(옹알이|언어\s*발달|말이\s*늦|첫\s*단어)/, words: ['옹알이', '언어', '첫 단어'] },
  { id: 'books', pattern: /(책\s*읽|그림책)/, words: ['책', '그림책'] },
  { id: 'tantrum', pattern: /(떼쓰|떼쟁|분노발작|고집)/, words: ['떼쓰기', '분노발작', '고집', '정서'] },
  { id: 'media', pattern: /(미디어|스마트폰|유튜브|영상\s*노출|TV)/i, words: ['미디어', '스마트폰', '노출'] }
];

const normalize = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();

const readRequestedMonths = (message, fallback) => {
  const monthMatch = message.match(/(\d{1,3})\s*개월/);
  if (monthMatch) return Number(monthMatch[1]);

  const yearMatch = message.match(/(\d{1,2})\s*(?:살|세)/);
  if (yearMatch) return Number(yearMatch[1]) * 12;

  return Number.isFinite(Number(fallback)) ? Number(fallback) : 0;
};

const extractRegion = (message) => REGION_DEFINITIONS.find((region) =>
  region.aliases.some((alias) => message.includes(alias))
) || null;

const getAllPlaces = (places = {}) => Object.entries(places).flatMap(([regionId, regionPlaces]) => {
  const region = REGION_DEFINITIONS.find((item) => item.id === regionId);
  return (Array.isArray(regionPlaces) ? regionPlaces : []).map((place) => ({
    ...place,
    regionId,
    regionLabel: region?.label || regionId
  }));
});

const findMentionedSubRegion = (message, entries, region) => {
  const known = new Set();
  entries.forEach((entry) => {
    if (entry?.subRegion && entry.subRegion !== '전체') known.add(entry.subRegion);
    String(entry?.address || '')
      .split(/[\s,()]+/)
      .map((value) => value.replace(/[^가-힣]/g, ''))
      .filter((value) => value.length >= 2 && /(?:시|군|구)$/.test(value))
      .forEach((value) => known.add(value));
  });

  return [...known]
    .filter((value) => !region?.aliases.includes(value))
    .sort((a, b) => b.length - a.length)
    .find((value) => {
      if (message.includes(value)) return true;
      const shortened = value.replace(/(?:시|군|구)$/, '');
      if (shortened.length < 2 || region?.aliases.includes(shortened)) return false;
      return message.includes(shortened);
    }) || '';
};

const distanceKm = (from, to) => {
  if (![from?.lat, from?.lng, to?.lat, to?.lng].every((value) => Number.isFinite(Number(value)))) return null;
  const toRad = (degree) => degree * Math.PI / 180;
  const earthKm = 6371;
  const dLat = toRad(Number(to.lat) - Number(from.lat));
  const dLng = toRad(Number(to.lng) - Number(from.lng));
  const lat1 = toRad(Number(from.lat));
  const lat2 = toRad(Number(to.lat));
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (kilometers) => {
  if (!Number.isFinite(kilometers)) return '';
  if (kilometers < 1) return `${Math.max(10, Math.round(kilometers * 1000 / 10) * 10)}m`;
  return `${kilometers.toFixed(kilometers < 10 ? 1 : 0)}km`;
};

const SOURCE_LABELS = {
  hira: '건강보험심사평가원',
  sooyusil: '수유시설 정보',
  'visit-korea-tour-api': '한국관광공사 TourAPI',
  'data-go-kr': '공공데이터'
};

const getSourceLabel = (source) => SOURCE_LABELS[source] || '홈페이지 등록 정보';

const makePlaceItem = (place, distance) => ({
  kind: 'place',
  title: `${place.emoji || '📍'} ${place.name}`,
  subtitle: [formatDistance(distance), place.category].filter(Boolean).join(' · '),
  detail: [place.notes, place.address].filter(Boolean).join('\n'),
  meta: place.babyRoom
    ? `아기 편의시설: ${place.babyRoom}`
    : place.source
      ? `출처: ${getSourceLabel(place.source)}`
      : '',
  action: place.isFacilityRecord
    ? {
        tab: 'facilities',
        label: '시설에서 보기',
        query: place.name,
        category: '놀이·체험',
        region: place.regionLabel,
        subRegion: place.subRegion
      }
    : {
        tab: 'stamps',
        label: '가볼 곳에서 보기',
        region: place.regionId,
        spotId: place.id
      }
});

const getRequestedAgeLabel = (message, fallbackMonths) => {
  const yearMatch = message.match(/(\d{1,2})\s*(?:살|세)/);
  if (yearMatch) return `${Number(yearMatch[1])}세 아이와`;

  const monthMatch = message.match(/(\d{1,3})\s*개월/);
  if (monthMatch) return `${Number(monthMatch[1])}개월 아이와`;

  const months = Number(fallbackMonths);
  return Number.isFinite(months) && months > 0 ? `${months}개월 아이와` : '아이와';
};

const CHILD_FRIENDLY_PLACE = /(어린이|유아|아동|키즈|상상나라|체험|과학관|박물관|도서관|동물원|수족관|아쿠아리움|식물원|수목원|놀이터|공원|숲)/;
const LOW_VALUE_PLACE = /(스토어|매장|백화점|면세점|식당|레스토랑|카페|주점|골프|축제|행사)/;

const getPlaceRelevanceScore = (place, requestedMonths) => {
  const name = String(place.name || '');
  const details = `${name} ${place.category || ''} ${place.notes || ''}`;
  let score = place.isCurated ? 30 : 0;
  if (CHILD_FRIENDLY_PLACE.test(name)) score += 18;
  if (CHILD_FRIENDLY_PLACE.test(details)) score += 8;
  if (place.babyRoom && !/없음/.test(place.babyRoom)) score += 6;
  if (requestedMonths > 0 && requestedMonths <= 72 && /(영유아|어린이|유아|아기|놀이|체험|동물)/.test(details)) score += 8;
  if (LOW_VALUE_PLACE.test(name)) score -= 40;
  return score;
};

const getFacilityPlaces = (facilities = []) => facilities
  .filter((facility) => facility?.type === '놀이·체험'
    || facility?.category === '놀이·체험'
    || facility?.source === 'visit-korea-tour-api')
  .filter((facility) => facility?.status !== 'inactive')
  .map((facility) => {
    const region = REGION_DEFINITIONS.find((item) => item.label === facility.region);
    return {
      id: facility.id,
      name: facility.name,
      category: facility.type || facility.category || '놀이·체험',
      address: facility.address || '',
      lat: facility.lat,
      lng: facility.lng,
      regionId: region?.id || '',
      regionLabel: facility.region || region?.label || '',
      subRegion: facility.subRegion || '전체',
      source: facility.source,
      isFacilityRecord: true,
      isCurated: false
    };
  });

const dedupePlaces = (places) => {
  const seen = new Set();
  return places.filter((place) => {
    const key = normalize(`${place.name}|${place.address}`);
    if (!place.name || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const resolvePlaces = ({ message, places, facilities, location, childInfo }) => {
  const curatedPlaces = getAllPlaces(places).map((place) => ({ ...place, isCurated: true }));
  const allPlaces = dedupePlaces([...curatedPlaces, ...getFacilityPlaces(facilities)]);
  const region = extractRegion(message);
  const regionalPlaces = region
    ? allPlaces.filter((place) => place.regionId === region.id || place.regionLabel === region.label)
    : allPlaces;
  const subRegion = findMentionedSubRegion(message, regionalPlaces, region);
  const hasCoordinates = Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));

  let candidates = allPlaces;
  if (region) candidates = regionalPlaces;

  if (!region && subRegion) {
    const matchedPlace = candidates.find((place) => String(place.address || '').includes(subRegion));
    if (matchedPlace) candidates = candidates.filter((place) => place.regionId === matchedPlace.regionId);
  }

  if (!hasCoordinates && !region && !subRegion) {
    return {
      mode: 'homepage',
      answer: '좋아요. 어느 지역에서 찾을까요? 현재 위치를 허용하면 등록된 장소 중 가까운 순서로 찾아드릴게요.',
      actions: [
        { type: 'location', intent: 'places', label: '현재 위치 사용' },
        ...REGION_DEFINITIONS.slice(0, 4).map((item) => ({
          type: 'reply',
          intent: 'places',
          label: item.label,
          message: `${item.label}에서 아기와 갈 곳 추천해줘`
        }))
      ],
      sources: ['홈페이지 아기랑 놀러가요'],
      pendingIntent: 'places'
    };
  }

  if (/실내/.test(message)) {
    candidates = candidates.filter((place) => !/(공원|자연|수목원|숲|야외)/.test(place.category));
  } else if (/(야외|산책|피크닉)/.test(message)) {
    candidates = candidates.filter((place) => /(공원|자연|수목원|숲|산책|피크닉)/.test(`${place.category} ${place.notes}`));
  }

  if (/무료/.test(message)) {
    const freePlaces = candidates.filter((place) => /무료/.test(place.notes));
    if (freePlaces.length) candidates = freePlaces;
  }

  const childFriendlyCandidates = candidates.filter((place) => !place.isFacilityRecord
    || CHILD_FRIENDLY_PLACE.test(`${place.name} ${place.category}`));
  if (childFriendlyCandidates.length >= 3) candidates = childFriendlyCandidates;

  const requestedMonths = readRequestedMonths(message, childInfo?.months);

  const ranked = candidates
    .map((place) => ({
      place,
      distance: hasCoordinates ? distanceKm(location, place) : null,
      localScore: subRegion && String(place.address || '').includes(subRegion) ? 1 : 0,
      relevanceScore: getPlaceRelevanceScore(place, requestedMonths)
    }))
    .sort((a, b) => {
      if (a.localScore !== b.localScore) return b.localScore - a.localScore;
      if (Number.isFinite(a.distance) && Number.isFinite(b.distance)) return a.distance - b.distance;
      if (a.relevanceScore !== b.relevanceScore) return b.relevanceScore - a.relevanceScore;
      return String(a.place.name).localeCompare(String(b.place.name), 'ko');
    })
    .slice(0, 3);

  if (!ranked.length) {
    const label = region?.label || subRegion || '선택한 지역';
    return {
      mode: 'homepage',
      answer: `${label}에서 바로 추천할 수 있는 장소를 찾지 못했어요. 다른 지역을 선택하거나 전국 놀이·체험 시설에서 조건을 바꿔 확인해 주세요.`,
      actions: [{ tab: 'facilities', label: '전국 놀이·체험 보기', category: '놀이·체험' }],
      sources: ['홈페이지 전국 놀이·체험 시설 데이터']
    };
  }

  const locationLabel = hasCoordinates ? '현재 위치 근처에서' : `${region?.label || ranked[0].place.regionLabel}${subRegion ? ` ${subRegion}` : ''}에서`;
  const ageLabel = getRequestedAgeLabel(message, childInfo?.months);
  const selectedSources = new Set(ranked.map(({ place }) => place.source).filter(Boolean));
  const sources = ['홈페이지 아기랑 놀러가요'];
  if (selectedSources.size) sources.push('홈페이지 전국 놀이·체험 시설 데이터');

  const followUpPrefix = [region?.label, subRegion, ageLabel].filter(Boolean).join(' ');

  return {
    mode: 'homepage',
    answer: `${locationLabel} ${ageLabel} 가볼 만한 후보 ${ranked.length}곳을 골랐어요. 어린이 체험관·박물관·공원처럼 아이와 함께 즐기기 좋은 유형과 등록된 편의 정보를 우선했어요. 운영시간·예약·연령 제한은 방문 전에 해당 시설에서 확인해 주세요.`,
    items: ranked.map(({ place, distance }) => makePlaceItem(place, distance)),
    actions: [
      { type: 'reply', intent: 'places', label: '실내 위주', message: `${followUpPrefix} 실내 가볼 곳 추천해줘` },
      { type: 'reply', intent: 'places', label: '무료 위주', message: `${followUpPrefix} 무료 가볼 곳 추천해줘` },
      {
        tab: 'facilities',
        label: '놀이·체험 전체 보기',
        category: '놀이·체험',
        region: region?.label || ranked[0].place.regionLabel
      }
    ],
    sources
  };
};

const facilityText = (facility) => normalize([
  facility?.name,
  facility?.type,
  facility?.category,
  facility?.subtype,
  facility?.source,
  facility?.address,
  facility?.attributes ? JSON.stringify(facility.attributes) : ''
].filter(Boolean).join(' '));

const FACILITY_SEARCH_PROFILES = [
  {
    id: 'pediatrics',
    label: '소아청소년과',
    category: '병원·상담',
    pattern: /(소아과|소아청소년과)/,
    matches: (facility) => facility?.source === 'hira'
      || facility?.subtype === 'pediatrics'
  },
  {
    id: 'emergency',
    label: '응급실',
    category: '병원·상담',
    pattern: /응급실|응급의료|응급/,
    matches: (facility) => facility?.source === 'e-gen'
      || /emergency/.test(String(facility?.subtype || ''))
      || /응급/.test(facilityText(facility))
  },
  {
    id: 'nursing',
    label: '수유실·유아휴게소',
    category: '유아휴게소',
    pattern: /(수유실|유아휴게소|모유수유)/,
    matches: (facility) => facility?.source === 'sooyusil'
      || /nursing/.test(String(facility?.subtype || ''))
      || facility?.type === '유아휴게소'
      || facility?.category === '유아휴게소'
  },
  {
    id: 'daycare',
    label: '어린이집',
    category: '어린이집',
    pattern: /어린이집|보육시설/,
    matches: (facility) => facility?.type === '어린이집'
      || facility?.category === '어린이집'
      || facility?.subtype === 'daycare'
  },
  {
    id: 'family-center',
    label: '가족센터',
    category: '가족센터',
    pattern: /가족센터|건강가정|다문화가족/,
    matches: (facility) => facility?.type === '가족센터'
      || facility?.category === '가족센터'
      || /family-(?:center|counseling)/.test(String(facility?.subtype || ''))
      || /(가족센터|건강가정|다문화가족)/.test(facilityText(facility))
  },
  {
    id: 'childcare-support',
    label: '육아종합지원센터',
    category: '돌봄·지원센터',
    pattern: /육아종합지원센터|육아지원센터/,
    matches: (facility) => facility?.subtype === 'childcare-support-center'
      || /육아종합지원센터|육아지원센터/.test(facilityText(facility))
  },
  {
    id: 'counseling',
    label: '상담·발달 지원',
    category: '병원·상담',
    pattern: /상담|심리|정신건강|발달센터|발달지원/,
    matches: (facility) => /counseling|mental-health|developmental/.test(String(facility?.subtype || ''))
      || /상담|심리|정신건강|발달센터|발달지원/.test(facilityText(facility))
  },
  {
    id: 'hospital',
    label: '병원·의원',
    category: '병원·상담',
    pattern: /병원|의원|의료원|클리닉/,
    matches: (facility) => facility?.source === 'hira'
      || facility?.source === 'e-gen'
      || /pediatrics|emergency/.test(String(facility?.subtype || ''))
      || /병원|의원|의료원|클리닉/.test(String(facility?.name || ''))
  },
  {
    id: 'play',
    label: '놀이·체험',
    category: '놀이·체험',
    pattern: /놀이시설|체험시설|놀이·체험/,
    matches: (facility) => facility?.type === '놀이·체험'
      || facility?.category === '놀이·체험'
      || facility?.source === 'visit-korea-tour-api'
  },
  {
    id: 'care',
    label: '돌봄·지원센터',
    category: '돌봄·지원센터',
    pattern: /돌봄센터|지역아동센터|키움센터|다함께돌봄|지원센터/,
    matches: (facility) => facility?.type === '돌봄·지원센터'
      || facility?.category === '돌봄·지원센터'
      || /care|support|child-center/.test(String(facility?.subtype || ''))
  }
];

const GENERIC_FACILITY_PROFILE = {
  id: 'all',
  label: '육아 시설',
  category: '전체',
  pattern: /시설/,
  matches: () => true
};

const getFacilityProfile = (message, pendingIntent) => {
  if (/(소아과|소아청소년과)/.test(message) && /(수유실|유아휴게소|모유수유)/.test(message)) {
    return FACILITY_SEARCH_PROFILES.find((profile) => profile.id === 'pediatrics');
  }
  if (/(병원|의원|의료원|클리닉)/.test(message) && /(수유실|유아휴게소|모유수유)/.test(message)) {
    return FACILITY_SEARCH_PROFILES.find((profile) => profile.id === 'hospital');
  }
  const direct = FACILITY_SEARCH_PROFILES.find((profile) => profile.pattern.test(message));
  if (direct) return direct;

  const pendingValue = String(pendingIntent || '').startsWith('facilities:')
    ? String(pendingIntent).slice('facilities:'.length)
    : '';
  if (!pendingValue) return GENERIC_FACILITY_PROFILE;

  return FACILITY_SEARCH_PROFILES.find((profile) => profile.id === pendingValue
    || profile.label === pendingValue
    || profile.pattern.test(pendingValue)) || GENERIC_FACILITY_PROFILE;
};

const getFacilityScore = (facility, profile, subRegion) => {
  const text = facilityText(facility);
  let score = 0;
  if (facility?.status === 'active') score += 2;
  if (facility?.address) score += 1;
  if (subRegion && (facility?.subRegion === subRegion || String(facility?.address || '').includes(subRegion))) score += 12;
  if (facility?.type === profile.category || facility?.category === profile.category) score += 10;
  if (profile.pattern.test(String(facility?.name || ''))) score += 24;

  if (profile.id === 'pediatrics') {
    if (facility?.source === 'hira') score += 100;
    if (facility?.subtype === 'pediatrics') score += 80;
  }
  if (profile.id === 'hospital' && ['hira', 'e-gen'].includes(facility?.source)) score += 80;
  if (profile.id === 'nursing' && facility?.source === 'sooyusil') score += 90;
  if (profile.id === 'play' && facility?.source === 'visit-korea-tour-api') score += 40;
  if (profile.id === 'counseling' && /counseling|mental-health|developmental/.test(String(facility?.subtype || ''))) score += 70;
  if (profile.id === 'family-center' && /family/.test(String(facility?.subtype || ''))) score += 60;
  if (text.includes(normalize(profile.label))) score += 12;
  return score;
};

const resolveFacilities = ({ message, facilities, pendingIntent, location }) => {
  const region = extractRegion(message);
  const regionalFacilities = region
    ? (Array.isArray(facilities) ? facilities : []).filter((facility) => facility.region === region.label)
    : (Array.isArray(facilities) ? facilities : []);
  const subRegion = findMentionedSubRegion(message, regionalFacilities, region);
  const profile = getFacilityProfile(message, pendingIntent);
  const hasCoordinates = Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));
  const asksForUnverifiedNursingAmenity = ['pediatrics', 'hospital', 'emergency'].includes(profile.id)
    && /(수유실|유아휴게소|모유수유)/.test(message);

  if (!region && !subRegion && !hasCoordinates) {
    return {
      mode: 'homepage',
      answer: `어느 지역에서 ${profile.label}을 찾을까요? 현재 위치를 사용하거나 지역을 직접 선택해 주세요.`,
      actions: [
        { type: 'location', intent: `facilities:${profile.id}`, label: '현재 위치 사용' },
        ...REGION_DEFINITIONS.slice(0, 4).map((item) => ({
          type: 'reply',
          intent: `facilities:${profile.id}`,
          label: item.label,
          message: `${item.label} ${profile.label} 찾아줘`
        })),
        { tab: 'facilities', type: 'navigate', label: '다른 지역 선택', category: profile.category }
      ],
      sources: ['홈페이지 전국 육아시설 데이터'],
      pendingIntent: `facilities:${profile.id}`
    };
  }

  let candidates = region ? regionalFacilities : (Array.isArray(facilities) ? facilities : []);
  if (subRegion) candidates = candidates.filter((facility) => facility.subRegion === subRegion || String(facility.address || '').includes(subRegion));
  candidates = candidates.filter(profile.matches);

  const ranked = candidates
    .map((facility) => ({
      facility,
      score: getFacilityScore(facility, profile, subRegion),
      distance: hasCoordinates ? distanceKm(location, facility) : null
    }))
    .sort((a, b) => {
      if (Number.isFinite(a.distance) !== Number.isFinite(b.distance)) {
        return Number.isFinite(a.distance) ? -1 : 1;
      }
      if (Number.isFinite(a.distance) && Number.isFinite(b.distance)) return a.distance - b.distance;
      if (a.score !== b.score) return b.score - a.score;
      return String(a.facility.name).localeCompare(String(b.facility.name), 'ko');
    });

  const selected = ranked.slice(0, 3);
  if (!selected.length) {
    return {
      mode: 'homepage',
      answer: `${[region?.label, subRegion].filter(Boolean).join(' ') || '선택한 위치'}에서 ${profile.label}을 찾지 못했어요. 지역 범위를 넓히거나 시설 메뉴에서 다른 조건으로 확인해 주세요.`,
      actions: [{
        tab: 'facilities',
        label: `${profile.label} 다시 찾기`,
        category: profile.category,
        region: hasCoordinates ? '전체' : region?.label,
        subRegion
      }],
      sources: ['홈페이지 전국 육아시설 데이터']
    };
  }

  return {
    mode: 'homepage',
    answer: `${hasCoordinates ? '현재 위치 근처' : [region?.label, subRegion].filter(Boolean).join(' ') || '홈페이지'}에서 확인되는 ${profile.label} ${candidates.length.toLocaleString('ko-KR')}곳 중 3곳을 보여드릴게요.${asksForUnverifiedNursingAmenity ? ' 다만 현재 자료에는 의료기관별 수유실 보유 여부가 없어 그 조건까지 확인할 수는 없어요.' : ''} 운영 여부와 ${['pediatrics', 'emergency', 'hospital'].includes(profile.id) ? '진료시간' : '이용시간'}${asksForUnverifiedNursingAmenity ? '·수유공간' : ''}은 방문 전에 해당 기관에서 확인해 주세요.`,
    items: selected.map(({ facility, distance }) => ({
      kind: 'facility',
      title: facility.name,
      subtitle: [facility.type || '육아 시설', formatDistance(distance)].filter(Boolean).join(' · '),
      detail: facility.address || '',
      meta: `출처: ${getSourceLabel(facility.source)}`,
      action: {
        tab: 'facilities',
        label: '시설에서 보기',
        query: facility.name,
        category: facility.type || profile.category,
        region: facility.region,
        subRegion: facility.subRegion
      }
    })),
    actions: [{
      tab: 'facilities',
      label: `${profile.category === '전체' ? '시설' : profile.category} 전체 보기`,
      category: profile.category,
      region: hasCoordinates ? '전체' : region?.label,
      subRegion
    }],
    sources: [
      '홈페이지 전국 육아시설 데이터',
      ...new Set(selected.map(({ facility }) => getSourceLabel(facility.source)))
    ].slice(0, 3)
  };
};

const getWelfareStage = (months) => {
  if (months <= 0) return 2;
  if (months <= 3) return 3;
  if (months <= 12) return 4;
  if (months <= 36) return 5;
  return 6;
};

const resolveWelfare = async ({ message, childInfo }) => {
  const region = extractRegion(message);
  const availableItems = region
    ? await fetchWelfareServices(region.label, '전체')
    : await fetchWelfareServices('전체', '전체');
  const months = readRequestedMonths(message, childInfo?.months);
  const stage = getWelfareStage(months);
  const normalizedMessage = normalize(message);
  const specificallyNamed = availableItems.filter((item) =>
    normalize(item.title).split(/\s+/).some((word) => word.length >= 3 && normalizedMessage.includes(word))
  );
  const stageItems = availableItems.filter((item) => item.stage === stage);
  const selected = (specificallyNamed.length ? specificallyNamed : stageItems).slice(0, 3);

  if (!selected.length) {
    return {
      mode: 'homepage',
      answer: '현재 조건에 맞는 복지 항목을 찾지 못했어요. 복지 메뉴에서 지역과 성장 단계를 선택해 확인해 주세요.',
      actions: [{ tab: 'welfare', label: '복지 혜택 보기', region: region?.label, welfareStage: stage }],
      sources: ['홈페이지 복지 혜택 데이터']
    };
  }

  return {
    mode: 'homepage',
    answer: `${region ? `${region.label} 지역과 ` : ''}${months}개월 아이의 성장 단계에 맞춰 홈페이지 혜택을 골랐어요. 실제 대상 여부와 금액은 신청 기관에서 최종 확인해 주세요.`,
    items: selected.map((item) => ({
      kind: 'welfare',
      title: item.title,
      subtitle: item.desc || '',
      detail: item.details?.target ? `대상: ${item.details.target}` : '',
      meta: item.details?.how ? `신청: ${item.details.how}` : '',
      action: {
        tab: 'welfare',
        label: '복지에서 보기',
        region: region?.label,
        welfareStage: item.stage,
        welfareId: item.id
      }
    })),
    actions: [{ tab: 'welfare', label: '맞춤 복지 전체 보기', region: region?.label, welfareStage: stage }],
    sources: ['홈페이지 복지 혜택 데이터']
  };
};

const resolveVaccination = ({ message, childInfo, completedVaccines }) => {
  const months = readRequestedMonths(message, childInfo?.months);
  const schedule = vaccinationSchedule.find((item) => item.months >= months)
    || vaccinationSchedule[vaccinationSchedule.length - 1];
  const remaining = schedule.vaccines.filter((vaccine) => {
    const id = `${schedule.months}m-${vaccine.name}-${vaccine.dose}`;
    return !completedVaccines?.[id];
  });
  const vaccineText = remaining.length
    ? remaining.map((vaccine) => `${vaccine.name} ${vaccine.dose}`).join(', ')
    : '홈페이지에서 이 시기의 접종을 모두 완료한 것으로 표시했습니다';

  return {
    mode: 'homepage',
    answer: `${months}개월 기준으로 다음 확인 시기는 ${schedule.label}이며, ${vaccineText} 항목이 있어요. 실제 접종 가능 시기와 과거 접종 여부는 예방접종도우미 또는 의료기관 기록으로 확인해 주세요.`,
    actions: [{ tab: 'health', label: '예방접종표 확인', healthCategory: '예방접종 일정' }],
    sources: ['홈페이지 예방접종 일정']
  };
};

const itemSearchText = (item) => normalize([
  item.title,
  item.shortDesc,
  item.category,
  ...(item.tags || []),
  item.content?.overview
].filter(Boolean).join(' '));

const resolvePracticalGuide = ({ message, childInfo }) => {
  const topic = GUIDE_TOPICS.find((item) => item.pattern.test(message));
  if (!topic) return null;

  const months = readRequestedMonths(message, childInfo?.months);
  const bucket = milestonesData.find((item) => months >= item.minMonths && months <= item.maxMonths)
    || [...milestonesData].sort((a, b) => Math.abs(a.minMonths - months) - Math.abs(b.minMonths - months))[0];
  const rankItems = (items) => items
    .map((item) => ({
      item,
      score: topic.words.reduce((score, word) => score + (itemSearchText(item).includes(normalize(word)) ? 1 : 0), 0)
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  let candidates = rankItems(bucket?.items || []);
  if (!candidates.length) {
    candidates = milestonesData
      .flatMap((group) => rankItems(group.items).map((item) => ({
        item,
        distance: months < group.minMonths
          ? group.minMonths - months
          : months > group.maxMonths
            ? months - group.maxMonths
            : 0
      })))
      .sort((a, b) => a.distance - b.distance)
      .map(({ item }) => item);
  }
  candidates = candidates.slice(0, 2);

  if (!candidates.length) return null;

  const primary = candidates[0];
  const sections = primary.content?.sections || [];
  const detailedSection = sections.find((section) =>
    topic.id === 'feeding' ? /(수유량|시기|단계|섭취)/.test(section.title) : /(시기|단계|특징|방법)/.test(section.title)
  ) || sections[0];
  const points = (detailedSection?.items || primary.content?.points || []).slice(0, 3);
  const detailText = points.length ? ` ${points.join(' ')}` : '';

  return {
    mode: 'homepage',
    answer: `${months}개월 기준 홈페이지의 ‘${primary.title}’ 내용을 찾았어요. ${primary.content?.overview || primary.shortDesc || ''}${detailText}`.trim(),
    items: candidates.map((item) => ({
      kind: 'guide',
      title: `${item.icon || '📘'} ${item.title}`,
      subtitle: item.shortDesc || item.category || '',
      detail: item.content?.overview || '',
      action: {
        tab: 'practical',
        label: '월령별 가이드 보기',
        timelineMonth: Math.max(0, Math.min(36, months))
      }
    })),
    actions: [{ tab: 'practical', label: '월령별 가이드 보기', timelineMonth: Math.max(0, Math.min(36, months)) }],
    sources: [`홈페이지 ${primary.title}`]
  };
};

const kstDateKey = (value) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(value);

const resolveRecords = ({ message, childInfo, growthRecords, tempRecords, feedingRecords }) => {
  const wantsRecords = /(기록|최근|오늘|저장)/.test(message);
  if (!wantsRecords) return null;

  if (/(키|몸무게|성장)/.test(message)) {
    const latest = growthRecords?.[0];
    const height = latest?.height ?? childInfo?.height;
    const weight = latest?.weight ?? childInfo?.weight;
    return {
      mode: 'homepage',
      answer: height && weight
        ? `최근 저장값은 키 ${height}cm, 몸무게 ${weight}kg이에요. 성장 평가는 한 번의 수치보다 여러 시점의 변화 추이를 함께 보는 것이 좋아요.`
        : '저장된 성장 기록이 아직 없어요. 건강 홈에서 키와 몸무게를 먼저 기록해 주세요.',
      actions: [{ type: 'modal', modal: 'growth', label: '성장 기록 보기' }],
      sources: ['기기에 저장된 성장 기록']
    };
  }

  if (/(수유|분유|모유|이유식)/.test(message)) {
    const today = kstDateKey(new Date());
    const todayRecords = (feedingRecords || []).filter((record) => kstDateKey(new Date(record.date)) === today);
    const totalMl = todayRecords.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
    return {
      mode: 'homepage',
      answer: todayRecords.length
        ? `오늘 저장된 수유·식사 기록은 ${todayRecords.length}건이고, 용량이 기록된 항목의 합계는 ${totalMl}ml예요.`
        : '오늘 저장된 수유 기록이 아직 없어요. 건강 홈의 수유 카드에서 기록할 수 있습니다.',
      actions: [{ type: 'modal', modal: 'feeding', label: '수유 기록 보기' }],
      sources: ['기기에 저장된 수유 기록']
    };
  }

  if (/체온/.test(message)) {
    const latest = tempRecords?.[0];
    return {
      mode: 'homepage',
      answer: latest
        ? `가장 최근 저장된 체온은 ${latest.temp}℃예요. 기록 화면에서 시간별 변화를 함께 확인해 주세요.`
        : '저장된 체온 기록이 아직 없어요. 건강 홈에서 체온을 먼저 기록해 주세요.',
      actions: [{ type: 'modal', modal: 'temperature', label: '체온 기록 보기' }],
      sources: ['기기에 저장된 체온 기록']
    };
  }

  return null;
};

const shouldUseSafetyRoute = (message, childMonths) => {
  const temperatureMatch = message.match(/(\d{2}(?:\.\d+)?)\s*(?:도|℃|°\s*c)/i);
  const temperature = temperatureMatch ? Number(temperatureMatch[1]) : null;
  if (Number.isFinite(temperature) && (temperature >= 40 || (Number(childMonths) < 3 && temperature >= 38))) return true;
  return /(호흡.{0,8}(곤란|멈)|숨.{0,5}(못|안)|경련|발작|의식.{0,8}(없|저하)|깨워도.{0,8}(안|못|반응.{0,2}없)|축\s*늘어|청색증|입술.{0,6}(파랗|푸르)|질식|심한\s*출혈)/.test(message);
};

export const resolveHomepageGuide = async ({
  message,
  pendingIntent,
  childInfo,
  facilities,
  places,
  welfareItems,
  completedVaccines,
  growthRecords,
  tempRecords,
  feedingRecords,
  location
}) => {
  const normalizedMessage = normalize(message);
  if (!normalizedMessage || shouldUseSafetyRoute(normalizedMessage, childInfo?.months)) return null;

  if (pendingIntent === 'places' || PLACE_INTENT.test(normalizedMessage)) {
    return resolvePlaces({
      message: normalizedMessage,
      places,
      facilities,
      location,
      childInfo
    });
  }

  if (String(pendingIntent || '').startsWith('facilities') || (FACILITY_INTENT.test(normalizedMessage) && (extractRegion(normalizedMessage) || LOCATION_WORDS.test(normalizedMessage) || /(어디|찾|위치|추천)/.test(normalizedMessage)))) {
    return resolveFacilities({ message: normalizedMessage, facilities, pendingIntent, location });
  }

  if (WELFARE_INTENT.test(normalizedMessage)) {
    return resolveWelfare({ message: normalizedMessage, childInfo });
  }

  if (VACCINE_INTENT.test(normalizedMessage)) {
    return resolveVaccination({ message: normalizedMessage, childInfo, completedVaccines });
  }

  const recordResult = resolveRecords({
    message: normalizedMessage,
    childInfo,
    growthRecords,
    tempRecords,
    feedingRecords
  });
  if (recordResult) return recordResult;

  return resolvePracticalGuide({ message: normalizedMessage, childInfo });
};
