'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, Target, Flame, Info, Zap } from 'lucide-react';
import GhostIcon from '@/components/phantom/GhostIcon';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
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

/* ── Avatar color ring per rank ── */
function getAvatarRing(rank: number, isDark: boolean): string {
  switch (rank) {
    case 1:
      return isDark
        ? 'bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500'
        : 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600';
    case 2:
      return isDark
        ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500'
        : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
    case 3:
      return isDark
        ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700'
        : 'bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800';
    default:
      return isDark
        ? 'bg-gradient-to-br from-phantom-primary/60 to-phantom-secondary-a/60'
        : 'bg-gradient-to-br from-teal-300 to-cyan-400';
  }
}

function formatProfit(value: number): string {
  const sign = value >= 0 ? '+' : '';
  if (Math.abs(value) >= 1_000_000) return `${sign}$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${sign}$${(value / 1_000).toFixed(1)}K`;
  return `${sign}$${value.toFixed(0)}`;
}

/* ── Trending market summary ── */
interface TrendingMarket {
  question: string;
  volume: string;
  category: string;
  yesPrice: number;
}

function TrendingSummary({ markets, isDark }: { markets: TrendingMarket[]; isDark: boolean }) {
  const pillBase = isDark
    ? 'bg-white/[0.04] border-white/[0.07] text-white/70 hover:bg-white/[0.08] hover:border-white/[0.12]'
    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300';

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Zap className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
        <h3 className={`text-[15px] font-bold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
          Most Bet On This Month
        </h3>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
        {markets.map((m, i) => (
          <div
            key={i}
            className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all duration-200 ${pillBase}`}
          >
            {/* Tiny probability dot */}
            <div className="relative w-7 h-7 shrink-0">
              <svg viewBox="0 0 28 28" className="w-7 h-7 -rotate-90">
                <circle cx="14" cy="14" r="11" fill="none" strokeWidth="3"
                  className={isDark ? 'stroke-white/[0.06]' : 'stroke-gray-200'} />
                <circle cx="14" cy="14" r="11" fill="none" strokeWidth="3"
                  stroke={m.yesPrice > 60 ? '#34d399' : m.yesPrice > 35 ? '#22d3ee' : '#fb923c'}
                  strokeDasharray={`${2 * Math.PI * 11}`}
                  strokeDashoffset={`${2 * Math.PI * 11 * (1 - m.yesPrice / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/70">
                {m.yesPrice.toFixed(0)}
              </span>
            </div>

            <div className="min-w-0 flex flex-col gap-0.5">
              <span className={`text-[12px] font-semibold leading-tight line-clamp-1 max-w-[140px] ${
                isDark ? 'text-white/80' : 'text-gray-800'
              }`}>
                {m.question}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                  {m.volume}
                </span>
                <span className={`text-[10px] px-1.5 py-px rounded-full font-medium ${
                  isDark ? 'bg-white/[0.05] text-white/40' : 'bg-gray-100 text-gray-500'
                }`}>
                  {m.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function SkeletonList({ isDark }: { isDark: boolean }) {
  const cardClass = isDark ? 'glass-card' : 'glass-card-light';
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`${cardClass} rounded-2xl px-4 py-3.5`}>
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="skeleton-shimmer h-4 w-28 rounded mb-1.5" />
              <div className="skeleton-shimmer h-3 w-36 rounded" />
            </div>
            <div className="skeleton-shimmer h-5 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ── */
export default function TradersList({
  onTraderClick,
  isDark = true,
}: {
  onTraderClick: (traderId: string) => void;
  isDark?: boolean;
}) {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [trendingMarkets, setTrendingMarkets] = useState<TrendingMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [traderRes, polyRes] = await Promise.all([
          fetch('/api/leaderboard'),
          fetch('/api/polymarket'),
        ]);
        const traderData = await traderRes.json();
        setTraders(traderData.traders || []);

        const polyData = await polyRes.json();
        if (polyData.events?.length > 0) {
          // Take top events by total volume for "most bet on this month"
          const sorted = [...polyData.events]
            .sort((a: any, b: any) => parseFloat(b.volume || '0') - parseFloat(a.volume || '0'))
            .slice(0, 5)
            .map((e: any) => ({
              question: e.question.length > 45 ? e.question.slice(0, 42) + '...' : e.question,
              volume: formatVolume(parseFloat(e.volume || '0')),
              category: e.category || 'Trending',
              yesPrice: parseFloat(e.outcomePrices?.[0] || '0') * 100,
            }));
          setTrendingMarkets(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch traders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <SkeletonList isDark={isDark} />;

  const cardClass = isDark ? 'glass-card' : 'glass-card-light';

  return (
    <TooltipProvider delayDuration={300}>
      <div className="px-4 section-fade-in">
        {/* Header — aligned to container */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className={`text-[18px] font-bold ${isDark ? 'text-white/95' : 'text-gray-900'}`}>
            All Traders
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`transition-colors ${
                  isDark ? 'text-white/30 hover:text-white/50' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="Info about traders list"
              >
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className={`text-[13px] ${
              isDark ? 'bg-[#0F1E33] text-gray-200 border-white/10' : 'bg-white text-gray-700 border-gray-200'
            }`}>
              Top performing traders sorted by 24h profit
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Trending summary — what's being bet on most this month */}
        {trendingMarkets.length > 0 && (
          <TrendingSummary markets={trendingMarkets} isDark={isDark} />
        )}

        {/* Trader list */}
        <div className="space-y-2.5">
          {traders.map((trader, index) => (
            <button
              key={trader.id}
              onClick={() => onTraderClick(trader.id)}
              className={`${cardClass} rounded-2xl px-4 py-3.5 w-full text-left transition-transform duration-200 active:scale-[0.98] hover:brightness-105 card-2d-enter`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center gap-3">
                {/* Circular ghost avatar with gradient ring */}
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full p-[2px] ${getAvatarRing(trader.rank, isDark)}`}>
                    <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${
                      isDark ? 'bg-[#0A1628]' : 'bg-white'
                    }`}>
                      <GhostIcon
                        size={28}
                        className={trader.rank <= 3
                          ? (isDark ? 'text-phantom-primary-light' : 'text-teal-600')
                          : (isDark ? 'text-white/40' : 'text-gray-500')
                        }
                      />
                    </div>
                  </div>
                  {/* Rank badge */}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 ${
                    isDark
                      ? 'bg-[#0A1628] border-[#0A1628] text-white/60'
                      : 'bg-white border-white text-gray-600'
                  }`}>
                    {trader.rank}
                  </div>
                </div>

                {/* Info — name + inline stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[15px] font-semibold truncate ${
                      isDark ? 'text-white/90' : 'text-gray-900'
                    }`}>
                      {trader.displayName}
                    </span>
                    <span className="text-sm shrink-0">{trader.badge}</span>
                  </div>

                  {/* Inline stats in one line */}
                  <div className={`flex items-center gap-2.5 mt-1`}>
                    <span className={`text-[11px] flex items-center gap-1 ${
                      isDark ? 'text-white/35' : 'text-gray-500'
                    }`}>
                      <Target className="w-3 h-3 text-phantom-primary-bright" />
                      {trader.winRate}%
                    </span>
                    <span className={`text-[11px] flex items-center gap-1 ${
                      isDark ? 'text-white/35' : 'text-gray-500'
                    }`}>
                      <TrendingUp className="w-3 h-3 text-phantom-primary-bright" />
                      {trader.trades24h}
                    </span>
                    <span className={`text-[11px] flex items-center gap-1 ${
                      isDark ? 'text-white/35' : 'text-gray-500'
                    }`}>
                      <Flame className="w-3 h-3 text-orange-400" />
                      {trader.streak}
                    </span>
                  </div>
                </div>

                {/* Profit */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-0.5 justify-end">
                    {trader.profit24h >= 0 && (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className={`text-[15px] font-bold ${
                      trader.profit24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {formatProfit(trader.profit24h)}
                    </span>
                  </div>
                  <span className={`text-[11px] ${
                    isDark ? 'text-white/30' : 'text-gray-400'
                  }`}>
                    {trader.profitPercent >= 0 ? '+' : ''}{trader.profitPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
  return `$${vol.toFixed(0)}`;
}