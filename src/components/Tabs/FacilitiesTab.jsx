// src/components/Tabs/FacilitiesTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, X, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ALL_REGIONS, FACILITIES_PER_PAGE } from '../../constants/uiConstants';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
  facilities = []
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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h3 className="text-xl font-bold dark:text-white">육아 정보 검색</h3>
        <button
          onClick={handleGeolocation}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-apple-elevated border border-brand-gray-200 dark:border-apple-border rounded-full text-sm font-bold dark:text-brand-gray-100 shadow-sm hover:border-brand-primary transition-all"
          disabled={isLocating}
        >
          <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
          {isLocating ? '확인 중...' : '내 위치로 찾기'}
        </button>
      </div>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="명칭 검색 (예: 서울대학병원, 꿈동이 어린이집)"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setFacilityPage(1); }}
          className="w-full h-12 bg-white dark:bg-apple-elevated border border-brand-gray-200 dark:border-apple-border rounded-2xl pl-4 pr-12 text-sm outline-none focus:border-brand-primary dark:text-white transition-all shadow-sm"
        />
        {searchQuery && (
          <X 
            size={18} 
            className="absolute right-4 top-3.5 text-brand-gray-400 cursor-pointer hover:text-brand-primary transition-colors" 
            onClick={() => setSearchQuery('')} 
          />
        )}
      </div>

      <AnimatePresence>
        {locationMsg && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className={cn("mb-5 p-4 rounded-2xl text-sm font-bold flex justify-between items-center", 
              locationMsg.type === 'error' ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
            )}
          >
            {locationMsg.text}
            <X size={16} onClick={() => setLocationMsg(null)} className="cursor-pointer" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Region selection horizontally scrollable */}
      <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
        {ALL_REGIONS.map(region => (
          <button
            key={region}
            onClick={() => handleRegionChange(region)}
            className={cn("px-4 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap",
              selectedRegion === region 
                ? "bg-brand-primary text-white border-brand-primary shadow-md" 
                : "bg-white dark:bg-apple-elevated text-brand-gray-500 dark:text-brand-gray-400 border-brand-gray-200 dark:border-apple-border hover:border-brand-primary/30"
            )}
          >
            {region}
          </button>
        ))}
      </div>

      {selectedRegion !== '전체' && availableSubRegions.length > 1 && (
        <div className="mb-6 p-5 bg-white dark:bg-apple-card rounded-3xl border border-brand-gray-100 dark:border-apple-border shadow-sm overflow-hidden">
          <div className="mb-5">
            <p className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-[0.2em] mb-3 px-1">{selectedRegion} 내 세부 시/군/구</p>
            <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
              {availableSubRegions.map(sub => (
                <button
                  key={sub}
                  onClick={() => { setSelectedSubRegion(sub); setSelectedDong('전체'); setFacilityPage(1); }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
                    selectedSubRegion === sub
                      ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                      : "bg-brand-gray-50 dark:bg-apple-elevated text-brand-gray-500 dark:text-brand-gray-400 border-brand-gray-200 dark:border-apple-border hover:bg-white dark:hover:bg-apple-border hover:border-blue-300"
                  )}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {selectedSubRegion !== '전체' && availableDongs.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-[0.2em] mb-3 px-1">{selectedSubRegion} 내 읍/면/동</p>
              <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
                {availableDongs.map(dong => (
                  <button
                    key={dong}
                    onClick={() => { setSelectedDong(dong); setFacilityPage(1); }}
                    className={cn(
                      "px-3.5 py-2 rounded-lg text-xs font-bold transition-all border whitespace-nowrap",
                      selectedDong === dong
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : "bg-brand-gray-50 dark:bg-apple-elevated text-brand-gray-500 dark:text-brand-gray-400 border-brand-gray-200 dark:border-apple-border hover:bg-white dark:hover:bg-apple-border hover:border-emerald-300"
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

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredFacilities || []).slice((facilityPage - 1) * FACILITIES_PER_PAGE, facilityPage * FACILITIES_PER_PAGE).map((item) => (
            <motion.div key={item.id} layout className="p-6 bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border rounded-[2rem] shadow-sm flex flex-col justify-between group">
              <div>
                <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded text-[10px] font-black uppercase mb-3 inline-block">{item.type}</span>
                <h4 className="text-lg font-bold mb-2 dark:text-white group-hover:text-brand-primary transition-colors">{item.name}</h4>
                <div className="flex items-center gap-2 text-xs text-brand-gray-500 dark:text-brand-gray-400 font-bold">
                  <MapPin size={12}/> {item.region} {item.subRegion} {item.dong !== '전체' && item.dong}
                </div>
              </div>
              <a 
                href={item.mapUrl} target="_blank" rel="noopener noreferrer"
                className="mt-6 w-full py-3 bg-[#FEE500] hover:bg-[#FADA0A] text-[#3C1E1E] rounded-xl text-sm font-black text-center transition-all flex items-center justify-center gap-2"
              >
                카카오맵에서 위치 확인
              </a>
            </motion.div>
          ))}
        </div>

        {Math.ceil(filteredFacilities.length / FACILITIES_PER_PAGE) > 1 && (
          <div className="flex justify-center gap-2 py-8 overflow-x-auto no-scrollbar">
            {Array.from({ length: Math.ceil(filteredFacilities.length / FACILITIES_PER_PAGE) }, (_, i) => (
              <button 
                key={i} onClick={() => { setFacilityPage(i + 1); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                className={cn("min-w-[40px] h-10 px-3 rounded-xl font-bold border transition-all", 
                  facilityPage === i + 1 
                    ? "bg-brand-primary text-white border-brand-primary shadow-md" 
                    : "bg-white dark:bg-apple-elevated border-brand-gray-200 dark:border-apple-border dark:text-brand-gray-300 hover:border-brand-primary/30"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-apple-card rounded-3xl border-2 border-dashed border-brand-gray-100 dark:border-apple-border">
           <MapPin size={40} className="mx-auto text-brand-gray-300 dark:text-brand-gray-600 mb-4" />
           <p className="text-brand-gray-500 dark:text-brand-gray-400 font-bold">검색 결과가 없습니다.</p>
           <p className="text-brand-gray-400 dark:text-brand-gray-500 text-xs mt-1">지역을 변경하거나 다른 키워드로 검색해 보세요.</p>
        </div>
      )}
    </motion.div>
  );
};

export default FacilitiesTab;
