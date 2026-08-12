// src/components/Dashboard/GrowthCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Save, Calendar, Sparkles } from 'lucide-react';
import ProgressRing from '../common/ProgressRing';
import { vaccinationSchedule, growthMilestones } from '../../data/healthInfo';

const GrowthCard = ({ 
  childInfo, 
  setChildInfo, 
  percentile,
  handleBirthDateChange,
  handleAddGrowthRecord,
  onShowChart,
  setActiveTab,
  setSelectedHealthCategory
}) => {
  const dateInputRef = React.useRef(null);

  // 개월수 기반 맞춤 예방접종 및 발달과업 추천 헬퍼 함수
  const getRecommendData = () => {
    const currentMonths = childInfo.months || 0;

    // 1. 예방접종 매칭
    let matchedVaxGroup = vaccinationSchedule[0];
    for (let i = 0; i < vaccinationSchedule.length; i++) {
      if (vaccinationSchedule[i].months >= currentMonths) {
        matchedVaxGroup = vaccinationSchedule[i];
        break;
      }
    }
    if (currentMonths > vaccinationSchedule[vaccinationSchedule.length - 1].months) {
      matchedVaxGroup = vaccinationSchedule[vaccinationSchedule.length - 1];
    }

    const vaxNames = matchedVaxGroup.vaccines.map(v => v.name);
    const uniqueNames = Array.from(new Set(vaxNames));
    const vaxLabel = uniqueNames[0] + (uniqueNames.length > 1 ? ` 외 ${uniqueNames.length - 1}종` : '');
    const vaxRecommend = {
      title: `${matchedVaxGroup.label} 접종`,
      desc: vaxLabel
    };

    // 2. 발달 마일스톤 매칭
    let matchedMilestoneGroup = growthMilestones[0];
    for (let i = 0; i < growthMilestones.length; i++) {
      if (growthMilestones[i].months >= currentMonths) {
        matchedMilestoneGroup = growthMilestones[i];
        break;
      }
    }
    if (currentMonths > growthMilestones[growthMilestones.length - 1].months) {
      matchedMilestoneGroup = growthMilestones[growthMilestones.length - 1];
    }

    const milestoneItem = matchedMilestoneGroup.items[0]?.name || '발달 과업';
    const milestoneRecommend = {
      title: matchedMilestoneGroup.label,
      desc: milestoneItem
    };

    return { vaxRecommend, milestoneRecommend };
  };

  const { vaxRecommend, milestoneRecommend } = getRecommendData();

  const handleRecommendClick = (type) => {
    if (!setActiveTab || !setSelectedHealthCategory) return;
    
    setActiveTab('health');
    if (type === 'vaccine') {
      setSelectedHealthCategory('예방접종 일정');
    } else {
      setSelectedHealthCategory('성장 마일스톤');
    }

    setTimeout(() => {
      const targetSection = document.getElementById('health-tab-section');
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  return (
    <div className="card-container p-6 flex flex-col h-full bg-white dark:bg-apple-card shadow-soft rounded-[32px] border-none">
      {/* Top Banner Area */}
      <div className="flex flex-col mb-6">
        <h3 className="text-[19px] font-black text-brand-gray-900 dark:text-white tracking-tight mb-1">성장 & 발육</h3>
        <p className="text-[13px] font-bold text-brand-gray-400">상위 {100 - (percentile || 0)}% (2017 KCDC 기준)</p>
      </div>

      {/* Progress Ring Area (Clean, No Box) */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex flex-col">
          <span className="text-[13px] font-black text-brand-primary/80 mb-1">상위 {100 - (percentile || 0)}% 수준</span>
          <span className="text-[28px] font-black text-brand-gray-900 dark:text-white tracking-tighter leading-none mb-2">
            훌륭하게<br/>자라고 있어요
          </span>
          <button onClick={onShowChart} className="text-left text-[13px] font-bold text-brand-gray-500 hover:text-brand-primary flex items-center gap-1 w-max transition-colors">
            상세 성장 차트 보기 <span className="text-[10px]">▶</span>
          </button>
        </div>
        <div className="shrink-0 -mr-2">
          <ProgressRing 
            percentage={percentile || 0} 
            size={110} 
            strokeWidth={9}
            id="growth-gradient"
            gradientColors={["#F04452", "#FF6B6B"]}
          >
            <div className="flex flex-col items-center mt-1">
              <span className="text-2xl font-black text-brand-gray-900 dark:text-white tracking-tighter leading-none">
                {percentile || 0}%
              </span>
            </div>
          </ProgressRing>
        </div>
      </div>

      {/* 2x2 Grid Widgets for Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Birth Date Widget */}
        <div 
          onClick={() => dateInputRef.current?.showPicker()}
          className="bg-brand-gray-50/80 dark:bg-apple-elevated/80 p-4 rounded-[20px] flex flex-col cursor-pointer hover:bg-brand-gray-100/80 dark:hover:bg-apple-border/50 transition-colors group"
        >
          <span className="text-[12px] font-bold text-brand-gray-400 mb-2">🎂 생년월일</span>
          <span className="text-[16px] font-black text-brand-gray-900 dark:text-white group-hover:text-brand-primary transition-colors">
            {childInfo.birthDate.replace(/-/g, '.')}
          </span>
          <input 
            ref={dateInputRef}
            type="date" 
            value={childInfo.birthDate}
            onChange={(e) => handleBirthDateChange(e.target.value)}
            className="sr-only" 
          />
        </div>

        {/* Gender Widget */}
        <div className="bg-brand-gray-50/80 dark:bg-apple-elevated/80 p-4 rounded-[20px] flex flex-col relative group hover:bg-brand-gray-100/80 dark:hover:bg-apple-border/50 transition-colors">
          <span className="text-[12px] font-bold text-brand-gray-400 mb-2">👶 성별</span>
          <select 
            value={childInfo.gender}
            onChange={(e) => setChildInfo(prev => ({ ...prev, gender: e.target.value }))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="male">남아</option>
            <option value="female">여아</option>
          </select>
          <span className="text-[16px] font-black text-brand-gray-900 dark:text-white group-hover:text-brand-primary transition-colors pointer-events-none">
            {childInfo.gender === 'male' ? '남자아이' : '여자아이'}
          </span>
        </div>

        {/* Height Widget */}
        <div className="bg-brand-gray-50/80 dark:bg-apple-elevated/80 p-4 rounded-[20px] flex flex-col relative focus-within:ring-2 focus-within:ring-brand-primary/30 transition-all">
          <span className="text-[12px] font-bold text-brand-gray-400 mb-2">📏 키</span>
          <div className="flex items-baseline gap-1">
            <input 
              type="number" 
              value={childInfo.height || ''} 
              onFocus={(e) => e.target.select()}
              onChange={(e) => setChildInfo(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
              className="bg-transparent border-none outline-none text-[18px] font-black text-brand-gray-900 dark:text-white placeholder-brand-gray-300 focus:ring-0 p-0 w-16" 
              placeholder="0.0"
            />
            <span className="text-[13px] font-bold text-brand-gray-400">cm</span>
          </div>
        </div>

        {/* Weight Widget */}
        <div className="bg-brand-gray-50/80 dark:bg-apple-elevated/80 p-4 rounded-[20px] flex flex-col relative focus-within:ring-2 focus-within:ring-brand-primary/30 transition-all">
          <span className="text-[12px] font-bold text-brand-gray-400 mb-2">⚖️ 몸무게</span>
          <div className="flex items-baseline gap-1">
            <input 
              type="number" 
              value={childInfo.weight || ''} 
              onFocus={(e) => e.target.select()}
              onChange={(e) => setChildInfo(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              className="bg-transparent border-none outline-none text-[18px] font-black text-brand-gray-900 dark:text-white placeholder-brand-gray-300 focus:ring-0 p-0 w-16" 
              placeholder="0.0"
            />
            <span className="text-[13px] font-bold text-brand-gray-400">kg</span>
          </div>
        </div>
      </div>

      {/* 시기별 추천 건강 가이드 */}
      <div className="bg-brand-gray-50/50 dark:bg-apple-elevated/40 border border-brand-gray-100/50 dark:border-apple-border/40 rounded-[24px] p-4.5 mb-5 space-y-3.5 relative overflow-hidden">
        <div className="flex justify-between items-center text-[11.5px] font-black text-brand-gray-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-brand-primary animate-pulse" />
            생후 {childInfo.months}개월 추천 가이드
          </span>
          <span className="text-[10px] font-black bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 px-2 py-0.5 rounded-full">
            NIP / K-DST 연동
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5">
          {/* 예방접종 추천 */}
          <div 
            onClick={() => handleRecommendClick('vaccine')}
            className="bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border/60 rounded-xl p-3.5 cursor-pointer hover:scale-[1.02] hover:border-brand-primary/30 transition-all flex flex-col justify-between shadow-xs group"
          >
            <div>
              <span className="text-[10px] font-black text-emerald-500 block mb-1">🛡️ 필수 예방접종</span>
              <span className="text-[13px] font-black text-brand-gray-800 dark:text-white group-hover:text-brand-primary transition-colors leading-tight">
                {vaxRecommend.title}
              </span>
              <p className="text-[10.5px] text-brand-gray-400 font-bold mt-1 leading-tight line-clamp-1">
                {vaxRecommend.desc}
              </p>
            </div>
            <span className="text-[9.5px] text-brand-gray-400 font-black mt-3.5 flex items-center gap-0.5 group-hover:text-brand-primary transition-colors">
              일정 확인하기 <span className="text-[8px] tracking-tighter">▶</span>
            </span>
          </div>
          
          {/* 발달과업 추천 */}
          <div 
            onClick={() => handleRecommendClick('milestone')}
            className="bg-white dark:bg-apple-card border border-brand-gray-100 dark:border-apple-border/60 rounded-xl p-3.5 cursor-pointer hover:scale-[1.02] hover:border-brand-primary/30 transition-all flex flex-col justify-between shadow-xs group"
          >
            <div>
              <span className="text-[10px] font-black text-blue-500 block mb-1">✨ 발달 마일스톤</span>
              <span className="text-[13px] font-black text-brand-gray-800 dark:text-white group-hover:text-brand-primary transition-colors leading-tight">
                {milestoneRecommend.title}
              </span>
              <p className="text-[10.5px] text-brand-gray-400 font-bold mt-1 leading-tight line-clamp-1">
                {milestoneRecommend.desc}
              </p>
            </div>
            <span className="text-[9.5px] text-brand-gray-400 font-black mt-3.5 flex items-center gap-0.5 group-hover:text-brand-primary transition-colors">
              마일스톤 체크 <span className="text-[8px] tracking-tighter">▶</span>
            </span>
          </div>
        </div>
      </div>

      {/* Save Button (Floating style) */}
      <div className="mt-auto pt-2">
        <button 
          onClick={() => handleAddGrowthRecord({ date: new Date().toISOString().split('T')[0], height: childInfo.height, weight: childInfo.weight })}
          className="w-full h-[56px] bg-brand-gray-900 dark:bg-white text-white dark:text-brand-gray-900 rounded-full font-black text-[16px] shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2"
        >
          <Save size={18} />
          저장하기
        </button>
      </div>
    </div>
  );
};

export default GrowthCard;
