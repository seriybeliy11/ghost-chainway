'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { RefreshCw, Search, Info, TrendingUp, X, Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import ProfileMenu from '@/components/phantom/ProfileMenu';
import Onboarding from '@/components/phantom/Onboarding';
import GhostIcon from '@/components/phantom/GhostIcon';
import BottomNavigation, { type TabId } from '@/components/phantom/BottomNavigation';
import EventCarousel from '@/components/phantom/EventCarousel';
import EventCard from '@/components/phantom/EventCard';
import type { PolymarketEvent } from '@/components/phantom/EventCard';
import SkeletonCard from '@/components/phantom/SkeletonCard';
import EventModal from '@/components/phantom/EventModal';
import PhantomVisionView from '@/components/phantom/PhantomVisionView';
import TradersList from '@/components/phantom/TradersList';
import TraderDetailModal from '@/components/phantom/TraderDetailModal';
import ProfileView from '@/components/phantom/ProfileView';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  isAuthorized: boolean;
}

// TMA Viewport state
let tmaViewportHeight: number | null = null;

export default function Home() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedTraderId, setSelectedTraderId] = useState<string | null>(null);
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<PolymarketEvent | null>(null);
  const [visionEvent, setVisionEvent] = useState<PolymarketEvent | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // TMA Viewport height
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ── TMA SDK: Viewport + ThemeParams ──
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const [sdkModule] = await Promise.all([
          import('@tma.js/sdk'),
        ]);

        const { retrieveLaunchParams, viewport, themeParams } = sdkModule;

        // Initialize viewport
        if (viewport) {
          viewport.expand();
          tmaViewportHeight = viewport.height;

          const onViewportChanged = () => {
            const h = viewport.height;
            tmaViewportHeight = h;
            setViewportHeight(h);
            // Apply dynamic height to CSS variable
            document.documentElement.style.setProperty('--tma-viewport-height', `${h}px`);
          };
          viewport.on('viewportChanged', onViewportChanged);
          onViewportChanged(); // initial

          cleanup = () => {
            viewport.off('viewportChanged', onViewportChanged);
          };
        }

        // ThemeParams → CSS variables
        if (themeParams) {
          const tp = themeParams;
          const colorMap: [string, string][] = [
            ['--tma-bg-color', tp.bgColor],
            ['--tma-text-color', tp.textColor],
            ['--tma-hint-color', tp.hintColor],
            ['--tma-link-color', tp.linkColor],
            ['--tma-button-color', tp.buttonColor],
            ['--tma-button-text-color', tp.buttonTextColor],
            ['--tma-secondary-bg-color', tp.secondaryBgColor],
          ];
          colorMap.forEach(([cssVar, val]) => {
            if (val) {
              document.documentElement.style.setProperty(cssVar, val);
            }
          });
        }
      } catch {
        // Not in Telegram — fallback
      }
    })();

    return () => { cleanup?.(); };
  }, []);

  // ── Onboarding ──
  useEffect(() => {
    if (!mounted) return;
    const done = localStorage.getItem('phantom_onboarding_done');
    if (!done) setShowOnboarding(true);
  }, [mounted]);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('phantom_onboarding_done', 'true');
    setShowOnboarding(false);
  }, []);

  // ── Telegram Auth ──
  useEffect(() => {
    const initTelegram = async () => {
      try {
        const { retrieveLaunchParams } = await import('@tma.js/sdk');
        const lp = retrieveLaunchParams();
        if (lp.initData?.user) {
          const u = lp.initData.user;
          setUser({
            id: u.id,
            first_name: u.firstName,
            last_name: u.lastName || undefined,
            username: u.username || undefined,
            photo_url: u.photoUrl || undefined,
            language_code: u.languageCode || undefined,
            isAuthorized: true,
          });
          // Persist to DB
          fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramId: u.id,
              username: u.username,
              firstName: u.firstName,
              lastName: u.lastName,
              photoUrl: u.photoUrl,
              languageCode: u.languageCode,
              isAuthorized: true,
              initDataRaw: JSON.stringify(lp.initData),
            }),
          }).catch(() => {});
          return;
        }
      } catch { /* not Telegram */ }
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

  // ── Fetch Events ──
  const fetchEventsRef = useRef<(showSkeleton?: boolean) => Promise<void>>();

  const fetchEvents = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setIsLoadingEvents(true);
    try {
      const res = await fetch('/api/polymarket');
      const data = await res.json();
      if (data.events?.length > 0) setEvents(data.events);
    } catch { /* keep existing */ }
    finally { setTimeout(() => setIsLoadingEvents(false), 400); }
  }, []);

  fetchEventsRef.current = fetchEvents;

  useEffect(() => { fetchEventsRef.current?.(true); }, []);

  const filteredEvents = searchQuery.trim()
    ? events.filter(e =>
        e.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;
  const featuredEvents = filteredEvents.slice(0, 4);
  const otherEvents = filteredEvents.slice(4);

  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    Promise.all([
      fetchEventsRef.current?.(false),
      new Promise(r => setTimeout(r, 800)),
    ]).finally(() => { setRefreshKey(k => k + 1); setIsRefreshing(false); });
  }, [isRefreshing]);

  // ── Pull-to-refresh ──
  const pullStartY = useRef(0);
  const pullDistance = useRef(0);
  const isPulling = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = scrollContainerRef.current?.scrollTop ?? 0;
    if (scrollTop <= 0) {
      pullStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0) {
      pullDistance.current = Math.min(delta * 0.4, 80);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance.current > 50 && !isRefreshing) {
      handleRefresh();
    }
    pullDistance.current = 0;
    isPulling.current = false;
  }, [isRefreshing, handleRefresh]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const isDark = theme === 'dark';

  const handleTraderClick = useCallback((traderId: string) => {
    setSelectedTraderId(traderId);
  }, []);

  const isOverview = activeTab === 'overview';

  // Dynamic container style for TMA viewport
  const containerStyle = viewportHeight
    ? { maxHeight: `${viewportHeight - 56}px`, minHeight: '100px' }
    : {};

  return (
    <TooltipProvider delayDuration={300}>
      <main
        className={`flex flex-col transition-colors duration-500 ${isDark ? 'bg-phantom-dark' : 'bg-gray-50'} relative`}
        style={viewportHeight ? { height: `${viewportHeight}px` } : { minHeight: '100vh' }}
      >
        {/* Background ambient glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[120px] transition-colors duration-500 ${isDark ? 'bg-phantom-primary/6' : 'bg-teal-200/30'}`} />
          <div className={`absolute top-1/4 -right-32 w-48 h-48 rounded-full blur-[100px] transition-colors duration-500 ${isDark ? 'bg-phantom-secondary-a/5' : 'bg-cyan-200/25'}`} />
          <div className={`absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full blur-[140px] transition-colors duration-500 ${isDark ? 'bg-phantom-secondary-b/3' : 'bg-cyan-200/20'}`} />
        </div>

        <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
          {/* Search bar — replaces header */}
          <div
            className={`shrink-0 px-4 pt-4 pb-3 backdrop-blur-2xl border-b transition-all duration-300 ${
              isDark
                ? 'border-white/[0.06] bg-[#0A1628]/80'
                : 'border-gray-200/80 bg-white/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`relative flex-1 flex items-center rounded-2xl transition-all duration-200 ${
                isDark
                  ? 'bg-white/[0.06] border border-white/[0.08] focus-within:border-phantom-primary/40'
                  : 'bg-gray-100 border border-gray-200 focus-within:border-teal-400/50'
              }`}>
                <Search className={`w-4 h-4 ml-3.5 shrink-0 transition-colors duration-200 ${
                  searchQuery
                    ? (isDark ? 'text-phantom-primary' : 'text-teal-600')
                    : (isDark ? 'text-white/25' : 'text-gray-400')
                }`} />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`flex-1 bg-transparent py-2.5 pl-2.5 pr-3 text-[14px] placeholder:font-normal outline-none transition-colors duration-200 ${
                    isDark
                      ? 'text-white placeholder:text-white/25'
                      : 'text-gray-900 placeholder:text-gray-400'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`mr-2 shrink-0 p-0.5 rounded-full transition-colors ${
                      isDark ? 'hover:bg-white/10 text-white/30' : 'hover:bg-gray-200 text-gray-400'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {mounted && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleTheme}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 active:scale-90 shrink-0 ${
                        isDark ? 'glass-card' : 'glass-card-light'
                      }`}
                      aria-label="Toggle theme"
                    >
                      {isDark
                        ? <Sun className="w-4 h-4 text-amber-400" />
                        : <Moon className="w-4 h-4 text-teal-600" />
                      }
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className={`text-[13px] ${isDark ? 'bg-[#0F1E33] text-gray-200 border-white/10' : 'bg-white text-gray-700 border-gray-200'}`}>
                    Switch between light and dark themes ✨
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Pull-to-refresh indicator */}
          {isRefreshing && (
            <div className="flex justify-center py-2">
              <RefreshCw className="w-5 h-5 text-phantom-primary animate-spin" />
            </div>
          )}

          {/* Tab content — scrollable */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={containerStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
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
                    {/* Events carousel */}
                    {isLoadingEvents ? (
                      <div className="px-5 pt-4 space-y-5">
                        <div className="space-y-3">
                          <div className={`h-5 w-36 rounded-lg skeleton-shimmer ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                          <div className="flex gap-3 overflow-hidden">
                            <div className={`flex-shrink-0 w-[85%] h-[220px] rounded-3xl skeleton-shimmer ${isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-gray-100 border border-gray-200'}`} />
                            <div className={`flex-shrink-0 w-[85%] h-[220px] rounded-3xl skeleton-shimmer ${isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-gray-100 border border-gray-200'}`} />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className={`h-5 w-40 rounded-lg skeleton-shimmer ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                          {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonCard key={i} index={i} isDark={isDark} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 pt-4">
                        {/* Featured carousel */}
                        {featuredEvents.length > 0 && (
                          <div className="section-fade-in" style={{ animationDelay: '0.05s' }}>
                            <EventCarousel
                              events={featuredEvents}
                              onEventClick={setSelectedEvent}
                              isDark={isDark}
                            />
                          </div>
                        )}

                        {/* Other events */}
                        {otherEvents.length > 0 && (
                          <section className="mb-6 section-fade-in" style={{ animationDelay: '0.15s' }}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp className={`w-4 h-4 ${isDark ? 'text-phantom-primary-light' : 'text-teal-600'}`} />
                                <h2 className={`text-[16px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>More Markets</h2>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/10 text-white/30' : 'hover:bg-gray-100 text-gray-400'}`}>
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className={`max-w-[220px] text-[13px] ${isDark ? 'bg-[#0F1E33] text-gray-200 border-white/10' : 'bg-white text-gray-700 border-gray-200'}`}>
                                  Other active markets sorted by 24h volume ✅
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="space-y-3">
                              {otherEvents.map((event, index) => (
                                <div key={event.id} className="card-2d-enter" style={{ animationDelay: `${index * 60}ms` }}>
                                  <EventCard event={event} index={index} onClick={() => setSelectedEvent(event)} isDark={isDark} />
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* End indicator */}
                        {events.length > 0 && (
                          <div className="flex flex-col items-center gap-1.5 pt-3 pb-4">
                            <GhostIcon className={`${isDark ? 'text-phantom-primary/20' : 'text-gray-400/40'}`} size={16} />
                            <p className={`text-[13px] ${isDark ? 'text-white/30' : 'text-gray-400/60'}`}>You&apos;re all caught up ✅</p>
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
                    <TradersList
                      key={refreshKey}
                      onTraderClick={handleTraderClick}
                      isDark={isDark}
                    />
                  </motion.div>
                )}
                {activeTab === 'activity' && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center justify-center px-6 py-20"
                  >
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${isDark ? 'bg-white/[0.05]' : 'bg-gray-100'}`}>
                      <Search className={`w-7 h-7 ${isDark ? 'text-white/20' : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`text-[16px] font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Activity Feed</h3>
                    <p className={`text-[15px] text-center max-w-[260px] ${isDark ? 'text-white/35' : 'text-gray-500'}`}>
                      Your recent trades and market movements will appear here soon ⏳
                    </p>
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
                    <ProfileView user={user} isDark={isDark} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Minimal footer */}
          <footer
            className={`shrink-0 px-5 py-2.5 border-t backdrop-blur-xl transition-colors duration-500 ${
              isDark ? 'border-white/[0.04] bg-phantom-dark/70' : 'border-gray-200 bg-white/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <GhostIcon className={`${isDark ? 'text-phantom-primary/30' : 'text-gray-400/40'}`} size={12} />
                <span className={`text-[10px] font-medium ${isDark ? 'text-phantom-text-secondary/30' : 'text-gray-400/50'}`}>Phantom</span>
              </div>
              <span className={`text-[10px] ${isDark ? 'text-phantom-text-secondary/25' : 'text-gray-400/40'}`}>Powered by Polymarket</span>
            </div>
          </footer>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} isDark={isDark} />

        {/* Overlays */}
        <ProfileMenu user={user} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} isDark={isDark} />
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onPhantomVision={selectedEvent ? () => setVisionEvent(selectedEvent) : undefined}
          isDark={isDark}
        />
        <TraderDetailModal
          traderId={selectedTraderId}
          isOpen={!!selectedTraderId}
          onClose={() => setSelectedTraderId(null)}
          isDark={isDark}
        />
        <PhantomVisionView
          event={visionEvent}
          isOpen={!!visionEvent}
          onClose={() => setVisionEvent(null)}
        />

        {/* Onboarding */}
        <AnimatePresence>
          {showOnboarding && (
            <Onboarding onComplete={completeOnboarding} telegramUser={user} />
          )}
        </AnimatePresence>
      </main>
    </TooltipProvider>
  );
}