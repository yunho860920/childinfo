// src/services/welfareApi.js
// 2025~2026 최신 자료 기반 — 전국 공통 16개 + 시·군·구 단위 지역 특화 혜택 포함

/**
 * 복지 혜택 조회 (전국 공통 + 지역별 특화)
 * @param {string} region - 광역시·도 (예: '서울', '경기')
 * @param {string} subRegion - 시·군·구 (예: '강남구', '수원시') — 없으면 지역 전체
 */
export async function fetchWelfareServices(region = '전체', subRegion = '전체') {
  const roadmapData = getNationalRoadmapContent();
  const regionalData = getRegionalWelfareHighlights(region, subRegion);
  return mergeWelfareData(roadmapData, regionalData);
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
// 전국 공통 필수 로드맵 (16개 항목)
// ──────────────────────────────────────────────
function getNationalRoadmapContent() {
  return [
    // ── Stage 1: 임신 중 ──────────────────────
    {
      id: 'nat_1',
      stage: 1,
      title: '임신·출산 진료비 바우처',
      desc: '임신 확인 시 국민행복카드 100만원(다태아 200만원) 지원',
      tags: ['의료비 지원', '바우처'],
      details: {
        target: '임신확인서로 임신이 확인된 건강보험 가입자',
        content: '산전 진료 및 분만 비용, 출산 후 2세 미만 영유아 진료비로 사용 가능',
        how: '건강보험공단 지사 방문·카드사 홈페이지·보건소에서 국민행복카드 신청',
      },
      link: 'https://www.hi.nhis.or.kr',
    },
    {
      id: 'nat_2',
      stage: 1,
      title: '배우자 출산휴가 20일 (2025년 확대)',
      desc: '기존 10일에서 20일로 확대, 출산일로부터 120일 이내 최대 3회 분할 사용',
      tags: ['직장인 필수', '2025년 신설'],
      details: {
        target: '배우자가 출산한 근로자',
        content: '통상임금 100% 지급. 출산일로부터 120일 이내 사용해야 하며 최대 3회 분할 가능',
        how: '사용자에게 출산 사실 고지 후 신청 (간소화됨)',
      },
      link: 'https://www.moel.go.kr',
    },

    // ── Stage 2: 탄생 직후 ────────────────────
    {
      id: 'nat_3',
      stage: 2,
      title: '행복출산 원스톱 서비스',
      desc: '출생신고 시 부모급여·아동수당·첫만남이용권을 한 번에 신청',
      tags: ['필수 신청', '통합 행정'],
      details: {
        target: '출생 신고를 하는 모든 부모',
        content: '첫만남이용권(200~300만), 부모급여(0세 월 120만/1세 월 60만), 아동수당(월 10만) 등 일괄 처리',
        how: '정부24(gov.kr) 온라인 또는 거주지 읍면동 행정복지센터 방문',
      },
      link: 'https://www.gov.kr',
    },
    {
      id: 'nat_4',
      stage: 2,
      title: '첫만남이용권 (바우처)',
      desc: '첫째 200만원, 둘째 이상 300만원 — 국민행복카드 포인트',
      tags: ['일시 지급', '바우처'],
      details: {
        target: '주민등록번호가 부여된 출생아',
        content: '국민행복카드 포인트로 지급. 유흥업소 제외 전 업종 사용 가능. 유효기간 1년',
        how: '행복출산 원스톱 서비스 또는 복지로(bokjiro.go.kr) 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },
    {
      id: 'nat_5',
      stage: 2,
      title: '부모급여 (2025년 기준)',
      desc: '0세(0~11개월) 월 100/120만원 / 1세(12~23개월) 월 50/60만원 현금 지급',
      tags: ['매월 현금', '2025년 개편'],
      details: {
        target: '만 2세 미만 영아를 가정에서 돌보는 부모',
        content: '2025년 0세 월 120만원, 1세 월 60만원으로 대폭 인상 예정 (지자체별 예산 상황에 따라 차이 발생 가능)',
        how: '행복출산 원스톱 서비스 또는 복지로 신청 (출생 후 60일 이내 권장)',
      },
      link: 'https://www.bokjiro.go.kr',
    },

    // ── Stage 3: 초기 정착 (1~3개월) ───────────
    {
      id: 'nat_6',
      stage: 3,
      title: '6+6 부모육아휴직제 (2025년)',
      desc: '생후 18개월 내 부모 모두 휴직 시 부부 합산 최대 3,900만원 지원',
      tags: ['육아휴직', '2025년 개편'],
      details: {
        target: '생후 18개월 이내 자녀를 둔 부부 (맞벌이 필수)',
        content: '부부가 동시 또는 순차적으로 6개월씩 육아휴직 사용 시 첫 달 각 250만원 지급. 2~6개월은 통상임금의 80%',
        how: '고용센터 또는 고용노동부 고용보험 홈페이지 온라인 신청',
      },
      link: 'https://www.ei.go.kr',
    },
    {
      id: 'nat_7',
      stage: 3,
      title: '육아휴직 급여 대폭 인상 (2025년)',
      desc: '1~3개월 월 최대 250만원, 사후지급금(25%) 폐지로 즉시 전액 수령',
      tags: ['육아휴직', '사후지급금 폐지'],
      details: {
        target: '고용보험 가입 근로자 (자영업자 특례 포함)',
        content: '1~3개월 최대 월 250만원 / 4~6개월 최대 200만원 / 7개월 이후 최대 160만원. 기존 25% 사후지급금 제도가 폐지되어 휴직 중 전액 수령 가능하며, 부모 각각 1.5년으로 연장됨',
        how: '고용노동부 고용보험(ei.go.kr) 또는 고용센터 방문 신청',
      },
      link: 'https://www.ei.go.kr',
    },
    {
      id: 'nat_8',
      stage: 3,
      title: '출산가구 전기요금 할인',
      desc: '출산일로부터 3년간 전기요금 30% 감면 (월 최대 1.6만원)',
      tags: ['생활비 절감', '3년 지원'],
      details: {
        target: '출생일로부터 3년 미만 영아가 포함된 가구 (주거용)',
        content: '해당 월 전기요금의 30% 자동 차감',
        how: '한전 고객센터(123), 한전 사이버지점(cyber.kepco.co.kr) 또는 아파트 관리사무소 신청',
      },
      link: 'https://cyber.kepco.co.kr',
    },

    // ── Stage 4: 성장 가속 (4~12개월) ──────────
    {
      id: 'nat_9',
      stage: 4,
      title: '아동수당 (월 10만원)',
      desc: '만 8세 미만 모든 아동에게 매월 10만원 지급',
      tags: ['매월 현금', '만8세까지'],
      details: {
        target: '만 8세 미만 (95개월 이하) 모든 아동',
        content: '소득·재산 무관 지급. 아동 명의 계좌로 입금',
        how: '행복출산 원스톱 서비스 또는 복지로/정부24 온라인 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },
    {
      id: 'nat_10',
      stage: 4,
      title: '영유아 건강검진 8회 (무료)',
      desc: '생후 14일부터 71개월까지 총 8회 무료 검진',
      tags: ['건강 관리', '무료 검진'],
      details: {
        target: '전국 영유아 (검진 시기별로 확인 필요)',
        content: '신체 계측·발달 평가·건강 교육 등 실시. 실시 시기: 생후 14일, 4개월, 9개월, 18개월, 30개월, 42개월, 54개월, 66개월',
        how: 'The건강보험 앱에서 검진 바우처 확인 후 지정 병원 예약 방문',
      },
      link: 'https://www.hi.nhis.or.kr',
    },
    {
      id: 'nat_11',
      stage: 4,
      title: '보육료 전환 신청 (어린이집 입소 시)',
      desc: '어린이집 등원 시 부모급여 현금이 보육료 바우처로 자동 전환',
      tags: ['필수 전환', '어린이집'],
      details: {
        target: '가정 양육에서 어린이집·유치원으로 변경하는 아동',
        content: '매월 지급받던 현금이 국민행복카드 보육료 바우처로 전환됨. 신청일 기준 적용',
        how: '복지로 웹/앱 온라인 신청 또는 주민센터 방문 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },

    // ── Stage 5: 유아기 발전 (13~36개월) ────────
    {
      id: 'nat_12',
      stage: 5,
      title: '다자녀 K-패스 (2025년 신설)',
      desc: '2자녀 대중교통 30% 환급 / 3자녀 이상 50% 환급',
      tags: ['교통비 절감', '2025년 신설'],
      details: {
        target: '총 자녀 2명 이상이고 그중 1명 이상이 만 18세 이하인 부모',
        content: '월 15회 이상 대중교통 이용 시 환급. 2자녀 30%, 3자녀 이상 50%',
        how: 'K-패스 앱 또는 홈페이지의 [My 메뉴 – 다자녀 정보]에서 가족관계증명서 등록 신청',
      },
      link: 'https://www.korea-pass.kr',
    },
    {
      id: 'nat_13',
      stage: 5,
      title: '다자녀 자동차 취득세 감면',
      desc: '2자녀 가구 취득세 50% 감면 / 3자녀 이상 전액 면제',
      tags: ['세금 감면', '2025년 기준 완화'],
      details: {
        target: '18세 미만 자녀 2명 이상을 둔 다자녀 가구 (2자녀로 기준 완화)',
        content: '2자녀: 취득세 50% 감면 (6인 이하 승용차 기준, 70만원 한도). 3자녀 이상: 전액 면제 (140만원 한도)',
        how: '차량 구입 시 해당 County(시군구청) 세무과에 다자녀 증빙서류 제출',
      },
      link: 'https://www.gov.kr',
    },
    {
      id: 'nat_14',
      stage: 5,
      title: '다자녀 주택 특별공급',
      desc: '2자녀 이상 무주택 가구는 일반 청약 없이 특별공급 자격 부여',
      tags: ['주거 지원', '청약 우대'],
      details: {
        target: '입주자 모집공고일 기준 미성년 자녀 2명 이상인 무주택세대구성원',
        content: '공공분양·민간분양 특별공급 기회. 자녀 수·무주택 기간·거주 기간에 따라 가점 산정',
        how: '청약Home(applyhome.co.kr) > 청약제도안내 > 특별공급 > 다자녀가구 확인',
      },
      link: 'https://www.applyhome.co.kr',
    },
    {
      id: 'nat_14_housing',
      stage: 1,
      title: '신생아 특례대출 (2025년 확대)',
      desc: '출산 가구 대상 최저 1%대 금리 주택 구입/전세 자금 대출',
      tags: ['주거 지원', '2025년 신설'],
      details: {
        target: '대출 신청일 기준 2년 이내 출산(입양 가능)한 무주택 가구',
        content: '소득 기준이 부부 합산 2.5억원 이하(2025년 한시적 완화 예정)로 대폭 상향. 주택 가격 9억원 이하, 대출 한도 최대 5억원',
        how: '주택도시기금 기금e든든 홈페이지 또는 시중 은행 방문 신청',
      },
      link: 'https://enhuf.molit.go.kr',
    },

    // ── Stage 6: 취학 전 (37~60개월) ────────────
    {
      id: 'nat_15',
      stage: 6,
      title: '누리과정 지원 (3~5세)',
      desc: '유치원·어린이집 이용 만 3~5세 영유아 학비/보육료 지원',
      tags: ['교육비 지원', '바우처'],
      details: {
        target: '만 3~5세 모든 영유아',
        content: '표준 보육 과정(누리과정) 이용 비용 국가 지원. 사립유치원도 지원 가능',
        how: '복지로 또는 주민센터에서 유아학비/보육료 신청',
      },
      link: 'https://www.bokjiro.go.kr',
    },
    {
      id: 'nat_16',
      stage: 6,
      title: '다자녀 국가장학금 (2026년 확대)',
      desc: '다자녀 가구 소득 구간별 대학 등록금 지원, 2026년부터 지원 범위 확대',
      tags: ['교육비 지원', '2026년 확대'],
      details: {
        target: '다자녀 가구 대학생 자녀 (소득 구간별 차등)',
        content: '1~8구간 다자녀 가구 지원 단가 인상. 셋째 이상은 전액 지원 범위 확대',
        how: '한국장학재단(kosaf.go.kr) 홈페이지에서 학기별 신청',
      },
      link: 'https://www.kosaf.go.kr',
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
        title: '인천 천사(1040) 지원금',
        desc: '2023년 이후 출생아, 연 120만원 × 7년 = 총 840만원 (인천e음)',
        tags: ['인천시 전용', '총 840만원'],
        details: {
          target: '2023.1.1 이후 인천 출생아 (만 1~7세)',
          content: '매년 120만원을 인천e음 포인트로 지급. 인천 지역 가맹점에서 사용 가능',
          how: '거주지 구·군청 또는 incheon.go.kr에서 신청',
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
          how: '천안시청(cheonan.go.kr) 여성가족과 또는 동 주민센터 신청. 문의 041-521-5373',
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
          how: '아산시청(asan.go.kr) 여성복지과 또는 동 주민센터 신청. 문의 041-540-2643',
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
          how: '당진시청(dangjin.go.kr) 보건행정과 신청. 문의 041-360-6040',
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
          how: '청주시청(cheongju.go.kr) 인구정책담당관 신청. 문의 043-220-4764',
        },
        link: 'https://www.cheongju.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 전라남도
    // ══════════════════════════════════════
    '전남': [
      {
        id: 'reg_jeonnam_goheung_1',
        subRegion: '고흥군',
        stage: 2,
        title: '고흥군 출산장려금',
        desc: '전 자녀 월 30만원 × 36개월 = 1,080만원 / 넷째 이상 1,440만원',
        tags: ['고흥군 전용', '1,080만원'],
        details: {
          target: '고흥군 주소를 둔 출산 가정',
          content: '자녀 순위 무관 월 30만원씩 36개월 지급. 넷째 이상 월 40만원',
          how: '고흥군청(goheung.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.goheung.go.kr',
      },
      {
        id: 'reg_jeonnam_goheung_2',
        subRegion: '고흥군',
        stage: 4,
        title: '고흥군 출생기본수당',
        desc: '1~18세까지 매월 20만원 — 전남도·군 공동 지급',
        tags: ['고흥군 전용', '18년 장기 지원'],
        details: {
          target: '고흥군 거주 1~18세 아동',
          content: '전라남도 10만원 + 고흥군 10만원 = 월 20만원 지급',
          how: '고흥군청(goheung.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.goheung.go.kr',
      },
      {
        id: 'reg_jeonnam_haenam_1',
        subRegion: '해남군',
        stage: 2,
        title: '해남군 해남아이 키움수당',
        desc: '1~7세 매월 20만원 × 84개월 = 총 1,680만원 (지역화폐)',
        tags: ['해남군 전용', '총 1,680만원', '지역화폐'],
        details: {
          target: '해남군 거주 만 1~7세 아동',
          content: '해남사랑상품권으로 월 20만원 지급. 신생아 양육비 200만원 별도 지급',
          how: '해남군청(haenam.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.haenam.go.kr',
      },
      {
        id: 'reg_jeonnam_haenam_2',
        subRegion: '해남군',
        stage: 4,
        title: '해남군 출생기본소득',
        desc: '1~18세 매월 20만원 — 총 최대 4,320만원 장기 지원',
        tags: ['해남군 전용', '전국 최고 수준'],
        details: {
          target: '해남군 거주 1~18세 아동',
          content: '18년간 월 20만원 지급. 전국 최고 수준의 생애주기 지원',
          how: '해남군청(haenam.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.haenam.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 경상북도
    // ══════════════════════════════════════
    '경북': [
      {
        id: 'reg_gyeongbuk_sangju_1',
        subRegion: '상주시',
        stage: 2,
        title: '상주시 출산육아지원금',
        desc: '첫째 24개월(월15만=360만) / 둘째 48개월(960만) / 셋째 60개월(1,800만) / 넷째 60개월(2,400만원)',
        tags: ['상주시 전용', '넷째 2,400만원', '장기 분할'],
        details: {
          target: '출생일 기준 부 또는 모가 상주시 주민등록 가정',
          content: '월 지급 방식으로 분할 지급. 자녀 수가 많을수록 지원 기간과 금액 모두 증가',
          how: '상주시청(sangju.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.sangju.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 경상남도
    // ══════════════════════════════════════
    '경남': [
      {
        id: 'reg_gyeongnam_hamyang_1',
        subRegion: '함양군',
        stage: 2,
        title: '함양군 출산·입양장려금',
        desc: '첫째·둘째 500만원 / 셋째 이상 1,000만원 (10년 분할)',
        tags: ['함양군 전용', '10년 장기 지원'],
        details: {
          target: '함양군 거주 출산 가정',
          content: '출생신고 시 100만원 우선 지급 후 1년마다 분할 지급',
          how: '함양군청(hamyang.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.hamyang.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 대구광역시
    // ══════════════════════════════════════
    '대구': [
      {
        id: 'reg_daegu_common_1',
        subRegion: '전체',
        stage: 2,
        title: '대구시 출산지원금',
        desc: '첫째 100만 · 둘째 200만원 / 셋째 이상 고액 지원 (구·군별 상이)',
        tags: ['대구시 기준', '구·군별 확인'],
        details: {
          target: '대구시 거주 출산 가정',
          content: '구·군별로 금액이 다름. 달성군 등 일부 지역은 별도 출산축하금 추가 지급',
          how: '거주 구·군청 또는 행정복지센터 방문 신청',
        },
        link: 'https://www.daegu.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 광주광역시
    // ══════════════════════════════════════
    '광주': [
      {
        id: 'reg_gwangju_common_1',
        subRegion: '전체',
        stage: 2,
        title: '광주시 출산지원금',
        desc: '첫째 50만 · 둘째 100만 · 셋째 200만원 수준 (구별 차등)',
        tags: ['광주시 기준', '구별 확인'],
        details: {
          target: '광주시 거주 출산 가정',
          content: '구별(동구·서구·남구·북구·광산구)로 금액이 다름. 구청 확인 필요',
          how: '거주 구청 또는 행정복지센터 방문 신청',
        },
        link: 'https://www.gwangju.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 대전광역시
    // ══════════════════════════════════════
    '대전': [
      {
        id: 'reg_daejeon_common_1',
        subRegion: '전체',
        stage: 2,
        title: '대전시 출산지원금',
        desc: '자녀 수에 따라 차등 지급 (구별 상이)',
        tags: ['대전시 기준', '구별 확인'],
        details: {
          target: '대전시 거주 출산 가정',
          content: '중구·동구·서구·유성구·대덕구별로 지원 금액이 다름',
          how: '거주 구청 또는 행정복지센터 방문 신청',
        },
        link: 'https://www.daejeon.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 울산광역시
    // ══════════════════════════════════════
    '울산': [
      {
        id: 'reg_ulsan_common_1',
        subRegion: '전체',
        stage: 5,
        title: '울산 다자녀 프리패스',
        desc: '다자녀 가정 공공시설 무료 이용 (공원·수영장·박물관 등)',
        tags: ['울산시 전용', '다자녀 우대'],
        details: {
          target: '울산시 거주 다자녀(2자녀 이상) 가정',
          content: '울산시 운영 공공문화시설·체육시설 무료 이용 혜택',
          how: '울산시청(ulsan.go.kr) 또는 구·군청 신청',
        },
        link: 'https://www.ulsan.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 세종특별자치시
    // ══════════════════════════════════════
    '세종': [
      {
        id: 'reg_sejong_common_1',
        subRegion: '세종시',
        stage: 2,
        title: '세종시 출산 패키지',
        desc: '출산 가정 대상 다양한 현금·바우처·서비스 지원 통합 패키지',
        tags: ['세종시 전용'],
        details: {
          target: '세종시 거주 출산 가정',
          content: '도시 특성에 맞춘 맞춤형 출산·육아 지원. 세부 내용은 세종시청 확인 필요',
          how: '세종시청(sejong.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.sejong.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 전라북도 (전북특별자치도)
    // ══════════════════════════════════════
    '전북': [
      {
        id: 'reg_jeonbuk_common_1',
        subRegion: '전체',
        stage: 2,
        title: '전북 출산장려금',
        desc: '농어촌 지역일수록 고액 지원 — 지역별 상이',
        tags: ['전북 기준', '시군별 확인'],
        details: {
          target: '전북 거주 출산 가정',
          content: '전주시·익산시·군산시 등 도시 지역과 무주·장수·임실 등 농촌 지역의 지원 금액 차이가 큼',
          how: '거주 시·군청 또는 읍면동 행정복지센터 방문 신청',
        },
        link: 'https://www.jeonbuk.go.kr',
      },
    ],

    // ══════════════════════════════════════
    // 제주특별자치도
    // ══════════════════════════════════════
    '제주': [
      {
        id: 'reg_jeju_common_1',
        subRegion: '전체',
        stage: 2,
        title: '제주형 출산 패키지',
        desc: '출산지원금 + 돌봄쿠폰 + 제주형 추가 혜택',
        tags: ['제주도 전용'],
        details: {
          target: '제주도 거주 출산 가정',
          content: '제주시·서귀포시 각 자체 출산장려금 + 제주도 공통 돌봄 쿠폰 지급',
          how: '제주도청(jeju.go.kr) 또는 읍면동 행정복지센터 신청',
        },
        link: 'https://www.jeju.go.kr',
      },
    ],
  };
}

// ──────────────────────────────────────────────
// 데이터 병합 및 정렬
// ──────────────────────────────────────────────
function mergeWelfareData(national, regional) {
  const combined = [...national, ...regional];
  return combined.sort((a, b) => a.stage - b.stage);
}
