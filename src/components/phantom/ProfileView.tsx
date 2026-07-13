'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Send, Copy, Check, Gift, Zap, Crown, Loader2 } from 'lucide-react';
import GhostIcon from '@/components/phantom/GhostIcon';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  isAuthorized: boolean;
}

interface DbUser {
  id: string;
  telegramId: number;
  username: string | null;
  firstName: string;
  referralCode: string | null;
  balance: number;
  generationsUsed: number;
  generationsLimit: number;
  subscriptionStatus: string;
  subscriptionExpiry: string | null;
}

interface ProfileViewProps {
  user: TelegramUser | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const COMMISSION_TIERS = [
  { level: 1, percent: 30, label: 'Direct referral' },
  { level: 2, percent: 10, label: '2nd level' },
  { level: 3, percent: 5, label: '3rd level' },
];

export default function ProfileView({ user }: ProfileViewProps) {
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const displayName = user
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : null;
  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const isAuthorized = user?.isAuthorized ?? false;
  const isPremium = dbUser?.subscriptionStatus === 'premium';

  // Fetch DB user data
  useEffect(() => {
    if (!isAuthorized || !user) return;
    fetch(`/api/user?telegramId=${user.id}`)
      .then(r => r.json())
      .then(data => { if (data.user) setDbUser(data.user); })
      .catch(() => {});
  }, [isAuthorized, user]);

  const handleCopy = () => {
    if (!dbUser?.referralCode) return;
    navigator.clipboard.writeText(dbUser.referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePurchase = async () => {
    if (!user || isPurchasing) return;
    setIsPurchasing(true);
    setPurchaseError(null);
    try {
      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.id, plan: 'premium' }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        setPurchaseError(data.error || 'Payment error');
      }
    } catch {
      setPurchaseError('Network error');
    } finally {
      setIsPurchasing(false);
    }
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

          {/* ── Subscription card ── */}
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible"
            className={`${cardBase} rounded-3xl p-5 mt-4`}>
            <div className="flex items-center gap-2 mb-4">
              <Crown className={`w-4.5 h-4.5 ${isPremium ? 'text-amber-400' : 'text-white/40'}`} />
              <span className={`text-[15px] font-bold ${textPrimary}`}>Subscription</span>
              {isPremium && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">ACTIVE</span>
              )}
            </div>

            {dbUser && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] ${textSecondary}`}>Plan</span>
                  <span className={`text-[13px] font-semibold ${textPrimary}`}>
                    {isPremium ? 'Premium' : 'Free'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] ${textSecondary}`}>Generations</span>
                  <span className={`text-[13px] font-semibold ${textPrimary}`}>
                    {dbUser.generationsUsed} / {dbUser.generationsLimit}
                  </span>
                </div>
                {dbUser.balance > 0 && (
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] ${textSecondary}`}>Balance (commissions)</span>
                    <span className="text-[13px] font-bold text-emerald-400">
                      ${dbUser.balance.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button onClick={handlePurchase} disabled={isPurchasing}
              className="w-full rounded-2xl py-3.5 text-white font-semibold text-[15px] transition-all duration-200 active:scale-[0.97] hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #057D9F, #03436A)' }}>
              {isPurchasing ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Zap className="w-4.5 h-4.5" />}
              {isPurchasing ? 'Creating invoice...' : 'Buy Premium — $4 / 40 gens'}
            </button>

            <AnimatePresence>
              {purchaseError && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-[12px] text-red-400 text-center mt-2">{purchaseError}</motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Referral Program card ── */}
          <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible"
            className={`${cardBase} rounded-3xl p-5 mt-4`}>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-4.5 h-4.5 text-phantom-primary-light" />
              <span className={`text-[15px] font-bold ${textPrimary}`}>Referral Program</span>
            </div>

            {/* Referral code */}
            <div className="flex items-center gap-3 rounded-2xl p-3.5 bg-white/[0.04] border border-white/[0.07]">
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-medium mb-1 ${textMuted}`}>Your referral code</p>
                {dbUser?.referralCode ? (
                  <p className={`text-[20px] font-extrabold tracking-[0.15em] ${textPrimary}`}>{dbUser.referralCode}</p>
                ) : (
                  <div className="h-6 w-32 rounded-lg skeleton-shimmer bg-white/5" />
                )}
              </div>
              <button onClick={handleCopy} disabled={!dbUser?.referralCode}
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.1]'
                }`}>
                {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Multi-level commission tiers */}
            <div className="mt-4 space-y-2">
              {COMMISSION_TIERS.map(tier => (
                <div key={tier.level} className="flex items-center justify-between rounded-xl px-3.5 py-2.5 bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      tier.level === 1
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-white/[0.06] text-white/40'
                    }`}>
                      {tier.level}
                    </div>
                    <span className={`text-[13px] ${textSecondary}`}>{tier.label}</span>
                  </div>
                  <span className={`text-[14px] font-bold ${
                    tier.level === 1 ? 'text-emerald-400' : 'text-white/50'
                  }`}>
                    {tier.percent}%
                  </span>
                </div>
              ))}
            </div>

            <p className={`text-[11px] mt-3 ${textMuted}`}>
              Earn commissions when your referrals buy subscriptions. 3 levels deep.
            </p>
          </motion.div>
        </>
      ) : (
        /* ── Not authorized ── */
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible"
          className="flex flex-col items-center pt-10 px-4">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 bg-white/[0.05]">
            <Send className="w-9 h-9 text-white/20" />
          </div>
          <h3 className={`text-[18px] font-bold mb-2 ${textPrimary}`}>Not Authorized</h3>
          <p className={`text-[14px] text-center max-w-[260px] mb-6 leading-relaxed ${textSecondary}`}>
            Open this app through Telegram to access your profile, referral program, and premium features
          </p>
          <button type="button"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-semibold text-[15px] transition-all duration-200 active:scale-[0.97] hover:brightness-110 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #2AABEE, #229ED9)' }}>
            <Send className="w-4.5 h-4.5" />
            Open in Telegram
          </button>
          <p className={`text-[12px] mt-4 ${textMuted}`}>You&apos;re currently in preview mode</p>
        </motion.div>
      )}
    </div>
  );
}