'use client';

import { Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import TooltipAbout from './TooltipAbout';
import LeaderboardCard from './LeaderboardCard';
import CompactEventCard from './CompactEventCard';
import { MOCK_TRADERS } from '@/lib/mock-data';
import type { PolymarketEvent } from './EventCard';

interface LeaderboardViewProps {
  events: PolymarketEvent[];
  onSelectEvent: (event: PolymarketEvent) => void;
}

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

export default function LeaderboardView({ events, onSelectEvent }: LeaderboardViewProps) {
  const topEvents = events.slice(0, 6);

  return (
    <div className="space-y-6 pb-24">
      {/* Top Traders Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-[15px] font-bold text-white/90">Top Traders 24h</h2>
          <TooltipAbout
            title="Top Traders"
            text="These are the top-performing Polymarket traders in the last 24 hours, ranked by their profit & loss. We track their volume, trade count, and win rate so you know who's on fire. 🔥"
          />
        </div>

        {/* Horizontal scrollable trader cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {MOCK_TRADERS.map((trader) => (
            <LeaderboardCard key={trader.rank} trader={trader} />
          ))}
        </div>
      </section>

      {/* Hot Markets Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-phantom-secondary-b" />
          <h2 className="text-[15px] font-bold text-white/90">Hot Markets</h2>
          <TooltipAbout
            title="Hot Markets"
            text="Markets with the highest 24-hour trading volume. The hotter the market, the more action — and usually the sharper the odds. 📊"
          />
        </div>

        {/* Compact stat cards grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {topEvents.map((event) => {
            const yesPrice = parseFloat(event.outcomePrices?.[0] || '0') * 100;
            const volume24h = parseFloat(event.volume24hr || '0');
            return (
              <button
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="glass rounded-xl p-3 press-effect cursor-pointer text-left transition-all duration-200 hover:bg-white/[0.04] active:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/[0.06]">
                    {event.category || 'Market'}
                  </span>
                  <BarChart3 className="w-3 h-3 text-white/20" />
                </div>
                <p className="text-[13px] font-semibold leading-snug line-clamp-2 text-white/75 mb-2">
                  {event.question}
                </p>
                <div className="flex items-end justify-between">
                  <span className="text-[11px] font-medium text-white/30">
                    📊 {formatVolume(volume24h)}
                  </span>
                  <span className={`text-[16px] font-bold ${getProbColor(yesPrice)}`}>
                    {yesPrice.toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Full compact list */}
        <div className="space-y-2.5">
          {events.map((event) => (
            <CompactEventCard
              key={event.id}
              event={event}
              onClick={() => onSelectEvent(event)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}