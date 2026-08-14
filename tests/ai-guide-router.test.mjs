import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveHomepageGuide } from '../src/services/homepageGuideRouter.js';
import { askAiGuide, buildGuideContext } from '../src/services/aiGuideService.js';
import { isFamilyPlayTourRecord } from '../src/domain/facilities/publicSourceAdapters.js';

const facilities = [
  {
    id: 'family-1', name: '강남구가족센터', type: '병원·상담', subtype: 'family-counseling',
    source: 'data-go-kr', status: 'active', region: '서울', subRegion: '강남구',
    address: '서울시 강남구 개포로 1'
  },
  {
    id: 'counsel-1', name: '서울청소년상담복지센터', type: '병원·상담', subtype: 'youth-counseling-welfare',
    source: 'data-go-kr', status: 'active', region: '서울', subRegion: '강남구',
    address: '서울특별시 강남구 상담로 2'
  },
  {
    id: 'hira-1', name: '튼튼의원', type: '병원·상담', subtype: 'pediatrics',
    source: 'hira', status: 'active', region: '서울', subRegion: '강남구',
    address: '서울특별시 강남구 건강로 3', lat: 37.50, lng: 127.03
  },
  {
    id: 'hira-2', name: '아이편한병원', type: '병원·상담', subtype: 'pediatrics',
    source: 'hira', status: 'active', region: '서울', subRegion: '마포구',
    address: '서울특별시 마포구 건강로 4', lat: 37.55, lng: 126.92
  },
  {
    id: 'hira-unknown-distance', name: '가나다소아의원', type: '병원·상담', subtype: 'pediatrics',
    source: 'hira', status: 'active', region: '서울', subRegion: '종로구',
    address: '서울특별시 종로구 건강로 5'
  },
  {
    id: 'hira-gyeonggi', name: '경기아이의원', type: '병원·상담', subtype: 'pediatrics',
    source: 'hira', status: 'active', region: '경기', subRegion: '수원시',
    address: '경기도 수원시 건강로 6', lat: 37.26, lng: 127.02
  },
  {
    id: 'nursing-1', name: '시민청 수유실', type: '유아휴게소', subtype: 'family-nursing-room',
    source: 'sooyusil', status: 'active', region: '서울', subRegion: '중구',
    address: '서울 중구 세종대로 5'
  },
  {
    id: 'family-center-1', name: '송파구가족센터', type: '가족센터', subtype: 'family-center',
    source: 'data-go-kr', status: 'active', region: '서울', subRegion: '송파구',
    address: '서울특별시 송파구 가족로 6'
  },
  {
    id: 'tour-1', name: '대전어린이과학관', type: '놀이·체험', subtype: 'tour-experience',
    source: 'visit-korea-tour-api', status: 'active', region: '대전', subRegion: '유성구',
    address: '대전광역시 유성구 과학로 7', lat: 36.37, lng: 127.37
  }
];

const places = {
  seoul: [
    {
      id: 'museum', name: '국립중앙박물관 어린이박물관', category: '박물관',
      notes: '어린이 체험 전시와 무료 관람', babyRoom: '있음',
      address: '서울특별시 용산구 서빙고로 137', lat: 37.52, lng: 126.98
    },
    {
      id: 'park', name: '서울어린이대공원', category: '공원/동물원',
      notes: '동물원과 식물원', babyRoom: '있음',
      address: '서울특별시 광진구 능동로 216', lat: 37.54, lng: 127.08
    },
    {
      id: 'play', name: '서울상상나라', category: '체험관',
      notes: '영유아 전용 놀이 공간', babyRoom: '있음',
      address: '서울특별시 광진구 능동로 216', lat: 37.55, lng: 127.08
    }
  ]
};

const resolve = (message, overrides = {}) => resolveHomepageGuide({
  message,
  pendingIntent: null,
  childInfo: { months: 36 },
  facilities,
  places,
  welfareItems: [],
  completedVaccines: {},
  growthRecords: [],
  tempRecords: [],
  feedingRecords: [],
  ...overrides
});

test('소아청소년과 검색은 HIRA pediatrics만 반환하고 광역지역을 하위지역으로 중복 인식하지 않는다', async () => {
  const result = await resolve('서울 소아청소년과 찾아줘');

  assert.equal(result.mode, 'homepage');
  assert.equal(result.items.length, 3);
  assert.ok(result.items.every((item) => item.meta.includes('건강보험심사평가원')));
  assert.ok(result.items.every((item) => !/가족센터|상담복지/.test(item.title)));
  assert.doesNotMatch(result.answer, /서울\s+서울시/);
});

test('병원 검색은 상담센터와 가족센터를 제외한다', async () => {
  const result = await resolve('서울 병원 찾아줘');

  assert.ok(result.items.length >= 2);
  assert.ok(result.items.every((item) => !/가족센터|상담복지/.test(item.title)));
});

test('수유실과 유아휴게소는 같은 수유시설 데이터로 연결된다', async () => {
  const nursingRoom = await resolve('서울 수유실 찾아줘');
  const babyRoom = await resolve('서울 유아휴게소 찾아줘');

  assert.deepEqual(nursingRoom.items.map((item) => item.title), babyRoom.items.map((item) => item.title));
  assert.ok(nursingRoom.items.every((item) => item.meta.includes('수유시설 정보')));
});

test('가족센터 검색은 가족센터를 정확히 반환한다', async () => {
  const result = await resolve('서울 가족센터 찾아줘');

  assert.equal(result.items.length, 2);
  assert.ok(result.items.every((item) => item.title.endsWith('가족센터')));
});

test('붙여 쓴 가볼만한곳 질문도 3세 맞춤 홈페이지 결과로 처리한다', async () => {
  const result = await resolve('3세 아동과 서울에 가볼만한곳 추천해줘');

  assert.equal(result.mode, 'homepage');
  assert.equal(result.items.length, 3);
  assert.match(result.answer, /3세 아이와/);
  assert.doesNotMatch(result.answer, /제공된 자료|정보가 없습니다/);
  assert.ok(result.items.some((item) => item.title.includes('어린이박물관')));
});

test('정적 장소가 없는 지역은 TourAPI 놀이·체험 시설로 보완한다', async () => {
  const result = await resolve('대전에서 아이와 갈만한 체험시설 추천해줘');

  assert.equal(result.items.length, 1);
  assert.match(result.items[0].title, /대전어린이과학관/);
  assert.equal(result.items[0].action.tab, 'facilities');
});

test('지역 없는 시설 질문은 위치 또는 지역을 요청한다', async () => {
  const result = await resolve('근처 소아과를 찾아줘');

  assert.match(result.answer, /어느 지역/);
  assert.equal(result.pendingIntent, 'facilities:pediatrics');
});

test('현재 위치를 받은 시설 후속 검색은 지역을 다시 묻지 않고 거리순으로 답한다', async () => {
  const result = await resolve('현재 위치에서 찾아줘', {
    pendingIntent: 'facilities:pediatrics',
    location: { lat: 37.501, lng: 127.031 }
  });

  assert.doesNotMatch(result.answer, /어느 지역/);
  assert.equal(result.items[0].title, '튼튼의원');
  assert.equal(result.actions[0].region, '전체');
});

test('가볼만한곳 질문은 Gemini를 호출하지 않고 홈페이지 결과와 남은 할당량을 유지한다', async () => {
  const result = await askAiGuide({
    message: '3세 아동과 서울에 가볼만한곳 추천해줘',
    childInfo: { months: 36 },
    facilities,
    places
  });

  assert.equal(result.mode, 'homepage');
  assert.equal(result.remainingAiQuestions, 3);
  assert.equal(result.items.length, 3);
});

test('Gemini 보조 컨텍스트도 시설 의도별 실제 데이터만 사용한다', () => {
  const pediatricsContext = buildGuideContext('서울 소아청소년과 알려줘', facilities, places);
  const placeContext = buildGuideContext('3세 아동과 서울에 가볼만한곳 추천해줘', facilities, places);

  assert.ok(pediatricsContext.some((item) => item.title === '튼튼의원'));
  assert.ok(pediatricsContext.every((item) => item.title !== '강남구가족센터'));
  assert.ok(pediatricsContext.every((item) => item.title !== '경기아이의원'));
  assert.ok(placeContext.some((item) => item.title.includes('어린이박물관')));

  const feedingContext = buildGuideContext('3개월 아기 수유량을 알려줘', facilities, places);
  assert.ok(feedingContext.every((item) => !/어린이박물관|서울상상나라|서울어린이대공원/.test(item.title)));
});

test('TourAPI 숙박·쇼핑·음식점은 놀이·체험 데이터에서 제외한다', () => {
  for (const contentTypeId of ['32', 38, '39']) {
    assert.equal(isFamilyPlayTourRecord({
      title: '가족과 가는 공원 앞 시설',
      contentTypeId
    }), false);
  }
  assert.equal(isFamilyPlayTourRecord({
    title: '어린이과학체험관',
    contenttypeid: '12'
  }), true);
});

test('깨워도 반응이 없거나 축 늘어진 응급 신호는 시설 검색보다 안전 응답을 우선한다', async () => {
  const unresponsive = await resolve('아이를 깨워도 반응이 없어요. 서울 병원 찾아줘');
  const lethargic = await resolve('아이가 축 늘어졌어요. 서울 병원 찾아줘');

  assert.equal(unresponsive, null);
  assert.equal(lethargic, null);
});

test('의료기관 수유실처럼 보유 여부를 확인할 수 없는 복합 조건은 한계를 명확히 알린다', async () => {
  const result = await resolve('서울 수유실 있는 소아청소년과 병원 찾아줘');

  assert.ok(result.items.every((item) => item.meta.includes('건강보험심사평가원')));
  assert.match(result.answer, /수유실 보유 여부.*확인할 수는 없어요/);
});
