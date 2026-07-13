'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Wallet, Zap, Info, Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileViewProps {
  isDark?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function LoadingSkeleton({ isDark }: { isDark: boolean }) {
  const cardClass = isDark ? 'glass-card' : 'glass-card-light';
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`${cardClass} rounded-3xl p-5`}>
          <div className="space-y-3">
            <Skeleton className={`h-5 w-32 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
            <Skeleton className={`h-4 w-24 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
            <Skeleton className={`h-10 w-full rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProfileView({ isDark = true }: ProfileViewProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const displayName = 'Alex Phantom';
  const username = '@alex_phantom';
  const initials = 'AP';
  const planName = 'Free Plan';
  const usedGenerations = 0;
  const totalGenerations = 10;
  const balance = '$0.00';
  const progressPercent = (usedGenerations / totalGenerations) * 100;
  const remaining = totalGenerations - usedGenerations;

  // Circular progress for generations SVG
  const circleRadius = 26;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  if (isLoading) {
    return <LoadingSkeleton isDark={isDark} />;
  }

  return (
    <div className="px-4 pb-6">
      {/* User info card */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`${isDark ? 'glass-card' : 'glass-card-light'} rounded-3xl p-5`}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
            style={{
              backgroundColor: 'rgba(5, 125, 159, 0.2)',
              color: '#61B7CF',
            }}
          >
            {initials}
          </div>

          {/* Name & username */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              className={`text-[15px] font-semibold leading-tight truncate ${
                isDark ? 'text-white/90' : 'text-gray-800'
              }`}
            >
              {displayName}
            </span>
            <span
              className={`text-[13px] leading-tight ${
                isDark ? 'text-white/50' : 'text-gray-500'
              }`}
            >
              {username}
            </span>
          </div>

          {/* Preview Mode badge */}
          <span
            className={`ml-auto text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${
              isDark
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-amber-100 text-amber-600'
            }`}
          >
            Preview Mode
          </span>
        </div>
      </motion.div>

      {/* Subscription card */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`${isDark ? 'glass-card' : 'glass-card-light'} rounded-3xl p-5 mt-4`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[15px]">
            👑
          </span>
          <span
            className={`text-[15px] font-semibold ${
              isDark ? 'text-white/90' : 'text-gray-800'
            }`}
          >
            My Subscription
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="ml-1">
                  <Info
                    className={`w-4 h-4 ${
                      isDark ? 'text-white/30' : 'text-gray-400'
                    } hover:opacity-80 transition-opacity`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className={`max-w-[220px] text-[13px] leading-snug ${
                  isDark
                    ? 'bg-[#1a2a44] text-white/80 border border-white/10'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                Your plan determines how many AI analyses you can run per day
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Plan pill badge */}
          <span
            className={`ml-auto text-[11px] font-medium px-2.5 py-1 rounded-full ${
              isDark
                ? 'bg-white/5 text-white/50 border border-white/10'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            {planName}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div
            className={`w-full h-2.5 rounded-full overflow-hidden ${
              isDark ? 'bg-white/5' : 'bg-gray-200'
            }`}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(135deg, #057D9F, #03436A)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span
              className={`text-[13px] ${
                isDark ? 'text-white/50' : 'text-gray-500'
              }`}
            >
              {usedGenerations} of {totalGenerations} generations used
            </span>
            <span
              className={`text-[13px] font-medium ${
                isDark ? 'text-white/50' : 'text-gray-500'
              }`}
            >
              {remaining} / {totalGenerations} remaining
            </span>
          </div>
        </div>

        {/* Upgrade CTA */}
        <button
          type="button"
          className="w-full rounded-2xl py-3.5 text-white font-semibold text-[15px] transition-all duration-200 active:scale-[0.97] hover:brightness-110 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #057D9F, #03436A)',
          }}
        >
          Upgrade to Premium
        </button>
      </motion.div>

      {/* Balance card */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`${isDark ? 'glass-card' : 'glass-card-light'} rounded-3xl p-5 mt-4`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[15px]">
            💰
          </span>
          <span
            className={`text-[15px] font-semibold ${
              isDark ? 'text-white/90' : 'text-gray-800'
            }`}
          >
            Balance
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span
              className={`text-3xl font-extrabold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {balance}
            </span>
            <p
              className={`text-[13px] mt-1 ${
                isDark ? 'text-white/40' : 'text-gray-400'
              }`}
            >
              Top up to trade more
            </p>
          </div>

          <button
            type="button"
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 active:scale-[0.97] cursor-pointer ${
              isDark
                ? 'border border-phantom-primary/30 text-phantom-primary-light hover:bg-phantom-primary/10'
                : 'border border-teal-300/40 text-teal-600 hover:bg-teal-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Funds
          </button>
        </div>
      </motion.div>

      {/* Generations card */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`${isDark ? 'glass-card' : 'glass-card-light'} rounded-3xl p-5 mt-4`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[15px]">
            ⚡
          </span>
          <span
            className={`text-[15px] font-semibold ${
              isDark ? 'text-white/90' : 'text-gray-800'
            }`}
          >
            AI Generations
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="ml-1">
                  <Info
                    className={`w-4 h-4 ${
                      isDark ? 'text-white/30' : 'text-gray-400'
                    } hover:opacity-80 transition-opacity`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className={`max-w-[220px] text-[13px] leading-snug ${
                  isDark
                    ? 'bg-[#1a2a44] text-white/80 border border-white/10'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                Each Phantom Vision analysis uses one generation
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-5">
          {/* Circular progress indicator */}
          <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="-rotate-90"
            >
              {/* Track */}
              <circle
                cx="32"
                cy="32"
                r={circleRadius}
                fill="none"
                strokeWidth="5"
                className={isDark ? 'stroke-white/5' : 'stroke-gray-200'}
              />
              {/* Progress */}
              <circle
                cx="32"
                cy="32"
                r={circleRadius}
                fill="none"
                stroke="#39AECF"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap
                className="w-5 h-5"
                style={{ color: '#39AECF' }}
              />
            </div>
          </div>

          {/* Count display */}
          <div className="flex flex-col gap-1">
            <span
              className={`text-2xl font-extrabold leading-tight ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {usedGenerations} / {totalGenerations}
            </span>
            <span
              className={`text-[13px] ${
                isDark ? 'text-white/40' : 'text-gray-400'
              }`}
            >
              Resets daily at midnight
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}