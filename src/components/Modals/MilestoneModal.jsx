// src/components/Modals/MilestoneModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MilestoneModal = ({ 
  isOpen, 
  onClose, 
  milestone 
}) => {
  if (!isOpen || !milestone) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-[var(--apple-card)] w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-[var(--apple-border)]">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-brand-gray-100 dark:hover:bg-white/5 transition-colors"><X size={24} className="text-brand-gray-400" /></button>
          
          <div className="flex flex-col items-center text-center mb-8">
             <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6 ring-8 ring-brand-primary/5"><CheckCircle2 size={32} /></div>
             <h3 className="text-2xl font-black text-brand-gray-900 dark:text-white mb-2">{milestone.title}</h3>
             <span className="px-3 py-1 bg-brand-gray-100 dark:bg-white/10 text-brand-gray-500 dark:text-brand-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest">{milestone.category}</span>
          </div>

          <div className="space-y-6">
            <div className="bg-brand-gray-50 dark:bg-[var(--apple-elevated)] p-6 rounded-3xl border border-brand-gray-100 dark:border-[var(--apple-border)]">
               <p className="text-sm text-brand-gray-700 dark:text-brand-gray-200 font-bold leading-relaxed">{milestone.description}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-500/20 flex gap-4">
               <div className="w-10 h-10 bg-white dark:bg-[var(--apple-elevated)] rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-blue-100 dark:border-blue-500/20"><Info size={20} className="text-blue-500" /></div>
               <div>
                  <h4 className="text-xs font-black text-blue-700 dark:text-blue-400 mb-1">부모님 가이드</h4>
                  <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 leading-relaxed font-bold">{milestone.parentGuide}</p>
               </div>
            </div>

            {milestone.warning && (
              <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-3xl border border-red-100 dark:border-red-500/20 flex gap-4">
                 <div className="w-10 h-10 bg-white dark:bg-[var(--apple-elevated)] rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-red-100 dark:border-red-500/20"><AlertCircle size={20} className="text-red-500" /></div>
                 <div>
                    <h4 className="text-xs font-black text-red-700 dark:text-red-400 mb-1">주의사항</h4>
                    <p className="text-[11px] text-red-600/80 dark:text-red-400/80 leading-relaxed font-bold">{milestone.warning}</p>
                 </div>
              </div>
            )}
          </div>

          <button onClick={onClose} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-8">확인 완료</button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MilestoneModal;
