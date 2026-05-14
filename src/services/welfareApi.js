// src/services/welfareApi.js
// 2025~2026 최신 자료 기반 — 전국 공통 15개 + 시·군·구 단위 지역 특화 혜택 포함

const WELFARE_SNAPSHOT_PREFIX = 'childinfo_welfare_snapshot:';
const MIN_EXPECTED_WELFARE_ITEMS = 10;

function getWelfareSnapshotKey(region, subRegion) {
  return `${WELFARE_SNAPSHOT_PREFIX}${region || '전체'}:${subRegion || '전체'}`;
}

function loadWelfareSnapshot(region, subRegion) {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(getWelfareSnapshotKey(region, subRegion));
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length >= MIN_EXPECTED_WELFARE_ITEMS ? parsed : null;
  } catch (e) {
    return null;
  }
}

function saveWelfareSnapshot(region, subRegion, items) {
  try {
    if (typeof window === 'undefined' || !Array.isArray(items) || items.length < MIN_EXPECTED_WELFARE_ITEMS) return;
    window.localStorage.setItem(getWelfareSnapshotKey(region, subRegion), JSON.stringify(items));
  } catch (e) {
    // localStorage may be unavailable in private/restricted browsing.
  }
}

/**
 * 복지 혜택 조회 (전국 공통 + 지역별 특화)
 * @param {string} region - 광역시·도 (예: '서울', '경기')
 * @param {string} subRegion - 시·군·구 (예: '강남구', '수원시') — 없으면 지역 전체
 */
export async function fetchWelfareServices(region = '전체', subRegion = '전체') {
  const roadmapData = getNationalRoadmapContent();
  const regionalData = getRegionalWelfareHighlights(region, subRegion);
  const merged = mergeWelfareData(roadmapData, regionalData);

  if (merged.length >= MIN_EXPECTED_WELFARE_ITEMS) {
    saveWelfareSnapshot(region, subRegion, merged);
    return merged;
  }

  const snapshot = loadWelfareSnapshot(region, subRegion);
  if (snapshot) {
    console.warn('SHIELD Agent: Welfare data looked incomplete; restored last known good snapshot.');
    return snapshot;
  }

  return merged;
}

/**
 * 특정 지역의 모든 하위 구·군 목록 반환
 */
export function getSubRegions(region) {
  const map = {
    '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '인천': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
    '부산': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
    '경기': ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
    '강원': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
    '충남': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
    '충북': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
    '전남': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
    '전북': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
    '경북': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
    '경남': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
    '대구': ['달성군', '동구', '북구', '남구', '달서구', '서구', '수성구', '중구'],
    '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
    '광주': ['광산구', '남구', '동구', '북구', '서구'],
    '울산': ['남구', '동구', '북구', '울주군', '중구'],
    '세종': ['세종시'],
    '제주': ['서귀포시', '제주시'],
  };
  return map[region] || [];
}

// ──────────────────────────────────────────────
// 전국 공통 필수 로드맵
// ──────────────────────────────────────────────
function getNationalRoadmapContent() {
  return [
    // ── Stage 0: 임신 준비 ────────
    {
      id: 'nat_0_1',
      stage: 0,
      title: '임신 사전 건강관리 지원',
      desc: '가임기 남녀 대상 필수 검진비 지원 (최대 18만원)',
      tags: ['임신 전', '2025년 신설'],
      details: {
        target: '임신을 희망하는 모든 가임기 남녀',
        content: '여성: AMH, 부인과 초음파(13만원) / 남성: 정액검사(5만원) 지원',
        how: '보건소 방문 또는 e보건소 온라인 신청',
      },
      link: 'https://www.e-health.go.kr',
    },
    {
      id: 'nat_0_2',
      stage: 0,
      title: '난임 시술비 지원 확대',
      desc: '소득 제한 폐지, 최대 25회 시술 지원',
      tags: ['난임 지원', '2025년 확대'],
      details: {
        target: '난임 진단을 받은 부부 (소득 무관)',
        content: '체외수정 20회, 인공수정 5회 등 총 25회 지원',
        how: '보건소 방문 또는 정부24 온라인 신청',
      },
      link: 'https://www.gov.kr',
    },

    // ── Stage 1: 임신 중 ────────
    {
      id: 'nat_1',
      stage: 1,
      title: '임신·출산 진료비 바우처',
      desc: '국민행복카드 바우처 (단태아 100만, 다태아 140만)',
      tags: ['의료비', '바우처'],
      details: {
        target: '임신 확인이 된 모든 임산부',
        content: '의료비 및 약제비 결제 가능한 바우처 지급',
        how: '산부인과 등록 후 카드사/은행 신청',
      },
      link: 'https://www.hi.nhis.or.kr',
    },
    {
      id: 'nat_1_health',
      stage: 1,
      title: '보건소 모자보건사업',
      desc: '엽산제·철분제 제공 및 산전 검사 지원',
      tags: ['임신 중', '보건소'],
      details: {
        target: '보건소에 등록된 임산부',
        content: '엽산제/철분제 무료 제공 및 기초 산전 검사 지원',
        how: '관할 보건소 방문 등록',
      },
      link: 'https://www.e-health.go.kr',
    },
    {
      id: 'nat_1_train',
      stage: 1,
      title: 'KTX/SRT 임산부 할인',
      desc: '특실 업그레이드 또는 운임 할인',
      tags: ['임신 중', '교통 할인'],
      details: {
        target: '임산부 및 동반 1인',
        content: 'KTX 특실 업그레이드 또는 SRT 운임 30% 할인',
        how: '코레일/SR 홈페이지 등록 후 예매',
      },
      link: 'https://www.letskorail.com',
    },

    // ── Stage 2: 탄생 직후 ────────
    {
      id: 'nat_4',
      stage: 2,
      title: '첫만남이용권',
      desc: '첫째 200만원, 둘째 이상 300만원 지급',
      tags: ['출생아', '바우처'],
      details: {
        target: '출생 신고를 마친 아동',
        content: '출생아당 바우처 포인트 지급',
        how: '정부24/복지로 또는 주민센터 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },
    {
      id: 'nat_2_care',
      stage: 2,
      title: '산모·신생아 건강관리 지원',
      desc: '산후도우미 가정 방문 서비스 지원',
      tags: ['출산 후', '방문 지원'],
      details: {
        target: '출산 가정 (소득 기준 충족 시)',
        content: '전문 관리사의 산후조리 및 신생아 돌봄 지원',
        how: '보건소 또는 복지로 온라인 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },
    {
      id: 'nat_5',
      stage: 2,
      title: '부모급여',
      desc: '0세 월 100만원 / 1세 월 50만원 지급',
      tags: ['매월 현금', '부모 지원'],
      details: {
        target: '만 2세 미만 영아 양육 부모',
        content: '현금 또는 보육료 바우처로 지급',
        how: '출생 후 60일 이내 복지로 또는 주민센터 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },

    // ── Stage 3: 초기 정착 ────────
    {
      id: 'nat_7',
      stage: 3,
      title: '육아휴직 급여',
      desc: '첫 3개월 월 최대 250만원 (사후지급금 폐지)',
      tags: ['육아휴직', '급여 인상'],
      details: {
        target: '고용보험 가입 근로자',
        content: '휴직 중 전액 수령 가능한 육아휴직 급여',
        how: '고용보험 홈페이지 신청',
      },
      link: 'https://www.ei.go.kr',
    },

    // ── Stage 4: 성장 가속 ────────
    {
      id: 'nat_9',
      stage: 4,
      title: '아동수당',
      desc: '매월 10만원 지급 (만 8세 미만)',
      tags: ['매월 현금', '필수 혜택'],
      details: {
        target: '대한민국 모든 아동',
        content: '소득 무관 매월 10만원 지급',
        how: '복지로 또는 주민센터 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },
    {
      id: 'nat_diaper',
      stage: 4,
      title: '기저귀·조제분유 지원',
      desc: '저소득층 및 다자녀 가구 바우처',
      tags: ['성장 지원', '바우처'],
      details: {
        target: '저소득층 또는 2자녀 이상 가구',
        content: '기저귀 및 조제분유 구매 바우처',
        how: '보건소 또는 복지로 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },
    {
      id: 'nat_10',
      stage: 4,
      title: '영유아 건강검진 (무료)',
      desc: '생후 14일부터 71개월까지 총 8회',
      tags: ['건강 관리', '무료'],
      details: {
        target: '모든 영유아',
        content: '신체 발달 및 발달 선별검사 실시',
        how: '지정 검진기관 예약 후 방문',
      },
      link: 'https://www.hi.nhis.or.kr',
    },

    // ── Stage 5: 유아기 발전 ────────
    {
      id: 'nat_home_care',
      stage: 5,
      title: '가정양육수당',
      desc: '어린이집 미이용 시 월 10~20만원 지급',
      tags: ['가정 양육', '현금'],
      details: {
        target: '부모급여 종료 후 가정 양육 아동',
        content: '24개월부터 취학 전까지 지급',
        how: '주민센터 또는 복지로 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },

    // ── Stage 6: 취학 전 ────────
    {
      id: 'nat_15',
      stage: 6,
      title: '보육료 및 유아학비',
      desc: '어린이집 또는 유치원 이용 지원',
      tags: ['교육 지원', '바우처'],
      details: {
        target: '만 0~5세 영유아',
        content: '어린이집 보육료 또는 유치원 학비 지원',
        how: '복지로 온라인 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },
    {
      id: 'nat_child_care',
      stage: 6,
      title: '아이돌봄 서비스',
      desc: '만 12세 이하 찾아가는 돌봄 서비스',
      tags: ['돌봄 지원', '소득별 차등'],
      details: {
        target: '양육 공백 가정의 만 12세 이하 아동',
        content: '아이돌보미가 가정 방문하여 돌봄 지원',
        how: '아이돌봄 홈페이지 신청',
      },
      link: 'https://www.idolbom.go.kr',
    },
  ];
}

// ──────────────────────────────────────────────
// 지역별 특화 혜택 DB (17개 시도 + 주요 시·군·구)
// subRegion: '전체' → 광역 공통 / 특정 군·구명 → 해당 지역만
// ──────────────────────────────────────────────
function getRegionalWelfareHighlights(region, subRegion = '전체') {
  const allHighlights = buildAllHighlights();
  const items = allHighlights[region] || [];
  
  if (!subRegion || subRegion === '전체') {
    // 광역 공통 항목만 반환
    return items.filter(item => !item.subRegion || item.subRegion === '전체');
  }
  
  // 광역 공통 + 해당 구·군 특화 항목 함께 반환
  return items.filter(item =>
    !item.subRegion || item.subRegion === '전체' || item.subRegion === subRegion
  );
}

function buildAllHighlights() {
  return {
    // ══════════════════════════════════════
    // 서울특별시
    // ══════════════════════════════════════
    '서울': [
      {
        id: 'reg_seoul_common_1',
        subRegion: '전체',
        stage: 1,
        title: '서울 임산부 교통비 지원',
        desc: '임신 12주부터 출산 3개월까지 교통비 70만원 지원',
        tags: ['서울시 전용', '70만원 포인트'],
        details: {
          target: '서울시 6개월 이상 거주 임산부',
          content: '버스·지하철·택시·유류비로 사용 가능한 70만원 포인트',
          how: '서울맘케어(seoulmomcare.com) 또는 동 주민센터 방문 신청',
        },
        link: 'https://umppa.seoul.go.kr',
      },
      {
        id: 'reg_seoul_common_2',
        subRegion: '전체',
        stage: 3,
        title: '서울형 산후조리경비 지원',
        desc: '출산가구당 100만원 상당 산후조리 바우처 지원',
        tags: ['서울시 전용', '100만원 바우처'],
        details: {
          target: '서울시 거주 출산 가정',
          content: '산후조리원·신생아 건강관리 서비스 등에 사용 가능',
          how: '서울맘케어(seoulmomcare.com) 홈페이지 온라인 신청',
        },
        link: 'https://umppa.seoul.go.kr',
      },
      {
        id: 'reg_seoul_common_3',
        subRegion: '전체',
        stage: 3,
        title: '서울시 출산가구 주거비 지원',
        desc: '2025년 이후 출산 무주택 가구, 월 30만원 × 24개월 = 총 720만원',
        tags: ['서울시 전용', '720만원 현금'],
        details: {
          target: '2025.1.1 이후 출산한 서울시 거주 무주택 가구',
          content: '월 30만원씩 24개월 지원. 주민등록상 서울시 거주자 확인 필요',
          how: '동 주민센터 방문 또는 서울복지포털(wis.seoul.go.kr) 온라인 신청',
        },
        link: 'https://wis.seoul.go.kr',
      },
      {
        id: 'reg_seoul_common_4',
        subRegion: '전체',
        stage: 5,
        title: '다둥이 행복카드',
        desc: '2자녀 이상 가정 — 영화·공영주차장·놀이공원·대중교통 할인',
        tags: ['서울시 전용', '2자녀 이상'],
        details: {
          target: '서울 거주 2자녀 이상 가정 (막내 만 18세 이하)',
          content: '영화관(CGV·롯데·메가박스) 할인, 에버랜드·롯데월드 할인, 공영주차장 30~50% 할인, 대중교통 환급',
          how: '서울온(seoulon) 앱에서 모바일 발급 또는 신한·우리카드 홈페이지 신청',
        },
        link: 'http://seouli.bccard.com',
      },
      // 구별 특화
      {
        id: 'reg_seoul_gangnam_1',
        subRegion: '강남구',
        stage: 3,
        title: '강남구 출산양육지원금',
        desc: '출생아 1인당 200만원 일시 지급',
        tags: ['강남구 전용', '200만원 현금'],
        details: {
          target: '강남구 출산 가정 (거주 요건 확인 필요)',
          content: '강남구 자체 예산으로 지급하는 출산 축하금',
          how: '강남구청(gangnam.go.kr) 또는 관할 동 주민센터 방문 신청',
        },
        link: 'https://www.gangnam.go.kr',
      },
      {
        id: 'reg_seoul_gangnam_2',
        subRegion: '강남구',
        stage: 3,
        title: '강남구 산후건강관리비 지원',
        desc: '산후도우미 이용 시 본인부담금 최대 100만원 환급',
        tags: ['강남구 전용', '최대 100만원'],
        details: {
          target: '강남구 거주 출산 가정 (건강보험료 기준)',
          content: '정부 지원 산후도우미 서비스 이용 후 남은 본인부담금 일부 환급',
          how: '강남구보건소 또는 강남구청 신청',
        },
        link: 'https://www.gangnam.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 인천광역시
    // ══════════════════════════════════════
    '인천': [
      {
        id: 'reg_incheon_common_1',
        subRegion: '전체',
        stage: 2,
        title: '인천 1억 플러스 아이꿈 (i 꿈)',
        desc: '인천에서 태어나면 18세까지 총 1억원 지원 (부모급여 등 포함)',
        tags: ['인천시 전용', '총 1억원 프로젝트'],
        details: {
          target: '인천시 거주 출산 가정',
          content: '첫만남이용권, 부모급여, 아동수당에 인천시 자체 수당(천사지원금 등)을 더해 18세까지 총 1억원을 지원하는 패키지',
          how: '인천시청(incheon.go.kr) 또는 거주지 행정복지센터 신청',
        },
        link: 'https://www.incheon.go.kr',
      },
      {
        id: 'reg_incheon_common_2',
        subRegion: '전체',
        stage: 1,
        title: '인천 임산부 교통비 지원',
        desc: '인천 거주 임산부에게 50만원 지역화폐 지급',
        tags: ['인천시 전용', '50만원 지역화폐'],
        details: {
          target: '인천 거주 임산부',
          content: '인천e음 포인트 50만원 지급',
          how: '보건소 또는 구·군청 방문 신청',
        },
        link: 'https://www.incheon.go.kr',
      },
      // 구·군별
      {
        id: 'reg_incheon_ganghwa_1',
        subRegion: '강화군',
        stage: 2,
        title: '강화군 출산지원금',
        desc: '첫째 500만 · 둘째 800만 · 셋째 1,300만 · 넷째 2,000만원',
        tags: ['강화군 전용', '최대 2,000만원', '2년 이상 거주'],
        details: {
          target: '강화군 2년 이상 거주 출산 가정',
          content: '자녀 순위별 차등 현금 지급. 생일축하금 별도 지급',
          how: '관할 읍·면·동 행정복지센터 방문 신청',
        },
        link: 'https://www.ganghwa.go.kr',
      },
      {
        id: 'reg_incheon_seogu_1',
        subRegion: '서구',
        stage: 2,
        title: '인천 서구 출산·입양 지원금',
        desc: '첫째 30만 · 둘째 50만 · 셋째 150만 · 넷째 250만원',
        tags: ['서구 전용', '1년 이상 거주'],
        details: {
          target: '서구 1년 이상 거주 출산 가정',
          content: '출생(입양)일 기준 부 또는 모가 서구에 1년 이상 거주해야 신청 가능',
          how: '서구청(isg.go.kr) 또는 관할 동 주민센터 신청',
        },
        link: 'https://www.isg.go.kr',
      },
      {
        id: 'reg_incheon_bupyeong_1',
        subRegion: '부평구',
        stage: 2,
        title: '인천 부평구 출산지원금',
        desc: '첫째 30만 · 둘째 50만 · 셋째 이상 100만원',
        tags: ['부평구 전용', '1년 이상 거주'],
        details: {
          target: '부평구 1년 이상 거주 보호자',
          content: '출생아 1인당 지원금 지급 (지역화폐 또는 현금)',
          how: '부평구청(bupyeong.go.kr) 또는 동 주민센터 신청',
        },
        link: 'https://www.bupyeong.go.kr',
      },
      {
        id: 'reg_incheon_gyeyang_1',
        subRegion: '계양구',
        stage: 2,
        title: '인천 계양구 출산·입양 장려금',
        desc: '셋째 300만원 / 넷째 이상 500만원',
        tags: ['계양구 전용', '셋째 이상'],
        details: {
          target: '계양구 거주 출산 가정 (셋째 이상)',
          content: '다자녀 출산 장려를 위한 계양구 자체 지원금',
          how: '계양구청(gyeyang.go.kr) 또는 동 주민센터 신청',
        },
        link: 'https://www.gyeyang.go.kr',
      },
      {
        id: 'reg_incheon_yeonsu_1',
        subRegion: '연수구',
        stage: 3,
        title: '연수구 산후조리비 지원',
        desc: '출산 가정 누구나 산후조리비 50만원 (연수e음 포인트)',
        tags: ['연수구 전용', '50만원', '소득 무관'],
        details: {
          target: '연수구 거주 출산 가정 (2025년부터 소득 무관)',
          content: '연수e음 포인트 50만원으로 연수구 내 가맹점에서 사용 가능',
          how: '연수구청(yeonsu.go.kr) 또는 동 주민센터 신청',
        },
        link: 'https://www.yeonsu.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 부산광역시
    // ══════════════════════════════════════
    '부산': [
      {
        id: 'reg_busan_common_1',
        subRegion: '전체',
        stage: 3,
        title: '부산형 산후조리경비 지원',
        desc: '출생아당 최대 100만원 바우처 (소득 무관)',
        tags: ['부산시 전용', '최대 100만원'],
        details: {
          target: '부산시 거주 출산 가정 (소득 기준 없음)',
          content: '산후조리 관련 비용 바우처 지원',
          how: '주소지 읍면동 행정복지센터 방문 신청',
        },
        link: 'https://www.busan.go.kr',
      },
      // 구·군별
      {
        id: 'reg_busan_haeundae_1',
        subRegion: '해운대구',
        stage: 2,
        title: '해운대구 출산장려금',
        desc: '둘째·셋째 이상 각 100만원 (2026년부터 첫째 포함 확대 예정)',
        tags: ['해운대구 전용'],
        details: {
          target: '해운대구 거주 출산 가정',
          content: '2026년부터 첫째 아이도 포함하여 확대 지원 予定',
          how: '해운대구청(haeundae.go.kr) 또는 동 주민센터 신청',
        },
        link: 'https://www.haeundae.go.kr',
      },
      {
        id: 'reg_busan_gijang_1',
        subRegion: '기장군',
        stage: 2,
        title: '기장군 출산장려금',
        desc: '둘째 50만원 / 셋째 이상 360만원 (분할 지급)',
        tags: ['기장군 전용', '셋째 360만원'],
        details: {
          target: '기장군 거주 출산 가정',
          content: '셋째 이상은 분할 지급 방식. 거주 요건 확인 필요',
          how: '기장군청(gijang.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.gijang.go.kr',
      },
      {
        id: 'reg_busan_busanjin_1',
        subRegion: '부산진구',
        stage: 2,
        title: '부산진구 출산장려금',
        desc: '첫째 20만 · 둘째 50만 · 셋째 이상 100만원 (2025년 확대)',
        tags: ['부산진구 전용', '2025년 확대'],
        details: {
          target: '부산진구 거주 출산 가정',
          content: '2025년부터 지원 금액 확대',
          how: '부산진구청(busanjin.go.kr) 가족지원과 또는 동 주민센터 신청',
        },
        link: 'https://www.busanjin.go.kr',
      },
      {
        id: 'reg_busan_saha_1',
        subRegion: '사하구',
        stage: 2,
        title: '사하구 출산장려금',
        desc: '첫째·둘째·셋째 이상 각 50만원',
        tags: ['사하구 전용'],
        details: {
          target: '사하구 거주 출산 가정',
          content: '자녀 순위 무관 동일 금액 지급',
          how: '사하구청(saha.go.kr) 통합돌봄과 또는 동 주민센터 신청',
        },
        link: 'https://www.saha.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 경기도
    // ══════════════════════════════════════
    '경기': [
      {
        id: 'reg_gyeonggi_common_1',
        subRegion: '전체',
        stage: 3,
        title: '경기도 산후조리비 지원',
        desc: '출생아 1인당 50만원 지역화폐 지원 (경기도 전역)',
        tags: ['경기도 전용', '50만원 지역화폐'],
        details: {
          target: '경기도 거주 출산 가정',
          content: '경기지역화폐(카드형) 50만원 지급',
          how: '경기민원24(gg24.gg.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://gg24.gg.go.kr',
      },
      {
        id: 'reg_gyeonggi_common_2',
        subRegion: '전체',
        stage: 1,
        title: '경기도 임산부 친환경농산물 지원',
        desc: '임산부 1인당 40만원 상당 친환경 농산물 지원',
        tags: ['경기도 전용', '농산물 지원'],
        details: {
          target: '경기도 거주 임산부',
          content: '친환경농산물 이용권 40만원 지급 (자부담 10% 포함)',
          how: '거주지 보건소 또는 경기도청 홈페이지 신청',
        },
        link: 'https://www.gg.go.kr',
      },
      // 시·군별
      {
        id: 'reg_gyeonggi_suwon_1',
        subRegion: '수원시',
        stage: 2,
        title: '수원시 출산장려금',
        desc: '첫째 50만 · 둘째 100만 · 셋째 200만 · 넷째 500만 · 다섯째 이상 1,000만원',
        tags: ['수원시 전용', '최대 1,000만원'],
        details: {
          target: '수원시 거주 출산 가정',
          content: '자녀 순위별 차등 지급',
          how: '수원시청(suwon.go.kr) 또는 동 주민센터 신청',
        },
        link: 'https://www.suwon.go.kr',
      },
      {
        id: 'reg_gyeonggi_hwaseong_1',
        subRegion: '화성시',
        stage: 2,
        title: '화성시 출산장려금',
        desc: '첫째 100만 · 둘째 200만 · 셋째~다섯째 이상 300만원',
        tags: ['화성시 전용', '최대 300만원'],
        details: {
          target: '화성시 거주 출산 가정',
          content: '자녀 순위별 차등 지급',
          how: '화성시청(hscity.go.kr) 또는 동 주민센터 신청',
        },
        link: 'https://www.hscity.go.kr',
      },
      {
        id: 'reg_gyeonggi_goyang_1',
        subRegion: '고양시',
        stage: 2,
        title: '고양시 출산장려금',
        desc: '첫째 100만 · 둘째 200만 · 셋째 300만 · 넷째 500만 · 다섯째 1,000만원',
        tags: ['고양시 전용', '최대 1,000만원'],
        details: {
          target: '고양시 거주 출산 가정',
          content: '자녀 순위별 차등 지급',
          how: '고양시청(goyang.go.kr) 또는 동 주민센터 신청',
        },
        link: 'https://www.goyang.go.kr',
      },
      {
        id: 'reg_gyeonggi_yongin_1',
        subRegion: '용인시',
        stage: 2,
        title: '용인시 출산장려금',
        desc: '첫째 30만 · 둘째 50만 · 셋째 100만 · 넷째 200만 · 다섯째 300만원',
        tags: ['용인시 전용'],
        details: {
          target: '용인시 거주 출산 가정',
          content: '자녀 순위별 차등 지급',
          how: '용인시청(yongin.go.kr) 또는 동 주민센터 신청',
        },
        link: 'https://www.yongin.go.kr',
      },
      {
        id: 'reg_gyeonggi_seongnam_1',
        subRegion: '성남시',
        stage: 2,
        title: '성남시 출산장려금',
        desc: '첫째 30만 · 둘째 50만 · 셋째 100만 · 넷째 200만 · 다섯째 300만원',
        tags: ['성남시 전용'],
        details: {
          target: '성남시 거주 출산 가정',
          content: '자녀 순위별 차등 지급',
          how: '성남시청(seongnam.go.kr) 또는 동 주민센터 신청',
        },
        link: 'https://www.seongnam.go.kr',
      },
      {
        id: 'reg_gyeonggi_namyangju_1',
        subRegion: '남양주시',
        stage: 2,
        title: '남양주시 출산장려금',
        desc: '첫째~다섯째 이상 모두 100만원 균등 지급',
        tags: ['남양주시 전용'],
        details: {
          target: '남양주시 거주 출산 가정',
          content: '자녀 순위 무관 100만원 균등 지급',
          how: '남양주시청(nyj.go.kr) 또는 동 주민센터 신청',
        },
        link: 'https://www.nyj.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 강원특별자치도
    // ══════════════════════════════════════
    '강원': [
      {
        id: 'reg_gangwon_yangyang_1',
        subRegion: '양양군',
        stage: 2,
        title: '양양군 출산장려금',
        desc: '셋째 800만원대 / 넷째 이상 최대 1,900만원 (전국 최고 수준)',
        tags: ['양양군 전용', '최대 1,900만원', '인구소멸지역'],
        details: {
          target: '양양군 거주 출산 가정',
          content: '다자녀 집중 지원 정책. 넷째 이상 최대 1,900만원 지원',
          how: '양양군청(yangyang.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.yangyang.go.kr',
      },
      {
        id: 'reg_gangwon_jeongseon_1',
        subRegion: '정선군',
        stage: 2,
        title: '정선군 출산장려금',
        desc: '셋째 1,440만원 / 넷째 이상 1,440만원 동일 지급',
        tags: ['정선군 전용', '1,440만원', '인구소멸지역'],
        details: {
          target: '정선군 거주 출산 가정',
          content: '셋째부터 고액 지원. 인구소멸 위기 극복 정책',
          how: '정선군청(jeongseon.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.jeongseon.go.kr',
      },
      {
        id: 'reg_gangwon_yeongwol_1',
        subRegion: '영월군',
        stage: 2,
        title: '영월군 출산장려금',
        desc: '셋째 이상 1,100만원 지원',
        tags: ['영월군 전용', '1,100만원'],
        details: {
          target: '영월군 거주 출산 가정',
          content: '다자녀 출산 장려를 위한 고액 지원',
          how: '영월군청(yw.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.yw.go.kr',
      },
      {
        id: 'reg_gangwon_hoengseong_1',
        subRegion: '횡성군',
        stage: 2,
        title: '횡성군 출산장려금',
        desc: '셋째 이상 1,080만원 지원',
        tags: ['횡성군 전용', '1,080만원'],
        details: {
          target: '횡성군 거주 출산 가정',
          content: '다자녀 출산 장려금',
          how: '횡성군청(hsg.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.hsg.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 충청남도
    // ══════════════════════════════════════
    '충남': [
      {
        id: 'reg_chungnam_cheonan_1',
        subRegion: '천안시',
        stage: 2,
        title: '천안시 출생축하금',
        desc: '첫째·둘째 100만원 / 셋째 이상 1,000만원 (5년 분할)',
        tags: ['천안시 전용', '셋째 1,000만원'],
        details: {
          target: '부 또는 모가 출생일 전 6개월 이상 천안시 거주',
          content: '셋째 이상은 5년에 걸쳐 분할 지급',
          how: '천안시청(cheonan.go.kr) 여성가족과 또는 동 주민센터 신청',
        },
        link: 'https://www.cheonan.go.kr',
      },
      {
        id: 'reg_chungnam_asan_1',
        subRegion: '아산시',
        stage: 2,
        title: '아산시 출산장려금',
        desc: '첫째 50만 · 둘째 100만 · 셋째 이상 1,000만원 (5회 분할, 아산페이)',
        tags: ['아산시 전용', '셋째 1,000만원'],
        details: {
          target: '출생일 기준 6개월 전부터 아산시 거주',
          content: '모바일 아산페이로 지급. 5회 분할 지급',
          how: '아산시청(asan.go.kr) 여성복지과 또는 동 주민센터 신청',
        },
        link: 'https://www.asan.go.kr',
      },
      {
        id: 'reg_chungnam_dangjin_1',
        subRegion: '당진시',
        stage: 2,
        title: '당진시 출산장려금',
        desc: '첫째 50만 · 둘째 100만 · 셋째 500만 · 넷째 이상 1,000만원',
        tags: ['당진시 전용', '넷째 1,000만원'],
        details: {
          target: '당진시 거주 출산 가정',
          content: '자녀 순위별 차등 지급',
          how: '당진시청(dangjin.go.kr) 보건행정과 신청',
        },
        link: 'https://www.dangjin.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 충청북도
    // ══════════════════════════════════════
    '충북': [
      {
        id: 'reg_chungbuk_cheongju_1',
        subRegion: '청주시',
        stage: 4,
        title: '청주시 출산육아수당',
        desc: '총 1,000만원 — 만 1세부터 6년간 연간 분할 지급',
        tags: ['청주시 전용', '총 1,000만원'],
        details: {
          target: '청주시 거주 출산 가정',
          content: '1년차 100만 / 2~5년차 각 200만 / 6년차 100만원. 매년 생일 시기에 지급',
          how: '청주시청(cheongju.go.kr) 인구정책담당관 신청',
        },
        link: 'https://www.cheongju.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 전라남도
    // ══════════════════════════════════════
    '전남': [
      {
        id: 'reg_jeonnam_common_1',
        subRegion: '전체',
        stage: 4,
        title: '전남 출생기본소득',
        desc: '매월 20만원 × 10년간 지원 (총 2,400만원)',
        tags: ['전남도 전용', '전국 최초'],
        details: {
          target: '2024년 이후 전남 출생아 (도내 거주 유지)',
          content: '국가 아동수당과 별도로 전라남도에서 매월 20만원을 10세까지 지원',
          how: '거주지 읍면동 행정복지센터 신청',
        },
        link: 'https://www.jeonnam.go.kr',
      },
      {
        id: 'reg_jeonnam_goheung_1',
        subRegion: '고흥군',
        stage: 2,
        title: '고흥군 출산장려금',
        desc: '첫째·둘째 1,080만원 / 넷째 이상 1,440만원',
        tags: ['고흥군 특화', '분할 지급'],
        details: {
          target: '고흥군 주소를 둔 출산 가정',
          content: '월 30~40만원씩 36개월간 분할 지급',
          how: '읍면동 행정복지센터 방문 신청',
        },
        link: 'https://www.goheung.go.kr',
      },
    ],
    '경북': [
      {
        id: 'reg_gyeongbuk_common_1',
        subRegion: '전체',
        stage: 1,
        title: '경북 임산부 친환경 농산물 지원',
        desc: '연간 44만원 상당의 친환경 농산물 꾸러미 지원',
        tags: ['경북도 전용'],
        details: {
          target: '경북 거주 임산부 및 출산 후 1년 이내 산모',
          content: '유기농, 무농약 농산물 및 축산물 등을 전용 쇼핑몰에서 구매 가능 (20% 자부담)',
          how: '임산부 통합 쇼핑몰 온라인 신청 또는 보건소 신청',
        },
        link: 'https://www.gb.go.kr',
      },
    ],
    '경남': [
      {
        id: 'reg_gyeongnam_geochang_1',
        subRegion: '거창군',
        stage: 2,
        title: '거창군 출산축하금 패키지',
        desc: '첫째 기준 최대 3,800만원 상당 지원 (장기 분할)',
        tags: ['거창군 특화', '전국 최고 수준'],
        details: {
          target: '거창군 거주 출산 가정',
          content: '출산축하금 및 양육지원금을 포함하여 생애주기별 장기 지원',
          how: '거창군청 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.geochang.go.kr',
      },
    ],
    '대구': [
      {
        id: 'reg_daegu_common_1',
        subRegion: '전체',
        stage: 2,
        title: '대구시 출산축하금',
        desc: '첫째 100만 · 둘째 200만 · 셋째 이상 고액 지원',
        tags: ['대구시 전용'],
        details: {
          target: '대구시 거주 출산 가정',
          content: '2025년부터 첫째 아이 지원금 신설 및 확대',
          how: '거주지 행정복지센터 또는 정부24(행복출산) 신청',
        },
        link: 'https://www.daegu.go.kr',
      },
    ],
    '광주': [
      {
        id: 'reg_gwangju_common_1',
        subRegion: '전체',
        stage: 2,
        title: '광주 출생 상생카드',
        desc: '출생 시 50만원 상당 선불카드 지급',
        tags: ['광주시 전용'],
        details: {
          target: '광주시 거주 모든 출산 가정',
          content: '광주 지역 내에서 사용 가능한 50만원 충전 상생카드 지급',
          how: '아이키움 광주 홈페이지 또는 행정복지센터 신청',
        },
        link: 'https://www.gwangju.go.kr',
      },
    ],
    '대전': [
      {
        id: 'reg_daejeon_common_1',
        subRegion: '전체',
        stage: 2,
        title: '대전형 부모급여',
        desc: '정부 급여 외 월 30만원 추가 지급 (0~2세)',
        tags: ['대전시 전용', '현금 지원'],
        details: {
          target: '대전시 거주 0~2세 아동 부모',
          content: '국가 부모급여와 중복 수혜 가능, 매월 25일 현금 지급',
          how: '복지로 온라인 신청 또는 행정복지센터 방문',
        },
        link: 'https://www.daejeon.go.kr',
      },
    ],
    '울산': [
      {
        id: 'reg_ulsan_common_1',
        subRegion: '전체',
        stage: 3,
        title: '울산 (외)조부모 돌봄수당',
        desc: '월 30만원 현금 지원 (최장 12개월)',
        tags: ['울산시 전용', '돌봄 지원'],
        details: {
          target: '맞벌이 등 돌봄 공백 가정의 조부모',
          content: '만 2세 미만 손자녀를 돌보는 조부모에게 활동비 지원',
          how: '울산시 복지포털 또는 주민센터 신청',
        },
        link: 'https://www.ulsan.go.kr',
      },
    ],
    '세종': [
      {
        id: 'reg_sejong_common_1',
        subRegion: '세종시',
        stage: 2,
        title: '세종시 출산축하금',
        desc: '120만원 지역화폐(여민전) 지급',
        tags: ['세종시 전용'],
        details: {
          target: '세종시 거주 출생아 부모',
          content: '출생 신고 시 여민전 포인트로 120만원 일시 지급',
          how: '정부24(행복출산) 또는 행정복지센터 신청',
        },
        link: 'https://www.sejong.go.kr',
      },
    ],
    '전북': [
      {
        id: 'reg_jeonbuk_common_1',
        subRegion: '전체',
        stage: 3,
        title: '전북 소상공인·농어민 출산급여',
        desc: '출산 시 본인 90만원 등 최대 150만원 지원',
        tags: ['전북도 전용', '전국 최초'],
        details: {
          target: '전북 거주 1인 소상공인 및 농어업인',
          content: '고용보험 미가입 자영업자/농어민 대상 출산 지원금',
          how: '전북특별자치도 홈페이지 또는 시군청 신청',
        },
        link: 'https://www.jeonbuk.go.kr',
      },
    ],
    '제주': [
      {
        id: 'reg_jeju_common_1',
        subRegion: '전체',
        stage: 2,
        title: '제주 출산·양육지원금',
        desc: '첫째 50만 · 둘째 이상 200만원 이상 지원',
        tags: ['제주도 전용'],
        details: {
          target: '제주도 거주 출산 가정',
          content: '자녀 순위별 차등 지급 및 돌봄 서비스 연계 지원',
          how: '제주도청 홈페이지 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.jeju.go.kr',
      },
    ],
  };
}

/**
 * 데이터 병합 및 정렬
 */
function mergeWelfareData(national, regional) {
  const combined = [...national, ...regional];
  return combined.sort((a, b) => a.stage - b.stage);
}
