'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { RefreshCw, TrendingUp, Zap } from 'lucide-react';
import ProfileHeader from '@/components/phantom/ProfileHeader';
import EventCard, { type PolymarketEvent } from '@/components/phantom/EventCard';
import SkeletonCard from '@/components/phantom/SkeletonCard';
import GhostIcon from '@/components/phantom/GhostIcon';

// Dynamic import for Ghost3D to avoid SSR issues with Three.js
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
}

export default function Home() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGhostLoader, setShowGhostLoader] = useState(true);

  // Initialize Telegram WebApp
  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Try to load TMA SDK
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
          });
        }
      } catch {
        // Not in Telegram environment — use mock user for preview
        setUser({
          id: 123456789,
          first_name: 'Alex',
          last_name: 'Phantom',
          username: 'alex_phantom',
          photo_url: '',
          language_code: 'en',
        });
      }
    };

    initTelegram();
  }, []);

  // Fetch Polymarket events
  const fetchEvents = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) {
      setIsLoading(true);
      setShowGhostLoader(showSkeleton);
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
      // Add minimum loading time for smooth UX
      setTimeout(() => {
        setIsLoading(false);
        setIsRefreshing(false);
        if (showSkeleton) {
          // Keep ghost visible briefly then hide
          setTimeout(() => setShowGhostLoader(false), 300);
        }
      }, 800);
    }
  }, []);

  useEffect(() => {
    fetchEvents(true);
  }, [fetchEvents]);

  const handleRefresh = () => {
    fetchEvents(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-phantom-dark relative">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-phantom-primary/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 -right-32 w-48 h-48 bg-phantom-secondary-a/6 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-phantom-secondary-b/4 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Profile header */}
        <ProfileHeader user={user} isLoading={!user} />

        {/* Main content area */}
        <div className="flex-1 px-5 pt-4 pb-24">
          {/* Hero section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <GhostIcon className="text-phantom-primary" size={28} />
              <h1 className="text-2xl font-extrabold gradient-text tracking-tight">
                Phantom
              </h1>
            </div>
            <p className="text-sm text-phantom-text-secondary ml-[38px]">
              Hottest markets on Polymarket right now
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card">
              <TrendingUp className="w-3.5 h-3.5 text-phantom-secondary-b" />
              <span className="text-xs font-semibold text-white/80">Live</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card">
              <Zap className="w-3.5 h-3.5 text-phantom-primary-light" />
              <span className="text-xs font-semibold text-white/80">Top Volume</span>
            </div>
            <div className="flex-1" />
            {/* Refresh button */}
            <motion.button
              whileTap={{ scale: 0.92, rotate: -180 }}
              transition={{ duration: 0.3 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center w-9 h-9 rounded-xl glass-card transition-colors hover:bg-white/[0.06] disabled:opacity-40"
              aria-label="Refresh markets"
            >
              <RefreshCw className={`w-4 h-4 text-phantom-text-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </motion.div>

          {/* Content: Loading or Events */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="space-y-6"
              >
                {/* 3D Ghost during initial load */}
                {showGhostLoader && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center gap-3"
                  >
                    <Ghost3D />
                    <motion.p
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-xs font-medium text-phantom-text-secondary"
                    >
                      Scanning the markets...
                    </motion.p>
                  </motion.div>
                )}

                {/* Skeleton cards */}
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCard key={i} index={i} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="events"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Refreshing overlay indicator */}
                {isRefreshing && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-3 flex items-center justify-center"
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-phantom-primary/10 border border-phantom-primary/20">
                      <RefreshCw className="w-3 h-3 text-phantom-primary animate-spin" />
                      <span className="text-[11px] font-medium text-phantom-primary-light">
                        Refreshing...
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Event cards */}
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                </div>

                {/* End of list */}
                {events.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center gap-2 pt-8 pb-4"
                  >
                    <GhostIcon className="text-phantom-primary/30" size={20} />
                    <p className="text-[11px] text-phantom-text-secondary/50">
                      You&apos;re all caught up
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-auto px-5 py-4 border-t border-white/[0.04] bg-phantom-dark/80 backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GhostIcon className="text-phantom-primary/40" size={16} />
              <span className="text-[11px] font-medium text-phantom-text-secondary/40">
                Phantom
              </span>
            </div>
            <span className="text-[10px] text-phantom-text-secondary/30">
              Powered by Polymarket
            </span>
          </div>
        </motion.footer>
      </div>
    </main>
  );
}