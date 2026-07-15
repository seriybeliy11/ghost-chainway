'use client';

import { TrendingUp } from 'lucide-react';
import type { PolymarketEvent } from '@/components/phantom/EventCard';

interface CompactEventCardProps {
  event: PolymarketEvent;
  onClick: () => void;
}

const categoryDots: Record<string, string> = {
  Politics: 'bg-blue-400',
  Crypto: 'bg-purple-400',
  Sports: 'bg-emerald-400',
  Science: 'bg-violet-400',
  Entertainment: 'bg-pink-400',
  Tech: 'bg-cyan-400',
  Economics: 'bg-amber-400',
  World: 'bg-teal-400',
  Trending: 'bg-white/40',
};

function formatVolume(vol: number): string {
  if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
  if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
  return `$${vol.toFixed(0)}`;
}

function getProbColor(pct: number): string {
  if (pct > 65) return 'text-emerald-400';
  if (pct > 40) return 'text-blue-400';
  return 'text-orange-400';
}

function getProbBarColor(pct: number): string {
  if (pct > 65) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
  if (pct > 40) return 'bg-gradient-to-r from-blue-500 to-cyan-400';
  return 'bg-gradient-to-r from-orange-500 to-red-400';
}

export default function CompactEventCard({ event, onClick }: CompactEventCardProps) {
  const yesPrice = parseFloat(event.outcomePrices?.[0] || '0') * 100;
  const volume24h = parseFloat(event.volume24hr || '0');
  const dotColor = categoryDots[event.category] || categoryDots['Trending'];

  return (
    <button
      onClick={onClick}
      className="glass rounded-2xl p-4 w-full press-effect cursor-pointer text-left transition-all duration-200 hover:bg-white/[0.04] active:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12]"
      style={{ height: '80px' }}
    >
      <div className="flex items-start gap-3 h-full">
        {/* Left content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start gap-2">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
            <h3 className="text-[14px] font-semibold leading-snug line-clamp-2 text-white/85">
              {event.question}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-white/35 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span className="text-[11px] font-medium">{formatVolume(volume24h)}</span>
            <span className="text-[9px] text-white/20">/24h</span>
          </div>
        </div>

        {/* Right: probability */}
        <div className="flex flex-col items-end justify-center flex-shrink-0 pl-2">
          <span className={`text-[24px] font-bold leading-none ${getProbColor(yesPrice)}`}>
            {yesPrice.toFixed(0)}
          </span>
          <span className="text-[9px] font-semibold text-white/25 mt-0.5">
            {event.outcomes?.[0] || 'Yes'}
          </span>
        </div>
      </div>

      {/* Thin probability bar */}
      <div className="mt-2.5 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProbBarColor(yesPrice)}`}
          style={{ width: `${yesPrice}%` }}
        />
      </div>
    </button>
  );
}