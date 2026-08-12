# 지도 자산 제작 기준

## 대상

- `public/seoul_map.svg`
- `public/busan_map.svg`
- `public/daegu_map.svg`
- `public/incheon_map.svg`
- `public/gwangju_map.svg`
- `public/daejeon_map.svg`
- `public/ulsan_map.svg`
- `public/sejong_map.svg`
- `public/gyeonggi_map.svg`
- `public/gangwon_map.svg`
- `public/chungbuk_map.svg`
- `public/chungnam_map.svg`
- `public/jeonbuk_map.svg`
- `public/jeonnam_map.svg`
- `public/gyeongbuk_map.svg`
- `public/gyeongnam_map.svg`
- `public/jeju_map.svg`

앱의 가볼곳 탭 흐름, 장소 정보, GPS 방문 인증, 리스트 UI는 유지하고 지도 배경만 실제 행정구역 기준으로 교체한다.

## 행정구역 기준

서울특별시는 25개 자치구를 모두 포함한다.

- 강남구
- 강동구
- 강북구
- 강서구
- 관악구
- 광진구
- 구로구
- 금천구
- 노원구
- 도봉구
- 동대문구
- 동작구
- 마포구
- 서대문구
- 서초구
- 성동구
- 성북구
- 송파구
- 양천구
- 영등포구
- 용산구
- 은평구
- 종로구
- 중구
- 중랑구

대구광역시는 현재 9개 구·군을 포함한다.

- 중구
- 동구
- 서구
- 남구
- 북구
- 수성구
- 달서구
- 달성군
- 군위군

부산광역시는 15개 구와 1개 군을 포함한다.

- 중구
- 서구
- 동구
- 영도구
- 부산진구
- 동래구
- 남구
- 북구
- 해운대구
- 사하구
- 금정구
- 강서구
- 연제구
- 수영구
- 사상구
- 기장군

인천광역시는 2026년 5월 22일 현재 기준의 2개 군과 8개 구를 포함한다.

- 강화군
- 옹진군
- 중구
- 동구
- 미추홀구
- 연수구
- 남동구
- 부평구
- 계양구
- 서구

추가 사전 제작 지역은 행정경계 GeoJSON의 시군구 단위를 기준으로 포함한다.

- 광주광역시: 5개 구
- 대전광역시: 5개 구
- 울산광역시: 4개 구, 1개 군
- 세종특별자치시: 1개 특별자치시 단일 경계
- 경기도: 31개 시·군의 시군구 경계. 수원·성남·안양·안산·고양·용인은 구 단위로 표시
- 강원특별자치도: 18개 시·군
- 충청북도: 11개 시·군의 시군구 경계. 청주시는 구 단위로 표시
- 충청남도: 15개 시·군의 시군구 경계. 천안시는 구 단위로 표시
- 전북특별자치도: 14개 시·군의 시군구 경계. 전주시는 구 단위로 표시
- 전라남도: 22개 시·군
- 경상북도: 22개 시·군의 시군구 경계. 포항시는 구 단위로 표시
- 경상남도: 18개 시·군의 시군구 경계. 창원시는 구 단위로 표시
- 제주특별자치도: 제주시, 서귀포시

## 데이터 출처

- 행정경계 원형: `southkorea/southkorea-maps` KOSTAT 2018 시군구 GeoJSON
  - `scratch/mapdata/skorea-municipalities-2018-geo.json`
  - https://github.com/southkorea/southkorea-maps
- 대구광역시 군위군 편입 반영: 대구광역시 공식 행정구역 안내 기준
  - https://daegu.go.kr/index.do?menu_id=00938711
- 서울 자치구 목록 확인: 서울특별시 자치구 안내 기준
  - https://www.seoul.go.kr/seoul/autonomy.do
- 부산 자치구·군 목록 확인: 부산광역시 자치구·군 주소 및 전화번호 기준
  - https://www.busan.go.kr/bhaddis04/
- 인천 군·구 목록 확인: 인천광역시 행정구역 기준
  - https://www.incheon.go.kr/IC040102

## 스타일 기준

- 캔버스는 앱 지도 컨테이너와 같은 4:3 비율인 `1024 x 768` SVG로 제작한다.
- 배경은 따뜻한 종이색 `#fbf7ec`을 사용한다.
- 구·군 면은 파스텔 베이지, 민트, 살구, 연노랑, 연하늘 계열을 순환 적용한다.
- 경계선은 짙은 갈색 계열 `#8d745d`로 통일한다.
- 라벨은 한글만 사용한다. 영문 라벨은 오탈자 위험이 있어 사용하지 않는다.
- 주요 강과 도로는 실제 지도 판독용이 아니라 톤앤매너 보조용 장식 레이어로만 사용한다.
- SVG 내부에 종이 질감 필터를 적용하되 앱 마커 가독성을 해치지 않도록 대비를 낮게 유지한다.

## 마커 배치 기준

- 서울, 부산, 대구, 인천은 기존 `x`, `y` 수동 좌표 대신 각 장소의 `lat`, `lng`를 지도 투영값으로 변환해 배치한다.
- 변환 기준은 `scripts/create-map-assets.mjs`가 생성한 SVG 투영값과 동일하다.

## 재생성 방법

1. 공개 GeoJSON을 `scratch/mapdata/skorea-municipalities-2018-geo.json`에 둔다.
2. 다음 명령으로 지도 SVG를 재생성한다.

```bash
node scripts/create-map-assets.mjs
```

3. 생성물은 다음 위치에 저장된다.

- `public/seoul_map.svg`
- `public/busan_map.svg`
- `public/daegu_map.svg`
- `public/incheon_map.svg`
- `public/gwangju_map.svg`
- `public/daejeon_map.svg`
- `public/ulsan_map.svg`
- `public/sejong_map.svg`
- `public/gyeonggi_map.svg`
- `public/gangwon_map.svg`
- `public/chungbuk_map.svg`
- `public/chungnam_map.svg`
- `public/jeonbuk_map.svg`
- `public/jeonnam_map.svg`
- `public/gyeongbuk_map.svg`
- `public/gyeongnam_map.svg`
- `public/jeju_map.svg`
- `scratch/mapdata/generated-map-metadata.json`

## 주의

- 대구의 군위군은 2018 GeoJSON에서는 경상북도 소속 코드로 존재하므로, 제작 스크립트에서 대구 22 코드 권역과 `군위군` 피처를 함께 포함한다.
- 인천 GeoJSON은 예전 명칭 `남구`를 포함하므로, 화면 라벨은 현행 공식 명칭 `미추홀구`로 치환한다.
- 인천광역시는 2026년 7월 1일부터 2군·9구 체제로 개편될 예정이나, 이 지도는 2026년 5월 22일 현재 현행 2군·8구 기준이다.
- 인천은 옹진군 도서 지역이 넓게 분산되어 있어, 앱용 지도에서는 강화·영종·송도·본토권 가독성을 우선하는 프레이밍을 사용한다. 원형 경계 데이터는 유지하되 일부 외곽 도서는 SVG 뷰포트 밖으로 나갈 수 있다.
- 경기도, 전라남도, 경상북도처럼 경계 수가 많거나 도서 지역이 넓은 지도는 앱 카드 안에서 지명 전체가 겹치지 않도록 글자 크기를 자동 축소한다.
- 지도 자산 경계나 패딩을 바꾸면 `src/components/Tabs/StampTourTab.jsx`의 `MAP_PROJECTIONS` 값도 함께 갱신해야 한다.
