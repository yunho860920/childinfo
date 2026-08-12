import {
  ageHealthData,
  growthMilestones,
  temperatureGuide,
  vaccinationSchedule
} from '../data/healthInfo';
import { ageTimelineData } from '../data/practicalInfo';
import { dentalTimeline, sleepSafetyGuide, weaningTimeline } from '../data/expertGuides';
import { milestonesData } from '../data/milestones';
import { resolveHomepageGuide } from './homepageGuideRouter';

const MAX_CONTEXT_ITEMS = 8;
export const MAX_DAILY_AI_QUESTIONS = 3;
const DAILY_USAGE_KEY = 'childinfo_ai_daily_usage';

const SYNONYM_GROUPS = [
  ['열', '발열', '고열', '체온', '해열'],
  ['예방접종', '접종', '백신'],
  ['이유식', '수유', '분유', '모유', '영양', '식사'],
  ['잠', '수면', '재우기', '낮잠'],
  ['성장', '발달', '마일스톤'],
  ['병원', '의원', '소아과', '소아청소년과', '응급실'],
  ['시설', '어린이집', '육아종합지원센터', '가족센터', '수유실'],
  ['복지', '지원금', '혜택', '바우처', '수당'],
  ['놀이', '체험', '가볼곳', '나들이'],
  ['치아', '양치', '칫솔', '유치']
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
  const terms = new Set(
    normalizedQuestion
      .split(/[^0-9a-z가-힣]+/i)
      .map((term) => term.trim())
      .filter((term) => term.length >= 2)
  );

  SYNONYM_GROUPS.forEach((group) => {
    if (group.some((word) => normalizedQuestion.includes(word))) {
      group.forEach((word) => terms.add(word));
    }
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

const getFacilityEntries = (facilities, terms) => {
  if (!Array.isArray(facilities) || terms.length === 0) return [];

  return facilities
    .map((facility) => {
      const entry = makeEntry({
        title: facility.name || '시설',
        content: [facility.type, facility.address, facility.region, facility.subRegion, facility.dong],
        tab: 'facilities',
        query: facility.name || '',
        keywords: `${facility.type || ''} 병원 의원 소아과 어린이집 센터 수유실`
      });
      return { entry, score: scoreText(entry, terms) };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

export const buildGuideContext = (question, facilities = []) => {
  const terms = getSearchTerms(question);
  const staticMatches = STATIC_KNOWLEDGE
    .map((entry) => ({ entry, score: scoreText(entry, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CONTEXT_ITEMS);

  const facilityMatches = getFacilityEntries(facilities, terms);
  const combined = [...facilityMatches, ...staticMatches]
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
  return /(숨.{0,5}(못|안)|호흡.{0,8}(곤란|멈)|경련|발작|의식.{0,8}(없|저하)|청색증|질식|심한\s*출혈)/.test(String(message));
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

  const response = await fetch('/api/ai-guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.slice(-6).map((item) => ({ role: item.role, text: item.text })),
      childMonths: Number.isFinite(Number(childInfo?.months)) ? Number(childInfo.months) : undefined,
      context: buildGuideContext(message, facilities)
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
