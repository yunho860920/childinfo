// src/data/infrastructure/nursing_rooms.js

export const nursingRoomsInfra = [
  // 서울
  { id: 'nr-001', name: '길음역 유아휴게실', type: '유아휴게소', region: '서울', subRegion: '성북구', dong: '길음동', address: '서울특별시 성북구 동소문로 248 (길음역 4호선)', mapUrl: 'https://map.kakao.com/?q=길음역+수유실' },
  { id: 'nr-002', name: '합정역 유아휴게실', type: '유아휴게소', region: '서울', subRegion: '마포구', dong: '합정동', address: '서울특별시 마포구 양화로 45 (합정역 6호선)', mapUrl: 'https://map.kakao.com/?q=합정역+수유실' },
  { id: 'nr-003', name: '여의나루역 유아휴게실', type: '유아휴게소', region: '서울', subRegion: '영등포구', dong: '여의도동', address: '서울특별시 영등포구 여의동로 343 (여의나루역 5호선)', mapUrl: 'https://map.kakao.com/?q=여의나루역+수유실' },
  { id: 'nr-004', name: '강남역 유아휴게실', type: '유아휴게소', region: '서울', subRegion: '강남구', dong: '역삼동', address: '서울특별시 강남구 강남대로 396 (강남역 2호선)', mapUrl: 'https://map.kakao.com/?q=강남역+수유실' },
  { id: 'nr-005', name: '서울역 유아휴게실', type: '유아휴게소', region: '서울', subRegion: '중구', dong: '남대문로5가', address: '서울특별시 중구 한강대로 405 (서울역)', mapUrl: 'https://map.kakao.com/?q=서울역+수유실' },
  
  // 경기
  { id: 'nr-006', name: '수원역 유아휴게실', type: '유아휴게소', region: '경기', subRegion: '수원시', dong: '매산로1가', address: '경기도 수원시 팔달구 덕영대로 924 (수원역)', mapUrl: 'https://map.kakao.com/?q=수원역+수유실' },
  { id: 'nr-007', name: '광명사거리역 유아휴게실', type: '유아휴게소', region: '경기', subRegion: '광명시', dong: '광명동', address: '경기도 광명시 광명로 920 (광명사거리역 7호선)', mapUrl: 'https://map.kakao.com/?q=광명사거리역+수유실' },
  { id: 'nr-008', name: '판교역 유아휴게실', type: '유아휴게소', region: '경기', subRegion: '성남시', dong: '백현동', address: '경기도 성남시 분당구 판교역로 160 (판교역)', mapUrl: 'https://map.kakao.com/?q=판교역+수유실' },
  
  // 인천
  { id: 'nr-009', name: '인천시청역 유아휴게실', type: '유아휴게소', region: '인천', subRegion: '남동구', dong: '간석동', address: '인천광역시 남동구 예술로 264 (인천시청역)', mapUrl: 'https://map.kakao.com/?q=인천시청역+수유실' },
  { id: 'nr-010', name: '부평역 유아휴게실', type: '유아휴게소', region: '인천', subRegion: '부평구', dong: '부평동', address: '인천광역시 부평구 광장로 16 (부평역)', mapUrl: 'https://map.kakao.com/?q=부평역+수유실' },

  // 부산
  { id: 'nr-011', name: '부산역 유아휴게실', type: '유아휴게소', region: '부산', subRegion: '동구', dong: '초량동', address: '부산광역시 동구 중앙대로 206 (부산역)', mapUrl: 'https://map.kakao.com/?q=부산역+수유실' },
  { id: 'nr-012', name: '서면역 유아휴게실', type: '유아휴게소', region: '부산', subRegion: '부산진구', dong: '부전동', address: '부산광역시 부산진구 가야대로 777 (서면역)', mapUrl: 'https://map.kakao.com/?q=서면역+수유실' },

  // 대구
  { id: 'nr-013', name: '동대구역 유아휴게실', type: '유아휴게소', region: '대구', subRegion: '동구', dong: '신암동', address: '대구광역시 동구 동대구로 550 (동대구역)', mapUrl: 'https://map.kakao.com/?q=동대구역+수유실' },
  { id: 'nr-014', name: '반월당역 유아휴게실', type: '유아휴게소', region: '대구', subRegion: '중구', dong: '덕산동', address: '대구광역시 중구 달구벌대로 2100 (반월당역)', mapUrl: 'https://map.kakao.com/?q=반월당역+수유실' },

  // 대전
  { id: 'nr-015', name: '대전역 유아휴게실', type: '유아휴게소', region: '대전', subRegion: '동구', dong: '정동', address: '대전광역시 동구 중앙로 215 (대전역)', mapUrl: 'https://map.kakao.com/?q=대전역+수유실' },

  // 광주
  { id: 'nr-016', name: '광주송정역 유아휴게실', type: '유아휴게소', region: '광주', subRegion: '광산구', dong: '송정동', address: '광주광역시 광산구 상무대로 201 (광주송정역)', mapUrl: 'https://map.kakao.com/?q=광주송정역+수유실' },

  // 울산
  { id: 'nr-017', name: '울산역 유아휴게실', type: '유아휴게소', region: '울산', subRegion: '울주군', dong: '삼남읍', address: '울산광역시 울주군 삼남읍 울산역로 177 (울산역)', mapUrl: 'https://map.kakao.com/?q=울산역+수유실' },

  // 세종
  { id: 'nr-018', name: '정부세종청사 유아휴게실', type: '유아휴게소', region: '세종', subRegion: '세종시', dong: '어진동', address: '세종특별자치시 도움6로 11 (정부세종청사)', mapUrl: 'https://map.kakao.com/?q=정부세종청사+수유실' }
];
