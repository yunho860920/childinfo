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
    <div className="card-container p-7 flex flex-col h-full">
      {/* Title */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-[17px] font-bold text-brand-gray-800 dark:text-white tracking-tight">우리 아이 성장 정보</h3>
          <p className="text-[12px] font-medium text-brand-gray-400 mt-0.5">2017 KCDC 성장 표준치 기준</p>
        </div>
      </div>

      {/* Main Grid: Circle on Left, Inputs on Right */}
      <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
        {/* Left: Progress Ring */}
        <div className="shrink-0">
          <ProgressRing 
            percentage={percentile || 0} 
            size={130} 
            strokeWidth={10}
            onShowChart={onShowChart}
            id="growth-gradient"
            gradientColors={["#F04452", "#FF6B6B"]}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-brand-gray-900 dark:text-white tracking-tighter">
                {percentile || 0}%
              </span>
              <span className="text-[11px] font-medium text-brand-gray-400 mt-1">
                성장 백분위
              </span>
            </div>
          </ProgressRing>
        </div>

        {/* Right: Info Area */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* BirthDate */}
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-brand-gray-500 ml-1">생년월일</p>
              <div 
                onClick={() => dateInputRef.current?.showPicker()}
                className="bg-brand-gray-50 dark:bg-apple-elevated p-3 rounded-2xl border border-transparent h-12 flex items-center justify-center cursor-pointer hover:bg-brand-gray-100 transition-colors"
              >
                <span className="text-[14px] font-bold text-brand-gray-800 dark:text-white truncate">
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
            {/* Gender */}
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-brand-gray-500 ml-1">성별</p>
              <div className="bg-brand-gray-50 dark:bg-apple-elevated p-3 rounded-2xl border border-transparent h-12 flex items-center justify-center">
                 <select 
                   value={childInfo.gender}
                   onChange={(e) => setChildInfo(prev => ({ ...prev, gender: e.target.value }))}
                   className="bg-transparent border-none outline-none text-[14px] font-bold text-brand-gray-800 dark:text-white w-full text-center appearance-none cursor-pointer"
                 >
                   <option value="male">남아</option>
                   <option value="female">여아</option>
                 </select>
              </div>
            </div>
            {/* Height */}
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-brand-gray-500 ml-1">키 (cm)</p>
              <div className="bg-brand-gray-50 dark:bg-apple-elevated p-3 rounded-2xl border border-transparent h-12 flex items-center">
                <input 
                  type="number" 
                  value={childInfo.height || ''} 
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setChildInfo(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-transparent border-none outline-none text-[14px] font-bold text-brand-gray-800 dark:text-white text-center" 
                />
              </div>
            </div>
            {/* Weight */}
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-brand-gray-500 ml-1">몸무게 (kg)</p>
              <div className="bg-brand-gray-50 dark:bg-apple-elevated p-3 rounded-2xl border border-transparent h-12 flex items-center">
                <input 
                  type="number" 
                  value={childInfo.weight || ''} 
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setChildInfo(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-transparent border-none outline-none text-[14px] font-bold text-brand-gray-800 dark:text-white text-center" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-auto">
        <button 
          onClick={() => handleAddGrowthRecord({ date: new Date().toISOString().split('T')[0], height: childInfo.height, weight: childInfo.weight })}
          className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[14px]"
        >
          <Save size={16} />
          성장 기록 저장하기
        </button>
      </div>
    </div>
  );
};

export default GrowthCard;
