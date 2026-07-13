'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, Star, Settings, ChevronRight, ShieldCheck, User } from 'lucide-react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  isAuthorized?: boolean;
}

interface ProfileMenuProps {
  user: TelegramUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const items = [
  { icon: Bell, label: 'Notifications', badge: '3', color: 'text-blue-400' },
  { icon: Star, label: 'Watchlist', badge: null, color: 'text-emerald-400' },
  { icon: Settings, label: 'Settings', badge: null, color: 'text-gray-400' },
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
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.8 }}
            className="fixed top-16 right-4 z-50 w-60 rounded-2xl overflow-hidden"
          >
            <div className="backdrop-blur-2xl border shadow-xl bg-[#0F1E33]/95 border-white/[0.1] shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
              {/* User row */}
              <div className="flex items-center gap-3 p-3.5 border-b border-white/[0.06]">
                <div className="w-10 h-10 rounded-full p-[1.5px] flex-shrink-0 bg-gradient-to-br from-phantom-primary via-phantom-secondary-a to-phantom-secondary-b">
                  <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-phantom-dark">
                    {user?.photo_url ? (
                      <img src={user.photo_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold gradient-text">{initials}</span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-white">
                    {displayName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {user?.isAuthorized ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-medium text-blue-300">
                          Telegram
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-[10px] font-medium text-gray-500">
                          Preview Mode
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                {items.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.04 * i, duration: 0.2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 transition-colors group hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-[13px] font-medium text-white/70 group-hover:text-white">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{item.badge}</span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-white/10" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Logout */}
              <div className="border-t border-white/[0.06] py-1.5">
                <motion.button
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.12, duration: 0.2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 transition-colors group hover:bg-red-500/5"
                >
                  <LogOut className="w-4 h-4 text-red-400/50 group-hover:text-red-400" />
                  <span className="text-[13px] font-medium text-red-400/50 group-hover:text-red-400">Log out</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}