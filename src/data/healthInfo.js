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
    { name: 'Dtap', dose: '1차', type: '필수', desc: '디프테리아, 파상풍, 백일해' },
    { name: '폴리오(IPV)', dose: '1차', type: '필수', desc: '소아마비 예방' },
    { name: '뇌수막염(Hib)', dose: '1차', type: '필수', desc: 'B형 헤모필루스 인플루엔자' },
    { name: '폐렴구균(PCV)', dose: '1차', type: '필수', desc: '폐렴 및 중이염 예방' },
    { name: '로타바이러스', dose: '1차', type: '선택', desc: '장염 예방 (기타)' }
  ] },
  { months: 4, label: '4개월', vaccines: [
    { name: 'Dtap', dose: '2차', type: '필수', desc: '디프테리아, 파상풍, 백일해' },
    { name: '폴리오(IPV)', dose: '2차', type: '필수', desc: '소아마비 예방' },
    { name: '뇌수막염(Hib)', dose: '2차', type: '필수', desc: 'B형 헤모필루스 인플루엔자' },
    { name: '폐렴구균(PCV)', dose: '2차', type: '필수', desc: '폐렴 및 중이염 예방' }
  ] },
  { months: 6, label: '6개월', vaccines: [
    { name: 'B형 간염', dose: '3차', type: '필수', desc: '간염 예방 완료' },
    { name: 'Dtap', dose: '3차', type: '필수', desc: '백일해 등 추가 접종' },
    { name: '폐렴구균(PCV)', dose: '3차', type: '필수', desc: '폐렴구균 보호 강화' }
  ] }
];

export const ageHealthData = [
  {
    ageLabel: '신생아',
    border: 'border-blue-500',
    conditions: [
      { name: '영아 산통', desc: '이유 없이 계속 우는 경우, 배에 가스가 찼는지 확인하세요.', needsDoctor: false },
      { name: '신생아 황달', desc: '피부나 눈의 흰자가 노랗게 변하면 즉시 소아과를 방문하세요.', needsDoctor: true, doctorNote: '광선 치료가 필요할 수 있습니다.' }
    ]
  }
];
