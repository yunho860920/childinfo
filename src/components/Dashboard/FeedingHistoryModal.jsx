// src/components/Dashboard/FeedingHistoryModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Baby, 
  Trash2, 
  History, 
  TrendingUp, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Calendar,
  Pencil
} from 'lucide-react';
import { cn } from '../../utils/uiUtils';
import FeedingEditModal from './FeedingEditModal';

const FeedingHistoryModal = ({
  isOpen,
  onClose,
  records = [],
  onDeleteRecord,
  onUpdateRecord,
  childInfo
}) => {
  const [expandedDays, setExpandedDays] = React.useState({});
  const [editingRecord, setEditingRecord] = React.useState(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  if (!isOpen) return null;

  // Toggle accordion expand/collapse
  const toggleDay = (dayKey) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
  };

  // 1. Process records & Calculate intervals
  // Sort chronologically (oldest first) to easily compute "time since previous feed"
  const chronological = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const recordsWithIntervals = chronological.map((rec, index) => {
    const prevRec = index > 0 ? chronological[index - 1] : null;
    let intervalStr = '첫 수유';
    let intervalMin = 0;

    if (prevRec) {
      const diffMs = new Date(rec.date) - new Date(prevRec.date);
      const diffMins = Math.floor(diffMs / 60000);
      intervalMin = diffMins;
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      intervalStr = hrs > 0 ? `+${hrs}시간 ${mins}분` : `+${mins}분`;
    }

    return {
      ...rec,
      intervalStr,
      intervalMin
    };
  });

  // Reverse back to newest first for display
  const displayRecords = [...recordsWithIntervals].reverse();

  // 2. Group records by date (YYYY-MM-DD)
  const groupedByDate = {};
  displayRecords.forEach(rec => {
    const dateObj = new Date(rec.date);
    const dateKey = dateObj.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, ''); // "2026.05.21."
    
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(rec);
  });

  // Get last 7 days keys (or all available days in the history)
  const availableDays = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  // Compute stats for a specific day
  const getDayStats = (dayRecords) => {
    let formulaTotal = 0;
    let breastTotalMin = 0;
    let babyfoodTotal = 0;
    let intervals = [];

    dayRecords.forEach(r => {
      if (r.type === 'formula') formulaTotal += r.amount;
      else if (r.type === 'breast') breastTotalMin += r.breastTotal;
      else if (r.type === 'babyfood') babyfoodTotal += r.amount;
      
      // Collect valid intervals (ignore '첫 수유' and intervals that span across days or are extreme)
      if (r.intervalMin > 0 && r.intervalMin < 720) {
        intervals.push(r.intervalMin);
      }
    });

    const avgIntervalMin = intervals.length > 0 
      ? Math.round(intervals.reduce((sum, val) => sum + val, 0) / intervals.length) 
      : 0;
    const avgHrs = Math.floor(avgIntervalMin / 60);
    const avgMins = avgIntervalMin % 60;
    const avgIntervalStr = avgIntervalMin > 0 
      ? (avgHrs > 0 ? `${avgHrs}시간 ${avgMins}분` : `${avgMins}분`)
      : '계산 불가';

    return {
      formula: formulaTotal,
      breast: breastTotalMin,
      babyfood: babyfoodTotal,
      avgInterval: avgIntervalStr
    };
  };

  // 3. 24-Hour Timeline Bar processing for the last 7 days
  const last7Days = React.useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '');
      days.push({
        key: dateKey,
        label: d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })
      });
    }
    return days;
  }, []);

  // Get recommended feeding interval based on baby months and type
  const getFeedingIntervalHours = (months, type) => {
    if (type === 'babyfood') {
      if (months <= 6) return 5;   // 초기 이유식 5시간 텀
      if (months <= 9) return 5.5; // 중기 이유식 5.5시간 텀
      return 6;                    // 후기/완료기 이유식 6시간 텀
    }
    // 수유 (분유/모유)
    if (months <= 1) return 2.5; // 2~3 hours
    if (months <= 3) return 3.5; // 3~4 hours
    if (months <= 6) return 4;   // 4~5 hours
    return 5;                    // 5~6 hours
  };

  const recommendedMilkInterval = getFeedingIntervalHours(childInfo.months, 'formula');
  const recommendedSolidInterval = getFeedingIntervalHours(childInfo.months, 'babyfood');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        />

        {/* Modal Sheet */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative bg-white dark:bg-apple-card w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 dark:border-apple-border"
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-brand-gray-100 dark:border-apple-border flex items-center justify-between bg-white dark:bg-apple-card sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-sm">
                <Baby size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-brand-gray-900 dark:text-white leading-none">일자별 수유 패턴 리포트</h3>
                <p className="text-[11px] font-bold text-brand-gray-400 mt-1.5 uppercase tracking-widest leading-none">Infant Feeding Pattern Analysis</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-gray-100 dark:hover:bg-white/5 transition-colors">
              <X size={24} className="text-brand-gray-400" />
            </button>
          </div>

          {/* Body Container */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar bg-brand-gray-50/30 dark:bg-apple-black/20">
            
            {/* Section 1: 24h Visual Heatmap Timeline */}
            <div className="bg-white dark:bg-apple-card p-6 rounded-[2rem] border border-brand-gray-100 dark:border-apple-border shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-black text-brand-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-primary rounded-full"></div> 
                    24시간 수유 시간대 패턴 (최근 7일)
                  </h4>
                  <p className="text-[11px] font-medium text-brand-gray-400 mt-1">
                    시간대별 도트 분포를 통해 아기의 수유 패턴과 주기를 한눈에 인지할 수 있습니다.
                  </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-violet-500" /> 분유</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-pink-500" /> 모유</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 이유식</div>
                </div>
              </div>

              {/* 24h Grid Timeline */}
              <div className="space-y-4 overflow-x-auto min-w-[500px] no-scrollbar">
                {/* Time Axis Labels */}
                <div className="flex text-[9px] font-black text-brand-gray-400 border-b border-brand-gray-100 dark:border-apple-border/40 pb-1">
                  <div className="w-20 shrink-0 text-left">날짜</div>
                  <div className="flex-1 flex justify-between px-2">
                    {Array.from({ length: 13 }).map((_, i) => (
                      <span key={i} className="w-6 text-center">{i * 2}시</span>
                    ))}
                  </div>
                </div>

                {/* Days Rows */}
                {last7Days.map(day => {
                  const dayFeeds = groupedByDate[day.key] || [];
                  return (
                    <div key={day.key} className="flex items-center py-1 group/row">
                      {/* Date label */}
                      <div className="w-20 shrink-0 text-xs font-black text-brand-gray-600 dark:text-brand-gray-300">
                        {day.label}
                      </div>

                      {/* 24-hour track */}
                      <div className="flex-1 h-8 bg-brand-gray-50/50 dark:bg-apple-elevated/40 rounded-xl relative border border-brand-gray-100/30 dark:border-apple-border/20 overflow-visible">
                        {/* Thin vertical lines for hour references (2 hour steps) */}
                        <div className="absolute inset-0 flex justify-between pointer-events-none px-2">
                          {Array.from({ length: 12 }).map((_, idx) => (
                            <div key={idx} className="w-px h-full bg-brand-gray-100/40 dark:bg-apple-border/5" />
                          ))}
                        </div>

                        {/* Rendering Feeding Dots */}
                        {dayFeeds.map(feed => {
                          const time = new Date(feed.date);
                          const hh = time.getHours();
                          const mm = time.getMinutes();
                          const offsetPercent = ((hh * 60 + mm) / 1440) * 100;
                          
                          // Styling by feeding type
                          let typeColor = 'bg-violet-500 shadow-violet-500/20';
                          let typeEmoji = '🍼';
                          let typeName = '분유';
                          let typeDetail = `${feed.amount}ml`;

                          if (feed.type === 'breast') {
                            typeColor = 'bg-pink-500 shadow-pink-500/20';
                            typeEmoji = '🤱';
                            typeName = '모유';
                            typeDetail = `총 ${feed.breastTotal}분 (왼 ${feed.breastLeft} / 오 ${feed.breastRight})`;
                          } else if (feed.type === 'babyfood') {
                            typeColor = 'bg-emerald-500 shadow-emerald-500/20';
                            typeEmoji = '🥣';
                            typeName = '이유식';
                            typeDetail = `${feed.amount}g`;
                          }

                          const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                          return (
                            <div 
                              key={feed.id}
                              style={{ left: `calc(${offsetPercent}% - 8px)` }}
                              className="absolute top-1/2 -translate-y-1/2 group cursor-pointer"
                              onClick={() => {
                                setEditingRecord(feed);
                                setIsEditOpen(true);
                              }}
                            >
                              {/* Anchor Dot */}
                              <div className={cn("w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] text-white shadow-md border border-white dark:border-apple-card transition-transform hover:scale-125 hover:z-50 active:scale-95", typeColor)}>
                                <span className="scale-80">{typeEmoji}</span>
                              </div>

                              {/* Glowing Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block z-50 bg-brand-gray-900/95 dark:bg-white text-white dark:text-brand-gray-900 px-3.5 py-2 rounded-2xl text-[10.5px] font-bold shadow-xl border border-white/10 dark:border-brand-gray-100 whitespace-nowrap leading-relaxed pointer-events-none">
                                <p className="font-black text-brand-primary dark:text-brand-primary">{formattedTime} | {typeName}</p>
                                <p className="mt-0.5">{typeDetail}</p>
                                {feed.intervalStr && (
                                  <p className="text-brand-gray-400 dark:text-brand-gray-500 font-medium text-[9px] mt-0.5">이전 수유 후 {feed.intervalStr}</p>
                                )}
                                {feed.notes && (
                                  <p className="mt-1 border-t border-white/10 dark:border-black/5 pt-1 text-[9.5px] max-w-[150px] text-wrap text-brand-gray-300 dark:text-brand-gray-600 font-medium">💬 {feed.notes}</p>
                                )}
                                <p className="mt-1.5 border-t border-white/10 dark:border-black/5 pt-1 text-[8.5px] font-black text-brand-primary text-center">✏️ 클릭하여 수정</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Daily Table List (Accordion style) */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-brand-gray-900 dark:text-white flex items-center gap-2 ml-1">
                <History size={16} className="text-brand-gray-400" />
                상세 수유 기록 (일자별 아코디언)
              </h4>

              {availableDays.length > 0 ? (
                <div className="space-y-3">
                  {availableDays.map(dayKey => {
                    const dayRecords = groupedByDate[dayKey];
                    const stats = getDayStats(dayRecords);
                    const isExpanded = !!expandedDays[dayKey];
                    
                    // Format date label beautifully
                    const dateObj = new Date(dayRecords[0].date);
                    const formattedDate = dateObj.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

                    return (
                      <div 
                        key={dayKey} 
                        className="bg-white dark:bg-apple-card rounded-[24px] border border-brand-gray-100 dark:border-apple-border overflow-hidden shadow-sm transition-all"
                      >
                        {/* Day Accordion Header */}
                        <div 
                          onClick={() => toggleDay(dayKey)}
                          className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-brand-gray-50/50 dark:hover:bg-apple-elevated/20 transition-all select-none"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-brand-gray-400" />
                            <span className="text-[15px] font-black text-brand-gray-800 dark:text-white">{formattedDate}</span>
                            <span className="text-[11px] font-black bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full">
                              총 {dayRecords.length}회 수유
                            </span>
                          </div>

                          {/* Quick Summary Badges */}
                          <div className="flex items-center gap-4">
                            <div className="flex flex-wrap gap-2 text-[11px] font-bold text-brand-gray-500">
                              {stats.formula > 0 && <span>🍼 분유: {stats.formula}ml</span>}
                              {stats.breast > 0 && <span>🤱 모유: {stats.breast}분</span>}
                              {stats.babyfood > 0 && <span>🥣 이유식: {stats.babyfood}g</span>}
                              {stats.avgInterval !== '계산 불가' && (
                                <span className="text-brand-primary dark:text-brand-primary-light">
                                  ⏱️ 평균 텀: {stats.avgInterval}
                                </span>
                              )}
                            </div>
                            <div className="text-brand-gray-400 dark:text-brand-gray-600 pl-2">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </div>
                        </div>

                        {/* Day Accordion Details */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-brand-gray-100 dark:border-apple-border/50 p-4 bg-brand-gray-50/20 dark:bg-apple-black/10">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs text-brand-gray-500 dark:text-brand-gray-400 min-w-[600px]">
                                    <thead>
                                      <tr className="border-b border-brand-gray-100 dark:border-apple-border/50 text-[10px] font-black text-brand-gray-400 uppercase tracking-wider pb-2">
                                        <th className="py-2.5 px-3">시간</th>
                                        <th className="py-2.5 px-3">종류</th>
                                        <th className="py-2.5 px-3 text-right">양 / 시간</th>
                                        <th className="py-2.5 px-3 text-center">수유 간격(텀)</th>
                                        <th className="py-2.5 px-3">메모</th>
                                        <th className="py-2.5 px-3 text-center">작업</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-gray-100/50 dark:divide-apple-border/30">
                                      {dayRecords.map(r => {
                                        const time = new Date(r.date);
                                        const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        
                                        let typeLabel = '🍼 분유';
                                        let typeStyle = 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20';
                                        let detailVal = `${r.amount} ml`;

                                        if (r.type === 'breast') {
                                          typeLabel = '🤱 모유';
                                          typeStyle = 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20';
                                          detailVal = `총 ${r.breastTotal}분 (좌 ${r.breastLeft}m / 우 ${r.breastRight}m)`;
                                        } else if (r.type === 'babyfood') {
                                          typeLabel = '🥣 이유식';
                                          typeStyle = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20';
                                          detailVal = `${r.amount} g`;
                                        }

                                        return (
                                          <tr key={r.id} className="hover:bg-brand-gray-50/50 dark:hover:bg-apple-elevated/10 transition-colors font-medium">
                                            <td className="py-3 px-3 font-bold text-brand-gray-900 dark:text-white">
                                              {formattedTime}
                                            </td>
                                            <td className="py-3 px-3">
                                              <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black", typeStyle)}>
                                                {typeLabel}
                                              </span>
                                            </td>
                                            <td className="py-3 px-3 text-right font-black text-brand-gray-800 dark:text-brand-gray-200">
                                              {detailVal}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                              <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-md",
                                                r.intervalStr === '첫 수유' 
                                                  ? "bg-brand-gray-100 text-brand-gray-400 dark:bg-apple-border dark:text-brand-gray-500" 
                                                  : "text-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10"
                                              )}>
                                                {r.intervalStr}
                                              </span>
                                            </td>
                                            <td className="py-3 px-3 text-xs text-brand-gray-500 dark:text-brand-gray-400 italic max-w-[180px] truncate" title={r.notes}>
                                              {r.notes || '-'}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                              <button 
                                                onClick={() => {
                                                  setEditingRecord(r);
                                                  setIsEditOpen(true);
                                                }}
                                                className="p-1.5 rounded-lg text-brand-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-all active:scale-90 mr-1"
                                                title="기록 수정"
                                              >
                                                <Pencil size={14} />
                                              </button>
                                              <button 
                                                onClick={() => {
                                                  if (window.confirm('이 수유 기록을 삭제하시겠습니까?')) {
                                                    onDeleteRecord(r.id);
                                                  }
                                                }}
                                                className="p-1.5 rounded-lg text-brand-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-90"
                                                title="기록 삭제"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-brand-gray-400 bg-white dark:bg-apple-card rounded-[2.5rem] border border-dashed border-brand-gray-200 dark:border-apple-border shadow-sm">
                  <History size={36} className="mb-3 opacity-20 text-brand-gray-500" />
                  <p className="text-sm font-bold">아직 기록된 수유 정보가 없습니다.</p>
                  <p className="text-xs text-brand-gray-400 mt-1 font-medium">실시간 대시보드 카드에서 첫 수유를 기록해 보세요!</p>
                </div>
              )}
            </div>

            {/* Section 3: Guideline Tips */}
            <div className="bg-brand-primary/5 dark:bg-brand-primary/10 p-6 rounded-[2rem] border border-brand-primary/10 flex items-start gap-4">
              <div className="w-10 h-10 bg-white dark:bg-apple-card rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-brand-primary/10">
                <Info size={20} className="text-brand-primary" />
              </div>
              <div>
                <h4 className="text-sm font-black text-brand-gray-900 dark:text-white mb-1">우리 아이 수유 & 이유식 텀 관리 팁</h4>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed font-medium">
                  생후 {childInfo.months}개월인 아이의 권장 수유(분유/모유) 텀은 **약 {recommendedMilkInterval}시간**, 이유식 권장 텀은 **약 {recommendedSolidInterval}시간**입니다. 밤중 수유는 서서히 줄여나가며, 낮 동안 규칙적인 텀을 완성해가는 것이 아기의 위장 발달과 숙면(수면 교육)에 매우 긍정적입니다. 일관된 수유 패턴은 아기의 감정 안정에도 도움을 줍니다.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <FeedingEditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingRecord(null);
        }}
        record={editingRecord}
        onSave={onUpdateRecord}
        childInfo={childInfo}
      />
    </AnimatePresence>
  );
};

export default FeedingHistoryModal;
