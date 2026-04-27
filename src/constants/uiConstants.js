// src/constants/uiConstants.js

export const PRACTICAL_CATEGORIES = [
  '전체', '성장·발달', '영양·식사', '수면·심리와 정서', '건강·안전', '기저귀 떼기', '이유식 훈련', '걷기 훈련', '책읽기 연습'
];

export const WELFARE_STAGES = [
  { id: 0, label: '임신 준비', desc: '건강검진 및 난임 지원' },
  { id: 1, label: '임신 중', desc: '출산 전 필수 준비' },
  { id: 2, label: '탄생 직후', desc: '생후 ~1주' },
  { id: 3, label: '초기 정착', desc: '1~3개월' },
  { id: 4, label: '성장 가속', desc: '4~12개월' },
  { id: 5, label: '유아기 발전', desc: '13~36개월' },
  { id: 6, label: '취학 전', desc: '37~60개월' }
];

export const ALL_REGIONS = [
  '전체', '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCK_DURATION = 5 * 60 * 1000; // 5분 잠금
export const MIN_PIN_LENGTH = 6;
export const FACILITIES_PER_PAGE = 12;

export const FACILITY_CATEGORIES = [
  '전체', '어린이집', '놀이·체험', '돌봄·지원센터', '가족센터', '유아휴게소', '병원·상담'
];
