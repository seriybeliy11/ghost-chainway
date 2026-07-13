'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Send, Copy, Check, Users, Gift } from 'lucide-react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  isAuthorized: boolean;
}

interface ProfileViewProps {
  user: TelegramUser | null;
  isDark?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function ProfileView({ user, isDark = true }: ProfileViewProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const displayName = user
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : null;

  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isAuthorized = user?.isAuthorized ?? false;

  // Fetch referral info for authorized users
  useEffect(() => {
    if (!isAuthorized || !user) return;
    fetch(`/api/user?telegramId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.user?.referralCode) setReferralCode(data.user.referralCode);
        if (data.referralCount != null) setReferralCount(data.referralCount);
      })
      .catch(() => {});
  }, [isAuthorized, user]);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const cardBase = isDark ? 'glass-card' : 'glass-card-light';

  return (
    <div className="px-4 pb-6 pt-2">
      {isAuthorized && user ? (
        <>
          {/* ── User card ── */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`${cardBase} rounded-3xl p-6`}
          >
            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div
                  className={`w-[68px] h-[68px] rounded-full p-[2px] ${
                    isDark
                      ? 'bg-gradient-to-br from-phantom-primary via-phantom-secondary-a to-phantom-secondary-b'
                      : 'bg-gradient-to-br from-teal-400 via-cyan-400 to-teal-500'
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${
                      isDark ? 'bg-phantom-dark' : 'bg-white'
                    }`}
                  >
                    {user.photo_url ? (
                      <img src={user.photo_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-phantom-primary-light">{initials}</span>
                    )}
                  </div>
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 ${
                    isDark ? 'bg-emerald-400 border-phantom-dark' : 'bg-emerald-500 border-white'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[17px] font-bold leading-tight truncate ${isDark ? 'text-white/95' : 'text-gray-900'}`}>
                    {displayName}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                </div>
                {user.username && (
                  <span className={`text-[14px] leading-tight ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    @{user.username}
                  </span>
                )}
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full w-fit ${
                  isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  Authorized via Telegram
                </span>
              </div>
            </div>

            <div className={`my-5 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[13px] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>User ID</span>
                <span className={`text-[13px] font-mono font-medium ${isDark ? 'text-white/60' : 'text-gray-700'}`}>
                  {user.id}
                </span>
              </div>
              {user.language_code && (
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Language</span>
                  <span className={`text-[13px] font-medium capitalize ${isDark ? 'text-white/60' : 'text-gray-700'}`}>
                    {user.language_code}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Referral Program card ── */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`${cardBase} rounded-3xl p-5 mt-4`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Gift className={`w-4.5 h-4.5 ${isDark ? 'text-phantom-primary-light' : 'text-teal-600'}`} />
              <span className={`text-[15px] font-bold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                Referral Program
              </span>
            </div>

            {/* Referral code display */}
            <div className={`flex items-center gap-3 rounded-2xl p-3.5 ${
              isDark ? 'bg-white/[0.04] border border-white/[0.07]' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-medium mb-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                  Your referral code
                </p>
                {referralCode ? (
                  <p className={`text-[20px] font-extrabold tracking-[0.15em] ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                    {referralCode}
                  </p>
                ) : (
                  <div className={`h-6 w-32 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-200'} skeleton-shimmer`} />
                )}
              </div>

              <button
                onClick={handleCopy}
                disabled={!referralCode}
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : (isDark
                      ? 'bg-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.1]'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200')
                }`}
              >
                {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <Users className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                <span className={`text-[13px] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  <span className={`font-semibold ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{referralCount}</span> invited
                </span>
              </div>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
              <span className={`text-[12px] ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
                Share to earn rewards
              </span>
            </div>
          </motion.div>
        </>
      ) : (
        /* ── Not authorized ── */
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center pt-10 px-4"
        >
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 ${
            isDark ? 'bg-white/[0.05]' : 'bg-gray-100'
          }`}>
            <Send className={`w-9 h-9 ${isDark ? 'text-white/20' : 'text-gray-400'}`} />
          </div>

          <h3 className={`text-[18px] font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Not Authorized
          </h3>
          <p className={`text-[14px] text-center max-w-[260px] mb-6 leading-relaxed ${
            isDark ? 'text-white/35' : 'text-gray-500'
          }`}>
            Open this app through Telegram to access your profile, referral program, and premium features
          </p>

          <button
            type="button"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-semibold text-[15px] transition-all duration-200 active:scale-[0.97] hover:brightness-110 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #2AABEE, #229ED9)' }}
          >
            <Send className="w-4.5 h-4.5" />
            Open in Telegram
          </button>

          <p className={`text-[12px] mt-4 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
            You&apos;re currently in preview mode
          </p>
        </motion.div>
      )}
    </div>
  );
}