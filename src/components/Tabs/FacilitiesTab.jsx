import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  X, 
  MapPin, 
  Home, 
  HeartPulse, 
  Users, 
  HeartHandshake, 
  Sparkles,
  Phone,
  Milk
} from 'lucide-react';
import { cn } from '../../utils/uiUtils';
import { ALL_REGIONS, FACILITIES_PER_PAGE, FACILITY_CATEGORIES } from '../../constants/uiConstants';

const FacilitiesTab = ({
  searchQuery,
  setSearchQuery,
  facilityPage,
  setFacilityPage,
  selectedRegion,
  handleRegionChange,
  selectedSubRegion,
  setSelectedSubRegion,
  selectedDong,
  setSelectedDong,
  filteredFacilities,
  isLocating,
  locationMsg,
  setLocationMsg,
  availableSubRegions,
  handleGeolocation,
  facilities = [],
  selectedFacilityCategory,
  setSelectedFacilityCategory
}) => {
  const availableDongs = React.useMemo(() => {
    if (selectedSubRegion === '전체') return ['전체'];
    const dongs = Array.from(new Set(
      (facilities || [])
        .filter(f => f.region === selectedRegion && f.subRegion === selectedSubRegion)
        .map(f => f.dong)
        .filter(d => d && d !== '전체')
    ));
    return ['전체', ...dongs.sort()];
  }, [facilities, selectedRegion, selectedSubRegion]);

  const getIconForType = (type) => {
    switch (type) {
      case '어린이집': return <Home size={16} />;
      case '병원·상담': return <HeartPulse size={16} />;
      case '가족센터': return <Users size={16} />;
      case '돌봄·지원센터': return <HeartHandshake size={16} />;
      case '유아휴게소': return <Milk size={16} />;
      default: return <MapPin size={16} />;
    }
  };

  const getThemeColor = (type) => {
    switch (type) {
      case '어린이집': return 'text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20';
      case '병원·상담': return 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20';
      case '가족센터': return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20';
      case '돌봄·지원센터': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
      case '유아휴게소': return 'text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/20';
      default: return 'text-brand-gray-500 bg-brand-gray-50 dark:bg-white/5 border-brand-gray-100 dark:border-white/10';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-brand-gray-900 dark:text-white">전국 육아 인프라 검색</h3>
          <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 mt-1 font-medium">우리 아이를 위한 병원, 어린이집, 상담센터를 한눈에 찾으세요.</p>
        </div>
        <button
          onClick={handleGeolocation}
          className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-apple-card border border-brand-gray-200 dark:border-apple-border rounded-2xl text-sm font-black dark:text-brand-gray-100 shadow-sm hover:border-brand-primary hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          disabled={isLocating}
        >
          <Navigation size={16} className={isLocating ? 'animate-spin' : 'text-brand-primary'} />
          {isLocating ? '위치 확인 중...' : '내 주변 시설 찾기'}
        </button>
      </div>

      <div className="space-y-6 mb-10">
        <div className="relative group">
          <input
            type="text"
            placeholder="시설 명칭 또는 주소 검색 (예: 소아과, 키움센터, 어린이집)"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setFacilityPage(1); }}
            className="w-full h-14 bg-white dark:bg-apple-card border-2 border-brand-gray-100 dark:border-apple-border rounded-[1.5rem] pl-5 pr-14 text-sm font-bold outline-none focus:border-brand-primary dark:text-white transition-all shadow-md group-hover:shadow-xl"
          />
          {searchQuery && (
            <button 
              className="absolute right-4 top-4 p-1 hover:bg-brand-gray-100 dark:hover:bg-apple-border rounded-full transition-colors"
              onClick={() => setSearchQuery('')} 
            >
              <X size={20} className="text-brand-gray-400" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {FACILITY_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedFacilityCategory(cat); setFacilityPage(1); }}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black transition-all border flex items-center gap-2",
                selectedFacilityCategory === cat
                  ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-105"
                  : "bg-white dark:bg-apple-card text-brand-gray-500 dark:text-brand-gray-400 border-brand-gray-100 dark:border-apple-border hover:border-brand-primary/40"
              )}
            >
              {cat !== '전체' && getIconForType(cat)}
              {cat}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {locationMsg && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className={cn("mb-8 p-5 rounded-[1.5rem] text-sm font-black flex justify-between items-center shadow-sm", 
              locationMsg.type === 'error' ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
            )}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={18} />
              {locationMsg.text}
            </div>
            <X size={20} onClick={() => setLocationMsg(null)} className="cursor-pointer opacity-60 hover:opacity-100" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex overflow-x-auto gap-2 pb-6 no-scrollbar border-b border-brand-gray-100 dark:border-apple-border mb-8">
        {ALL_REGIONS.map(region => (
          <button
            key={region}
            onClick={() => handleRegionChange(region)}
            className={cn("px-5 py-2.5 rounded-full text-xs font-black border transition-all whitespace-nowrap",
              selectedRegion === region 
                ? "bg-brand-gray-900 dark:bg-white text-white dark:text-brand-gray-900 border-brand-gray-900 dark:border-white shadow-xl" 
                : "bg-white dark:bg-apple-card text-brand-gray-400 dark:text-brand-gray-500 border-brand-gray-100 dark:border-apple-border hover:border-brand-primary/40"
            )}
          >
            {region}
          </button>
        ))}
      </div>

      {selectedRegion !== '전체' && availableSubRegions.length > 1 && (
        <div className="mb-10 p-6 bg-brand-gray-50/50 dark:bg-white/5 rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border">
          <div className="mb-6">
            <p className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-widest mb-4 px-1">{selectedRegion} 내 시·군·구</p>
            <div className="flex flex-wrap gap-2">
              {availableSubRegions.map(sub => (
                <button
                  key={sub}
                  onClick={() => { setSelectedSubRegion(sub); setSelectedDong('전체'); setFacilityPage(1); }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                    selectedSubRegion === sub
                      ? "bg-brand-primary text-white border-brand-primary shadow-md"
                      : "bg-white dark:bg-apple-card text-brand-gray-500 dark:text-brand-gray-400 border-brand-gray-200 dark:border-apple-border hover:border-brand-primary/30"
                  )}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {selectedSubRegion !== '전체' && availableDongs.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-widest mb-4 px-1">{selectedSubRegion} 내 읍·면·동</p>
              <div className="flex flex-wrap gap-2">
                {availableDongs.map(dong => (
                  <button
                    key={dong}
                    onClick={() => { setSelectedDong(dong); setFacilityPage(1); }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[11px] font-bold transition-all border",
                      selectedDong === dong
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white dark:bg-apple-card text-brand-gray-400 border-brand-gray-100 dark:border-apple-border"
                    )}
                  >
                    {dong}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filteredFacilities || []).slice((facilityPage - 1) * FACILITIES_PER_PAGE, facilityPage * FACILITIES_PER_PAGE).map((item) => (
          <motion.div 
            key={item.id} 
            whileHover={{ y: -5 }}
            className="flex flex-col h-full bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all group overflow-hidden"
          >
            <div className="p-7 flex-1">
              <div className="flex justify-between items-start mb-5">
                <span className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border",
                  getThemeColor(item.type)
                )}>
                  {getIconForType(item.type)}
                  {item.type}
                </span>
                {item.id.startsWith('m-') && (
                  <div className="flex items-center gap-1 text-[10px] font-black text-brand-primary animate-pulse">
                    <Sparkles size={12} /> 핵심시설
                  </div>
                )}
              </div>
              
              <h4 className="text-lg font-black dark:text-white group-hover:text-brand-primary transition-colors mb-3 line-clamp-1">{item.name}</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs text-brand-gray-500 dark:text-brand-gray-400 font-bold leading-relaxed">
                  <MapPin size={14} className="shrink-0 mt-0.5 text-brand-gray-300" />
                  <span>{item.address || `${item.region} ${item.subRegion} ${item.dong !== '전체' ? item.dong : ''}`}</span>
                </div>
              </div>
            </div>
            
            <div className="px-7 pb-7 pt-0">
              <div className="flex gap-2">
                <a 
                  href={item.mapUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 h-12 bg-brand-gray-50 dark:bg-apple-elevated hover:bg-brand-primary hover:text-white dark:text-brand-gray-300 dark:hover:bg-brand-primary dark:hover:text-white rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 border border-brand-gray-100 dark:border-apple-border"
                >
                  위치 및 길찾기
                </a>
                <button className="w-12 h-12 bg-white dark:bg-apple-elevated border border-brand-gray-100 dark:border-apple-border rounded-2xl flex items-center justify-center text-brand-gray-400 hover:text-brand-primary transition-all">
                  <Phone size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {(filteredFacilities || []).length > FACILITIES_PER_PAGE && (
        <div className="flex justify-center gap-2 py-12 overflow-x-auto no-scrollbar">
          {Array.from({ length: Math.ceil(filteredFacilities.length / FACILITIES_PER_PAGE) }, (_, i) => (
            <button 
              key={i} onClick={() => { setFacilityPage(i + 1); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
              className={cn("min-w-[44px] h-11 px-3 rounded-xl font-black text-xs border transition-all", 
                facilityPage === i + 1 
                  ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-110" 
                  : "bg-white dark:bg-apple-card border-brand-gray-200 dark:border-apple-border text-brand-gray-400 hover:border-brand-primary"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {filteredFacilities.length === 0 && (
        <div className="text-center py-32 bg-white dark:bg-apple-card rounded-[3rem] border-4 border-dashed border-brand-gray-50 dark:border-apple-border/50">
           <MapPin size={48} className="mx-auto text-brand-gray-200 dark:text-brand-gray-700 mb-6" />
           <p className="text-xl font-black text-brand-gray-900 dark:text-white">찾으시는 시설이 목록에 없나요?</p>
           <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 mt-2 font-medium">검색어를 바꿔보거나 다른 지역을 확인해 보세요.</p>
           <button onClick={() => { setSearchQuery(''); setSelectedFacilityCategory('전체'); }} className="mt-8 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black text-xs shadow-lg shadow-brand-primary/20">필터 초기화</button>
        </div>
      )}
    </motion.div>
  );
};

export default FacilitiesTab;
