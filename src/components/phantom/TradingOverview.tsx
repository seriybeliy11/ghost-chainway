'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Info, TrendingUp, Target, Flame } from 'lucide-react';
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

function MiniPLChart({ data, width = 120, height = 40 }: { data: PLPoint[]; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;

  const values = data.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((p, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p.value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="block"
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="#39AECF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkeletonOverview({ isDark }: { isDark: boolean }) {
  const cardClass = isDark ? 'glass-card' : 'glass-card-light';
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="skeleton-shimmer h-5 w-32 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${cardClass} rounded-2xl p-4`}>
            <div className="skeleton-shimmer h-5 w-10 rounded mb-2" />
            <div className="skeleton-shimmer h-6 w-20 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-3 mt-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${cardClass} rounded-2xl p-4`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="skeleton-shimmer h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="skeleton-shimmer h-4 w-28 rounded mb-1" />
                <div className="skeleton-shimmer h-3 w-20 rounded" />
              </div>
              <div className="skeleton-shimmer h-5 w-16 rounded" />
            </div>
            <div className="skeleton-shimmer h-[40px] w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TradingOverview({ isDark = true }: { isDark?: boolean }) {
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

  if (loading) return <SkeletonOverview isDark={isDark} />;

  const totalTraders = traders.length;
  const bestPnL = traders.length > 0 ? Math.max(...traders.map(t => t.profit24h)) : 0;
  const avgWinRate = traders.length > 0 ? Math.round(traders.reduce((sum, t) => sum + t.winRate, 0) / traders.length) : 0;
  const top3 = traders.slice(0, 3);

  const cardClass = isDark ? 'glass-card' : 'glass-card-light';
  const textPrimary = isDark ? 'text-white/90' : 'text-gray-900';
  const textSecondary = isDark ? 'text-white/50' : 'text-gray-500';

  const statCards = [
    {
      emoji: '👑',
      label: 'Total Traders',
      value: `Tracking ${totalTraders} leaders`,
    },
    {
      emoji: '💰',
      label: 'Best P&L 24h',
      value: `Best: ${formatProfit(bestPnL)}`,
    },
    {
      emoji: '✅',
      label: 'Avg Win Rate',
      value: `Avg win: ${avgWinRate}%`,
    },
  ];

  return (
    <div className="section-fade-in space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <h2 className={`text-lg font-semibold ${textPrimary}`}>
          👑 Top Traders 24h
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`${textSecondary} hover:text-white/70 transition-colors`}
              aria-label="Info about top traders"
            >
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-[13px]">Top performing traders ranked by 24h profit</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className={`${cardClass} rounded-2xl p-3 sm:p-4 card-2d-enter`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="text-lg mb-1">{stat.emoji}</div>
            <p className={`text-[11px] sm:text-xs font-medium ${textSecondary} mb-1`}>
              {stat.label}
            </p>
            <p className={`text-[13px] sm:text-sm font-semibold ${textPrimary}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Top 3 Traders Mini-Cards */}
      <div className="space-y-3 mt-4">
        {top3.map((trader) => (
          <div
            key={trader.id}
            className={`${cardClass} rounded-2xl p-4 card-2d-enter cursor-pointer transition-transform duration-200 active:scale-[0.98]`}
            style={{ animationDelay: `${(trader.rank - 1) * 100 + 200}ms` }}
          >
            <div className="flex items-center gap-3 mb-2">
              {/* Rank Badge */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  trader.rank === 1
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : trader.rank === 2
                    ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30'
                    : 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                }`}
              >
                #{trader.rank}
              </div>

              {/* Avatar + Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl leading-none">{trader.avatarEmoji}</span>
                  <span className={`text-[15px] font-semibold ${textPrimary} truncate`}>
                    {trader.displayName}
                  </span>
                  <span className="text-sm">{trader.badge}</span>
                </div>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  @{trader.username}
                </p>
              </div>

              {/* Profit 24h */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5 justify-end">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[15px] font-semibold text-emerald-400">
                    {formatProfit(trader.profit24h)}
                  </span>
                </div>
                <p className={`text-[11px] ${textSecondary}`}>
                  {trader.profitPercent.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-phantom-primary-bright" />
                <span className={`text-xs ${textSecondary}`}>
                  {trader.winRate}% win
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-phantom-primary-bright" />
                <span className={`text-xs ${textSecondary}`}>
                  {trader.trades24h} trades
                </span>
              </div>
              {trader.streak > 0 && (
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className={`text-xs ${textSecondary}`}>
                    {trader.streak} streak
                  </span>
                </div>
              )}
            </div>

            {/* Mini P&L Chart */}
            <MiniPLChart data={trader.plChart} />
          </div>
        ))}
      </div>

      {/* See All Traders Link */}
      <button
        className={`w-full text-center py-3 rounded-2xl text-[15px] font-medium ${cardClass} ${textPrimary} hover:brightness-110 transition-all duration-200 active:scale-[0.98]`}
      >
        See all traders →
      </button>
    </div>
  );
}