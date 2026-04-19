// src/components/Dashboard/GrowthCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Ruler, Weight, TrendingUp, Save, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GrowthCard = ({ 
  childInfo, 
  setChildInfo, 
  percentile,
  growthRecords = [],
  handleBirthDateChange,
  handleAddGrowthRecord,
  onShowChart
}) => {
  // Process data for the chart
  const chartData = [...growthRecords]
    .reverse()
    .slice(-10) // Show last 10 records for visibility
    .map(r => ({
      date: r.date.split('-').slice(1).join('/'),
      height: parseFloat(r.height),
      weight: parseFloat(r.weight)
    }));

  return (
    <div className="bg-white dark:bg-apple-card p-6 md:p-8 rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl overflow-hidden relative flex flex-col gap-8 group">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-20 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px]" />
      
      {/* Header & Metrics */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-sm shadow-brand-primary/10">
            <User size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-brand-gray-900 dark:text-white leading-none">우리 아이 성장 지표</h3>
            <p className="text-xs font-bold text-brand-gray-400 dark:text-brand-gray-500 mt-1 uppercase tracking-widest">Growth Intelligence</p>
          </div>
        </div>

        {/* Compact Percentile Metric */}
        <div className="bg-brand-primary/5 dark:bg-brand-primary/10 px-4 py-2 rounded-2xl border border-brand-primary/20 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter leading-none mb-1">성장 백분위</span>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-black text-brand-primary leading-none tracking-tighter">{percentile}</span>
              <span className="text-xs font-black text-brand-primary/60 pb-0.5">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-5 gap-8 flex-1">
        
        {/* Left: Inputs Section (2/5) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BirthDate */}
            <div className="bg-brand-gray-50 dark:bg-apple-elevated p-4 rounded-3xl border border-brand-gray-100 dark:border-apple-border group/item hover:border-brand-primary/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-brand-gray-400 group-hover/item:text-brand-primary transition-colors" />
                <span className="text-[12px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-tighter">생년월일</span>
              </div>
              <input 
                type="date" value={childInfo.birthDate} 
                onChange={(e) => handleBirthDateChange(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-base font-black text-brand-gray-900 dark:text-white" 
              />
              <p className="text-[11px] font-bold text-brand-primary mt-1.5 flex items-center gap-1">
                <ChevronRight size={10} /> {childInfo.months}개월차 성장 중
              </p>
            </div>

            {/* Gender */}
            <div className="bg-brand-gray-50 dark:bg-apple-elevated p-4 rounded-3xl border border-brand-gray-100 dark:border-apple-border flex flex-col justify-center">
              <span className="text-[12px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-tighter mb-3">성별 설정</span>
              <div className="flex gap-2">
                {['male', 'female'].map(g => (
                  <button 
                    key={g} onClick={() => setChildInfo(prev => ({ ...prev, gender: g }))}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-black transition-all border",
                      childInfo.gender === g 
                        ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" 
                        : "bg-white dark:bg-apple-card text-brand-gray-400 border-brand-gray-100 dark:border-apple-border hover:bg-brand-gray-100 dark:hover:bg-apple-border"
                    )}
                  >
                    {g === 'male' ? '남아' : '여아'}
                  </button>
                ))}
              </div>
            </div>

            {/* Height */}
            <div className="bg-brand-gray-50 dark:bg-apple-elevated p-4 rounded-3xl border border-brand-gray-100 dark:border-apple-border group/item hover:border-brand-primary/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Ruler size={14} className="text-brand-gray-400 group-hover/item:text-brand-primary transition-colors" />
                <span className="text-[12px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-tighter">현재 키</span>
              </div>
              <div className="flex items-end gap-1">
                <input 
                  type="number" step="0.1" value={childInfo.height} 
                  onChange={(e) => setChildInfo(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                  className="w-full bg-transparent border-none outline-none text-2xl font-black text-brand-gray-900 dark:text-white" 
                />
                <span className="text-sm font-black text-brand-gray-300 mb-1">cm</span>
              </div>
            </div>

            {/* Weight */}
            <div className="bg-brand-gray-50 dark:bg-apple-elevated p-4 rounded-3xl border border-brand-gray-100 dark:border-apple-border group/item hover:border-brand-primary/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Weight size={14} className="text-brand-gray-400 group-hover/item:text-brand-primary transition-colors" />
                <span className="text-[12px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-tighter">현재 몸무게</span>
              </div>
              <div className="flex items-end gap-1">
                <input 
                  type="number" step="0.1" value={childInfo.weight} 
                  onChange={(e) => setChildInfo(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                  className="w-full bg-transparent border-none outline-none text-2xl font-black text-brand-gray-900 dark:text-white" 
                />
                <span className="text-sm font-black text-brand-gray-300 mb-1">kg</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => handleAddGrowthRecord({ date: new Date().toISOString().split('T')[0], height: childInfo.height, weight: childInfo.weight })}
            className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} /> 실시간 데이터 저장 및 분석
          </button>
        </div>

        {/* Right: Integrated Graph Section (3/5) */}
        <div className="xl:col-span-3 bg-brand-gray-50 dark:bg-apple-elevated/50 p-6 rounded-[2rem] border border-brand-gray-100 dark:border-apple-border flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-brand-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
              <div className="w-1.5 h-4 bg-brand-primary rounded-full" />
              성장 트래킹 (최근 10회)
            </h4>
            <button onClick={onShowChart} className="text-[11px] font-black text-brand-primary hover:underline flex items-center gap-1">
              상세 리포트 보기 <ChevronRight size={12} />
            </button>
          </div>

          <div className="flex-1 min-h-[220px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={clsx("rgba(156, 163, 175, 0.1)")} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#9CA3AF' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '11px' }}
                    itemStyle={{ padding: '0px' }}
                  />
                  <Line 
                    yAxisId={0}
                    type="monotone" dataKey="height" stroke="#FF6B6B" strokeWidth={4} 
                    dot={{ r: 4, fill: '#FF6B6B', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6, shadow: '0 0 10px rgba(255,107,107,0.5)' }} 
                    name="키 (cm)"
                  />
                  <Line 
                    yAxisId={0}
                    type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={4} 
                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6, shadow: '0 0 10px rgba(59,130,246,0.5)' }} 
                    name="몸무게 (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-brand-gray-400 gap-3">
                <TrendingUp size={40} strokeWidth={1} className="opacity-20" />
                <p className="text-xs font-bold opacity-60">충분한 성장 기록이 없습니다.</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-primary" />
                <span className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-tighter">Height</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-tighter">Weight</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthCard;
