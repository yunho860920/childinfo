// src/components/Dashboard/GrowthCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import ProgressRing from '../common/ProgressRing';

const GrowthCard = ({ 
  childInfo, 
  setChildInfo, 
  percentile,
  handleBirthDateChange,
  handleAddGrowthRecord,
  onShowChart
}) => {
  const dateInputRef = React.useRef(null);

  return (
    <div className="card-container p-5 flex flex-col h-full">
      {/* Title */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-[17px] font-bold text-brand-gray-800 dark:text-white tracking-tight">우리 아이 성장 정보</h3>
          <p className="text-[12px] font-medium text-brand-gray-400 mt-0.5">2017 KCDC 성장 표준치 기준</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-4 mb-4 flex-1">
        
        {/* Top: Progress Ring + Title (Compact) */}
        <div className="flex items-center gap-4 p-4 bg-brand-gray-50/50 dark:bg-apple-elevated/30 rounded-[20px] border border-brand-gray-100/30 dark:border-apple-border/50">
          <div className="shrink-0">
            <ProgressRing 
              percentage={percentile || 0} 
              size={72} 
              strokeWidth={7}
              onShowChart={onShowChart}
              id="growth-gradient"
              gradientColors={["#F04452", "#FF6B6B"]}
            >
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-brand-gray-900 dark:text-white tracking-tighter leading-none mt-0.5">
                  {percentile || 0}%
                </span>
              </div>
            </ProgressRing>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-bold text-brand-gray-400 mb-1">현재 성장 백분위</span>
            <span className="text-[17px] font-black text-brand-gray-900 dark:text-white tracking-tight truncate">
              또래 상위 {100 - (percentile || 0)}% 수준
            </span>
            <button onClick={onShowChart} className="mt-2 text-left text-[12px] font-bold text-brand-primary hover:underline flex items-center gap-1 w-max">
              성장 차트 자세히 보기 <span className="text-[10px]">▶</span>
            </button>
          </div>
        </div>

        {/* Bottom: Unified List for Inputs */}
        <div className="bg-brand-gray-50/80 dark:bg-apple-elevated rounded-[20px] overflow-hidden flex flex-col border border-brand-gray-100/50 dark:border-apple-border">
          
          <div className="flex items-center justify-between py-3 px-4 border-b border-brand-gray-200/40 dark:border-apple-border/40">
            <span className="text-[13px] font-bold text-brand-gray-500 w-24 shrink-0 pl-1">생년월일</span>
            <div 
              onClick={() => dateInputRef.current?.showPicker()}
              className="flex-1 text-right cursor-pointer group pr-1"
            >
              <span className="text-[15px] font-black text-brand-gray-900 dark:text-white group-hover:text-brand-primary transition-colors">
                {childInfo.birthDate.replace(/-/g, '.')}
              </span>
              <input 
                ref={dateInputRef}
                type="date" 
                value={childInfo.birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
                className="sr-only" 
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 border-b border-brand-gray-200/40 dark:border-apple-border/40">
            <span className="text-[13px] font-bold text-brand-gray-500 w-24 shrink-0 pl-1">성별</span>
            <div className="flex-1 relative pr-1">
              <select 
                value={childInfo.gender}
                onChange={(e) => setChildInfo(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full bg-transparent border-none outline-none text-[15px] font-black text-brand-gray-900 dark:text-white text-right appearance-none cursor-pointer hover:text-brand-primary transition-colors focus:ring-0"
                dir="rtl"
              >
                <option value="male">남아</option>
                <option value="female">여아</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 border-b border-brand-gray-200/40 dark:border-apple-border/40">
            <span className="text-[13px] font-bold text-brand-gray-500 w-24 shrink-0 pl-1">키 (cm)</span>
            <input 
              type="number" 
              value={childInfo.height || ''} 
              onFocus={(e) => e.target.select()}
              onChange={(e) => setChildInfo(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-black text-brand-gray-900 dark:text-white text-right placeholder-brand-gray-300 focus:ring-0 pr-1" 
              placeholder="0.0"
            />
          </div>

          <div className="flex items-center justify-between py-3 px-4">
            <span className="text-[13px] font-bold text-brand-gray-500 w-24 shrink-0 pl-1">몸무게 (kg)</span>
            <input 
              type="number" 
              value={childInfo.weight || ''} 
              onFocus={(e) => e.target.select()}
              onChange={(e) => setChildInfo(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-black text-brand-gray-900 dark:text-white text-right placeholder-brand-gray-300 focus:ring-0 pr-1" 
              placeholder="0.0"
            />
          </div>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="mt-auto pt-2">
        <button 
          onClick={() => handleAddGrowthRecord({ date: new Date().toISOString().split('T')[0], height: childInfo.height, weight: childInfo.weight })}
          className="w-full h-[52px] bg-brand-primary text-white rounded-[16px] font-black text-[15px] shadow-lg shadow-brand-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
        >
          <Save size={18} />
          저장하기
        </button>
      </div>
    </div>
  );
};

export default GrowthCard;
