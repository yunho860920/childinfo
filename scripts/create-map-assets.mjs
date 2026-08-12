import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GEOJSON_PATH = path.join(ROOT, 'scratch', 'mapdata', 'skorea-municipalities-2018-geo.json');
const OUT_DIR = path.join(ROOT, 'public');
const WIDTH = 1024;
const HEIGHT = 768;
const PAD = 64;

const palette = [
  '#FFECEF', // 딸기우유 핑크
  '#FFF2CC', // 바나나우유 옐로우
  '#E2F0D9', // 소프트 메론 민트
  '#D9EAD3', // 연한 새싹 그린
  '#E6F0FA', // 코튼 솜사탕 블루
  '#F3E8FF', // 부드러운 라벤더 퍼플
  '#FFF0E0'  // 달콤 피치 오렌지
];
const compactPrefixNames = ['수원시', '성남시', '안양시', '안산시', '고양시', '용인시', '청주시', '천안시', '전주시', '포항시', '창원시'];

const mapSpecs = {
  seoul: {
    title: '서울특별시',
    subtitle: '아기랑 놀러가요',
    out: 'seoul_map.svg',
    filter: (feature) => feature.properties.code.startsWith('11'),
    labelOverrides: {
      중구: [0, 6],
      종로구: [0, -6],
      성동구: [4, 3],
      동대문구: [8, -3],
      영등포구: [-8, 0],
      동작구: [0, 8],
      서대문구: [-5, 0],
      용산구: [0, 9],
    },
    waterways: [
      'M 30 438 C 170 403, 285 411, 405 449 S 648 506, 812 430 S 956 340, 1010 360',
    ],
    roads: [
      'M 150 210 C 278 285, 410 316, 540 330 S 800 352, 928 430',
      'M 245 660 C 320 530, 395 425, 488 320 S 660 160, 800 84',
      'M 96 548 C 250 500, 406 502, 560 558 S 792 644, 948 606',
      'M 384 120 C 402 260, 440 390, 500 506 S 642 672, 706 720',
      'M 52 316 C 198 350, 332 366, 470 356 S 740 280, 976 300',
    ],
  },
  busan: {
    title: '부산광역시',
    subtitle: '아기랑 놀러가요',
    out: 'busan_map.svg',
    filter: (feature) => feature.properties.code.startsWith('21'),
    labelOverrides: {
      중구: [0, 8],
      서구: [-10, 10],
      동구: [8, -4],
      영도구: [6, 12],
      부산진구: [0, -6],
      동래구: [8, -8],
      연제구: [2, 8],
      수영구: [12, 8],
      남구: [18, 16],
      해운대구: [28, 0],
      사상구: [-14, 12],
      사하구: [-16, 14],
      강서구: [-16, -8],
      기장군: [4, -4],
    },
    waterways: [
      'M 20 168 C 120 230, 176 330, 190 452 S 180 642, 132 748',
      'M 120 632 C 255 590, 390 608, 525 642 S 782 718, 1012 670',
      'M 692 396 C 792 366, 894 360, 1012 402',
    ],
    roads: [
      'M 114 520 C 256 456, 390 430, 525 405 S 778 330, 940 210',
      'M 210 250 C 350 310, 470 346, 602 388 S 784 502, 966 560',
      'M 355 118 C 392 260, 426 386, 486 506 S 612 656, 700 724',
      'M 72 410 C 232 390, 402 392, 560 420 S 806 500, 986 478',
    ],
  },
  daegu: {
    title: '대구광역시',
    subtitle: '아기랑 놀러가요',
    out: 'daegu_map.svg',
    filter: (feature) => feature.properties.code.startsWith('22') || feature.properties.name === '군위군',
    labelOverrides: {
      중구: [12, -10],
      서구: [-34, -9],
      남구: [16, 22],
      북구: [-52, -22],
      동구: [64, -22],
      수성구: [56, 18],
      달서구: [-44, 20],
      달성군: [-38, 38],
      군위군: [0, -4],
    },
    waterways: [
      'M 48 520 C 176 530, 300 502, 420 480 S 620 420, 760 438 S 930 500, 1010 470',
      'M 388 244 C 430 330, 436 420, 402 515 S 340 638, 330 730',
    ],
    roads: [
      'M 150 610 C 250 520, 350 460, 505 425 S 774 370, 930 280',
      'M 230 300 C 380 330, 510 360, 630 430 S 805 578, 966 620',
      'M 512 160 C 500 282, 510 390, 552 502 S 622 654, 654 720',
      'M 92 414 C 240 396, 388 402, 552 448 S 810 520, 978 500',
    ],
  },
  incheon: {
    title: '인천광역시',
    subtitle: '아기랑 놀러가요',
    out: 'incheon_map.svg',
    filter: (feature) => feature.properties.code.startsWith('23'),
    boundsOverride: {
      minLon: 126.08,
      maxLon: 126.83,
      minLat: 37.28,
      maxLat: 37.86,
    },
    displayNames: {
      남구: '미추홀구',
    },
    labelOverrides: {
      강화군: [0, -10],
      옹진군: [-42, 18],
      중구: [-22, 16],
      동구: [20, -10],
      미추홀구: [-34, 18],
      연수구: [-28, 32],
      남동구: [34, 28],
      부평구: [32, -20],
      계양구: [2, -26],
      서구: [-22, -10],
    },
    waterways: [
      'M 34 250 C 160 300, 250 378, 356 466 S 576 620, 754 602 S 930 492, 1018 522',
      'M 32 642 C 158 610, 282 618, 390 660 S 602 724, 826 700',
      'M 624 60 C 650 190, 650 325, 628 460 S 570 650, 572 752',
    ],
    roads: [
      'M 122 544 C 260 490, 410 460, 560 428 S 806 365, 962 252',
      'M 294 280 C 435 332, 560 380, 696 470 S 848 626, 964 686',
      'M 492 150 C 505 288, 525 420, 590 548 S 706 672, 780 728',
      'M 70 418 C 224 404, 390 410, 560 440 S 828 526, 1000 500',
    ],
  },
  gwangju: {
    title: '광주광역시',
    subtitle: '아기랑 놀러가요',
    out: 'gwangju_map.svg',
    filter: (feature) => feature.properties.code.startsWith('24'),
    waterways: ['M 90 514 C 220 490, 330 520, 466 486 S 735 340, 1000 400'],
    roads: ['M 144 402 C 292 382, 440 394, 574 430 S 818 524, 960 490', 'M 372 150 C 405 280, 450 410, 520 545 S 650 690, 720 730'],
  },
  daejeon: {
    title: '대전광역시',
    subtitle: '아기랑 놀러가요',
    out: 'daejeon_map.svg',
    filter: (feature) => feature.properties.code.startsWith('25'),
    waterways: ['M 42 512 C 178 462, 310 470, 470 514 S 760 620, 1010 540'],
    roads: ['M 96 410 C 252 390, 420 406, 570 452 S 820 560, 980 520', 'M 500 118 C 490 278, 520 430, 590 560 S 718 695, 820 726'],
  },
  ulsan: {
    title: '울산광역시',
    subtitle: '아기랑 놀러가요',
    out: 'ulsan_map.svg',
    filter: (feature) => feature.properties.code.startsWith('26'),
    waterways: ['M 80 500 C 226 482, 350 504, 488 468 S 760 332, 1010 392'],
    roads: ['M 130 420 C 290 384, 442 382, 596 422 S 810 510, 960 490', 'M 448 120 C 470 260, 502 400, 590 536 S 716 672, 844 720'],
  },
  sejong: {
    title: '세종특별자치시',
    subtitle: '아기랑 놀러가요',
    out: 'sejong_map.svg',
    filter: (feature) => feature.properties.code.startsWith('29'),
    displayNames: { 세종시: '세종시' },
    waterways: ['M 80 490 C 220 430, 335 440, 468 500 S 760 655, 1000 590'],
    roads: ['M 148 360 C 300 382, 456 410, 608 470 S 822 590, 960 560', 'M 438 130 C 420 275, 450 414, 548 558 S 684 686, 790 728'],
  },
  gyeonggi: {
    title: '경기도',
    subtitle: '아기랑 놀러가요',
    out: 'gyeonggi_map.svg',
    filter: (feature) => feature.properties.code.startsWith('31'),
    waterways: ['M 20 480 C 160 440, 286 452, 438 506 S 722 612, 1010 530'],
    roads: ['M 76 390 C 230 365, 388 382, 560 440 S 810 560, 970 520', 'M 430 90 C 450 250, 486 392, 566 540 S 704 690, 824 735', 'M 120 610 C 280 540, 430 510, 592 482 S 820 380, 990 290'],
  },
  gangwon: {
    title: '강원특별자치도',
    subtitle: '아기랑 놀러가요',
    out: 'gangwon_map.svg',
    filter: (feature) => feature.properties.code.startsWith('32'),
    waterways: ['M 60 492 C 220 456, 370 486, 530 540 S 830 650, 1010 590'],
    roads: ['M 90 420 C 260 375, 420 386, 590 438 S 820 520, 970 500', 'M 475 80 C 498 250, 550 405, 650 545 S 802 684, 930 728'],
  },
  chungbuk: {
    title: '충청북도',
    subtitle: '아기랑 놀러가요',
    out: 'chungbuk_map.svg',
    filter: (feature) => feature.properties.code.startsWith('33'),
    waterways: ['M 68 512 C 210 462, 350 482, 492 532 S 752 650, 1000 600'],
    roads: ['M 112 408 C 272 382, 430 400, 580 455 S 820 560, 962 528', 'M 430 100 C 454 260, 502 405, 590 548 S 720 690, 842 730'],
  },
  chungnam: {
    title: '충청남도',
    subtitle: '아기랑 놀러가요',
    out: 'chungnam_map.svg',
    filter: (feature) => feature.properties.code.startsWith('34'),
    waterways: ['M 38 520 C 190 482, 330 500, 486 555 S 760 662, 1010 610'],
    roads: ['M 100 410 C 250 384, 410 400, 570 452 S 828 570, 970 536', 'M 410 110 C 432 260, 486 405, 570 550 S 700 690, 820 730'],
  },
  jeonbuk: {
    title: '전북특별자치도',
    subtitle: '아기랑 놀러가요',
    out: 'jeonbuk_map.svg',
    filter: (feature) => feature.properties.code.startsWith('35'),
    waterways: ['M 50 530 C 205 500, 350 512, 500 562 S 760 660, 1010 620'],
    roads: ['M 90 420 C 250 396, 410 410, 570 466 S 830 580, 970 545', 'M 440 110 C 455 265, 500 410, 586 548 S 722 690, 836 730'],
  },
  jeonnam: {
    title: '전라남도',
    subtitle: '아기랑 놀러가요',
    out: 'jeonnam_map.svg',
    filter: (feature) => feature.properties.code.startsWith('36'),
    waterways: ['M 30 568 C 180 530, 340 540, 500 592 S 790 700, 1010 642'],
    roads: ['M 86 430 C 250 405, 420 420, 586 480 S 830 590, 970 560', 'M 450 120 C 462 280, 510 430, 604 570 S 742 705, 860 734'],
  },
  gyeongbuk: {
    title: '경상북도',
    subtitle: '아기랑 놀러가요',
    out: 'gyeongbuk_map.svg',
    filter: (feature) => feature.properties.code.startsWith('37'),
    waterways: ['M 70 520 C 220 482, 360 500, 510 550 S 780 660, 1010 600'],
    roads: ['M 90 410 C 260 386, 430 400, 600 454 S 850 562, 980 528', 'M 465 80 C 488 250, 540 405, 636 552 S 780 698, 920 738'],
  },
  gyeongnam: {
    title: '경상남도',
    subtitle: '아기랑 놀러가요',
    out: 'gyeongnam_map.svg',
    filter: (feature) => feature.properties.code.startsWith('38'),
    waterways: ['M 42 540 C 200 500, 350 510, 510 560 S 790 682, 1010 630'],
    roads: ['M 88 420 C 250 390, 420 405, 590 462 S 840 585, 978 548', 'M 435 110 C 452 270, 504 420, 596 562 S 725 695, 846 732'],
  },
  jeju: {
    title: '제주특별자치도',
    subtitle: '아기랑 놀러가요',
    out: 'jeju_map.svg',
    filter: (feature) => feature.properties.code.startsWith('39'),
    waterways: ['M 70 590 C 220 550, 390 558, 548 602 S 812 688, 1000 640'],
    roads: ['M 140 460 C 290 420, 455 420, 610 460 S 825 550, 950 520', 'M 260 610 C 380 535, 520 495, 700 475 S 858 438, 960 370'],
  },
};

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function forEachCoordinate(geometry, cb) {
  const visit = (coords) => {
    if (typeof coords?.[0] === 'number') {
      cb(coords[0], coords[1]);
      return;
    }
    coords.forEach(visit);
  };
  visit(geometry.coordinates);
}

function boundsOf(features) {
  const bounds = { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity };
  features.forEach((feature) => {
    forEachCoordinate(feature.geometry, (lon, lat) => {
      bounds.minLon = Math.min(bounds.minLon, lon);
      bounds.maxLon = Math.max(bounds.maxLon, lon);
      bounds.minLat = Math.min(bounds.minLat, lat);
      bounds.maxLat = Math.max(bounds.maxLat, lat);
    });
  });
  return bounds;
}

function makeProjector(bounds) {
  const lonSpan = bounds.maxLon - bounds.minLon;
  const latSpan = bounds.maxLat - bounds.minLat;
  const scale = Math.min((WIDTH - PAD * 2) / lonSpan, (HEIGHT - PAD * 2) / latSpan);
  const usedW = lonSpan * scale;
  const usedH = latSpan * scale;
  const offsetX = (WIDTH - usedW) / 2;
  const offsetY = (HEIGHT - usedH) / 2;

  return {
    bounds,
    scale,
    offsetX,
    offsetY,
    project(lon, lat) {
      return [
        offsetX + (lon - bounds.minLon) * scale,
        offsetY + (bounds.maxLat - lat) * scale,
      ];
    },
  };
}

function polygonPath(ring, project) {
  return ring
    .map(([lon, lat], index) => {
      const [x, y] = project(lon, lat);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ') + ' Z';
}

function geometryPath(geometry, project) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => polygonPath(ring, project)).join(' ');
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flatMap((polygon) => polygon.map((ring) => polygonPath(ring, project))).join(' ');
  }
  return '';
}

function centroid(feature) {
  let sx = 0;
  let sy = 0;
  let count = 0;
  forEachCoordinate(feature.geometry, (lon, lat) => {
    sx += lon;
    sy += lat;
    count += 1;
  });
  return [sx / count, sy / count];
}

function displayNameFor(spec, rawName) {
  if (spec.displayNames?.[rawName]) return spec.displayNames[rawName];
  for (const prefix of compactPrefixNames) {
    if (rawName.startsWith(prefix) && rawName.endsWith('구')) {
      return rawName.replace(prefix, `${prefix.replace('시', '')} `);
    }
  }
  return rawName;
}

function renderMap(name, spec, allFeatures) {
  const features = allFeatures.filter(spec.filter).sort((a, b) => a.properties.code.localeCompare(b.properties.code));
  const bounds = spec.boundsOverride || boundsOf(features);
  const projector = makeProjector(bounds);
  const targetCodes = new Set(features.map(f => f.properties.code));

  // bounds 기준 사방 0.5도 마진 이내의 인접 영토 필터링
  const margin = 0.5;
  const adjacentDistricts = allFeatures
    .filter(f => !targetCodes.has(f.properties.code))
    .filter(f => {
      let inRange = false;
      forEachCoordinate(f.geometry, (lon, lat) => {
        if (
          lon >= bounds.minLon - margin &&
          lon <= bounds.maxLon + margin &&
          lat >= bounds.minLat - margin &&
          lat <= bounds.maxLat + margin
        ) {
          inRange = true;
        }
      });
      return inRange;
    })
    .map(feature => {
      return `<path class="district-bg" d="${geometryPath(feature.geometry, projector.project)}" />`;
    });

  const districts = features.map((feature, index) => {
    const fill = palette[index % palette.length];
    return `<path class="district" d="${geometryPath(feature.geometry, projector.project)}" fill="${fill}" />`;
  });

  const labels = features.map((feature) => {
    const rawName = feature.properties.name;
    const displayName = displayNameFor(spec, rawName);
    const [lon, lat] = centroid(feature);
    const [x, y] = projector.project(lon, lat);
    const [dx, dy] = spec.labelOverrides?.[displayName] || spec.labelOverrides?.[rawName] || [0, 0];
    const fontSize = features.length > 30 ? 12 : features.length > 20 ? 14 : name === 'seoul' ? 16 : name === 'incheon' ? 17 : rawName === '군위군' ? 18 : 19;
    return `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" class="label" font-size="${fontSize}">${escapeXml(displayName)}</text>`;
  });

  const waterways = '';
  const roadEdges = '';
  const roads = '';

  // 맵별 아기자기한 이모지 일러스트 데코레이션 삽입
  let decos = '';
  if (name === 'seoul') {
    decos = `<text x="350" y="470" opacity="0.3" font-size="28" font-family="sans-serif">🦆</text>`;
  } else if (name === 'busan') {
    decos = `<text x="750" y="550" opacity="0.35" font-size="38" font-family="sans-serif">🐳</text>`;
  } else if (name === 'incheon') {
    decos = `<text x="250" y="580" opacity="0.3" font-size="34" font-family="sans-serif">⛵</text>
             <text x="320" y="520" opacity="0.25" font-size="22" font-family="sans-serif">🐦</text>`;
  } else if (name === 'gyeonggi') {
    decos = `<text x="180" y="520" opacity="0.25" font-size="32" font-family="sans-serif">☁️</text>
             <text x="820" y="240" opacity="0.25" font-size="28" font-family="sans-serif">🌳</text>`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(spec.title)} 아기랑 놀러가요 지도">
  <defs>
    <filter id="paper" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="${name === 'seoul' ? 11 : 27}" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.075"/>
      </feComponentTransfer>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#7b5f43" flood-opacity="0.10"/>
    </filter>
    <style>
      .background { fill: #D8ECF0; }
      .map-wrap { filter: url(#softShadow); }
      .district-bg { fill: #f3ede0; stroke: #cbc0b5; stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; opacity: 0.85; }
      .district { stroke: #8d745d; stroke-width: 2.8; stroke-linejoin: round; stroke-linecap: round; }
      .label { font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; font-weight: 800; fill: #5d5148; text-anchor: middle; dominant-baseline: middle; paint-order: stroke; stroke: #fff8ed; stroke-width: 5; stroke-linejoin: round; }
      .title { font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; font-weight: 900; fill: #5d5148; letter-spacing: 0; }
      .subtitle { font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; font-weight: 800; fill: #8c7a6a; letter-spacing: 0; }
      
      /* 모바일 미디어 쿼리: 지도가 모바일 화면에 축소되어 들어갈 때 글자 겹침을 방지하고 가독성을 보장 */
      @media (max-width: 640px) {
        .label { font-size: 11px !important; stroke-width: 3.5 !important; }
        .title { font-size: 26px !important; }
        .subtitle { font-size: 13px !important; }
      }
    </style>
  </defs>
  <rect class="background" width="${WIDTH}" height="${HEIGHT}" />
  <g filter="url(#paper)">
    <text x="52" y="72" class="title" font-size="38">${escapeXml(spec.title)}</text>
    <text x="54" y="110" class="subtitle" font-size="18">${escapeXml(spec.subtitle)}</text>
    ${decos}
    <g class="map-wrap">
      ${adjacentDistricts.join('\n      ')}
      ${districts.join('\n      ')}
    </g>
    ${labels.join('\n    ')}
  </g>
</svg>
`;

  fs.writeFileSync(path.join(OUT_DIR, spec.out), svg, 'utf8');
  return {
    id: name,
    output: `public/${spec.out}`,
    districts: features.map((feature) => displayNameFor(spec, feature.properties.name)),
    projection: {
      width: WIDTH,
      height: HEIGHT,
      pad: PAD,
      bounds: projector.bounds,
      scale: projector.scale,
      offsetX: projector.offsetX,
      offsetY: projector.offsetY,
    },
  };
}

const geojson = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8'));
const metadata = Object.entries(mapSpecs).map(([name, spec]) => renderMap(name, spec, geojson.features));
fs.writeFileSync(path.join(ROOT, 'scratch', 'mapdata', 'generated-map-metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');
console.log(JSON.stringify(metadata, null, 2));
