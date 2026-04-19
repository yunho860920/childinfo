// src/components/Dashboard/GrowthCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Ruler, Weight, TrendingUp } from 'lucide-react';
import ProgressRing from '../common/ProgressRing';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GrowthCard = ({ 
  childInfo, 
  setChildInfo, 
  percentile,
  handleBirthDateChange,
  handleAddGrowthRecord,
  onShowChart
}) => {
  return (
    <div className="bg-white dark:bg-apple-card p-6 md:p-8 rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl overflow-hidden relative group">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-sm shadow-brand-primary/10">
              <User size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-brand-gray-900 dark:text-white leading-none">우리 아이 성장 기록</h3>
              <p className="text-[11px] font-bold text-brand-gray-400 dark:text-brand-gray-500 mt-1.5 uppercase tracking-widest">Growth Analytics</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left: Progress Ring (Visual) */}
          <div className="shrink-0">
            <ProgressRing percentage={percentile} onShowChart={onShowChart} />
          </div>

          {/* Right: Inputs */}
          <div className="flex-1 w-full space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-gray-50 dark:bg-apple-elevated p-4 rounded-3xl border border-brand-gray-100 dark:border-apple-border group/item hover:border-brand-primary/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-brand-gray-400 group-hover/item:text-brand-primary transition-colors" />
                  <span className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-tighter">생년월일</span>
                </div>
                <input 
                  type="date" value={childInfo.birthDate} 
                  onChange={(e) => handleBirthDateChange(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-base font-black text-brand-gray-900 dark:text-white" 
                />
                <p className="text-[10px] font-bold text-brand-primary mt-1">현재 {childInfo.months}개월차</p>
              </div>
              <div className="bg-brand-gray-50 dark:bg-apple-elevated p-4 rounded-3xl border border-brand-gray-100 dark:border-apple-border flex items-center justify-center">
                 <div className="text-center">
                    <p className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-tighter mb-1">성별</p>
                    <div className="flex gap-2">
                      {['male', 'female'].map(g => (
                        <button 
                          key={g} onClick={() => setChildInfo(prev => ({ ...prev, gender: g }))}
                          className={cn("px-3 py-1 rounded-lg text-xs font-black transition-all", childInfo.gender === g ? "bg-brand-primary text-white" : "bg-white dark:bg-apple-card text-brand-gray-400 border border-brand-gray-100 dark:border-apple-border")}
                        >
                          {g === 'male' ? '남' : '여'}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-gray-50 dark:bg-apple-elevated p-4 rounded-3xl border border-brand-gray-100 dark:border-apple-border group/item hover:border-brand-primary/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler size={14} className="text-brand-gray-400 group-hover/item:text-brand-primary transition-colors" />
                  <span className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-tighter">키 (cm)</span>
                </div>
                <div className="flex items-end gap-1">
                  <input 
                    type="number" step="0.1" value={childInfo.height} 
                    onChange={(e) => setChildInfo(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                    className="w-full bg-transparent border-none outline-none text-2xl font-black text-brand-gray-900 dark:text-white" 
                  />
                  <span className="text-xs font-black text-brand-gray-300 mb-1">cm</span>
                </div>
              </div>
              <div className="bg-brand-gray-50 dark:bg-apple-elevated p-4 rounded-3xl border border-brand-gray-100 dark:border-apple-border group/item hover:border-brand-primary/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Weight size={14} className="text-brand-gray-400 group-hover/item:text-brand-primary transition-colors" />
                  <span className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-tighter">몸무게 (kg)</span>
                </div>
                <div className="flex items-end gap-1">
                  <input 
                    type="number" step="0.1" value={childInfo.weight} 
                    onChange={(e) => setChildInfo(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                    className="w-full bg-transparent border-none outline-none text-2xl font-black text-brand-gray-900 dark:text-white" 
                  />
                  <span className="text-xs font-black text-brand-gray-300 mb-1">kg</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleAddGrowthRecord({ date: new Date().toISOString().split('T')[0], height: childInfo.height, weight: childInfo.weight })}
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp size={18} /> 기록 저장 및 실시간 분석
            </button>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default GrowthCard;
