'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback } from 'react';
import { X, TrendingUp, Clock, Flame, BarChart3, ExternalLink, Activity, Zap } from 'lucide-react';

interface EventModalProps {
  event: {
    id: string;
    question: string;
    outcomes: string[];
    outcomePrices: string[];
    volume: string;
    volume24hr: string;
    endDate: string;
    category: string;
    description: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export default function EventModal({ event, isOpen, onClose, isDark = true }: EventModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const yesPrice = event ? parseFloat(event.outcomePrices?.[0] || '0') * 100 : 0;
  const noPrice = 100 - yesPrice;
  const volume24h = event ? parseFloat(event.volume24hr || '0') : 0;
  const totalVolume = event ? parseFloat(event.volume || '0') : 0;
  const isHot = volume24h > 500000;
  const isVeryHot = volume24h > 2000000;

  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) return `$${(vol / 1000000000).toFixed(1)}B`;
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getDaysLeft = (dateStr: string) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    return diff <= 0 ? 0 : diff;
  };

  const daysLeft = event ? getDaysLeft(event.endDate) : null;

  const stats = [
    { label: '24h Volume', value: formatVolume(volume24h), icon: Activity, color: isDark ? 'text-emerald-400' : 'text-emerald-600' },
    { label: 'Total Volume', value: formatVolume(totalVolume), icon: BarChart3, color: isDark ? 'text-blue-400' : 'text-blue-600' },
    { label: 'End Date', value: event ? formatDate(event.endDate) : '', icon: Clock, color: isDark ? 'text-purple-400' : 'text-purple-600' },
    { label: 'Days Left', value: daysLeft !== null ? `${daysLeft} days` : 'TBD', icon: Flame, color: isDark ? 'text-amber-400' : 'text-amber-600' },
  ];

  // Pre-compute the modal content for the event so there's no layout shift
  const yesColor = yesPrice > 65
    ? 'from-emerald-400 to-emerald-500'
    : yesPrice > 40
      ? 'from-blue-400 to-cyan-400'
      : 'from-orange-400 to-red-400';

  return (
    <AnimatePresence>
      {isOpen && event && (
        <>
          {/* Backdrop - soft fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50"
            onClick={onClose}
            style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.25)' }}
          />

          {/* Centered modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 280,
                mass: 0.8,
              }}
              className="w-full max-w-sm max-h-[85vh] rounded-3xl overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glass container */}
              <div className={`relative flex-1 flex flex-col backdrop-blur-2xl border transition-colors duration-300 ${
                isDark
                  ? 'bg-[#0D0D24]/95 border-white/[0.1] shadow-[0_24px_80px_rgba(0,0,0,0.6)]'
                  : 'bg-white/90 border-gray-200 shadow-[0_24px_80px_rgba(0,0,0,0.15)]'
              }`}>

                {/* Animated background orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{ x: [0, 20, -15, 0], y: [0, -20, 10, 0], scale: [1, 1.3, 0.8, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl transition-colors duration-300 ${
                      isDark ? 'bg-blue-500/10' : 'bg-blue-200/40'
                    }`}
                  />
                  <motion.div
                    animate={{ x: [0, -15, 10, 0], y: [0, 10, -20, 0], scale: [1, 0.8, 1.2, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className={`absolute -bottom-12 -left-12 w-32 h-32 rounded-full blur-3xl transition-colors duration-300 ${
                      isDark ? 'bg-purple-500/8' : 'bg-purple-200/30'
                    }`}
                  />
                  <motion.div
                    animate={{ x: [0, 10, -10, 0], y: [0, -10, 15, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                    className={`absolute top-1/3 left-1/2 w-36 h-36 rounded-full blur-3xl transition-colors duration-300 ${
                      isDark ? 'bg-emerald-500/6' : 'bg-emerald-200/25'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 overflow-y-auto">
                  {/* Header with close */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border transition-colors duration-300 ${
                      isDark ? 'bg-white/[0.06] border-white/[0.08] text-white/60' : 'bg-gray-100 border-gray-200 text-gray-600'
                    }`}>
                      {event.category || 'Market'}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85, rotate: 90 }}
                      onClick={onClose}
                      className={`w-8 h-8 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors duration-300 ${
                        isDark ? 'bg-white/5 border-white/[0.08] hover:bg-white/10' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <X className={`w-3.5 h-3.5 transition-colors duration-300 ${isDark ? 'text-white/60' : 'text-gray-500'}`} />
                    </motion.button>
                  </div>

                  {/* Question */}
                  <motion.h2
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`text-[17px] font-bold leading-snug px-5 mb-5 transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {event.question}
                  </motion.h2>

                  {/* Probability display */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.12, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="px-5 mb-5"
                  >
                    <div className={`rounded-2xl p-4 border transition-colors duration-300 ${
                      isDark ? 'glass-card' : 'glass-card-light'
                    }`}>
                      <div className="flex justify-between mb-3">
                        <div className="text-center flex-1">
                          <p className={`text-3xl font-extrabold transition-colors duration-300 ${
                            yesPrice > 65 ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                              : yesPrice > 40 ? (isDark ? 'text-blue-400' : 'text-blue-600')
                              : (isDark ? 'text-orange-400' : 'text-orange-600')
                          }`}>
                            {yesPrice.toFixed(0)}%
                          </p>
                          <p className={`text-[11px] font-medium mt-0.5 transition-colors duration-300 ${isDark ? 'text-phantom-text-secondary' : 'text-gray-500'}`}>
                            {event.outcomes?.[0] || 'Yes'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-px h-10 transition-colors duration-300 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                        </div>
                        <div className="text-center flex-1">
                          <p className={`text-3xl font-extrabold transition-colors duration-300 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            {noPrice.toFixed(0)}%
                          </p>
                          <p className={`text-[11px] font-medium mt-0.5 transition-colors duration-300 ${isDark ? 'text-phantom-text-secondary' : 'text-gray-500'}`}>
                            {event.outcomes?.[1] || 'No'}
                          </p>
                        </div>
                      </div>
                      <div className={`h-2.5 rounded-full overflow-hidden flex transition-colors duration-300 ${
                        isDark ? 'bg-white/5' : 'bg-gray-100'
                      }`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${yesPrice}%` }}
                          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-l-full bg-gradient-to-r ${yesColor}`}
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${noPrice}%` }}
                          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-r-full bg-gradient-to-r from-purple-400 to-indigo-500"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Stats grid */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.18, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-2 gap-2 px-5 mb-5"
                  >
                    {stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.22 + i * 0.04, duration: 0.3 }}
                        className={`rounded-xl p-3 border transition-colors duration-300 ${
                          isDark ? 'glass-card' : 'glass-card-light'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <stat.icon className={`w-3 h-3 ${stat.color}`} />
                          <span className={`text-[9px] font-medium uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-phantom-text-secondary' : 'text-gray-500'}`}>
                            {stat.label}
                          </span>
                        </div>
                        <p className={`text-sm font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Hot badge */}
                  {isHot && (
                    <motion.div
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="mx-5 mb-5 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors duration-300"
                      style={{
                        background: isDark
                          ? (isVeryHot ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)')
                          : (isVeryHot ? 'rgba(239,68,68,0.05)' : 'rgba(249,115,22,0.05)'),
                        borderColor: isDark
                          ? (isVeryHot ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)')
                          : (isVeryHot ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)')
                      }}
                    >
                      <motion.div
                        animate={isVeryHot ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : { scale: [1, 1.12, 1] }}
                        transition={{ duration: isVeryHot ? 1.2 : 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Flame className={`w-3.5 h-3.5 ${isVeryHot ? 'text-red-400' : 'text-orange-400'}`} />
                      </motion.div>
                      <span className={`text-[11px] font-medium transition-colors duration-300 ${
                        isDark ? 'text-white/50' : 'text-gray-500'
                      }`}>
                        {isVeryHot ? 'Blazing — Extremely high trading activity' : 'Trending — High trading activity'}
                      </span>
                    </motion.div>
                  )}

                  {/* CTA */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                    className="px-5 pb-5"
                  >
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, #406CFF, #6A00FF)'
                          : 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                        boxShadow: isDark
                          ? '0 8px 32px rgba(64,108,255,0.25)'
                          : '0 8px 32px rgba(59,130,246,0.2)',
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Trade on Polymarket
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}