// src/components/Dashboard/TemperatureCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Thermometer, Info } from 'lucide-react';
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
    if (temp >= 38.5) return 'text-red-600 bg-red-100';
    if (temp >= 37.5) return 'text-orange-600 bg-orange-100';
    return 'text-emerald-600 bg-emerald-100';
  };

  const getStatus = (temp) => {
    if (temp >= 38.5) return { label: '고열', desc: '지체 없이 해열제를 복용시키고 상태를 관찰하세요.' };
    if (temp >= 37.5) return { label: '미열', desc: '아이의 컨디션을 확인하고 30분 간격으로 재측정하세요.' };
    return { label: '정상', desc: '아이의 체온이 적정 범위 내에 있습니다.' };
  };

  const status = getStatus(selectedTemp);

  return (
    <div className="bg-white dark:bg-apple-card p-6 md:p-8 rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl overflow-hidden relative group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shadow-blue-500/10">
            <Thermometer size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-brand-gray-900 dark:text-white leading-none">체온 스마트 모니터링</h3>
            <p className="text-[11px] font-bold text-brand-gray-400 dark:text-brand-gray-500 mt-1.5 uppercase tracking-widest">Temperature Guard</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-brand-gray-50 dark:bg-apple-elevated rounded-full border border-brand-gray-100 dark:border-apple-border" />
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className={cn("w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-lg transition-colors border-4 border-white dark:border-apple-card", getTempColor(selectedTemp))}
          >
            <span className="text-4xl font-black tracking-tighter">{selectedTemp.toFixed(1)}</span>
            <span className="text-xs font-black opacity-60">°C</span>
          </motion.div>
        </div>

        <div className="w-full bg-brand-gray-50 dark:bg-apple-elevated p-5 rounded-3xl border border-brand-gray-100 dark:border-apple-border text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase", getTempColor(selectedTemp))}>
              {status.label}
            </span>
          </div>
          <p className="text-sm font-bold text-brand-gray-900 dark:text-brand-gray-100 mb-1">{status.desc}</p>
        </div>

        <div className="w-full mt-6 space-y-4">
          <input 
            type="range" min="35" max="42" step="0.1" value={selectedTemp} 
            onChange={(e) => setSelectedTemp(parseFloat(e.target.value))}
            className="w-full h-2 bg-brand-gray-100 dark:bg-apple-border rounded-lg appearance-none cursor-pointer accent-brand-primary" 
          />
          <div className="flex justify-between text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 px-1">
            <span>35.0°C</span>
            <span>37.5°C</span>
            <span>40.0°C</span>
            <span>42.0°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureCard;
