// src/data/infrastructure/metropals_infra.js

export const metropalsInfra = [
  // --- 부산광역시 ---
  { id: 'p-busan-01', name: '부산광역시 가족센터', type: '가족센터', region: '부산', subRegion: '전체', dong: '전체', address: '부산 연제구 거제천로 232', mapUrl: 'https://map.kakao.com/?q=부산광역시+가족센터' },
  { id: 'p-busan-02', name: '부산광역시 육아종합지원센터', type: '육아종합지원센터', region: '부산', subRegion: '연제구', dong: '전체', address: '부산 연제구 거제천로 232', mapUrl: 'https://map.kakao.com/?q=부산광역시+육아종합지원센터' },
  { id: 'p-busan-03', name: '해운대구 가족센터', type: '가족센터', region: '부산', subRegion: '해운대구', dong: '전체', address: '부산 해운대구 양운로 91', mapUrl: 'https://map.kakao.com/?q=해운대구+가족센터' },
  { id: 'p-busan-04', name: '강서구 가족센터', type: '가족센터', region: '부산', subRegion: '강서구', dong: '전체', address: '부산 강서구 신문로 127', mapUrl: 'https://map.kakao.com/?q=부산+강서구+가족센터' },

  // --- 인천광역시 ---
  { id: 'p-incheon-01', name: '인천광역시 가족센터', type: '가족센터', region: '인천', subRegion: '전체', dong: '전체', address: '인천 미추홀구 석바위로 33', mapUrl: 'https://map.kakao.com/?q=인천광역시+가족센터' },
  { id: 'p-incheon-02', name: '인천광역시 육아종합지원센터', type: '육아종합지원센터', region: '인천', subRegion: '전체', dong: '전체', address: '인천 남동구 예술로 152번길 33', mapUrl: 'https://map.kakao.com/?q=인천광역시+육아종합지원센터' },
  { id: 'p-incheon-03', name: '부평구 가족센터', type: '가족센터', region: '인천', subRegion: '부평구', dong: '전체', address: '인천 부평구 주부토로 143', mapUrl: 'https://map.kakao.com/?q=부평구+가족센터' },

  // --- 대구광역시 ---
  { id: 'p-daegu-01', name: '대구광역시 가족센터', type: '가족센터', region: '대구', subRegion: '전체', dong: '전체', address: '대구 남구 봉덕로 61', mapUrl: 'https://map.kakao.com/?q=대구광역시+가족센터' },
  { id: 'p-daegu-02', name: '대구광역시 육아종합지원센터', type: '육아종합지원센터', region: '대구', subRegion: '서구', dong: '전체', address: '대구 서구 국채보상로 46길 15', mapUrl: 'https://map.kakao.com/?q=대구광역시+육아종합지원센터' },

  // --- 대전광역시 ---
  { id: 'p-daejeon-01', name: '대전광역시 가족센터', type: '가족센터', region: '대전', subRegion: '전체', dong: '전체', address: '대전 유성구 테크노6로 40', mapUrl: 'https://map.kakao.com/?q=대전광역시+가족센터' },
  { id: 'p-daejeon-02', name: '대전광역시 육아종합지원센터', type: '육아종합지원센터', region: '대전', subRegion: '중구', dong: '전체', address: '대전 중구 보문로 246', mapUrl: 'https://map.kakao.com/?q=대전광역시+육아종합지원센터' },

  // --- 광주광역시 ---
  { id: 'p-gwangju-01', name: '광주광역시 가족센터', type: '가족센터', region: '광주', subRegion: '전체', dong: '전체', address: '광주 서구 경열로 18', mapUrl: 'https://map.kakao.com/?q=광주광역시+가족센터' },
  { id: 'p-gwangju-02', name: '광주광역시 육아종합지원센터', type: '육아종합지원센터', region: '광주', subRegion: '북구', dong: '전체', address: '광주 북구 우치로 170', mapUrl: 'https://map.kakao.com/?q=광주광역시+육아종합지원센터' },

  // --- 울산광역시 ---
  { id: 'p-ulsan-01', name: '울산광역시 가족센터', type: '가족센터', region: '울산', subRegion: '전체', dong: '전체', address: '울산 남구 돋질로 239', mapUrl: 'https://map.kakao.com/?q=울산광역시+가족센터' },
  { id: 'p-ulsan-02', name: '울산광역시 육아종합지원센터', type: '육아종합지원센터', region: '울산', subRegion: '남구', dong: '전체', address: '울산 남구 꽃대나기로 31', mapUrl: 'https://map.kakao.com/?q=울산광역시+육아종합지원센터' },

  // --- 세종특별자치시 ---
  { id: 'p-sejong-01', name: '세종특별자치시 가족센터', type: '가족센터', region: '세종', subRegion: '세종시', dong: '전체', address: '세종특별자치시 새롬로 14', mapUrl: 'https://map.kakao.com/?q=세종특별자치시+가족센터' },
  { id: 'p-sejong-02', name: '세종특별자치시 육아종합지원센터', type: '육아종합지원센터', region: '세종', subRegion: '세종시', dong: '전체', address: '세종특별자치시 한누리대로 2150', mapUrl: 'https://map.kakao.com/?q=세종특별자치시+육아종합지원센터' },

  // --- 어린이집 (경기 권역 주요 거점) ---
  { id: 'g-day-01', name: '수원시청 어린이집', type: '어린이집', region: '경기', subRegion: '수원시', dong: '인계동', address: '경기 수원시 팔달구 효원로 241', mapUrl: 'https://map.kakao.com/?q=수원시청+어린이집' },
  { id: 'g-day-02', name: '용인시청 어린이집', type: '어린이집', region: '경기', subRegion: '용인시', dong: '삼가동', address: '경기 용인시 처인구 중부대로 1199', mapUrl: 'https://map.kakao.com/?q=용인시청+어린이집' },
  { id: 'g-day-03', name: '성남시청 어린이집', type: '어린이집', region: '경기', subRegion: '성남시', dong: '야탑동', address: '경기 성남시 중원구 성남대로 997', mapUrl: 'https://map.kakao.com/?q=성남시청+어린이집' },
  { id: 'g-day-04', name: '고양시청 어린이집', type: '어린이집', region: '경기', subRegion: '고양시', dong: '주교동', address: '경기 고양시 덕양구 고양시청로 10', mapUrl: 'https://map.kakao.com/?q=고양시청+어린이집' },
  { id: 'g-day-05', name: '화성시청 어린이집', type: '어린이집', region: '경기', subRegion: '화성시', dong: '남양읍', address: '경기 화성시 시청로 159', mapUrl: 'https://map.kakao.com/?q=화성시청+어린이집' },
  { id: 'g-day-06', name: '부천시청 어린이집', type: '어린이집', region: '경기', subRegion: '부천시', dong: '중동', address: '경기 부천시 길주로 210', mapUrl: 'https://map.kakao.com/?q=부천시청+어린이집' },
  { id: 'g-day-07', name: '남양주시청 어린이집', type: '어린이집', region: '경기', subRegion: '남양주시', dong: '금곡동', address: '경기 남양주시 경춘로 1037', mapUrl: 'https://map.kakao.com/?q=남양주시청+어린이집' },
  { id: 'g-day-08', name: '안산시청 어린이집', type: '어린이집', region: '경기', subRegion: '안산시', dong: '고잔동', address: '경기 안산시 단원구 화랑로 387', mapUrl: 'https://map.kakao.com/?q=안산시청+어린이집' }
];
