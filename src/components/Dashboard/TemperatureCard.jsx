// src/components/Dashboard/TemperatureCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import ProgressRing from '../common/ProgressRing';
import { cn } from '../../utils/uiUtils';

const TemperatureCard = ({ 
  selectedTemp, 
  setSelectedTemp,
  onSaveTemp,
  onShowChart
}) => {
  const [hasTakenMeds, setHasTakenMeds] = React.useState(false);
  const [medType, setMedType] = React.useState('none'); // 'none', 'acetaminophen', 'ibuprofen'
  const [inputVal, setInputVal] = React.useState(selectedTemp.toString());

  // Update local input when parent state changes
  React.useEffect(() => {
    if (parseFloat(inputVal) !== selectedTemp) {
      setInputVal(selectedTemp.toString());
    }
  }, [selectedTemp]);

  const handleTempChange = (val) => {
    setInputVal(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 30 && parsed <= 45) {
      setSelectedTemp(parsed);
    }
  };

  const getStatus = (temp) => {
    const t = parseFloat(temp) || 36.5;
    if (t >= 39.0) return { 
      label: '고열 (주의)', 
      desc: '즉시 소아과 내방 권장', 
      color: 'text-red-500', 
      bg: 'bg-red-500/5', 
      action: '미온수 마사지 병행', 
      meds: '해열제 복용 필수 (39도↑)' 
    };
    if (t >= 38.0) return { 
      label: '발열 (관찰)', 
      desc: '해열제 복용 후 추이 관찰', 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/5', 
      action: '충분한 수분 섭취', 
      meds: '해열제 복용 권장 (38도↑)' 
    };
    if (t >= 37.5) return { 
      label: '미열 (초기)', 
      desc: '30분 간격으로 추가 측정', 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-500/5', 
      action: '얇은 옷으로 교체', 
      meds: '컨디션에 따라 결정' 
    };
    return { 
      label: '정상 체온', 
      desc: '아이의 컨디션이 좋습니다', 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/5', 
      action: '평소대로 활동', 
      meds: '복용 불필요' 
    };
  };

  const status = getStatus(selectedTemp);
  const tempPercentage = ((selectedTemp - 35) / (42 - 35)) * 100;
  const isHighFever = selectedTemp >= 38;

  return (
    <div className="card-container p-7 flex flex-col h-full">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h3 className="text-[17px] font-bold text-brand-gray-800 dark:text-white tracking-tight">실시간 체온 피드백</h3>
          <p className="text-[12px] font-medium text-brand-gray-400 mt-0.5">상태 분석 및 대처 가이드</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6 mb-8 flex-1">
        
        {/* Top: Progress Ring + Value (Compact) */}
        <div className="flex items-center gap-5 p-5 bg-brand-gray-50/50 dark:bg-apple-elevated/30 rounded-[24px] border border-brand-gray-100/30 dark:border-apple-border/50">
          <div className="shrink-0">
            <ProgressRing 
              percentage={tempPercentage} 
              size={90} 
              strokeWidth={8}
              onShowChart={onShowChart}
              id="temp-gradient"
              gradientColors={isHighFever ? ["#F04452", "#FF6B6B"] : ["#3182F6", "#4DACFF"]}
            >
              <div className="flex flex-col items-center mt-1">
                <div className="flex items-baseline gap-0.5">
                  <span className={cn("text-2xl font-black tracking-tighter leading-none", isHighFever ? "text-brand-primary" : "text-brand-secondary")}>
                    {inputVal}
                  </span>
                  <span className={cn("text-[10px] font-bold", isHighFever ? "text-brand-primary/60" : "text-brand-secondary/60")}>°C</span>
                </div>
              </div>
            </ProgressRing>
          </div>
          <div className="flex flex-col min-w-0">
            <span className={cn("text-[12px] font-bold mb-1", isHighFever ? "text-brand-primary/80" : "text-brand-secondary/80")}>{status.label}</span>
            <span className="text-[16px] font-black text-brand-gray-900 dark:text-white tracking-tight leading-tight truncate">
              {status.desc}
            </span>
            <button onClick={onShowChart} className="mt-2 text-left text-[12px] font-bold text-brand-gray-400 hover:text-brand-gray-600 hover:underline flex items-center gap-1 w-max">
              체온 기록 차트 보기 <span className="text-[10px]">▶</span>
            </button>
          </div>
        </div>

        {/* Middle: Unified List for Inputs & Guidelines */}
        <div className="bg-brand-gray-50/80 dark:bg-apple-elevated rounded-[24px] overflow-hidden flex flex-col border border-brand-gray-100/50 dark:border-apple-border">
          
          <div className="flex items-center justify-between p-4 border-b border-brand-gray-200/50 dark:border-apple-border/50">
            <span className="text-[13px] font-bold text-brand-gray-500 w-24 shrink-0 pl-1">현재 체온</span>
            <div className="flex-1 relative pr-1 flex items-center justify-end gap-1">
              <input 
                type="number" 
                step="0.1"
                value={inputVal || ''} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleTempChange(e.target.value)}
                className={cn("bg-transparent border-none outline-none text-[18px] font-black text-right w-20 focus:ring-0", isHighFever ? "text-brand-primary" : "text-brand-secondary")}
                placeholder="36.5"
              />
              <span className={cn("text-[14px] font-bold", isHighFever ? "text-brand-primary/60" : "text-brand-secondary/60")}>°C</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 border-b border-brand-gray-200/50 dark:border-apple-border/50 bg-white/40 dark:bg-apple-card/40">
            <div className="flex justify-between items-start">
              <span className="text-[12px] font-bold text-brand-gray-400 pl-1">대처 가이드</span>
              <span className="text-[14px] font-black text-brand-gray-900 dark:text-white text-right pr-1 max-w-[60%] leading-tight">{status.action}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[12px] font-bold text-brand-gray-400 pl-1">복용 가이드</span>
              <span className={cn("text-[14px] font-black text-right pr-1 max-w-[60%] leading-tight", selectedTemp >= 38.5 ? "text-brand-primary" : "text-brand-gray-900 dark:text-white")}>{status.meds}</span>
            </div>
          </div>
          
          <div 
            onClick={() => {
              setHasTakenMeds(!hasTakenMeds);
              if (!hasTakenMeds) setMedType('acetaminophen');
              else setMedType('none');
            }}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-brand-gray-100/50 dark:hover:bg-apple-border/30 transition-colors"
          >
            <span className="text-[14px] font-bold text-brand-gray-800 dark:text-brand-gray-200 pl-1">현재 해열제 복용함</span>
            <div className={cn("w-12 h-7 rounded-full flex items-center p-1 transition-colors duration-300", hasTakenMeds ? "bg-emerald-500" : "bg-brand-gray-200 dark:bg-brand-gray-700")}>
              <div className={cn("w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300", hasTakenMeds ? "translate-x-5" : "translate-x-0")} />
            </div>
          </div>

          {hasTakenMeds && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-4 pb-4 bg-brand-gray-50/80 dark:bg-apple-elevated flex gap-2"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setMedType('acetaminophen'); }}
                className={cn("flex-1 py-3 rounded-[16px] text-[13px] font-bold transition-all border", medType === 'acetaminophen' ? "bg-white dark:bg-apple-card border-brand-primary text-brand-primary shadow-sm" : "bg-brand-gray-100/50 dark:bg-apple-border/20 border-transparent text-brand-gray-500")}
              >
                아세트아미노펜
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setMedType('ibuprofen'); }}
                className={cn("flex-1 py-3 rounded-[16px] text-[13px] font-bold transition-all border", medType === 'ibuprofen' ? "bg-white dark:bg-apple-card border-brand-primary text-brand-primary shadow-sm" : "bg-brand-gray-100/50 dark:bg-apple-border/20 border-transparent text-brand-gray-500")}
              >
                이부프로펜 계열
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-auto pt-2">
        <button 
          onClick={() => {
            const noteText = medType === 'acetaminophen' ? "아세트아미노펜 복용" : medType === 'ibuprofen' ? "이부프로펜 계열 복용" : "특이사항 없음";
            onSaveTemp(selectedTemp, noteText, medType);
            setHasTakenMeds(false);
            setMedType('none');
          }}
          className={cn("w-full h-16 rounded-[20px] font-black text-[16px] shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2", isHighFever ? "bg-brand-primary text-white shadow-brand-primary/25" : "bg-brand-gray-900 dark:bg-brand-secondary text-white shadow-brand-gray-900/20")}
        >
          <Save size={18} />
          현재 체온 데이터 저장하기
        </button>
      </div>
    </div>
  );
};

export default TemperatureCard;
