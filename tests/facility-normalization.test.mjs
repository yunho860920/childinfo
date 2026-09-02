import test from 'node:test';
import assert from 'node:assert/strict';
import { FACILITY_CATEGORIES } from '../src/constants/uiConstants.js';
import { normalizeSubRegionName } from '../src/utils/regionUtils.js';
import { parseFacilityAddress } from '../src/domain/facilities/facilitySchema.js';
import { isDeferredDaycareFacility } from '../src/domain/facilities/facilityCategory.js';

test('광역시가 붙은 하위지역명은 구·군 선택값으로 정규화한다', () => {
  assert.equal(normalizeSubRegionName('대구달서구', '대구'), '달서구');
  assert.equal(normalizeSubRegionName('부산광역시 해운대구', '부산'), '해운대구');
  assert.equal(normalizeSubRegionName('인천연수구', '인천'), '연수구');
});

test('일반구가 붙은 도 지역명은 시설 UI의 상위 시 선택값으로 정규화한다', () => {
  assert.equal(normalizeSubRegionName('수원팔달구', '경기'), '수원시');
  assert.equal(normalizeSubRegionName('화성시 동탄구', '경기'), '화성시');
  assert.equal(normalizeSubRegionName('창원마산합포구', '경남'), '창원시');
  assert.equal(normalizeSubRegionName('청주흥덕구', '충북'), '청주시');
});

test('이미 정상인 하위지역명은 반복 정규화해도 훼손하지 않는다', () => {
  for (const [subRegion, region] of [['부산진구', '부산'], ['제주시', '제주']]) {
    assert.equal(normalizeSubRegionName(subRegion, region), subRegion);
    assert.equal(
      normalizeSubRegionName(normalizeSubRegionName(subRegion, region), region),
      subRegion
    );
  }
  assert.equal(normalizeSubRegionName('부산광역시 부산진구', '부산'), '부산진구');
  assert.equal(normalizeSubRegionName('제주특별자치도 제주시', '제주'), '제주시');
});

test('시설 스키마도 공용 하위지역 정규화를 사용한다', () => {
  const parsed = parseFacilityAddress('경기도 수원시 팔달구 고화로 14', {
    region: '경기',
    subRegion: '수원팔달구'
  });

  assert.equal(parsed.subRegion, '수원시');
});

test('어린이집은 사용자 선택용 시설 카테고리에서 제외한다', () => {
  assert.equal(FACILITY_CATEGORIES.includes('어린이집'), false);
});

test('명칭에 어린이집이 들어간 다른 시설은 유지하고 명시적 보육 유형은 제외한다', () => {
  const facilities = [
    { id: 'park', type: '놀이·체험', name: '푸른어린이집 옆 공원', region: '서울', subRegion: '강남구', dong: '전체' },
    { id: 'family', type: '가족센터', name: '어린이집 공동육아나눔터', region: '서울', subRegion: '강남구', dong: '전체' },
    { id: 'childcare', type: '보육시설', name: '푸른마을', region: '서울', subRegion: '강남구', dong: '전체' },
    { id: 'kindergarten', type: '유치원', name: '푸른유아원', region: '서울', subRegion: '강남구', dong: '전체' }
  ];

  assert.deepEqual(facilities.filter((item) => !isDeferredDaycareFacility(item)).map((item) => item.id), ['park', 'family']);
});
