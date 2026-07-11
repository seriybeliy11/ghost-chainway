'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, Star, Settings, ChevronRight, Crown, Zap } from 'lucide-react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface ProfileMenuProps {
  user: TelegramUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const items = [
  { icon: Bell, label: 'Notifications', badge: '3', color: 'text-phantom-primary-light' },
  { icon: Star, label: 'Watchlist', badge: null, color: 'text-phantom-secondary-b' },
  { icon: Settings, label: 'Settings', badge: null, color: 'text-phantom-text-secondary' },
];

export default function ProfileMenu({ user, isOpen, onClose }: ProfileMenuProps) {
  const displayName = user ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : 'Guest';
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-16 right-4 z-50 w-56 rounded-2xl overflow-hidden"
          >
            <div className="bg-[#0D0D24]/95 backdrop-blur-2xl border border-white/[0.1] shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
              {/* User row */}
              <div className="flex items-center gap-3 p-3.5 border-b border-white/[0.06]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-phantom-primary via-phantom-secondary-a to-phantom-secondary-b p-[1.5px] flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-phantom-dark flex items-center justify-center overflow-hidden">
                    {user?.photo_url ? (
                      <img src={user.photo_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold gradient-text">{initials}</span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Crown className="w-3 h-3 text-phantom-secondary-a-light" />
                    <span className="text-[10px] font-medium text-phantom-secondary-a-light">Premium</span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                {items.map((item) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-[13px] font-medium text-white/75 group-hover:text-white transition-colors">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="text-[10px] font-bold bg-phantom-primary/25 text-phantom-primary-light px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-white/15" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Logout */}
              <div className="border-t border-white/[0.06] py-1.5">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-red-500/5 transition-colors group"
                >
                  <LogOut className="w-4 h-4 text-red-400/60 group-hover:text-red-400 transition-colors" />
                  <span className="text-[13px] font-medium text-red-400/60 group-hover:text-red-400 transition-colors">Log out</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}