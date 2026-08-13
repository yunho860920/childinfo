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
npm run facilities:import:childcare -- path/to/childcare.json
npm run facilities:import -- city-parks path/to/parks.json
```

공통 import source 값은 `tour-api`, `city-parks`, `community-child-centers`, `museums-art-museums`, `libraries`, `cultural-festivals`, `mental-health-centers`, `developmental-rehab`, `shared-childcare`, `family-counseling`, `youth-counseling-centers`, `hira-pediatrics`, `nursing-rooms`이다. 놀이·체험은 어린이·가족 관련 신호가 있는 행만, 병원은 소아청소년과 관련 행만 1차 선별한다.

어린이집 데이터는 어린이집정보공개포털에서 별도 개발계정과 인증키 승인이 필요하다. 승인 전에는 공식 포털에서 내려받은 JSON/XML을 import 명령으로 검증할 수 있다. 현재 V2 스냅샷은 기존 화면에 자동 연결되지 않는다.

공공데이터포털 기반 원천은 서버 전용 `PUBLIC_DATA_API_KEY`를 사용한다. 브라우저에 노출되는 `VITE_` 접두사 키를 새 수집기에 사용하지 않는다. `/api/facility-sources-v2?source=community-child-centers&pageNo=1&numOfRows=100`처럼 승인된 원천만 프록시하며 임의 URL 전달은 허용하지 않는다.

공공데이터포털의 키 없는 표준데이터 7종은 `facilities:sync:keyless`로, 최신 CSV 파일데이터 3종(공동육아나눔터·가족상담 우수기관·청소년상담복지센터)은 `facilities:sync:files`로 갱신한다. CSV 수집기는 UTF-8과 EUC-KR을 감지하며 기존 스냅샷은 `data/facilities-v2/rollback`에 로컬 보존한다.

승인키 기반 원천은 `facilities:sync:keyed -- nursing-rooms`, `facilities:sync:keyed -- hira-pediatrics`, `facilities:sync:keyed -- tour-api`처럼 원천을 명시해 갱신한다. 키는 각각 서버 전용 `NURSING_API_KEY`, `PUBLIC_DATA_API_KEY`에서만 읽는다.

2026-08-12 기준 수유정보 알리미는 3,046건 수집에 성공했다. 현재 공공데이터 키는 HIRA 병원정보서비스와 TourAPI 서비스 권한이 없어 두 원천 모두 403이며 각 활용신청 승인 후 다시 실행해야 한다. 어린이집정보공개포털도 별도 개발계정·인증키가 필요하다.
