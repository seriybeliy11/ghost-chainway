'use client';

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Target, Flame, Info, ExternalLink, ArrowUpRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Trader {
  rank: number;
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
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LeaderboardSectionProps {}

const REFERRAL_LINK = 'https://polymarket.com/?ref=maximzhidkov';

export default function LeaderboardSection() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.traders) setTraders(data.traders);
      } catch {
        // Keep empty
      } finally {
        setIsLoading(false);
      }
    };
    fetchTraders();
  }, []);

  const formatProfit = (val: number) => {
    if (val >= 1000) return `+$${(val / 1000).toFixed(1)}K`;
    return `+$${val.toFixed(0)}`;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-amber-500/20 border-amber-500/30 text-amber-300';
    if (rank === 2) return 'bg-gray-400/15 border-gray-400/20 text-gray-300';
    if (rank === 3) return 'bg-orange-500/15 border-orange-500/20 text-orange-300';
    return 'bg-white/5 border-white/[0.08] text-white/40';
  };

  return (
    <section className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Top Traders 24h
          </h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 text-white/30 hover:text-white/50">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[240px] text-xs bg-gray-800 text-gray-200 border-gray-700">
              Best performing traders in the last 24 hours based on profit, win rate, and trade volume.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Trader cards */}
      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton-shimmer bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 rounded skeleton-shimmer bg-white/5" />
                  <div className="h-3 w-20 rounded skeleton-shimmer bg-white/5" />
                </div>
                <div className="h-6 w-16 rounded-full skeleton-shimmer bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {traders.map((trader) => (
            <div
              key={trader.rank}
              className="rounded-2xl p-4 transition-all duration-200 active:scale-[0.99] cursor-default glass-card hover:border-white/[0.15]"
              style={{ animationDelay: `${trader.rank * 80}ms` }}
            >
              <div className="flex items-center gap-3">
                {/* Rank badge */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold border ${getRankStyle(trader.rank)}`}>
                  #{trader.rank}
                </div>

                {/* Avatar + Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{trader.avatarEmoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate text-white">
                        {trader.displayName}
                        <span className="ml-1">{trader.badge}</span>
                      </p>
                      <p className="text-[11px] font-medium truncate text-white/35">
                        @{trader.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profit */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-sm font-extrabold text-emerald-400">
                      {formatProfit(trader.profit24h)}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-white/30">
                    +{trader.profitPercent}%
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dashed" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-white/25" />
                  <span className="text-[11px] font-semibold text-white/50">
                    {trader.winRate}%
                  </span>
                  <span className="text-[9px] text-white/20">win</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-white/25" />
                  <span className="text-[11px] font-semibold text-white/50">
                    {trader.trades24h}
                  </span>
                  <span className="text-[9px] text-white/20">trades</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-white/25" />
                  <span className="text-[11px] font-semibold text-white/50">
                    {trader.streak} streak
                  </span>
                </div>
                <div className="flex-1" />
                <span className="text-[10px] font-medium text-white/25">
                  Vol: {trader.totalVolume}
                </span>
              </div>
            </div>
          ))}

          {/* CTA */}
          <a
            href={REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white/80"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Start Trading on Polymarket
          </a>
        </div>
      )}
    </section>
  );
}