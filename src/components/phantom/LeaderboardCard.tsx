'use client';

import type { TraderData } from '@/lib/mock-data';

interface LeaderboardCardProps {
  trader: TraderData;
}

const badgeEmoji: Record<string, string> = {
  whale: '🐋',
  shark: '🦈',
  dolphin: '🐬',
};

const rankColors: Record<number, { ring: string; text: string; bg: string }> = {
  1: { ring: 'from-yellow-400 to-amber-500', text: 'text-yellow-400', bg: 'bg-yellow-400/15' },
  2: { ring: 'from-gray-300 to-gray-400', text: 'text-gray-300', bg: 'bg-gray-300/10' },
  3: { ring: 'from-amber-600 to-orange-500', text: 'text-amber-500', bg: 'bg-amber-500/10' },
};

function formatVolume(vol: number): string {
  if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
  if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
  return `$${vol.toFixed(0)}`;
}

function formatPnl(pnl: number): string {
  const prefix = pnl >= 0 ? '+$' : '-$';
  const abs = Math.abs(pnl);
  if (abs >= 1000) return `${prefix}${(abs / 1000).toFixed(1)}K`;
  return `${prefix}${abs.toFixed(0)}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function LeaderboardCard({ trader }: LeaderboardCardProps) {
  const rankStyle = rankColors[trader.rank] || { ring: '', text: 'text-white/50', bg: 'bg-white/5' };
  const isTop3 = trader.rank <= 3;
  const badge = trader.badge ? badgeEmoji[trader.badge] : null;
  const isProfit = trader.pnl >= 0;

  return (
    <div className="glass rounded-2xl p-4 w-[280px] flex-shrink-0 press-effect cursor-default">
      {/* Top row: rank + avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        {/* Rank */}
        <div className="flex-shrink-0">
          {isTop3 ? (
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${rankStyle.ring} flex items-center justify-center`}
            >
              <span className="text-[13px] font-extrabold text-phantom-dark drop-shadow-sm">
                {trader.rank}
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <span className="text-[13px] font-bold text-white/50">{trader.rank}</span>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-phantom-primary/40 to-phantom-secondary-a/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {trader.avatarUrl ? (
            <img
              src={trader.avatarUrl}
              alt={trader.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[12px] font-bold text-white/80">
              {getInitials(trader.displayName)}
            </span>
          )}
        </div>

        {/* Name + username */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-bold text-white/90 truncate">
              {trader.displayName}
            </p>
            {badge && <span className="text-[12px] flex-shrink-0">{badge}</span>}
          </div>
          <p className="text-[11px] text-white/35 truncate">@{trader.username}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-[9px] font-medium uppercase tracking-wider text-white/30 mb-0.5">Volume</p>
          <p className="text-[12px] font-bold text-white/70">{formatVolume(trader.volume24h)}</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-[9px] font-medium uppercase tracking-wider text-white/30 mb-0.5">Trades</p>
          <p className="text-[12px] font-bold text-white/70">{trader.trades24h}</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-[9px] font-medium uppercase tracking-wider text-white/30 mb-0.5">Win Rate</p>
          <p className="text-[12px] font-bold text-phantom-secondary-b">{trader.winRate}%</p>
        </div>
      </div>

      {/* PNL */}
      <div className={`flex items-center justify-between px-2.5 py-2 rounded-xl ${isProfit ? 'bg-emerald-500/8' : 'bg-red-500/8'}`}>
        <span className="text-[10px] font-semibold text-white/40">PnL 24h</span>
        <span className={`text-[14px] font-extrabold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatPnl(trader.pnl)}
        </span>
      </div>
    </div>
  );
}