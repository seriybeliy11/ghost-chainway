'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, Users, TrendingUp, Zap, ExternalLink, DollarSign,
  Clock, UserCheck, ChevronDown, ChevronUp,
} from 'lucide-react';
import GhostIcon from '@/components/phantom/GhostIcon';

interface TelegramUser {
  id: number;
  email?: string;
  first_name: string;
  isAuthorized: boolean;
  referrerCode?: string;
}

interface ReferralStats {
  referralCount: number;
  activeReferralCount: number;
  totalEarned: number;
  totalCashedOut: number;
  pendingBalance: number;
}

interface Referral {
  id: number;
  firstName: string;
  username: string | null;
  photoUrl: string | null;
  joinedAt: string;
  totalSpent: number;
  purchaseCount: number;
}

interface EarningRecord {
  amount: number;
  cashedOut: boolean;
  date: string;
  referredName: string;
  referredUsername: string | null;
}

interface PhantomsViewProps {
  user: TelegramUser | null;
}

// ── Floating ghost particle ──────────────────────────────────
function FloatingGhost({ delay, x, y, size, duration, opacity }: {
  delay: number; x: string; y: string; size: number; duration: number; opacity: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -18, 0],
        x: [0, 6, -4, 0],
        opacity: [opacity * 0.5, opacity, opacity * 0.7],
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <GhostIcon size={size} className="text-[#057D9F]" />
    </motion.div>
  );
}

// ── Ghost trail decoration ───────────────────────────────────
function GhostTrail() {
  const ghosts = [
    { delay: 0, x: '5%', y: '15%', size: 14, duration: 4.5, opacity: 0.12 },
    { delay: 0.8, x: '85%', y: '8%', size: 18, duration: 5.2, opacity: 0.08 },
    { delay: 1.6, x: '70%', y: '45%', size: 10, duration: 3.8, opacity: 0.10 },
    { delay: 0.4, x: '15%', y: '65%', size: 16, duration: 5.5, opacity: 0.06 },
    { delay: 2.0, x: '90%', y: '75%', size: 12, duration: 4.0, opacity: 0.09 },
    { delay: 1.2, x: '40%', y: '30%', size: 8, duration: 6.0, opacity: 0.07 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {ghosts.map((g, i) => (
        <FloatingGhost key={i} {...g} />
      ))}

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full bg-[#057D9F]/5 blur-[80px]" />
    </div>
  );
}

export default function PhantomsView({ user }: PhantomsViewProps) {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [showEarnings, setShowEarnings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch referral stats
  useEffect(() => {
    if (!user?.isAuthorized || !user?.id) return;

    fetch(`/api/referrals/stats?telegramId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
        if (data.referrals) setReferrals(data.referrals);
        if (data.earningsHistory) setEarnings(data.earningsHistory);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.isAuthorized, user?.id]);

  const handleCopy = () => {
    const code = user?.referrerCode || '';
    if (!code) return;

    const link = `https://ghost-chainway.vercel.app/?ref=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const referralCode = user?.referrerCode || '';
  const referralLink = referralCode
    ? `https://ghost-chainway.vercel.app/?ref=${referralCode}`
    : '';

  // ── Not authorized ──────────────────────────────────────────
  if (!user?.isAuthorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <GhostIcon size={48} className="text-white/10" />
        </motion.div>
        <p className="mt-4 text-center text-white/40 text-sm leading-relaxed max-w-[260px]">
          Sign in with Telegram to access your referral program
        </p>
      </div>
    );
  }

  const polymarketLink = 'https://polymarket.com/?ref=maximzhidkov';

  return (
    <div className="relative min-h-[80vh] px-5 pb-12 pt-6">
      <GhostTrail />

      <div className="relative z-10">
        {/* ── 1. Header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-6"
        >
          <h1 className="text-2xl font-bold text-white tracking-tight">Phantoms</h1>
          <div className="flex items-center ml-1">
            {[0, 0.3, 0.15].map((d, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: [2.2, 1.8, 2.6][i], repeat: Infinity, ease: 'easeInOut', delay: d }}
              >
                <GhostIcon size={[18, 22, 16][i]} className={i === 1 ? 'text-[#009999]' : 'text-[#057D9F]/80'} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── 2. Invite Card ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="rounded-3xl p-5 border border-white/[0.08] bg-white/[0.04] backdrop-blur"
        >
          <p className="text-sm text-white/70 leading-relaxed">
            Invite friends and earn{' '}
            <span className="text-[#057D9F] font-semibold">10%</span>{' '}
            lifetime commission.{' '}
            <span className="text-emerald-400 font-semibold">5%</span>{' '}
            auto-cashed out instantly.
          </p>

          {/* Referral link box */}
          <div className="mt-4 rounded-2xl p-3.5 bg-white/[0.04] border border-white/[0.07] space-y-2.5">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-[#057D9F] shrink-0" />
              <span className="text-[11px] text-white/40 font-medium">YOUR REFERRAL LINK</span>
            </div>

            {referralLink ? (
              <div className="flex items-center gap-3">
                <span className="flex-1 text-[13px] text-white/80 truncate font-mono">{referralLink}</span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] transition-colors hover:bg-white/[0.1] active:scale-95 cursor-pointer"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-white/50" />}
                </button>
              </div>
            ) : (
              <div className="h-6 w-full rounded-lg skeleton-shimmer bg-white/5" />
            )}

            {referralCode && (
              <p className="text-[11px] text-white/25">
                Code: <span className="font-mono font-bold text-white/40">{referralCode}</span>
              </p>
            )}
          </div>
        </motion.div>

        {/* ── 3. Stats Row ──────────────────────────────────── */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: 'Invited', value: stats ? String(stats.referralCount) : '—', color: 'text-[#057D9F]' },
            { icon: TrendingUp, label: 'Earned', value: stats ? `$${stats.totalEarned.toFixed(2)}` : '$0.00', color: 'text-emerald-400' },
            { icon: UserCheck, label: 'Active', value: stats ? String(stats.activeReferralCount) : '—', color: 'text-[#009999]' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 + i * 0.07 }}
              className="rounded-2xl p-4 bg-white/[0.04] border border-white/[0.08] flex flex-col items-start"
            >
              <Icon size={16} className={color} />
              <span className="mt-2 text-[11px] text-white/40 leading-none">{label}</span>
              <span className={`mt-1 text-lg font-bold ${color} leading-none`}>{value}</span>
            </motion.div>
          ))}
        </div>

        {/* ── 4. Trade on Polymarket ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.38 }}
          className="mt-4"
        >
          <a
            href={polymarketLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-r from-[#057D9F]/15 to-[#009999]/10 border border-[#057D9F]/20 hover:border-[#057D9F]/40 transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#057D9F]/20 flex items-center justify-center shrink-0 group-hover:bg-[#057D9F]/30 transition-colors">
              <Zap size={20} className="text-[#057D9F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white">Trade on Polymarket</p>
              <p className="text-[12px] text-white/40">Prediction markets with real money</p>
            </div>
            <ExternalLink size={16} className="text-white/30 group-hover:text-[#057D9F] transition-colors shrink-0" />
          </a>
        </motion.div>

        {/* ── 5. Balance & Cashout info ─────────────────────── */}
        {stats && stats.pendingBalance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.44 }}
            className="mt-4 rounded-2xl p-4 bg-white/[0.04] border border-white/[0.08]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-white/50">Pending Balance</span>
              <span className="text-[14px] font-bold text-emerald-400">${stats.pendingBalance.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-white/50">Auto-Cashed Out</span>
              <span className="text-[14px] font-semibold text-white/70">${stats.totalCashedOut.toFixed(2)}</span>
            </div>
          </motion.div>
        )}

        {/* ── 6. How it works ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.46 }}
          className="mt-6"
        >
          <h2 className="text-sm font-semibold text-white/70 mb-4 tracking-wide uppercase">
            How it works
          </h2>

          <div className="flex flex-col gap-4">
            {[
              { text: 'Share your referral link with friends', icon: '👻' },
              { text: 'They sign up and purchase generations', icon: '💎' },
              { text: 'You earn 10% — 5% auto-cashed out to your wallet', icon: '💰' },
            ].map(({ text, icon }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.54 + i * 0.09 }}
                className="flex items-start gap-3"
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-[#057D9F]/15 flex items-center justify-center text-[13px]">
                  {icon}
                </span>
                <p className="text-sm text-white/70 leading-snug pt-0.5">{text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── 7. Referrals list ─────────────────────────────── */}
        {referrals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.6 }}
            className="mt-6"
          >
            <h2 className="text-sm font-semibold text-white/70 mb-3 tracking-wide uppercase">
              Your Phantoms ({referrals.length})
            </h2>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {referrals.map((ref, i) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.65 + i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 bg-white/[0.03] border border-white/[0.06]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#057D9F]/40 to-[#009999]/20 flex items-center justify-center shrink-0">
                    {ref.photoUrl ? (
                      <img src={ref.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <GhostIcon size={14} className="text-white/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white/80 truncate">
                      {ref.firstName}
                      {ref.username && <span className="text-white/40 font-normal ml-1">@{ref.username}</span>}
                    </p>
                    <p className="text-[11px] text-white/30">
                      {ref.purchaseCount > 0 ? (
                        <>
                          <span className="text-emerald-400/70">{ref.purchaseCount} purchase{ref.purchaseCount > 1 ? 's' : ''}</span>
                          {' · '}${ref.totalSpent.toFixed(2)} spent
                        </>
                      ) : (
                        <span className="text-white/20">No purchases yet</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-white/25">
                      {new Date(ref.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── 8. Earnings history ───────────────────────────── */}
        {earnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.7 }}
            className="mt-6"
          >
            <button
              onClick={() => setShowEarnings(!showEarnings)}
              className="flex items-center justify-between w-full text-sm font-semibold text-white/70 tracking-wide uppercase"
            >
              <span>Earnings History ({earnings.length})</span>
              {showEarnings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {showEarnings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {earnings.map((e, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl px-3.5 py-2.5 bg-white/[0.03]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.cashedOut ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className="text-[12px] text-white/50 truncate">
                          {e.referredName}
                          {e.referredUsername && <span className="text-white/30"> @{e.referredUsername}</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[13px] font-bold text-emerald-400">+${e.amount.toFixed(2)}</span>
                        {e.cashedOut && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">OUT</span>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Bottom spacer for nav */}
        <div className="h-8" />
      </div>
    </div>
  );
}