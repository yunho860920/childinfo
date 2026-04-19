// src/components/Tabs/HealthTab.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { vaccinationSchedule, temperatureGuide, ageHealthData } from '../../data/healthInfo';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const HealthTab = ({
  childInfo,
  selectedHealthCategory,
  setSelectedHealthCategory,
  completedVaccines,
  toggleVaccine
}) => {
  const healthCategories = ['예방접종 일정', '체온·응급', '신생아', '영아 초기', '영아 후기', '걸음마기', '유아 초기', '취학 전'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-hidden">
        <div className="shrink-0">
          <h3 className="text-2xl font-bold text-brand-gray-900 dark:text-white">소아 건강 가이드</h3>
          <p className="text-brand-gray-500 dark:text-brand-gray-400 mt-1 text-sm">연령별 주요 건강 특징과 응급 상황 대처법을 안내합니다.</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full md:w-auto">
          {healthCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedHealthCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                selectedHealthCategory === cat
                  ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                  : "bg-white dark:bg-apple-elevated text-brand-gray-500 dark:text-brand-gray-400 border-brand-gray-200 dark:border-apple-border hover:border-brand-primary/30"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {selectedHealthCategory === '예방접종 일정' ? (
        <div className="space-y-8">
          {(() => {
            const total = (vaccinationSchedule || []).reduce((acc, curr) => acc + (curr.vaccines || []).length, 0);
            const done = Object.values(completedVaccines || {}).filter(Boolean).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div className="bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border rounded-3xl p-5 md:p-6 shadow-sm mb-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black flex items-center gap-2 text-brand-gray-900 dark:text-white">
                      <ShieldCheck className="text-emerald-500" size={18} />
                      예방접종 달성률
                    </h3>
                    <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-1">질병관리청 예방접종(NIP) 기준 {total}개 접종 항목</p>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-emerald-500 leading-none">
                    {pct}<span className="text-sm text-emerald-500/70 opacity-70">%</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-brand-gray-100 dark:bg-apple-border rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
            );
          })()}

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-brand-gray-200 dark:before:via-apple-border before:to-transparent">
            {(vaccinationSchedule || []).map((schedule, index) => {
              const isPast = (childInfo?.months || 0) >= schedule.months;
              const isCurrent = (childInfo?.months || 0) === schedule.months;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  key={index} 
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                >
                  <div className={cn(
                    "absolute left-5 md:left-1/2 flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-apple-black -translate-x-1/2 shadow-sm transition-colors duration-300 z-10",
                    isCurrent ? "bg-brand-primary ring-4 ring-brand-primary/20" : "bg-brand-gray-200 dark:bg-apple-elevated"
                  )}>
                    {isCurrent && <span className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-75" />}
                  </div>
                  
                  <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2rem)] ml-14 md:ml-0 p-5 rounded-2xl bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border shadow-sm hover:border-brand-primary/30 hover:shadow-lg transition-all group-hover:-translate-y-1">
                    <h4 className={cn("text-lg font-black mb-4 flex items-center gap-2", isCurrent ? "text-brand-primary" : "text-brand-gray-900 dark:text-white")}>
                      {schedule.label}
                      {isCurrent && <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">진행 중</span>}
                    </h4>
                    <div className="space-y-3">
                      {(schedule.vaccines || []).map((v, i) => {
                        const vId = `${schedule.months}m-${v.name}-${v.dose}`;
                        const isDone = !!(completedVaccines || {})[vId];
                        return (
                          <div key={i} onClick={() => toggleVaccine(vId)} className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all border", isDone ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" : "bg-brand-gray-50 dark:bg-apple-elevated hover:bg-brand-gray-100 dark:hover:bg-apple-border border-transparent dark:border-apple-border/50")}>
                            <div className="flex items-start gap-3 w-full">
                              <div className={cn("w-5 h-5 shrink-0 rounded flex items-center justify-center border transition-colors mt-0.5", isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 dark:border-apple-border bg-white dark:bg-apple-card")}>
                                {isDone && <Check size={14} strokeWidth={4} />}
                              </div>
                              <div className="w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full">
                                  <div className="flex items-center gap-2">
                                    <span className={cn("text-sm font-bold transition-colors", isDone ? "text-emerald-700 dark:text-emerald-400 line-through opacity-70" : "text-brand-gray-900 dark:text-white")}>{v.name}</span>
                                    <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0", v.type === '필수' ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400", isDone && "opacity-50")}>{v.type}</span>
                                  </div>
                                  <span className={cn("text-xs font-black shrink-0 sm:text-right mt-1 sm:mt-0", isDone ? "text-emerald-600/70 dark:text-emerald-400/50 line-through" : v.type === '필수' ? "text-brand-primary" : "text-brand-gray-500 dark:text-brand-gray-400")}>{v.dose}</span>
                                </div>
                                <p className={cn("text-[10px] mt-1 transition-colors", isDone ? "text-emerald-600/60 dark:text-emerald-400/40" : "text-brand-gray-400 dark:text-brand-gray-500")}>{v.desc}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : selectedHealthCategory === '체온·응급' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/10 dark:to-sky-900/10 border-b border-blue-100 dark:border-blue-500/20">
              <h4 className="text-base font-black text-blue-700 dark:text-blue-400 inline-flex items-center gap-2">
                🌡️ {temperatureGuide.title} <span className="text-[10px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded ml-2 uppercase">필수 정보</span>
              </h4>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/60 mt-1">{temperatureGuide.desc}</p>
            </div>
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-wider mb-3">측정 부위별 정상 범위</p>
                <div className="space-y-2">
                  {temperatureGuide.measureSites.map((s, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 px-3 bg-brand-gray-50 dark:bg-apple-elevated rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-brand-gray-900 dark:text-white">{s.site}</p>
                        <p className="text-[10px] text-brand-gray-400 dark:text-brand-gray-500">{s.note}</p>
                      </div>
                      <span className="text-xs font-black text-brand-primary shrink-0 ml-2">{s.normal}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-wider mb-3">발열 단계별 조치</p>
                <div className="space-y-2">
                  {temperatureGuide.feverLevels.map((f, i) => {
                    const colorMap = {
                      green: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400',
                      yellow: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
                      orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
                      red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
                      darkred: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400',
                    };
                    return (
                      <div key={i} className={cn('flex items-center gap-3 py-2 px-3 rounded-xl', colorMap[f.color])}>
                        <span className="text-[10px] font-black w-16 shrink-0">{f.range}</span>
                        <div className="flex-1">
                          <span className="text-xs font-black">{f.label}</span>
                          <p className="text-[10px] opacity-80 leading-tight">{f.action}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-apple-card border border-brand-primary/20 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 bg-brand-primary/5 border-b border-brand-primary/10">
              <h4 className="text-base font-black text-brand-primary">{temperatureGuide.crossDosing.title}</h4>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {temperatureGuide.crossDosing.items.map((item, i) => (
                  <div key={i} className="p-4 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl border border-brand-primary/10 dark:border-brand-primary/20">
                    <p className="text-sm font-black text-brand-primary mb-1">{item.name}</p>
                    <p className="text-[10px] text-brand-gray-500 dark:text-brand-gray-400 mb-2 font-bold">{item.brands}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-gray-900 dark:text-brand-gray-100">복용 간격</span>
                      <span className="text-brand-primary font-black">{item.interval}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-brand-primary/5 rounded-2xl">
                 <p className="text-[10px] text-brand-primary font-black leading-tight">
                   ⚠️ {temperatureGuide.crossDosing.warning}
                 </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(ageHealthData || [])
            .filter(ageGroup => ageGroup.ageLabel === selectedHealthCategory)
            .flatMap(ageGroup => ageGroup.conditions.map((cond, i) => (
              <div key={i} className={cn('bg-white dark:bg-apple-card p-5 border rounded-3xl group hover:border-brand-primary/30 transition-all cursor-default shadow-sm', ageGroup.border.replace('border-', 'border-opacity-40 border-'))}>
                <div className="flex gap-4">
                  <div className={cn(
                    'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black mt-0.5 shadow-sm',
                    cond.needsDoctor ? 'bg-red-400' : 'bg-green-400'
                  )}>
                    {cond.needsDoctor ? '!' : '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-base font-black text-brand-gray-900 dark:text-white">{cond.name}</span>
                    </div>
                    <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed mb-4 font-medium">{cond.desc}</p>
                    
                    {cond.needsDoctor && cond.doctorNote && (
                      <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-4 border border-red-100 dark:border-red-500/20">
                        <p className="text-[10px] font-black text-red-500 mb-1 uppercase tracking-wider">주요 부모 조치</p>
                        <p className="text-xs text-brand-gray-700 dark:text-brand-gray-200 font-bold leading-relaxed">{cond.doctorNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )))
          }
        </div>
      )}

      <div className="p-4 rounded-3xl bg-brand-gray-100 dark:bg-apple-elevated text-center border border-brand-gray-200 dark:border-apple-border">
        <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 font-bold">🏥 위 정보는 참고용이며, 정확한 진단은 반드시 소아과 전문의와 상담하십시오.</p>
      </div>
    </motion.div>
  );
};

export default HealthTab;
