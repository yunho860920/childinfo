// src/components/Tabs/HealthTab.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/uiUtils';
import { vaccinationSchedule, temperatureGuide, ageHealthData, growthMilestones } from '../../data/healthInfo';

const HealthTab = ({
  childInfo,
  selectedHealthCategory,
  setSelectedHealthCategory,
  completedVaccines,
  toggleVaccine,
  completedMilestones,
  toggleMilestone
}) => {
  const healthCategories = ['예방접종 일정', '성장 마일스톤', '체온·응급', '신생아', '영아 후기', '걸음마기', '유아 초기'];
  const [vaxFilter, setVaxFilter] = React.useState('전체');

  const vaxAgeGroups = [
    { label: '전체', min: 0, max: 999 },
    { label: '0세', min: 0, max: 11 },
    { label: '1세', min: 12, max: 23 },
    { label: '4~6세', min: 48, max: 72 },
    { label: '11~12세', min: 132, max: 144 },
  ];

  const vaxStats = React.useMemo(() => {
    const totalVax = (vaccinationSchedule || []).reduce((acc, curr) => acc + curr.vaccines.length, 0);
    const doneVax = Object.values(completedVaccines || {}).filter(Boolean).length;
    return {
      total: totalVax,
      done: doneVax,
      pct: totalVax > 0 ? Math.round((doneVax / totalVax) * 100) : 0
    };
  }, [completedVaccines]);

  const filteredVax = (vaccinationSchedule || []).filter(s => {
    if (vaxFilter === '전체') return true;
    const group = vaxAgeGroups.find(g => g.label === vaxFilter);
    return s.months >= group.min && s.months <= group.max;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-24"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="shrink-0">
          <h3 className="text-2xl font-black text-brand-gray-900 dark:text-white tracking-tight">소아 건강 지능</h3>
          <p className="text-brand-gray-500 dark:text-brand-gray-400 mt-1 text-[13px] font-medium leading-tight">질병청 및 K-DST 표준 기반 맞춤 가이드</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full md:w-auto">
          {healthCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedHealthCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-[12px] font-black whitespace-nowrap transition-all border",
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
        <div className="space-y-6">
          <div className="bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border rounded-[2rem] p-6 shadow-soft">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md mb-2 inline-block">NIP Protocol</span>
                <h3 className="text-lg font-black text-brand-gray-900 dark:text-white">접종 달성률</h3>
              </div>
              <div className="text-3xl font-black text-emerald-500">{vaxStats.pct}%</div>
            </div>
            <div className="h-2.5 w-full bg-brand-gray-100 dark:bg-apple-border rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${vaxStats.pct}%` }} className="h-full bg-emerald-500 rounded-full" />
            </div>
          </div>

          <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
            {vaxAgeGroups.map(group => (
              <button
                key={group.label}
                onClick={() => setVaxFilter(group.label)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[11px] font-black transition-all border",
                  vaxFilter === group.label 
                    ? "bg-brand-gray-900 text-white border-brand-gray-900 dark:bg-white dark:text-brand-gray-900 dark:border-white"
                    : "bg-white dark:bg-apple-elevated text-brand-gray-400 border-brand-gray-200 dark:border-apple-border"
                )}
              >
                {group.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {(filteredVax || []).map((schedule, index) => {
              const isCurrent = (childInfo?.months || 0) === schedule.months;
              return (
                <div key={index} className="relative pl-6 border-l-2 border-brand-gray-100 dark:border-apple-border ml-2 space-y-4">
                  <div className={cn("absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-apple-black", isCurrent ? "bg-brand-primary" : "bg-brand-gray-200 dark:bg-apple-elevated")} />
                  <h4 className={cn("text-base font-black flex items-center gap-2", isCurrent ? "text-brand-primary" : "text-brand-gray-900 dark:text-white")}>
                    {schedule.label}
                    {isCurrent && <span className="text-[10px] bg-brand-primary/10 px-2 py-0.5 rounded-full">진행 중</span>}
                  </h4>
                  <div className="grid gap-3">
                    {(schedule?.vaccines || []).map((v, i) => {
                      const vId = `${schedule.months}m-${v.name}-${v.dose}`;
                      const isDone = !!completedVaccines[vId];
                      return (
                        <div key={i} onClick={() => toggleVaccine(vId)} className={cn("p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between", isDone ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20" : "bg-white dark:bg-apple-card border-brand-gray-100 dark:border-apple-border shadow-sm")}>
                          <div className="flex items-start gap-3">
                            <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5", isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-brand-gray-200 dark:border-apple-border bg-white dark:bg-apple-card")}>
                              {isDone && <Check size={14} strokeWidth={4} />}
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                 <span className={cn("text-sm font-black", isDone ? "text-emerald-700/60 line-through" : "text-brand-gray-900 dark:text-white")}>{v.name}</span>
                                 <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded", v.type === '필수' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700")}>{v.type}</span>
                               </div>
                               <p className="text-[11px] text-brand-gray-400 font-medium mt-0.5">{v.desc}</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-brand-gray-400">{v.dose}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : selectedHealthCategory === '성장 마일스톤' ? (
        <div className="space-y-6">
           <div className="bg-blue-500/5 dark:bg-blue-500/10 p-5 rounded-[2rem] border border-blue-500/20 flex gap-4">
             <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
               <ShieldCheck size={24} />
             </div>
             <div>
               <h4 className="text-sm font-black text-blue-600 dark:text-blue-400">발달 지표 지능 분석 (K-DST)</h4>
               <p className="text-[11px] font-bold text-blue-500/80 leading-tight mt-1">우리 아이의 발달 단계를 체크하면 표준 데이터와 비교하여 성취도를 평가합니다.</p>
             </div>
           </div>

           {(growthMilestones || []).map((group, idx) => {
             const childMonths = childInfo?.months || 0;
             const isOverdue = childMonths > group.months;
             return (
               <div key={idx} className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                   <h4 className="text-base font-black text-brand-gray-900 dark:text-white">{group.label}</h4>
                   {isOverdue && (
                     <span className="text-[10px] font-black text-brand-gray-400 uppercase tracking-tighter bg-brand-gray-100 px-2 py-0.5 rounded">Past Stage</span>
                   )}
                 </div>
                 <div className="grid gap-3">
                   {(group?.items || []).map(milestone => {
                     const isChecked = !!completedMilestones[milestone.id];
                     const showCaution = !isChecked && childMonths > (group.months + 2);
                     return (
                       <div key={milestone.id} onClick={() => toggleMilestone(milestone.id)} className={cn("p-5 rounded-[1.75rem] border cursor-pointer transition-all flex items-start gap-4 shadow-soft", isChecked ? "bg-emerald-50/30 border-emerald-200/50" : "bg-white dark:bg-apple-card border-brand-gray-100 dark:border-apple-border")}>
                         <div className={cn("w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 mt-1", isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-brand-gray-200 bg-white")}>
                           {isChecked && <Check size={16} strokeWidth={4} />}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-1">
                             <div className="flex items-center gap-2">
                               <span className={cn("text-[15px] font-black", isChecked ? "text-emerald-700" : "text-brand-gray-900 dark:text-white")}>{milestone.name}</span>
                               <span className="text-[9px] font-black text-brand-gray-400 bg-brand-gray-50 px-1.5 py-0.5 rounded whitespace-nowrap">{milestone.type}</span>
                             </div>
                             {isChecked ? (
                               <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">On Track</span>
                             ) : showCaution ? (
                               <div className="flex items-center gap-1 text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-full whitespace-nowrap">
                                 <ShieldAlert size={10} />
                                 체크 권장
                               </div>
                             ): null}
                           </div>
                           <p className={cn("text-[13px] font-medium leading-relaxed", isChecked ? "text-emerald-600/70" : "text-brand-gray-500")}>{milestone.desc}</p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             );
           })}
        </div>
      ) : selectedHealthCategory === '체온·응급' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border rounded-[2rem] overflow-hidden shadow-soft">
            <div className="p-6 bg-blue-500/5 border-b border-blue-500/10">
              <h4 className="text-base font-black text-blue-600 dark:text-blue-400 inline-flex items-center gap-2">
                🌡️ {temperatureGuide.title}
              </h4>
              <p className="text-[11px] text-blue-500/70 mt-1 font-bold">{temperatureGuide.desc}</p>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <p className="text-[11px] font-black text-brand-gray-400 uppercase tracking-widest mb-4">측정 부위별 정상 범위</p>
                <div className="space-y-2">
                  {(temperatureGuide?.measureSites || []).map((s, i) => (
                    <div key={i} className="flex justify-between items-center py-3 px-4 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl">
                      <div>
                        <p className="text-[13px] font-black text-brand-gray-900 dark:text-white">{s.site}</p>
                        <p className="text-[10px] text-brand-gray-400 font-bold">{s.note}</p>
                      </div>
                      <span className="text-[13px] font-black text-brand-primary">{s.normal}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-black text-brand-gray-400 uppercase tracking-widest mb-4">발열 단계별 조치</p>
                <div className="space-y-2">
                  {(temperatureGuide?.feverLevels || []).map((f, i) => {
                    const colorMap = {
                      green: 'bg-green-50 text-green-700',
                      yellow: 'bg-yellow-50 text-yellow-700',
                      orange: 'bg-orange-50 text-orange-700',
                      red: 'bg-red-50 text-red-600',
                    };
                    return (
                      <div key={i} className={cn('flex items-center gap-3 py-3 px-4 rounded-2xl', colorMap[f.color])}>
                        <span className="text-[11px] font-black w-14 shrink-0">{f.range}</span>
                        <div className="flex-1">
                          <span className="text-[12px] font-black">{f.label}</span>
                          <p className="text-[10px] font-bold opacity-80 leading-tight">{f.action}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(ageHealthData || [])
            .filter(ageGroup => ageGroup.ageLabel === selectedHealthCategory)
            .flatMap(ageGroup => ageGroup.conditions.map((cond, i) => (
              <div key={i} className={cn('bg-white dark:bg-apple-card p-6 border rounded-[2rem] shadow-soft group hover:border-brand-primary/30 transition-all cursor-default', ageGroup.border.replace('border-', 'border-opacity-40 border-'))}>
                <div className="flex gap-4">
                  <div className={cn(
                    'shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg',
                    cond.needsDoctor ? 'bg-red-400 shadow-red-400/20' : 'bg-emerald-400 shadow-emerald-400/20'
                  )}>
                    {cond.needsDoctor ? '!' : '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-black text-brand-gray-900 dark:text-white mb-1">{cond.name}</h4>
                    <p className="text-[13px] text-brand-gray-500 dark:text-brand-gray-400 font-medium leading-relaxed mb-4">{cond.desc}</p>
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

      <div className="p-6 rounded-[2rem] bg-brand-gray-100 dark:bg-apple-elevated text-center border border-brand-gray-200 dark:border-apple-border">
        <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 font-bold leading-relaxed">🏥 위 정보는 질병관리청 및 대한소아청소년과학회 가이드를 바탕으로 제작되었습니다.<br/>정확한 진단은 반드시 전문의와 상담하십시오.</p>
      </div>
    </motion.div>
  );
};

export default HealthTab;
