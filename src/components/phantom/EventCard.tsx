'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, Flame } from 'lucide-react';

export interface PolymarketEvent {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  volume24hr: string;
  endDate: string;
  category: string;
  image: string;
  description: string;
}

interface EventCardProps {
  event: PolymarketEvent;
  index: number;
}

export default function EventCard({ event, index }: EventCardProps) {
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
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Ended';
    if (diffDays <= 7) return `${diffDays}d left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w left`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCardGradient = (index: number) => {
    const gradients = [
      'from-phantom-primary/10 via-transparent to-phantom-secondary-a/5',
      'from-phantom-secondary-a/8 via-transparent to-phantom-secondary-b/5',
      'from-phantom-secondary-b/8 via-transparent to-phantom-primary/5',
      'from-phantom-primary/5 via-transparent to-phantom-secondary-a/10',
    ];
    return gradients[index % gradients.length];
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Politics': 'bg-phantom-primary/20 text-phantom-primary-light',
      'Crypto': 'bg-phantom-secondary-a/20 text-phantom-secondary-a-light',
      'Sports': 'bg-phantom-secondary-b/20 text-phantom-secondary-b',
      'Science': 'bg-purple-500/20 text-purple-300',
      'Entertainment': 'bg-pink-500/20 text-pink-300',
      'Tech': 'bg-cyan-500/20 text-cyan-300',
      'Economics': 'bg-amber-500/20 text-amber-300',
      'World': 'bg-emerald-500/20 text-emerald-300',
      'Trending': 'bg-phantom-secondary-b/15 text-phantom-secondary-b',
    };
    return colors[category] || 'bg-phantom-primary/20 text-phantom-primary-light';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`
        glass-card rounded-2xl p-5 
        transition-all duration-300 ease-out
        hover:scale-[1.01] hover:shadow-lg
        active:scale-[0.99]
        bg-gradient-to-br ${getCardGradient(index)}
        cursor-pointer
        relative overflow-hidden
      `}
    >
      {/* Hot indicator glow */}
      {isHot && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-phantom-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      )}

      {/* Header: Category + Hot badge */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(event.category)}`}>
          {event.category || 'Market'}
        </span>
        {isHot && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-1 text-[11px] font-semibold text-phantom-secondary-b"
          >
            <Flame className="w-3 h-3" />
            Hot
          </motion.div>
        )}
      </div>

      {/* Question */}
      <h3 className="text-[15px] font-semibold leading-snug mb-4 relative z-10 text-white/95 line-clamp-2">
        {event.question}
      </h3>

      {/* Probability bar */}
      <div className="space-y-2 mb-4 relative z-10">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-phantom-secondary-b">
            Yes {yesPrice.toFixed(0)}%
          </span>
          <span className="text-xs font-bold text-phantom-secondary-a-light">
            No {noPrice.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-white/5 flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${yesPrice}%` }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-l-full prob-bar-yes"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${noPrice}%` }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-r-full prob-bar-no"
          />
        </div>
      </div>

      {/* Footer: Volume + End date */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-1.5 text-phantom-text-secondary">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">
            {formatVolume(volume24h)}
            <span className="text-white/30 ml-1">24h</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-phantom-text-secondary">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{formatDate(event.endDate)}</span>
        </div>
      </div>
    </motion.div>
  );
}