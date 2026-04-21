// src/components/Tabs/ConsultTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { cn } from '../../utils/uiUtils';

const ConsultTab = ({
  userId,
  consultations = [],
  onSendMessage,
  onDeleteMessage,
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
  isAdmin,
  allConsultations = {},
  adminSelectedUserId,
  setAdminSelectedUserId
}) => {
  const chatEndRef = React.useRef(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consultations]);

  const handleSend = () => {
    if (!newQuestion.trim()) return;
    onSendMessage(newQuestion);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formAge.trim()) return;
    localStorage.setItem('childinfo_user_name', formName);
    localStorage.setItem('childinfo_user_age', formAge);
    localStorage.setItem('childinfo_user_category', formCategory);
    setIsProfileStored(true);
  };

  if (!isAdmin && !isProfileStored) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto bg-white dark:bg-apple-card p-8 rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6"><div className="relative"><MessageCircle size={32} /><Sparkles size={16} className="absolute -top-1 -right-1 text-brand-secondary animate-pulse" /></div></div>
          <h3 className="text-2xl font-black text-brand-gray-900 dark:text-white mb-2">시크릿 전문가 상담</h3>
          <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 font-medium tracking-tight">상담에 필요한 최소한의 정보를 입력해 주세요.</p>
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
    <div className="flex flex-col lg:flex-row gap-6 h-[700px] max-w-full overflow-hidden">
      {isAdmin && (
        <div className="w-full lg:w-80 bg-white dark:bg-apple-card rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-brand-gray-100 dark:border-apple-border bg-brand-gray-50/50 dark:bg-white/5">
            <h4 className="text-sm font-black text-brand-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-primary" /> 상담 목록
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
            {Object.keys(allConsultations).length === 0 ? (
              <div className="text-center py-10 text-brand-gray-400 text-xs font-bold">현재 진행 중인 상담이 없습니다.</div>
            ) : (
              Object.keys(allConsultations).map(uid => (
                <button
                  key={uid}
                  onClick={() => setAdminSelectedUserId(uid)}
                  className={cn(
                    "w-full p-4 rounded-2xl text-left transition-all border",
                    adminSelectedUserId === uid 
                      ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" 
                      : "bg-white dark:bg-apple-elevated border-brand-gray-100 dark:border-apple-border text-brand-gray-700 dark:text-brand-gray-300 hover:border-brand-primary/30"
                  )}
                >
                  <div className="text-xs font-black truncate mb-1">{uid.startsWith('user_') ? '익명 사용자' : uid}</div>
                  <div className="text-[10px] opacity-70 truncate">최근 메시지: {allConsultations[uid][allConsultations[uid].length - 1]?.text}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col bg-white dark:bg-apple-card rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl overflow-hidden">
        <div className="p-5 border-b border-brand-gray-100 dark:border-apple-border flex items-center justify-between bg-white/50 dark:bg-apple-card/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary"><MessageCircle size={20} /></div>
            <div>
              <h4 className="text-sm font-black text-brand-gray-900 dark:text-white leading-none">
                {isAdmin ? (adminSelectedUserId ? `${adminSelectedUserId} 님과 상담` : '상담을 선택하세요') : '전문가 1:1 상담'}
              </h4>
              <p className="text-[10px] text-brand-gray-400 dark:text-brand-gray-500 font-bold mt-1.5">실시간 연결 중</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-brand-gray-50/30 dark:bg-apple-black/30">
          {(isAdmin && !adminSelectedUserId) ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <MessageCircle size={48} className="mb-4" />
              <p className="text-sm font-bold">왼쪽 목록에서 상담할 사용자를 선택하세요.</p>
            </div>
          ) : (
            consultations.map((msg) => (
              <div key={msg.id} className={cn("flex flex-col", msg.type === 'question' ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm relative group", 
                  msg.type === 'question' ? "bg-brand-primary text-white rounded-tr-sm" : "bg-white dark:bg-apple-elevated border border-brand-gray-100 dark:border-apple-border text-brand-gray-800 dark:text-brand-gray-100 rounded-tl-sm"
                )}>
                  {msg.text}
                  {isAdmin && (
                    <button 
                      onClick={() => onDeleteMessage(msg.id)}
                      className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-brand-gray-400 dark:text-brand-gray-500 font-bold mt-1 px-1">
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-apple-card border-t border-brand-gray-100 dark:border-apple-border">
          <div className={cn(
            "flex gap-2 bg-brand-gray-50 dark:bg-apple-elevated p-2 rounded-2xl border border-brand-gray-100 dark:border-apple-border focus-within:border-brand-primary transition-all",
            (isAdmin && !adminSelectedUserId) ? "opacity-30 pointer-events-none" : ""
          )}>
            <input 
              type="text" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isAdmin ? "답변을 입력하세요..." : "질문을 입력하세요..."} className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium dark:text-white" 
            />
            <button onClick={handleSend} className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-brand-primary/20"><Send size={18} /></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


export default ConsultTab;
