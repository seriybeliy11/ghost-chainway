'use client';

import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { X, TrendingUp, Clock, Flame, BarChart3, ExternalLink, Activity } from 'lucide-react';

const Ghost3D = dynamic(() => import('@/components/phantom/Ghost3D'), {
  ssr: false,
  loading: () => <div className="w-full h-40" />,
});

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
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!event) return null;

  const yesPrice = parseFloat(event.outcomePrices?.[0] || '0') * 100;
  const noPrice = 100 - yesPrice;
  const volume24h = parseFloat(event.volume24hr || '0');
  const totalVolume = parseFloat(event.volume || '0');
  const isHot = volume24h > 500000;

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

  const daysLeft = getDaysLeft(event.endDate);

  const stats = [
    { label: '24h Volume', value: formatVolume(volume24h), icon: Activity, color: 'text-phantom-secondary-b' },
    { label: 'Total Volume', value: formatVolume(totalVolume), icon: BarChart3, color: 'text-phantom-primary-light' },
    { label: 'End Date', value: formatDate(event.endDate), icon: Clock, color: 'text-phantom-secondary-a-light' },
    { label: 'Days Left', value: daysLeft !== null ? `${daysLeft} days` : 'TBD', icon: Flame, color: 'text-amber-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Centered modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full max-w-sm max-h-[85vh] rounded-3xl overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glass container */}
              <div className="relative flex-1 flex flex-col bg-[#0D0D24]/95 backdrop-blur-2xl border border-white/[0.1] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">

                {/* Animated background orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{ x: [0, 20, -15, 0], y: [0, -20, 10, 0], scale: [1, 1.3, 0.8, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-phantom-primary/10 blur-3xl"
                  />
                  <motion.div
                    animate={{ x: [0, -15, 10, 0], y: [0, 10, -20, 0], scale: [1, 0.8, 1.2, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-phantom-secondary-a/8 blur-3xl"
                  />
                  <motion.div
                    animate={{ x: [0, 10, -10, 0], y: [0, -10, 15, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                    className="absolute top-1/3 left-1/2 w-36 h-36 rounded-full bg-phantom-secondary-b/6 blur-3xl"
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 overflow-y-auto">
                  {/* Header with close */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 backdrop-blur-sm">
                      {event.category || 'Market'}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85, rotate: 90 }}
                      onClick={onClose}
                      className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5 text-white/60" />
                    </motion.button>
                  </div>

                  {/* Question */}
                  <motion.h2
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-lg font-bold text-white leading-snug px-5 mb-5"
                  >
                    {event.question}
                  </motion.h2>

                  {/* Probability display */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="px-5 mb-5"
                  >
                    <div className="glass-card rounded-2xl p-4">
                      <div className="flex justify-between mb-3">
                        <div className="text-center flex-1">
                          <p className="text-3xl font-extrabold text-phantom-secondary-b">{yesPrice.toFixed(0)}%</p>
                          <p className="text-[11px] font-medium text-phantom-text-secondary mt-0.5">{event.outcomes?.[0] || 'Yes'}</p>
                        </div>
                        <div className="flex items-center"><div className="w-px h-10 bg-white/10" /></div>
                        <div className="text-center flex-1">
                          <p className="text-3xl font-extrabold text-phantom-secondary-a-light">{noPrice.toFixed(0)}%</p>
                          <p className="text-[11px] font-medium text-phantom-text-secondary mt-0.5">{event.outcomes?.[1] || 'No'}</p>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden bg-white/5 flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${yesPrice}%` }}
                          transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-l-full prob-bar-yes"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${noPrice}%` }}
                          transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-r-full prob-bar-no"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Stats grid */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="grid grid-cols-2 gap-2 px-5 mb-5"
                  >
                    {stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.25 + i * 0.05, duration: 0.3 }}
                        className="glass-card rounded-xl p-3"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <stat.icon className={`w-3 h-3 ${stat.color}`} />
                          <span className="text-[9px] font-medium text-phantom-text-secondary uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <p className="text-sm font-bold text-white">{stat.value}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Hot badge */}
                  {isHot && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.3 }}
                      className="mx-5 mb-5 flex items-center justify-center gap-2 py-2 rounded-xl glass-card"
                    >
                      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                      </motion.div>
                      <span className="text-[11px] font-medium text-white/60">Trending — High trading activity</span>
                    </motion.div>
                  )}

                  {/* CTA */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="px-5 pb-5"
                  >
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-phantom-primary to-phantom-secondary-a text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-phantom-primary/15"
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