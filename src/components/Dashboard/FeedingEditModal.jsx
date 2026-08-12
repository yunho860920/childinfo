// src/components/Dashboard/FeedingEditModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  Plus, 
  Minus, 
  Save, 
  Calendar,
  Sparkles,
  Baby
} from 'lucide-react';
import { cn } from '../../utils/uiUtils';

const FeedingEditModal = ({
  isOpen,
  onClose,
  record,
  onSave,
  childInfo
}) => {
  // Input states
  const [type, setType] = React.useState('formula');
  const [amount, setAmount] = React.useState(160);
  const [breastLeft, setBreastLeft] = React.useState(10);
  const [breastRight, setBreastRight] = React.useState(10);
  const [notes, setNotes] = React.useState('');
  
  // Date & Time states
  const [editDate, setEditDate] = React.useState('');
  const [editTime, setEditTime] = React.useState('');

  // Sync state when record is loaded/changed
  React.useEffect(() => {
    if (record) {
      setType(record.type || 'formula');
      setAmount(record.amount || 160);
      setBreastLeft(record.breastLeft || 0);
      setBreastRight(record.breastRight || 0);
      setNotes(record.notes || '');

      // Parse ISO Date to local YYYY-MM-DD and HH:MM
      const localDate = new Date(record.date);
      if (!isNaN(localDate.getTime())) {
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        setEditDate(`${year}-${month}-${day}`);

        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');
        setEditTime(`${hours}:${minutes}`);
      }
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  // Preset quick amount setters
  const formulaPresets = [80, 120, 160, 200, 240];
  const babyFoodPresets = [60, 80, 100, 120, 150];

  // Save handler
  const handleSave = () => {
    // Combine Date and Time into a single date string (in local timezone)
    // and convert it back to ISO string for backend/state storage
    const combinedDate = new Date(`${editDate}T${editTime}:00`);

    const updatedRecord = {
      ...record,
      type,
      notes: notes.trim(),
      date: combinedDate.toISOString(),
    };

    if (type === 'formula' || type === 'babyfood') {
      updatedRecord.amount = Number(amount);
      updatedRecord.breastLeft = 0;
      updatedRecord.breastRight = 0;
      updatedRecord.breastTotal = 0;
    } else if (type === 'breast') {
      updatedRecord.amount = 0;
      updatedRecord.breastLeft = Number(breastLeft);
      updatedRecord.breastRight = Number(breastRight);
      updatedRecord.breastTotal = Number(breastLeft) + Number(breastRight);
    }

    onSave(updatedRecord);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative bg-white dark:bg-apple-card w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-apple-border relative"
        >
          {/* Background Glow */}
          <div 
            className={cn(
              "absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 dark:opacity-35 transition-colors duration-1000 pointer-events-none z-0",
              type === 'formula' ? 'bg-violet-400' : type === 'breast' ? 'bg-pink-400' : 'bg-emerald-400'
            )} 
          />

          {/* Header */}
          <div className="p-6 border-b border-brand-gray-100 dark:border-apple-border/50 flex items-center justify-between bg-white/85 dark:bg-apple-card/85 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                <Baby size={18} />
              </div>
              <div>
                <h3 className="text-[17px] font-black text-brand-gray-900 dark:text-white leading-none">기록 수정하기</h3>
                <p className="text-[10px] font-bold text-brand-gray-400 mt-1 uppercase tracking-wider">Edit Feeding Record</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-gray-100 dark:hover:bg-white/5 transition-colors">
              <X size={20} className="text-brand-gray-400" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 max-h-[75vh]">
            {/* Segmented Tab Control */}
            <div className="flex bg-brand-gray-50 dark:bg-apple-elevated p-1 rounded-2xl">
              {[
                { id: 'formula', label: '🍼 분유' },
                { id: 'breast', label: '🤱 모유' },
                { id: 'babyfood', label: '🥣 이유식' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setType(tab.id);
                    if (tab.id === 'formula' && amount === 0) setAmount(160);
                    if (tab.id === 'babyfood' && amount === 0) setAmount(100);
                  }}
                  className={cn(
                    "flex-1 py-2 text-xs font-black rounded-xl transition-all relative",
                    type === tab.id 
                      ? "bg-white dark:bg-apple-card shadow-sm text-brand-gray-900 dark:text-white" 
                      : "text-brand-gray-400 hover:text-brand-gray-500 dark:hover:text-brand-gray-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Input forms */}
            {type === 'formula' && (
              <div className="space-y-4 bg-brand-gray-50/40 dark:bg-apple-elevated/20 p-4 rounded-3xl border border-brand-gray-100/50 dark:border-apple-border/20">
                <div className="text-center py-1">
                  <span className="text-[11px] font-black text-brand-gray-400 block mb-1">분유 수유량</span>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setAmount(prev => Math.max(0, prev - 10))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-apple-elevated shadow-sm text-brand-gray-600 dark:text-brand-gray-300 flex items-center justify-center transition-all active:scale-95"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="flex items-baseline justify-center">
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="bg-transparent border-none text-center outline-none text-[36px] font-black w-24 focus:ring-0 p-0 leading-none tracking-tight text-violet-600 dark:text-violet-400"
                      />
                      <span className="text-sm font-black text-brand-gray-400 ml-1">ml</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setAmount(prev => Math.min(500, prev + 10))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-apple-elevated shadow-sm text-brand-gray-600 dark:text-brand-gray-300 flex items-center justify-center transition-all active:scale-95"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <input 
                  type="range" 
                  min="20" 
                  max="300" 
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-violet-500 h-1.5 bg-brand-gray-100 dark:bg-apple-elevated rounded-lg appearance-none cursor-pointer"
                />

                {/* Preset Buttons */}
                <div className="flex justify-between gap-1.5">
                  {formulaPresets.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p)}
                      className={cn(
                        "flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition-all",
                        amount === p 
                          ? "bg-violet-50 border-violet-200 text-violet-600 dark:bg-violet-950/20 dark:border-violet-900/40 dark:text-violet-400 shadow-sm"
                          : "bg-white dark:bg-apple-card border-brand-gray-100 dark:border-apple-border text-brand-gray-400"
                      )}
                    >
                      {p}ml
                    </button>
                  ))}
                </div>
              </div>
            )}

            {type === 'babyfood' && (
              <div className="space-y-4 bg-brand-gray-50/40 dark:bg-apple-elevated/20 p-4 rounded-3xl border border-brand-gray-100/50 dark:border-apple-border/20">
                <div className="text-center py-1">
                  <span className="text-[11px] font-black text-brand-gray-400 block mb-1">이유식 급여량</span>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setAmount(prev => Math.max(0, prev - 10))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-apple-elevated shadow-sm text-brand-gray-600 dark:text-brand-gray-300 flex items-center justify-center transition-all active:scale-95"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="flex items-baseline justify-center">
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="bg-transparent border-none text-center outline-none text-[36px] font-black w-24 focus:ring-0 p-0 leading-none tracking-tight text-emerald-600 dark:text-emerald-400"
                      />
                      <span className="text-sm font-black text-brand-gray-400 ml-1">g</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setAmount(prev => Math.min(500, prev + 10))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-apple-elevated shadow-sm text-brand-gray-600 dark:text-brand-gray-300 flex items-center justify-center transition-all active:scale-95"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <input 
                  type="range" 
                  min="10" 
                  max="250" 
                  step="5"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-brand-gray-100 dark:bg-apple-elevated rounded-lg appearance-none cursor-pointer"
                />

                {/* Preset Buttons */}
                <div className="flex justify-between gap-1.5">
                  {babyFoodPresets.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p)}
                      className={cn(
                        "flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition-all",
                        amount === p 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 shadow-sm"
                          : "bg-white dark:bg-apple-card border-brand-gray-100 dark:border-apple-border text-brand-gray-400"
                      )}
                    >
                      {p}g
                    </button>
                  ))}
                </div>
              </div>
            )}

            {type === 'breast' && (
              <div className="space-y-3 bg-brand-gray-50/40 dark:bg-apple-elevated/20 p-4 rounded-3xl border border-brand-gray-100/50 dark:border-apple-border/20">
                <span className="text-[11px] font-black text-brand-gray-400 block mb-1 text-center">모유 수유 시간 설정</span>
                
                {/* Left Breast Input */}
                <div className="flex justify-between items-center bg-white dark:bg-apple-elevated p-3 rounded-2xl shadow-sm">
                  <span className="text-xs font-black text-brand-gray-600 dark:text-brand-gray-300">👈 왼쪽 수유 시간</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setBreastLeft(prev => Math.max(0, prev - 1))}
                      className="w-6 h-6 rounded-full bg-brand-gray-50 dark:bg-apple-card flex items-center justify-center text-brand-gray-600 dark:text-brand-gray-300 border border-brand-gray-100 dark:border-apple-border active:scale-90"
                    >
                      <Minus size={10} />
                    </button>
                    <input 
                      type="number" 
                      value={breastLeft}
                      onChange={(e) => setBreastLeft(Number(e.target.value))}
                      className="bg-transparent border-none w-10 text-center outline-none text-sm font-black focus:ring-0 p-0 text-pink-500" 
                    />
                    <button 
                      type="button"
                      onClick={() => setBreastLeft(prev => Math.min(60, prev + 1))}
                      className="w-6 h-6 rounded-full bg-brand-gray-50 dark:bg-apple-card flex items-center justify-center text-brand-gray-600 dark:text-brand-gray-300 border border-brand-gray-100 dark:border-apple-border active:scale-90"
                    >
                      <Plus size={10} />
                    </button>
                    <span className="text-xs font-bold text-brand-gray-400 ml-1">분</span>
                  </div>
                </div>

                {/* Right Breast Input */}
                <div className="flex justify-between items-center bg-white dark:bg-apple-elevated p-3 rounded-2xl shadow-sm">
                  <span className="text-xs font-black text-brand-gray-600 dark:text-brand-gray-300">👉 오른쪽 수유 시간</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setBreastRight(prev => Math.max(0, prev - 1))}
                      className="w-6 h-6 rounded-full bg-brand-gray-50 dark:bg-apple-card flex items-center justify-center text-brand-gray-600 dark:text-brand-gray-300 border border-brand-gray-100 dark:border-apple-border active:scale-90"
                    >
                      <Minus size={10} />
                    </button>
                    <input 
                      type="number" 
                      value={breastRight}
                      onChange={(e) => setBreastRight(Number(e.target.value))}
                      className="bg-transparent border-none w-10 text-center outline-none text-sm font-black focus:ring-0 p-0 text-pink-500" 
                    />
                    <button 
                      type="button"
                      onClick={() => setBreastRight(prev => Math.min(60, prev + 1))}
                      className="w-6 h-6 rounded-full bg-brand-gray-50 dark:bg-apple-card flex items-center justify-center text-brand-gray-600 dark:text-brand-gray-300 border border-brand-gray-100 dark:border-apple-border active:scale-90"
                    >
                      <Plus size={10} />
                    </button>
                    <span className="text-xs font-bold text-brand-gray-400 ml-1">분</span>
                  </div>
                </div>

                {/* Total Summary */}
                <div className="text-center pt-2 border-t border-brand-gray-100 dark:border-apple-border/40 text-xs font-bold text-pink-500">
                  총 수유 시간: {Number(breastLeft) + Number(breastRight)}분
                </div>
              </div>
            )}

            {/* Date and Time Selector */}
            <div className="space-y-3 bg-brand-gray-50/40 dark:bg-apple-elevated/20 p-4 rounded-3xl border border-brand-gray-100/50 dark:border-apple-border/20">
              <span className="text-[11px] font-black text-brand-gray-400 block mb-2 flex items-center gap-1.5">
                <Clock size={12} className="text-brand-gray-400" />
                기록 시각 정정
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Date Input */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-brand-gray-400">날짜</span>
                  <div className="flex items-center bg-white dark:bg-apple-elevated border border-brand-gray-100 dark:border-apple-border rounded-xl px-2.5 py-1.5">
                    <Calendar size={12} className="text-brand-gray-400 mr-1.5 shrink-0" />
                    <input 
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent border-none p-0 outline-none focus:ring-0 text-brand-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Time Input */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-brand-gray-400">시간</span>
                  <div className="flex items-center bg-white dark:bg-apple-elevated border border-brand-gray-100 dark:border-apple-border rounded-xl px-2.5 py-1.5">
                    <Clock size={12} className="text-brand-gray-400 mr-1.5 shrink-0" />
                    <input 
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent border-none p-0 outline-none focus:ring-0 text-brand-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Note input */}
            <div className="space-y-1">
              <span className="text-[11px] font-black text-brand-gray-400 block">특이사항 기록</span>
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="특이사항 기록 (예: 트림 잘함, 조금 남김)"
                className="w-full h-11 px-4 text-xs font-medium bg-brand-gray-50 dark:bg-apple-elevated border border-transparent focus:border-brand-primary/30 rounded-xl outline-none text-brand-gray-800 dark:text-white transition-all placeholder-brand-gray-300 dark:placeholder-brand-gray-500"
              />
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="p-6 border-t border-brand-gray-100 dark:border-apple-border/50 flex gap-3 bg-brand-gray-50/50 dark:bg-apple-elevated/30 z-10">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-full font-black text-xs bg-brand-gray-100 dark:bg-apple-elevated text-brand-gray-600 dark:text-brand-gray-300 hover:bg-brand-gray-200 transition-all flex items-center justify-center"
            >
              취소
            </button>
            <button 
              type="button"
              onClick={handleSave}
              disabled={type === 'breast' && Number(breastLeft) === 0 && Number(breastRight) === 0}
              className={cn(
                "flex-1 h-12 rounded-full font-black text-xs text-white shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50",
                type === 'formula' 
                  ? "bg-violet-600 shadow-violet-600/20" 
                  : type === 'breast' 
                    ? "bg-pink-500 shadow-pink-500/20" 
                    : "bg-emerald-600 shadow-emerald-600/20"
              )}
            >
              <Save size={14} />
              수정 완료
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeedingEditModal;
