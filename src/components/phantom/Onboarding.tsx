'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, SkipForward, Crosshair } from 'lucide-react';
import GhostIcon from './GhostIcon';

interface OnboardingProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 4;

/* Step transition only (framer-motion) — scenes use pure CSS */
const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
};

/* ═══════════════════════════════════════════════════════
   SCENE 1 — The Organization
   CSS-only animations (GPU: transform/opacity). No drop-shadow
   filters on SVG (expensive on mobile). Fewer elements.
   ═══════════════════════════════════════════════════════ */
function SceneOne() {
  // Reduced window count (4 instead of 9) for less DOM
  const windows = [[58, 100], [70, 150], [216, 135], [296, 145]];
  return (
    <div className="relative w-full h-[240px] flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 320 240" className="absolute inset-0 w-full h-full">
        {/* Skyline */}
        <g fill="#0D0D24" stroke="#406CFF" strokeWidth="0.8" opacity="0.9">
          <rect x="10" y="110" width="34" height="130" />
          <rect x="50" y="80" width="28" height="160" />
          <rect x="84" y="130" width="40" height="110" />
          <rect x="200" y="90" width="30" height="150" />
          <rect x="236" y="120" width="38" height="120" />
          <rect x="280" y="100" width="32" height="140" />
        </g>
        {/* Neon windows (CSS flicker, staggered via inline delay) */}
        {windows.map(([x, y], i) => (
          <rect
            key={i}
            className="ob-win"
            x={x} y={y} width="3" height="4"
            fill="#00FFCD"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
        {/* Erratic chart line (one-shot draw) */}
        <polyline
          className="dash-draw"
          points="20,190 60,160 90,200 120,140 150,210 180,130 210,190 240,110 270,180 300,90"
          fill="none"
          stroke="#FF2D9C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 200 }}
        />
        {/* Ground */}
        <rect x="0" y="228" width="320" height="12" fill="#070714" />
      </svg>

      {/* Shadowy figures (3, CSS bob) */}
      <div className="relative z-10 flex items-end gap-3 mb-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="relative ob-bob" style={{ animationDelay: `${i * 0.3}s` }}>
            <svg width="44" height="80" viewBox="0 0 44 80">
              <path
                d="M22 8 C12 8 8 18 8 30 L8 72 L14 72 L16 40 L28 40 L30 72 L36 72 L36 30 C36 18 32 8 22 8 Z"
                fill="#0D0D24"
                stroke="#8F40FF"
                strokeWidth="1.2"
              />
              <ellipse cx="22" cy="8" rx="14" ry="3" fill="#0D0D24" stroke="#8F40FF" strokeWidth="0.8" />
              {/* Eyes — CSS pulse, no drop-shadow filter */}
              <circle className="ob-eye" style={{ animationDelay: `${i * 0.4}s` }} cx="18" cy="14" r="1.6" fill="#FF2D9C" />
              <circle className="ob-eye" style={{ animationDelay: `${i * 0.4 + 0.2}s` }} cx="26" cy="14" r="1.6" fill="#FF2D9C" />
            </svg>
          </div>
        ))}
      </div>

      {/* Floating $ (CSS drift, 2 instead of 3) */}
      {[0, 1].map(i => (
        <div
          key={i}
          className="absolute ob-money text-[#FFE600] font-extrabold text-lg"
          style={{ left: `${30 + i * 28}%`, bottom: 90, animationDelay: `${i * 1.5}s`, textShadow: '0 0 6px #FFE600' }}
        >
          $
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCENE 2 — The Kidnapping
   ═══════════════════════════════════════════════════════ */
function SceneTwo() {
  return (
    <div className="relative w-full h-[240px] flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 320 240" className="absolute inset-0 w-full h-full">
        {/* Street perspective */}
        <polygon points="0,240 320,240 220,140 100,140" fill="#0D0D24" stroke="#406CFF" strokeWidth="0.6" opacity="0.7" />
        <polygon points="0,0 100,0 100,140 0,240" fill="#0A0A1E" opacity="0.8" />
        <polygon points="320,0 220,0 220,140 320,240" fill="#0A0A1E" opacity="0.8" />
        {/* Streetlight */}
        <line x1="60" y1="20" x2="60" y2="90" stroke="#406CFF" strokeWidth="1.5" opacity="0.6" />
        <circle className="ob-light" cx="60" cy="92" r="5" fill="#00FFCD" />
        <polygon points="60,92 30,240 90,240" fill="#00FFCD" opacity="0.06" />
        {/* Reflection */}
        <ellipse className="ob-reflect" cx="160" cy="232" rx="80" ry="6" fill="#406CFF" />
      </svg>

      {/* Young man (CSS bob) */}
      <div className="absolute z-10 ob-bob" style={{ left: '38%', bottom: 12 }}>
        <svg width="40" height="76" viewBox="0 0 40 76">
          <circle cx="20" cy="10" r="8" fill="#1a1a3e" stroke="#406CFF" strokeWidth="1.2" />
          <path d="M20 18 L14 44 L16 76 L24 76 L26 44 Z" fill="#1a1a3e" stroke="#406CFF" strokeWidth="1" />
          <line x1="14" y1="26" x2="6" y2="40" stroke="#406CFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="26" y1="26" x2="32" y2="38" stroke="#406CFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Exclamation (CSS pop) */}
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 ob-pop text-[#FFE600] font-extrabold text-2xl"
          style={{ textShadow: '0 0 8px #FFE600' }}
        >
          !
        </div>
      </div>

      {/* Kidnapper (CSS sway, no drop-shadow) */}
      <div className="absolute z-20 ob-sway" style={{ left: '52%', bottom: 12 }}>
        <svg width="48" height="84" viewBox="0 0 48 84">
          <path
            d="M24 8 C12 8 8 20 8 34 L8 78 L16 78 L18 44 L30 44 L32 78 L40 78 L40 34 C40 20 36 8 24 8 Z"
            fill="#070714"
            stroke="#8F40FF"
            strokeWidth="1.4"
          />
          <ellipse cx="24" cy="8" rx="16" ry="3.5" fill="#070714" stroke="#8F40FF" strokeWidth="1" />
          <rect x="16" y="2" width="16" height="6" rx="2" fill="#070714" stroke="#8F40FF" strokeWidth="0.8" />
          {/* Eyes (CSS pulse) */}
          <circle className="ob-eye" cx="20" cy="15" r="1.8" fill="#FF2D9C" />
          <circle className="ob-eye" style={{ animationDelay: '0.2s' }} cx="28" cy="15" r="1.8" fill="#FF2D9C" />
          {/* Static grabbing arm (no d-animation — was expensive) */}
          <path
            d="M10 32 Q -8 30 -16 38"
            fill="none"
            stroke="#8F40FF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Flash overlay (CSS) */}
      <div
        className="absolute inset-0 pointer-events-none ob-flash"
        style={{ background: 'radial-gradient(circle at 60% 40%, rgba(255,45,156,0.15), transparent 60%)' }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCENE 3 — The Hunt
   ═══════════════════════════════════════════════════════ */
function SceneThree() {
  const targets = [
    { x: 90, y: 80, d: 0 },
    { x: 180, y: 100, d: 0.8 },
    { x: 150, y: 180, d: 1.6 },
  ];
  return (
    <div className="relative w-full h-[240px] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 260 240" className="absolute inset-0 w-full h-full" style={{ opacity: 0.5 }}>
        {/* Radar rings */}
        {[40, 80, 120].map(r => (
          <circle key={r} cx="130" cy="120" r={r} fill="none" stroke="#00FFCD" strokeWidth="0.5" opacity="0.3" />
        ))}
        <line x1="10" y1="120" x2="250" y2="120" stroke="#00FFCD" strokeWidth="0.4" opacity="0.2" />
        <line x1="130" y1="0" x2="130" y2="240" stroke="#00FFCD" strokeWidth="0.4" opacity="0.2" />
        {/* Radar sweep (CSS rotate) */}
        <g className="radar-sweep" style={{ transformOrigin: '130px 120px' }}>
          <defs>
            <linearGradient id="sweep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FFCD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00FFCD" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M130 120 L250 120 A120 120 0 0 0 224 54 Z" fill="url(#sweep-grad)" opacity="0.4" />
        </g>
        {/* Targets (CSS pulse + ping) */}
        {targets.map((t, i) => (
          <g key={i}>
            <g className="ob-target" style={{ animationDelay: `${t.d}s` }}>
              <circle cx={t.x} cy={t.y} r="3" fill="none" stroke="#FF2D9C" strokeWidth="1" />
              <line x1={t.x - 6} y1={t.y} x2={t.x + 6} y2={t.y} stroke="#FF2D9C" strokeWidth="0.8" />
              <line x1={t.x} y1={t.y - 6} x2={t.x} y2={t.y + 6} stroke="#FF2D9C" strokeWidth="0.8" />
            </g>
            {/* Ping — use a circle with CSS scale via transform-box */}
            <circle
              className="ob-ping"
              style={{ animationDelay: `${t.d}s`, transformOrigin: `${t.x}px ${t.y}px` }}
              cx={t.x} cy={t.y} r="5"
              fill="none" stroke="#FF2D9C" strokeWidth="1"
            />
          </g>
        ))}
      </svg>

      {/* Central orb (CSS breathe, box-shadow glow instead of filter) */}
      <div className="relative z-10 ob-orb">
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25), rgba(64,108,255,0.4) 50%, rgba(106,0,255,0.5) 80%, rgba(0,0,0,0.4))',
            boxShadow: '0 0 24px rgba(64,108,255,0.5), 0 0 48px rgba(0,255,205,0.15), inset 0 0 20px rgba(64,108,255,0.3)',
            border: '1.5px solid rgba(0,255,205,0.4)',
          }}
        >
          <Crosshair className="w-10 h-10 text-[#00FFCD]" />
        </div>
      </div>

      {/* Two united figures */}
      <div className="absolute bottom-1 z-20 flex items-end gap-1">
        {['#406CFF', '#8F40FF'].map((c, i) => (
          <svg key={i} width="22" height="40" viewBox="0 0 22 40">
            <circle cx="11" cy="6" r="5" fill="#0D0D24" stroke={c} strokeWidth="1" />
            <path d="M11 11 L7 24 L8 40 L14 40 L15 24 Z" fill="#0D0D24" stroke={c} strokeWidth="0.8" />
          </svg>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCENE 4 — CTA
   ═══════════════════════════════════════════════════════ */
function SceneFour() {
  return (
    <div className="relative w-full h-[240px] flex items-center justify-center">
      {/* Aura (CSS, smaller blur) */}
      <div
        className="absolute w-40 h-40 rounded-full ob-aura"
        style={{ background: 'radial-gradient(circle, rgba(0,255,205,0.2), transparent 70%)', filter: 'blur(16px)' }}
      />
      {/* Ghost (CSS float) */}
      <div className="relative ob-float">
        <GhostIcon size={120} outline />
      </div>
      {/* Hunt rings (CSS, 2 instead of 3) */}
      {[0, 1].map(i => (
        <div
          key={i}
          className="absolute w-28 h-28 rounded-full border border-[#00FFCD]/40 ob-ring"
          style={{ animationDelay: `${i * 0.9}s` }}
        />
      ))}
    </div>
  );
}

/* ── Step config (ENGLISH) ── */
const STEPS = [
  {
    Scene: SceneOne,
    chapter: 'Chapter I',
    title: 'The Organization',
    titleNeon: '#FF2D9C',
    text: 'An organization was founded to hunt down insiders — those who manipulate prediction markets every single day, profiting off the unsuspecting crowd.',
    accent: '#FF2D9C',
  },
  {
    Scene: SceneTwo,
    chapter: 'Chapter II',
    title: 'The Kidnapping',
    titleNeon: '#FFE600',
    text: 'A young man was snatched right off the street by one of the organization\'s leaders. It was the beginning of an unlikely alliance.',
    accent: '#FFE600',
  },
  {
    Scene: SceneThree,
    chapter: 'Chapter III',
    title: 'The Hunt',
    titleNeon: '#00FFCD',
    text: 'Together they built a technology that tracks hidden patterns in the markets — exposing the big funds and organizations that manipulate the crowd. The hunt for the real ghosts has begun.',
    accent: '#00FFCD',
  },
  {
    Scene: SceneFour,
    chapter: 'Final',
    title: 'Hunt Begins',
    titleNeon: '#00FFCD',
    text: 'Welcome to Phantom. It\'s time to hunt down the ghosts of the markets.',
    accent: '#00FFCD',
  },
];

/* ═══════════════════════════════════════════════════════
   Main Onboarding
   ═══════════════════════════════════════════════════════ */
export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const next = useCallback(() => {
    setStep(s => {
      if (s < TOTAL_STEPS - 1) { setDir(1); return s + 1; }
      onComplete();
      return s;
    });
  }, [onComplete]);

  const back = useCallback(() => {
    setStep(s => {
      if (s > 0) { setDir(-1); return s - 1; }
      return s;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, back]);

  const current = STEPS[step];
  const Scene = current.Scene;
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col bg-phantom-dark overflow-hidden"
    >
      {/* Ambient glow — reduced blur radius for mobile perf */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 left-1/4 w-64 h-64 rounded-full blur-[60px]"
          style={{ background: `${current.accent}18` }}
        />
        <div className="absolute bottom-0 right-1/4 w-52 h-52 rounded-full blur-[60px] bg-phantom-primary/8" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <GhostIcon size={18} outline />
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/30 neon-buzz">
            Phantom
          </span>
        </div>
        <button
          onClick={onComplete}
          className="flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors cursor-pointer"
        >
          Skip
          <SkipForward className="w-3 h-3" />
        </button>
      </div>

      {/* Scene stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-[360px] mx-auto w-full">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="w-full flex flex-col items-center"
          >
            {/* Chapter label (CSS entrance) */}
            <span
              className="ob-enter ob-enter-1 text-[10px] font-bold tracking-[0.3em] uppercase mb-3"
              style={{ color: current.accent, textShadow: `0 0 6px ${current.accent}` }}
            >
              {current.chapter}
            </span>

            {/* Animated scene */}
            <Scene />

            {/* Title (CSS entrance + neon flicker) */}
            <h2
              className="ob-enter ob-enter-2 neon-flicker text-[26px] font-extrabold leading-tight mt-4 text-center"
              style={{ color: current.titleNeon }}
            >
              {current.title}
            </h2>

            {/* Story text (CSS entrance) */}
            <p className="ob-enter ob-enter-3 text-[13px] leading-relaxed text-center text-white/55 mt-3">
              {current.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 px-6 pb-8 max-w-[360px] mx-auto w-full">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > step ? 1 : -1); setStep(i); }}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === step ? 'w-7 h-2' : 'w-2 h-2 bg-white/15 hover:bg-white/25'
              }`}
              style={i === step ? { background: current.accent, boxShadow: `0 0 8px ${current.accent}` } : {}}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={back}
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-all active:scale-95 cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 h-12 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${current.accent}, ${current.accent}cc)`,
              boxShadow: `0 8px 24px ${current.accent}40`,
            }}
          >
            {isLast ? 'Begin the Hunt' : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
