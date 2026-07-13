'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, TrendingUp, Target, Flame, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function FullPLChart({ data }: { data: PLPoint[] }) {
  const [animated, setAnimated] = useState(false);
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!data || data.length < 2) return null;

  const width = 320;
  const height = 160;
  const padLeft = 44;
  const padRight = 12;
  const padTop = 8;
  const padBottom = 24;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const values = data.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((p, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW;
    const y = padTop + chartH - ((p.value - min) / range) * chartH;
    return { x, y };
  });

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');

  // Calculate approximate total length for animation
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }
  totalLength = Math.max(totalLength, 1);

  // Y-axis labels
  const ySteps = 4;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = min + (range / ySteps) * i;
    return { label: formatProfit(val), y: padTop + chartH - (i / ySteps) * chartH };
  });

  // X-axis labels — pick every ~5 hours
  const xLabelIndices: number[] = [];
  const step = Math.max(1, Math.floor(data.length / 5));
  for (let i = 0; i < data.length; i += step) {
    xLabelIndices.push(i);
  }
  if (xLabelIndices[xLabelIndices.length - 1] !== data.length - 1) {
    xLabelIndices.push(data.length - 1);
  }

  // Gradient fill path
  const fillPath = `M ${points[0].x},${padTop + chartH} ` +
    points.map(p => `L ${p.x},${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x},${padTop + chartH} Z`;

  return (
    <svg
      ref={chartRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height: `${height}px` }}
    >
      <defs>
        <linearGradient id="plGradientFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#39AECF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#39AECF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {yLabels.map((item, i) => (
        <line
          key={`grid-${i}`}
          x1={padLeft}
          y1={item.y}
          x2={width - padRight}
          y2={item.y}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}

      {/* Y-axis labels */}
      {yLabels.map((item, i) => (
        <text
          key={`yl-${i}`}
          x={padLeft - 6}
          y={item.y + 3}
          textAnchor="end"
          fill="rgba(255,255,255,0.35)"
          fontSize="9"
          fontFamily="Manrope, sans-serif"
        >
          {item.label}
        </text>
      ))}

      {/* X-axis labels */}
      {xLabelIndices.map((idx) => {
        const p = points[idx];
        return (
          <text
            key={`xl-${idx}`}
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize="9"
            fontFamily="Manrope, sans-serif"
          >
            {formatTime(data[idx].time)}
          </text>
        );
      })}

      {/* Gradient fill under the line */}
      <path
        d={fillPath}
        fill="url(#plGradientFill)"
        opacity={animated ? 1 : 0}
        style={{ transition: 'opacity 0.6s ease' }}
      />

      {/* Line */}
      <polyline
        points={polylineStr}
        fill="none"
        stroke="#39AECF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
        strokeDashoffset={animated ? 0 : totalLength}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
      />
    </svg>
  );
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}) {
  return (
    <div className="bg-white/[0.04] rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span className="text-[11px] text-white/50 font-medium">{label}</span>
      </div>
      <p className="text-[15px] font-bold text-white/90 leading-tight">{value}</p>
      {subtext && (
        <p className="text-[11px] text-white/40 mt-0.5">{subtext}</p>
      )}
    </div>
  );
}

export default function TraderDetailModal({
  traderId,
  isOpen,
  onClose,
  isDark = true,
}: {
  traderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}) {
  const [trader, setTrader] = useState<Trader | null>(null);
  const [loading, setLoading] = useState(false);
  const tradesEndRef = useRef<HTMLDivElement>(null);

  // Fetch trader data
  useEffect(() => {
    if (!isOpen || !traderId) {
      setTrader(null);
      return;
    }
    let cancelled = false;
    async function fetchTrader() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?traderId=${encodeURIComponent(traderId)}`);
        const data = await res.json();
        if (!cancelled && data.trader) {
          setTrader(data.trader);
        }
      } catch (err) {
        console.error('Failed to fetch trader:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTrader();
    return () => { cancelled = true; };
  }, [isOpen, traderId]);

  // Escape key to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Scroll trades to top when trader changes
  useEffect(() => {
    if (tradesEndRef.current) {
      tradesEndRef.current.parentElement?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [traderId]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm max-h-[85vh] rounded-3xl overflow-hidden z-10 mx-2 mb-2 sm:mb-0"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isDark
                ? '0 1px 0 rgba(255,255,255,0.05) inset, 0 0 0 0.5px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.5)'
                : '0 1px 0 rgba(255,255,255,0.8) inset, 0 0 0 0.5px rgba(0,0,0,0.04), 0 24px 80px rgba(0,0,0,0.15)',
            }}
          >
            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[85vh] scrollbar-hide">
              {loading ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="skeleton-shimmer h-12 w-12 rounded-full shrink-0" />
                    <div className="flex-1">
                      <div className="skeleton-shimmer h-5 w-32 rounded mb-1.5" />
                      <div className="skeleton-shimmer h-3 w-20 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/[0.04] rounded-xl p-3">
                        <div className="skeleton-shimmer h-3 w-14 rounded mb-2" />
                        <div className="skeleton-shimmer h-5 w-20 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="skeleton-shimmer h-[160px] w-full rounded-xl" />
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="skeleton-shimmer h-16 w-full rounded-xl" />
                    ))}
                  </div>
                </div>
              ) : trader ? (
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none">{trader.avatarEmoji}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[15px] font-bold text-white/90">
                            {trader.displayName}
                          </span>
                          <span className="text-base">{trader.badge}</span>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">@{trader.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  {/* Stats Grid 2x2 */}
                  <div className="grid grid-cols-2 gap-3 px-5 mb-4">
                    <StatCard
                      label="P&L 24h"
                      value={formatProfit(trader.profit24h)}
                      subtext={`${trader.profitPercent >= 0 ? '+' : ''}${trader.profitPercent.toFixed(1)}%`}
                      icon={TrendingUp}
                      iconColor={trader.profit24h >= 0 ? 'text-emerald-400' : 'text-red-400'}
                    />
                    <StatCard
                      label="Win Rate"
                      value={`${trader.winRate}%`}
                      subtext={`of ${trader.trades24h} trades`}
                      icon={Target}
                      iconColor="text-phantom-primary-bright"
                    />
                    <StatCard
                      label="Trades 24h"
                      value={trader.trades24h.toString()}
                      subtext={`Vol: ${trader.totalVolume}`}
                      icon={Clock}
                      iconColor="text-phantom-secondary-b-bright"
                    />
                    <StatCard
                      label="Streak"
                      value={`${trader.streak} wins`}
                      icon={Flame}
                      iconColor="text-orange-400"
                    />
                  </div>

                  {/* Full P&L Chart */}
                  <div className="px-5 mb-4">
                    <p className="text-xs text-white/50 font-medium mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      P&L Over 24h
                    </p>
                    <div className="bg-white/[0.03] rounded-xl p-2">
                      <FullPLChart data={trader.plChart} />
                    </div>
                  </div>

                  {/* Recent Trades */}
                  <div className="px-5 pb-4">
                    <p className="text-xs text-white/50 font-medium mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Recent Trades
                    </p>
                    <div className="max-h-[200px] overflow-y-auto scrollbar-hide space-y-2">
                      {trader.recentTrades
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((trade) => {
                          const isBuy = trade.action === 'buy';
                          const isProfit = trade.profit >= 0;
                          return (
                            <div
                              key={trade.id}
                              className="bg-white/[0.03] rounded-xl p-3"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <p className="text-[13px] text-white/80 font-medium leading-tight line-clamp-1 flex-1">
                                  {trade.marketQuestion}
                                </p>
                                <span
                                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isBuy
                                      ? 'bg-emerald-500/15 text-emerald-400'
                                      : 'bg-red-500/15 text-red-400'
                                  }`}
                                >
                                  {trade.action === 'buy' ? 'Buy' : 'Sell'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-white/40">
                                    @${trade.price.toFixed(2)} × {trade.quantity}
                                  </span>
                                  <span className="text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded-md">
                                    {trade.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[13px] font-semibold ${
                                      isProfit ? 'text-emerald-400' : 'text-red-400'
                                    }`}
                                  >
                                    {formatProfit(trade.profit)}
                                  </span>
                                  <span className="text-[10px] text-white/30">
                                    {formatRelativeTime(trade.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      <div ref={tradesEndRef} />
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="px-5 pb-5">
                    <a
                      href="https://polymarket.com/?ref=phantom"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[15px] font-semibold transition-all duration-200 active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #057D9F 0%, #009999 50%, #33CCCC 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 24px rgba(5, 125, 159, 0.3)',
                      }}
                    >
                      Trade on Polymarket
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}