// src/components/Tabs/ConsultTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, ShieldCheck, Heart, Sparkles, X, LogOut, Trash2, Check } from 'lucide-react';
import { cn } from '../../utils/uiUtils';

const ConsultTab = ({
  userId,
  setUserId,
  childInfo,
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
  formGender,
  setFormGender,
  formCategory,
  setFormCategory,
  formContent,
  setFormContent,
  isAdmin,
  setIsAdmin,
  allConsultations = {},
  adminSelectedUserId,
  setAdminSelectedUserId,
  onDeleteRoom
}) => {
  const chatEndRef = React.useRef(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [privacyAgreed, setPrivacyAgreed] = React.useState(false);

  // Auto-fill from childInfo on mount
  React.useEffect(() => {
    if (!isAdmin && !isProfileStored) {
      if (!formAge && childInfo?.birthDate) {
        const birth = new Date(childInfo.birthDate);
        const now = new Date();
        const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        setFormAge(Math.max(0, months).toString());
      }
      if (childInfo?.gender) {
        setFormGender(childInfo.gender);
      }
    }
  }, [childInfo, isAdmin, isProfileStored]);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consultations]);

  const handleSend = () => {
    if (!newQuestion.trim()) return;
    onSendMessage(newQuestion);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formAge.trim() || !formContent.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Save metadata
      localStorage.setItem('childinfo_user_name', formName);
      localStorage.setItem('childinfo_user_age', formAge);
      localStorage.setItem('childinfo_user_gender', formGender);
      localStorage.setItem('childinfo_user_category', formCategory);
      
      // Format and send the initial consultation request
      const formattedFirstMsg = `[상담 요청]\n• 아이 별칭: ${formName}\n• 성별: ${formGender === 'male' ? '남아' : '여아'}\n• 나이: ${formAge}개월\n• 카테고리: ${formCategory}\n\n질문 내용:\n${formContent}`;
      await onSendMessage(formattedFirstMsg);
      
      setIsProfileStored(true);
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin && !isProfileStored) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto bg-white dark:bg-apple-card p-10 rounded-3xl border border-brand-gray-100 dark:border-apple-border shadow-premium">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary mb-6">
            <div className="relative">
              <MessageCircle size={36} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary border-2 border-white dark:border-apple-card rounded-full animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-brand-gray-800 dark:text-white mb-2">전문가 1:1 상담</h3>
          <p className="text-sm text-brand-gray-400 font-medium tracking-tight mb-4">아이의 상태를 상세히 적어주시면 전문가가 맞춤 답변을 드립니다.</p>
          <div className="flex items-center gap-2 bg-brand-primary/5 px-4 py-2 rounded-full border border-brand-primary/10">
            <Sparkles size={14} className="text-brand-primary animate-pulse" />
            <span className="text-[11px] font-bold text-brand-primary">현재 상담 가능 (평균 1시간 내 답변)</span>
          </div>
        </div>
        
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold text-brand-gray-500 mb-2 block ml-1">아이 별칭</label>
              <input type="text" placeholder="예: 햇살이" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full h-14 bg-brand-gray-50 dark:bg-apple-elevated border border-transparent rounded-2xl px-5 text-[15px] font-bold dark:text-white outline-none focus:border-brand-primary transition-all shadow-sm" />
            </div>
            <div>
              <label className="text-[12px] font-bold text-brand-gray-500 mb-2 block ml-1">아이 현재 개월수 (자동입력)</label>
              <input type="number" placeholder="예: 6" value={formAge} onChange={(e) => setFormAge(e.target.value)} className="w-full h-14 bg-brand-gray-50 dark:bg-apple-elevated border border-transparent rounded-2xl px-5 text-[15px] font-bold dark:text-white outline-none focus:border-brand-primary transition-all shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold text-brand-gray-500 mb-2 block ml-1">아이 성별</label>
              <select value={formGender} onChange={(e) => setFormGender(e.target.value)} className="w-full h-14 bg-brand-gray-50 dark:bg-apple-elevated border border-transparent rounded-2xl px-5 text-[15px] font-bold dark:text-white outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer shadow-sm">
                <option value="male">남아</option>
                <option value="female">여아</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-bold text-brand-gray-500 mb-2 block ml-1">질문 카테고리</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full h-14 bg-brand-gray-50 dark:bg-apple-elevated border border-transparent rounded-2xl px-5 text-[15px] font-bold dark:text-white outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer shadow-sm">
                <option value="양육">일반 양육</option>
                <option value="건강">건강/의료</option>
                <option value="영양">이유식/영양</option>
                <option value="성장">성장/발달</option>
                <option value="놀이">놀이/교육</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-brand-gray-500 mb-2 block ml-1">상담 내용</label>
            <textarea 
              rows="5" 
              placeholder="궁금하신 내용을 자세히 입력해 주세요. (증상, 시기, 이전 상담 여부 등)" 
              value={formContent} 
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full bg-brand-gray-50 dark:bg-apple-elevated border border-transparent rounded-2xl p-5 text-[15px] font-bold dark:text-white outline-none focus:border-brand-primary transition-all resize-none shadow-sm"
            />
          </div>

          <div className="bg-brand-gray-50/50 dark:bg-apple-elevated/50 p-4 rounded-2xl border border-brand-gray-100 dark:border-apple-border shadow-sm mt-4">
            <h5 className="text-[11px] font-black text-brand-gray-700 dark:text-brand-gray-200 mb-2 flex items-center gap-1"><ShieldCheck size={14} className="text-brand-primary"/> 개인정보 수집 및 이용 안내</h5>
            <ul className="text-[10px] text-brand-gray-500 dark:text-brand-gray-400 space-y-1 mb-4 font-bold leading-relaxed">
              <li>• <span className="text-brand-gray-700 dark:text-brand-gray-300">수집 항목:</span> 아이 별칭, 개월수, 성별, 상담 내용</li>
              <li>• <span className="text-brand-gray-700 dark:text-brand-gray-300">수집 목적:</span> 맞춤형 양육/건강 상담 제공</li>
              <li>• <span className="text-brand-gray-700 dark:text-brand-gray-300">보관 기간:</span> 상담 기록 삭제 시 즉시 파기 (최대 14일 보관 후 자동 파기)</li>
            </ul>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 mt-0.5", privacyAgreed ? "bg-brand-primary border-brand-primary text-white" : "border-brand-gray-300 dark:border-brand-gray-600 bg-white dark:bg-apple-card group-hover:border-brand-primary/50")}>
                {privacyAgreed && <Check size={14} strokeWidth={4} />}
              </div>
              <span className="text-[12px] font-bold text-brand-gray-700 dark:text-brand-gray-200 select-none">개인정보 수집 및 이용에 동의합니다 <span className="text-brand-primary">(필수)</span></span>
              <input type="checkbox" className="sr-only" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)} />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !privacyAgreed}
            className={cn(
              "w-full py-5 bg-brand-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-[0.98] transition-all mt-2 flex items-center justify-center gap-2",
              (isSubmitting || !privacyAgreed) ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                전송 중...
              </>
            ) : "상담 요청하기"}
          </button>
        </form>
      </motion.div>
    );
  }

  const getAdminInfo = () => {
    if (!isAdmin || !adminSelectedUserId || consultations.length === 0) return null;
    const firstMsg = consultations.find(m => m.text.includes('[상담 요청]'));
    if (!firstMsg) return null;
    
    const text = firstMsg.text;
    const nameMatch = text.match(/아이 별칭: (.*)/) || text.match(/아이 이름: (.*)/);
    const genderMatch = text.match(/성별: (.*)/);
    const ageMatch = text.match(/나이: (.*)/);
    const categoryMatch = text.match(/카테고리: (.*)/);

    return {
      name: nameMatch ? nameMatch[1].split('\n')[0].trim() : '알 수 없음',
      gender: genderMatch ? genderMatch[1].split('\n')[0].trim() : '알 수 없음',
      age: ageMatch ? ageMatch[1].split('\n')[0].trim() : '알 수 없음',
      category: categoryMatch ? categoryMatch[1].split('\n')[0].trim() : '일반'
    };
  };

  const adminInfo = getAdminInfo();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[720px] max-w-full overflow-hidden">
      {isAdmin && (
        <div className="w-full lg:w-80 bg-white dark:bg-apple-card rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-brand-gray-100 dark:border-apple-border bg-brand-gray-50/50 dark:bg-white/5 flex items-center justify-between">
            <h4 className="text-sm font-black text-brand-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-primary" /> 상담 목록
            </h4>
            <button 
              onClick={() => {
                setIsAdmin(false);
              }}
              className="w-8 h-8 flex items-center justify-center text-brand-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
              title="관리자 로그아웃"
            >
              <LogOut size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
            {Object.keys(allConsultations).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MessageCircle size={32} className="text-brand-gray-200 mb-2" />
                <p className="text-brand-gray-400 text-xs font-bold leading-relaxed">진행 중인 상담이 없습니다.<br/>서버 데이터를 확인 중입니다...</p>
              </div>
            ) : (
              Object.keys(allConsultations)
                .sort((a, b) => {
                  const lastA = allConsultations[a][allConsultations[a].length - 1]?.created_at || 0;
                  const lastB = allConsultations[b][allConsultations[b].length - 1]?.created_at || 0;
                  return new Date(lastB) - new Date(lastA);
                })
                .map(uid => {
                  const messages = allConsultations[uid];
                  const lastMsg = messages[messages.length - 1];
                  return (
                    <div key={uid} className="relative group/item">
                      <button
                        onClick={() => setAdminSelectedUserId(uid)}
                        className={cn(
                          "w-full p-4 rounded-2xl text-left transition-all border",
                          adminSelectedUserId === uid 
                            ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" 
                            : "bg-white dark:bg-apple-elevated border-brand-gray-100 dark:border-apple-border text-brand-gray-700 dark:text-brand-gray-300 hover:border-brand-primary/30"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-xs font-black truncate max-w-[120px]">
                            {uid.startsWith('user_') ? `사용자 ${uid.slice(-4).toUpperCase()}` : uid}
                          </div>
                          <span className="text-[8px] opacity-60 font-medium">
                            {lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <div className="text-[10px] opacity-70 truncate font-medium">
                          {lastMsg?.text.substring(0, 30)}
                        </div>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRoom(uid);
                        }}
                        className="absolute top-1/2 -right-2 -translate-y-1/2 w-8 h-8 bg-brand-gray-900 text-white rounded-full flex items-center justify-center transition-opacity z-30 shadow-xl"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col bg-white dark:bg-apple-card rounded-[2.5rem] border border-brand-gray-100 dark:border-apple-border shadow-xl overflow-hidden relative min-h-[600px]">
        <div className="p-5 border-b border-brand-gray-100 dark:border-apple-border flex flex-col bg-white dark:bg-apple-card sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary"><MessageCircle size={20} /></div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-brand-gray-900 dark:text-white leading-none truncate">
                  {isAdmin ? (adminSelectedUserId ? `${adminSelectedUserId.slice(-4).toUpperCase()} 님과 상담` : '상담을 선택하세요') : '전문가 1:1 상담'}
                </h4>
                <p className="text-[10px] text-brand-gray-400 dark:text-brand-gray-500 font-bold mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  실시간 연결 중
                </p>
              </div>
            </div>
            {!isAdmin && isProfileStored && (
              <div className="flex items-center gap-2 shrink-0">

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    localStorage.removeItem('childinfo_user_name');
                    localStorage.removeItem('childinfo_user_age');
                    localStorage.removeItem('childinfo_user_gender');
                    localStorage.removeItem('childinfo_user_category');
                    
                    // Generate new User ID for a fresh session
                    const newId = 'user_' + Math.random().toString(36).substring(2, 11);
                    localStorage.setItem('childinfo_user_id', newId);
                    setUserId(newId);
                    setIsProfileStored(false);
                  }}
                  className="text-xs font-black text-white bg-brand-primary px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand-primary/20 hover:brightness-110 active:scale-95"
                >
                  새로 대화하기
                </button>
              </div>
            )}
          </div>

          {isAdmin && adminInfo && (
            <div className="mt-4 p-3 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex-1 grid grid-cols-4 gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-brand-primary opacity-60 uppercase">별칭</span>
                  <span className="text-xs font-black text-brand-gray-900 dark:text-white">{adminInfo.name}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-brand-primary opacity-60 uppercase">성별</span>
                  <span className="text-xs font-black text-brand-gray-900 dark:text-white">{adminInfo.gender}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-brand-primary opacity-60 uppercase">나이</span>
                  <span className="text-xs font-black text-brand-gray-900 dark:text-white">{adminInfo.age}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-brand-primary opacity-60 uppercase">카테고리</span>
                  <span className="text-xs font-black text-brand-gray-900 dark:text-white">{adminInfo.category}</span>
                </div>
              </div>
            </div>
          )}
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
                  "max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm relative group whitespace-pre-wrap", 
                  msg.type === 'question' ? "bg-brand-primary text-white rounded-tr-sm" : "bg-white dark:bg-apple-elevated border border-brand-gray-100 dark:border-apple-border text-brand-gray-800 dark:text-brand-gray-100 rounded-tl-sm"
                )}>
                  {msg.text}
                  {(isAdmin || (msg.type === 'question' && msg.id !== 'welcome')) && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteMessage(msg.id);
                      }}
                      className={cn(
                        "absolute -top-3 w-8 h-8 bg-brand-gray-900 text-white rounded-full flex items-center justify-center transition-all z-30 shadow-xl border-2 border-white dark:border-apple-card",
                        msg.type === 'question' ? "-left-3" : "-right-3"
                      )}
                    >
                      <X size={14} strokeWidth={3} />
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
