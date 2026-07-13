'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, Star, Settings, ChevronRight, Crown, Zap, ShieldCheck, User } from 'lucide-react';

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
  isDark?: boolean;
}

const items = [
  { icon: Bell, label: 'Notifications', badge: '3', darkColor: 'text-blue-400', lightColor: 'text-blue-600' },
  { icon: Star, label: 'Watchlist', badge: null, darkColor: 'text-emerald-400', lightColor: 'text-emerald-600' },
  { icon: Settings, label: 'Settings', badge: null, darkColor: 'text-gray-400', lightColor: 'text-gray-500' },
];

export default function ProfileMenu({ user, isOpen, onClose, isDark = true }: ProfileMenuProps) {
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
            <div className={`backdrop-blur-2xl border shadow-xl transition-colors duration-300 ${
              isDark
                ? 'bg-[#0D0D24]/95 border-white/[0.1] shadow-[0_8px_40px_rgba(0,0,0,0.5)]'
                : 'bg-white/95 border-gray-200 shadow-[0_8px_40px_rgba(0,0,0,0.1)]'
            }`}>
              {/* User row */}
              <div className={`flex items-center gap-3 p-3.5 border-b transition-colors duration-300 ${
                isDark ? 'border-white/[0.06]' : 'border-gray-100'
              }`}>
                <div className={`w-10 h-10 rounded-full p-[1.5px] flex-shrink-0 transition-colors duration-300 ${
                  isDark
                    ? 'bg-gradient-to-br from-phantom-primary via-phantom-secondary-a to-phantom-secondary-b'
                    : 'bg-gradient-to-br from-blue-400 via-purple-400 to-emerald-400'
                }`}>
                  <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-colors duration-300 ${
                    isDark ? 'bg-phantom-dark' : 'bg-white'
                  }`}>
                    {user?.photo_url ? (
                      <img src={user.photo_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className={`text-sm font-bold gradient-text`}>{initials}</span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {displayName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {user?.isAuthorized ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        <span className={`text-[10px] font-medium transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                          Telegram
                        </span>
                      </>
                    ) : (
                      <>
                        <User className={`w-3 h-3 transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-[10px] font-medium transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
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
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors group ${
                      isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 transition-colors duration-300 ${isDark ? item.darkColor : item.lightColor}`} />
                      <span className={`text-[13px] font-medium transition-colors duration-300 ${
                        isDark ? 'text-white/70 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                      }`}>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors duration-300 ${
                        isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
                      }`}>{item.badge}</span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 transition-colors duration-300 ${isDark ? 'text-white/10' : 'text-gray-300'}`} />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Logout */}
              <div className={`border-t py-1.5 transition-colors duration-300 ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                <motion.button
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.12, duration: 0.2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 transition-colors group ${
                    isDark ? 'hover:bg-red-500/5' : 'hover:bg-red-50'
                  }`}
                >
                  <LogOut className={`w-4 h-4 transition-colors duration-300 ${isDark ? 'text-red-400/50 group-hover:text-red-400' : 'text-red-400/50 group-hover:text-red-500'}`} />
                  <span className={`text-[13px] font-medium transition-colors duration-300 ${isDark ? 'text-red-400/50 group-hover:text-red-400' : 'text-red-400/50 group-hover:text-red-500'}`}>Log out</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}