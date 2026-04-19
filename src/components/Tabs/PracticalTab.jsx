// src/components/Tabs/PracticalTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ageTimelineData } from '../../data/practicalInfo';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PracticalTab = ({
  childInfo,
  setSelectedMilestone,
  selectedCategory,
  setSelectedCategory,
  selectedTimelineMonth,
  setSelectedTimelineMonth
}) => {
  const categories = ['전체', '성장·발달', '영양·식사', '수면·심리'];
  const currentMonth = childInfo?.months || 0;

  const filteredData = (ageTimelineData || []).filter(item => {
    const matchCategory = selectedCategory === '전체' || item.category === selectedCategory;
    const matchMonth = item.month === selectedTimelineMonth;
    return matchCategory && matchMonth;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-bold text-brand-gray-900 dark:text-white">연령별 맞춤 가이드</h3>
          <p className="text-brand-gray-500 dark:text-brand-gray-400 mt-1 text-sm">아이의 월령에 딱 맞는 성장 포인트와 육아 팁을 정리했습니다.</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                selectedCategory === cat
                  ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                  : "bg-white dark:bg-apple-elevated text-brand-gray-500 dark:text-brand-gray-400 border-brand-gray-200 dark:border-apple-border hover:border-brand-primary/30"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex overflow-x-auto gap-4 py-6 no-scrollbar border-y border-brand-gray-100 dark:border-apple-border">
        {[0, 1, 2, 3, 4, 5, 6, 9, 12, 18, 24, 36].map((m) => (
          <button
            key={m}
            onClick={() => setSelectedTimelineMonth(m)}
            className={cn(
              "flex flex-col items-center min-w-[64px] transition-all",
              selectedTimelineMonth === m ? "scale-110" : "opacity-60"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-sm font-black mb-2 border-2",
              selectedTimelineMonth === m ? "bg-brand-primary border-brand-primary text-white shadow-md" : "bg-white dark:bg-apple-card border-brand-gray-200 dark:border-apple-border text-brand-gray-400 dark:text-brand-gray-500"
            )}>
              {m}
            </div>
            <span className={cn("text-[10px] font-black", selectedTimelineMonth === m ? "text-brand-primary" : "text-brand-gray-400 dark:text-brand-gray-500")}>{m === 0 ? '출생' : `${m}개월`}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-apple-card p-6 rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                item.category === '성장·발달' ? "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400" :
                item.category === '영양·식사' ? "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400" : "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
              )}>
                {item.category}
              </span>
            </div>
            <h4 className="text-lg font-black text-brand-gray-900 dark:text-white mb-2 group-hover:text-brand-primary transition-colors">{item.title}</h4>
            <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed font-medium mb-6">{item.summary}</p>
            
            <div className="space-y-3">
              {(item.points || []).slice(0, 3).map((p, pi) => (
                <div key={pi} className="flex items-start gap-2 text-xs font-bold text-brand-gray-700 dark:text-brand-gray-200">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-apple-card rounded-[2.5rem] border-2 border-dashed border-brand-gray-100 dark:border-apple-border">
          <BookOpen size={40} className="mx-auto text-brand-gray-300 dark:text-brand-gray-600 mb-4" />
          <p className="text-brand-gray-500 dark:text-brand-gray-400 font-bold">해당 조건의 가이드가 아직 준비 중입니다.</p>
        </div>
      )}
    </motion.div>
  );
};

export default PracticalTab;
