# ChildInfo 웹앱 보안 검토 리포트

검토일: 2026-05-22  
대상: Vite/React 프론트엔드, Supabase 상담 기능, Vercel 배포 설정, 로컬 환경변수/SQL 정책 스크립트

## 요약

현재 앱은 정적 프론트엔드 중심 구조이며, 상담 기능만 Supabase에 쓰기/조회한다. 가장 큰 위험은 관리자 권한을 클라이언트 로컬 PIN으로만 판단하는 점, `VITE_` 환경변수로 외부 API 키가 브라우저 번들에 노출되는 점, Supabase RLS 설정 스크립트가 깨진 상태라 정책 적용을 신뢰하기 어렵다는 점이다.

종합 위험도: 높음

우선 조치 권장 순서:

1. 관리자 기능을 서버/Supabase Auth 기반 권한으로 이전한다.
2. `.env`에 있는 외부 API 키를 즉시 교체하고, 클라이언트 직접 호출을 서버리스 API로 프록시한다.
3. `supabase_rls_setup.sql`을 정상 SQL로 재작성해 실제 DB에 적용 여부를 확인한다.
4. CSP에서 `unsafe-inline`을 제거할 수 있도록 인라인 스크립트와 스타일을 정리한다.
5. 상담/아동 건강 데이터의 로컬 저장 정책과 삭제 UX를 명확히 분리한다.

## 주요 발견사항

### 1. 관리자 권한이 클라이언트 로컬 PIN에 의존함

심각도: Critical  
근거: `src/App.jsx:508-539`, `src/App.jsx:549-557`, `src/utils/security.js:3-14`

관리자 모드는 로고를 여러 번 클릭해 모달을 열고, 브라우저 `localStorage`에 저장된 PIN 해시와 입력값을 비교해 `isAdmin` 상태를 켠다. 저장된 값은 고정된 클라이언트 내장 키로 암호화된다. 이 방식은 브라우저 개발자도구에서 상태/스토리지를 조작하거나 번들 코드를 읽는 사용자에게 우회될 수 있다.

영향:

- 관리자 UI 접근 제어를 신뢰할 수 없다.
- `getAllConsultations`, `deleteRoom`, 관리자 답변 기능이 클라이언트 상태에 묶여 있어, 서버 정책이 허술하면 전체 상담 데이터 노출/삭제로 이어질 수 있다.

권장 조치:

- 관리자 인증은 Supabase Auth 또는 별도 백엔드 세션으로 처리한다.
- 관리자 판정은 JWT claim 또는 서버 API에서만 수행한다.
- 클라이언트의 `isAdmin`은 표시 상태로만 쓰고, 데이터 조회/삭제 권한은 DB RLS 또는 서버에서 강제한다.

### 2. 프론트엔드 환경변수로 API 키가 브라우저에 노출됨

심각도: High  
근거: `.env:1-8`, `src/services/facilityApi.js:91-101`, `src/services/nursingRoomService.js:29-31`, `src/services/supabaseClient.js:3-4`

`VITE_` 접두사가 붙은 값은 빌드 시 클라이언트 번들에 포함된다. 현재 복지/수유실 API 키와 Supabase URL/공개 키가 이 방식으로 사용된다. Supabase anon/publishable key 자체는 공개 가능하더라도 RLS가 완전해야 하며, 외부 공공 API 키는 남용/쿼터 소진/비용 또는 서비스 차단 위험이 있다. 수유실 API 호출 URL을 콘솔에 찍는 코드도 있어 키가 로그에 남을 수 있다.

권장 조치:

- 현재 노출된 외부 API 키는 교체한다.
- 외부 API 호출은 Vercel Serverless Function 또는 Supabase Edge Function으로 이동한다.
- 브라우저에는 자체 API 엔드포인트만 노출하고, 서버에서 rate limit, allowlist, 캐싱을 적용한다.
- `console.log('Fetching Nursing Rooms from:', fetchUrl)`는 제거한다.

### 3. Supabase RLS SQL 스크립트가 깨져 정책 적용을 신뢰하기 어려움

심각도: High  
근거: `supabase_rls_setup.sql:15`, `supabase_rls_setup.sql:26-33`, `supabase_rls_setup.sql:38-42`

RLS 활성화와 `CREATE POLICY` 문이 주석 줄에 붙어 있어 실제 SQL로 실행되지 않거나, 이어지는 `FOR SELECT/INSERT/DELETE`만 남아 문법 오류를 낼 가능성이 높다. 인코딩도 깨져 있어 운영자가 의도한 정책을 정확히 확인하기 어렵다.

영향:

- RLS가 실제로 활성화되지 않았을 수 있다.
- 상담 데이터가 익명 사용자 간에 노출되거나, 삭제 정책이 의도와 다를 수 있다.

권장 조치:

- SQL 파일을 UTF-8로 재작성한다.
- `ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;`와 각 `CREATE POLICY`를 독립된 SQL 문으로 분리한다.
- Supabase Dashboard에서 실제 적용 정책과 `anon/authenticated` 권한을 확인한다.
- `user_id text` 대신 `user_id uuid REFERENCES auth.users(id)`로 맞추는 것을 권장한다.

### 4. 상담 데이터 접근이 클라이언트 입력 `userId`에 강하게 의존함

심각도: High  
근거: `src/services/consultationService.js:14-21`, `src/services/consultationService.js:31-39`, `src/services/consultationService.js:80-85`, `src/services/consultationService.js:98-117`

조회/작성/삭제 함수가 모두 클라이언트에서 받은 `userId`를 쿼리 조건으로 사용한다. RLS가 올바르게 강제되면 방어 가능하지만, 현재 SQL 스크립트 상태상 서버 측 보장을 별도로 확인해야 한다.

권장 조치:

- insert 시 `user_id`는 클라이언트가 전달하지 말고 DB default 또는 RPC에서 `auth.uid()`로 설정한다.
- delete/update/select 정책은 항상 `auth.uid()` 기준으로 제한한다.
- 관리자 전체 조회는 클라이언트 직접 select가 아니라 관리자 전용 서버 API/RPC로 제한한다.

### 5. CSP가 인라인 스크립트/스타일을 허용함

심각도: Medium  
근거: `vercel.json:15-16`, `index.html:100-110`

현재 CSP는 `script-src 'self' 'unsafe-inline'`, `style-src 'self' 'unsafe-inline'`을 허용한다. 인라인 오류 처리 스크립트가 있고, `innerHTML`로 오류 메시지를 넣는 코드도 있어 XSS 방어력이 약해진다.

권장 조치:

- `index.html`의 인라인 스크립트를 별도 JS 파일로 옮긴다.
- 오류 메시지는 `textContent` 또는 React 렌더링으로 표시한다.
- CSP는 nonce 또는 hash 기반으로 전환하고 최종적으로 `unsafe-inline`을 제거한다.
- `X-XSS-Protection`은 구형 헤더라 의존하지 않는다.

### 6. 민감한 아동/상담 정보가 localStorage에 평문 또는 약한 암호화로 저장됨

심각도: Medium  
근거: `src/App.jsx:70-141`, `src/App.jsx:331-424`, `src/components/Tabs/ConsultTab.jsx:69-77`, `src/utils/security.js:3-14`

아동 프로필, 성장/체온/수유 기록, 상담 프로필이 `localStorage`에 저장된다. `localStorage`는 XSS 발생 시 바로 탈취 가능하며, 브라우저/기기 공유 상황에서도 노출될 수 있다. `security.js`의 암호화는 고정 키가 번들에 포함되어 실질적 보호가 제한적이다.

권장 조치:

- 건강/상담 데이터는 민감정보로 분류하고 저장 최소화를 적용한다.
- 로컬 저장이 꼭 필요하면 사용자 PIN/패스프레이즈에서 키를 파생하고, 서버에는 저장하지 않는 정책을 명확히 표시한다.
- “전체 초기화”처럼 `localStorage.clear()`를 쓰는 기능은 앱 전용 key만 삭제하도록 제한한다.

### 7. 외부 의존성 취약점 감사는 완료하지 못함

심각도: Unknown  
근거: `package.json`, `package-lock.json`

`npm audit --omit=dev`는 외부 npm registry로 프로젝트 의존성 메타데이터를 전송해야 하므로 자동 승인 정책에서 차단됐다. 로컬 설치 목록은 확인했지만, 최신 취약점 DB 기반 판정은 미수행이다.

확인된 주요 런타임 의존성:

- `@supabase/supabase-js@2.103.0`
- `@apps-in-toss/web-framework@2.5.1`
- `react@18.3.1`, `react-dom@18.3.1`
- `vite@5.4.21`
- `crypto-js@4.2.0`
- `framer-motion@11.18.2`, `recharts@3.8.1`

권장 조치:

- 사용자가 외부 registry 전송을 승인한 환경에서 `npm audit --omit=dev`를 실행한다.
- Dependabot 또는 GitHub Dependabot alerts를 활성화한다.
- 배포 전 `npm ci && npm run build`를 CI에서 재현 가능하게 실행한다.

## 긍정적인 보안 요소

- Vercel 헤더에 `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `Referrer-Policy`가 설정되어 있다.
- 상담 메시지 본문은 React 텍스트 렌더링으로 표시되어 일반 메시지 XSS 위험은 낮다. (`src/components/Tabs/ConsultTab.jsx:357-364`)
- 상담 메시지 길이를 2000자로 제한한다. (`src/services/consultationService.js:76-83`)
- 14일 초과 상담 데이터 삭제용 SQL이 별도 파일로 준비되어 있다. (`supabase_auto_delete.sql:11-18`)

## 권장 개선 로드맵

### 즉시 조치

- 노출된 외부 API 키 교체
- 수유실 API URL 로그 제거
- Supabase Dashboard에서 `consultations` RLS 활성화/정책 적용 여부 확인
- 관리자 PIN 기능 비활성화 또는 관리자 기능을 운영 배포에서 숨김

### 단기 조치

- 관리자 전용 API/RPC 구현
- `user_id`를 `auth.uid()` 기반으로 강제
- RLS SQL 재작성 및 테스트 케이스 추가
- CSP에서 `unsafe-inline` 제거 준비

### 중기 조치

- 민감정보 저장 정책 정리 및 앱 내 고지 개선
- 서버리스 API에 rate limit/캐시 적용
- 의존성 보안 감사 자동화
- 오류 로그에서 개인정보/키/URL query 제거

## 결론

현재 앱은 UI 수준의 보안 장치는 일부 갖추고 있지만, 중요한 권한 경계가 클라이언트에 있다. 특히 상담 데이터는 아동 정보와 보호자 상담 내용이 포함될 수 있으므로, “클라이언트 편의 기능”과 “서버 권한 통제”를 분리하는 것이 가장 중요하다. 관리자 인증과 Supabase RLS를 먼저 바로잡으면 전체 위험도가 크게 낮아진다.
