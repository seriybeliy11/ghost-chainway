'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Eye, TrendingUp, Zap, ShieldCheck, Hand, Sparkles, Lock, Flame, Clock } from 'lucide-react';
import GhostIcon from './GhostIcon';

interface OnboardingProps {
  onComplete: () => void;
  telegramUser?: {
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    isAuthorized: boolean;
  } | null;
}

const darkBgGradients = [
  'from-[#1a0a3e]/90 via-[#0d1a4a]/85 to-[#070714]',
  'from-[#0a1a3e]/90 via-[#1a0a3e]/85 to-[#070714]',
  'from-[#0a2a2a]/90 via-[#0d1a3e]/85 to-[#070714]',
];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 120 : -120,
    opacity: 0,
  }),
};

/* ── Mini event card — mirrors EventCard.tsx design ── */
function MiniCard({
  question,
  category,
  yesPrice,
  noPrice,
  volume,
  timeLeft,
  isVeryHot,
  gradientIdx,
  yesColor,
}: {
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
  timeLeft: string;
  isVeryHot?: boolean;
  gradientIdx: number;
  yesColor: string;
}) {
  const bgGrad = darkBgGradients[gradientIdx % darkBgGradients.length];

  return (
    <div className="relative rounded-2xl overflow-hidden h-[140px] border border-white/[0.08]">
      {/* Gradient bg + orbs */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGrad}`}>
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full blur-2xl bg-phantom-primary/15" />
        <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full blur-2xl bg-phantom-secondary-a/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-3.5">
        {/* Top */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border bg-blue-500/20 text-blue-300 border-blue-500/25">
            {category}
          </span>
          {isVeryHot && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-md border bg-red-500/25 border-red-500/30">
              <Flame className="w-2.5 h-2.5 text-red-400" />
              <span className="text-[9px] font-bold text-red-300">Blazing</span>
            </div>
          )}
        </div>

        {/* Question */}
        <div className="flex-1 flex items-center">
          <h3 className="text-[13px] font-bold leading-snug line-clamp-2 text-white/95 drop-shadow-lg">
            {question}
          </h3>
        </div>

        {/* Bottom */}
        <div className="space-y-2">
          <div className="flex items-end justify-between mb-0.5">
            <div>
              <span className={`text-[18px] font-extrabold leading-none ${yesColor}`}>
                {yesPrice}<span className="text-[11px] font-bold">%</span>
              </span>
              <span className="text-[9px] font-semibold ml-1 text-white/40">Yes</span>
            </div>
            <div className="text-right">
              <span className="text-[18px] font-extrabold leading-none text-purple-400">
                {noPrice}<span className="text-[11px] font-bold">%</span>
              </span>
              <span className="text-[9px] font-semibold mr-1 text-white/40">No</span>
            </div>
          </div>

          <div className="h-1.5 rounded-full overflow-hidden flex bg-white/8">
            <div className={`h-full rounded-l-full bg-gradient-to-r ${yesColor}`} style={{ width: `${yesPrice}%` }} />
            <div className="h-full rounded-r-full bg-gradient-to-r from-purple-400 to-indigo-500" style={{ width: `${noPrice}%` }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-white/40">
              <TrendingUp className="w-2.5 h-2.5" />
              <span className="text-[10px] font-semibold">{volume}</span>
              <span className="text-[8px] text-white/20">/24h</span>
            </div>
            <div className="flex items-center gap-1 text-white/40">
              <Clock className="w-2.5 h-2.5" />
              <span className="text-[10px] font-medium">{timeLeft}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Demo card for step 3 — same design with tap animation ── */
function DemoCard() {
  return (
    <motion.div
      animate={{ scale: [1, 0.97, 1], y: [0, 2, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
      className="relative rounded-2xl overflow-hidden h-[150px] border border-white/[0.08] cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a2a2a]/90 via-[#0d1a3e]/85 to-[#070714]">
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full blur-2xl bg-phantom-secondary-b/15" />
        <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full blur-2xl bg-phantom-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/80" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border bg-purple-500/20 text-purple-300 border-purple-500/25">
            Crypto
          </span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-md border bg-red-500/25 border-red-500/30">
            <Flame className="w-2.5 h-2.5 text-red-400" />
            <span className="text-[9px] font-bold text-red-300">Blazing</span>
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <h3 className="text-[14px] font-bold leading-snug line-clamp-2 text-white/95 drop-shadow-lg">
            Bitcoin above $150K by end of 2025?
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between mb-0.5">
            <div>
              <span className="text-[20px] font-extrabold leading-none text-orange-400">
                34<span className="text-[12px] font-bold">%</span>
              </span>
              <span className="text-[9px] font-semibold ml-1 text-white/40">Yes</span>
            </div>
            <div className="text-right">
              <span className="text-[20px] font-extrabold leading-none text-purple-400">
                66<span className="text-[12px] font-bold">%</span>
              </span>
              <span className="text-[9px] font-semibold mr-1 text-white/40">No</span>
            </div>
          </div>

          <div className="h-1.5 rounded-full overflow-hidden flex bg-white/8">
            <div className="h-full rounded-l-full bg-gradient-to-r from-orange-400 to-red-400" style={{ width: '34%' }} />
            <div className="h-full rounded-r-full bg-gradient-to-r from-purple-400 to-indigo-500" style={{ width: '66%' }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-white/40">
              <TrendingUp className="w-2.5 h-2.5" />
              <span className="text-[10px] font-semibold">$1.8M</span>
              <span className="text-[8px] text-white/20">/24h</span>
            </div>

            {/* Tap hint */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-white/30">
              <Hand className="w-2.5 h-2.5" />
              <span className="text-[9px] font-medium">Tap to explore</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Onboarding ── */
export default function Onboarding({ onComplete, telegramUser }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const totalSteps = 4;

  const next = useCallback(() => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  }, [step, onComplete]);

  const back = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  }, [step]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, back]);

  const dots = (
    <div className="flex items-center justify-center gap-2 mb-5">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <button
          key={i}
          onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
          className={`rounded-full transition-all duration-300 ${
            i === step ? 'w-7 h-2 bg-[#73FFE4]' : 'w-2 h-2 bg-white/15'
          }`}
          aria-label={`Go to step ${i + 1}`}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-phantom-dark"
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full blur-[100px] bg-phantom-primary/8" />
        <div className="absolute top-1/3 -right-24 w-48 h-48 rounded-full blur-[100px] bg-phantom-secondary-a/6" />
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full blur-[100px] bg-phantom-secondary-b/5" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-2">
        <GhostIcon className="text-[#73FFE4]/40" size={20} />
        {step > 0 && (
          <button
            onClick={back}
            className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={onComplete}
          className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-white/30 hover:text-white/50 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── Step 1: Telegram Auth ── */}
          {step === 0 && (
            <motion.div
              key="auth"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
              className="flex flex-col items-center text-center w-full max-w-xs"
            >
              <div className="w-28 h-28 rounded-full flex items-center justify-center mb-8 bg-[#73FFE4]/8">
                <GhostIcon
                  className="text-[#73FFE4] animate-[float_3s_ease-in-out_infinite]"
                  size={56}
                />
              </div>

              <h1 className="text-[26px] font-extrabold leading-tight mb-3 text-white">
                Welcome to<br />
                <span className="text-[#73FFE4]">Phantom</span>
              </h1>

              <p className="text-[14px] leading-relaxed mb-8 text-white/50">
                Connect with Telegram to unlock personalized predictions and real-time market alerts.
              </p>

              {telegramUser?.isAuthorized ? (
                <div className="w-full glass-card rounded-2xl p-4 mb-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-[#73FFE4]/15">
                    <ShieldCheck className="w-5 h-5 text-[#73FFE4]" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[13px] font-bold truncate text-white">
                      {telegramUser.first_name} {telegramUser.last_name || ''}
                    </p>
                    {telegramUser.username && (
                      <p className="text-[11px] text-white/40">@{telegramUser.username}</p>
                    )}
                    <p className="text-[10px] font-semibold mt-0.5 text-[#73FFE4]/70">
                      Authorized with Telegram
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full glass-card rounded-2xl p-4 mb-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-white/8">
                    <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.99-1.73 6.65-2.88 7.99-3.44 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z"/>
                    </svg>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[13px] font-bold text-white">Connect Telegram</p>
                    <p className="text-[10px] mt-0.5 text-amber-400/80">Preview Mode</p>
                  </div>
                </div>
              )}

              <button
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #406CFF, #6A00FF)',
                  boxShadow: '0 8px 32px rgba(64,108,255,0.25)',
                }}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Hot Markets ── */}
          {step === 1 && (
            <motion.div
              key="markets"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
              className="flex flex-col items-center text-center w-full max-w-xs"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-orange-500/10">
                <TrendingUp className="w-10 h-10 text-orange-400" />
              </div>

              <h2 className="text-[24px] font-extrabold leading-tight mb-2 text-white">
                Hot Markets
              </h2>

              <p className="text-[13px] leading-relaxed mb-6 text-white/45">
                Real-time predictions from Polymarket — track the most traded events across politics, sports, crypto and more.
              </p>

              {/* Event cards — same design as main screen */}
              <div className="w-full space-y-3 mb-6">
                <MiniCard
                  question="Will Spain win the 2026 FIFA World Cup?"
                  category="Sports"
                  yesPrice={21}
                  noPrice={79}
                  volume="$4.1M"
                  timeLeft="2w"
                  isVeryHot
                  gradientIdx={0}
                  yesColor="text-orange-400"
                />
                <MiniCard
                  question="UFC 329: Max Holloway vs. Conor McGregor"
                  category="Trending"
                  yesPrice={71}
                  noPrice={29}
                  volume="$2.5M"
                  timeLeft="24h"
                  isVeryHot
                  gradientIdx={1}
                  yesColor="text-emerald-400"
                />
              </div>

              <button
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #406CFF, #6A00FF)',
                  boxShadow: '0 8px 32px rgba(64,108,255,0.25)',
                }}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ── Step 3: Tap to Explore ── */}
          {step === 2 && (
            <motion.div
              key="tap"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
              className="flex flex-col items-center text-center w-full max-w-xs"
            >
              <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-500/10" />
                <div className="absolute inset-0 rounded-full animate-[ping_2s_ease-in-out_infinite] bg-blue-500/5" />
                <div className="absolute w-12 h-12 rounded-full animate-[ping_2s_ease-in-out_infinite_0.5s] bg-blue-500/8" />
                <Hand className="relative w-9 h-9 text-blue-400" />
              </div>

              <h2 className="text-[24px] font-extrabold leading-tight mb-2 text-white">
                Tap to Explore
              </h2>

              <p className="text-[13px] leading-relaxed mb-6 text-white/45">
                Tap any market card to see detailed stats, probability breakdowns, volume data, and trade directly on Polymarket.
              </p>

              {/* Demo card — same design as EventCard */}
              <div className="w-full mb-6">
                <DemoCard />
              </div>

              <button
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #406CFF, #6A00FF)',
                  boxShadow: '0 8px 32px rgba(64,108,255,0.25)',
                }}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ── Step 4: Phantom Vision ── */}
          {step === 3 && (
            <motion.div
              key="vision"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
              className="flex flex-col items-center text-center w-full max-w-xs"
            >
              <div className="relative w-28 h-28 flex items-center justify-center mb-8">
                <div className="absolute inset-0 rounded-full blur-xl bg-[#73FFE4]/15" />
                <div className="relative w-28 h-28 rounded-full flex items-center justify-center bg-[#73FFE4]/10">
                  <Eye className="w-12 h-12 text-[#73FFE4]" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-[24px] font-extrabold leading-tight text-white">
                  Phantom Vision
                </h2>
                <Sparkles className="w-5 h-5 text-[#73FFE4]" />
              </div>

              <p className="text-[13px] leading-relaxed mb-6 text-white/45">
                AI-powered market analysis. Get predictive insights, trend detection, and personalized alerts.
              </p>

              {/* Feature list */}
              <div className="w-full space-y-2 mb-6">
                <div className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#73FFE4]/10">
                    <Eye className="w-4 h-4 text-[#73FFE4]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-bold text-white/90">Predictive Analysis</p>
                    <p className="text-[10px] text-white/35">AI models trained on market patterns</p>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-phantom-primary/10">
                    <TrendingUp className="w-4 h-4 text-phantom-primary-light" />
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-bold text-white/90">Trend Detection</p>
                    <p className="text-[10px] text-white/35">Spot emerging market shifts early</p>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-phantom-secondary-a/10">
                    <Zap className="w-4 h-4 text-phantom-secondary-a-light" />
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-bold text-white/90">Smart Alerts</p>
                    <p className="text-[10px] text-white/35">Real-time notifications via Telegram</p>
                  </div>
                </div>
              </div>

              <button
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-transform active:scale-[0.98] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #00A685, #73FFE4, #00A685)',
                  boxShadow: '0 8px 32px rgba(115,255,228,0.25)',
                }}
              >
                <Lock className="w-3.5 h-3.5" />
                Phantom Vision
                <span className="ml-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white/70">
                  Soon
                </span>
              </button>

              <p className="text-[10px] mt-3 text-white/25">
                Requires subscription · Coming soon
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: progress dots */}
      <div className="relative z-10 pb-8">
        {dots}
      </div>
    </motion.div>
  );
}