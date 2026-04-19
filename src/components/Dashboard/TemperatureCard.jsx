// src/components/Dashboard/TemperatureCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, ShieldAlert, ChevronRight, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TemperatureCard = ({ 
  selectedTemp, 
  setSelectedTemp 
}) => {
  const getTempColor = (temp) => {
    if (temp >= 38.5) return 'text-red-600 bg-red-500/10 border-red-500/20';
    if (temp >= 37.5) return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
    return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
  };

  const getStatus = (temp) => {
    if (temp >= 38.5) return { label: '고열', desc: '해열제 복용 및 전문의 상담 필요' };
    if (temp >= 37.5) return { label: '미열', desc: '컨디션 체크 및 30분 뒤 재측정' };
    return { label: '정상', desc: '체온이 적정 범위 내에 있습니다' };
  };

  const status = getStatus(selectedTemp);

  return (
    <div className="bg-white dark:bg-apple-card p-6 md:p-8 rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl relative overflow-hidden group h-full flex flex-col justify-between">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
            <Thermometer size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-black text-brand-gray-900 dark:text-white leading-none tracking-tight">체온 가드</h3>
            <p className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 mt-1 uppercase tracking-widest">Live Monitor</p>
          </div>
        </div>
        <div className={cn("px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border transition-colors", getTempColor(selectedTemp))}>
          {status.label}
        </div>
      </div>

      {/* Main Temp Display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4">
        <div className="flex items-start">
          <span className={cn("text-6xl font-black tracking-tighter leading-none transition-colors", 
            selectedTemp >= 38.5 ? 'text-red-500' : selectedTemp >= 37.5 ? 'text-orange-500' : 'text-brand-gray-900 dark:text-white'
          )}>
            {selectedTemp.toFixed(1)}
          </span>
          <span className="text-xl font-black text-brand-gray-300 dark:text-brand-gray-600 ml-1 mt-1">°C</span>
        </div>
        
        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-gray-50 dark:bg-apple-elevated rounded-2xl border border-brand-gray-100 dark:border-apple-border max-w-[90%] mx-auto">
          <Info size={14} className="text-brand-gray-400 shrink-0" />
          <p className="text-[13px] font-bold text-brand-gray-600 dark:text-brand-gray-300 leading-tight text-center">
            {status.desc}
          </p>
        </div>
      </div>

      {/* Control Section */}
      <div className="relative z-10 mt-6 pt-6 border-t border-brand-gray-50 dark:border-apple-border/50">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase">온도 조절</span>
          <span className="text-[11px] font-black text-brand-primary">35.0 - 42.0°C</span>
        </div>
        
        <input 
          type="range" min="35" max="42" step="0.1" value={selectedTemp} 
          onChange={(e) => setSelectedTemp(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-brand-gray-100 dark:bg-apple-border rounded-lg appearance-none cursor-pointer accent-brand-primary" 
        />
        
        <div className="flex justify-between text-[10px] font-black text-brand-gray-300 dark:text-brand-gray-600 mt-2 px-0.5">
          <span>Low</span>
          <span>Normal</span>
          <span>High</span>
        </div>
      </div>

      {/* Decorative Gradient */}
      <div className={cn(
        "absolute bottom-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-colors",
        selectedTemp >= 37.5 ? 'bg-red-500' : 'bg-emerald-500'
      )} />
    </div>
  );
};

export default TemperatureCard;
