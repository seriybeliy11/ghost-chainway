'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Copy, Check, Zap, Crown, Loader2,
  ExternalLink, Wallet, RefreshCw, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import GhostIcon from '@/components/phantom/GhostIcon';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  isAuthorized: boolean;
  referrerCode?: string;
}

interface DbProfile {
  id: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  referrerCode: string | null;
  balance: number;
  totalEarned: number;
  cashoutAddress: string | null;
  planType: string;
  generationsLeft: number;
  totalPurchased: number;
  totalUsed: number;
  purchaseCount: number;
}

interface ProfileViewProps {
  user: TelegramUser | null;
}

const PLANS = [
  { id: 'starter', generations: 20, price: 2, label: '20 Gens' },
  { id: 'pro', generations: 50, price: 4, label: '50 Gens' },
  { id: 'whale', generations: 150, price: 10, label: '150 Gens' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ProfileView({ user }: ProfileViewProps) {
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [showPurchases, setShowPurchases] = useState(false);
  const [cashoutAddr, setCashoutAddr] = useState('');
  const [savingCashout, setSavingCashout] = useState(false);
  const [purchases, setPurchases] = useState<{ amount: string; createdAt: string; generationsAdded: number; status: string }[]>([]);
  const [isMiniApp] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!((window as unknown as Record<string, unknown>).Telegram);
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthRetrying, setIsAuthRetrying] = useState(false);

  const retryMiniAppAuth = useCallback(async () => {
    setIsAuthRetrying(true);
    setAuthError(null);
    try {
      const tg = (window as unknown as { Telegram?: { WebApp: { initData: string } } }).Telegram;
      if (!tg?.WebApp?.initData) {
        setAuthError('No Telegram data available. Reopen the app from the bot.');
        return;
      }
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.WebApp.initData }),
      });
      const data = await res.json();
      if (data.user) {
        // Trigger page reload to pick up the session cookie
        window.location.reload();
      } else {
        setAuthError(data.error || 'Auth failed');
      }
    } catch {
      setAuthError('Network error');
    } finally {
      setIsAuthRetrying(false);
    }
  }, []);

  const displayName = user
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : null;
  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const isAuthorized = user?.isAuthorized ?? false;
  const isPremium = profile?.planType === 'premium';

  // Fetch profile data
  useEffect(() => {
    if (!isAuthorized || !user?.id) return;

    fetch(`/api/user/profile?telegramId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setProfile(data.user);
          setCashoutAddr(data.user.cashoutAddress || '');
        }
      })
      .catch(() => {});

    // Fetch purchase history
    fetch(`/api/referrals/stats?telegramId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.stats) {
          // We'll use earnings history as proxy for now
        }
      })
      .catch(() => {});
  }, [isAuthorized, user?.id]);

  const handleCopy = () => {
    if (!profile?.referrerCode) return;
    const link = `https://ghost-chainway.vercel.app/?ref=${profile.referrerCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePurchase = async (planId: string) => {
    if (!user || isPurchasing) return;
    setIsPurchasing(planId);
    setPurchaseError(null);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.id, plan: planId }),
      });
      const data = await res.json();
      if (data.payUrl) {
        window.open(data.payUrl, '_blank');
      } else {
        setPurchaseError(data.error || 'Payment error');
      }
    } catch {
      setPurchaseError('Network error');
    } finally {
      setIsPurchasing(null);
    }
  };

  const handleSaveCashout = async () => {
    if (!user || !cashoutAddr) return;
    setSavingCashout(true);
    try {
      await fetch('/api/user/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.id, cashoutAddress: cashoutAddr }),
      });
      setProfile(p => p ? { ...p, cashoutAddress: cashoutAddr } : p);
    } catch {}
    setSavingCashout(false);
  };

  const refreshProfile = () => {
    if (!user?.id) return;
    fetch(`/api/user/profile?telegramId=${user.id}`)
      .then(r => r.json())
      .then(data => { if (data.user) setProfile(data.user); })
      .catch(() => {});
  };

  const cardBase = 'glass-card';
  const textPrimary = 'text-white/90';
  const textSecondary = 'text-white/40';
  const textMuted = 'text-white/25';

  return (
    <div className="px-4 pb-6 pt-2">
      {isAuthorized && user ? (
        <>
          {/* ── User card ── */}
          <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible"
            className={`${cardBase} rounded-3xl p-6`}>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-[68px] h-[68px] rounded-full p-[2px] bg-gradient-to-br from-phantom-primary via-phantom-secondary-a to-phantom-secondary-b">
                  <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-phantom-dark">
                    {user.photo_url ? (
                      <img src={user.photo_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <GhostIcon size={32} className="text-phantom-primary-light" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 bg-emerald-400 border-phantom-dark" />
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[17px] font-bold leading-tight truncate ${textPrimary}`}>{displayName}</span>
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                </div>
                {user.username && <span className={`text-[14px] leading-tight ${textSecondary}`}>@{user.username}</span>}
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full w-fit bg-emerald-500/15 text-emerald-400">Authorized via Telegram</span>
              </div>
            </div>
          </motion.div>

          {/* ── Subscription & Balance card ── */}
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible"
            className={`${cardBase} rounded-3xl p-5 mt-4`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className={`w-4.5 h-4.5 ${isPremium ? 'text-amber-400' : 'text-white/40'}`} />
                <span className={`text-[15px] font-bold ${textPrimary}`}>Subscription</span>
                {isPremium && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">ACTIVE</span>
                )}
              </div>
              <button onClick={refreshProfile} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {profile && (
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] ${textSecondary}`}>Plan</span>
                  <span className={`text-[13px] font-semibold ${isPremium ? 'text-amber-400' : textPrimary}`}>
                    {isPremium ? 'Premium' : 'Free'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] ${textSecondary}`}>Generations</span>
                  <span className={`text-[13px] font-semibold ${textPrimary}`}>
                    {profile.generationsLeft} left · {profile.totalUsed} used · {profile.totalPurchased} bought
                  </span>
                </div>

                {/* Generations progress bar */}
                {profile.totalPurchased > 0 && (
                  <div className="mt-1">
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (profile.totalUsed / profile.totalPurchased) * 100)}%`,
                          background: 'linear-gradient(90deg, #057D9F, #009999)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {profile.totalEarned > 0 && (
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] ${textSecondary}`}>Total Earned</span>
                    <span className="text-[13px] font-bold text-emerald-400">
                      ${profile.totalEarned.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Purchase plans */}
            <div className="space-y-2.5">
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => handlePurchase(plan.id)}
                  disabled={isPurchasing === plan.id}
                  className="w-full rounded-2xl py-3 text-white font-semibold text-[14px] transition-all duration-200 active:scale-[0.97] hover:brightness-110 cursor-pointer flex items-center justify-between px-4 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-2.5">
                    {isPurchasing === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#057D9F]" />
                    ) : (
                      <Zap className="w-4 h-4 text-[#057D9F]" />
                    )}
                    <span>{plan.label}</span>
                  </div>
                  <span className="text-[#057D9F] font-bold">${plan.price} USDT</span>
                </button>
              ))}
            </div>

            <AnimatePresence>
              {purchaseError && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-[12px] text-red-400 text-center mt-2">{purchaseError}</motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Cashout Address ── */}
          <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible"
            className={`${cardBase} rounded-3xl p-5 mt-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4.5 h-4.5 text-[#057D9F]" />
              <span className={`text-[15px] font-bold ${textPrimary}`}>USDT Cashout Address</span>
            </div>

            <p className={`text-[12px] ${textMuted} mb-3`}>
              Set your TRC20/ERC20 address to receive auto-cashout (5% of referral purchases)
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={cashoutAddr}
                onChange={e => setCashoutAddr(e.target.value)}
                placeholder="TXxx... or 0x..."
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#057D9F]/40 transition-colors"
              />
              <button
                onClick={handleSaveCashout}
                disabled={savingCashout}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#057D9F]/20 text-[#057D9F] text-[13px] font-semibold hover:bg-[#057D9F]/30 transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {savingCashout ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>

            {profile?.cashoutAddress && (
              <p className={`text-[11px] mt-2 ${textMuted}`}>
                ✓ Active: <span className="font-mono text-white/30">{profile.cashoutAddress.slice(0, 8)}...{profile.cashoutAddress.slice(-6)}</span>
              </p>
            )}
          </motion.div>

          {/* ── Trade on Polymarket ── */}
          <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible"
            className="mt-4">
            <a
              href="https://polymarket.com/?ref=maximzhidkov"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-3xl p-4 bg-gradient-to-r from-[#057D9F]/10 to-[#009999]/5 border border-[#057D9F]/15 hover:border-[#057D9F]/30 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#057D9F]/20 flex items-center justify-center shrink-0 group-hover:bg-[#057D9F]/30 transition-colors">
                <ExternalLink size={20} className="text-[#057D9F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-white">Trade on Polymarket</p>
                <p className="text-[12px] text-white/40">Prediction markets · Real money</p>
              </div>
              <ExternalLink size={14} className="text-white/25 group-hover:text-[#057D9F] transition-colors shrink-0" />
            </a>
          </motion.div>
        </>
      ) : isMiniApp ? (
        /* ── Mini App: auto-auth via initData ── */
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible"
          className="flex flex-col items-center pt-10 px-4">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 bg-white/[0.05] border border-white/[0.08]"
          >
            <GhostIcon size={36} className="text-[#057D9F]/50" />
          </motion.div>
          <h3 className={`text-[18px] font-bold mb-2 ${textPrimary}`}>Connecting...</h3>
          <p className={`text-[14px] text-center max-w-[260px] mb-4 leading-relaxed ${textSecondary}`}>
            Authorizing via Telegram Mini App
          </p>
          {authError ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-red-400/80">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[12px]">{authError}</span>
              </div>
              <button
                onClick={retryMiniAppAuth}
                disabled={isAuthRetrying}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold text-[14px] transition-all active:scale-[0.97] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #2AABEE, #229ED9)' }}
              >
                {isAuthRetrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Retry
              </button>
            </div>
          ) : (
            <Loader2 className="w-5 h-5 animate-spin text-[#057D9F]/60" />
          )}
          <p className={`text-[12px] mt-4 ${textMuted}`}>Opened via Telegram Bot</p>
        </motion.div>
      ) : (
        /* ── Web: show Telegram Login Widget ── */
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible"
          className="flex flex-col items-center pt-10 px-4">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 bg-white/[0.05] border border-white/[0.08]"
          >
            <GhostIcon size={36} className="text-[#057D9F]/50" />
          </motion.div>
          <h3 className={`text-[18px] font-bold mb-2 ${textPrimary}`}>Join the Phantoms</h3>
          <p className={`text-[14px] text-center max-w-[260px] mb-6 leading-relaxed ${textSecondary}`}>
            Sign in with Telegram to access predictions, referral program, and premium features
          </p>

          {/* Telegram Login Widget */}
          <div className="flex items-center justify-center">
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/auth/bot-info');
                  const data = await res.json();
                  if (data.botId) {
                    const origin = encodeURIComponent(window.location.origin);
                    const currentParams = new URLSearchParams(window.location.search);
                    const refCode = currentParams.get('ref');
                    let returnTo = '/api/auth/telegram-widget';
                    if (refCode) returnTo += `?ref=${encodeURIComponent(refCode)}`;
                    window.location.href = `https://oauth.telegram.org/auth?bot_id=${data.botId}&origin=${origin}&return_to=${encodeURIComponent(returnTo)}`;
                  }
                } catch {
                  // fallback
                }
              }}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-semibold text-[15px] transition-all duration-200 active:scale-[0.97] hover:brightness-110 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #2AABEE, #229ED9)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.248-.024c-.106.024-1.793 1.14-5.062 3.345-.479.33-.913.49-1.302.481-.428-.009-1.252-.242-1.865-.441-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.12.098.153.229.168.332.015.104.035.34.02.525z"/>
              </svg>
              Sign in with Telegram
            </button>
          </div>
          <p className={`text-[12px] mt-4 ${textMuted}`}>Login via Telegram to continue</p>
        </motion.div>
      )}
    </div>
  );
}