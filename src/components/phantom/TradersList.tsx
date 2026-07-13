'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, Target, Flame, Info, Clock } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface PLPoint {
  time: string;
  value: number;
}

interface Trade {
  id: string;
  marketSlug: string;
  marketQuestion: string;
  outcome: string;
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  profit: number;
  timestamp: string;
  category: string;
}

interface Trader {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatarEmoji: string;
  profit24h: number;
  profitPercent: number;
  winRate: number;
  trades24h: number;
  totalVolume: string;
  streak: number;
  badge: string;
  recentTrades: Trade[];
  plChart: PLPoint[];
}

function formatProfit(value: number): string {
  const sign = value >= 0 ? '+' : '';
  if (Math.abs(value) >= 1_000_000) return `${sign}$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${sign}$${(value / 1_000).toFixed(1)}K`;
  return `${sign}$${value.toFixed(0)}`;
}

function getRankStyle(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 2:
      return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
    case 3:
      return 'bg-amber-700/20 text-amber-500 border-amber-700/30';
    default:
      return 'bg-white/[0.06] text-white/40 border-white/10';
  }
}

function SkeletonList({ isDark }: { isDark: boolean }) {
  const cardClass = isDark ? 'glass-card' : 'glass-card-light';
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton-shimmer h-5 w-40 rounded" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`${cardClass} rounded-2xl p-4`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="skeleton-shimmer h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="skeleton-shimmer h-4 w-28 rounded mb-1.5" />
              <div className="skeleton-shimmer h-3 w-20 rounded" />
            </div>
            <div className="text-right">
              <div className="skeleton-shimmer h-5 w-20 rounded mb-1" />
              <div className="skeleton-shimmer h-3 w-12 rounded" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="skeleton-shimmer h-3 w-16 rounded" />
            <div className="skeleton-shimmer h-3 w-16 rounded" />
            <div className="skeleton-shimmer h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TradersList({
  onTraderClick,
  isDark = true,
}: {
  onTraderClick: (traderId: string) => void;
  isDark?: boolean;
}) {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTraders() {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        setTraders(data.traders || []);
      } catch (err) {
        console.error('Failed to fetch traders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTraders();
  }, []);

  if (loading) return <SkeletonList isDark={isDark} />;

  const cardClass = isDark ? 'glass-card' : 'glass-card-light';
  const textPrimary = isDark ? 'text-white/90' : 'text-gray-900';
  const textSecondary = isDark ? 'text-white/50' : 'text-gray-500';

  return (
    <div className="section-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <h2 className={`text-lg font-semibold ${textPrimary}`}>
          All Traders
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`${textSecondary} hover:text-white/70 transition-colors`}
              aria-label="Info about traders list"
            >
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-[13px]">Top performing traders sorted by 24h profit</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Trader Cards */}
      <div className="space-y-3">
        {traders.map((trader, index) => (
          <button
            key={trader.id}
            onClick={() => onTraderClick(trader.id)}
            className={`${cardClass} rounded-2xl p-4 w-full text-left transition-transform duration-200 active:scale-[0.98] hover:brightness-110 card-2d-enter`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* Rank Badge */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border ${getRankStyle(trader.rank)}`}
              >
                #{trader.rank}
              </div>

              {/* Avatar (large 40px) */}
              <span className="text-[40px] leading-none shrink-0" role="img">
                {trader.avatarEmoji}
              </span>

              {/* Name + Username + Badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[15px] font-semibold ${textPrimary} truncate`}>
                    {trader.displayName}
                  </span>
                  <span className="text-base">{trader.badge}</span>
                </div>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  @{trader.username}
                </p>
              </div>

              {/* Profit 24h */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5 justify-end">
                  {trader.profit24h >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : null}
                  <span
                    className={`text-[15px] font-bold ${
                      trader.profit24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatProfit(trader.profit24h)}
                  </span>
                </div>
                <p className={`text-xs ${textSecondary}`}>
                  {trader.profitPercent >= 0 ? '+' : ''}{trader.profitPercent.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-phantom-primary-bright" />
                <span className={`text-[13px] ${textSecondary}`}>
                  {trader.winRate}% win
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-phantom-primary-bright" />
                <span className={`text-[13px] ${textSecondary}`}>
                  {trader.trades24h} trades
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className={`text-[13px] ${textSecondary}`}>
                  {trader.streak} streak
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}