'use client';

import { useState, useEffect, useRef, useCallback, useContext, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Info, TrendingUp, X, Ghost } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import GhostIcon from '@/components/phantom/GhostIcon';
import BottomNavigation, { type TabId } from '@/components/phantom/BottomNavigation';
import EventCarousel from '@/components/phantom/EventCarousel';
import EventCard from '@/components/phantom/EventCard';
import type { PolymarketEvent } from '@/components/phantom/EventCard';
import SkeletonCard from '@/components/phantom/SkeletonCard';
import EventModal from '@/components/phantom/EventModal';
import TradersList from '@/components/phantom/TradersList';
import ProfileView from '@/components/phantom/ProfileView';
import PhantomsView from '@/components/phantom/PhantomsView';
import AboutScreen from '@/components/phantom/AboutScreen';
import PhantomVisionView from '@/components/phantom/PhantomVisionView';
import { UserContext } from '@/lib/user-context';
import { useTelegramSDK } from '@/lib/telegram-sdk';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  isAuthorized: boolean;
  referrerCode?: string;
  planType?: string;
  generationsLeft?: number;
}

// Wrapper with Suspense boundary for useSearchParams
function HomePage() {
  const searchParams = useSearchParams();
  return <HomeContent searchParams={searchParams} />;
}

function HomeContent({ searchParams }: { searchParams: ReturnType<typeof useSearchParams> }) {
  const { user: contextUser, setUser: setContextUser } = useContext(UserContext);
  const tgSDK = useTelegramSDK();
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<PolymarketEvent | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [visionEvent, setVisionEvent] = useState<PolymarketEvent | null>(null);

  // Sync context user (from session cookie) into local state
  useEffect(() => {
    if (contextUser && !user?.isAuthorized) {
      setUser(contextUser as TelegramUser);
    }
  }, [contextUser, user?.isAuthorized]);

  // Auto-authorize via Telegram WebApp SDK (Mini App mode)
  useEffect(() => {
    if (user?.isAuthorized) return;
    if (!tgSDK.isInTelegram || !tgSDK.user) return;

    setUser({
      id: tgSDK.user.id,
      first_name: tgSDK.user.first_name,
      last_name: tgSDK.user.last_name,
      username: tgSDK.user.username,
      photo_url: tgSDK.user.photo_url,
      isAuthorized: true,
      language_code: tgSDK.user.language_code,
    });
    setContextUser({
      id: tgSDK.user.id,
      first_name: tgSDK.user.first_name,
      last_name: tgSDK.user.last_name,
      username: tgSDK.user.username,
      photo_url: tgSDK.user.photo_url,
      isAuthorized: true,
      language_code: tgSDK.user.language_code,
    });
  }, [tgSDK.user, tgSDK.isInTelegram, user?.isAuthorized, setContextUser]);

  // Store referral code from URL for later use during signup
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      sessionStorage.setItem('phantom_ref', ref);
    }
  }, [searchParams]);

  const updateUser = useCallback((u: TelegramUser | null) => {
    setUser(u);
    setContextUser(u);
  }, [setContextUser]);

  // Handle Telegram Login Widget callback (URL params from redirect, web-only)
  useEffect(() => {
    if (tgSDK.isInTelegram) return; // Skip in Mini App — SDK handles auth
    const authStatus = searchParams.get('auth');
    if (authStatus === 'success') {
      const tid = searchParams.get('tid');
      const fn = searchParams.get('fn');
      const ln = searchParams.get('ln');
      const un = searchParams.get('un');
      const pp = searchParams.get('pp');
      const rc = searchParams.get('rc');
      const gl = searchParams.get('gl');
      const pt = searchParams.get('pt');

      if (tid) {
        const newUser: TelegramUser = {
          id: parseInt(tid, 10),
          first_name: decodeURIComponent(fn || 'User'),
          last_name: ln ? decodeURIComponent(ln) : undefined,
          username: un ? decodeURIComponent(un) : undefined,
          photo_url: pp ? decodeURIComponent(pp) : undefined,
          isAuthorized: true,
          referrerCode: rc || undefined,
          planType: pt || undefined,
          generationsLeft: gl ? parseInt(gl, 10) : undefined,
        };
        updateUser(newUser);
        window.history.replaceState({}, '', '/');
      }
    }
  }, [searchParams, updateUser, tgSDK.isInTelegram]);

  const fetchEventsRef = useRef<() => Promise<void>>();

  const fetchEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const res = await fetch('/api/polymarket');
      const data = await res.json();
      if (data.events?.length > 0) setEvents(data.events);
    } catch { /* keep existing */ }
    finally { setTimeout(() => setIsLoadingEvents(false), 300); }
  }, []);

  fetchEventsRef.current = fetchEvents;
  useEffect(() => { fetchEventsRef.current?.(); }, []);

  const filteredEvents = searchQuery.trim()
    ? events.filter(e =>
        e.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;
  const featuredEvents = filteredEvents.slice(0, 4);
  const otherEvents = filteredEvents.slice(4);

  return (
    <TooltipProvider delayDuration={300}>
      <main className="flex flex-col bg-phantom-dark relative min-h-screen">
        {/* Background ambient glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[120px] bg-phantom-primary/6" />
          <div className="absolute top-1/4 -right-32 w-48 h-48 rounded-full blur-[100px] bg-phantom-secondary-a/5" />
          <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full blur-[140px] bg-phantom-secondary-b/3" />
        </div>

        <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
          {/* Search bar */}
          <div className="shrink-0 px-4 pt-4 pb-3 backdrop-blur-2xl border-b border-white/[0.06] bg-[#0A1628]/80">
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 flex items-center rounded-2xl bg-white/[0.06] border border-white/[0.08] focus-within:border-phantom-primary/40">
                <Search className={`w-4 h-4 ml-3.5 shrink-0 ${
                  searchQuery ? 'text-phantom-primary' : 'text-white/25'
                }`} />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent py-2.5 pl-2.5 pr-3 text-[14px] placeholder:font-normal outline-none text-white placeholder:text-white/25"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mr-2 shrink-0 p-0.5 rounded-full hover:bg-white/10 text-white/30 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* About button */}
              <button
                onClick={() => setIsAboutOpen(true)}
                className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center bg-white/[0.06] border border-white/[0.08] text-white/30 hover:text-phantom-primary hover:border-phantom-primary/30 transition-all duration-200 active:scale-90 cursor-pointer"
              >
                <Ghost className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="pb-24">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {isLoadingEvents ? (
                      <div className="px-5 pt-4 space-y-5">
                        <div className="space-y-3">
                          <div className="h-5 w-36 rounded-lg skeleton-shimmer bg-white/5" />
                          <div className="flex gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-[85%] h-[220px] rounded-3xl skeleton-shimmer bg-white/[0.03] border border-white/[0.05]" />
                            <div className="flex-shrink-0 w-[85%] h-[220px] rounded-3xl skeleton-shimmer bg-white/[0.03] border border-white/[0.05]" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-5 w-40 rounded-lg skeleton-shimmer bg-white/5" />
                          {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonCard key={i} index={i} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 pt-4">
                        {featuredEvents.length > 0 && (
                          <div className="section-fade-in" style={{ animationDelay: '0.05s' }}>
                            <EventCarousel
                              events={featuredEvents}
                              onEventClick={setSelectedEvent}
                            />
                          </div>
                        )}

                        {otherEvents.length > 0 && (
                          <section className="mb-6 section-fade-in" style={{ animationDelay: '0.15s' }}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-phantom-primary-light" />
                                <h2 className="text-[16px] font-bold text-white">More Markets</h2>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 text-white/30">
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-[220px] text-[13px] bg-[#0F1E33] text-gray-200 border-white/10">
                                  Active markets sorted by 24h volume
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="space-y-3">
                              {otherEvents.map((event, index) => (
                                <div key={event.id} className="card-2d-enter" style={{ animationDelay: `${index * 60}ms` }}>
                                  <EventCard event={event} index={index} onClick={() => setSelectedEvent(event)} />
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {events.length > 0 && (
                          <div className="flex flex-col items-center gap-1.5 pt-3 pb-4">
                            <GhostIcon className="text-phantom-primary/20" size={16} />
                            <p className="text-[13px] text-white/30">You&apos;re all caught up</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'traders' && (
                  <motion.div
                    key="traders"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <TradersList />
                  </motion.div>
                )}

                {activeTab === 'phantoms' && (
                  <motion.div
                    key="phantoms"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <PhantomsView user={user} />
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProfileView user={user} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <footer className="shrink-0 px-5 py-2.5 border-t backdrop-blur-xl border-white/[0.04] bg-phantom-dark/70">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsAboutOpen(true)}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <GhostIcon className="text-phantom-primary/30" size={12} />
                <span className="text-[10px] font-medium text-phantom-text-secondary/30 hover:text-phantom-text-secondary/50 transition-colors">Phantom</span>
              </button>
              <span className="text-[10px] text-phantom-text-secondary/25">Powered by Polymarket</span>
            </div>
          </footer>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Event Modal */}
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onPhantomVision={() => {
            if (selectedEvent) {
              setVisionEvent(selectedEvent);
              setSelectedEvent(null);
            }
          }}
        />

        {/* Phantom Vision */}
        <PhantomVisionView
          isOpen={!!visionEvent}
          event={visionEvent}
          onClose={() => setVisionEvent(null)}
        />

        {/* About Screen */}
        <AboutScreen isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </main>
    </TooltipProvider>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}