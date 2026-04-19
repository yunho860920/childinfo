// src/components/AtlasExpertReport.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Sparkles, BookOpen, GraduationCap, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { weaningTimeline, dentalTimeline, sleepSafetyGuide } from '../data/expertGuides';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AtlasExpertReport = ({ category }) => {
  if (!['식습관', '건강·안전', '수면'].includes(category)) return null;

  let data = null;
  let icon = null;
  let color = "";

  if (category === '식습관') {
    data = weaningTimeline;
    icon = <Utensils className="text-orange-500" />;
    color = "from-orange-50 to-amber-50";
  } else if (category === '건강·안전') {
    data = dentalTimeline;
    icon = <Sparkles className="text-emerald-500" />;
    color = "from-emerald-50 to-teal-50";
  } else if (category === '수면') {
    data = sleepSafetyGuide;
    icon = <BookOpen className="text-indigo-500" />;
    color = "from-indigo-50 to-blue-50";
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("p-6 rounded-[2.5rem] bg-gradient-to-br border border-white/50 shadow-xl relative overflow-hidden mb-8", color)}
    >
      <div className="absolute -top-6 -right-6 p-8 opacity-[0.05] pointer-events-none transform rotate-12 translate-x-4 translate-y-4">
        {React.cloneElement(icon, { size: 160 })}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-white/80 px-3 py-1 rounded-full text-[10px] font-black text-brand-primary flex items-center gap-1.5 shadow-sm border border-brand-primary/10">
            <GraduationCap size={12} /> ATLAS 전문 리포트
          </span>
          <span className="text-[10px] font-bold text-brand-gray-400">Hallucination Zero Verified</span>
        </div>

        <h3 className="text-xl font-black mb-2 flex items-center gap-2 text-brand-gray-900">
          {data.title}
        </h3>
        <p className="text-sm text-brand-gray-500 font-medium mb-6 uppercase tracking-tight">{data.desc}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {category === '식습관' && (data.phases || []).map((phase, i) => (
            <div key={i} className="bg-white/60 p-4 rounded-3xl border border-white/40 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full">{phase.months}</span>
                <span className="text-xs font-bold text-orange-600">{phase.stage}</span>
              </div>
              <p className="text-xs font-black mb-2 text-brand-gray-900">{phase.goal}</p>
              <div className="space-y-2">
                {(phase.foods || []).map((food, fi) => (
                  <div key={fi} className="text-[11px]">
                    <span className="text-brand-gray-400 font-bold mr-1">• {food.name}:</span>
                    <span className="text-brand-gray-700">{food.items.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {category === '건강·안전' && (data.schedule || []).slice(0, 6).map((item, i) => (
            <div key={i} className="bg-white/60 p-4 rounded-3xl border border-white/40 backdrop-blur-sm">
              <span className="text-[10px] font-black text-emerald-600 mb-1 block uppercase">{item.range}</span>
              <p className="text-xs font-black mb-1 text-brand-gray-900">{item.part}</p>
              <p className="text-[10px] text-brand-gray-500 leading-tight">{item.action}</p>
            </div>
          ))}

          {category === '수면' && (data.safety || []).map((item, i) => (
            <div key={i} className="bg-white/60 p-4 rounded-3xl border border-white/40 backdrop-blur-sm flex gap-3">
              <div className="w-8 h-8 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                <ShieldAlert size={16} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-xs font-black mb-1 text-brand-gray-900">{item.title}</p>
                <p className="text-[10px] text-brand-gray-500 leading-tight">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AtlasExpertReport;
