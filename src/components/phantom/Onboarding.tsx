'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Eye, TrendingUp, Zap, ShieldCheck, Hand, Sparkles, Lock } from 'lucide-react';
import GhostIcon from './GhostIcon';

interface OnboardingProps {
  isDark: boolean;
  onComplete: () => void;
  telegramUser?: {
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    isAuthorized: boolean;
  } | null;
}

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

export default function Onboarding({ isDark, onComplete, telegramUser }: OnboardingProps) {
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

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, back]);

  const dots = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <button
          key={i}
          onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
          className={`rounded-full transition-all duration-300 ${
            i === step
              ? 'w-7 h-2'
              : 'w-2 h-2'
          } ${
            isDark
              ? (i === step ? 'bg-[#73FFE4]' : 'bg-white/15')
              : (i === step ? 'bg-[#00A685]' : 'bg-gray-300')
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
      className={`fixed inset-0 z-[100] flex flex-col overflow-hidden ${
        isDark ? 'bg-phantom-dark' : 'bg-gray-50'
      }`}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-24 -left-24 w-56 h-56 rounded-full blur-[100px] transition-colors duration-500 ${
          isDark ? 'bg-phantom-primary/8' : 'bg-blue-200/30'
        }`} />
        <div className={`absolute top-1/3 -right-24 w-48 h-48 rounded-full blur-[100px] transition-colors duration-500 ${
          isDark ? 'bg-phantom-secondary-a/6' : 'bg-purple-200/25'
        }`} />
        <div className={`absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full blur-[100px] transition-colors duration-500 ${
          isDark ? 'bg-phantom-secondary-b/5' : 'bg-emerald-200/20'
        }`} />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-2">
        <GhostIcon
          className={`transition-colors duration-300 ${isDark ? 'text-[#73FFE4]/40' : 'text-emerald-500/40'}`}
          size={20}
        />
        {step > 0 && (
          <button
            onClick={back}
            className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors duration-300 ${
              isDark ? 'text-white/40 hover:text-white/60 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            Back
          </button>
        )}
        <button
          onClick={onComplete}
          className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors duration-300 ${
            isDark ? 'text-white/30 hover:text-white/50' : 'text-gray-300 hover:text-gray-500'
          }`}
        >
          Skip
        </button>
      </div>

      {/* Content area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1: Telegram Auth */}
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
              {/* Large ghost */}
              <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 transition-colors duration-300 ${
                isDark ? 'bg-[#73FFE4]/8' : 'bg-emerald-100'
              }`}>
                <GhostIcon
                  className={`animate-[float_3s_ease-in-out_infinite] ${isDark ? 'text-[#73FFE4]' : 'text-emerald-600'}`}
                  size={56}
                />
              </div>

              <h1 className={`text-[26px] font-extrabold leading-tight mb-3 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome to<br />
                <span className={isDark ? 'text-[#73FFE4]' : 'text-emerald-600'}>Phantom</span>
              </h1>

              <p className={`text-[14px] leading-relaxed mb-8 transition-colors duration-300 ${
                isDark ? 'text-white/50' : 'text-gray-500'
              }`}>
                Connect with Telegram to unlock personalized predictions and real-time market alerts.
              </p>

              {/* Auth card */}
              {telegramUser?.isAuthorized ? (
                <div className={`w-full rounded-2xl p-4 mb-3 flex items-center gap-3 transition-colors duration-300 ${
                  isDark ? 'glass-card' : 'glass-card-light'
                }`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-[#73FFE4]/15' : 'bg-emerald-100'
                  }`}>
                    <ShieldCheck className={`w-5 h-5 ${isDark ? 'text-[#73FFE4]' : 'text-emerald-600'}`} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-[13px] font-bold truncate transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {telegramUser.first_name} {telegramUser.last_name || ''}
                    </p>
                    {telegramUser.username && (
                      <p className={`text-[11px] transition-colors duration-300 ${
                        isDark ? 'text-white/40' : 'text-gray-400'
                      }`}>
                        @{telegramUser.username}
                      </p>
                    )}
                    <p className={`text-[10px] font-semibold mt-0.5 ${isDark ? 'text-[#73FFE4]/70' : 'text-emerald-600'}`}>
                      Authorized with Telegram
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`w-full rounded-2xl p-4 mb-3 flex items-center gap-3 transition-colors duration-300 ${
                  isDark ? 'glass-card' : 'glass-card-light'
                }`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-white/8' : 'bg-gray-100'
                  }`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.99-1.73 6.65-2.88 7.99-3.44 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z"/>
                    </svg>
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-[13px] font-bold transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Connect Telegram
                    </p>
                    <p className={`text-[10px] mt-0.5 transition-colors duration-300 ${
                      isDark ? 'text-amber-400/80' : 'text-amber-600'
                    }`}>
                      Preview Mode
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #406CFF, #6A00FF)'
                    : 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(64,108,255,0.25)'
                    : '0 8px 32px rgba(59,130,246,0.2)',
                }}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Hot Markets */}
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
              {/* Market icon */}
              <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 transition-colors duration-300 ${
                isDark ? 'bg-orange-500/10' : 'bg-orange-100'
              }`}>
                <TrendingUp className={`w-12 h-12 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
              </div>

              <h2 className={`text-[24px] font-extrabold leading-tight mb-3 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Hot Markets
              </h2>

              <p className={`text-[14px] leading-relaxed mb-7 transition-colors duration-300 ${
                isDark ? 'text-white/50' : 'text-gray-500'
              }`}>
                Real-time predictions from Polymarket. Track the most traded events across politics, sports, crypto and more.
              </p>

              {/* Mini cards preview */}
              <div className="w-full space-y-2.5 mb-7">
                <div className={`rounded-xl p-3.5 flex items-center justify-between transition-colors duration-300 ${
                  isDark ? 'glass-card' : 'glass-card-light'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Zap className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                    <div className="min-w-0">
                      <p className={`text-[12px] font-bold truncate transition-colors duration-300 ${
                        isDark ? 'text-white/90' : 'text-gray-900'
                      }`}>
                        2026 FIFA World Cup
                      </p>
                      <p className={`text-[10px] transition-colors duration-300 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
                        Sports · $4.1M /24h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[16px] font-extrabold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>79%</span>
                    <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Yes</span>
                  </div>
                </div>

                <div className={`rounded-xl p-3.5 flex items-center justify-between transition-colors duration-300 ${
                  isDark ? 'glass-card' : 'glass-card-light'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Zap className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                    <div className="min-w-0">
                      <p className={`text-[12px] font-bold truncate transition-colors duration-300 ${
                        isDark ? 'text-white/90' : 'text-gray-900'
                      }`}>
                        UFC 329: McGregor vs Holloway
                      </p>
                      <p className={`text-[10px] transition-colors duration-300 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
                        Sports · $2.5M /24h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[16px] font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>71%</span>
                    <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Max</span>
                  </div>
                </div>

                <div className={`rounded-xl p-3.5 flex items-center justify-between transition-colors duration-300 ${
                  isDark ? 'glass-card' : 'glass-card-light'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Zap className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                    <div className="min-w-0">
                      <p className={`text-[12px] font-bold truncate transition-colors duration-300 ${
                        isDark ? 'text-white/90' : 'text-gray-900'
                      }`}>
                        Bitcoin above $150K by 2025?
                      </p>
                      <p className={`text-[10px] transition-colors duration-300 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
                        Crypto · $1.8M /24h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[16px] font-extrabold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>34%</span>
                    <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Yes</span>
                  </div>
                </div>
              </div>

              <button
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #406CFF, #6A00FF)'
                    : 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(64,108,255,0.25)'
                    : '0 8px 32px rgba(59,130,246,0.2)',
                }}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 3: Tap on Card */}
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
              {/* Tap icon */}
              <div className="relative w-28 h-28 flex items-center justify-center mb-8">
                <div className={`w-28 h-28 rounded-full transition-colors duration-300 ${
                  isDark ? 'bg-blue-500/10' : 'bg-blue-100'
                }`} />
                {/* Tap ripple */}
                <div className={`absolute inset-0 rounded-full animate-[ping_2s_ease-in-out_infinite] ${
                  isDark ? 'bg-blue-500/5' : 'bg-blue-200/30'
                }`} />
                <div className={`absolute w-16 h-16 rounded-full animate-[ping_2s_ease-in-out_infinite_0.5s] ${
                  isDark ? 'bg-blue-500/8' : 'bg-blue-200/40'
                }`} />
                <Hand className={`relative w-10 h-10 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              </div>

              <h2 className={`text-[24px] font-extrabold leading-tight mb-3 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Tap to Explore
              </h2>

              <p className={`text-[14px] leading-relaxed mb-7 transition-colors duration-300 ${
                isDark ? 'text-white/50' : 'text-gray-500'
              }`}>
                Tap on any market card to see detailed stats, probability breakdowns, volume data, and trade directly on Polymarket.
              </p>

              {/* Interactive demo card */}
              <div className="w-full mb-7">
                <motion.div
                  animate={{ scale: [1, 0.97, 1], y: [0, 2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                  className={`rounded-2xl p-4 border cursor-pointer transition-colors duration-300 ${
                    isDark
                      ? 'glass-card border-white/[0.08]'
                      : 'glass-card-light border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/25' : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}>
                      Crypto
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-red-500/20 text-red-300 border border-red-500/25' : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      Blazing
                    </span>
                  </div>
                  <p className={`text-[13px] font-bold mb-3 transition-colors duration-300 ${
                    isDark ? 'text-white/90' : 'text-gray-900'
                  }`}>
                    Bitcoin above $150K by end of 2025?
                  </p>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className={`text-[20px] font-extrabold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>34%</span>
                      <span className={`text-[10px] ml-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Yes</span>
                    </div>
                    <div>
                      <span className={`text-[20px] font-extrabold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>66%</span>
                      <span className={`text-[10px] mr-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>No</span>
                    </div>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden flex ${isDark ? 'bg-white/8' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-l-full w-[34%] bg-gradient-to-r from-orange-400 to-red-400" />
                    <div className="h-full rounded-r-full w-[66%] bg-gradient-to-r from-purple-400 to-indigo-500" />
                  </div>
                  {/* Tap hint */}
                  <div className="flex items-center justify-center mt-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-colors duration-300 ${
                      isDark ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Hand className="w-3 h-3" />
                      Tap to see details
                    </div>
                  </div>
                </motion.div>
              </div>

              <button
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #406CFF, #6A00FF)'
                    : 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(64,108,255,0.25)'
                    : '0 8px 32px rgba(59,130,246,0.2)',
                }}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 4: Phantom Vision */}
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
              {/* Vision icon with glow */}
              <div className="relative w-28 h-28 flex items-center justify-center mb-8">
                <div className={`absolute inset-0 rounded-full blur-xl transition-colors duration-300 ${
                  isDark ? 'bg-[#73FFE4]/15' : 'bg-emerald-300/30'
                }`} />
                <div className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isDark ? 'bg-[#73FFE4]/10' : 'bg-emerald-100'
                }`}>
                  <Eye className={`w-12 h-12 ${isDark ? 'text-[#73FFE4]' : 'text-emerald-600'}`} />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h2 className={`text-[24px] font-extrabold leading-tight transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Phantom Vision
                </h2>
                <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#73FFE4]' : 'text-emerald-600'}`} />
              </div>

              <p className={`text-[14px] leading-relaxed mb-7 transition-colors duration-300 ${
                isDark ? 'text-white/50' : 'text-gray-500'
              }`}>
                AI-powered market analysis. Get predictive insights, trend detection, and personalized alerts — powered by advanced machine learning.
              </p>

              {/* Feature list */}
              <div className="w-full space-y-2.5 mb-7">
                <div className={`rounded-xl p-3 flex items-center gap-3 transition-colors duration-300 ${
                  isDark ? 'glass-card' : 'glass-card-light'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-[#73FFE4]/10' : 'bg-emerald-100'
                  }`}>
                    <Eye className={`w-4 h-4 ${isDark ? 'text-[#73FFE4]' : 'text-emerald-600'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-[12px] font-bold transition-colors duration-300 ${
                      isDark ? 'text-white/90' : 'text-gray-900'
                    }`}>Predictive Analysis</p>
                    <p className={`text-[10px] transition-colors duration-300 ${
                      isDark ? 'text-white/35' : 'text-gray-400'
                    }`}>AI models trained on market patterns</p>
                  </div>
                </div>

                <div className={`rounded-xl p-3 flex items-center gap-3 transition-colors duration-300 ${
                  isDark ? 'glass-card' : 'glass-card-light'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-phantom-primary/10' : 'bg-blue-100'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${isDark ? 'text-phantom-primary-light' : 'text-blue-600'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-[12px] font-bold transition-colors duration-300 ${
                      isDark ? 'text-white/90' : 'text-gray-900'
                    }`}>Trend Detection</p>
                    <p className={`text-[10px] transition-colors duration-300 ${
                      isDark ? 'text-white/35' : 'text-gray-400'
                    }`}>Spot emerging market shifts early</p>
                  </div>
                </div>

                <div className={`rounded-xl p-3 flex items-center gap-3 transition-colors duration-300 ${
                  isDark ? 'glass-card' : 'glass-card-light'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-phantom-secondary-a/10' : 'bg-purple-100'
                  }`}>
                    <Zap className={`w-4 h-4 ${isDark ? 'text-phantom-secondary-a-light' : 'text-purple-600'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-[12px] font-bold transition-colors duration-300 ${
                      isDark ? 'text-white/90' : 'text-gray-900'
                    }`}>Smart Alerts</p>
                    <p className={`text-[10px] transition-colors duration-300 ${
                      isDark ? 'text-white/35' : 'text-gray-400'
                    }`}>Real-time notifications via Telegram</p>
                  </div>
                </div>
              </div>

              {/* Phantom Vision CTA with lock badge */}
              <button
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-transform active:scale-[0.98] relative overflow-hidden"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #00A685, #73FFE4, #00A685)'
                    : 'linear-gradient(135deg, #059669, #34d399, #059669)',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(115,255,228,0.25)'
                    : '0 8px 32px rgba(52,211,153,0.2)',
                }}
              >
                <Lock className="w-3.5 h-3.5" />
                Phantom Vision
                <span className={`ml-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-white/15 text-white/70' : 'bg-white/30 text-white/80'
                }`}>
                  Soon
                </span>
              </button>

              <p className={`text-[10px] mt-3 transition-colors duration-300 ${
                isDark ? 'text-white/25' : 'text-gray-400'
              }`}>
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