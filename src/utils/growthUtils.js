// src/utils/growthUtils.js
import { milestonesData } from '../data/milestones';
import { getGrowthPercentile } from '../data/growthStandard';
import CryptoJS from 'crypto-js';

/**
 * SHA-256 해시 유틸리티 (관리자 비밀번호 보안)
 * iOS Safari 호환: crypto.subtle 사용 불가 시 CryptoJS 폴백
 */
export async function hashPin(pin) {
  try {
    // Web Crypto API 사용 가능 시 (HTTPS + 최신 브라우저)
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
      var encoder = new TextEncoder();
      var data = encoder.encode(pin);
      var hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map(function(b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    }
  } catch (e) {
    console.warn('SHIELD Agent: Web Crypto API failed, using CryptoJS fallback:', e);
  }
  // Fallback: CryptoJS SHA-256 (iOS Safari Private Mode, HTTP, etc.)
  return CryptoJS.SHA256(pin).toString(CryptoJS.enc.Hex);
}

/**
 * 나이에 따른 발달 이정표(Milestones) 가져오기
 */
export const getMilestonesForAge = (months) => {
  if (!milestonesData || !Array.isArray(milestonesData)) return [];
  
  const category = milestonesData.find(d => months >= d.minMonths && months <= d.maxMonths);
  if (category) return category.items;
  
  const fallbackCategory = [...milestonesData]
    .sort((a, b) => b.minMonths - a.minMonths)
    .find(d => months >= d.minMonths);
    
  return fallbackCategory ? fallbackCategory.items : (milestonesData[0]?.items || []);
};

/**
 * 나이에 따른 훈육 가이드 정보 가져오기
 */
export const getDisciplineInfo = (months) => {
  if (months <= 12) {
    return {
      title: '🫂 안전한 세상 만들어주기',
      subtitle: '0~12개월: 애착 형성기',
      colorBg: 'bg-blue-50/30 dark:bg-blue-900/10',
      colorBorder: 'border-blue-100 dark:border-blue-900/30',
      colorAccent: 'text-blue-600 dark:text-blue-400',
      desc: '이 시기의 아이는 훈육의 대상이 아닙니다. 울음으로 욕구를 표현하며, 부모의 즉각적인 반응이 신뢰와 애착을 형성합니다. 위험한 물건은 미리 치워 안전한 환경을 만들어 주세요.',
      scriptLabel: '아이가 위험한 물건에 다가갈 때',
      scriptMain: '"안 돼, 위험해."',
      scriptHighlight: '(부드럽지만 단호한 목소리로 짧게)',
      scriptEnd: '→ 즉시 다른 장난감으로 관심을 돌려주세요.',
      tips: ['울면 즉시 반응하세요 — "버릇 든다"는 속설은 과학적으로 틀렸습니다', '위험한 환경을 통제하는 것이 가장 효과적인 훈육입니다', '잘 먹고, 잘 자고, 잘 싸는 리듬이 정서 안정의 핵심입니다']
    };
  } else if (months <= 24) {
    return {
      title: '🚧 단호한 한계 설정하기',
      subtitle: '13~24개월: 탐색과 자기주장기',
      colorBg: 'bg-amber-50/30 dark:bg-amber-900/10',
      colorBorder: 'border-amber-100 dark:border-amber-900/30',
      colorAccent: 'text-amber-600 dark:text-amber-400',
      desc: '걷고 뛰기 시작하며 독립심이 폭발하는 시기입니다. "안 돼"를 자주 듣게 되지만, 긴 설명보다는 짧고 단호한 한마디가 효과적입니다. 금지해야 할 상황에서는 즉시 대안을 제시(Redirection)해 주세요.',
      scriptLabel: '음식을 던질 때',
      scriptMain: '"음식을 던져서 엄마가 속상해."',
      scriptHighlight: '"음식을 던지면 안 돼."',
      scriptEnd: '"다 먹었으면 이제 치울게."',
      tips: ['긴 설명 대신 짧고 단호하게 — "안 돼", "그만"', '금지 대신 대안 제시: "이건 안 돼, 대신 이걸 해볼까?"', '만지면 안 되는 물건은 여전히 눈에 안 보이게 치우는 것이 최선']
    };
  } else {
    return {
      title: '📏 규칙과 감정 조절 배우기',
      subtitle: '25~36개월: 사회성 발달기',
      colorBg: 'bg-violet-50/30 dark:bg-violet-900/10',
      colorBorder: 'border-violet-100 dark:border-violet-900/30',
      colorAccent: 'text-violet-600 dark:text-violet-400',
      desc: '언어 능력이 빠르게 발달하여 인과관계를 이해하기 시작합니다. 이때부터 본격적인 생활 규칙과 사회적 규칙을 가르칩니다. 부모의 일관된 태도가 무엇보다 중요하며, 잘못된 행동을 지적하기보다 올바른 행동을 칭찬하는 것이 더 효과적입니다.',
      scriptLabel: '친구를 때렸을 때',
      scriptMain: '"친구를 때리면 아파. 때리면 안 돼."',
      scriptHighlight: '"화가 많이 났구나. 화가 나면 말로 해줘."',
      scriptEnd: '"\"그만해\" 라고 말할 수 있어."',
      tips: ['엄마·아빠의 훈육 기준을 미리 맞추세요 — 일관성이 핵심', '감정은 받아주되 행동은 통제: "속상한 건 알겠어, 하지만 던지면 안 돼"', '올바른 행동 시 즉각적이고 구체적인 칭찬이 최고의 훈육']
    };
  }
};

/**
 * 성장 백분위 계산
 */
export const calculatePercentile = (childInfo) => {
  const { height, weight, months, gender } = childInfo;
  const h = height === '' ? 0 : Number(height);
  const w = weight === '' ? 0 : Number(weight);
  if (h <= 0 || w <= 0) return 0;
  return getGrowthPercentile(months, gender, h, w);
};

/**
 * 생년월일에 따른 개월 수 계산
 */
export const calculateMonths = (date) => {
  if (!date) return 0;
  const start = new Date(date);
  const end = new Date();
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) {
    months--;
  }
  return Math.max(0, months);
};
