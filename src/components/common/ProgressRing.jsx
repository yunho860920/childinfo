// src/components/common/ProgressRing.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const ProgressRing = ({ 
  percentage, 
  size = 180, 
  strokeWidth = 14, 
  onShowChart
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative group/ring">
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-brand-gray-100 dark:text-brand-gray-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#FF8E8E" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-brand-gray-900 dark:text-white tracking-tighter">
          {percentage}%
        </span>
        <span className="text-[10px] font-black text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-widest mt-1">
          성장 백분위
        </span>
        
        {/* 'View Chart' button moved inside the ring as requested */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowChart}
          className="mt-4 px-3 py-1.5 bg-brand-primary text-white text-[10px] font-black rounded-full shadow-lg shadow-brand-primary/30 flex items-center gap-1.5 hover:bg-brand-primary/90 transition-colors"
        >
          <TrendingUp size={12} />
          차트 보기
        </motion.button>
      </div>
    </div>
  );
};

export default ProgressRing;
