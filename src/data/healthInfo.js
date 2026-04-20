// src/data/healthInfo.js
export const temperatureGuide = {
  title: '소아 체온 및 해열제 가이드',
  desc: '올바른 해열제 복용 및 대처법은 아이의 안전을 지키는 첫걸음입니다.',
  measureSites: [
    { site: '항문(직장)', normal: '36.6 ~ 38.0°C', note: '가장 정확한 중심부 체온' },
    { site: '구강(입)', normal: '35.5 ~ 37.5°C', note: '음식물 섭취 30분 후 측정' },
    { site: '귀(고막)', normal: '35.8 ~ 38.0°C', note: '6개월 이상 권장' },
    { site: '겨드랑이', normal: '35.3 ~ 37.3°C', note: '충분히 밀착하여 측정' },
  ],
  feverLevels: [
    { range: '37.5°C 이하', label: '정상', color: 'green', action: '적절한 습도 유지 및 수분 섭취' },
    { range: '37.5 ~ 37.9°C', label: '미열', color: 'yellow', action: '미온수 마사지, 컨디션 확인' },
    { range: '38.0 ~ 38.9°C', label: '중등도 열', color: 'orange', action: '해열제 복용, 30분 간격 재측정' },
    { range: '39.0°C 이상', label: '고열', color: 'red', action: '즉시 해열제 복용 및 전문의 진찰' },
  ],
  crossDosing: {
    title: '해열제 교차 복용 가이드',
    warning: '반드시 동일 성분이 아닌 다른 성분의 해열제를 2시간 이상 간격으로 교차 복용해야 합니다.',
    items: [
      { name: '아세트아미노펜', brands: '타이레놀, 챔프 분홍', interval: '4~6시간' },
      { name: '이부프로펜/덱시부프로펜', brands: '부루펜, 챔프 파랑, 맥시부펜', interval: '6~8시간' },
    ]
  }
};

export const vaccinationSchedule = [
  { months: 0, label: '출생 직후', vaccines: [{ name: 'B형 간염', dose: '1차', type: '필수', desc: '간염 바이러스 감염 예방' }] },
  { months: 1, label: '1개월', vaccines: [{ name: 'B형 간염', dose: '2차', type: '필수', desc: '간염 바이러스 감염 예방' }] },
  { months: 2, label: '2개월', vaccines: [
    { name: 'DTaP', dose: '1차', type: '필수', desc: '디프테리아, 파상풍, 백일해' },
    { name: '폴리오(IPV)', dose: '1차', type: '필수', desc: '소아마비 예방' },
    { name: '뇌수막염(Hib)', dose: '1차', type: '필수', desc: 'B형 헤모필루스 인플루엔자' },
    { name: '폐렴구균(PCV)', dose: '1차', type: '필수', desc: '폐렴 및 중이염 예방' },
    { name: '로타바이러스', dose: '1차', type: '선택', desc: '장염 예방 (로타텍/로타릭스)' }
  ] },
  { months: 4, label: '4개월', vaccines: [
    { name: 'DTaP', dose: '2차', type: '필수', desc: '디프테리아, 파상풍, 백일해' },
    { name: '폴리오(IPV)', dose: '2차', type: '필수', desc: '소아마비 예방' },
    { name: '뇌수막염(Hib)', dose: '2차', type: '필수', desc: 'B형 헤모필루스 인플루엔자' },
    { name: '폐렴구균(PCV)', dose: '2차', type: '필수', desc: '백신 면역 강화' }
  ] },
  { months: 6, label: '6개월', vaccines: [
    { name: 'B형 간염', dose: '3차', type: '필수', desc: 'B형 간염 기초 접종 완료' },
    { name: 'DTaP', dose: '3차', type: '필수', desc: '디프테리아, 파상풍, 백일해' },
    { name: '폴리오(IPV)', dose: '3차', type: '필수', desc: '기초 접종 단계' },
    { name: '뇌수막염(Hib)', dose: '3차', type: '필수', desc: 'B형 헤모필루스 인플루엔자' },
    { name: '폐렴구균(PCV)', dose: '3차', type: '필수', desc: '폐렴구균 보호 강화' }
  ] },
  { months: 12, label: '12~15개월', vaccines: [
    { name: 'MMR', dose: '1차', type: '필수', desc: '홍역, 유행성 이하선염, 풍진' },
    { name: '수두', dose: '1차', type: '필수', desc: '수두 바이러스 예방' },
    { name: '일본뇌염', dose: '1차', type: '필수', desc: '생백신 또는 사백신 선택' },
    { name: 'A형 간염', dose: '1차', type: '필수', desc: '급성 A형 간염 예방' },
    { name: 'DTaP', dose: '4차', type: '필수', desc: '추가 접종 (면역 유지)' },
    { name: '뇌수막염(Hib)', dose: '4차', type: '필수', desc: '기초 접종 완료' },
    { name: '폐렴구균(PCV)', dose: '4차', type: '필수', desc: '폐렴구균 보호 완성' }
  ] },
  { months: 18, label: '18개월', vaccines: [
    { name: 'A형 간염', dose: '2차', type: '필수', desc: 'A형 간염 평생 면역 획득' }
  ] },
  { months: 48, label: '만 4~6세', vaccines: [
    { name: 'DTaP', dose: '5차', type: '필수', desc: '추가 접종 (면역 보강)' },
    { name: '폴리오(IPV)', dose: '4차', type: '필수', desc: '기초 접종 완료' },
    { name: 'MMR', dose: '2차', type: '필수', desc: '홍역 등 2차 접종' },
    { name: '일본뇌염', dose: '3차', type: '필수', desc: '면역력 강화 유지' }
  ] },
  { months: 132, label: '만 11~12세', vaccines: [
    { name: 'Tdap/Td', dose: '6차', type: '필수', desc: '파상풍, 디프테리아, 백일해' },
    { name: '일본뇌염', dose: '5차(사백신)', type: '필수', desc: '최종 접종 단계' },
    { name: '사람유두종바이러스(HPV)', dose: '1~2차', type: '필수', desc: '자궁경부암 등 예방 (여/남아)' }
  ] }
];

export const growthMilestones = [
  {
    months: 4,
    label: '생후 4~6개월',
    items: [
      { id: 'm4_roll', name: '뒤집기 시도', desc: '몸을 한쪽 방향으로 뒤집을 수 있나요?', type: 'Physical' },
      { id: 'm4_grab', name: '물건 잡기', desc: '눈 앞의 물건을 손으로 잡으려 하나요?', type: 'Physical' },
      { id: 'm4_laugh', name: '소리 내어 웃기', desc: '기분이 좋을 때 소리 내어 웃나요?', type: 'Social' }
    ]
  },
  {
    months: 9,
    label: '생후 7~9개월',
    items: [
      { id: 'm9_sit', name: '혼자 앉기', desc: '도움 없이 잠시 동안 앉아 있나요?', type: 'Physical' },
      { id: 'm9_babble', name: '옹알이 증가', desc: '바-바, 마-마 같은 음절을 반복하나요?', type: 'Language' },
      { id: 'm9_stranger', name: '낯가림', desc: '낯선 사람을 보고 울거나 피하나요?', type: 'Social' }
    ]
  },
  {
    months: 12,
    label: '생후 10~12개월',
    items: [
      { id: 'm12_stand', name: '잡고 서기', desc: '주변 사물을 잡고 스스로 일어나나요?', type: 'Physical' },
      { id: 'm12_wave', name: '안녕 손 흔들기', desc: '작별 인사를 할 때 손을 흔드나요?', type: 'Social' },
      { id: 'm12_point', name: '가리키기', desc: '원하는 것이 있을 때 손가락으로 가리키나요?', type: 'Cognitive' }
    ]
  },
  {
    months: 18,
    label: '생후 13~18개월',
    items: [
      { id: 'm18_walk', name: '혼자 걷기', desc: '도움 없이 안정적으로 걷기 시작했나요?', type: 'Physical' },
      { id: 'm18_word', name: '의미 있는 단어', desc: '엄마, 아빠 외에 3개 이상의 단어를 말하나요?', type: 'Language' },
      { id: 'm18_toy', name: '장난감 실연', desc: '전화기를 귀에 대는 등 흉내를 내나요?', type: 'Cognitive' }
    ]
  },
  {
    months: 24,
    label: '생후 19~24개월',
    items: [
      { id: 'm24_stair', name: '계단 오르기', desc: '난간을 잡고 계단을 한 발씩 올라가나요?', type: 'Physical' },
      { id: 'm24_sentence', name: '두 단어 문장', desc: '우유 줘, 이거 뭐야 같은 문장을 말하나요?', type: 'Language' },
      { id: 'm24_parallel', name: '병행 놀이', desc: '다른 아이들 곁에서 각자 노나요?', type: 'Social' }
    ]
  },
  {
    months: 36,
    label: '만 3세 (36개월)',
    items: [
      { id: 'm36_jump', name: '두 발 모아 뛰기', desc: '제자리에서 두 발을 동시에 떼고 뛰나요?', type: 'Physical' },
      { id: 'm36_name', name: '이름 말하기', desc: '자신의 이름과 성별을 말할 수 있나요?', type: 'Language' },
      { id: 'm36_circle', name: '원 그리기', desc: '동그라미 모양을 흉내 내어 그리나요?', type: 'Cognitive' }
    ]
  }
];

export const ageHealthData = [
  {
    ageLabel: '신생아',
    border: 'border-blue-500',
    conditions: [
      { name: '영아 산통', desc: '이유 없이 계속 우는 경우, 배에 가스가 찼는지 확인하세요.', needsDoctor: false },
      { name: '신생아 황달', desc: '피부나 눈의 흰자가 노랗게 변하면 즉시 소아과를 방문하세요.', needsDoctor: true, doctorNote: '광선 치료가 필요할 수 있습니다.' }
    ]
  },
  {
    ageLabel: '영아 후기',
    border: 'border-emerald-500',
    conditions: [
      { name: '치아 맹출', desc: '아랫니 두 개가 올라오기 시작합니다. 거즈로 닦아주세요.', needsDoctor: false },
      { name: '분리 불안', desc: '양육자와 떨어질 때 심하게 울 수 있습니다. 꾸준한 애정 표현이 중요합니다.', needsDoctor: false }
    ]
  },
  {
    ageLabel: '걸음마기',
    border: 'border-orange-500',
    conditions: [
      { name: '식사 거부', desc: '독립심이 생기며 편식이 생길 수 있습니다. 억지로 먹이지 마세요.', needsDoctor: false },
      { name: '모서리 추돌', desc: '활동량이 늘어나 부딪힘 사고가 잦습니다. 안전 가드가 필수입니다.', needsDoctor: false }
    ]
  },
  {
    ageLabel: '유아 초기',
    border: 'border-purple-500',
    conditions: [
      { name: '배변 훈련', desc: '스스로 신호를 인지하기 시작하는 시기입니다. 칭찬을 아끼지 마세요.', needsDoctor: false },
      { name: '한글/숫자 노출', desc: '놀이를 통해 자연스럽게 학습에 흥미를 느끼도록 도와주세요.', needsDoctor: false }
    ]
  }
];
