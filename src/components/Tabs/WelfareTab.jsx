// src/components/Tabs/WelfareTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, X, ChevronDown, MapPin, CheckCircle2, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { WELFARE_STAGES, ALL_REGIONS } from '../../constants/uiConstants';
import { cn } from '../../utils/uiUtils';
import { getSubRegions } from '../../services/welfareApi';

const WelfareTab = ({
  welfareItems = [],
  selectedWelfareStage,
  setSelectedWelfareStage,
  isLoadingWelfare,
  welfareRegion,
  setWelfareRegion,
  welfareSubRegion,
  setWelfareSubRegion,
  expandedWelfareId,
  setExpandedWelfareId,
  isLocatingWelfare,
  setIsLocatingWelfare,
  welfareLocationMsg,
  setWelfareLocationMsg,
  handleWelfareGeolocation
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-gray-900 dark:text-white">맞춤형 복지 혜택</h3>
          <p className="text-brand-gray-500 dark:text-brand-gray-400 mt-1 text-sm">아이의 성장 단계와 지역에 맞는 혜택을 확인하세요.</p>
        </div>
        <button
          onClick={handleWelfareGeolocation}
          className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-apple-card border border-brand-gray-200 dark:border-apple-border rounded-2xl text-sm font-black dark:text-brand-gray-100 shadow-sm hover:border-brand-primary hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          disabled={isLocatingWelfare}
        >
          <Navigation size={16} className={isLocatingWelfare ? 'animate-spin' : 'text-brand-primary'} />
          {isLocatingWelfare ? '위치 확인 중...' : '내 주변 혜택 찾기'}
        </button>
      </div>

      <AnimatePresence>
        {welfareLocationMsg && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className={cn("p-5 rounded-[1.5rem] text-sm font-black flex justify-between items-center shadow-sm", 
              welfareLocationMsg.type === 'error' ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
            )}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-brand-primary" />
              {welfareLocationMsg.text}
            </div>
            <X size={20} onClick={() => setWelfareLocationMsg(null)} className="cursor-pointer opacity-60 hover:opacity-100" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 거주 지역 선택 섹션 - 톤앤매너 최적화 */}
      <div className="bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest leading-none mb-1">Location</p>
            <h4 className="text-lg font-black text-brand-gray-900 dark:text-white">거주 지역 선택</h4>
          </div>
        </div>

        {/* 광역 시/도 선택 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-brand-gray-400 uppercase tracking-tighter">시/도 선택</span>
            <span className="text-[11px] font-black text-brand-primary">{welfareRegion}</span>
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {ALL_REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setWelfareRegion(r);
                  setWelfareSubRegion('전체');
                }}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 border whitespace-nowrap",
                  welfareRegion === r
                    ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                    : "bg-brand-gray-50 dark:bg-white/5 text-brand-gray-500 dark:text-brand-gray-400 border-transparent hover:border-brand-primary/30"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 시/군/구 선택 (지역이 선택된 경우에만 노출) */}
        <AnimatePresence mode="wait">
          {welfareRegion !== '전체' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-4 border-t border-brand-gray-50 dark:border-white/5"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-brand-gray-400 uppercase tracking-tighter">시/군/구 상세</span>
                <span className="text-[11px] font-black text-brand-secondary">{welfareSubRegion}</span>
              </div>
              <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {['전체', ...getSubRegions(welfareRegion)].map((sr) => (
                  <button
                    key={sr}
                    onClick={() => setWelfareSubRegion(sr)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300 border whitespace-nowrap",
                      welfareSubRegion === sr
                        ? "bg-brand-secondary text-white border-brand-secondary shadow-lg shadow-brand-secondary/20"
                        : "bg-brand-gray-50 dark:bg-white/5 text-brand-gray-500 dark:text-brand-gray-400 border-transparent hover:border-brand-secondary/30"
                    )}
                  >
                    {sr}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
        {(WELFARE_STAGES || []).map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedWelfareStage(stage.id)}
            className={cn(
              "min-w-[140px] p-4 rounded-3xl border-2 transition-all text-left relative overflow-hidden",
              selectedWelfareStage === stage.id
                ? "bg-brand-primary border-brand-primary text-white shadow-lg"
                : "bg-white dark:bg-apple-card border-brand-gray-100 dark:border-apple-border text-brand-gray-500 dark:text-brand-gray-400 hover:border-brand-primary/30"
            )}
          >
            <span className={cn("text-[10px] font-black uppercase tracking-widest opacity-70", selectedWelfareStage === stage.id ? "text-white/80" : "text-brand-primary")}>Stage {stage.id}</span>
            <h5 className="font-bold text-sm mt-1 dark:text-white">{stage.label}</h5>
            <p className={cn("text-[10px] mt-1 leading-tight", selectedWelfareStage === stage.id ? "text-white/70" : "text-brand-gray-400 dark:text-brand-gray-500")}>{stage.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {welfareItems.length > 0 ? (
          welfareItems
            .filter(item => item.stage === selectedWelfareStage)
            .map((item) => (
              <div 
                key={item.id} 
                onClick={() => setExpandedWelfareId(expandedWelfareId === item.id ? null : item.id)}
                className={cn(
                  "bg-white dark:bg-apple-card p-6 rounded-[2rem] border transition-all duration-300 shadow-sm cursor-pointer",
                  expandedWelfareId === item.id ? "border-brand-primary ring-1 ring-brand-primary/10" : "border-brand-gray-100 dark:border-apple-border hover:border-brand-primary/30"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap gap-2">
                    {(item.tags || []).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded text-[10px] font-black uppercase">{tag}</span>
                    ))}
                  </div>
                  <ChevronDown size={18} className={cn("text-brand-gray-400 transition-transform", expandedWelfareId === item.id && "rotate-180")} />
                </div>
                <h4 className="text-lg font-bold text-brand-gray-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 font-medium line-clamp-2">{item.desc}</p>
                
                <AnimatePresence>
                  {expandedWelfareId === item.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-brand-gray-50 dark:border-apple-border overflow-hidden">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">지원 내용</p>
                          <p className="text-xs text-brand-gray-800 dark:text-brand-gray-100 leading-relaxed font-bold">{item.details?.content}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-1">대상</p>
                          <p className="text-[11px] text-brand-gray-500 dark:text-brand-gray-400 font-medium">{item.details?.target}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <p className="text-[11px] text-brand-gray-400 font-medium">방법: {item.details?.how}</p>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-black text-brand-primary hover:underline">
                              신청하기 <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white dark:bg-apple-card rounded-[2rem] border-2 border-dashed border-brand-gray-100 dark:border-apple-border text-brand-gray-400 font-bold">
            <AlertCircle size={40} className="mx-auto mb-4 opacity-50" />
            <p>선택한 지역의 특화 혜택 정보를 불러오는 중이거나 정보가 없습니다.</p>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default WelfareTab;
