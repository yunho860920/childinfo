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

const PLACE_INTENT = /(놀러|나들이|가볼\s*곳|갈\s*만한|외출|아이와\s*갈|아기와\s*갈|장소\s*추천|어디(?:에|로)?\s*(?:갈|놀))/;
const FACILITY_INTENT = /(소아과|소아청소년과|병원|응급실|수유실|어린이집|육아종합지원센터|가족센터|유아휴게소|돌봄센터|시설)/;
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

const findMentionedSubRegion = (message, entries) => {
  const known = new Set();
  entries.forEach((entry) => {
    if (entry?.subRegion && entry.subRegion !== '전체') known.add(entry.subRegion);
    const addressMatches = String(entry?.address || '').match(/[가-힣]{1,10}(?:시|군|구)/g) || [];
    addressMatches.forEach((value) => known.add(value));
  });

  return [...known]
    .sort((a, b) => b.length - a.length)
    .find((value) => message.includes(value) || message.includes(value.replace(/(?:시|군|구)$/, ''))) || '';
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

const makePlaceItem = (place, distance) => ({
  kind: 'place',
  title: `${place.emoji || '📍'} ${place.name}`,
  subtitle: [formatDistance(distance), place.category].filter(Boolean).join(' · '),
  detail: place.notes || '',
  meta: place.babyRoom ? `아기 편의시설: ${place.babyRoom}` : '',
  action: {
    tab: 'stamps',
    label: '가볼 곳에서 보기',
    region: place.regionId,
    spotId: place.id
  }
});

const resolvePlaces = ({ message, places, location }) => {
  const allPlaces = getAllPlaces(places);
  const region = extractRegion(message);
  const subRegion = findMentionedSubRegion(message, allPlaces);
  const hasCoordinates = Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));

  let candidates = allPlaces;
  if (region) candidates = candidates.filter((place) => place.regionId === region.id);

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

  const ranked = candidates
    .map((place) => ({
      place,
      distance: hasCoordinates ? distanceKm(location, place) : null,
      localScore: subRegion && String(place.address || '').includes(subRegion) ? 1 : 0
    }))
    .sort((a, b) => {
      if (a.localScore !== b.localScore) return b.localScore - a.localScore;
      if (Number.isFinite(a.distance) && Number.isFinite(b.distance)) return a.distance - b.distance;
      return Number(Boolean(b.place.babyRoom)) - Number(Boolean(a.place.babyRoom));
    })
    .slice(0, 3);

  if (!ranked.length) {
    const label = region?.label || subRegion || '선택한 지역';
    return {
      mode: 'homepage',
      answer: `${label}에는 아직 홈페이지에 등록된 가볼 곳이 없습니다. 현재 제공 중인 서울·경기·인천·부산 장소는 가볼 곳 메뉴에서 확인할 수 있어요.`,
      actions: [{ tab: 'stamps', label: '가볼 곳 전체 보기' }],
      sources: ['홈페이지 아기랑 놀러가요']
    };
  }

  const locationLabel = hasCoordinates
    ? '현재 위치에서 가까운 순서로'
    : `${region?.label || ranked[0].place.regionLabel}${subRegion ? ` ${subRegion}` : ''} 기준으로`;

  return {
    mode: 'homepage',
    answer: `${locationLabel} 홈페이지에 등록된 장소 ${ranked.length}곳을 골랐어요. 운영시간과 휴무일은 방문 전에 해당 시설에서 한 번 더 확인해 주세요.`,
    items: ranked.map(({ place, distance }) => makePlaceItem(place, distance)),
    actions: [{
      tab: 'stamps',
      label: '가볼 곳 전체 보기',
      region: ranked[0].place.regionId
    }],
    sources: ['홈페이지 아기랑 놀러가요']
  };
};

const getFacilityKeyword = (message) => {
  if (/(소아과|소아청소년과)/.test(message)) return '소아청소년과';
  if (/응급실/.test(message)) return '응급';
  if (/수유실/.test(message)) return '수유실';
  if (/어린이집/.test(message)) return '어린이집';
  if (/가족센터/.test(message)) return '가족센터';
  if (/육아종합지원센터/.test(message)) return '육아종합지원센터';
  if (/(병원|의원)/.test(message)) return '병원';
  return '';
};

const resolveFacilities = ({ message, facilities, pendingIntent }) => {
  const region = extractRegion(message);
  const subRegion = findMentionedSubRegion(message, facilities);
  const pendingKeyword = String(pendingIntent || '').startsWith('facilities:')
    ? String(pendingIntent).slice('facilities:'.length)
    : '';
  const keyword = getFacilityKeyword(message) || pendingKeyword;

  if (!region && !subRegion) {
    return {
      mode: 'homepage',
      answer: `어느 지역에서 ${keyword ? `${keyword} 시설` : '육아 시설'}을 찾을까요? 현재 위치를 사용하거나 지역을 직접 선택해 주세요.`,
      actions: [
        { tab: 'facilities', type: 'navigate', label: '현재 위치로 찾기', query: keyword, useLocation: true },
        ...REGION_DEFINITIONS.slice(0, 4).map((item) => ({
          type: 'reply',
          intent: `facilities:${keyword}`,
          label: item.label,
          message: `${item.label} ${keyword || '육아 시설'} 찾아줘`
        })),
        { tab: 'facilities', type: 'navigate', label: '다른 지역 선택', query: keyword }
      ],
      sources: ['홈페이지 전국 육아시설 데이터'],
      pendingIntent: `facilities:${keyword}`
    };
  }

  let candidates = Array.isArray(facilities) ? facilities : [];
  if (region) candidates = candidates.filter((facility) => facility.region === region.label);
  if (subRegion) candidates = candidates.filter((facility) => facility.subRegion === subRegion || String(facility.address || '').includes(subRegion));
  if (keyword) {
    const searchWords = keyword === '병원'
      ? ['병원', '의원', '소아']
      : keyword === '소아청소년과'
        ? ['소아청소년과', '소아과', '병원', '의원']
        : [keyword];
    candidates = candidates.filter((facility) => searchWords.some((word) =>
      normalize(`${facility.name} ${facility.type}`).includes(normalize(word))
    ));
  }

  const selected = candidates.slice(0, 3);
  if (!selected.length) {
    return {
      mode: 'homepage',
      answer: '조건에 정확히 맞는 시설을 대화 안에서 찾지 못했어요. 시설 메뉴로 이동해 지역과 시설 종류를 직접 선택해 주세요.',
      actions: [{
        tab: 'facilities',
        label: `${keyword || '시설'} 검색하기`,
        query: keyword,
        region: region?.label,
        subRegion
      }],
      sources: ['홈페이지 전국 육아시설 데이터']
    };
  }

  return {
    mode: 'homepage',
    answer: `${[region?.label, subRegion].filter(Boolean).join(' ') || '홈페이지'}에서 확인되는 ${keyword ? `${keyword} 시설` : '시설'}을 정리했어요.`,
    items: selected.map((facility) => ({
      kind: 'facility',
      title: facility.name,
      subtitle: facility.type || '육아 시설',
      detail: facility.address || '',
      action: {
        tab: 'facilities',
        label: '시설에서 보기',
        query: facility.name,
        region: facility.region,
        subRegion: facility.subRegion
      }
    })),
    actions: [{
      tab: 'facilities',
      label: '시설 전체 결과 보기',
      query: keyword,
      region: region?.label,
      subRegion
    }],
    sources: ['홈페이지 전국 육아시설 데이터']
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
  return /(호흡.{0,8}(곤란|멈)|숨.{0,5}(못|안)|경련|발작|의식.{0,8}(없|저하)|청색증|입술.{0,6}(파랗|푸르)|질식|심한\s*출혈)/.test(message);
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
    return resolvePlaces({ message: normalizedMessage, places, location });
  }

  if (String(pendingIntent || '').startsWith('facilities') || (FACILITY_INTENT.test(normalizedMessage) && (LOCATION_WORDS.test(normalizedMessage) || /(어디|찾|위치|추천)/.test(normalizedMessage)))) {
    return resolveFacilities({ message: normalizedMessage, facilities, pendingIntent });
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
