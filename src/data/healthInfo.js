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
  }
];

export const ageHealthData = [
  {
    ageLabel: '신생아기 (0~1개월)',
    border: 'border-blue-500',
    conditions: [
      { name: '영아돌연사증후군(SIDS) 예방', desc: '아이는 반드시 똑바로 눕혀 재우고, 침구는 딱딱하게 유지하며 주변에 인형이나 두꺼운 이불을 두지 마세요.', needsDoctor: false, emergency: true },
      { name: '신생아 황달', desc: '피부나 눈의 흰자가 노랗게 변하면 즉시 방문하세요. 특히 손발바닥까지 노랗다면 시급합니다.', needsDoctor: true, doctorNote: '광선 치료가 필요할 수 있습니다.' },
      { name: '제대 탈락 및 배꼽 관리', desc: '배꼽이 떨어지기 전후로 진물이 나거나 냄새가 나고 주변이 붉어지면 진료를 받으세요.', needsDoctor: true },
      { name: '영아 산통', desc: '이유 없이 자지러지게 우는 경우, 배를 따뜻하게 하고 \'하늘 자전거\' 운동으로 가스 배출을 도와주세요.', needsDoctor: false }
    ]
  },
  {
    ageLabel: '영아기 (1~12개월)',
    border: 'border-emerald-500',
    conditions: [
      { name: '장중첩증 (응급)', desc: '심한 복통으로 자지러지게 울다가 멈추기를 반복하고, 딸기잼 같은 혈변을 보면 즉시 응급실로 가세요.', needsDoctor: true, doctorNote: '발병 24시간 내 공기 정복술이 필요합니다.', emergency: true },
      { name: '기도폐쇄 및 이물질 흡입', desc: '갑자기 숨을 못 쉬거나 얼굴이 파래지면 즉시 119를 부르고 등 두드리기와 가슴 압박(영아 하임리히법)을 시행하세요.', needsDoctor: true, emergency: true },
      { name: '모세기관지염 및 폐렴', desc: '숨을 쉴 때 쌕쌕거리는 소리가 나거나 콧구멍을 벌렁거리며 힘들게 숨을 쉬면 즉시 진료가 필요합니다.', needsDoctor: true },
      { name: '돌발진 (장미진)', desc: '3~5일간 고열이 지속되다가 열이 내리면서 온몸에 장밋빛 발진이 돋는 것이 특징입니다.', needsDoctor: true, doctorNote: '충분한 수분 공급과 해열제 복용이 중요합니다.' }
    ]
  },
  {
    ageLabel: '유아기 (1~3세)',
    border: 'border-orange-500',
    conditions: [
      { name: '열경련(열성 경련) 대처', desc: '주변의 위험한 물건을 치우고 고개를 옆으로 돌려 기도를 확보하세요. 절대 입에 손가락이나 수건을 넣지 마세요.', needsDoctor: true, doctorNote: '5분 이상 지속되거나 몸 한쪽만 경련하면 119를 호출하세요.', emergency: true },
      { name: '장염 및 급성 탈수', desc: '심한 설사와 구토로 소변량이 줄고 눈이 쑥 들어가며 처지는 경우 탈수 증상이니 수액 치료가 시급합니다.', needsDoctor: true, emergency: true },
      { name: '낙상 및 두부손상', desc: '추락 후 구토를 하거나, 의식이 흐릿하고 자꾸 자려고 하며 동공 크기가 다르면 즉시 응급실로 이동하세요.', needsDoctor: true, emergency: true },
      { name: '화상 응급처치', desc: '흐르는 찬물에 15~20분간 열을 식히세요. 물집은 절대 터뜨리지 말고 깨끗한 거즈로 감싸 병원을 방문하세요.', needsDoctor: true, emergency: true },
      { name: '수족구병', desc: '입안의 수포로 먹지 못해 탈수가 오기 쉽습니다. 부드럽고 시원한 음식 위주로 섭취하게 하세요.', needsDoctor: true }
    ]
  },
  {
    ageLabel: '학령전기 (3~6세)',
    border: 'border-purple-500',
    conditions: [
      { name: '뇌수막염 의심 징후', desc: '고열과 함께 심한 두통, 구토, 목이 뻣뻣해져서 고개를 숙이지 못하는 증상이 있으면 즉시 진료받으세요.', needsDoctor: true, emergency: true },
      { name: '크룹 (급성 후두염)', desc: '밤에 갑자기 \'컹컹\'거리는 개 짖는 듯한 기침을 하고 숨쉬기 힘들어하면 시원한 공기를 마시게 하며 응급실로 가세요.', needsDoctor: true, emergency: true },
      { name: '아낙필락시스 (알레르기 쇼크)', desc: '특정 음식/약물 섭취 후 두드러기, 호흡곤란, 혈압 저하가 오면 즉시 119를 부르고 에피네프린을 사용해야 합니다.', needsDoctor: true, emergency: true },
      { name: '중이염', desc: '감기 후 귀 통증을 호소하거나 귀를 자꾸 만지며 보채면 확인이 필요합니다. 청력 저하의 원인이 될 수 있습니다.', needsDoctor: true },
      { name: '농가진 및 소아 변비', desc: '전염성이 강한 농가진은 항생제 연고가 필요하며, 변비는 충분한 식이섬유와 수분 섭취, 배변 습관 교육이 중요합니다.', needsDoctor: true }
    ]
  },
  {
    ageLabel: '학령기 (만 7세~)',
    border: 'border-pink-500',
    conditions: [
      { name: '주의력결핍 과다행동장애(ADHD)', desc: '산만함, 충동성, 집중력 저하가 일상 생활과 학습에 지장을 준다면 전문의의 상담과 체계적인 치료가 필요합니다.', needsDoctor: true },
      { name: '성조숙증 징후 관찰', desc: '여아 만 8세 미만 가슴 발달, 남아 만 9세 미만 고환 크기 증가 등 2차 성징이 일찍 나타나면 검사가 필요합니다.', needsDoctor: true, doctorNote: '성장판 및 호르몬 검사를 권장합니다.' },
      { name: '틱(Tic) 장애', desc: '눈 깜빡임, 코 킁킁거림 등 본인의 의지와 상관없는 동작이나 소리가 반복되면 꾸짖지 말고 정서적 안정을 도와주세요.', needsDoctor: true },
      { name: '성장통', desc: '활동량이 많은 날 주로 밤에 다리 통증을 호소합니다. 따뜻한 찜질과 마사지가 도움이 되나, 낮에도 아프거나 부어오르면 진료받으세요.', needsDoctor: false },
      { name: '치아우식증(충치) 및 각결막염', desc: '영구치가 나는 시기이므로 철저한 양치와 정기 검진이 필수이며, 유행성 눈병 시 전염 방지에 유의하세요.', needsDoctor: true },
      { name: '약물/독소 중독 대처', desc: '위험 물질을 삼킨 경우 억지로 토하게 하지 말고 물질 용기를 챙겨 즉시 응급실로 이동하세요.', needsDoctor: true, emergency: true }
    ]
  }
];
