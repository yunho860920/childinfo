# 전국 육아 인프라 데이터 V2

기존 `src/data/infrastructure` 데이터는 직접 덮어쓰지 않는다. 새 데이터는 `data/facilities-v2`에서 수집·검증한 후 카테고리 단위로 전환한다.

## 안전 규칙

- 마이그레이션 전 `backups/facility-legacy-YYYYMMDD.zip`을 만든다.
- 원본 파일은 수정하지 않고 원천별 스냅샷을 새로 생성한다.
- 폐업·휴업 시설은 삭제하지 않고 `inactive` 또는 `paused`로 보존한다.
- 모든 레코드는 `source`, `sourceId`, `collectedAt`, `sourceUrl`을 가진다.
- 17개 시도 커버리지, 중복, 주소, 좌표, 이전 대비 급감 검사를 통과하기 전 화면에 연결하지 않는다.

## 명령어

```bash
npm run facilities:audit
npm run guard:facilities
npm run facilities:sync:keyless
npm run facilities:sync:files
npm run facilities:sync:keyed -- nursing-rooms
npm run facilities:sync:keyed -- tour-api
npm run facilities:sync:keyed -- hira-pediatrics
npm run facilities:import:childcare -- path/to/childcare.json
npm run facilities:import -- city-parks path/to/parks.json
```

공통 import source 값은 `tour-api`, `city-parks`, `community-child-centers`, `museums-art-museums`, `libraries`, `cultural-festivals`, `mental-health-centers`, `developmental-rehab`, `shared-childcare`, `family-counseling`, `youth-counseling-centers`, `hira-pediatrics`, `nursing-rooms`이다. 놀이·체험은 어린이·가족 관련 신호가 있는 행만, 병원은 소아청소년과 관련 행만 1차 선별한다.

어린이집 데이터는 어린이집정보공개포털에서 별도 개발계정과 인증키 승인이 필요하다. 승인 전에는 공식 포털에서 내려받은 JSON/XML을 import 명령으로 검증할 수 있다. 검증을 통과한 활성 V2 레코드는 빌드 시 `public/data/facilities-v2.json`으로 생성되어 화면에 연결된다.

공공데이터포털 기반 원천은 서버 전용 `TOUR_API_KEY`, `HIRA_API_KEY`, `BW_API_KEY`를 원천별로 사용한다. 브라우저에 노출되는 `VITE_`나 `PUBLIC_` 접두사 키를 새 수집기에 사용하지 않는다. `/api/facility-sources-v2?source=community-child-centers&pageNo=1&numOfRows=100`처럼 승인된 원천만 프록시하며 임의 URL 전달은 허용하지 않는다.

공공데이터포털의 키 없는 표준데이터 7종은 `facilities:sync:keyless`로, 최신 CSV 파일데이터 3종(공동육아나눔터·가족상담 우수기관·청소년상담복지센터)은 `facilities:sync:files`로 갱신한다. CSV 수집기는 UTF-8과 EUC-KR을 감지하며 기존 스냅샷은 `data/facilities-v2/rollback`에 로컬 보존한다.

승인키 기반 원천은 `facilities:sync:keyed -- nursing-rooms`, `facilities:sync:keyed -- hira-pediatrics`, `facilities:sync:keyed -- tour-api`처럼 원천을 명시해 갱신한다. 키는 각각 서버 전용 `NURSING_API_KEY`, `HIRA_API_KEY`, `TOUR_API_KEY`에서 읽는다. 로컬 이전 설정과의 호환을 위해 수집 명령만 `PUBLIC_DATA_API_KEY`를 임시 대체값으로 허용한다.

2026-08-13 기준 수유정보 알리미 3,046건, TourAPI 어린이·가족·체험 장소 3,633건, HIRA 소아청소년과 15,401건 수집에 성공했다. TourAPI 원천 48,875건 중 관련 키워드·분류 및 주소 검증을 통과한 항목만 화면에 반영한다. HIRA는 `dgsbjtCd=11`로 조회하며 응답에 진료과목명이 없어 수집 시 소아청소년과 태그를 명시한다. 2026년 7월 출범한 `전남광주통합특별시` 주소는 기존 앱의 17개 지역 필터와 호환되도록 광주 5개 자치구와 전남 지역으로 나눠 표시한다. 어린이집정보공개포털은 별도 개발계정·인증키가 필요하다.
