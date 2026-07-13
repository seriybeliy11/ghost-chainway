'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback } from 'react';
import { X, Clock, Flame, BarChart3, ExternalLink, Activity } from 'lucide-react';

interface EventModalProps {
  event: {
    id: string;
    slug: string;
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
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
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
    { label: '24h Volume', value: formatVolume(volume24h), icon: Activity, color: 'text-emerald-400' },
    { label: 'Total Volume', value: formatVolume(totalVolume), icon: BarChart3, color: 'text-blue-400' },
    { label: 'End Date', value: event ? formatDate(event.endDate) : '', icon: Clock, color: 'text-teal-400' },
    { label: 'Days Left', value: daysLeft !== null ? `${daysLeft} days` : 'TBD', icon: Flame, color: 'text-amber-400' },
  ];

  const yesColor = yesPrice > 65
    ? 'from-emerald-400 to-emerald-500'
    : yesPrice > 40
      ? 'from-blue-400 to-cyan-400'
      : 'from-orange-400 to-red-400';

  return (
    <AnimatePresence>
      {isOpen && event && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50"
            onClick={onClose}
            style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="w-full max-w-sm max-h-[85vh] rounded-3xl overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glass container — no animated background orbs */}
              <div className="relative flex-1 flex flex-col backdrop-blur-2xl border transition-colors duration-300 bg-[#0F1E33]/95 border-white/[0.1] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                {/* Static subtle glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl bg-phantom-primary/8" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full blur-3xl bg-phantom-secondary-b/6" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border transition-colors duration-300 bg-white/[0.06] border-white/[0.08] text-white/60">
                      {event.category || 'Market'}
                    </span>
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors duration-300 active:scale-90 bg-white/5 border-white/[0.08] hover:bg-white/10"
                    >
                      <X className="w-3.5 h-3.5 transition-colors duration-300 text-white/60" />
                    </button>
                  </div>

                  {/* Question */}
                  <h2 className="text-[17px] font-bold leading-snug px-5 mb-5 transition-colors duration-300 text-white">
                    {event.question}
                  </h2>

                  {/* Probability */}
                  <div className="px-5 mb-5">
                    <div className="rounded-2xl p-4 border transition-colors duration-300 glass-card">
                      <div className="flex justify-between mb-3">
                        <div className="text-center flex-1">
                          <p className={`text-3xl font-extrabold transition-colors duration-300 ${
                            yesPrice > 65 ? 'text-emerald-400'
                              : yesPrice > 40 ? 'text-blue-400'
                              : 'text-orange-400'
                          }`}>
                            {yesPrice.toFixed(0)}%
                          </p>
                          <p className="text-[11px] font-medium mt-0.5 transition-colors duration-300 text-phantom-text-secondary">
                            {event.outcomes?.[0] || 'Yes'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-px h-10 transition-colors duration-300 bg-white/10" />
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-3xl font-extrabold transition-colors duration-300 text-teal-400">
                            {noPrice.toFixed(0)}%
                          </p>
                          <p className="text-[11px] font-medium mt-0.5 transition-colors duration-300 text-phantom-text-secondary">
                            {event.outcomes?.[1] || 'No'}
                          </p>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden flex transition-colors duration-300 bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${yesPrice}%` }}
                          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-l-full bg-gradient-to-r ${yesColor}`}
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${noPrice}%` }}
                          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-r-full bg-gradient-to-r from-teal-400 to-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats grid — no staggered animation per item */}
                  <div className="grid grid-cols-2 gap-2 px-5 mb-5">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl p-3 border transition-colors duration-300 glass-card"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <stat.icon className={`w-3 h-3 ${stat.color}`} />
                          <span className="text-[9px] font-medium uppercase tracking-wider transition-colors duration-300 text-phantom-text-secondary">
                            {stat.label}
                          </span>
                        </div>
                        <p className="text-sm font-bold transition-colors duration-300 text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Hot badge — no animation */}
                  {isHot && (
                    <div
                      className="mx-5 mb-5 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors duration-300"
                      style={{
                        background: isVeryHot ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)',
                        borderColor: isVeryHot ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)',
                      }}
                    >
                      <Flame className={`w-3.5 h-3.5 ${isVeryHot ? 'text-red-400' : 'text-orange-400'}`} />
                      <span className="text-[11px] font-medium transition-colors duration-300 text-white/50">
                        {isVeryHot ? 'Blazing — Extremely high trading activity' : 'Trending — High trading activity'}
                      </span>
                    </div>
                  )}

                  {/* Trade on Polymarket */}
                  <div className="px-5 pb-5">
                    <a
                      href={event.slug ? `https://polymarket.com/event/${event.slug}?ref=phantom` : 'https://polymarket.com/?ref=phantom'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] no-underline"
                      style={{
                        background: 'linear-gradient(135deg, #057D9F, #03436A)',
                        boxShadow: '0 8px 32px rgba(5,125,159,0.25)',
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Trade on Polymarket
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}