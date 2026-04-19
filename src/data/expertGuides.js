// src/data/expertGuides.js
export const weaningTimeline = {
  title: '연령별 이유식 단계 가이드',
  desc: '성향과 발달 단계에 맞춘 체계적인 식단 관리를 도와드립니다.',
  phases: [
    { months: '4-6개월', stage: '초기 이유식', goal: '음식의 질감에 적응하기', foods: [{ name: '곡류', items: ['쌀', '찹쌀'] }, { name: '채소류', items: ['애호박', '청경채', '브로콜리'] }] },
    { months: '7-9개월', stage: '중기 이유식', goal: '다양한 식재료와 질감 경험', foods: [{ name: '단백질', items: ['소고기', '닭고기', '흰살생선'] }, { name: '채소류', items: ['시금치', '당근', '양배추'] }] },
    { months: '10-12개월', stage: '후기 이유식', goal: '하루 3번 규칙적인 식사 습관', foods: [{ name: '고형식', items: ['무른 밥', '다진 고기', '핑거 푸드'] }] }
  ]
};

export const dentalTimeline = {
  title: '유치 관리 및 안전 가이드',
  desc: '평생 치아 건강을 결정하는 어린 시절의 올바른 양치 습관.',
  schedule: [
    { range: '6-10개월', part: '아래 앞니', action: '거즈나 실리콘 칫솔로 부드럽게 닦아주기' },
    { range: '8-12개월', part: '위 앞니', action: '본격적인 양치 습관 시작하기' },
    { range: '13-19개월', part: '송곳니', action: '치실 사용 병행 고려하기' }
  ]
};

export const sleepSafetyGuide = {
  title: '안전한 수면 환경 가이드',
  desc: '영아 돌연사 증후군(SIDS) 예방을 위한 안전 수칙입니다.',
  safety: [
    { title: '똑바로 눕혀 재우기', content: '질식 예방을 위해 반드시 등을 바닥에 대고 눕혀주세요.' },
    { title: '단단한 매트리스 사용', content: '푹신한 침구는 코를 막을 위험이 있으니 피하세요.' },
    { title: '쾌적한 온도 유지', content: '너무 덥지 않게 22~24도 내외를 유지해 주세요.' }
  ]
};
