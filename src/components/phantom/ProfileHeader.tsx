'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, ChevronDown, ShieldCheck } from 'lucide-react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  isAuthorized?: boolean;
}

interface ProfileHeaderProps {
  user: TelegramUser | null;
  isLoading: boolean;
  onMenuOpen: () => void;
  isDark?: boolean;
}

export default function ProfileHeader({ user, isLoading, onMenuOpen, isDark = true }: ProfileHeaderProps) {
  const displayName = user
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : 'Guest';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isPremium = true;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between px-5 pt-4 pb-2 relative z-20"
    >
      {/* Profile section - clickable */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onMenuOpen}
        className="flex items-center gap-3 group"
      >
        <div className="relative">
          <Avatar className={`w-10 h-10 border-2 transition-all duration-300 group-hover:scale-105 ${
            isDark ? 'border-phantom-secondary-b/30 group-hover:border-phantom-secondary-b/60' : 'border-emerald-300/40 group-hover:border-emerald-400/60'
          }`}>
            <AvatarImage src={user?.photo_url} alt={displayName} />
            <AvatarFallback className={`text-xs font-bold transition-colors duration-300 ${
              isDark ? 'bg-phantom-secondary-b/15 text-phantom-secondary-b' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Online dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 transition-colors duration-300 ${
            isDark ? 'bg-phantom-secondary-b border-phantom-dark' : 'bg-emerald-500 border-white'
          }`} />
          {/* Auth indicator */}
          {user?.isAuthorized && (
            <div className="absolute -top-1 -right-1">
              <ShieldCheck className={`w-3.5 h-3.5 transition-colors duration-300 ${
                isDark ? 'text-phantom-secondary-b' : 'text-blue-500'
              }`} />
            </div>
          )}
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <span className={`text-[14px] font-semibold leading-tight transition-colors duration-300 ${
              isDark ? 'text-white/90' : 'text-gray-800'
            }`}>
              {displayName}
            </span>
            <motion.div
              animate={{ rotate: [0, 0] }}
              className="transition-transform duration-300 group-hover:rotate-180"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-colors duration-300 ${isDark ? 'text-phantom-text-secondary' : 'text-gray-400'}`} />
            </motion.div>
          </div>
          <div className="flex items-center gap-1.5">
            {user?.username && (
              <span className={`text-[11px] leading-tight transition-colors duration-300 ${isDark ? 'text-phantom-text-secondary' : 'text-gray-500'}`}>
                @{user.username}
              </span>
            )}
            {!user?.isAuthorized && (
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded transition-colors duration-300 ${
                isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'
              }`}>
                Preview
              </span>
            )}
          </div>
        </div>
      </motion.button>

      {/* Subscription badge */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold
          transition-all duration-300 backdrop-blur-md border
          ${isPremium
            ? (isDark
              ? 'bg-gradient-to-r from-purple-500/15 to-blue-500/15 border-purple-500/25 text-purple-300'
              : 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 text-purple-700')
            : (isDark
              ? 'bg-white/5 border-white/10 text-phantom-text-secondary'
              : 'bg-gray-100 border-gray-200 text-gray-600')
          }
        `}
      >
        {isPremium ? (
          <>
            <Crown className="w-3 h-3" />
            Premium
          </>
        ) : (
          'Free'
        )}
      </motion.div>
    </motion.header>
  );
}