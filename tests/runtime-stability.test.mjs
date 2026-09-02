import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithTimeout } from '../src/services/fetchWithTimeout.js';
import {
  calculateMonths,
  getHealthCategoryForMonths,
  getTimelineMonthForMonths,
  getWelfareStageForMonths,
} from '../src/utils/growthUtils.js';
import { getPaginationItems } from '../src/utils/paginationUtils.js';

test('월령은 생년월일과 기준일의 일자까지 반영해 계산한다', () => {
  assert.equal(calculateMonths('2024-01-31', new Date(2024, 1, 28, 12)), 0);
  assert.equal(calculateMonths('2024-01-31', new Date(2024, 2, 31, 12)), 2);
  assert.equal(calculateMonths('2023-10-01', new Date(2026, 7, 31, 12)), 34);
});

test('유효하지 않거나 미래인 생년월일은 안전하게 0개월로 처리한다', () => {
  assert.equal(calculateMonths('not-a-date', new Date(2026, 7, 31, 12)), 0);
  assert.equal(calculateMonths('2030-01-01', new Date(2026, 7, 31, 12)), 0);
});

test('월령에 따라 건강·가이드·복지 기본 단계를 일관되게 선택한다', () => {
  assert.equal(getHealthCategoryForMonths(84), '학령기 (만 7세~)');
  assert.equal(getTimelineMonthForMonths(84), 36);
  assert.equal(getWelfareStageForMonths(0), 2);
  assert.equal(getWelfareStageForMonths(2), 3);
  assert.equal(getWelfareStageForMonths(8), 4);
  assert.equal(getWelfareStageForMonths(24), 5);
  assert.equal(getWelfareStageForMonths(48), 6);
});

test('시설 페이지네이션은 수천 페이지에서도 현재 주변 버튼만 만든다', () => {
  const items = getPaginationItems(1500, 3131);
  assert.deepEqual(items, [1, 'start-ellipsis', 1499, 1500, 1501, 'end-ellipsis', 3131]);
  assert.ok(items.length <= 7);
  assert.deepEqual(getPaginationItems(1, 3), [1, 2, 3]);
});

test('시간 제한을 넘긴 fetch 요청은 구분 가능한 timeout 오류를 반환한다', async () => {
  const waitingFetch = (_input, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    }, { once: true });
  });

  await assert.rejects(
    fetchWithTimeout('/slow', {}, 5, waitingFetch),
    (error) => error?.name === 'TimeoutError' && error?.code === 'REQUEST_TIMEOUT'
  );
});
