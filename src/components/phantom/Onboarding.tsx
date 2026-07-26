'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, SkipForward, Crosshair } from 'lucide-react';
import GhostIcon from './GhostIcon';

interface OnboardingProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 4; // 3 story acts + final CTA

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
};

/* ═══════════════════════════════════════════════════════
   SCENE 1 — The Organization (инсайдеры манипулируют рынками)
   Dark skyline, shadowy figures with glowing eyes,
   floating money, erratic chart line.
   ═══════════════════════════════════════════════════════ */
function SceneOne() {
  return (
    <div className="relative w-full h-[260px] flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 320 260" className="absolute inset-0 w-full h-full">
        {/* Skyline silhouette */}
        <g fill="#0D0D24" stroke="#406CFF" strokeWidth="0.8" opacity="0.9">
          <rect x="10" y="120" width="34" height="140" />
          <rect x="50" y="90" width="28" height="170" />
          <rect x="84" y="140" width="40" height="120" />
          <rect x="200" y="100" width="30" height="160" />
          <rect x="236" y="130" width="38" height="130" />
          <rect x="280" y="110" width="32" height="150" />
        </g>
        {/* Neon window lights (flickering) */}
        {[
          [58, 100], [66, 110], [58, 130], [70, 150],
          [208, 115], [216, 135], [222, 160],
          [288, 125], [296, 145],
        ].map(([x, y], i) => (
          <motion.rect
            key={i}
            x={x} y={y} width="3" height="4"
            fill="#00FFCD"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
            style={{ filter: 'drop-shadow(0 0 3px #00FFCD)' }}
          />
        ))}

        {/* Erratic chart line (manipulation) */}
        <motion.polyline
          points="20,200 60,170 90,210 120,150 150,220 180,140 210,200 240,120 270,190 300,100"
          fill="none"
          stroke="#FF2D9C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 4px #FF2D9C)' }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />

        {/* Ground */}
        <rect x="0" y="248" width="320" height="12" fill="#070714" />
      </svg>

      {/* Shadowy figures */}
      <div className="relative z-10 flex items-end gap-3 mb-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.3, duration: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            <svg width="44" height="80" viewBox="0 0 44 80">
              {/* Trench coat body */}
              <path
                d="M22 8 C12 8 8 18 8 30 L8 72 L14 72 L16 40 L28 40 L30 72 L36 72 L36 30 C36 18 32 8 22 8 Z"
                fill="#0D0D24"
                stroke="#8F40FF"
                strokeWidth="1.2"
                style={{ filter: 'drop-shadow(0 0 5px rgba(143,64,255,0.6))' }}
              />
              {/* Hat brim */}
              <ellipse cx="22" cy="8" rx="14" ry="3" fill="#0D0D24" stroke="#8F40FF" strokeWidth="0.8" />
              {/* Glowing eyes */}
              <motion.circle
                cx="18" cy="14" r="1.4" fill="#FF2D9C"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                style={{ filter: 'drop-shadow(0 0 4px #FF2D9C)' }}
              />
              <motion.circle
                cx="26" cy="14" r="1.4" fill="#FF2D9C"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 + 0.2 }}
                style={{ filter: 'drop-shadow(0 0 4px #FF2D9C)' }}
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Floating money symbols */}
      {['$', '$', '$'].map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-[#FFE600] font-extrabold text-lg"
          style={{ left: `${25 + i * 22}%`, bottom: 100, filter: 'drop-shadow(0 0 6px #FFE600)' }}
          animate={{ y: [0, -50, -100], opacity: [0, 1, 0], rotate: [0, 8, -4] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
        >
          {s}
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCENE 2 — The Kidnapping (похищение на улице)
   Neon street, young man walking, dark figure grabs him.
   ═══════════════════════════════════════════════════════ */
function SceneTwo() {
  return (
    <div className="relative w-full h-[260px] flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 320 260" className="absolute inset-0 w-full h-full">
        {/* Street perspective */}
        <polygon points="0,260 320,260 220,150 100,150" fill="#0D0D24" stroke="#406CFF" strokeWidth="0.6" opacity="0.7" />
        {/* Building walls */}
        <polygon points="0,0 100,0 100,150 0,260" fill="#0A0A1E" opacity="0.8" />
        <polygon points="320,0 220,0 220,150 320,260" fill="#0A0A1E" opacity="0.8" />

        {/* Neon streetlight */}
        <line x1="60" y1="20" x2="60" y2="90" stroke="#406CFF" strokeWidth="1.5" opacity="0.6" />
        <motion.circle
          cx="60" cy="92" r="5" fill="#00FFCD"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ filter: 'drop-shadow(0 0 10px #00FFCD)' }}
        />
        {/* Light cone */}
        <polygon points="60,92 30,260 90,260" fill="#00FFCD" opacity="0.06" />

        {/* Wet pavement reflection */}
        <motion.ellipse
          cx="160" cy="250" rx="80" ry="6"
          fill="#406CFF" opacity="0.12"
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </svg>

      {/* Young man (victim) — walking, then grabbed */}
      <motion.div
        className="absolute z-10"
        style={{ left: '38%', bottom: 16 }}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: [0, 4, 0], opacity: 1 }}
        transition={{ x: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6 } }}
      >
        <svg width="40" height="76" viewBox="0 0 40 76">
          {/* Head */}
          <circle cx="20" cy="10" r="8" fill="#1a1a3e" stroke="#406CFF" strokeWidth="1.2" style={{ filter: 'drop-shadow(0 0 4px #406CFF)' }} />
          {/* Body */}
          <path d="M20 18 L14 44 L16 76 L24 76 L26 44 Z" fill="#1a1a3e" stroke="#406CFF" strokeWidth="1" />
          {/* Arms */}
          <motion.line
            x1="14" y1="26" x2="6" y2="40"
            stroke="#406CFF" strokeWidth="2" strokeLinecap="round"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          <line x1="26" y1="26" x2="32" y2="38" stroke="#406CFF" strokeWidth="2" strokeLinecap="round" />
          {/* Startled "!" above head */}
        </svg>
        {/* Exclamation */}
        <motion.div
          className="absolute -top-7 left-1/2 -translate-x-1/2 text-[#FFE600] font-extrabold text-2xl"
          animate={{ opacity: [0, 1, 1, 0], y: [0, -4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
          style={{ filter: 'drop-shadow(0 0 8px #FFE600)' }}
        >
          !
        </motion.div>
      </motion.div>

      {/* Dark figure (kidnapper) — grabs from behind */}
      <motion.div
        className="absolute z-20"
        style={{ left: '52%', bottom: 16 }}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: [0, -2, 0], opacity: 1 }}
        transition={{ x: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.5, delay: 0.3 } }}
      >
        <svg width="48" height="84" viewBox="0 0 48 84">
          {/* Coat */}
          <path
            d="M24 8 C12 8 8 20 8 34 L8 78 L16 78 L18 44 L30 44 L32 78 L40 78 L40 34 C40 20 36 8 24 8 Z"
            fill="#070714"
            stroke="#8F40FF"
            strokeWidth="1.4"
            style={{ filter: 'drop-shadow(0 0 8px rgba(143,64,255,0.7))' }}
          />
          {/* Hat */}
          <ellipse cx="24" cy="8" rx="16" ry="3.5" fill="#070714" stroke="#8F40FF" strokeWidth="1" />
          <rect x="16" y="2" width="16" height="6" rx="2" fill="#070714" stroke="#8F40FF" strokeWidth="0.8" />
          {/* Glowing eyes */}
          <motion.circle
            cx="20" cy="15" r="1.6" fill="#FF2D9C"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ filter: 'drop-shadow(0 0 5px #FF2D9C)' }}
          />
          <motion.circle
            cx="28" cy="15" r="1.6" fill="#FF2D9C"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            style={{ filter: 'drop-shadow(0 0 5px #FF2D9C)' }}
          />
          {/* Grabbing arm reaching toward victim */}
          <motion.path
            d="M10 32 Q -8 30 -16 38"
            fill="none"
            stroke="#8F40FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ d: ['M10 32 Q -8 30 -16 38', 'M10 32 Q -6 28 -14 34', 'M10 32 Q -8 30 -16 38'] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ filter: 'drop-shadow(0 0 4px #8F40FF)' }}
          />
        </svg>
      </motion.div>

      {/* Neon flash overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 60% 40%, rgba(255,45,156,0.15), transparent 60%)' }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCENE 3 — The Hunt (технология + охота на призраков)
   The orb/tech, scanning radar, exposed ghost targets.
   ═══════════════════════════════════════════════════════ */
function SceneThree() {
  return (
    <div className="relative w-full h-[260px] flex items-center justify-center overflow-hidden">
      {/* Radar grid background */}
      <svg viewBox="0 0 260 260" className="absolute inset-0 w-full h-full" style={{ opacity: 0.5 }}>
        {[40, 80, 120].map(r => (
          <circle key={r} cx="130" cy="130" r={r} fill="none" stroke="#00FFCD" strokeWidth="0.5" opacity="0.3" />
        ))}
        <line x1="10" y1="130" x2="250" y2="130" stroke="#00FFCD" strokeWidth="0.4" opacity="0.2" />
        <line x1="130" y1="10" x2="130" y2="250" stroke="#00FFCD" strokeWidth="0.4" opacity="0.2" />

        {/* Radar sweep */}
        <g className="radar-sweep" style={{ transformOrigin: '130px 130px' }}>
          <defs>
            <linearGradient id="sweep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FFCD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00FFCD" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M130 130 L250 130 A120 120 0 0 0 224 64 Z" fill="url(#sweep-grad)" opacity="0.4" />
        </g>

        {/* Detected ghost targets (big funds = ghosts) */}
        {[
          { x: 90, y: 80, d: 0 },
          { x: 180, y: 100, d: 0.8 },
          { x: 150, y: 180, d: 1.6 },
        ].map((t, i) => (
          <g key={i}>
            {/* Crosshair */}
            <motion.g
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 1, 0.6], scale: 1 }}
              transition={{ duration: 2, repeat: Infinity, delay: t.d }}
            >
              <circle cx={t.x} cy={t.y} r="3" fill="none" stroke="#FF2D9C" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 4px #FF2D9C)' }} />
              <line x1={t.x - 6} y1={t.y} x2={t.x + 6} y2={t.y} stroke="#FF2D9C" strokeWidth="0.8" />
              <line x1={t.x} y1={t.y - 6} x2={t.x} y2={t.y + 6} stroke="#FF2D9C" strokeWidth="0.8" />
            </motion.g>
            {/* Expanding ping */}
            <motion.circle
              cx={t.x} cy={t.y} r="3"
              fill="none" stroke="#FF2D9C" strokeWidth="1"
              animate={{ r: [3, 14], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: t.d }}
              style={{ transformOrigin: `${t.x}px ${t.y}px` }}
            />
          </g>
        ))}
      </svg>

      {/* Central tech orb */}
      <motion.div
        className="relative z-10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25), rgba(64,108,255,0.4) 50%, rgba(106,0,255,0.5) 80%, rgba(0,0,0,0.4))',
            boxShadow: '0 0 30px rgba(64,108,255,0.5), 0 0 60px rgba(0,255,205,0.2), inset 0 0 20px rgba(64,108,255,0.3)',
            border: '1.5px solid rgba(0,255,205,0.4)',
          }}
        >
          <Crosshair className="w-10 h-10 text-[#00FFCD]" style={{ filter: 'drop-shadow(0 0 8px #00FFCD)' }} />
        </div>
        {/* Rotating ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#00FFCD]/30 radar-sweep" style={{ transform: 'scale(1.3)' }} />
      </motion.div>

      {/* Two united figures at bottom */}
      <div className="absolute bottom-1 z-20 flex items-end gap-1">
        {['#406CFF', '#8F40FF'].map((c, i) => (
          <motion.svg
            key={i}
            width="22" height="40" viewBox="0 0 22 40"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.2 }}
          >
            <circle cx="11" cy="6" r="5" fill="#0D0D24" stroke={c} strokeWidth="1" style={{ filter: `drop-shadow(0 0 3px ${c})` }} />
            <path d="M11 11 L7 24 L8 40 L14 40 L15 24 Z" fill="#0D0D24" stroke={c} strokeWidth="0.8" />
          </motion.svg>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCENE 4 — CTA (Begin the Hunt)
   ═══════════════════════════════════════════════════════ */
function SceneFour() {
  return (
    <div className="relative w-full h-[260px] flex items-center justify-center">
      {/* Pulsing aura */}
      <motion.div
        className="absolute w-44 h-44 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,255,205,0.2), transparent 70%)', filter: 'blur(20px)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <GhostIcon size={120} outline />
      </motion.div>
      {/* Hunt ping rings */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute w-28 h-28 rounded-full border border-[#00FFCD]/40"
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }}
          style={{ transformOrigin: 'center' }}
        />
      ))}
    </div>
  );
}

/* ── Step content config ── */
const STEPS = [
  {
    Scene: SceneOne,
    chapter: 'Chapter I',
    title: 'The Organization',
    titleNeon: '#FF2D9C',
    text: 'Была создана организация по ловле инсайдеров — тех, кто каждый день манипулирует рынками предсказаний, чтобы зарабатывать на неосведомлённой толпе.',
    accent: '#FF2D9C',
  },
  {
    Scene: SceneTwo,
    chapter: 'Chapter II',
    title: 'The Kidnapping',
    titleNeon: '#FFE600',
    text: 'Одного молодого человека прямо на улице похитил один из лидеров организации. Это было началом неожиданного союза.',
    accent: '#FFE600',
  },
  {
    Scene: SceneThree,
    chapter: 'Chapter III',
    title: 'The Hunt',
    titleNeon: '#00FFCD',
    text: 'Вместе они создали технологию, отслеживающую скрытые паттерны на рынках. Теперь они выслеживают тех, кто манипулирует толпой — крупные фонды и организации. Открыта охота на настоящих призраков.',
    accent: '#00FFCD',
  },
  {
    Scene: SceneFour,
    chapter: 'Final',
    title: 'Hunt Begins',
    titleNeon: '#00FFCD',
    text: 'Добро пожаловать в Phantom. Пришло время выследить призраков рынков.',
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
      {/* Ambient neon glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 left-1/4 w-72 h-72 rounded-full blur-[120px]"
          style={{ background: `${current.accent}14` }}
        />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full blur-[100px] bg-phantom-primary/8" />
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
            transition={{ type: 'spring', damping: 26, stiffness: 260, mass: 0.7 }}
            className="w-full flex flex-col items-center"
          >
            {/* Chapter label */}
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3"
              style={{ color: current.accent, filter: `drop-shadow(0 0 6px ${current.accent})` }}
            >
              {current.chapter}
            </motion.span>

            {/* Animated scene */}
            <Scene />

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-[26px] font-extrabold leading-tight mt-4 text-center neon-flicker"
              style={{ color: current.titleNeon }}
            >
              {current.title}
            </motion.h2>

            {/* Story text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[13px] leading-relaxed text-center text-white/55 mt-3"
            >
              {current.text}
            </motion.p>
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
              boxShadow: `0 8px 32px ${current.accent}40`,
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
