'use client';

import { motion } from 'framer-motion';

interface EventCardProps {
  event: {
    id: string;
    question: string;
    outcomes: string[];
    outcomePrices: string[];
    volume24hr: string;
    endDate: string;
    category: string;
  };
  index: number;
  onClick: () => void;
}

const bgGradients = [
  'from-phantom-primary/25 via-phantom-secondary-a/15 to-phantom-dark',
  'from-phantom-secondary-a/20 via-phantom-secondary-b/10 to-phantom-dark',
  'from-phantom-secondary-b/15 via-phantom-primary/10 to-phantom-dark',
  'from-phantom-secondary-a/15 via-phantom-primary/20 to-phantom-dark',
];

export default function EventCard({ event, index, onClick }: EventCardProps) {
  const yesPrice = parseFloat(event.outcomePrices?.[0] || '0') * 100;
  const noPrice = 100 - yesPrice;
  const volume24h = parseFloat(event.volume24hr || '0');
  const isHot = volume24h > 500000;

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
    if (diffDays <= 7) return `${diffDays}d left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w left`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Politics': 'bg-phantom-primary/25 text-phantom-primary-light border-phantom-primary/20',
      'Crypto': 'bg-phantom-secondary-a/25 text-phantom-secondary-a-light border-phantom-secondary-a/20',
      'Sports': 'bg-phantom-secondary-b/25 text-phantom-secondary-b border-phantom-secondary-b/20',
      'Science': 'bg-purple-500/25 text-purple-300 border-purple-500/20',
      'Entertainment': 'bg-pink-500/25 text-pink-300 border-pink-500/20',
      'Tech': 'bg-cyan-500/25 text-cyan-300 border-cyan-500/20',
      'Economics': 'bg-amber-500/25 text-amber-300 border-amber-500/20',
      'World': 'bg-emerald-500/25 text-emerald-300 border-emerald-500/20',
      'Trending': 'bg-white/10 text-white/70 border-white/10',
    };
    return colors[category] || 'bg-phantom-primary/25 text-phantom-primary-light border-phantom-primary/20';
  };

  const bgGrad = bgGradients[index % bgGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.07,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer border border-white/[0.08] h-[180px] transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(64,108,255,0.12)] active:shadow-none"
    >
      {/* Animated pulse background placeholder */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGrad}`}>
        {/* Animated orbs */}
        <motion.div
          animate={{
            x: [0, 15, -10, 5, 0],
            y: [0, -10, 15, -5, 0],
            scale: [1, 1.3, 0.9, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-phantom-primary/15 blur-2xl"
        />
        <motion.div
          animate={{
            x: [0, -20, 10, -5, 0],
            y: [0, 15, -10, 20, 0],
            scale: [1, 0.8, 1.2, 0.9, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-phantom-secondary-a/12 blur-2xl"
        />
        <motion.div
          animate={{
            x: [0, 10, -15, 8, 0],
            y: [0, -15, 5, -8, 0],
            scale: [1.1, 0.9, 1.2, 1, 1.1],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-phantom-secondary-b/8 blur-3xl"
        />
        {/* Glass overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/75" />
      </div>

      {/* Frosted glass content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        {/* Top: Category + Hot */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border ${getCategoryColor(event.category)}`}>
            {event.category || 'Market'}
          </span>
          {isHot && (
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 backdrop-blur-md border border-orange-500/20"
            >
              <svg className="w-3 h-3 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 4.9 2.5 0 5-2.5 5-2.5 0 .38-.5 2-2 3.5"/>
              </svg>
              <span className="text-[10px] font-bold text-orange-300">Hot</span>
            </motion.div>
          )}
        </div>

        {/* Middle: Question */}
        <div className="flex-1 flex items-center">
          <h3 className="text-[15px] font-semibold leading-snug text-white/95 line-clamp-2 drop-shadow-lg">
            {event.question}
          </h3>
        </div>

        {/* Bottom: Probability + Stats */}
        <div className="space-y-2.5">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-phantom-secondary-b drop-shadow">Yes {yesPrice.toFixed(0)}%</span>
              <span className="text-[11px] font-bold text-phantom-secondary-a-light drop-shadow">No {noPrice.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${yesPrice}%` }}
                transition={{ delay: index * 0.07 + 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-l-full bg-gradient-to-r from-phantom-secondary-b/90 to-phantom-secondary-b"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${noPrice}%` }}
                transition={{ delay: index * 0.07 + 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-r-full bg-gradient-to-r from-phantom-secondary-a to-phantom-secondary-a-bright"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/50">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>
              <span className="text-[11px] font-medium">{formatVolume(volume24h)}<span className="text-white/25 ml-0.5">24h</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-white/50">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span className="text-[11px] font-medium">{formatDate(event.endDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}