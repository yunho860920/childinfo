# 서울 아기와 가볼 만한 곳 도장 깨기 (Stamp Tour) 기능 정의서

본 문서는 'ChildInfo' 앱에 추가될 새로운 기능인 **'서울 아기와 가볼 만한 곳 도장 깨기'**의 기획 및 기술 사양을 정리한 문서입니다.

## 1. 기능 개요
서울 지역 내 아기와 함께 방문하기 좋은 주요 명소들을 취합하여, 사용자가 직접 방문하고 '도장'을 찍어 100% 달성을 목표로 하는 게이미피케이션 기능입니다.

## 2. 핵심 기능 (Key Features)
- **서울 명소 도장판 UI**: 서울 내 주요 방문지(경복궁, 어린이박물관 등)를 그리드 또는 리스트 형태로 시각화하여 제공합니다.
- **방문 인증 (도장 찍기)**: 사용자가 장소에 방문했을 때 인증 버튼을 눌러 도장을 획득합니다. (향후 GPS 기반 인증 확장 가능)
- **달성률(Progress) 표시**: 전체 장소 대비 방문 완료한 장소의 비율을 퍼센트(%)와 프로그래스 바로 표시합니다.
- **100% 달성 축하 효과**: 모든 도장을 모았을 때 화면에 폭죽(Confetti) 애니메이션 등 시각적 보상을 제공합니다.
- **데이터 영구 저장**: Supabase를 연동하여 사용자의 도장 획득 정보를 안전하게 저장합니다.

## 3. 기술 스택 (Technology Stack)
- **Frontend**: React (UI 구성), CSS (디자인), `framer-motion` (도장 애니메이션)
- **Backend/DB**: Supabase (장소 정보 및 사용자 도장 기록 저장)
- **Effect**: `react-confetti` (성공 축하 효과)
- **Optional**: Web Geolocation API (실제 위치 기반 인증 시 활용)

## 4. 데이터 구조 (Proposed Schema)
### `places` 테이블
- `id`: UUID (PK)
- `name`: 장소 이름
- `address`: 주소
- `category`: 장소 유형 (박물관, 공원 등)
- `image_url`: 장소 썸네일 이미지

### `user_stamps` 테이블
- `id`: UUID (PK)
- `user_id`: 사용자 ID
- `place_id`: 장소 ID (FK to places.id)
- `visited_at`: 방문 인증 일시
