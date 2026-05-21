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
  XCircle
} from 'lucide-react';
import { cn } from '../../utils/uiUtils';

// 전국 광역자치단체 리스트
const REGIONS = [
  { id: 'seoul', name: '서울특별시', active: true },
  { id: 'busan', name: '부산광역시', active: true },
  { id: 'daegu', name: '대구광역시', active: false },
  { id: 'incheon', name: '인천광역시', active: false },
  { id: 'gwangju', name: '광주광역시', active: false },
  { id: 'daejeon', name: '대전광역시', active: false },
  { id: 'ulsan', name: '울산광역시', active: false },
  { id: 'sejong', name: '세종특별자치시', active: false },
  { id: 'gyeonggi', name: '경기도', active: false },
  { id: 'gangwon', name: '강원특별자치도', active: false },
  { id: 'chungbuk', name: '충청북도', active: false },
  { id: 'chungnam', name: '충청남도', active: false },
  { id: 'jeonbuk', name: '전북특별자치도', active: false },
  { id: 'jeonnam', name: '전라남도', active: false },
  { id: 'gyeongbuk', name: '경상북도', active: false },
  { id: 'gyeongnam', name: '경상남도', active: false },
  { id: 'jeju', name: '제주특별자치도', active: false },
];

const SEOUL_SPOTS = [
  { id: 'spot8', name: '경복궁', category: '역사/고궁', x: 48, y: 35, emoji: '🏯', phone: '02-3700-3900', babyRoom: '있음 (입구 근처)', notes: '유모차 대여 가능, 광화문 교대식 관람 추천', lat: 37.5796, lng: 126.9770 },
  { id: 'spot1', name: '국립중앙박물관 어린이박물관', category: '박물관', x: 50, y: 55, emoji: '🏛️', phone: '02-2077-9000', babyRoom: '있음 (매우 쾌적)', notes: '사전 온라인 예약 필수, 무료 관람', lat: 37.5238, lng: 126.9804 },
  { id: 'spot14', name: '남산서울타워', category: '랜드마크', x: 52, y: 45, emoji: '🗼', phone: '02-3455-9277', babyRoom: '있음', notes: '케이블카 이용 시 유모차는 접어서 탑승 가능', lat: 37.5511, lng: 126.9882 },
  { id: 'spot2', name: '서울어린이대공원', category: '공원/동물원', x: 74, y: 40, emoji: '🎢', phone: '02-450-9311', babyRoom: '곳곳에 위치', notes: '동물원과 식물원이 무료, 주말 주차 혼잡 주의', lat: 37.5480, lng: 127.0810 },
  { id: 'spot7', name: '서울숲', category: '공원', x: 65, y: 50, emoji: '🦌', phone: '02-460-2905', babyRoom: '방문자센터 내 위치', notes: '사슴 먹이주기 체험 가능, 돗자리 필수', lat: 37.5443, lng: 127.0374 },
  { id: 'spot11', name: '올림픽공원', category: '공원', x: 84, y: 65, emoji: '🏃', phone: '02-410-1114', babyRoom: '있음', notes: '나홀로나무 포토존 인기, 한성백제박물관과 인접', lat: 37.5207, lng: 127.1215 },
  { id: 'spot15', name: '롯데월드 어드벤처', category: '테마파크', x: 81, y: 72, emoji: '🏰', phone: '1661-2000', babyRoom: '있음 (매직아일랜드 입구)', notes: '베이비권 이용 시 영유아 놀이기구 무제한', lat: 37.5111, lng: 127.0982 },
  { id: 'spot16', name: '코엑스 아쿠아리움', category: '아쿠아리움', x: 72, y: 70, emoji: '🦈', phone: '02-700-7200', babyRoom: '있음', notes: '스타필드 코엑스몰 내 위치, 유모차 통행 원활', lat: 37.5131, lng: 127.0586 },
  { id: 'spot20', name: '서울식물원', category: '식물원', x: 18, y: 50, emoji: '🌵', phone: '02-2104-9716', babyRoom: '있음 (온실 입구)', notes: '온실 내부가 더우니 가벼운 옷차림 추천', lat: 37.5693, lng: 126.8353 },
  { id: 'spot5', name: '국립항공박물관', category: '박물관', x: 12, y: 55, emoji: '✈️', phone: '02-6328-9000', babyRoom: '있음', notes: '기내 훈련 체험 등 예약 프로그램 인기', lat: 37.5593, lng: 126.8023 },
  { id: 'spot6', name: '서대문자연사박물관', category: '박물관', x: 38, y: 38, emoji: '🦖', phone: '02-330-8899', babyRoom: '있음', notes: '입구의 커다란 공룡 미끄럼틀이 아이들에게 인기', lat: 37.5753, lng: 126.9367 },
  { id: 'spot12', name: '전쟁기념관 어린이박물관', category: '박물관', x: 49, y: 51, emoji: '🎖️', phone: '02-709-3114', babyRoom: '있음', notes: '야외에 실제 비행기와 탱크가 전시되어 있음', lat: 37.5366, lng: 126.9772 },
  { id: 'spot10', name: '북서울꿈의숲', category: '공원', x: 68, y: 22, emoji: '🪁', phone: '02-2289-4001', babyRoom: '있음', notes: '사슴 방목장과 상상어린이놀이터 추천', lat: 37.6217, lng: 127.0422 },
  { id: 'spot13', name: '서울시립과학관', category: '과학관', x: 78, y: 16, emoji: '🧪', phone: '02-970-4500', babyRoom: '있음', notes: '아이들이 직접 만지고 체험하는 전시가 많음', lat: 37.6328, lng: 127.0747 },
  { id: 'spot17', name: '은평역사한옥박물관', category: '박물관', x: 32, y: 16, emoji: '🏠', phone: '02-351-8524', babyRoom: '있음', notes: '한옥마을 산책과 연계하기 좋음', lat: 37.6393, lng: 126.9370 },
  { id: 'spot18', name: '한성백제박물관', category: '박물관', x: 86, y: 76, emoji: '🏺', phone: '02-2152-5800', babyRoom: '있음', notes: '올림픽공원 남쪽에 위치, 주차 편리', lat: 37.5173, lng: 127.1226 },
  { id: 'spot19', name: '돈의문박물관마을', category: '테마마을', x: 44, y: 38, emoji: '🏘️', phone: '02-739-6900', babyRoom: '있음', notes: '옛 추억의 골목 놀이 체험 가능', lat: 37.5684, lng: 126.9686 },
  { id: 'spot3', name: '서울공예박물관 어린이박물관', category: '박물관', x: 51, y: 36, emoji: '🎨', phone: '02-6450-7000', babyRoom: '있음', notes: '창의적인 공예 체험 가능, 예약 필수', lat: 37.5756, lng: 126.9830 },
  { id: 'spot4', name: '서울상상나라', category: '체험관', x: 75, y: 38, emoji: '💡', phone: '02-6450-9500', babyRoom: '매우 잘되어 있음', notes: '영유아 전용 놀이 공간이 따로 분리됨', lat: 37.5492, lng: 127.0808 },
  { id: 'spot9', name: '창경궁 대온실', category: '역사/식물원', x: 53, y: 34, emoji: '🌿', phone: '02-762-4868', babyRoom: '창경궁 입구 위치', notes: '겨울에도 따뜻하게 아이와 꽃 구경 가능', lat: 37.5818, lng: 126.9950 }
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

const StampTourTab = () => {
  const [activeRegion, setActiveRegion] = React.useState('seoul');
  const [visited, setVisited] = React.useState({});
  const [selectedSpot, setSelectedSpot] = React.useState(null);
  const [expandedId, setExpandedId] = React.useState(null);

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
  


  // 내 위치 갱신 함수
  const updateLocation = React.useCallback((silent = false) => {
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
  }, []);



  // 마운트 시 자동 위치 가져오기 시도
  React.useEffect(() => {
    updateLocation(true);
  }, []);

  const toggleVisit = (id) => {
    const isCurrentlyVisited = visited[id];
    const currentSpots = activeRegion === 'seoul' ? SEOUL_SPOTS : BUSAN_SPOTS;
    
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

  const currentSpots = activeRegion === 'seoul' ? SEOUL_SPOTS : BUSAN_SPOTS;
  const visitedCount = Object.values(visited).filter(Boolean).length;
  const progress = Math.round((visitedCount / currentSpots.length) * 100);

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
      <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
        <div className="flex gap-2 min-w-max pb-2">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => setActiveRegion(region.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-black transition-all duration-300 border-2",
                activeRegion === region.id
                  ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105"
                  : "bg-white dark:bg-apple-card border-[var(--apple-border)] text-brand-gray-400 hover:border-brand-primary/30"
              )}
            >
              {region.name}
              {!region.active && <span className="ml-1 opacity-50 text-[9px] font-bold">Soon</span>}
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
            <div className="relative aspect-[4/3] w-full bg-[#E2E8F0] dark:bg-apple-black rounded-[3.5rem] border-[8px] border-white dark:border-apple-border shadow-2xl overflow-hidden ring-1 ring-black/5 group">
              <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
                <img src={activeRegion === 'seoul' ? '/seoul_map.png' : '/busan_map.png'} alt={`${currentRegionData.name} Map`} className="w-full h-full object-cover opacity-90 dark:opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-transparent pointer-events-none" />
              </div>

              {currentSpots.map((spot) => {
                const distInfo = formatDistanceText(spot);
                return (
                  <motion.div key={spot.id} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="relative flex flex-col items-center">
                      <AnimatePresence>{visited[spot.id] && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.6, opacity: 1 }} className="absolute inset-0 bg-brand-primary/30 rounded-full blur-xl -z-10" />}</AnimatePresence>
                      <AnimatePresence>{(selectedSpot === spot.id) && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: -10 }} className="absolute -top-16 bg-white/90 dark:bg-apple-card/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-white/50 whitespace-nowrap z-30 flex flex-col items-center gap-0.5">
                          <span className="text-xs font-black dark:text-white flex items-center gap-1.5">{spot.name}</span>
                          <span className={cn(
                            "text-[10px] font-black",
                            distInfo.isNear ? "text-emerald-500" : "text-brand-gray-400"
                          )}>
                            {distInfo.isNear ? `🎯 도달 완료 (${distInfo.text})` : `📍 내 위치에서 ${distInfo.text}`}
                          </span>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/90 dark:bg-apple-card/90 border-r border-b border-white/50 rotate-45" />
                        </motion.div>
                      )}</AnimatePresence>
                      <motion.button 
                        whileHover={{ scale: 1.3 }} 
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
                          "relative w-12 h-12 flex items-center justify-center transition-all duration-500", 
                          visited[spot.id] ? "drop-shadow-[0_0_12px_rgba(240,68,82,0.6)]" : "grayscale-[0.6] opacity-70 hover:grayscale-0 hover:opacity-100"
                        )}
                      >
                        <span className="text-4xl select-none">{spot.emoji}</span>
                        {visited[spot.id] && <motion.div initial={{ scale: 2 }} animate={{ scale: 1 }} className="absolute -right-1 -bottom-1 w-6 h-6 bg-brand-primary rounded-full border-2 border-white flex items-center justify-center shadow-lg"><Star size={12} fill="white" className="text-white" /></motion.div>}
                      </motion.button>
                      <div className="w-3 h-1 bg-black/20 rounded-full mt-0.5 blur-[1px]" />
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
                              <button className="w-14 h-14 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl flex items-center justify-center text-brand-gray-500 hover:bg-brand-gray-100 transition-colors"><ExternalLink size={20} /></button>
                            </div>
                          </div>
                        </motion.div>
                      )}</AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>


          </motion.div>
        ) : (
          <motion.div 
            key="coming-soon"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-20 flex flex-col items-center text-center space-y-6 bg-[var(--apple-card)] dark:bg-apple-card rounded-[3.5rem] border-2 border-dashed border-[var(--apple-border)]"
          >
            <div className="w-24 h-24 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center text-brand-primary">
              <Hammer size={48} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-2xl font-black dark:text-white">{currentRegionData.name} 투어 준비 중!</h3>
              <p className="text-brand-gray-400 font-bold mt-2 px-10">현재 서울 지역 보물들만 공개되었어요.<br/>{currentRegionData.name}의 멋진 장소들도 곧 찾아올게요!</p>
            </div>
            <button 
              onClick={() => setActiveRegion('seoul')}
              className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              서울특별시 투어 먼저 하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default StampTourTab;

