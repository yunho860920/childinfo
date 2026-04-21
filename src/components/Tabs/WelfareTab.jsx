// src/components/Tabs/WelfareTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, X, ChevronDown, MapPin, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';
import { WELFARE_STAGES, ALL_REGIONS } from '../../constants/uiConstants';
import { cn } from '../../utils/uiUtils';

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
  setWelfareLocationMsg
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-gray-900 dark:text-white">맞춤형 복지 혜택</h3>
          <p className="text-brand-gray-500 dark:text-brand-gray-400 mt-1 text-sm">아이의 성장 단계와 지역에 맞는 혜택을 확인하세요.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border rounded-[2rem] p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="flex-1">
            <p className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-widest mb-2 px-1">거주 지역 선택</p>
            <div className="flex gap-2">
              <select 
                value={welfareRegion} 
                onChange={(e) => { setWelfareRegion(e.target.value); setWelfareSubRegion('전체'); }}
                className="flex-1 h-11 bg-brand-gray-50 dark:bg-apple-elevated border border-brand-gray-200 dark:border-apple-border rounded-xl px-3 text-sm font-bold dark:text-white outline-none focus:border-brand-primary transition-all"
              >
                {ALL_REGIONS.map(r => <option key={r} value={r} className="dark:bg-apple-card">{r}</option>)}
              </select>
            </div>
          </div>
        </div>
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
