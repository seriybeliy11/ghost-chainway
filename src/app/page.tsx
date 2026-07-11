'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { TrendingUp, Zap, RefreshCw, Sun, Moon } from 'lucide-react';
import ProfileHeader from '@/components/phantom/ProfileHeader';
import GhostParticles from '@/components/phantom/GhostParticles';
import ProfileMenu from '@/components/phantom/ProfileMenu';
import RefreshModal from '@/components/phantom/RefreshModal';
import EventModal from '@/components/phantom/EventModal';
import EventCard from '@/components/phantom/EventCard';
import type { PolymarketEvent } from '@/components/phantom/EventCard';
import SkeletonCard from '@/components/phantom/SkeletonCard';
import GhostIcon from '@/components/phantom/GhostIcon';

const Ghost3D = dynamic(() => import('@/components/phantom/Ghost3D'), {
  ssr: false,
  loading: () => <div className="w-full h-48 md:h-64" />,
});

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  isAuthorized: boolean;
}

export default function Home() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGhostLoader, setShowGhostLoader] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PolymarketEvent | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchEventsRef = useRef<(showSkeleton?: boolean) => Promise<void>>();

  const fetchEvents = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) {
      setIsLoading(true);
      setShowGhostLoader(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch('/api/polymarket');
      const data = await response.json();
      if (data.events && data.events.length > 0) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setIsRefreshing(false);
        if (showSkeleton) {
          setTimeout(() => setShowGhostLoader(false), 200);
        }
      }, 1000);
    }
  }, []);

  fetchEventsRef.current = fetchEvents;

  useEffect(() => {
    fetchEventsRef.current?.(true);
  }, []);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        const { retrieveLaunchParams } = await import('@tma.js/sdk');
        const launchParams = retrieveLaunchParams();
        if (launchParams.initData?.user) {
          const tgUser = launchParams.initData.user;
          setUser({
            id: tgUser.id,
            first_name: tgUser.firstName,
            last_name: tgUser.lastName || undefined,
            username: tgUser.username || undefined,
            photo_url: tgUser.photoUrl || undefined,
            language_code: tgUser.languageCode || undefined,
            isAuthorized: true,
          });
          return;
        }
      } catch {
        // Not in Telegram environment
      }
      // Fallback user for dev preview
      setUser({
        id: 123456789,
        first_name: 'Alex',
        last_name: 'Phantom',
        username: 'alex_phantom',
        photo_url: '',
        language_code: 'en',
        isAuthorized: false,
      });
    };
    initTelegram();
  }, []);

  const handleRefresh = () => {
    if (isRefreshing) return;
    fetchEventsRef.current?.(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <main className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'bg-phantom-dark' : 'bg-gray-50'} relative`}>
      {/* Background ambient glows — static */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[120px] transition-colors duration-500 ${isDark ? 'bg-phantom-primary/6' : 'bg-blue-200/30'}`} />
        <div className={`absolute top-1/4 -right-32 w-48 h-48 rounded-full blur-[100px] transition-colors duration-500 ${isDark ? 'bg-phantom-secondary-a/5' : 'bg-purple-200/25'}`} />
        <div className={`absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full blur-[140px] transition-colors duration-500 ${isDark ? 'bg-phantom-secondary-b/3' : 'bg-emerald-200/20'}`} />
      </div>

      {/* Ghost particles */}
      <GhostParticles isDark={isDark} />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <ProfileHeader
          user={user}
          isLoading={!user}
          onMenuOpen={() => setIsMenuOpen(true)}
          isDark={isDark}
        />

        <div className="flex-1 px-5 pt-4 pb-24">
          {/* Stats bar — CSS animation instead of framer-motion */}
          <div
            className="flex items-center gap-3 mb-5 animate-[fadeInUp_0.5s_ease_0.1s_both]"
          >
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors duration-500 ${isDark ? 'glass-card' : 'glass-card-light'}`}>
              <TrendingUp className={`w-3.5 h-3.5 ${isDark ? 'text-phantom-secondary-b' : 'text-emerald-600'}`} />
              <span className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Live</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors duration-500 ${isDark ? 'glass-card' : 'glass-card-light'}`}>
              <Zap className={`w-3.5 h-3.5 ${isDark ? 'text-phantom-primary-light' : 'text-blue-600'}`} />
              <span className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Top Volume</span>
            </div>
            <div className="flex-1" />

            {/* Theme toggle — simple CSS transition */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 ${
                  isDark ? 'glass-card hover:bg-white/[0.06]' : 'glass-card-light hover:bg-black/[0.04]'
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 disabled:opacity-50 ${
                isDark ? 'glass-card hover:bg-white/[0.06]' : 'glass-card-light hover:bg-black/[0.04]'
              }`}
              aria-label="Refresh markets"
            >
              <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isDark ? 'text-phantom-text-secondary' : 'text-gray-500'} ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Loading or Events */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="space-y-6"
              >
                {showGhostLoader && (
                  <div className="flex flex-col items-center gap-3">
                    <Ghost3D />
                    <p
                      className={`text-xs font-medium animate-pulse transition-colors duration-500 ${isDark ? 'text-phantom-text-secondary' : 'text-gray-500'}`}
                    >
                      Scanning the markets...
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCard key={i} index={i} isDark={isDark} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="events"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={index}
                      onClick={() => setSelectedEvent(event)}
                      isDark={isDark}
                    />
                  ))}
                </div>

                {events.length > 0 && (
                  <div
                    className="flex flex-col items-center gap-2 pt-8 pb-4 animate-[fadeIn_0.5s_ease_0.3s_both]"
                  >
                    <GhostIcon className={`transition-colors duration-500 ${isDark ? 'text-phantom-primary/20' : 'text-gray-400/40'}`} size={18} />
                    <p className={`text-[11px] transition-colors duration-500 ${isDark ? 'text-phantom-text-secondary/40' : 'text-gray-400/60'}`}>
                      You&apos;re all caught up
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky footer — CSS animation */}
        <footer
          className={`mt-auto px-5 py-3.5 border-t backdrop-blur-xl transition-colors duration-500 animate-[fadeIn_0.5s_ease_0.6s_both] ${
            isDark ? 'border-white/[0.04] bg-phantom-dark/70' : 'border-gray-200 bg-white/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GhostIcon className={`transition-colors duration-500 ${isDark ? 'text-phantom-primary/30' : 'text-gray-400/40'}`} size={14} />
              <span className={`text-[10px] font-medium transition-colors duration-500 ${isDark ? 'text-phantom-text-secondary/30' : 'text-gray-400/50'}`}>Phantom</span>
            </div>
            <span className={`text-[10px] transition-colors duration-500 ${isDark ? 'text-phantom-text-secondary/25' : 'text-gray-400/40'}`}>Powered by Polymarket</span>
          </div>
        </footer>
      </div>

      {/* Overlays */}
      <ProfileMenu user={user} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} isDark={isDark} />
      <RefreshModal isOpen={isRefreshing && !isLoading} isDark={isDark} />
      <EventModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} isDark={isDark} />
    </main>
  );
}