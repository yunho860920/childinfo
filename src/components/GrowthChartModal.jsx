// src/components/GrowthChartModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Download, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const GrowthChartModal = ({ 
  isOpen, 
  onClose, 
  records = [], 
  childInfo 
}) => {
  if (!isOpen) return null;

  const data = [...records].reverse().map(r => ({
    date: r.date,
    height: r.height,
    weight: r.weight,
    label: `${r.date}`
  }));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-[var(--apple-card)] w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 dark:border-[var(--apple-border)]">
          <div className="p-6 md:p-8 border-b border-brand-gray-100 dark:border-[var(--apple-border)] flex items-center justify-between bg-white dark:bg-[var(--apple-card)] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-sm"><TrendingUp size={24} /></div>
              <div><h3 className="text-xl font-black text-brand-gray-900 dark:text-white leading-none">성장 분석 리포트</h3><p className="text-[11px] font-bold text-brand-gray-400 mt-1.5 uppercase tracking-widest">Growth Vision Analytics</p></div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-gray-100 dark:hover:bg-white/5 transition-colors"><X size={24} className="text-brand-gray-400" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar bg-brand-gray-50/30 dark:bg-black/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-brand-gray-50 dark:bg-[var(--apple-elevated)] p-6 rounded-[2rem] border border-brand-gray-100 dark:border-[var(--apple-border)]">
                <h4 className="text-sm font-black text-brand-gray-900 dark:text-white mb-6 flex items-center gap-2"><div className="w-1 h-4 bg-brand-primary rounded-full"></div> 키 성장 추이 (cm)</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="label" hide />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="height" stroke="#FF6B6B" strokeWidth={4} dot={{ r: 6, fill: '#FF6B6B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-brand-gray-50 dark:bg-[var(--apple-elevated)] p-6 rounded-[2rem] border border-brand-gray-100 dark:border-[var(--apple-border)]">
                <h4 className="text-sm font-black text-brand-gray-900 dark:text-white mb-6 flex items-center gap-2"><div className="w-1 h-4 bg-blue-500 rounded-full"></div> 몸무게 변화 추이 (kg)</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="label" hide />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-brand-primary/5 p-6 rounded-[2rem] border border-brand-primary/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white dark:bg-[var(--apple-elevated)] rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-brand-primary/10"><Info size={20} className="text-brand-primary" /></div>
                <div>
                   <h4 className="text-sm font-black text-brand-gray-900 dark:text-white mb-1">ATLAS 성장 리포트 가이드</h4>
                   <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed font-medium">그래프상의 급격한 변화는 측정 오차일 수 있으니 3일 후 재측정을 권장합니다. 현재 {childInfo.name} 아동은 표준 성장 곡선 내에서 안정적으로 성장하고 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GrowthChartModal;
