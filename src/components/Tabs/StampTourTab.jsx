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
  Hammer
} from 'lucide-react';
import { cn } from '../../utils/uiUtils';

// 전국 광역자치단체 리스트
const REGIONS = [
  { id: 'seoul', name: '서울특별시', active: true },
  { id: 'busan', name: '부산광역시', active: false },
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
  { id: 'spot8', name: '경복궁', category: '역사/고궁', x: 48, y: 35, emoji: '🏯', phone: '02-3700-3900', babyRoom: '있음 (입구 근처)', notes: '유모차 대여 가능, 광화문 교대식 관람 추천' },
  { id: 'spot1', name: '국립중앙박물관 어린이박물관', category: '박물관', x: 50, y: 55, emoji: '🏛️', phone: '02-2077-9000', babyRoom: '있음 (매우 쾌적)', notes: '사전 온라인 예약 필수, 무료 관람' },
  { id: 'spot14', name: '남산서울타워', category: '랜드마크', x: 52, y: 45, emoji: '🗼', phone: '02-3455-9277', babyRoom: '있음', notes: '케이블카 이용 시 유모차는 접어서 탑승 가능' },
  { id: 'spot2', name: '서울어린이대공원', category: '공원/동물원', x: 74, y: 40, emoji: '🎢', phone: '02-450-9311', babyRoom: '곳곳에 위치', notes: '동물원과 식물원이 무료, 주말 주차 혼잡 주의' },
  { id: 'spot7', name: '서울숲', category: '공원', x: 65, y: 50, emoji: '🦌', phone: '02-460-2905', babyRoom: '방문자센터 내 위치', notes: '사슴 먹이주기 체험 가능, 돗자리 필수' },
  { id: 'spot11', name: '올림픽공원', category: '공원', x: 84, y: 65, emoji: '🏃', phone: '02-410-1114', babyRoom: '있음', notes: '나홀로나무 포토존 인기, 한성백제박물관과 인접' },
  { id: 'spot15', name: '롯데월드 어드벤처', category: '테마파크', x: 81, y: 72, emoji: '🏰', phone: '1661-2000', babyRoom: '있음 (매직아일랜드 입구)', notes: '베이비권 이용 시 영유아 놀이기구 무제한' },
  { id: 'spot16', name: '코엑스 아쿠아리움', category: '아쿠아리움', x: 72, y: 70, emoji: '🦈', phone: '02-700-7200', babyRoom: '있음', notes: '스타필드 코엑스몰 내 위치, 유모차 통행 원활' },
  { id: 'spot20', name: '서울식물원', category: '식물원', x: 18, y: 50, emoji: '🌵', phone: '02-2104-9716', babyRoom: '있음 (온실 입구)', notes: '온실 내부가 더우니 가벼운 옷차림 추천' },
  { id: 'spot5', name: '국립항공박물관', category: '박물관', x: 12, y: 55, emoji: '✈️', phone: '02-6328-9000', babyRoom: '있음', notes: '기내 훈련 체험 등 예약 프로그램 인기' },
  { id: 'spot6', name: '서대문자연사박물관', category: '박물관', x: 38, y: 38, emoji: '🦖', phone: '02-330-8899', babyRoom: '있음', notes: '입구의 커다란 공룡 미끄럼틀이 아이들에게 인기' },
  { id: 'spot12', name: '전쟁기념관 어린이박물관', category: '박물관', x: 49, y: 51, emoji: '🎖️', phone: '02-709-3114', babyRoom: '있음', notes: '야외에 실제 비행기와 탱크가 전시되어 있음' },
  { id: 'spot10', name: '북서울꿈의숲', category: '공원', x: 68, y: 22, emoji: '🪁', phone: '02-2289-4001', babyRoom: '있음', notes: '사슴 방목장과 상상어린이놀이터 추천' },
  { id: 'spot13', name: '서울시립과학관', category: '과학관', x: 78, y: 16, emoji: '🧪', phone: '02-970-4500', babyRoom: '있음', notes: '아이들이 직접 만지고 체험하는 전시가 많음' },
  { id: 'spot17', name: '은평역사한옥박물관', category: '박물관', x: 32, y: 16, emoji: '🏠', phone: '02-351-8524', babyRoom: '있음', notes: '한옥마을 산책과 연계하기 좋음' },
  { id: 'spot18', name: '한성백제박물관', category: '박물관', x: 86, y: 76, emoji: '🏺', phone: '02-2152-5800', babyRoom: '있음', notes: '올림픽공원 남쪽에 위치, 주차 편리' },
  { id: 'spot19', name: '돈의문박물관마을', category: '테마마을', x: 44, y: 38, emoji: '🏘️', phone: '02-739-6900', babyRoom: '있음', notes: '옛 추억의 골목 놀이 체험 가능' },
  { id: 'spot3', name: '서울공예박물관 어린이박물관', category: '박물관', x: 51, y: 36, emoji: '🎨', phone: '02-6450-7000', babyRoom: '있음', notes: '창의적인 공예 체험 가능, 예약 필수' },
  { id: 'spot4', name: '서울상상나라', category: '체험관', x: 75, y: 38, emoji: '💡', phone: '02-6450-9500', babyRoom: '매우 잘되어 있음', notes: '영유아 전용 놀이 공간이 따로 분리됨' },
  { id: 'spot9', name: '창경궁 대온실', category: '역사/식물원', x: 53, y: 34, emoji: '🌿', phone: '02-762-4868', babyRoom: '창경궁 입구 위치', notes: '겨울에도 따뜻하게 아이와 꽃 구경 가능' },
];

const StampTourTab = () => {
  const [activeRegion, setActiveRegion] = React.useState('seoul');
  const [visited, setVisited] = React.useState(() => {
    try {
      const saved = localStorage.getItem('childinfo_stamps_v2'); // 버전 분리
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const [selectedSpot, setSelectedSpot] = React.useState(null);
  const [expandedId, setExpandedId] = React.useState(null);

  const toggleVisit = (id) => {
    const newVisited = { ...visited, [id]: !visited[id] };
    setVisited(newVisited);
    localStorage.setItem('childinfo_stamps_v2', JSON.stringify(newVisited));
  };

  const visitedCount = Object.values(visited).filter(Boolean).length;
  const progress = Math.round((visitedCount / SEOUL_SPOTS.length) * 100);

  const currentRegionData = REGIONS.find(r => r.id === activeRegion);

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
        {activeRegion === 'seoul' ? (
          <motion.div 
            key="seoul-content"
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
                  <p className="text-xs text-brand-gray-500 font-bold">{visitedCount} / {SEOUL_SPOTS.length} 곳 정복!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-brand-primary italic">{progress}%</div>
                <div className="text-[10px] font-black text-brand-gray-400 mt-1 uppercase tracking-widest">Progress</div>
              </div>
            </div>

            {/* 🗺️ 서울 지도 컨테이너 */}
            <div className="relative aspect-[4/3] w-full bg-[#E2E8F0] dark:bg-apple-black rounded-[3.5rem] border-[8px] border-white dark:border-apple-border shadow-2xl overflow-hidden ring-1 ring-black/5 group">
              <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
                <img src="/seoul_map.png" alt="Seoul Map" className="w-full h-full object-cover opacity-90 dark:opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-transparent pointer-events-none" />
              </div>

              {SEOUL_SPOTS.map((spot) => (
                <motion.div key={spot.id} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative flex flex-col items-center">
                    <AnimatePresence>{visited[spot.id] && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.6, opacity: 1 }} className="absolute inset-0 bg-brand-primary/30 rounded-full blur-xl -z-10" />}</AnimatePresence>
                    <AnimatePresence>{(selectedSpot === spot.id) && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: -10 }} className="absolute -top-12 bg-white/90 dark:bg-apple-card/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-white/50 whitespace-nowrap z-30">
                        <span className="text-xs font-black dark:text-white flex items-center gap-2">{spot.name}</span>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/90 dark:bg-apple-card/90 border-r border-b border-white/50 rotate-45" />
                      </motion.div>
                    )}</AnimatePresence>
                    <motion.button whileHover={{ scale: 1.3 }} onClick={() => { toggleVisit(spot.id); setExpandedId(spot.id); }} onMouseEnter={() => setSelectedSpot(spot.id)} onMouseLeave={() => setSelectedSpot(null)} className={cn("relative w-12 h-12 flex items-center justify-center transition-all duration-500", visited[spot.id] ? "drop-shadow-[0_0_12px_rgba(240,68,82,0.6)]" : "grayscale-[0.6] opacity-70 hover:grayscale-0 hover:opacity-100")}>
                      <span className="text-4xl select-none">{spot.emoji}</span>
                      {visited[spot.id] && <motion.div initial={{ scale: 2 }} animate={{ scale: 1 }} className="absolute -right-1 -bottom-1 w-6 h-6 bg-brand-primary rounded-full border-2 border-white flex items-center justify-center shadow-lg"><Star size={12} fill="white" className="text-white" /></motion.div>}
                    </motion.button>
                    <div className="w-3 h-1 bg-black/20 rounded-full mt-0.5 blur-[1px]" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 📋 리스트 가이드 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-lg font-black dark:text-white flex items-center gap-2"><Info size={18} className="text-brand-primary" />장소별 상세 정보</h3>
              </div>
              <div className="space-y-3">
                {SEOUL_SPOTS.map((spot) => (
                  <div key={spot.id} className={cn("overflow-hidden rounded-[2.5rem] border-2 transition-all duration-300", expandedId === spot.id ? "bg-white dark:bg-apple-card border-brand-primary shadow-xl" : "bg-[var(--apple-card)] dark:bg-apple-card border-[var(--apple-border)] hover:border-brand-primary/30")}>
                    <div onClick={() => setExpandedId(expandedId === spot.id ? null : spot.id)} className="flex items-center gap-4 p-5 cursor-pointer group">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-4xl shadow-sm transition-transform group-hover:scale-110", visited[spot.id] ? "bg-white" : "bg-brand-gray-50 dark:bg-apple-elevated opacity-70")}>{spot.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className={cn("font-black text-[15px] dark:text-white truncate", visited[spot.id] && "text-brand-primary")}>{spot.name}</h4>
                        <p className="text-xs text-brand-gray-400 font-bold">{spot.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {visited[spot.id] && <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white"><Star size={14} fill="white" /></div>}
                        <motion.div animate={{ rotate: expandedId === spot.id ? 180 : 0 }}><ChevronDown size={20} className="text-brand-gray-300" /></motion.div>
                      </div>
                    </div>
                    <AnimatePresence>{expandedId === spot.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 pt-2 border-t border-brand-gray-50 dark:border-apple-border">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-start gap-3 p-3 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl"><MapPin size={16} className="text-brand-primary mt-0.5" /><div><p className="text-[10px] font-black text-brand-gray-400 uppercase">Address</p><p className="text-xs font-bold dark:text-white">{spot.address}</p></div></div>
                            <div className="flex items-center justify-between"><div className="flex items-start gap-3 p-3 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl flex-1 mr-2"><Phone size={16} className="text-brand-blue mt-0.5" /><div><p className="text-[10px] font-black text-brand-gray-400 uppercase">Contact</p><p className="text-xs font-bold dark:text-white">{spot.phone}</p></div></div><div className="flex items-start gap-3 p-3 bg-brand-primary/5 rounded-2xl flex-1"><Baby size={16} className="text-brand-primary mt-0.5" /><div><p className="text-[10px] font-black text-brand-gray-400 uppercase">Baby Lounge</p><p className="text-xs font-bold dark:text-white">{spot.babyRoom}</p></div></div></div>
                            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/20"><AlertCircle size={16} className="text-yellow-600 mt-0.5" /><div><p className="text-[10px] font-black text-yellow-700 uppercase">Pro Tips</p><p className="text-xs font-bold text-yellow-900 dark:text-yellow-200">{spot.notes}</p></div></div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => toggleVisit(spot.id)} className={cn("flex-1 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95", visited[spot.id] ? "bg-brand-gray-100 text-brand-gray-500" : "bg-brand-primary text-white shadow-lg shadow-brand-primary/20")}>{visited[spot.id] ? "방문 취소하기" : "방문 완료 (스탬프 찍기)"}</button>
                            <button className="w-14 h-14 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl flex items-center justify-center text-brand-gray-500 hover:bg-brand-gray-100 transition-colors"><ExternalLink size={20} /></button>
                          </div>
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                ))}
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
