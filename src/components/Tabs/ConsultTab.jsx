// src/components/Tabs/ConsultTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ConsultTab = ({
  userId,
  consultations = [],
  setConsultations,
  newQuestion,
  setNewQuestion,
  isProfileStored,
  setIsProfileStored,
  formName,
  setFormName,
  formAge,
  setFormAge,
  formCategory,
  setFormCategory,
  isAdmin
}) => {
  const chatEndRef = React.useRef(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consultations]);

  const handleSend = () => {
    if (!newQuestion.trim()) return;
    const msg = {
      id: Date.now().toString(),
      type: 'question',
      text: newQuestion,
      created_at: new Date().toISOString()
    };
    setConsultations(prev => [...prev, msg]);
    setNewQuestion('');
    
    // Simulate Expert Answer
    setTimeout(() => {
      setConsultations(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'answer',
        text: '문의하신 내용에 대해 전문가가 확인 중입니다. 잠시만 기다려 주세요.',
        created_at: new Date().toISOString()
      }]);
    }, 1500);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formAge.trim()) return;
    localStorage.setItem('childinfo_user_name', formName);
    localStorage.setItem('childinfo_user_age', formAge);
    localStorage.setItem('childinfo_user_category', formCategory);
    setIsProfileStored(true);
  };

  if (!isProfileStored) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto bg-white dark:bg-apple-card p-8 rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6"><div className="relative"><MessageCircle size={32} /><Sparkles size={16} className="absolute -top-1 -right-1 text-brand-secondary animate-pulse" /></div></div>
          <h3 className="text-2xl font-black text-brand-gray-900 dark:text-white mb-2">시크릿 전문가 상담</h3>
          <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 font-medium tracking-tight">상당에 필요한 최소한의 정보를 입력해 주세요.</p>
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-widest mb-1.5 block px-1">상담자 닉네임</label>
            <input type="text" placeholder="예: 햇살맘" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full h-12 bg-brand-gray-50 dark:bg-apple-elevated border border-brand-gray-200 dark:border-apple-border rounded-2xl px-4 text-sm font-bold dark:text-white outline-none focus:border-brand-primary transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-widest mb-1.5 block px-1">아이 현재 월령</label>
            <input type="number" placeholder="예: 6" value={formAge} onChange={(e) => setFormAge(e.target.value)} className="w-full h-12 bg-brand-gray-50 dark:bg-apple-elevated border border-brand-gray-200 dark:border-apple-border rounded-2xl px-4 text-sm font-bold dark:text-white outline-none focus:border-brand-primary transition-all" />
          </div>
          <button type="submit" className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4">전문가 연결하기</button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[600px] bg-white dark:bg-apple-card rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl overflow-hidden">
      <div className="p-5 border-b border-brand-gray-100 dark:border-apple-border flex items-center justify-between bg-white/50 dark:bg-apple-card/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary"><MessageCircle size={20} /></div>
          <div><h4 className="text-sm font-black text-brand-gray-900 dark:text-white leading-none">전문가 1:1 상담</h4><p className="text-[10px] text-brand-gray-400 dark:text-brand-gray-500 font-bold mt-1.5">실시간 연결 중 (답변까지 약 5분 소요)</p></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-brand-gray-50/30 dark:bg-apple-black/30">
        {consultations.map((msg) => (
          <div key={msg.id} className={cn("flex flex-col", msg.type === 'question' ? "items-end" : "items-start")}>
            <div className={cn("max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm", msg.type === 'question' ? "bg-brand-primary text-white rounded-tr-sm" : "bg-white dark:bg-apple-elevated border border-brand-gray-100 dark:border-apple-border text-brand-gray-800 dark:text-brand-gray-100 rounded-tl-sm")}>
              {msg.text}
            </div>
            <span className="text-[9px] text-brand-gray-400 dark:text-brand-gray-500 font-bold mt-1 px-1">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-apple-card border-t border-brand-gray-100 dark:border-apple-border">
        <div className="flex gap-2 bg-brand-gray-50 dark:bg-apple-elevated p-2 rounded-2xl border border-brand-gray-100 dark:border-apple-border focus-within:border-brand-primary transition-all">
          <input 
            type="text" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="질문을 입력하세요..." className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium dark:text-white" 
          />
          <button onClick={handleSend} className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-brand-primary/20"><Send size={18} /></button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsultTab;
