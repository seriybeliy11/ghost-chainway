'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Flame, TrendingUp, Clock } from 'lucide-react';

export interface PolymarketEvent {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: string[];
  volume24hr: string;
  volume: string;
  endDate: string;
  category: string;
  image?: string;
  description?: string;
}

interface EventCardProps {
  event: PolymarketEvent;
  index: number;
  onClick: () => void;
  isDark?: boolean;
}

const darkBgGradients = [
  'from-[#1a0a3e]/90 via-[#0d1a4a]/85 to-[#070714]',
  'from-[#0a1a3e]/90 via-[#1a0a3e]/85 to-[#070714]',
  'from-[#0a2a2a]/90 via-[#0d1a3e]/85 to-[#070714]',
  'from-[#1a1a0a]/90 via-[#0a1a2a]/85 to-[#070714]',
];

const lightBgGradients = [
  'from-blue-50/95 via-indigo-50/90 to-white',
  'from-purple-50/95 via-blue-50/90 to-white',
  'from-emerald-50/95 via-cyan-50/90 to-white',
  'from-amber-50/95 via-orange-50/90 to-white',
];

export default function EventCard({ event, index, onClick, isDark = true }: EventCardProps) {
  const yesPrice = parseFloat(event.outcomePrices?.[0] || '0') * 100;
  const noPrice = 100 - yesPrice;
  const volume24h = parseFloat(event.volume24hr || '0');
  const isHot = volume24h > 500000;
  const isVeryHot = volume24h > 2000000;

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Ended';
    if (diffDays <= 1) return '24h';
    if (diffDays <= 7) return `${diffDays}d`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCategoryStyle = (category: string) => {
    const darkStyles: Record<string, string> = {
      'Politics': 'bg-blue-500/20 text-blue-300 border-blue-500/25',
      'Crypto': 'bg-purple-500/20 text-purple-300 border-purple-500/25',
      'Sports': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25',
      'Science': 'bg-violet-500/20 text-violet-300 border-violet-500/25',
      'Entertainment': 'bg-pink-500/20 text-pink-300 border-pink-500/25',
      'Tech': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/25',
      'Economics': 'bg-amber-500/20 text-amber-300 border-amber-500/25',
      'World': 'bg-teal-500/20 text-teal-300 border-teal-500/25',
      'Trending': 'bg-white/10 text-white/70 border-white/10',
    };
    const lightStyles: Record<string, string> = {
      'Politics': 'bg-blue-100 text-blue-700 border-blue-200',
      'Crypto': 'bg-purple-100 text-purple-700 border-purple-200',
      'Sports': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Science': 'bg-violet-100 text-violet-700 border-violet-200',
      'Entertainment': 'bg-pink-100 text-pink-700 border-pink-200',
      'Tech': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Economics': 'bg-amber-100 text-amber-700 border-amber-200',
      'World': 'bg-teal-100 text-teal-700 border-teal-200',
      'Trending': 'bg-gray-100 text-gray-600 border-gray-200',
    };
    if (isDark) return darkStyles[category] || darkStyles['Trending'];
    return lightStyles[category] || lightStyles['Trending'];
  };

  const bgGradients = isDark ? darkBgGradients : lightBgGradients;
  const bgGrad = bgGradients[index % bgGradients.length];

  // Dynamic color for probability based on value
  const yesColor = yesPrice > 65
    ? (isDark ? 'from-emerald-400 to-emerald-500' : 'from-emerald-500 to-emerald-600')
    : yesPrice > 40
      ? (isDark ? 'from-blue-400 to-cyan-400' : 'from-blue-500 to-cyan-600')
      : (isDark ? 'from-orange-400 to-red-400' : 'from-orange-500 to-red-500');

  const noColor = isDark ? 'from-purple-400 to-indigo-500' : 'from-purple-500 to-indigo-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.06,
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={isDark ? { y: -2, boxShadow: '0 12px 48px rgba(115,255,228,0.12), 0 0 0 1px rgba(115,255,228,0.1)' } : { y: -2, boxShadow: '0 12px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 h-[190px] ${
        isDark
          ? 'border border-white/[0.08] hover:border-white/[0.15]'
          : 'border border-gray-200/80 hover:border-gray-300 shadow-sm hover:shadow-lg'
      }`}
    >
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGrad}`}>
        {/* Animated orbs - more prominent */}
        <motion.div
          animate={{
            x: [0, 20, -15, 8, 0],
            y: [0, -15, 20, -10, 0],
            scale: [1, 1.4, 0.85, 1.15, 1],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -top-12 -left-12 w-36 h-36 rounded-full blur-2xl ${
            isDark ? 'bg-phantom-primary/20' : 'bg-blue-300/30'
          }`}
        />
        <motion.div
          animate={{
            x: [0, -25, 15, -8, 0],
            y: [0, 18, -15, 25, 0],
            scale: [1, 0.75, 1.3, 0.85, 1],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl ${
            isDark ? 'bg-phantom-secondary-a/15' : 'bg-purple-300/25'
          }`}
        />
        <motion.div
          animate={{
            x: [0, 12, -18, 10, 0],
            y: [0, -18, 8, -12, 0],
            scale: [1.1, 0.85, 1.25, 0.95, 1.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full blur-3xl ${
            isDark ? 'bg-phantom-secondary-b/10' : 'bg-emerald-300/20'
          }`}
        />
        {/* Glass overlay for readability */}
        <div className={`absolute inset-0 transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-b from-black/15 via-black/35 to-black/80'
            : 'bg-gradient-to-b from-white/10 via-white/30 to-white/70'
        }`} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        {/* Top: Category + Hot badge */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border transition-colors duration-300 ${getCategoryStyle(event.category)}`}>
            {event.category || 'Market'}
          </span>
          {isHot && (
            <motion.div
              animate={isVeryHot ? { scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] } : { scale: [1, 1.08, 1] }}
              transition={{ duration: isVeryHot ? 1.2 : 2, repeat: Infinity, ease: 'easeInOut' }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md border transition-colors duration-300 ${
                isVeryHot
                  ? (isDark ? 'bg-red-500/25 border-red-500/30' : 'bg-red-100 border-red-200')
                  : (isDark ? 'bg-orange-500/20 border-orange-500/25' : 'bg-orange-100 border-orange-200')
              }`}
            >
              <Flame className={`w-3 h-3 ${isVeryHot ? 'text-red-400' : 'text-orange-400'}`} />
              <span className={`text-[10px] font-bold ${isVeryHot ? 'text-red-300' : 'text-orange-300'}`}>
                {isVeryHot ? 'Blazing' : 'Hot'}
              </span>
            </motion.div>
          )}
        </div>

        {/* Middle: Question - more expressive */}
        <div className="flex-1 flex items-center">
          <h3 className={`text-[15px] font-bold leading-snug line-clamp-2 drop-shadow-lg transition-colors duration-300 ${
            isDark ? 'text-white/95' : 'text-gray-900'
          }`}>
            {event.question}
          </h3>
        </div>

        {/* Bottom: Probability + Stats */}
        <div className="space-y-2.5">
          {/* Big probability numbers */}
          <div className="flex items-end justify-between mb-1">
            <div>
              <span className={`text-[22px] font-extrabold leading-none transition-colors duration-300 ${
                yesPrice > 65 ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                  : yesPrice > 40 ? (isDark ? 'text-blue-400' : 'text-blue-600')
                  : (isDark ? 'text-orange-400' : 'text-orange-600')
              }`}>
                {yesPrice.toFixed(0)}<span className="text-[13px] font-bold">%</span>
              </span>
              <span className={`text-[10px] font-semibold ml-1.5 transition-colors duration-300 ${
                isDark ? 'text-white/40' : 'text-gray-400'
              }`}>
                {event.outcomes?.[0] || 'Yes'}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-[22px] font-extrabold leading-none transition-colors duration-300 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {noPrice.toFixed(0)}<span className="text-[13px] font-bold">%</span>
              </span>
              <span className={`text-[10px] font-semibold mr-1.5 transition-colors duration-300 ${
                isDark ? 'text-white/40' : 'text-gray-400'
              }`}>
                {event.outcomes?.[1] || 'No'}
              </span>
            </div>
          </div>

          {/* Probability bar */}
          <div className={`h-2 rounded-full overflow-hidden flex transition-colors duration-300 ${
            isDark ? 'bg-white/8' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${yesPrice}%` }}
              transition={{ delay: index * 0.06 + 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-l-full bg-gradient-to-r ${yesColor}`}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${noPrice}%` }}
              transition={{ delay: index * 0.06 + 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-r-full bg-gradient-to-r ${noColor}`}
            />
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 transition-colors duration-300 ${
              isDark ? 'text-white/40' : 'text-gray-500'
            }`}>
              <TrendingUp className="w-3 h-3" />
              <span className="text-[11px] font-semibold">{formatVolume(volume24h)}</span>
              <span className={`text-[9px] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>/24h</span>
            </div>
            <div className={`flex items-center gap-1 transition-colors duration-300 ${
              isDark ? 'text-white/40' : 'text-gray-500'
            }`}>
              <Clock className="w-3 h-3" />
              <span className="text-[11px] font-medium">{formatDate(event.endDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}