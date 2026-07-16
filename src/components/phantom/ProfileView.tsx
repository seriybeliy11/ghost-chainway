'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, Zap, Crown, Loader2,
  ExternalLink, Wallet, RefreshCw, LogOut, Mail,
} from 'lucide-react';
import GhostIcon from '@/components/phantom/GhostIcon';
import { UserContext } from '@/lib/user-context';

interface AppUser {
  id: number;
  email?: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  isAuthorized: boolean;
  referrerCode?: string;
  planType?: string;
  generationsLeft?: number;
  totalPurchased?: number;
  totalUsed?: number;
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
  user: AppUser | null;
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
  const { setUser: setContextUser, refreshUser } = useContext(UserContext);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [cashoutAddr, setCashoutAddr] = useState('');
  const [savingCashout, setSavingCashout] = useState(false);

  // Email login state
  const [emailInput, setEmailInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const isAuthorized = user?.isAuthorized ?? false;
  const isPremium = profile?.planType === 'premium';
  const hasGens = (profile?.generationsLeft ?? user?.generationsLeft ?? 0) > 0;
  const displayName = user?.email
    ? user.email.split('@')[0]
    : user
      ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
      : null;

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
  }, [isAuthorized, user?.id]);

  const handleEmailLogin = async () => {
    if (!emailInput.trim()) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const refCode = sessionStorage.getItem('phantom_ref');
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), ref: refCode || undefined }),
      });
      const data = await res.json();
      if (data.user) {
        const appUser: AppUser = {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.firstName,
          isAuthorized: true,
          referrerCode: data.user.referrerCode,
          planType: data.subscription?.planType,
          generationsLeft: data.subscription?.generationsLeft,
        };
        setContextUser(appUser);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch {
      setLoginError('Network error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setContextUser(null);
    setProfile(null);
  };

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
    refreshUser();
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
                    <Mail className="w-7 h-7 text-phantom-primary-light" />
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 bg-emerald-400 border-phantom-dark" />
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className={`text-[17px] font-bold leading-tight truncate ${textPrimary}`}>
                  {displayName}
                </span>
                {user.email && (
                  <span className={`text-[13px] leading-tight truncate ${textSecondary}`}>{user.email}</span>
                )}
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full w-fit bg-emerald-500/15 text-emerald-400">Active</span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-white/[0.06] text-white/30 hover:text-red-400 transition-colors cursor-pointer" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* ── Subscription card ── */}
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible"
            className={`${cardBase} rounded-3xl p-5 mt-4`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className={`w-4.5 h-4.5 ${hasGens ? 'text-amber-400' : 'text-white/40'}`} />
                <span className={`text-[15px] font-bold ${textPrimary}`}>Phantom Vision</span>
                {hasGens && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">UNLOCKED</span>
                )}
              </div>
              <button onClick={refreshProfile} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {profile && (
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] ${textSecondary}`}>Generations</span>
                  <span className={`text-[13px] font-semibold ${textPrimary}`}>
                    {profile.generationsLeft} left · {profile.totalUsed} used · {profile.totalPurchased} bought
                  </span>
                </div>

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
              </div>
            )}

            {/* Purchase plans */}
            {!hasGens && (
              <p className={`text-[12px] mb-3 ${textMuted}`}>Purchase generations to unlock Phantom Vision AI analysis</p>
            )}
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
          </motion.div>

          {/* ── Referral ── */}
          {profile?.referrerCode && (
            <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible"
              className={`${cardBase} rounded-3xl p-5 mt-4`}>
              <div className="flex items-center gap-2 mb-3">
                <Copy className="w-4 h-4 text-[#057D9F]" />
                <span className={`text-[15px] font-bold ${textPrimary}`}>Referral Link</span>
              </div>
              <div className="flex gap-2">
                <input readOnly value={`https://ghost-chainway.vercel.app/?ref=${profile.referrerCode}`}
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-white/60 outline-none" />
                <button onClick={handleCopy}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-[#057D9F]/20 text-[#057D9F] text-[13px] font-semibold hover:bg-[#057D9F]/30 transition-colors active:scale-95 cursor-pointer">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Trade on Polymarket ── */}
          <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="mt-4">
            <a
              href="https://polymarket.com/?ref=maximzhidkov"
              target="_blank" rel="noopener noreferrer"
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
      ) : (
        /* ── Not authorized — email login ── */
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
            Enter your email to access Phantom Vision AI predictions and referral program
          </p>

          <div className="w-full max-w-[300px] space-y-3">
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
              placeholder="your@email.com"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[#057D9F]/40 transition-colors"
            />
            <button
              onClick={handleEmailLogin}
              disabled={isLoggingIn || !emailInput.trim()}
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-[15px] transition-all duration-200 active:scale-[0.97] hover:brightness-110 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #057D9F, #03436A)' }}
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Continue with Email
            </button>
          </div>

          <AnimatePresence>
            {loginError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[12px] text-red-400 text-center mt-3">{loginError}</motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}