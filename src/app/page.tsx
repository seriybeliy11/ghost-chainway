'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { TrendingUp, Zap, RefreshCw } from 'lucide-react';
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
}

export default function Home() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGhostLoader, setShowGhostLoader] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PolymarketEvent | null>(null);

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
          });
        }
      } catch {
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
          setTimeout(() => setShowGhostLoader(false), 300);
        }
      }, 1200);
    }
  }, []);

  useEffect(() => {
    fetchEvents(true);
  }, [fetchEvents]);

  const handleRefresh = () => {
    if (isRefreshing) return;
    fetchEvents(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-phantom-dark relative">
      {/* Background ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-phantom-primary/6 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 -right-32 w-48 h-48 bg-phantom-secondary-a/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-phantom-secondary-b/3 rounded-full blur-[140px]" />
      </div>

      {/* Ghost particles */}
      <GhostParticles />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <ProfileHeader
          user={user}
          isLoading={!user}
          onMenuOpen={() => setIsMenuOpen(true)}
        />

        <div className="flex-1 px-5 pt-4 pb-24">
          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-5"
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
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center w-9 h-9 rounded-xl glass-card transition-colors hover:bg-white/[0.06] disabled:opacity-50"
              aria-label="Refresh markets"
            >
              <RefreshCw className={`w-4 h-4 text-phantom-text-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </motion.div>

          {/* Loading or Events */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="space-y-6"
              >
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
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={index}
                      onClick={() => setSelectedEvent(event)}
                    />
                  ))}
                </div>

                {events.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center gap-2 pt-8 pb-4"
                  >
                    <GhostIcon className="text-phantom-primary/20" size={18} />
                    <p className="text-[11px] text-phantom-text-secondary/40">
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
          className="mt-auto px-5 py-3.5 border-t border-white/[0.04] bg-phantom-dark/70 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GhostIcon className="text-phantom-primary/30" size={14} />
              <span className="text-[10px] font-medium text-phantom-text-secondary/30">Phantom</span>
            </div>
            <span className="text-[10px] text-phantom-text-secondary/25">Powered by Polymarket</span>
          </div>
        </motion.footer>
      </div>

      {/* Overlays */}
      <ProfileMenu user={user} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <RefreshModal isOpen={isRefreshing && !isLoading} />
      <EventModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} />
    </main>
  );
}