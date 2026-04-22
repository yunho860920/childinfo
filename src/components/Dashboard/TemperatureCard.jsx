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

      {/* Main Grid: Circle on Left, Inputs on Right */}
      <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
        {/* Left: Progress Ring */}
        <div className="shrink-0">
          <ProgressRing 
            percentage={tempPercentage} 
            size={130} 
            strokeWidth={10}
            onShowChart={onShowChart}
            id="temp-gradient"
            gradientColors={isHighFever ? ["#F04452", "#FF6B6B"] : ["#3182F6", "#4DACFF"]}
          >
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-0.5">
                <span className={cn("text-3xl font-bold tracking-tighter", isHighFever ? "text-brand-primary" : "text-brand-secondary")}>
                  {inputVal}
                </span>
                <span className={cn("text-xs font-bold", isHighFever ? "text-brand-primary/60" : "text-brand-secondary/60")}>°C</span>
              </div>
              <span className={cn("text-[11px] font-medium mt-1", isHighFever ? "text-brand-primary" : "text-brand-secondary")}>
                {status.label}
              </span>
            </div>
          </ProgressRing>
        </div>

        {/* Right: Info Area */}
        <div className="flex-1 w-full space-y-4">
          {/* Temperature Numeric Input */}
          <div className="space-y-1.5">
            <p className="text-[12px] font-bold text-brand-gray-500 ml-1">현재 체온 입력</p>
            <div className={cn("p-3 rounded-2xl border border-transparent h-12 transition-all", isHighFever ? "bg-brand-primary/5" : "bg-brand-secondary/5")}>
              <input 
                type="number" 
                step="0.1"
                value={inputVal || ''} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleTempChange(e.target.value)}
                className={cn("w-full bg-transparent border-none outline-none text-[15px] font-bold text-center", isHighFever ? "text-brand-primary" : "text-brand-secondary")}
              />
            </div>
          </div>

          {/* Guidelines Box */}
          <div className={cn("p-4 rounded-2xl flex flex-col gap-1 transition-colors", status.bg)}>
            <div className="flex items-center justify-between">
              <span className={cn("text-[12px] font-bold", status.color)}>{status.label}</span>
              {selectedTemp >= 38 && <AlertCircle size={14} className="text-brand-primary animate-pulse" />}
            </div>
            <span className="text-[12px] font-medium text-brand-gray-500 dark:text-brand-gray-400 leading-tight">{status.desc}</span>
          </div>
        </div>
      </div>

      {/* Footer Area: Actions & Save */}
      <div className="space-y-4 mt-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-brand-gray-50 dark:bg-apple-elevated p-3 rounded-2xl">
            <p className="text-[11px] font-bold text-brand-gray-400 uppercase tracking-tight mb-1">상황별 대처</p>
            <p className="text-[13px] font-bold text-brand-gray-800 dark:text-white leading-tight truncate">{status.action}</p>
          </div>
          <div className="bg-brand-gray-50 dark:bg-apple-elevated p-3 rounded-2xl">
            <p className="text-[11px] font-bold text-brand-gray-400 uppercase tracking-tight mb-1">복용 가이드</p>
            <p className={cn("text-[13px] font-bold leading-tight truncate", selectedTemp >= 38.5 ? "text-brand-primary" : "text-brand-gray-800 dark:text-white")}>{status.meds}</p>
          </div>
        </div>

        {/* Meds Selection */}
        <div className="space-y-2">
          <div 
            onClick={() => {
              setHasTakenMeds(!hasTakenMeds);
              if (!hasTakenMeds) setMedType('acetaminophen');
              else setMedType('none');
            }}
            className="flex items-center gap-3 p-3 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl cursor-pointer hover:bg-brand-gray-100 transition-colors"
          >
            <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-all", hasTakenMeds ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white dark:bg-apple-card border-brand-gray-200 dark:border-apple-border")}>
              {hasTakenMeds && <CheckCircle2 size={14} />}
            </div>
            <span className="text-[13px] font-bold text-brand-gray-700 dark:text-brand-gray-300">현재 해열제 복용함</span>
          </div>

          {hasTakenMeds && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2 pl-1"
            >
              <button 
                onClick={() => setMedType('acetaminophen')}
                className={cn("py-2.5 px-3 rounded-xl text-[12px] font-bold transition-all", medType === 'acetaminophen' ? "bg-emerald-500 text-white" : "bg-brand-gray-100 dark:bg-apple-elevated text-brand-gray-500")}
              >
                아세트아미노펜
              </button>
              <button 
                onClick={() => setMedType('ibuprofen')}
                className={cn("py-2.5 px-3 rounded-xl text-[12px] font-bold transition-all", medType === 'ibuprofen' ? "bg-emerald-500 text-white" : "bg-brand-gray-100 dark:bg-apple-elevated text-brand-gray-500")}
              >
                이부프로펜 계열
              </button>
            </motion.div>
          )}
        </div>

        {/* Save Button */}
        <button 
          onClick={() => {
            const noteText = medType === 'acetaminophen' ? "아세트아미노펜 복용" : medType === 'ibuprofen' ? "이부프로펜 계열 복용" : "특이사항 없음";
            onSaveTemp(selectedTemp, noteText, medType);
            setHasTakenMeds(false);
            setMedType('none');
          }}
          className={cn("w-full py-4 rounded-2xl font-bold text-[14px] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2", isHighFever ? "bg-brand-primary text-white" : "bg-brand-secondary text-white")}
        >
          <Save size={16} />
          현재 체온 데이터 저장하기
        </button>
      </div>
    </div>
  );
};

export default TemperatureCard;
