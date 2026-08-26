import {
  ageHealthData,
  growthMilestones,
  temperatureGuide,
  vaccinationSchedule
} from '../data/healthInfo.js';
import { ageTimelineData } from '../data/practicalInfo.js';
import { dentalTimeline, sleepSafetyGuide, weaningTimeline } from '../data/expertGuides.js';
import { milestonesData } from '../data/milestones.js';
import { resolveHomepageGuide } from './homepageGuideRouter.js';
import { getApiUrl } from './apiUrl.js';

const MAX_CONTEXT_ITEMS = 8;
export const MAX_DAILY_AI_QUESTIONS = 3;
const DAILY_USAGE_KEY = 'childinfo_ai_daily_usage';

const SYNONYM_GROUPS = [
  ['열', '발열', '고열', '체온', '해열'],
  ['예방접종', '접종', '백신'],
  ['이유식', '수유', '분유', '모유', '영양', '식사'],
  ['잠', '수면', '재우기', '낮잠'],
  ['성장', '발달', '마일스톤'],
  ['소아과', '소아청소년과'],
  ['병원', '의원', '의료원', '클리닉'],
  ['응급실', '응급의료'],
  ['수유실', '유아휴게소', '모유수유'],
  ['어린이집', '보육시설'],
  ['육아종합지원센터', '육아지원센터'],
  ['가족센터', '건강가정지원센터', '다문화가족지원'],
  ['상담', '심리', '정신건강', '발달지원'],
  ['복지', '지원금', '혜택', '바우처', '수당'],
  ['놀이', '체험', '가볼곳', '가볼만한곳', '갈만한곳', '나들이'],
  ['치아', '양치', '칫솔', '유치']
];

const REGION_SEARCH_TERMS = [
  ['서울', '서울시', '서울특별시'],
  ['경기', '경기도'],
  ['인천', '인천시', '인천광역시'],
  ['부산', '부산시', '부산광역시'],
  ['대구', '대구시', '대구광역시'],
  ['대전', '대전시', '대전광역시'],
  ['광주', '광주시', '광주광역시'],
  ['울산', '울산시', '울산광역시'],
  ['세종', '세종시', '세종특별자치시'],
  ['강원', '강원도', '강원특별자치도'],
  ['충북', '충청북도'], ['충남', '충청남도'],
  ['전북', '전라북도', '전북특별자치도'], ['전남', '전라남도'],
  ['경북', '경상북도'], ['경남', '경상남도'],
  ['제주', '제주도', '제주특별자치도']
];

const normalize = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();

const collectText = (value, bucket = []) => {
  if (value === null || value === undefined) return bucket;
  if (typeof value === 'string' || typeof value === 'number') {
    bucket.push(String(value));
    return bucket;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, bucket));
    return bucket;
  }
  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      if (!['image', 'id', 'color'].includes(key)) collectText(item, bucket);
    });
  }
  return bucket;
};

const makeEntry = ({ title, content, tab, healthCategory, query, keywords = '' }) => ({
  title,
  content: Array.isArray(content) ? content.filter(Boolean).join(' · ') : String(content || ''),
  tab,
  healthCategory,
  query,
  searchText: normalize(`${title} ${keywords} ${Array.isArray(content) ? content.join(' ') : content}`)
});

const buildStaticKnowledge = () => {
  const entries = [
    makeEntry({
      title: temperatureGuide.title,
      content: [
        temperatureGuide.desc,
        ...temperatureGuide.measureSites.map((item) => `${item.site}: ${item.normal}, ${item.note}`),
        ...temperatureGuide.feverLevels.map((item) => `${item.range} ${item.label}: ${item.action}`),
        temperatureGuide.crossDosing?.warning
      ],
      tab: 'health',
      healthCategory: '체온·응급',
      keywords: '열 발열 고열 체온 해열 응급'
    }),
    makeEntry({
      title: '시설·병원 위치 찾기',
      content: '시설 메뉴에서 지역을 선택하거나 내 주변 시설 찾기를 이용해 병원, 어린이집, 가족센터, 육아지원센터와 수유실의 위치를 확인할 수 있습니다.',
      tab: 'facilities',
      query: '',
      keywords: '위치 근처 주변 병원 소아과 응급실 어린이집 센터 수유실'
    }),
    makeEntry({
      title: '복지 혜택 찾기',
      content: '복지 메뉴에서 지역과 아이의 성장 단계를 기준으로 이용 가능한 지원과 혜택을 확인할 수 있습니다.',
      tab: 'welfare',
      keywords: '복지 혜택 지원금 수당 바우처'
    }),
    makeEntry({
      title: '아이와 가볼 곳 찾기',
      content: '가볼곳 메뉴에서 지역별 체험 장소와 방문 정보를 확인할 수 있습니다.',
      tab: 'stamps',
      keywords: '나들이 놀이 체험 장소 가볼곳'
    })
  ];

  vaccinationSchedule.forEach((schedule) => {
    entries.push(makeEntry({
      title: `${schedule.label} 예방접종 일정`,
      content: schedule.vaccines.map((vaccine) => `${vaccine.name} ${vaccine.dose} (${vaccine.type}): ${vaccine.desc}`),
      tab: 'health',
      healthCategory: '예방접종 일정',
      keywords: `${schedule.months}개월 백신 접종`
    }));
  });

  growthMilestones.forEach((group) => {
    entries.push(makeEntry({
      title: `${group.label} 성장 마일스톤`,
      content: collectText(group.items),
      tab: 'health',
      healthCategory: '성장 마일스톤',
      keywords: `${group.months}개월 성장 발달`
    }));
  });

  ageHealthData.forEach((group) => {
    entries.push(makeEntry({
      title: `${group.ageLabel} 건강 정보`,
      content: collectText(group.conditions),
      tab: 'health',
      healthCategory: group.ageLabel,
      keywords: collectText(group.conditions).join(' ')
    }));
  });

  ageTimelineData.forEach((item) => {
    entries.push(makeEntry({
      title: `${item.month}개월 · ${item.title}`,
      content: [item.summary, ...(item.points || [])],
      tab: 'practical',
      keywords: `${item.category} ${item.month}개월`
    }));
  });

  [weaningTimeline, dentalTimeline, sleepSafetyGuide].forEach((guide) => {
    entries.push(makeEntry({
      title: guide.title,
      content: [guide.desc, ...collectText(guide).filter((text) => text !== guide.title && text !== guide.desc)],
      tab: 'practical'
    }));
  });

  milestonesData.forEach((group) => {
    group.items.forEach((item) => {
      entries.push(makeEntry({
        title: item.title,
        content: [
          item.shortDesc,
          item.content?.overview,
          ...collectText(item.content?.sections),
          ...collectText(item.content?.steps),
          ...collectText(item.content?.precautions)
        ],
        tab: 'practical',
        keywords: `${group.minMonths}~${group.maxMonths}개월 ${item.category || ''} ${(item.tags || []).join(' ')}`
      }));
    });
  });

  return entries;
};

const STATIC_KNOWLEDGE = buildStaticKnowledge();

const getSearchTerms = (question) => {
  const normalizedQuestion = normalize(question);
  const compactQuestion = normalizedQuestion.replace(/\s+/g, '');
  const terms = new Set();

  normalizedQuestion
    .split(/[^0-9a-z가-힣]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)
    .forEach((term) => {
      terms.add(term);
      const withoutParticle = term.replace(/(?:에서|에는|에게|으로|이랑|와|과|랑|을|를|은|는|이|가|에|로)$/, '');
      if (withoutParticle.length >= 2) terms.add(withoutParticle);
    });

  SYNONYM_GROUPS.forEach((group) => {
    if (group.some((word) => normalizedQuestion.includes(word)
      || compactQuestion.includes(word.replace(/\s+/g, '')))) {
      group.forEach((word) => terms.add(word));
    }
  });

  REGION_SEARCH_TERMS.forEach(([canonical, ...aliases]) => {
    if ([canonical, ...aliases].some((alias) => compactQuestion.includes(alias))) terms.add(canonical);
  });

  return [...terms];
};

const scoreText = (entry, terms) => {
  const title = normalize(entry.title);
  const text = entry.searchText || normalize(entry.content);
  return terms.reduce((score, term) => {
    if (title.includes(term)) return score + 6;
    if (text.includes(term)) return score + 2;
    return score;
  }, 0);
};

const getFacilityEntries = (facilities, terms, question) => {
  if (!Array.isArray(facilities) || terms.length === 0) return [];
  if (!/(소아과|소아청소년과|병원|의원|응급실|수유실|유아휴게소|어린이집|육아종합지원센터|가족센터|상담|심리|발달|시설|센터|근처|주변|위치|찾)/.test(normalize(question))) return [];

  const hasAnyTerm = (...words) => words.some((word) => terms.includes(word));
  const requestedRegion = REGION_SEARCH_TERMS.find(([canonical]) => terms.includes(canonical))?.[0];
  const regionalFacilities = requestedRegion
    ? facilities.filter((facility) => facility.region === requestedRegion)
    : facilities;
  const narrowedFacilities = regionalFacilities.filter((facility) => {
    const subtype = String(facility.subtype || '');
    const source = String(facility.source || '');
    const text = normalize(`${facility.name || ''} ${facility.type || ''}`);
    if (hasAnyTerm('소아과', '소아청소년과')) return source === 'hira' || subtype === 'pediatrics';
    if (hasAnyTerm('병원', '의원', '의료원', '클리닉') && hasAnyTerm('수유실', '유아휴게소', '모유수유')) {
      return ['hira', 'e-gen'].includes(source)
        || /pediatrics|emergency/.test(subtype)
        || /병원|의원|의료원|클리닉/.test(String(facility.name || ''));
    }
    if (hasAnyTerm('수유실', '유아휴게소', '모유수유')) return source === 'sooyusil' || /nursing/.test(subtype);
    if (hasAnyTerm('가족센터', '건강가정지원센터', '다문화가족지원')) return /family/.test(subtype) || /가족센터|건강가정|다문화가족/.test(text);
    if (hasAnyTerm('어린이집', '보육시설')) return subtype === 'daycare' || facility.type === '어린이집';
    if (hasAnyTerm('육아종합지원센터', '육아지원센터')) return subtype === 'childcare-support-center' || /육아종합지원센터|육아지원센터/.test(text);
    if (hasAnyTerm('상담', '심리', '정신건강', '발달지원')) return /counseling|mental-health|developmental/.test(subtype) || /상담|심리|정신건강|발달/.test(text);
    if (hasAnyTerm('놀이', '체험', '가볼곳', '가볼만한곳', '갈만한곳', '나들이')) return facility.type === '놀이·체험' || source === 'visit-korea-tour-api';
    if (hasAnyTerm('병원', '의원', '의료원', '클리닉')) return ['hira', 'e-gen'].includes(source)
      || /pediatrics|emergency/.test(subtype)
      || /병원|의원|의료원|클리닉/.test(String(facility.name || ''));
    return true;
  });

  return narrowedFacilities
    .map((facility) => {
      const subtype = String(facility.subtype || '');
      const source = String(facility.source || '');
      const semanticKeywords = [];
      if (source === 'hira' || subtype === 'pediatrics') semanticKeywords.push('병원 의원 소아과 소아청소년과');
      if (source === 'sooyusil' || /nursing/.test(subtype)) semanticKeywords.push('수유실 유아휴게소 모유수유');
      if (source === 'visit-korea-tour-api' || subtype === 'tour-experience') semanticKeywords.push('놀이 체험 가볼곳 나들이');
      if (/counseling|mental-health|developmental/.test(subtype)) semanticKeywords.push('상담 심리 발달 정신건강');
      if (/family/.test(subtype)) semanticKeywords.push('가족센터 가족상담');
      if (/childcare-support/.test(subtype)) semanticKeywords.push('육아종합지원센터 육아지원');
      const entry = makeEntry({
        title: facility.name || '시설',
        content: [facility.type, facility.address, facility.region, facility.subRegion, facility.dong, subtype],
        tab: 'facilities',
        query: facility.name || '',
        keywords: `${facility.type || ''} ${semanticKeywords.join(' ')}`
      });
      return { entry, score: scoreText(entry, terms) };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

const getPlaceEntries = (places, terms, question) => {
  if (!places || typeof places !== 'object' || terms.length === 0) return [];
  if (!/(놀러|나들이|가\s*볼|가볼|갈\s*만한|갈만한|놀이|체험|장소\s*추천|어디.{0,6}(?:갈|놀))/.test(normalize(question))) return [];
  const regionLabels = {
    seoul: '서울', gyeonggi: '경기', incheon: '인천', busan: '부산',
    daegu: '대구', daejeon: '대전', gwangju: '광주', ulsan: '울산',
    sejong: '세종', gangwon: '강원', chungbuk: '충북', chungnam: '충남',
    jeonbuk: '전북', jeonnam: '전남', gyeongbuk: '경북', gyeongnam: '경남', jeju: '제주'
  };
  const requestedRegion = REGION_SEARCH_TERMS.find(([canonical]) => terms.includes(canonical))?.[0];

  return Object.entries(places)
    .filter(([regionId]) => !requestedRegion || regionLabels[regionId] === requestedRegion)
    .flatMap(([regionId, regionPlaces]) => (Array.isArray(regionPlaces) ? regionPlaces : []).map((place) => {
      const entry = makeEntry({
        title: place.name || '가볼 곳',
        content: [place.category, place.address, place.notes, place.babyRoom],
        tab: 'stamps',
        keywords: `${regionLabels[regionId] || regionId} 놀이 체험 가볼곳 나들이`
      });
      return { entry, score: scoreText(entry, terms) };
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

export const buildGuideContext = (question, facilities = [], places = {}) => {
  const terms = getSearchTerms(question);
  const staticMatches = STATIC_KNOWLEDGE
    .map((entry) => ({ entry, score: scoreText(entry, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CONTEXT_ITEMS);

  const facilityMatches = getFacilityEntries(facilities, terms, question);
  const placeMatches = getPlaceEntries(places, terms, question);
  const combined = [...placeMatches, ...facilityMatches, ...staticMatches]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CONTEXT_ITEMS)
    .map(({ entry }) => ({
      title: entry.title,
      content: entry.content,
      tab: entry.tab,
      ...(entry.healthCategory ? { healthCategory: entry.healthCategory } : {}),
      ...(entry.query ? { query: entry.query } : {})
    }));

  return combined;
};

const getKstDateKey = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(new Date());

const readDailyUsage = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(DAILY_USAGE_KEY) || '{}');
    const date = getKstDateKey();
    if (parsed?.date !== date) return { date, count: 0 };
    return { date, count: Math.max(0, Number(parsed.count) || 0) };
  } catch {
    return { date: getKstDateKey(), count: 0 };
  }
};

const writeDailyUsage = (usage) => {
  try {
    localStorage.setItem(DAILY_USAGE_KEY, JSON.stringify(usage));
  } catch {
    // 제한된 브라우저 환경에서는 서버의 단기 속도 제한만 적용됩니다.
  }
};

export const getDailyAiQuota = () => {
  const usage = readDailyUsage();
  return {
    used: usage.count,
    remaining: Math.max(0, MAX_DAILY_AI_QUESTIONS - usage.count),
    limit: MAX_DAILY_AI_QUESTIONS
  };
};

const consumeDailyAiQuestion = () => {
  const usage = readDailyUsage();
  const next = { ...usage, count: usage.count + 1 };
  writeDailyUsage(next);
  return Math.max(0, MAX_DAILY_AI_QUESTIONS - next.count);
};

const mayNeedSafetyResponse = (message, childMonths) => {
  const temperatureMatch = String(message).match(/(\d{2}(?:\.\d+)?)\s*(?:도|℃|°\s*c)/i);
  const temperature = temperatureMatch ? Number(temperatureMatch[1]) : null;
  if (Number.isFinite(temperature) && (temperature >= 40 || (Number(childMonths) < 3 && temperature >= 38))) return true;
  return /(숨.{0,5}(못|안)|호흡.{0,8}(곤란|멈)|경련|발작|의식.{0,8}(없|저하)|깨워도.{0,8}(안|못|반응.{0,2}없)|축\s*늘어|청색증|입술.{0,6}(파랗|푸르)|질식|심한\s*출혈)/.test(String(message));
};

export const askAiGuide = async ({
  message,
  history = [],
  pendingIntent,
  childInfo,
  facilities = [],
  places = {},
  welfareItems = [],
  completedVaccines = {},
  growthRecords = [],
  tempRecords = [],
  feedingRecords = [],
  location
}) => {
  const homepageResult = await resolveHomepageGuide({
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
  });

  if (homepageResult) {
    return {
      ...homepageResult,
      remainingAiQuestions: getDailyAiQuota().remaining
    };
  }

  const quota = getDailyAiQuota();
  const isPotentialSafetyQuestion = mayNeedSafetyResponse(message, childInfo?.months);
  if (quota.remaining <= 0 && !isPotentialSafetyQuestion) {
    const error = new Error('오늘의 AI 상세답변 3회를 모두 사용했어요. 홈페이지 검색과 긴급 안전 안내는 계속 이용할 수 있습니다.');
    error.code = 'DAILY_AI_LIMIT_REACHED';
    throw error;
  }

  const response = await fetch(getApiUrl('/api/ai-guide'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.slice(-6).map((item) => ({ role: item.role, text: item.text })),
      childMonths: Number.isFinite(Number(childInfo?.months)) ? Number(childInfo.months) : undefined,
      context: buildGuideContext(message, facilities, places)
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'AI 안내를 불러오지 못했습니다.');
    error.code = payload.code || 'AI_GUIDE_REQUEST_FAILED';
    throw error;
  }

  if (payload.safety) {
    return { ...payload, remainingAiQuestions: quota.remaining };
  }

  if (quota.remaining <= 0) {
    const error = new Error('오늘의 AI 상세답변 3회를 모두 사용했어요. 홈페이지 검색과 긴급 안전 안내는 계속 이용할 수 있습니다.');
    error.code = 'DAILY_AI_LIMIT_REACHED';
    throw error;
  }

  return {
    ...payload,
    remainingAiQuestions: consumeDailyAiQuestion()
  };
};
