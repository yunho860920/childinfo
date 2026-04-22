
// src/components/Tabs/PracticalTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Search,
  Sparkles,
  Baby,
  Utensils,
  Moon,
  Gamepad2,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../utils/uiUtils';
import { ageTimelineData } from '../../data/practicalInfo';

const PracticalTab = ({ childInfo }) => {
  const [selectedCategory, setSelectedCategory] = React.useState('전체');
  const [selectedTimelineMonth, setSelectedTimelineMonth] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const categories = [
    { id: '전체', icon: <Sparkles size={16} /> },
    { id: '성장·발달', icon: <Baby size={16} /> },
    { id: '영양·식사', icon: <Utensils size={16} /> },
    { id: '수면·심리와 정서', icon: <Moon size={16} /> },
    { id: '건강·안전', icon: <ShieldCheck size={16} /> },
    { id: '기저귀 떼기', icon: <Gamepad2 size={16} /> },
    { id: '이유식 훈련', icon: <Utensils size={16} /> },
    { id: '걷기 훈련', icon: <Baby size={16} /> },
    { id: '책읽기 연습', icon: <BookOpen size={16} /> }
  ];

  const months = ['전체', 0, 1, 2, 3, 4, 5, 6, 9, 12, 18, 24, 30, 36];
  
  const filteredData = (ageTimelineData || []).filter(item => {
    const matchCategory = selectedCategory === '전체' || item.category === selectedCategory;
    const matchMonth = selectedTimelineMonth === '전체' ? true : item.month === selectedTimelineMonth;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchMonth && matchSearch;
  }).sort((a, b) => {
    // 1순위: 월령별 정렬 (전체 보기일 때 중요)
    if (a.month !== b.month) {
      return a.month - b.month;
    }
    // 2순위: 단계별 정렬 (같은 달에 여러 카드인 경우)
    if (a.step && b.step) {
      return a.step - b.step;
    }
    return 0;
  });

  const getCategoryColor = (cat) => {
    switch (cat) {
      case '성장·발달': return 'from-purple-500/20 to-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20';
      case '영양·식사': return 'from-orange-500/20 to-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
      case '수면·심리와 정서': return 'from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
      case '건강·안전': return 'from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20';
      case '기저귀 떼기': return 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
      case '이유식 훈련': return 'from-amber-500/20 to-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20';
      case '걷기 훈련': return 'from-blue-500/20 to-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20';
      case '책읽기 연습': return 'from-violet-500/20 to-fuchsia-500/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20';
      default: return 'from-gray-500/10 to-gray-400/10 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-500/20';
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case '성장·발달': return <Baby size={18} />;
      case '영양·식사': return <Utensils size={18} />;
      case '수면·심리와 정서': return <Moon size={18} />;
      case '건강·안전': return <ShieldCheck size={18} />;
      case '기저귀 떼기': return <Gamepad2 size={18} />;
      case '이유식 훈련': return <Utensils size={18} />;
      case '걷기 훈련': return <Baby size={18} />;
      case '책읽기 연습': return <BookOpen size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-10 pb-20"
    >
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5 p-8 border border-white/20 dark:border-white/5">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest">
              <BookOpen size={12} />
              Parenting Guide
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-brand-gray-900 dark:text-white tracking-tight leading-tight">
              연령별 맞춤 가이드
            </h3>
            <p className="text-brand-gray-500 dark:text-brand-gray-400 font-medium max-w-xl">
              우리 아이의 성장에 딱 맞는 발달 포인트와 전문가 팁을 카테고리별로 확인하세요. 
              0개월부터 36개월까지의 핵심 정보를 제공합니다.
            </p>
          </div>

          <div className="w-full lg:w-72 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="궁금한 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white/80 dark:bg-apple-card/80 backdrop-blur-xl border border-brand-gray-100 dark:border-apple-border rounded-2xl outline-none focus:ring-2 ring-brand-primary/20 transition-all font-bold text-sm"
            />
          </div>
        </div>
      </div>

      {/* Month Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-widest">성장 타임라인</span>
          <span className={cn(
            "text-xs font-bold transition-all",
            selectedTimelineMonth === '전체' ? "text-brand-primary" : "text-brand-primary"
          )}>
            {selectedTimelineMonth === '전체' ? '모든 성장 과정' : (selectedTimelineMonth === 0 ? '신생아기' : `${selectedTimelineMonth}개월`)}
          </span>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar px-2">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedTimelineMonth(m)}
              className={cn(
                "flex flex-col items-center min-w-[72px] p-2 rounded-[2rem] transition-all duration-500 relative group",
                selectedTimelineMonth === m ? "bg-white dark:bg-apple-card shadow-xl shadow-brand-primary/5 border border-brand-primary/20" : "hover:bg-brand-gray-100/50 dark:hover:bg-white/5"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 mb-2 relative z-10",
                selectedTimelineMonth === m 
                  ? "bg-brand-primary text-white scale-110 shadow-lg shadow-brand-primary/30" 
                  : "bg-brand-gray-50 dark:bg-apple-elevated text-brand-gray-400 dark:text-brand-gray-500 group-hover:text-brand-primary group-hover:scale-105"
              )}>
                {m === '전체' ? 'All' : m}
              </div>
              <span className={cn(
                "text-[11px] font-black tracking-tight transition-colors",
                selectedTimelineMonth === m ? "text-brand-primary" : "text-brand-gray-400 dark:text-brand-gray-500"
              )}>
                {m === '전체' ? '전체보기' : (m === 0 ? '출생' : `${m}개월`)}
              </span>
              {selectedTimelineMonth === m && (
                <motion.div 
                  layoutId="activeMonth" 
                  className="absolute inset-0 bg-white dark:bg-apple-card rounded-[2rem] -z-0 border border-brand-primary/20"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all duration-300 border",
              selectedCategory === cat.id
                ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                : "bg-white dark:bg-apple-card text-brand-gray-500 dark:text-brand-gray-400 border-brand-gray-100 dark:border-apple-border hover:border-brand-primary/30"
            )}
          >
            {cat.icon}
            {cat.id}
          </button>
        ))}
      </div>

      {/* Content Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`${selectedTimelineMonth}-${selectedCategory}-${searchQuery}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredData.length > 0 ? (
            filteredData.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative bg-white dark:bg-apple-card p-8 rounded-[3rem] border border-brand-gray-100 dark:border-apple-border shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                {/* Card Background Glow */}
                <div className={cn(
                  "absolute -inset-1 rounded-[3rem] bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl",
                  getCategoryColor(item.category)
                )} />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-gradient-to-br",
                      getCategoryColor(item.category)
                    )}>
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </div>
                  </div>

                  {/* Illustration Image */}
                  {item.image && (
                    <div className="relative mb-6 -mx-2">
                      <div className={cn(
                        "absolute inset-0 blur-2xl opacity-20 -z-10",
                        getCategoryColor(item.category).split(' ')[0]
                      )} />
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-40 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <h4 className="text-xl font-black text-brand-gray-900 dark:text-white mb-3 group-hover:text-brand-primary transition-colors leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed font-bold mb-8">
                    {item.summary}
                  </p>
                  
                  <div className="mt-auto space-y-4">
                    {(item.points || []).map((p, pi) => (
                      <motion.div 
                        key={pi} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + pi * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-brand-gray-50 dark:bg-white/5 border border-transparent hover:border-brand-primary/10 transition-all"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                          <CheckCircle2 size={12} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-bold text-brand-gray-700 dark:text-brand-gray-200 leading-snug">
                          {p}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white dark:bg-apple-card rounded-[3rem] border-2 border-dashed border-brand-gray-100 dark:border-apple-border">
              <div className="w-20 h-20 bg-brand-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gray-300">
                <BookOpen size={40} />
              </div>
              <h5 className="text-lg font-black text-brand-gray-900 dark:text-white mb-2">가이드를 찾을 수 없습니다</h5>
              <p className="text-sm text-brand-gray-400 dark:text-brand-gray-500 font-bold max-w-xs mx-auto">
                선택한 월령이나 검색어에 해당하는 가이드가 아직 준비 중이거나 없습니다. 
                다른 월령을 선택해 보세요.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default PracticalTab;
