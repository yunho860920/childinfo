// src/components/Dashboard/TemperatureChartModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Thermometer, Info, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TemperatureChartModal = ({ 
  isOpen, 
  onClose, 
  records = [], 
  childInfo 
}) => {
  if (!isOpen) return null;

  const data = [...records].reverse().map(r => ({
    time: new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fullDate: new Date(r.date).toLocaleDateString(),
    temp: r.temp,
    notes: r.notes,
    label: `${new Date(r.date).getMonth() + 1}/${new Date(r.date).getDate()}`
  }));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative bg-white dark:bg-apple-card w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 dark:border-apple-border"
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-brand-gray-100 dark:border-apple-border flex items-center justify-between bg-white dark:bg-apple-card sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                <Thermometer size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-brand-gray-900 dark:text-white leading-none">체온 변화 분석</h3>
                <p className="text-[11px] font-bold text-brand-gray-400 mt-1.5 uppercase tracking-widest leading-none">Temperature History Tracking</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-gray-100 dark:hover:bg-white/5 transition-colors">
              <X size={24} className="text-brand-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar bg-brand-gray-50/30 dark:bg-apple-black/20">
            {/* Chart Section */}
            <div className="bg-white dark:bg-apple-card p-6 rounded-[2rem] border border-brand-gray-100 dark:border-apple-border shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-black text-brand-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div> 
                  최근 체온 변화 추이 (°C)
                </h4>
                <div className="flex items-center gap-4 text-[10px] font-bold text-brand-gray-400">
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /> 고열(38°C)</div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" /> 일반</div>
                </div>
              </div>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-brand-gray-100 dark:text-white/5" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10, fontWeight: 700 }} 
                      stroke="currentColor" 
                      className="text-brand-gray-400"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[35.5, 40.5]} 
                      tick={{ fontSize: 10, fontWeight: 700 }} 
                      stroke="currentColor" 
                      className="text-brand-gray-400"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '20px', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        padding: '12px'
                      }} 
                      itemStyle={{ fontWeight: 900, color: '#3B82F6' }}
                    />
                    <ReferenceLine y={38} stroke="#F87171" strokeDasharray="3 3" label={{ value: '고열', position: 'right', fill: '#F87171', fontSize: 10, fontWeight: 900 }} />
                    <Line 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#3B82F6" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 8 }} 
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-brand-gray-900 dark:text-white flex items-center gap-2 ml-1">
                <History size={16} className="text-brand-gray-400" />
                기록 히스토리
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {records.length > 0 ? records.map((r, i) => (
                  <div key={r.id} className="bg-white dark:bg-apple-card p-4 rounded-2xl border border-brand-gray-100 dark:border-apple-border flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${r.temp >= 38 ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-500 dark:bg-blue-500/10'}`}>
                        {r.temp.toFixed(1)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-brand-gray-900 dark:text-white">{new Date(r.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[10px] font-bold text-brand-gray-400 mt-0.5">{r.notes || "특이사항 없음"}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-brand-gray-400 bg-white dark:bg-apple-card rounded-[2rem] border border-dashed border-brand-gray-200 dark:border-apple-border">
                    <History size={32} className="mb-3 opacity-20" />
                    <p className="text-sm font-bold">아직 기록된 체온 정보가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-blue-500/5 dark:bg-blue-500/10 p-6 rounded-[2rem] border border-blue-500/10 flex items-start gap-4">
              <div className="w-10 h-10 bg-white dark:bg-apple-card rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-blue-500/10">
                <Info size={20} className="text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-brand-gray-900 dark:text-white mb-1">ATLAS 체온 리포트 가이드</h4>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed font-medium">38도 이상의 발열이 24시간 이상 지속되거나, 해열제 복용 후에도 체온이 낮아지지 않는 경우 즉시 전문의의 진료를 받으시기 바랍니다.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TemperatureChartModal;
