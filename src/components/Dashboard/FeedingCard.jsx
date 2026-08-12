// src/components/Dashboard/FeedingCard.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Baby, 
  Clock, 
  Plus, 
  Minus, 
  Save, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../utils/uiUtils';

const FeedingCard = ({
  feedingRecords = [],
  onSaveFeeding,
  onShowChart,
  childInfo
}) => {
  // Tabs: 'formula' (분유), 'breast' (모유), 'babyfood' (이유식)
  const [activeTab, setActiveTab] = React.useState('formula');

  // Input states
  const [amount, setAmount] = React.useState(160); // ml for formula, g for babyfood
  const [notes, setNotes] = React.useState('');

  // Breastfeeding timer states
  const [activeBreast, setActiveBreast] = React.useState('none'); // 'left', 'right', 'none'
  const [breastLeftSec, setBreastLeftSec] = React.useState(0);
  const [breastRightSec, setBreastRightSec] = React.useState(0);
  const [isTimerManual, setIsTimerManual] = React.useState(false); // 수동 입력 전환 여부

  // For manual breast inputs (in minutes)
  const [manualLeftMin, setManualLeftMin] = React.useState(10);
  const [manualRightMin, setManualRightMin] = React.useState(10);

  // Time settings
  const [timeOffset, setTimeOffset] = React.useState(0); // 0 (방금전), 5 (5분전), 15 (15분전), 30 (30분전)
  const [customTime, setCustomTime] = React.useState(''); // HH:MM custom time

  // Real-time elapsed time state (updated every minute)
  const [elapsedText, setElapsedText] = React.useState('기록 없음');
  const [isElapsedOverdue, setIsElapsedOverdue] = React.useState(false);

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

  const recommendedIntervalHours = getFeedingIntervalHours(childInfo.months, activeTab);

  // Active breastfeeding timer logic
  React.useEffect(() => {
    let interval = null;
    if (activeBreast === 'left') {
      interval = setInterval(() => {
        setBreastLeftSec(prev => prev + 1);
      }, 1000);
    } else if (activeBreast === 'right') {
      interval = setInterval(() => {
        setBreastRightSec(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeBreast]);

  // Real-time calculation of time since last feed
  React.useEffect(() => {
    const updateElapsed = () => {
      if (feedingRecords.length === 0) {
        setElapsedText('첫 기록을 등록하세요 🌱');
        setIsElapsedOverdue(false);
        return;
      }

      const lastFeed = feedingRecords[0];
      const diffMs = Date.now() - new Date(lastFeed.date).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (hours === 0) {
        setElapsedText(`${mins}분 전`);
      } else {
        setElapsedText(`${hours}시간 ${mins}분 전`);
      }

      // Check if interval is exceeded
      const elapsedHours = diffMins / 60;
      setIsElapsedOverdue(elapsedHours >= recommendedIntervalHours);
    };

    updateElapsed();
    const intervalId = setInterval(updateElapsed, 60000); // update every minute
    return () => clearInterval(intervalId);
  }, [feedingRecords, recommendedIntervalHours]);

  // Preset quick amount setters
  const formulaPresets = [80, 120, 160, 200, 240];
  const babyFoodPresets = [60, 80, 100, 120, 150];

  // Helper: Format timer seconds (MM:SS)
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper: Get today's KST stats
  const todayStats = React.useMemo(() => {
    const todayStr = new Date().toLocaleDateString();
    const todayFeeds = feedingRecords.filter(r => new Date(r.date).toLocaleDateString() === todayStr);

    let formulaTotal = 0;
    let breastTotalMin = 0;
    let babyfoodTotal = 0;

    todayFeeds.forEach(r => {
      if (r.type === 'formula') formulaTotal += r.amount;
      else if (r.type === 'breast') breastTotalMin += r.breastTotal;
      else if (r.type === 'babyfood') babyfoodTotal += r.amount;
    });

    return {
      count: todayFeeds.length,
      formula: formulaTotal,
      breast: breastTotalMin,
      babyfood: babyfoodTotal
    };
  }, [feedingRecords]);

  // Save handler
  const handleSave = () => {
    // Determine the exact timestamp based on offset or custom time
    let recordDate = new Date();
    if (customTime) {
      const [hrs, mins] = customTime.split(':').map(Number);
      recordDate.setHours(hrs);
      recordDate.setMinutes(mins);
      recordDate.setSeconds(0);
    } else if (timeOffset > 0) {
      recordDate = new Date(Date.now() - timeOffset * 60000);
    }

    let recordData = {
      date: recordDate.toISOString(),
      type: activeTab,
      notes: notes.trim()
    };

    if (activeTab === 'formula') {
      recordData.amount = Number(amount);
    } else if (activeTab === 'babyfood') {
      recordData.amount = Number(amount);
    } else if (activeTab === 'breast') {
      let lMin = 0;
      let rMin = 0;
      if (isTimerManual) {
        lMin = Number(manualLeftMin);
        rMin = Number(manualRightMin);
      } else {
        lMin = Math.round(breastLeftSec / 60);
        rMin = Math.round(breastRightSec / 60);
        // Fallback to 1 minute if timer ran but less than 30s but not 0
        if (breastLeftSec > 0 && lMin === 0) lMin = 1;
        if (breastRightSec > 0 && rMin === 0) rMin = 1;
      }
      recordData.breastLeft = lMin;
      recordData.breastRight = rMin;
      recordData.breastTotal = lMin + rMin;
      recordData.amount = 0;
    }

    onSaveFeeding(recordData);

    // Reset temporary states
    setNotes('');
    setTimeOffset(0);
    setCustomTime('');
    setActiveBreast('none');
    setBreastLeftSec(0);
    setBreastRightSec(0);
  };

  // Determine next recommended feeding time
  const nextRecommendedTimeText = React.useMemo(() => {
    if (feedingRecords.length === 0) return '기록 등록 후 제공';
    const lastFeed = feedingRecords[0];
    const recommendedMs = recommendedIntervalHours * 60 * 60 * 1000;
    const nextDate = new Date(new Date(lastFeed.date).getTime() + recommendedMs);
    
    return nextDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [feedingRecords, recommendedIntervalHours]);

  return (
    <div className="card-container p-6 flex flex-col h-full bg-white dark:bg-apple-card shadow-soft rounded-[32px] border-none relative overflow-hidden">
      {/* Dynamic Background Glow matching category */}
      <div 
        className={cn(
          "absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 dark:opacity-45 transition-colors duration-1000 pointer-events-none",
          activeTab === 'formula' ? 'bg-violet-400' : activeTab === 'breast' ? 'bg-pink-400' : 'bg-emerald-400'
        )} 
      />

      {/* Header Row */}
      <div className="flex flex-col mb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[19px] font-black text-brand-gray-900 dark:text-white tracking-tight">
              {activeTab === 'babyfood' ? '수유 & 이유식 텀' : '수유 & 수유 텀'}
            </h3>
            {feedingRecords.length > 0 && (
              <span className={cn(
                "text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm",
                isElapsedOverdue 
                  ? "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400 animate-pulse" 
                  : "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary-light"
              )}>
                {isElapsedOverdue && <AlertCircle size={10} />}
                {elapsedText}
              </span>
            )}
          </div>
          <button onClick={onShowChart} className="text-[12px] font-bold text-brand-gray-400 hover:text-brand-gray-600 dark:hover:text-brand-gray-200 flex items-center gap-1 transition-colors">
            패턴 표 보기 <span className="text-[10px]">▶</span>
          </button>
        </div>
      </div>

      {/* Segmented Tab Control */}
      <div className="flex bg-brand-gray-50 dark:bg-apple-elevated p-1 rounded-2xl mb-5 relative z-10">
        {[
          { id: 'formula', label: '🍼 분유', color: 'text-violet-600 dark:text-violet-400' },
          { id: 'breast', label: '🤱 모유', color: 'text-pink-600 dark:text-pink-400' },
          { id: 'babyfood', label: '🥣 이유식', color: 'text-emerald-600 dark:text-emerald-400' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'formula') setAmount(160);
              else if (tab.id === 'babyfood') setAmount(100);
            }}
            className={cn(
              "flex-1 py-2.5 text-xs font-black rounded-xl transition-all relative",
              activeTab === tab.id 
                ? "bg-white dark:bg-apple-card shadow-sm text-brand-gray-900 dark:text-white" 
                : "text-brand-gray-400 hover:text-brand-gray-500 dark:hover:text-brand-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inputs Area */}
      <div className="flex flex-col flex-1 justify-center relative z-10">
        {activeTab === 'formula' && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <span className="text-xs font-black text-brand-gray-400 block mb-1">분유 수유량</span>
              <div className="flex items-center justify-center gap-2">
                <button 
                  onClick={() => setAmount(prev => Math.max(0, prev - 10))}
                  className="w-10 h-10 rounded-full bg-brand-gray-50 dark:bg-apple-elevated hover:bg-brand-gray-100 dark:hover:bg-apple-border text-brand-gray-600 dark:text-brand-gray-300 flex items-center justify-center transition-all active:scale-95"
                >
                  <Minus size={16} />
                </button>
                <div className="flex items-baseline justify-center">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="bg-transparent border-none text-center outline-none text-[48px] font-black w-28 focus:ring-0 p-0 leading-none tracking-tight text-violet-600 dark:text-violet-400"
                  />
                  <span className="text-lg font-black text-brand-gray-400 ml-1">ml</span>
                </div>
                <button 
                  onClick={() => setAmount(prev => Math.min(500, prev + 10))}
                  className="w-10 h-10 rounded-full bg-brand-gray-50 dark:bg-apple-elevated hover:bg-brand-gray-100 dark:hover:bg-apple-border text-brand-gray-600 dark:text-brand-gray-300 flex items-center justify-center transition-all active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Slider */}
            <input 
              type="range" 
              min="20" 
              max="300" 
              step="10"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-violet-500 h-1.5 bg-brand-gray-100 dark:bg-apple-elevated rounded-lg appearance-none cursor-pointer"
            />

            {/* Preset Buttons */}
            <div className="flex justify-between gap-1.5">
              {formulaPresets.map(p => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={cn(
                    "flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all",
                    amount === p 
                      ? "bg-violet-50 border-violet-200 text-violet-600 dark:bg-violet-950/20 dark:border-violet-900/40 dark:text-violet-400 shadow-sm"
                      : "bg-brand-gray-50 dark:bg-apple-elevated border-transparent text-brand-gray-400 dark:text-brand-gray-400"
                  )}
                >
                  {p}ml
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'babyfood' && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <span className="text-xs font-black text-brand-gray-400 block mb-1">이유식 급여량</span>
              <div className="flex items-center justify-center gap-2">
                <button 
                  onClick={() => setAmount(prev => Math.max(0, prev - 10))}
                  className="w-10 h-10 rounded-full bg-brand-gray-50 dark:bg-apple-elevated hover:bg-brand-gray-100 dark:hover:bg-apple-border text-brand-gray-600 dark:text-brand-gray-300 flex items-center justify-center transition-all active:scale-95"
                >
                  <Minus size={16} />
                </button>
                <div className="flex items-baseline justify-center">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="bg-transparent border-none text-center outline-none text-[48px] font-black w-28 focus:ring-0 p-0 leading-none tracking-tight text-emerald-600 dark:text-emerald-400"
                  />
                  <span className="text-lg font-black text-brand-gray-400 ml-1">g</span>
                </div>
                <button 
                  onClick={() => setAmount(prev => Math.min(500, prev + 10))}
                  className="w-10 h-10 rounded-full bg-brand-gray-50 dark:bg-apple-elevated hover:bg-brand-gray-100 dark:hover:bg-apple-border text-brand-gray-600 dark:text-brand-gray-300 flex items-center justify-center transition-all active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Slider */}
            <input 
              type="range" 
              min="10" 
              max="250" 
              step="5"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-brand-gray-100 dark:bg-apple-elevated rounded-lg appearance-none cursor-pointer"
            />

            {/* Preset Buttons */}
            <div className="flex justify-between gap-1.5">
              {babyFoodPresets.map(p => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={cn(
                    "flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all",
                    amount === p 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 shadow-sm"
                      : "bg-brand-gray-50 dark:bg-apple-elevated border-transparent text-brand-gray-400 dark:text-brand-gray-400"
                  )}
                >
                  {p}g
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'breast' && (
          <div className="space-y-4">
            {/* Input Method Toggle */}
            <div className="flex justify-end">
              <button 
                onClick={() => setIsTimerManual(!isTimerManual)}
                className="text-[10px] font-black px-2.5 py-1 rounded-full bg-brand-gray-50 dark:bg-apple-elevated text-brand-gray-500 dark:text-brand-gray-400 border border-brand-gray-100 dark:border-apple-border/40 hover:scale-105 active:scale-95 transition-all"
              >
                {isTimerManual ? '⏱️ 실시간 타이머 모드' : '✍️ 직접 시간 입력'}
              </button>
            </div>

            {!isTimerManual ? (
              // Timer Mode UI
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-2 gap-4 w-full mb-3">
                  {/* Left Breast Timer */}
                  <div 
                    onClick={() => {
                      if (activeBreast === 'left') setActiveBreast('none');
                      else setActiveBreast('left');
                    }}
                    className={cn(
                      "p-4 rounded-2xl flex flex-col items-center border transition-all cursor-pointer relative overflow-hidden",
                      activeBreast === 'left' 
                        ? "bg-pink-50/60 border-pink-200 dark:bg-pink-950/20 dark:border-pink-900/40 text-pink-600 dark:text-pink-400 scale-[1.02]" 
                        : "bg-brand-gray-50 dark:bg-apple-elevated border-transparent text-brand-gray-600 dark:text-brand-gray-300"
                    )}
                  >
                    {activeBreast === 'left' && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                    )}
                    <span className="text-[11px] font-black text-brand-gray-400 mb-1">왼쪽 수유</span>
                    <span className="text-[22px] font-black tracking-tight leading-none mb-2">{formatTime(breastLeftSec)}</span>
                    <div className="flex items-center gap-1">
                      {activeBreast === 'left' ? <Pause size={12} /> : <Play size={12} />}
                      <span className="text-[10px] font-bold">{activeBreast === 'left' ? '일시정지' : '시작'}</span>
                    </div>
                  </div>

                  {/* Right Breast Timer */}
                  <div 
                    onClick={() => {
                      if (activeBreast === 'right') setActiveBreast('none');
                      else setActiveBreast('right');
                    }}
                    className={cn(
                      "p-4 rounded-2xl flex flex-col items-center border transition-all cursor-pointer relative overflow-hidden",
                      activeBreast === 'right' 
                        ? "bg-pink-50/60 border-pink-200 dark:bg-pink-950/20 dark:border-pink-900/40 text-pink-600 dark:text-pink-400 scale-[1.02]" 
                        : "bg-brand-gray-50 dark:bg-apple-elevated border-transparent text-brand-gray-600 dark:text-brand-gray-300"
                    )}
                  >
                    {activeBreast === 'right' && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                    )}
                    <span className="text-[11px] font-black text-brand-gray-400 mb-1">오른쪽 수유</span>
                    <span className="text-[22px] font-black tracking-tight leading-none mb-2">{formatTime(breastRightSec)}</span>
                    <div className="flex items-center gap-1">
                      {activeBreast === 'right' ? <Pause size={12} /> : <Play size={12} />}
                      <span className="text-[10px] font-bold">{activeBreast === 'right' ? '일시정지' : '시작'}</span>
                    </div>
                  </div>
                </div>

                {/* Reset timers button */}
                {(breastLeftSec > 0 || breastRightSec > 0) && (
                  <button 
                    onClick={() => {
                      setActiveBreast('none');
                      setBreastLeftSec(0);
                      setBreastRightSec(0);
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold text-brand-gray-400 hover:text-brand-gray-600 dark:hover:text-brand-gray-200 transition-colors"
                  >
                    <RotateCcw size={10} />
                    타이머 초기화
                  </button>
                )}
              </div>
            ) : (
              // Manual Input Mode UI
              <div className="space-y-4">
                {/* Left side input */}
                <div className="flex justify-between items-center bg-brand-gray-50 dark:bg-apple-elevated p-3 rounded-2xl">
                  <span className="text-xs font-black text-brand-gray-600 dark:text-brand-gray-300">왼쪽 수유 시간</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={manualLeftMin}
                      onChange={(e) => setManualLeftMin(Number(e.target.value))}
                      className="bg-transparent border-none w-10 text-right outline-none text-base font-black focus:ring-0 p-0 text-pink-500" 
                    />
                    <span className="text-xs font-bold text-brand-gray-400">분</span>
                  </div>
                </div>
                {/* Right side input */}
                <div className="flex justify-between items-center bg-brand-gray-50 dark:bg-apple-elevated p-3 rounded-2xl">
                  <span className="text-xs font-black text-brand-gray-600 dark:text-brand-gray-300">오른쪽 수유 시간</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={manualRightMin}
                      onChange={(e) => setManualRightMin(Number(e.target.value))}
                      className="bg-transparent border-none w-10 text-right outline-none text-base font-black focus:ring-0 p-0 text-pink-500" 
                    />
                    <span className="text-xs font-bold text-brand-gray-400">분</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Time Selector (Quick or Custom) */}
        <div className="mt-5 space-y-2 relative z-10">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-black text-brand-gray-500 flex items-center gap-1">
              <Clock size={12} />
              {activeTab === 'babyfood' ? '급여 시각 설정' : '수유 시각 설정'}
            </span>
            {customTime ? (
              <button 
                onClick={() => setCustomTime('')}
                className="text-[10px] font-black text-brand-primary"
              >
                퀵 선택으로 복귀
              </button>
            ) : (
              <span className="text-[10px] font-bold text-brand-gray-400">
                {timeOffset === 0 ? '방금 전 (현재 시각)' : `${timeOffset}분 전`}
              </span>
            )}
          </div>

          {!customTime ? (
            <div className="flex justify-between gap-1.5">
              {[
                { offset: 0, label: '방금 전' },
                { offset: 5, label: '5m 전' },
                { offset: 15, label: '15m 전' },
                { offset: 30, label: '30m 전' }
              ].map(t => (
                <button
                  key={t.offset}
                  onClick={() => setTimeOffset(t.offset)}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-black rounded-lg border transition-all",
                    timeOffset === t.offset 
                      ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                      : "bg-white dark:bg-apple-card border-brand-gray-100 dark:border-apple-border text-brand-gray-400"
                  )}
                >
                  {t.label}
                </button>
              ))}
              <button 
                onClick={() => {
                  const now = new Date();
                  const hh = now.getHours().toString().padStart(2, '0');
                  const mm = now.getMinutes().toString().padStart(2, '0');
                  setCustomTime(`${hh}:${mm}`);
                }}
                className="flex-1 py-1.5 text-[10px] font-black rounded-lg border bg-white dark:bg-apple-card border-brand-gray-100 dark:border-apple-border text-brand-gray-400 hover:text-brand-gray-600"
              >
                시간 지정
              </button>
            </div>
          ) : (
            <input 
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full h-9 bg-brand-gray-50 dark:bg-apple-elevated border border-brand-gray-100 dark:border-apple-border rounded-xl text-center text-xs font-black text-brand-gray-800 dark:text-white outline-none focus:border-brand-primary transition-all"
            />
          )}
        </div>

        {/* Note input */}
        <input 
          type="text" 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="특이사항 기록 (예: 트림 잘함, 조금 남김)"
          className="w-full mt-4 h-11 px-4 text-xs font-medium bg-brand-gray-50 dark:bg-apple-elevated border border-transparent focus:border-brand-primary/30 rounded-xl outline-none text-brand-gray-800 dark:text-white transition-all placeholder-brand-gray-300 dark:placeholder-brand-gray-500 relative z-10"
        />
      </div>

      {/* Guidelines Panel */}
      <div className={cn(
        "rounded-2xl p-3.5 my-4 flex flex-col gap-2.5 relative z-10 border",
        isElapsedOverdue 
          ? "bg-red-50/50 dark:bg-red-950/20 border-red-100/50 dark:border-red-900/30 text-red-700 dark:text-red-400" 
          : "bg-brand-gray-50/70 dark:bg-apple-elevated/70 border-transparent text-brand-gray-700 dark:text-brand-gray-300"
      )}>
        <div className="flex justify-between items-center text-[11.5px] font-bold">
          <span className="flex items-center gap-1 text-brand-gray-400 dark:text-brand-gray-500">
            <Sparkles size={11} className="text-brand-primary" />
            {activeTab === 'babyfood' ? '성장 맞춤 식사 가이드' : '성장 맞춤 수유 가이드'}
          </span>
          <span className="text-[10px] font-black bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 px-2 py-0.5 rounded-full">
            생후 {childInfo.months}개월
          </span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-[12px] font-black">
            {activeTab === 'babyfood' ? '다음 권장 식사 시간' : '다음 권장 수유 시간'}
          </span>
          <span className={cn(
            "text-[12px] font-black",
            isElapsedOverdue ? "text-red-500" : "text-brand-gray-900 dark:text-white"
          )}>
            {nextRecommendedTimeText} ({recommendedIntervalHours}시간 텀)
          </span>
        </div>
      </div>

      {/* Today Stats Summary Row */}
      <div className="grid grid-cols-4 gap-1 py-2 border-t border-brand-gray-100 dark:border-apple-border/50 text-center relative z-10">
        <div>
          <span className="text-[9px] font-black text-brand-gray-400 uppercase block leading-none">오늘 횟수</span>
          <span className="text-[13px] font-black text-brand-gray-700 dark:text-brand-gray-200 mt-1 block">{todayStats.count}회</span>
        </div>
        <div>
          <span className="text-[9px] font-black text-brand-gray-400 uppercase block leading-none">분유 합계</span>
          <span className="text-[13px] font-black text-brand-gray-700 dark:text-brand-gray-200 mt-1 block">{todayStats.formula}ml</span>
        </div>
        <div>
          <span className="text-[9px] font-black text-brand-gray-400 uppercase block leading-none">모유 수유</span>
          <span className="text-[13px] font-black text-brand-gray-700 dark:text-brand-gray-200 mt-1 block">{todayStats.breast}분</span>
        </div>
        <div>
          <span className="text-[9px] font-black text-brand-gray-400 uppercase block leading-none">이유식</span>
          <span className="text-[13px] font-black text-brand-gray-700 dark:text-brand-gray-200 mt-1 block">{todayStats.babyfood}g</span>
        </div>
      </div>

      {/* Save Button (Floating Style) */}
      <div className="mt-auto pt-4 relative z-10">
        <button 
          onClick={handleSave}
          disabled={activeTab === 'breast' && !isTimerManual && breastLeftSec === 0 && breastRightSec === 0}
          className={cn(
            "w-full h-[56px] rounded-full font-black text-[16px] shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2",
            activeTab === 'formula' 
              ? "bg-violet-600 text-white shadow-violet-600/25 disabled:opacity-50" 
              : activeTab === 'breast' 
                ? "bg-pink-500 text-white shadow-pink-500/25 disabled:opacity-50" 
                : "bg-emerald-600 text-white shadow-emerald-600/25 disabled:opacity-50"
          )}
        >
          <Save size={18} />
          {activeTab === 'formula' 
            ? '현재 분유 기록하기' 
            : activeTab === 'breast' 
              ? '현재 모유 기록하기' 
              : '현재 이유식 기록하기'}
        </button>
      </div>
    </div>
  );
};

export default FeedingCard;
