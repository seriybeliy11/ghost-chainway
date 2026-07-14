'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Users, Gift, TrendingUp, Zap } from 'lucide-react';
import GhostIcon from '@/components/phantom/GhostIcon';

interface PhantomsViewProps {
  user: {
    id: number;
    first_name: string;
    isAuthorized: boolean;
    referrerCode?: string;
  } | null;
}

export default function PhantomsView({ user }: PhantomsViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = user?.referrerCode || 'ph_000000000';
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Not authorized ──────────────────────────────────────────────
  if (!user?.isAuthorized) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: '#0A1628' }}
      >
        <GhostIcon size={48} className="text-white/10" />
        <p className="mt-4 text-center text-white/40 text-sm leading-relaxed max-w-[260px]">
          Sign in with Telegram to access your referral program
        </p>
      </div>
    );
  }

  // ── Ghost animation variants ────────────────────────────────────
  const ghostFloat = (delay: number, duration: number) => ({
    animate: { y: [0, -8, 0] },
    transition: {
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    },
  });

  const referralCode = user?.referrerCode || 'ph_000000000';

  return (
    <div
      className="min-h-screen px-5 pb-12 pt-8"
      style={{ backgroundColor: '#0A1628' }}
    >
      {/* ── 1. Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2"
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Phantoms
        </h1>

        <div className="flex items-center ml-1">
          <motion.div {...ghostFloat(0, 2.2)}>
            <GhostIcon size={18} className="text-[#057D9F]" />
          </motion.div>
          <motion.div {...ghostFloat(0.3, 1.8)}>
            <GhostIcon size={22} className="text-[#009999]" />
          </motion.div>
          <motion.div {...ghostFloat(0.15, 2.6)}>
            <GhostIcon size={16} className="text-[#057D9F]/70" />
          </motion.div>
        </div>
      </motion.div>

      {/* ── 2. Invite Card ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="mt-6 rounded-3xl p-5 border border-white/[0.08] bg-white/[0.04] backdrop-blur"
      >
        <p className="text-sm text-white/70 leading-relaxed">
          Invite friends and earn{' '}
          <span className="text-[#057D9F] font-semibold">10%</span>{' '}
          lifetime commission on every purchase they make.
        </p>

        {/* Referral code box */}
        <div className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 border border-white/[0.08] bg-white/[0.03]">
          <Gift size={16} className="text-[#057D9F] shrink-0" />
          <span className="flex-1 text-lg font-bold text-white tracking-wide font-mono truncate">
            {referralCode}
          </span>

          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] transition-colors hover:bg-white/[0.1] active:scale-95"
          >
            {copied ? (
              <Check size={16} className="text-emerald-400" />
            ) : (
              <Copy size={16} className="text-white/50" />
            )}
          </button>
        </div>
      </motion.div>

      {/* ── 3. Stats Row ──────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: 'Invited', value: '—', color: 'text-[#057D9F]' },
          { icon: TrendingUp, label: 'Earned', value: '$0.00', color: 'text-emerald-400' },
          { icon: Zap, label: 'Active', value: '—', color: 'text-[#009999]' },
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

      {/* ── 4. How it works ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.38 }}
        className="mt-6"
      >
        <h2 className="text-sm font-semibold text-white/70 mb-4 tracking-wide uppercase">
          How it works
        </h2>

        <div className="flex flex-col gap-4">
          {[
            'Share your referral link with friends',
            'They sign up and purchase generations',
            'You earn 10% of every payment — forever',
          ].map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.46 + i * 0.09 }}
              className="flex items-start gap-3"
            >
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#057D9F]/20 text-[#057D9F] text-xs font-bold">
                {i + 1}
              </span>
              <p className="text-sm text-white/70 leading-snug pt-0.5">{text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}