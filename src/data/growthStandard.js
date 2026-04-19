// 질병관리청 2017 소아청소년 성장도표 데이터 (0~36개월 영유아)
// 백분위 계산의 정확도를 높이기 위해 개월별 [키 평균, 키 표준편차, 몸무게 평균, 몸무게 표준편차]를 저장합니다.

const growthData = {
  male: [
    [49.9, 1.9, 3.3, 0.4], [54.7, 2.0, 4.5, 0.5], [58.4, 2.1, 5.6, 0.6], [61.4, 2.2, 6.4, 0.7], [63.9, 2.3, 7.0, 0.7], [65.9, 2.3, 7.5, 0.8],
    [67.6, 2.4, 7.9, 0.8], [69.2, 2.4, 8.3, 0.9], [70.6, 2.5, 8.6, 0.9], [72.0, 2.5, 8.9, 0.9], [73.3, 2.6, 9.2, 0.9], [74.5, 2.6, 9.4, 1.0],
    [75.7, 2.7, 9.6, 1.0], [76.9, 2.7, 9.9, 1.0], [78.0, 2.8, 10.1, 1.0], [79.1, 2.8, 10.3, 1.1], [80.2, 2.9, 10.5, 1.1], [81.2, 2.9, 10.7, 1.1],
    [82.3, 3.0, 10.9, 1.1], [83.2, 3.0, 11.1, 1.2], [84.2, 3.1, 11.3, 1.2], [85.1, 3.1, 11.5, 1.2], [86.0, 3.2, 11.8, 1.2], [86.9, 3.2, 12.0, 1.3],
    [87.8, 3.3, 12.2, 1.3], [88.5, 3.3, 12.4, 1.3], [89.2, 3.4, 12.5, 1.3], [89.9, 3.4, 12.7, 1.4], [90.6, 3.4, 12.9, 1.4], [91.2, 3.5, 13.1, 1.4],
    [91.9, 3.5, 13.3, 1.4], [92.5, 3.6, 13.5, 1.5], [93.1, 3.6, 13.7, 1.5], [93.8, 3.7, 13.8, 1.5], [94.4, 3.7, 14.0, 1.5], [95.0, 3.7, 14.2, 1.6], [95.6, 3.8, 14.3, 1.6]
  ],
  female: [
    [49.1, 1.8, 3.2, 0.4], [53.7, 1.9, 4.2, 0.5], [57.1, 2.0, 5.1, 0.6], [59.8, 2.1, 5.8, 0.6], [62.1, 2.2, 6.4, 0.7], [64.0, 2.2, 6.9, 0.7],
    [65.7, 2.3, 7.3, 0.8], [67.3, 2.4, 7.6, 0.8], [68.7, 2.4, 7.9, 0.8], [70.1, 2.5, 8.2, 0.9], [71.5, 2.5, 8.5, 0.9], [72.8, 2.6, 8.7, 0.9],
    [74.0, 2.6, 8.9, 0.9], [75.2, 2.7, 9.2, 1.0], [76.4, 2.7, 9.4, 1.0], [77.5, 2.8, 9.6, 1.0], [78.6, 2.8, 9.8, 1.0], [79.7, 2.9, 10.0, 1.1],
    [80.7, 2.9, 10.2, 1.1], [81.7, 3.0, 10.4, 1.1], [82.7, 3.0, 10.6, 1.1], [83.7, 3.1, 10.9, 1.2], [84.6, 3.1, 11.1, 1.2], [85.5, 3.2, 11.3, 1.2],
    [86.4, 3.2, 11.5, 1.2], [87.1, 3.3, 11.7, 1.3], [87.8, 3.3, 11.9, 1.3], [88.5, 3.3, 12.1, 1.3], [89.2, 3.4, 12.3, 1.3], [89.9, 3.4, 12.5, 1.4],
    [90.5, 3.5, 12.7, 1.4], [91.1, 3.5, 12.9, 1.4], [91.8, 3.6, 13.1, 1.4], [92.4, 3.6, 13.3, 1.4], [93.0, 3.6, 13.5, 1.5], [93.6, 3.7, 13.7, 1.5], [94.2, 3.7, 13.9, 1.5]
  ]
};

// Error function approximation (A&S formula)
function erf(x) {
  const sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

// 누적 정규분포 함수 (정규분포에서 주어진 x값의 하위 백분율 계산)
function cdf(x, mean, std) {
  return (1 - erf((mean - x ) / (Math.sqrt(2) * std))) / 2;
}

/**
 * 아이의 정보(개월, 성별, 키, 몸무게)를 받아 성장 백분위를 리턴합니다.
 */
export function getGrowthPercentile(months, gender, height, weight) {
  // 성별이 '선택안함'일 경우 기본으로 남아 기준을 사용하거나 평균을 적용할 수 있습니다.
  const g = gender === 'female' ? 'female' : 'male';
  let m = Math.max(0, parseInt(months) || 0);
  
  let baseH, stdH, baseW, stdW;

  if (m > 36) {
    // 36개월 초과 시 간단히 추세 연장 방식을 사용 (기존 로직 보강)
    const over = m - 36;
    const last = growthData[g][36];
    baseH = last[0] + over * 0.6;
    stdH = last[1] + over * 0.05;
    baseW = last[2] + over * 0.15;
    stdW = last[3] + over * 0.02;
  } else {
    [baseH, stdH, baseW, stdW] = growthData[g][m];
  }

  // 키 백분위 산출 (0~1)
  const heightPercentile = cdf(height, baseH, stdH);
  // 몸무게 백분위 산출 (0~1)
  const weightPercentile = cdf(weight, baseW, stdW);

  // 최종 성장 백분위는 키와 몸무게의 표준화된 백분율 평균 채택
  const avgPercentile = (heightPercentile + weightPercentile) / 2;
  
  // 1에서 99 사이의 정수로 떨어지도록 조절
  let p = Math.round(avgPercentile * 100);
  return Math.min(Math.max(p, 1), 99);
}

/**
 * Recharts 그래프 렌더링을 위한 성장 곡선 배열을 생성합니다.
 * targetType: 'height' | 'weight' (default: 'height')
 */
export function getGrowthChartData(gender, targetType = 'height') {
  const g = gender === 'female' ? 'female' : 'male';
  const data = growthData[g];
  const zScore3 = 1.88; // 대략 하위 3%의 z-score 절대값 (정규분포 기준)

  return data.map((point, index) => {
    let base, std;
    if (targetType === 'weight') {
      base = point[2];
      std = point[3];
    } else {
      base = point[0];
      std = point[1];
    }

    return {
      month: index,
      p3: Number((base - zScore3 * std).toFixed(1)),
      p50: Number(base.toFixed(1)),
      p97: Number((base + zScore3 * std).toFixed(1)),
    };
  });
}
