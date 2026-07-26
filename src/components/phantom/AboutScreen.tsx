'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

interface AboutScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayStory?: () => void;
}

function FloatingGhost() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Radial glow */}
      <div className="absolute w-72 h-72 rounded-full bg-[#057D9F]/8 blur-[80px]" />

      {/* Ghost body - CSS only */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        {/* Ghost shape */}
        <div className="relative">
          {/* Head */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-b from-white/15 to-white/10 border border-white/10 backdrop-blur-sm" />
          {/* Body */}
          <div className="w-20 h-16 bg-gradient-to-b from-white/10 to-white/5 border-x border-b border-white/10 -mt-1 rounded-b-[40%] relative overflow-hidden">
            {/* Wavy bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-4 flex">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                  className="flex-1 bg-gradient-to-t from-white/5 to-transparent border-b border-white/10"
                  style={{
                    borderBottomLeftRadius: i % 2 === 0 ? '50%' : '0',
                    borderBottomRightRadius: i % 2 === 0 ? '0' : '50%',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Eyes */}
          <div className="absolute top-7 left-1/2 -translate-x-1/2 flex gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-3.5 h-4 rounded-full bg-[#0A1628] border border-[#057D9F]/30"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#057D9F] mt-1.5 ml-1 shadow-[0_0_6px_#057D9F]" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
              className="w-3.5 h-4 rounded-full bg-[#0A1628] border border-[#057D9F]/30"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#057D9F] mt-1.5 ml-1.5 shadow-[0_0_6px_#057D9F]" />
            </motion.div>
          </div>
        </div>

        {/* Glow ring */}
        <div className="absolute -inset-6 rounded-full border border-[#057D9F]/10 animate-pulse" />
        <div className="absolute -inset-12 rounded-full border border-[#057D9F]/5" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
      </motion.div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            opacity: [0, 0.6, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeOut',
          }}
          className="absolute w-1 h-1 rounded-full bg-[#057D9F]"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${30 + Math.random() * 40}%`,
          }}
        />
      ))}
    </div>
  );
}

export default function AboutScreen({ isOpen, onClose, onReplayStory }: AboutScreenProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-[#0A1628]"
        >
          {/* Ghost animation background */}
          <FloatingGhost />

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200 active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center justify-end h-full px-6 pb-16 text-center"
          >
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-2"
            >
              <h1 className="text-[32px] font-extrabold text-white tracking-tight leading-tight">
                Ghost Hunters
              </h1>
              <div className="mt-1.5 h-0.5 w-16 mx-auto rounded-full bg-gradient-to-r from-transparent via-[#057D9F] to-transparent" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-[13px] text-white/40 font-medium tracking-[0.2em] uppercase mb-8"
            >
              Prediction Markets Intelligence
            </motion.p>

            {/* Creator info card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[320px] w-full rounded-3xl p-6 backdrop-blur-2xl border border-white/[0.08]"
              style={{ background: 'linear-gradient(145deg, rgba(5,125,159,0.12), rgba(10,22,40,0.8))' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#057D9F]/20 border border-[#057D9F]/30">
                  <span className="text-lg">👻</span>
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-bold text-white">Creator</p>
                  <p className="text-[11px] text-white/35">Phantom App</p>
                </div>
              </div>

              <div className="space-y-3 text-left">
                <p className="text-[14px] text-white/70 leading-relaxed">
                  A young trader and{' '}
                  <span className="text-[#057D9F] font-semibold">Hall of Fame</span>{' '}
                  member of the{' '}
                  <span className="text-white font-semibold">TON Open Network</span>
                </p>

                <div className="h-px bg-white/[0.06]" />

                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#057D9F]" />
                  <p className="text-[13px] text-white/50">
                    <span className="text-white/80 font-medium">Business Partner</span>{' '}
                    Polymarket.com
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#009999]" />
                  <p className="text-[13px] text-white/50">
                    Powered by AI-driven market intelligence
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-6 text-[12px] text-white/20 font-medium"
            >
              Hunting alpha in prediction markets
            </motion.p>

            {onReplayStory && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                onClick={onReplayStory}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-[#00FFCD] bg-[#00FFCD]/8 border border-[#00FFCD]/20 hover:bg-[#00FFCD]/15 hover:border-[#00FFCD]/35 transition-all active:scale-95 cursor-pointer"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,205,0.2))' }}
              >
                <Play className="w-3.5 h-3.5" />
                Watch the Story
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}