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
    <div className="card-container p-6 flex flex-col h-full bg-white dark:bg-apple-card shadow-soft rounded-[32px] border-none relative overflow-hidden">
      {/* Background Glow based on temperature */}
      <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 dark:opacity-40 transition-colors duration-1000 pointer-events-none", isHighFever ? "bg-brand-primary" : "bg-blue-400")} />

      {/* Header Row */}
      <div className="flex flex-col mb-4 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-[19px] font-black text-brand-gray-900 dark:text-white tracking-tight mb-1">실시간 체온 피드백</h3>
          <button onClick={onShowChart} className="text-[12px] font-bold text-brand-gray-400 hover:text-brand-gray-600 flex items-center gap-1 transition-colors">
            기록 보기 <span className="text-[10px]">▶</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 relative z-10">
        
        {/* Top: Giant Typography */}
        <div className="flex flex-col items-center justify-center py-6 mb-2">
          <span className={cn("text-[14px] font-black px-4 py-1.5 rounded-full mb-4 shadow-sm", isHighFever ? "bg-red-50 text-brand-primary dark:bg-red-900/30" : "bg-blue-50 text-blue-600 dark:bg-blue-900/30")}>
            {status.label}
          </span>
          <div className="flex items-start justify-center gap-1">
            <input 
              type="number" 
              step="0.1"
              value={inputVal || ''} 
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleTempChange(e.target.value)}
              className={cn("bg-transparent border-none outline-none text-[64px] font-black text-center w-40 focus:ring-0 p-0 leading-none tracking-tighter", isHighFever ? "text-brand-primary" : "text-brand-gray-900 dark:text-white")}
              placeholder="36.5"
            />
            <span className={cn("text-[20px] font-bold mt-2", isHighFever ? "text-brand-primary/60" : "text-brand-gray-400")}>°C</span>
          </div>
          <p className="text-[15px] font-bold text-brand-gray-500 mt-2">{status.desc}</p>
        </div>

        {/* Middle: Glassmorphism Guidelines */}
        <div className={cn("rounded-[24px] p-5 mb-5 flex flex-col gap-3", isHighFever ? "bg-red-50/80 dark:bg-red-900/20" : "bg-brand-gray-50/80 dark:bg-apple-elevated/80")}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-brand-gray-500">
              <CheckCircle2 size={14} className={isHighFever ? "text-brand-primary" : "text-blue-500"} />
              대처 가이드
            </div>
            <span className="text-[14px] font-black text-brand-gray-900 dark:text-white text-right max-w-[60%] leading-tight">{status.action}</span>
          </div>
          <div className="w-full h-px bg-black/5 dark:bg-white/5" />
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-brand-gray-500">
              <AlertCircle size={14} className={isHighFever ? "text-brand-primary" : "text-blue-500"} />
              복용 가이드
            </div>
            <span className={cn("text-[14px] font-black text-right max-w-[60%] leading-tight", selectedTemp >= 38.5 ? "text-brand-primary" : "text-brand-gray-900 dark:text-white")}>{status.meds}</span>
          </div>
        </div>

        {/* Bottom: Pill Toggle for Medication */}
        <div 
          onClick={() => {
            setHasTakenMeds(!hasTakenMeds);
            if (!hasTakenMeds) setMedType('acetaminophen');
            else setMedType('none');
          }}
          className={cn("flex items-center justify-between p-4 rounded-[20px] cursor-pointer transition-colors border", hasTakenMeds ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30" : "bg-white dark:bg-apple-card border-brand-gray-100 dark:border-apple-border")}
        >
          <span className={cn("text-[15px] font-black", hasTakenMeds ? "text-emerald-600 dark:text-emerald-400" : "text-brand-gray-800 dark:text-brand-gray-200")}>
            💊 해열제 복용 완료
          </span>
          <div className={cn("w-12 h-7 rounded-full flex items-center p-1 transition-colors duration-300 shadow-inner", hasTakenMeds ? "bg-emerald-500" : "bg-brand-gray-200 dark:bg-brand-gray-700")}>
            <div className={cn("w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300", hasTakenMeds ? "translate-x-5" : "translate-x-0")} />
          </div>
        </div>

        {hasTakenMeds && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-3 flex gap-2"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setMedType('acetaminophen'); }}
              className={cn("flex-1 py-3 rounded-[16px] text-[13px] font-bold transition-all border", medType === 'acetaminophen' ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-transparent" : "bg-brand-gray-50 dark:bg-apple-elevated border-transparent text-brand-gray-500")}
            >
              아세트아미노펜
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setMedType('ibuprofen'); }}
              className={cn("flex-1 py-3 rounded-[16px] text-[13px] font-bold transition-all border", medType === 'ibuprofen' ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-transparent" : "bg-brand-gray-50 dark:bg-apple-elevated border-transparent text-brand-gray-500")}
            >
              이부프로펜 계열
            </button>
          </motion.div>
        )}
      </div>

      {/* Save Button (Floating Style) */}
      <div className="mt-auto pt-6 relative z-10">
        <button 
          onClick={() => {
            const noteText = medType === 'acetaminophen' ? "아세트아미노펜 복용" : medType === 'ibuprofen' ? "이부프로펜 계열 복용" : "특이사항 없음";
            onSaveTemp(selectedTemp, noteText, medType);
            setHasTakenMeds(false);
            setMedType('none');
          }}
          className={cn("w-full h-[56px] rounded-full font-black text-[16px] shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2", isHighFever ? "bg-brand-primary text-white shadow-brand-primary/25" : "bg-brand-gray-900 dark:bg-white text-white dark:text-brand-gray-900 shadow-brand-gray-900/20")}
        >
          <Save size={18} />
          현재 체온 기록하기
        </button>
      </div>
    </div>
  );
};

export default TemperatureCard;
