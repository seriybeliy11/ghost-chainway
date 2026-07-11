'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, ChevronDown } from 'lucide-react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface ProfileHeaderProps {
  user: TelegramUser | null;
  isLoading: boolean;
  onMenuOpen: () => void;
}

export default function ProfileHeader({ user, isLoading, onMenuOpen }: ProfileHeaderProps) {
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
          <Avatar className="w-9 h-9 border-2 border-phantom-primary/30 transition-all duration-300 group-hover:border-phantom-primary/60">
            <AvatarImage src={user?.photo_url} alt={displayName} />
            <AvatarFallback className="bg-phantom-primary/20 text-phantom-primary-light text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Online dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-phantom-secondary-b border-2 border-phantom-dark" />
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-white/90 leading-tight">
              {displayName}
            </span>
            <motion.div
              animate={{ rotate: [0, 0] }}
              className="transition-transform duration-300 group-hover:rotate-180"
            >
              <ChevronDown className="w-3.5 h-3.5 text-phantom-text-secondary" />
            </motion.div>
          </div>
          {user?.username && (
            <span className="text-[11px] text-phantom-text-secondary leading-tight">
              @{user.username}
            </span>
          )}
        </div>
      </motion.button>

      {/* Subscription badge */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold
          transition-all duration-300 backdrop-blur-md
          ${isPremium
            ? 'bg-gradient-to-r from-phantom-secondary-a/20 to-phantom-primary/20 border border-phantom-secondary-a/30 text-phantom-secondary-a-light'
            : 'bg-white/5 border border-white/10 text-phantom-text-secondary'
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