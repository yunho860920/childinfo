import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Award, 
  Star,
  Navigation2,
  Info,
  Maximize2,
  Phone,
  Baby,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Hammer,
  Compass,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sliders
} from 'lucide-react';
import { cn } from '../../utils/uiUtils';

// 전국 광역자치단체 리스트
const REGIONS = [
  { id: 'seoul', name: '서울특별시', active: true },
  { id: 'busan', name: '부산광역시', active: true },
  { id: 'incheon', name: '인천광역시', active: true },
  { id: 'gyeonggi', name: '경기도', active: true },
  { id: 'soon', name: '다른 지역 준비 중', active: false },
];

const SEOUL_SPOTS = [
  { id: 'spot8', name: '경복궁', category: '역사/고궁', x: 48, y: 35, emoji: '🏯', phone: '02-3700-3900', babyRoom: '있음 (입구 근처)', notes: '유모차 대여 가능, 광화문 교대식 관람 추천', lat: 37.5796, lng: 126.9770, address: '서울특별시 종로구 사직로 161' },
  { id: 'spot1', name: '국립중앙박물관 어린이박물관', category: '박물관', x: 50, y: 55, emoji: '🏛️', phone: '02-2077-9000', babyRoom: '있음 (매우 쾌적)', notes: '사전 온라인 예약 필수, 무료 관람', lat: 37.5238, lng: 126.9804, address: '서울특별시 용산구 서빙고로 137' },
  { id: 'spot14', name: '남산서울타워', category: '랜드마크', x: 52, y: 45, emoji: '🗼', phone: '02-3455-9277', babyRoom: '있음', notes: '케이블카 이용 시 유모차는 접어서 탑승 가능', lat: 37.5511, lng: 126.9882, address: '서울특별시 용산구 남산공원길 105' },
  { id: 'spot2', name: '서울어린이대공원', category: '공원/동물원', x: 74, y: 40, emoji: '🎢', phone: '02-450-9311', babyRoom: '곳곳에 위치', notes: '동물원과 식물원이 무료, 주말 주차 혼잡 주의', lat: 37.5480, lng: 127.0810, address: '서울특별시 광진구 능동로 216' },
  { id: 'spot7', name: '서울숲', category: '공원', x: 65, y: 50, emoji: '🦌', phone: '02-460-2905', babyRoom: '방문자센터 내 위치', notes: '사슴 먹이주기 체험 가능, 돗자리 필수', lat: 37.5443, lng: 127.0374, address: '서울특별시 성동구 뚝섬로 273' },
  { id: 'spot11', name: '올림픽공원', category: '공원', x: 84, y: 65, emoji: '🏃', phone: '02-410-1114', babyRoom: '있음', notes: '나홀로나무 포토존 인기, 한성백제박물관과 인접', lat: 37.5207, lng: 127.1215, address: '서울특별시 송파구 올림픽로 424' },
  { id: 'spot15', name: '롯데월드 어드벤처', category: '테마파크', x: 81, y: 72, emoji: '🏰', phone: '1661-2000', babyRoom: '있음 (매직아일랜드 입구)', notes: '베이비권 이용 시 영유아 놀이기구 무제한', lat: 37.5111, lng: 127.0982, address: '서울특별시 송파구 올림픽로 240' },
  { id: 'spot16', name: '코엑스 아쿠아리움', category: '아쿠아리움', x: 72, y: 70, emoji: '🦈', phone: '02-700-7200', babyRoom: '있음', notes: '스타필드 코엑스몰 내 위치, 유모차 통행 원활', lat: 37.5131, lng: 127.0586, address: '서울특별시 강남구 영동대로 513' },
  { id: 'spot20', name: '서울식물원', category: '식물원', x: 18, y: 50, emoji: '🌵', phone: '02-2104-9716', babyRoom: '있음 (온실 입구)', notes: '온실 내부가 더우니 가벼운 옷차림 추천', lat: 37.5693, lng: 126.8353, address: '서울특별시 강서구 마곡동로 161' },
  { id: 'spot5', name: '국립항공박물관', category: '박물관', x: 12, y: 55, emoji: '✈️', phone: '02-6328-9000', babyRoom: '있음', notes: '기내 훈련 체험 등 예약 프로그램 인기', lat: 37.5593, lng: 126.8023, address: '서울특별시 강서구 하늘길 177' },
  { id: 'spot6', name: '서대문자연사박물관', category: '박물관', x: 38, y: 38, emoji: '🦖', phone: '02-330-8899', babyRoom: '있음', notes: '입구의 커다란 공룡 미끄럼틀이 아이들에게 인기', lat: 37.5753, lng: 126.9367, address: '서울특별시 서대문구 연희로32길 51' },
  { id: 'spot12', name: '전쟁기념관 어린이박물관', category: '박물관', x: 49, y: 51, emoji: '🎖️', phone: '02-709-3114', babyRoom: '있음', notes: '야외에 실제 비행기와 탱크가 전시되어 있음', lat: 37.5366, lng: 126.9772, address: '서울특별시 용산구 이태원로 29' },
  { id: 'spot10', name: '북서울꿈의숲', category: '공원', x: 68, y: 22, emoji: '🪁', phone: '02-2289-4001', babyRoom: '있음', notes: '사슴 방목장과 상상어린이놀이터 추천', lat: 37.6217, lng: 127.0422, address: '서울특별시 강북구 월계로 173' },
  { id: 'spot13', name: '서울시립과학관', category: '과학관', x: 78, y: 16, emoji: '🧪', phone: '02-970-4500', babyRoom: '있음', notes: '아이들이 직접 만지고 체험하는 전시가 많음', lat: 37.6328, lng: 127.0747, address: '서울특별시 노원구 한글비석로 160' },
  { id: 'spot17', name: '은평역사한옥박물관', category: '박물관', x: 32, y: 16, emoji: '🏠', phone: '02-351-8524', babyRoom: '있음', notes: '한옥마을 산책과 연계하기 좋음', lat: 37.6393, lng: 126.9370, address: '서울특별시 은평구 연서로 501' },
  { id: 'spot18', name: '한성백제박물관', category: '박물관', x: 86, y: 76, emoji: '🏺', phone: '02-2152-5800', babyRoom: '있음', notes: '올림픽공원 남쪽에 위치, 주차 편리', lat: 37.5173, lng: 127.1226, address: '서울특별시 송파구 위례성대로 71' },
  { id: 'spot19', name: '돈의문박물관마을', category: '테마마을', x: 44, y: 38, emoji: '🏘️', phone: '02-739-6900', babyRoom: '있음', notes: '옛 추억의 골목 놀이 체험 가능', lat: 37.5684, lng: 126.9686, address: '서울특별시 종로구 송월길 14-3' },
  { id: 'spot3', name: '서울공예박물관 어린이박물관', category: '박물관', x: 51, y: 36, emoji: '🎨', phone: '02-6450-7000', babyRoom: '있음', notes: '창의적인 공예 체험 가능, 예약 필수', lat: 37.5756, lng: 126.9830, address: '서울특별시 종로구 율곡로3길 4' },
  { id: 'spot4', name: '서울상상나라', category: '체험관', x: 75, y: 38, emoji: '💡', phone: '02-6450-9500', babyRoom: '매우 잘되어 있음', notes: '영유아 전용 놀이 공간이 따로 분리됨', lat: 37.5492, lng: 127.0808, address: '서울특별시 광진구 능동로 216' },
  { id: 'spot9', name: '창경궁 대온실', category: '역사/식물원', x: 53, y: 34, emoji: '🌿', phone: '02-762-4868', babyRoom: '창경궁 입구 위치', notes: '겨울에도 따뜻하게 아이와 꽃 구경 가능', lat: 37.5818, lng: 126.9950, address: '서울특별시 종로구 창경궁로 185' }
];

const BUSAN_SPOTS = [
  { id: 'bspot1', name: '국립해양박물관', category: '박물관/수족관', x: 60.8, y: 77.3, emoji: '🐳', phone: '051-309-1900', babyRoom: '있음 (2층/3층)', notes: '입장료 무료! 원통 수족관과 해양도서관이 최고입니다. 유모차 대여 가능.', lat: 35.0835, lng: 129.0833, address: '부산 영도구 해양로301번길 45' },
  { id: 'bspot2', name: '국립부산과학관', category: '과학관/체험관', x: 93.2, y: 34.0, emoji: '🚀', phone: '051-750-2300', babyRoom: '있음 (1층)', notes: '꼬마기차 타기와 새싹누리관(어린이 전용) 체험은 사전예약 필수!', lat: 35.2047, lng: 129.2127, address: '부산 기장군 기장읍 과학관로 59' },
  { id: 'bspot3', name: '부산시민공원', category: '공원', x: 54.1, y: 47.5, emoji: '🌳', phone: '051-850-6000', babyRoom: '있음 (방문자센터)', notes: '뽀로로 도서관, 대형 모래놀이터와 시원한 음악분수가 가득합니다.', lat: 35.1670, lng: 129.0564, address: '부산 진구 시민공원로 73' },
  { id: 'bspot4', name: 'SEA LIFE 부산아쿠아리움', category: '아쿠아리움', x: 80.1, y: 50.5, emoji: '🦈', phone: '051-740-1700', babyRoom: '있음 (지하 2층)', notes: '해운대 해변 바로 앞! 인어공주 공연과 펭귄 먹이주기 쇼가 인기입니다.', lat: 35.1587, lng: 129.1603, address: '부산 해운대구 해운대해변로 266' },
  { id: 'bspot5', name: '해운대 블루라인파크 (미포)', category: '체험/랜드마크', x: 84.1, y: 50.9, emoji: '🚃', phone: '051-701-5548', babyRoom: '없음 (인근 카페 추천)', notes: '바다 바로 옆 해변열차는 접이식 유모차 탑승 가능. 경치가 환상적입니다.', lat: 35.1576, lng: 129.1764, address: '부산 해운대구 달맞이길62번길 13' },
  { id: 'bspot6', name: '송도해상케이블카', category: '케이블카/체험', x: 45.6, y: 80.5, emoji: '🚡', phone: '051-247-9900', babyRoom: '있음 (1층)', notes: '발밑으로 바다가 보이는 크리스탈 캐빈 추천. 공룡 테마광장도 있습니다.', lat: 35.0745, lng: 129.0222, address: '부산 서구 송도해상케이버로 171' },
  { id: 'bspot7', name: '태종대 다누비열차', category: '공원/랜드마크', x: 61.5, y: 88.0, emoji: '🌊', phone: '051-405-2004', babyRoom: '있음 (광장 화장실 옆)', notes: '다누비열차 뒷칸에 유모차 적재 가능. 시원한 파도와 등대 전망이 일품.', lat: 35.0536, lng: 129.0858, address: '부산 영도구 전망로 24' },
  { id: 'bspot8', name: 'F1963', category: '복합문화공간', x: 68.2, y: 44.1, emoji: '📚', phone: '051-756-1963', babyRoom: '있음 (예스24 내부)', notes: '와이어 공장을 개조한 이색 공간. 어린이 전용 키즈 도서도서 코너 완비.', lat: 35.1766, lng: 129.1128, address: '부산 수영구 구락로123번길 20' },
  { id: 'bspot9', name: '렛츠런파크 부산경남', category: '테마공원/체험', x: 8.9, y: 51.8, emoji: '🐴', phone: '1566-3333', babyRoom: '있음 (관람대 1층)', notes: '주말 썰매장, 토마열차, 바닥분수까지 아기가 뛰어놀기 최고의 가성비!', lat: 35.1550, lng: 128.8755, address: '부산 강서구 가락대로 929' },
  { id: 'bspot10', name: '화명수목원', category: '수목원/자연', x: 48.9, y: 19.9, emoji: '🍃', phone: '051-362-0261', babyRoom: '있음 (전시관 내부)', notes: '계곡길 산책 데크가 잘 조성되어 유모차 주행이 쉽고 작은 토끼 동물원도 있습니다.', lat: 35.2443, lng: 129.0354, address: '부산 북구 화명온천로 270' },
  { id: 'bspot11', name: '부산어린이창의교육관', category: '체험관/박물관', x: 51.4, y: 40.9, emoji: '🎨', phone: '051-810-8800', babyRoom: '있음 (1층 로비)', notes: '디지털 체험형 어린이 놀이 전당! 언덕 지대에 위치해 유모차 보행 시 조심하세요.', lat: 35.1856, lng: 129.0454, address: '부산 진구 초읍천로 113-79' },
  { id: 'bspot12', name: '스포원파크 (금정체육공원)', category: '공원/체험', x: 64.2, y: 8.8, emoji: '🚴', phone: '1577-0880', babyRoom: '있음 (스포츠센터)', notes: '자전거 대여와 피크닉 텐트 치기 좋으며 실내 탄생의신비관 체험도 가능합니다.', lat: 35.2755, lng: 129.0967, address: '부산 금정체육공원로399번길 324' },
  { id: 'bspot13', name: '다대포 낙조분수', category: '공원/랜드마크', x: 31.5, y: 89.8, emoji: '⛲', phone: '051-220-4161', babyRoom: '없음 (관리동 문의)', notes: '화려한 야간 조명 음악분수 쇼가 압권입니다. 선선한 저녁 시간 산책 추천.', lat: 35.0485, lng: 128.9658, address: '부산 사하구 다대동 958' },
  { id: 'bspot14', name: '삼락생태공원', category: '공원/자연', x: 35.9, y: 46.2, emoji: '🌾', phone: '051-310-6059', babyRoom: '없음', notes: '봄철 벚꽃 터널 및 낙동강 바람을 쐬며 광활한 평지 유모차 산책로 주행 가능.', lat: 35.1706, lng: 128.9837, address: '부산 사상구 삼락동 29-46' },
  { id: 'bspot15', name: '부산박물관', category: '박물관/역사', x: 64.2, y: 59.7, emoji: '🏺', phone: '051-610-7111', babyRoom: '있음 (안내데스크 옆)', notes: '고풍스러운 다도 체험과 경사로 휠체어/유모차 인프라가 훌륭히 완비되어 있습니다.', lat: 35.1328, lng: 129.0967, address: '부산 남구 UN평화로 63' }
];

const INCHEON_SPOTS = [
  { id: 'ispot1', name: '송도 센트럴파크', category: '공원', x: 38, y: 72, emoji: '🛶', phone: '032-456-2860', babyRoom: '있음 (트라이보울 및 호텔 인접)', notes: '사슴 정원 관람 및 토끼섬 보트 탑승 추천. 해수로 옆 유모차 도로가 매우 평탄하고 넓게 잘 정비되어 있습니다.', lat: 37.3923, lng: 126.6372, address: '인천 연수구 컨벤시아대로 160' },
  { id: 'ispot2', name: '국립생물자원관', category: '박물관/자연', x: 34, y: 22, emoji: '🌿', phone: '032-590-7000', babyRoom: '있음 (지하 1층 및 1층)', notes: '무료 관람! 쾌적한 실내 어린이체험실과 푸른 야외 정원이 있으며 유모차 대여를 무료 지원합니다.', lat: 37.5689, lng: 126.6394, address: '인천 서구 환경로 42' },
  { id: 'ispot3', name: '인천대공원 어린이동물원', category: '공원/동물원', x: 78, y: 55, emoji: '🐑', phone: '032-440-5880', babyRoom: '있음 (대공원 안내소)', notes: '아기 염소, 사막여우 등 아기자기한 동물들을 만날 수 있으며 넓은 그늘 잔디밭이 있어 돗자리 피크닉에 최적입니다.', lat: 37.4475, lng: 126.7578, address: '인천 남동구 무네미로 236' },
  { id: 'ispot4', name: '월미테마파크', category: '테마파크', x: 26, y: 46, emoji: '🎡', phone: '032-761-0997', babyRoom: '있음', notes: '영유아 전용 실내 놀이방 및 어린이 전용 실내/외 미니 놀이기구들이 다양하게 구비되어 아기와 타기 좋습니다.', lat: 37.4722, lng: 126.5982, address: '인천 중구 월미문화로 81' },
  { id: 'ispot5', name: '송월동 동화마을 & 차이나타운', category: '테마마을', x: 32, y: 48, emoji: '🏘️', phone: '032-760-7537', babyRoom: '있음 (주민센터 및 박물관 내)', notes: '골목 가득 알록달록한 동화 속 벽화 포토존이 가득합니다. 일부 경사 구간이 있으니 유모차 주행 시 안전에 유의하세요.', lat: 37.4764, lng: 126.6186, address: '인천 중구 동화마을길 38' },
  { id: 'ispot6', name: '인천학생과학관', category: '과학관', x: 12, y: 38, emoji: '🧪', phone: '032-880-0790', babyRoom: '있음', notes: '1층 영유아 전용 과학놀이방이 인기이며, 층별로 직접 만지고 조작하는 체험형 전시가 아주 쾌적하게 구성되어 있습니다.', lat: 37.4947, lng: 126.5517, address: '인천 중구 영종대로277번길 74-1' },
  { id: 'ispot7', name: '늘솔길공원 양떼목장', category: '공원/체험', x: 74, y: 82, emoji: '🐑', phone: '032-453-2856', babyRoom: '있음 (인접 도서관)', notes: '도심 속에서 친환경 면양들에게 직접 먹이를 주며 교감할 수 있고, 숲속 편백나무 피톤치드 산책로가 평탄합니다.', lat: 37.3897, lng: 126.7214, address: '인천 남동구 앵고개로 539' },
  { id: 'ispot8', name: '수도국산달동네박물관', category: '박물관', x: 42, y: 42, emoji: '🛖', phone: '032-770-6131', babyRoom: '있음', notes: '70년대 옛 골목을 정밀 재현해 놓아 교육적이며, 어린이 달동네 놀이 체험 구역이 실내에 잘 마련되어 있습니다.', lat: 37.4807, lng: 126.6372, address: '인천 동구 솔빛로 51' },
  { id: 'ispot9', name: '영종도 씨사이드파크', category: '공원/체험', x: 14, y: 56, emoji: '🚴', phone: '032-713-0700', babyRoom: '있음', notes: '서해 바다 갯벌과 인천대교 전망을 감상하며 평지 유모차 산책이 가능하고, 여름철 대형 물놀이터가 인기입니다.', lat: 37.4839, lng: 126.5684, address: '인천 중구 구읍로 75' },
  { id: 'ispot10', name: '소래습지생태공원', category: '공원/자연', x: 84, y: 78, emoji: '🌾', phone: '032-435-1245', babyRoom: '없음 (인접 전시관 내 이용)', notes: '빨간 풍차와 넓은 염전길을 배경으로 이국적인 사진을 남기기 좋고, 입구의 소래 역사관과 연계하기 훌륭합니다.', lat: 37.4069, lng: 126.7412, address: '인천 남동구 소래로263번길 19' },
  { id: 'ispot11', name: '인천나비공원', category: '자연/체험', x: 68, y: 35, emoji: '🦋', phone: '032-509-8820', babyRoom: '있음', notes: '살아있는 나비를 직접 관찰할 수 있는 나비온실이 잘 조성되어 있고, 시원한 흙길 산책로가 유모차로 다니기 편합니다.', lat: 37.5256, lng: 126.6975, address: '인천 부평구 평천로 26-47' },
  { id: 'ispot12', name: '인천상륙작전기념관', category: '역사/공원', x: 48, y: 75, emoji: '🎖️', phone: '032-832-0931', babyRoom: '있음', notes: '야외 광장에 실제 군용 탱크와 전투기, 미사일이 전시되어 있어 탈것을 좋아하는 아이들에게 최고의 명소입니다.', lat: 37.4239, lng: 126.6578, address: '인천 연수구 청량로 138' },
  { id: 'ispot13', name: '영종 파라다이스시티 플라자', category: '실내/복합문화공간', x: 10, y: 62, emoji: '🏨', phone: '1833-8855', babyRoom: '있음 (매우 쾌적/수유실 완비)', notes: '날씨에 구애받지 않는 거대한 유럽풍 실내 광장으로, 유모차 주행이 매우 매끄럽고 다양한 대형 현대미술 작품들이 전시되어 있습니다.', lat: 37.4372, lng: 126.4649, address: '인천 중구 영종해안남로321번길 186' },
  { id: 'ispot14', name: '청라호수공원', category: '공원/피크닉', x: 42, y: 30, emoji: '⛲', phone: '032-456-2749', babyRoom: '있음 (피노키오 놀이터 인근)', notes: '환상적인 대형 음악분수가 펼쳐지는 드넓은 호수공원입니다. 전 구간 경사 없는 평탄한 길로 유모차 보행 및 야외 자전거 놀이에 제격입니다.', lat: 37.5288, lng: 126.6342, address: '인천 서구 청라대로 135' },
  { id: 'ispot15', name: '강화 옥토끼우주센터', category: '체험/과학관', x: 15, y: 12, emoji: '🚀', phone: '032-937-6917', babyRoom: '있음 (1층 로비 및 수유 공간)', notes: '실내 우주과학 탐험과 공룡 야외 정원, 그리고 여름 보트/겨울 썰매 등 사계절 아기와 뛰어놀 수 있는 강화도의 대표 복합 과학 체험 명소입니다.', lat: 37.6012, lng: 126.4886, address: '인천 강화군 불은면 강화동로 403' }
];

const GYEONGGI_SPOTS = [
  { id: 'ggspot1', name: '에버랜드', category: '테마파크/동물원', x: 50, y: 50, emoji: '🎡', phone: '031-320-5000', babyRoom: '있음 (베이비서비스 센터 곳곳 위치)', notes: '국내 최대의 유모차 천국! 로스트밸리 사파리와 판다월드는 아기들의 필수 코스입니다. 언덕이 많으니 유모차 브레이크를 꼭 챙기세요.', lat: 37.2942, lng: 127.2025, address: '경기 용인시 처인구 포곡읍 에버랜드로 199' },
  { id: 'ggspot2', name: '현대프리미엄아울렛 스페이스원', category: '쇼핑/체험', x: 50, y: 50, emoji: '🛍️', phone: '031-8078-2233', babyRoom: '있음 (매우 호화로운 유아 휴게실 완비)', notes: '디자이너 하이메 아욘이 꾸민 모카가든이 정말 아름답고, 바닥 분수와 유모차 무료 대여 등 아기 편의시설의 끝판왕입니다.', lat: 37.6186, lng: 127.1648, address: '경기 남양주시 다산순환로 50' },
  { id: 'ggspot3', name: '안성팜랜드', category: '농장/체험', x: 50, y: 50, emoji: '🐑', phone: '031-8053-7979', babyRoom: '있음 (중앙 광장 및 패밀리동 내부)', notes: '탁 트인 들판에서 양, 염소 등 동물들에게 먹이를 주고 직접 만질 수 있어 오감 교감에 최고입니다. 전동자전거에 접이식 유모차 적재 가능.', lat: 37.0118, lng: 127.1472, address: '경기 안성시 공도읍 대신두길 28' },
  { id: 'ggspot4', name: '일산 호수공원', category: '공원/피크닉', x: 50, y: 50, emoji: '🌲', phone: '031-8075-4347', babyRoom: '있음 (꽃전시관 및 호수 공원 안내소)', notes: '노래하는 분수대와 가로수길, 아쿠아플라넷 일산과 연계가 아주 훌륭한 평지 산책로로, 가을철 돗자리를 펴고 소풍을 즐기기에 완벽합니다.', lat: 37.6582, lng: 126.7705, address: '경기 고양시 일산동구 호수로 595' },
  { id: 'ggspot5', name: '가평 아침고요수목원', category: '수목원/자연', x: 50, y: 50, emoji: '🍃', phone: '1544-6703', babyRoom: '있음 (원내 매점 뒤편 안내센터)', notes: '사계절 수려한 꽃 and 나무 터널을 감상할 수 있습니다. 유모차용 경사로가 개설되어 있어 산바람을 맞으며 차분하게 산책하기 제격입니다.', lat: 37.7438, lng: 127.3512, address: '경기 가평군 상면 수목원로 432' },
  { id: 'ggspot6', name: '경기도 어린이박물관', category: '박물관', x: 50, y: 50, emoji: '🏛️', phone: '031-270-8600', babyRoom: '있음 (각 층에 패밀리룸 완비)', notes: '경기도에서 가장 큰 어린이박물관으로 유아 맞춤형 아기동반 전용 놀이터(36개월 미만)가 있어 안전하게 즐길 수 있습니다. 예약 필수.', lat: 37.2682, lng: 127.1084, address: '경기 용인시 기흥구 상갈로 6' },
  { id: 'ggspot7', name: '용인 한국민속촌', category: '역사/체험', x: 50, y: 50, emoji: '🏮', phone: '031-288-0000', babyRoom: '있음 (관아 옆 의무실 부근)', notes: '넓고 평탄한 흙길이 있어 유모차 끌기 좋으며, 전통 그네타기와 아기자기한 전통 마당극 관람을 추천합니다.', lat: 37.2589, lng: 127.1206, address: '경기 용인시 기흥구 민속촌로 90' },
  { id: 'ggspot8', name: '서울대공원 동물원', category: '공원/동물원', x: 50, y: 50, emoji: '🐯', phone: '02-500-7335', babyRoom: '있음 (유모차 대여소 인근)', notes: '아시아 최대급 동물원! 유모차 대여 및 코끼리열차 탑승이 가능하며 넓은 잔디밭 피크닉 공간이 훌륭합니다.', lat: 37.4285, lng: 127.0200, address: '경기 과천시 대공원광장로 102' },
  { id: 'ggspot9', name: '파주 벽초지수목원', category: '수목원/자연', x: 50, y: 50, emoji: '🌷', phone: '031-957-2004', babyRoom: '있음 (중앙 광장 화장실 옆)', notes: '드라마 촬영지로 유명하며 평지 잔디밭과 아름다운 정원이 조성되어 있어 유모차 산책과 아기 화보 촬영에 제격입니다.', lat: 37.8228, lng: 126.8525, address: '경기 파주시 광탄면 부흥로 242' },
  { id: 'ggspot10', name: '시흥 갯골생태공원', category: '공원/자연', x: 50, y: 50, emoji: '🌾', phone: '031-488-6900', babyRoom: '있음 (인포센터 내)', notes: '옛 소래염전 부지의 광활한 평지 생태공원. 잔디밭 그늘막 텐트 피크닉 및 해수체험장, 유모차 데크길이 매우 훌륭합니다.', lat: 37.3828, lng: 126.7905, address: '경기 시흥시 동서로 287' },
  { id: 'ggspot11', name: '광명동굴', category: '동굴/체험', x: 50, y: 50, emoji: '🦇', phone: '070-4277-8902', babyRoom: '있음 (동굴 매표소 옆)', notes: '여름에도 온도가 12도로 시원한 이색 동굴! 동굴 내부는 계단이 많으므로 유모차는 매표소에 맡기고 아기띠 착용을 강력 권장합니다.', lat: 37.4269, lng: 126.8654, address: '경기 광명시 가학로85번길 142' },
  { id: 'ggspot12', name: '경기 광주 화담숲', category: '수목원/자연', x: 50, y: 50, emoji: '🍁', phone: '031-8026-6666', babyRoom: '있음 (모노레일 1승강장 옆)', notes: '숲 전체가 완만한 데크길로 이루어져 유모차로 끝까지 산책이 가능합니다. 단 모노레일 탑승 시 유모차는 접어서 실어야 합니다. 사전 예약 필수.', lat: 37.2882, lng: 127.3506, address: '경기 광주시 도척면 도척윗로 278' },
  { id: 'ggspot13', name: '여주곤충박물관', category: '박물관/체험', x: 50, y: 50, emoji: '🐞', phone: '031-885-1400', babyRoom: '있음 (로비 옆)', notes: '아이들이 살아있는 곤충, 파충류 등을 만져보고 교감할 수 있는 쾌적한 실내 박물관입니다. 휠체어와 유모차 이동에 무리가 없습니다.', lat: 37.2917, lng: 127.6744, address: '경기 여주시 명성로 114' },
  { id: 'ggspot14', name: '이천시립박물관', category: '박물관', x: 50, y: 50, emoji: '🏺', phone: '031-644-2947', babyRoom: '있음', notes: '설봉공원 내 위치하여 유모차 산책과 함께 들르기 좋습니다. 전통 도자기와 이천의 역사를 무료로 유모차로 편하게 관람할 수 있습니다.', lat: 37.2890, lng: 127.4244, address: '경기 이천시 경충대로2709번길 128' },
  { id: 'ggspot15', name: '포천 허브아일랜드', category: '테마파크/정원', x: 50, y: 50, emoji: '🌿', phone: '031-535-6494', babyRoom: '있음 (힐링센터 내)', notes: '허브 성과 동화나라를 연출하는 대형 정원! 유모차 대여를 지원하며, 아기자기한 토이박물관과 당나귀 먹이주기 체험이 아이들에게 인기입니다.', lat: 37.9691, lng: 127.1856, address: '경기 포천시 신북면 청신로947번길 35' },
  { id: 'ggspot16', name: '의왕 레일바이크 & 왕송호수공원', category: '공원/레저', x: 50, y: 50, emoji: '🚂', phone: '031-8086-7443', babyRoom: '있음 (공원 관리동 내)', notes: '호수둘레길을 따라 평탄한 유모차 보도가 넓게 확보되어 있고 음악분수 광장과 레일바이크(아기 동반 탑승 가능)가 있어 추천합니다.', lat: 37.3114, lng: 126.9694, address: '경기 의왕시 왕송호수길 280' },
  { id: 'ggspot17', name: '부천로보파크', category: '박물관/체험', x: 50, y: 50, emoji: '🤖', phone: '032-716-6440', babyRoom: '있음 (1층 로비 뒤편)', notes: '로봇 댄스 공연 및 다채로운 작동형 전시가 있어 기계와 탈것을 좋아하는 어린이들에게 천국입니다. 엘리베이터 및 유모차 동선이 편리합니다.', lat: 37.5217, lng: 126.7797, address: '경기 부천시 원미구 평천로 655' },
  { id: 'ggspot18', name: '하남 나무고아원 & 유아숲체험원', category: '공원/자연', x: 50, y: 50, emoji: '🌳', phone: '031-790-6411', babyRoom: '없음 (인근 미사도서관 휴게실 추천)', notes: '자연 친화적 나무숲 놀이터로 숲속 모래놀이터와 그물 놀이시설이 가득합니다. 숲 전체가 흙길이지만 비교적 평탄해 주행 유모차 입장이 가능합니다.', lat: 37.5714, lng: 127.2417, address: '경기 하남시 미사동 608' },
  { id: 'ggspot19', name: '안산갈대습지공원', category: '공원/자연', x: 50, y: 50, emoji: '🌾', phone: '031-599-9884', babyRoom: '있음 (환경생태관 내)', notes: '넓은 습지 위를 걷는 나무 데크 보행로가 매우 평탄하고 길게 뻗어 있어 아기와 데크 유모차 산책을 하기에 최적의 힐링 코스입니다.', lat: 37.2689, lng: 126.8370, address: '경기 안산시 상록구 해안로 820-12' },
  { id: 'ggspot20', name: '김포함상공원', category: '역사/공원', x: 50, y: 50, emoji: '🚢', phone: '031-981-9879', babyRoom: '있음 (관리소 건물)', notes: '실제 퇴역 상륙함을 개조한 해양 박물관입니다. 야외 분수광장과 넓은 공원은 유모차가 편하게 주행할 수 있으며 야외 전투기 전시가 인기입니다.', lat: 37.6402, lng: 126.5186, address: '경기 김포시 대곶면 대명항1로 110-36' }
];

export const STAMP_TOUR_SPOTS = {
  seoul: SEOUL_SPOTS,
  busan: BUSAN_SPOTS,
  incheon: INCHEON_SPOTS,
  gyeonggi: GYEONGGI_SPOTS
};

const SVG_REGIONS = new Set(REGIONS.filter((region) => region.active).map((region) => region.id));

const MAP_PROJECTIONS = {
  seoul: {
    width: 1024,
    height: 768,
    bounds: {
      minLon: 126.76448395860741,
      maxLon: 127.18353917115842,
      minLat: 37.42880858693607,
      maxLat: 37.70145528326448,
    },
    scale: 2138.143073189795,
    offsetX: 64.00000000000006,
    offsetY: 92.52117740866623,
  },
  busan: {
    width: 1024,
    height: 768,
    bounds: {
      minLon: 128.76537776085996,
      maxLon: 129.30575263452363,
      minLat: 34.978253171472396,
      maxLat: 35.38903744949351,
    },
    scale: 1557.9953621474976,
    offsetX: 91.0492265054844,
    offsetY: 64,
  },
  incheon: {
    width: 1024,
    height: 768,
    bounds: {
      minLon: 126.08,
      maxLon: 126.83,
      minLat: 37.28,
      maxLat: 37.86,
    },
    scale: 1103.4482758620723,
    offsetX: 98.20689655172293,
    offsetY: 64,
  },
  gyeonggi: {
    width: 1024,
    height: 768,
    bounds: {
      minLon: 126.37899141795003,
      maxLon: 127.84811314078996,
      minLat: 36.89377501763133,
      maxLat: 38.28226054929343,
    },
    scale: 460.93386312342716,
    offsetX: 173.4160244464232,
    offsetY: 64,
  },
};

const getMapImageSrc = (region) => {
  return SVG_REGIONS.has(region) ? `/${region}_map.svg` : '/seoul_map.svg';
};

const getSpotMapUrl = (spot) => (
  `https://map.kakao.com/?q=${encodeURIComponent(`${spot.name} ${spot.address || ''}`.trim())}`
);

const getSpotMapPosition = (region, spot) => {
  const projection = MAP_PROJECTIONS[region];
  if (!projection || !spot.lat || !spot.lng) {
    return { x: spot.x, y: spot.y };
  }

  const x = projection.offsetX + (spot.lng - projection.bounds.minLon) * projection.scale;
  const y = projection.offsetY + (projection.bounds.maxLat - spot.lat) * projection.scale;

  return {
    x: Math.max(0, Math.min(100, (x / projection.width) * 100)),
    y: Math.max(0, Math.min(100, (y / projection.height) * 100)),
  };
};

// 두 좌표 간 거리 계산 함수 (Haversine Formula) - 단위: 미터(m)
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3; // 지구 반지름 (m)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const StampTourTab = ({ isAdmin, initialRegion = 'seoul', focusSpotId = null }) => {
  const supportedInitialRegion = STAMP_TOUR_SPOTS[initialRegion] ? initialRegion : 'seoul';
  const [activeRegion, setActiveRegion] = React.useState(supportedInitialRegion);
  const [visited, setVisited] = React.useState({});
  const [selectedSpot, setSelectedSpot] = React.useState(focusSpotId);
  const [expandedId, setExpandedId] = React.useState(focusSpotId);

  // activeRegion에 따른 로컬스토리지 키 매칭 헬퍼
  const getStorageKey = React.useCallback((region) => {
    return region === 'seoul' ? 'childinfo_stamps_v2' : `childinfo_stamps_${region}`;
  }, []);

  // 활성화된 지역이 변경될 때 알맞은 방문 상태 로드
  React.useEffect(() => {
    try {
      const key = getStorageKey(activeRegion);
      const saved = localStorage.getItem(key);
      setVisited(saved ? JSON.parse(saved) : {});
    } catch (e) {
      setVisited({});
    }
    setExpandedId(null); // 지역 교체 시 상세 펼침 닫음
  }, [activeRegion, getStorageKey]);

  // GPS 관련 상태 관리
  const [userLocation, setUserLocation] = React.useState(null); // { lat, lng }
  const [locationLoading, setLocationLoading] = React.useState(false);
  const [locationError, setLocationError] = React.useState(null);
  
  // 개발자용 가상 위치 시뮬레이션 상태
  const [isMock, setIsMock] = React.useState(false);
  const [mockSpotId, setMockSpotId] = React.useState('');
  const [showDeveloperConsole, setShowDeveloperConsole] = React.useState(false);

  const currentSpots = STAMP_TOUR_SPOTS[activeRegion] || [];

  React.useEffect(() => {
    if (!focusSpotId) return undefined;
    setExpandedId(focusSpotId);
    setSelectedSpot(focusSpotId);
    const timer = window.setTimeout(() => {
      document.getElementById(`spot-card-${focusSpotId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [focusSpotId]);

  // 내 위치 갱신 함수
  const updateLocation = React.useCallback((silent = false) => {
    if (isMock) {
      if (mockSpotId) {
        const spot = currentSpots.find(s => s.id === mockSpotId);
        if (spot) {
          // 가상 위치 적용 (정확한 장소 좌표)
          setUserLocation({ lat: spot.lat, lng: spot.lng });
          setLocationError(null);
        }
      } else {
        // Mock 모드지만 장소가 선택되지 않은 경우 시청 기본 좌표
        const defaultCoords = 
          activeRegion === 'seoul' ? { lat: 37.5665, lng: 126.9780 } :
          activeRegion === 'busan' ? { lat: 35.1796, lng: 129.0756 } :
          activeRegion === 'incheon' ? { lat: 37.4563, lng: 126.7052 } :
          activeRegion === 'gyeonggi' ? { lat: 37.2750, lng: 127.0094 } :
          { lat: 37.5665, lng: 126.9780 };
        setUserLocation(defaultCoords);
        setLocationError(null);
      }
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("이 브라우저 및 디바이스는 GPS 기능을 지원하지 않습니다.");
      return;
    }

    if (!silent) setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
        setLocationLoading(false);
      },
      (error) => {
        let msg = "위치 권한이 거부되었거나 일시적으로 신호를 가져올 수 없습니다.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "기기 또는 브라우저의 GPS 위치 권한을 승인해 주셔야 방문 인증이 가능합니다.";
        }
        setLocationError(msg);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isMock, mockSpotId, currentSpots, activeRegion]);

  // 가상 위치 상태 또는 mockSpotId가 변경될 때 내 위치 갱신
  React.useEffect(() => {
    updateLocation(true);
  }, [isMock, mockSpotId, updateLocation]);

  // 마운트 시 자동 위치 가져오기 시도
  React.useEffect(() => {
    updateLocation(true);
  }, []);

  const toggleVisit = (id) => {
    const isCurrentlyVisited = visited[id];
    
    // 도장을 취소하는 것은 거리 조건 없이 언제나 가능
    if (isCurrentlyVisited) {
      const newVisited = { ...visited, [id]: false };
      setVisited(newVisited);
      localStorage.setItem(getStorageKey(activeRegion), JSON.stringify(newVisited));
      return;
    }

    // 도장을 새로 찍는 경우, GPS 비교 검증 진행
    const spot = currentSpots.find(s => s.id === id);
    if (!spot) return;

    if (!userLocation) {
      alert("현재 위치 정보가 없습니다. 상단의 'GPS 갱신' 버튼을 눌러 위치를 잡아주세요.");
      return;
    }

    const distance = getDistance(userLocation.lat, userLocation.lng, spot.lat, spot.lng);
    
    if (distance === null) {
      alert("거리 계산 오류가 발생했습니다. 다시 시도해 주세요.");
      return;
    }

    if (distance > 200) {
      alert(`해당 장소와의 거리가 너무 멉니다.\n200m 이내에 도달해야 도장을 깨실 수 있습니다.\n(현재 거리: ${(distance / 1000).toFixed(2)} km)`);
      return;
    }

    const newVisited = { ...visited, [id]: true };
    setVisited(newVisited);
    localStorage.setItem(getStorageKey(activeRegion), JSON.stringify(newVisited));
  };

  const visitedCount = Object.values(visited).filter(Boolean).length;
  const progress = currentSpots.length
    ? Math.round((visitedCount / currentSpots.length) * 100)
    : 0;

  const currentRegionData = REGIONS.find(r => r.id === activeRegion);

  // 특정 장소와 사용자 위치 사이의 거리 문자열 포맷팅
  const formatDistanceText = (spot) => {
    if (!userLocation) return { text: "위치 정보 없음", isNear: false, meters: null };
    const meters = getDistance(userLocation.lat, userLocation.lng, spot.lat, spot.lng);
    if (meters === null) return { text: "계산 불가", isNear: false, meters: null };
    
    const isNear = meters <= 200;
    if (meters >= 1000) {
      return { text: `${(meters / 1000).toFixed(1)}km`, isNear, meters };
    }
    return { text: `${Math.round(meters)}m`, isNear, meters };
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24">
      
      {/* 🚀 전국 지역 선택 바 (Horizontal Scroll) */}
      <p className="px-1 text-xs font-bold text-brand-gray-400">
        현재 서울·부산·인천·경기 4개 지역, 총 70개 가족 명소를 운영하고 있어요.
      </p>
      <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
        <div className="flex gap-2 min-w-max pb-2">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => {
                setActiveRegion(region.id);
              }}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-black transition-all duration-300 border-2",
                activeRegion === region.id
                  ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105"
                  : region.id === 'soon'
                    ? "bg-white dark:bg-apple-card border-dashed border-brand-primary/40 text-brand-primary hover:border-brand-primary animate-pulse"
                    : "bg-white dark:bg-apple-card border-[var(--apple-border)] text-brand-gray-400 hover:border-brand-primary/30"
              )}
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentRegionData?.active ? (
          <motion.div 
            key={`${activeRegion}-content`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* 🏅 요약 프로필 */}
            <div className="bg-[var(--apple-card)] dark:bg-apple-card rounded-[2.5rem] p-6 border border-[var(--apple-border)] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Award size={30} />
                </div>
                <div>
                  <h2 className="text-xl font-black dark:text-white">아기랑 놀러가요</h2>
                  <p className="text-xs text-brand-gray-500 font-bold">{visitedCount} / {currentSpots.length} 곳 정복!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-brand-primary italic">{progress}%</div>
                <div className="text-[10px] font-black text-brand-gray-400 mt-1 uppercase tracking-widest">Progress</div>
              </div>
            </div>

            {/* 📍 GPS 정보 안내 패널 */}
            <div className="bg-white/80 dark:bg-apple-card/85 backdrop-blur-md rounded-[2rem] p-5 border border-[var(--apple-border)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  locationLoading ? "bg-brand-primary/10 text-brand-primary animate-spin" :
                  userLocation ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                  locationError ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-brand-gray-100 text-brand-gray-400"
                )}>
                  <Compass size={20} className={cn(!locationLoading && "animate-pulse")} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black dark:text-white">GPS 실제 방문 인증 모드</span>
                    {isMock && (
                      <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-500/20">
                        가상 위치 활성화
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-gray-400 font-bold mt-0.5">
                    {locationLoading ? "GPS 신호를 받는 중입니다..." :
                     locationError ? locationError :
                     userLocation ? `현재 수신 위상태: 정상 (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})` :
                     "상단의 갱신 버튼을 눌러 GPS 신호를 받아주세요."}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => updateLocation(false)}
                disabled={locationLoading}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary dark:text-brand-primary rounded-xl text-xs font-black transition-all border border-brand-primary/10 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={cn(locationLoading && "animate-spin")} />
                {locationLoading ? "연결 중..." : "GPS 갱신"}
              </button>
            </div>

            {/* 🗺️ 동적 지역 지도 컨테이너 */}
            <div className="relative aspect-[4/3] w-full bg-[#D8ECF0] dark:bg-[#1A2E35] rounded-[3.5rem] border-[8px] border-white dark:border-apple-border shadow-2xl overflow-hidden ring-1 ring-black/5 group">
              <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
                <img 
                  src={getMapImageSrc(activeRegion)} 
                  alt={`${currentRegionData.name} Map`} 
                  className="w-full h-full object-cover opacity-90 dark:opacity-60" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-transparent pointer-events-none" />
              </div>

              {currentSpots.map((spot) => {
                const distInfo = formatDistanceText(spot);
                const mapPosition = getSpotMapPosition(activeRegion, spot);
                return (
                  <motion.div key={spot.id} style={{ left: `${mapPosition.x}%`, top: `${mapPosition.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="relative flex flex-col items-center">
                      <AnimatePresence>{visited[spot.id] && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.6, opacity: 1 }} className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl -z-10" />}</AnimatePresence>
                      <AnimatePresence>{(selectedSpot === spot.id) && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: -10 }} className="absolute -top-10 sm:-top-16 bg-white/95 dark:bg-apple-card/95 backdrop-blur-md px-2 py-1 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-2xl border border-white/50 whitespace-nowrap z-30 flex flex-col items-center gap-0.5">
                          <span className="text-[9px] sm:text-xs font-black dark:text-white flex items-center gap-1.5">{spot.name}</span>
                          <span className={cn(
                            "text-[7px] sm:text-[10px] font-black",
                            distInfo.isNear ? "text-emerald-500" : "text-brand-gray-400"
                          )}>
                            {distInfo.isNear ? `🎯 도달 완료 (${distInfo.text})` : `📍 내 위치에서 ${distInfo.text}`}
                          </span>
                          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/95 dark:bg-apple-card/95 border-r border-b border-white/50 rotate-45" />
                        </motion.div>
                      )}</AnimatePresence>
                      <motion.button 
                        whileHover={{ scale: 1.12, y: -4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 12 }}
                        onClick={() => { 
                          if (!visited[spot.id]) {
                            // 방문 처리 전이라면 디테일 뷰를 펼치도록 설정 (직접 터치 스탬프 우회 불가 유도)
                            setExpandedId(spot.id);
                            // 화면 내 스크롤 이동 처리
                            const element = document.getElementById(`spot-card-${spot.id}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          } else {
                            toggleVisit(spot.id);
                          }
                        }} 
                        onMouseEnter={() => setSelectedSpot(spot.id)} 
                        onMouseLeave={() => setSelectedSpot(null)} 
                        className={cn(
                          "relative px-1.5 py-0.5 sm:px-3 sm:py-1.5 flex items-center gap-0.5 sm:gap-1.5 rounded-full border sm:border-2 bg-white/95 dark:bg-apple-card/95 shadow-md transition-all duration-300", 
                          visited[spot.id] 
                            ? "border-brand-primary text-brand-primary shadow-lg shadow-brand-primary/10 drop-shadow-[0_0_8px_rgba(240,68,82,0.25)]" 
                            : "border-brand-primary/10 hover:border-brand-primary/40 text-brand-gray-700 dark:text-brand-gray-300"
                        )}
                      >
                        <span className="text-[11px] sm:text-xl select-none">{spot.emoji}</span>
                        <span className={cn(
                          "text-[8px] sm:text-[10px] font-black whitespace-nowrap tracking-tight",
                          visited[spot.id] ? "text-brand-primary" : "text-brand-gray-700 dark:text-brand-gray-200"
                        )}>
                          {spot.name}
                        </span>
                        {visited[spot.id] && (
                          <motion.div 
                            initial={{ scale: 2 }} 
                            animate={{ scale: 1 }} 
                            className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 w-3.5 h-3.5 sm:w-5 sm:h-5 bg-brand-primary rounded-full border border-white flex items-center justify-center shadow-md"
                          >
                            <Star className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 text-white" fill="white" />
                          </motion.div>
                        )}
                      </motion.button>
                      <div className="w-6 sm:w-8 h-0.5 sm:h-1 bg-black/10 dark:bg-black/35 rounded-full mt-1.5 blur-[1.5px]" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* 📋 리스트 가이드 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
                  <Info size={18} className="text-brand-primary" />장소별 상세 정보
                </h3>
              </div>
              <div className="space-y-3">
                {currentSpots.map((spot) => {
                  const distInfo = formatDistanceText(spot);
                  const isExpanded = expandedId === spot.id;
                  
                  return (
                    <div 
                      key={spot.id} 
                      id={`spot-card-${spot.id}`}
                      className={cn(
                        "overflow-hidden rounded-[2.5rem] border-2 transition-all duration-300", 
                        isExpanded ? "bg-white dark:bg-apple-card border-brand-primary shadow-xl scale-[1.01]" : "bg-[var(--apple-card)] dark:bg-apple-card border-[var(--apple-border)] hover:border-brand-primary/30"
                      )}
                    >
                      <div onClick={() => setExpandedId(isExpanded ? null : spot.id)} className="flex items-center gap-4 p-5 cursor-pointer group">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-4xl shadow-sm transition-transform group-hover:scale-110", visited[spot.id] ? "bg-white" : "bg-brand-gray-50 dark:bg-apple-elevated opacity-70")}>{spot.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("font-black text-[15px] dark:text-white truncate flex items-center gap-2", visited[spot.id] && "text-brand-primary")}>
                            {spot.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-brand-gray-400 font-bold">{spot.category}</span>
                            <span className="text-[10px] text-brand-gray-300">•</span>
                            <span className={cn(
                              "text-xs font-black flex items-center gap-1",
                              distInfo.isNear ? "text-emerald-500" : "text-brand-gray-400"
                            )}>
                              <MapPin size={10} />
                              {distInfo.text} {distInfo.isNear && "🎯"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {visited[spot.id] && <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white"><Star size={14} fill="white" /></div>}
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}><ChevronDown size={20} className="text-brand-gray-300" /></motion.div>
                        </div>
                      </div>
                      <AnimatePresence>{isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 pt-2 border-t border-brand-gray-50 dark:border-apple-border">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                              
                              {/* 현재 내 위치 정보 카드 */}
                              <div className={cn(
                                "flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-300",
                                distInfo.isNear ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-800 dark:text-emerald-400" :
                                "bg-brand-gray-50 dark:bg-apple-elevated border-brand-gray-100 dark:border-apple-border text-brand-gray-600"
                              )}>
                                {distInfo.isNear ? <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" /> : <MapPin size={18} className="text-brand-gray-400 mt-0.5" />}
                                <div className="flex-1">
                                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">GPS Distance Verification</p>
                                  <p className="text-xs font-bold mt-0.5">
                                    {distInfo.isNear ? (
                                      `현재 반경 이내 도달함! 도장 깨기 인증이 가능합니다. (거리: ${distInfo.text})`
                                    ) : (
                                      `이 장소는 현재 내 위치로부터 약 ${distInfo.text} 거리에 있습니다. 인증 조건(200m)을 만족해야 합니다.`
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl"><MapPin size={16} className="text-brand-primary mt-0.5" /><div><p className="text-[10px] font-black text-brand-gray-400 uppercase">Address</p><p className="text-xs font-bold dark:text-white">{spot.address}</p></div></div>
                              <div className="flex items-center justify-between"><div className="flex items-start gap-3 p-3 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl flex-1 mr-2"><Phone size={16} className="text-brand-blue mt-0.5" /><div><p className="text-[10px] font-black text-brand-gray-400 uppercase">Contact</p><p className="text-xs font-bold dark:text-white">{spot.phone}</p></div></div><div className="flex items-start gap-3 p-3 bg-brand-primary/5 rounded-2xl flex-1"><Baby size={16} className="text-brand-primary mt-0.5" /><div><p className="text-[10px] font-black text-brand-gray-400 uppercase">Baby Lounge</p><p className="text-xs font-bold dark:text-white">{spot.babyRoom}</p></div></div></div>
                              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/20"><AlertCircle size={16} className="text-yellow-600 mt-0.5" /><div><p className="text-[10px] font-black text-yellow-700 uppercase">Pro Tips</p><p className="text-xs font-bold text-yellow-900 dark:text-yellow-200">{spot.notes}</p></div></div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => toggleVisit(spot.id)} 
                                disabled={!visited[spot.id] && !distInfo.isNear}
                                className={cn(
                                  "flex-1 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95", 
                                  visited[spot.id] 
                                    ? "bg-brand-gray-100 dark:bg-apple-elevated text-brand-gray-500 hover:bg-brand-gray-200" 
                                    : distInfo.isNear
                                      ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                      : "bg-brand-gray-100 dark:bg-apple-elevated text-brand-gray-400 cursor-not-allowed border border-brand-gray-200/50"
                                )}
                              >
                                {visited[spot.id] 
                                  ? "방문 취소하기" 
                                  : distInfo.isNear 
                                    ? "방문 완료 (스탬프 찍기)" 
                                    : "200m 이내 실제 방문 시 스탬프 획득 가능"}
                              </button>
                              <a
                                href={getSpotMapUrl(spot)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${spot.name} 지도에서 열기`}
                                className="w-14 h-14 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl flex items-center justify-center text-brand-gray-500 hover:bg-brand-gray-100 transition-colors"
                              >
                                <ExternalLink size={20} />
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}</AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🛠️ 가상 위치 테스터 (Mock Location Simulator) - 관리자 전용 */}
            {isAdmin && (
              <div className="mt-8 bg-gradient-to-br from-amber-500/5 to-amber-600/10 dark:from-amber-950/10 dark:to-amber-900/5 border border-amber-500/20 rounded-[2.5rem] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                      <Sliders size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[15px] font-black dark:text-white">개발자 가상 위치 시뮬레이터</h4>
                      <p className="text-xs text-brand-gray-400 font-bold">브라우저나 PC 환경에서 GPS 방문 동작을 편리하게 테스트해보세요.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDeveloperConsole(!showDeveloperConsole)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 transition-colors active:scale-95 shadow-sm"
                  >
                    {showDeveloperConsole ? "닫기" : "도구 열기"}
                  </button>
                </div>

                <AnimatePresence>
                  {showDeveloperConsole && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      className="overflow-hidden mt-4 pt-4 border-t border-amber-500/20 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white/50 dark:bg-apple-card/50 backdrop-blur-sm rounded-2xl">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="mock-toggle" 
                            checked={isMock}
                            onChange={(e) => {
                              setIsMock(e.target.checked);
                              if (!e.target.checked) setMockSpotId('');
                            }}
                            className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                          />
                          <label htmlFor="mock-toggle" className="text-xs font-black dark:text-white cursor-pointer select-none">
                            가상 위치(Mock Location) 기능 활성화
                          </label>
                        </div>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                          {isMock ? "🔴 시뮬레이터 작동 중" : "⚪ 실제 GPS 기기 신호 대기"}
                        </span>
                      </div>

                      {isMock && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                            내 가상 위치를 지정할 {currentRegionData.name} 명소 선택:
                          </label>
                          <div className="flex gap-2">
                            <select 
                              value={mockSpotId} 
                              onChange={(e) => setMockSpotId(e.target.value)}
                              className="flex-1 bg-white dark:bg-apple-elevated border border-amber-500/30 text-xs font-bold rounded-2xl px-4 py-3 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              <option value="">-- {currentRegionData.name}청 기본 좌표 (가상) --</option>
                              {currentSpots.map(spot => (
                                <option key={spot.id} value={spot.id}>
                                  {spot.emoji} {spot.name} (바로 앞 순간 이동)
                                </option>
                              ))}
                            </select>
                            <button 
                              onClick={() => {
                                // 강제 갱신
                                updateLocation(false);
                              }}
                              className="px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-2xl font-black text-xs transition-colors active:scale-95"
                            >
                              적용
                            </button>
                          </div>
                          <p className="text-[10px] text-brand-gray-400 font-bold leading-normal">
                            💡 **가상 위치 작동 팁**: 
                            선택한 장소로 가상 위치를 적용하면, 내 현재 GPS가 해당 명소의 좌표로 매핑됩니다. 
                            그 후 리스트에서 해당 장소를 펼쳐 **'방문 완료'** 버튼을 누르시면 정상적으로 스탬프가 찍힙니다!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </motion.div>
        ) : (
          <motion.div 
            key="coming-soon"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 md:p-8 flex flex-col items-center text-center space-y-6 bg-[var(--apple-card)] dark:bg-apple-card rounded-[3.5rem] border-2 border-dashed border-[var(--apple-border)]"
          >
            <div className="relative aspect-[4/3] w-full max-w-3xl bg-[#E2E8F0] dark:bg-apple-black rounded-[2.5rem] border-[6px] border-white dark:border-apple-border shadow-xl overflow-hidden ring-1 ring-black/5">
              <img
                src={getMapImageSrc(activeRegion)}
                alt={`${currentRegionData.name} Map Preview`}
                className="w-full h-full object-cover opacity-80 dark:opacity-55"
              />
              <div className="absolute inset-0 bg-white/35 dark:bg-black/25 backdrop-blur-[1px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/90 dark:bg-apple-card/90 rounded-[2rem] flex items-center justify-center text-brand-primary shadow-xl">
                  <Hammer size={48} className="animate-bounce" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black dark:text-white">전국 투어 확대 준비 중!</h3>
              <p className="text-brand-gray-400 font-bold mt-2 px-4">검증된 가족 명소와 GPS 스탬프 코스가 준비된 지역부터 순서대로 열 예정입니다.<br/>현재는 서울·부산·인천·경기 투어를 이용해 주세요.</p>
            </div>
            <button 
              onClick={() => setActiveRegion('seoul')}
              className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              운영 중인 서울 투어 보기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default StampTourTab;
