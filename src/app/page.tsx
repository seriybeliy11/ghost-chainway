'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { TrendingUp, Zap, RefreshCw, Sun, Moon, Info, Search, BarChart3, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import ProfileHeader from '@/components/phantom/ProfileHeader';
import ProfileMenu from '@/components/phantom/ProfileMenu';
import EventModal from '@/components/phantom/EventModal';
import EventCard from '@/components/phantom/EventCard';
import type { PolymarketEvent } from '@/components/phantom/EventCard';
import SkeletonCard from '@/components/phantom/SkeletonCard';
import GhostIcon from '@/components/phantom/GhostIcon';
import Onboarding from '@/components/phantom/Onboarding';
import PhantomVisionView from '@/components/phantom/PhantomVisionView';
import EventCarousel from '@/components/phantom/EventCarousel';
import LeaderboardSection from '@/components/phantom/LeaderboardSection';
import BottomNavigation, { type TabId } from '@/components/phantom/BottomNavigation';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  isAuthorized: boolean;
}

// Placeholder views for inactive tabs
function PlaceholderTab({ icon: Icon, title, description, isDark }: { icon: typeof Search; title: string; description: string; isDark: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-colors ${
        isDark ? 'bg-white/[0.05]' : 'bg-gray-100'
      }`}>
        <Icon className={`w-7 h-7 ${isDark ? 'text-white/20' : 'text-gray-400'}`} />
      </div>
      <h3 className={`text-lg font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={`text-sm text-center max-w-[240px] ${isDark ? 'text-white/35' : 'text-gray-500'}`}>{description}</p>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PolymarketEvent | null>(null);
  const [visionEvent, setVisionEvent] = useState<PolymarketEvent | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const onboardingDone = localStorage.getItem('phantom_onboarding_done');
    if (!onboardingDone) setShowOnboarding(true);
  }, [mounted]);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('phantom_onboarding_done', 'true');
    setShowOnboarding(false);
  }, []);

  const fetchEventsRef = useRef<(showSkeleton?: boolean) => Promise<void>>();

  const fetchEvents = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) {
      setIsLoading(true);
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
      }, 600);
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

  // Split events: top 4 for carousel, rest for grid
  const featuredEvents = events.slice(0, 4);
  const otherEvents = events.slice(4);

  const isHome = activeTab === 'home';

  return (
    <TooltipProvider delayDuration={300}>
      <main className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'bg-phantom-dark' : 'bg-gray-50'} relative`}>
        {/* Background ambient glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[120px] transition-colors duration-500 ${isDark ? 'bg-phantom-primary/6' : 'bg-teal-200/30'}`} />
          <div className={`absolute top-1/4 -right-32 w-48 h-48 rounded-full blur-[100px] transition-colors duration-500 ${isDark ? 'bg-phantom-secondary-a/5' : 'bg-cyan-200/25'}`} />
          <div className={`absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full blur-[140px] transition-colors duration-500 ${isDark ? 'bg-phantom-secondary-b/3' : 'bg-cyan-200/20'}`} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Profile Header — only on home tab */}
          {isHome && (
            <ProfileHeader
              user={user}
              isLoading={!user}
              onMenuOpen={() => setIsMenuOpen(true)}
              isDark={isDark}
            />
          )}

          {/* Tab-specific headers */}
          {!isHome && (
            <header className={`px-5 pt-4 pb-3 border-b backdrop-blur-xl transition-colors duration-300 ${
              isDark ? 'border-white/[0.04] bg-phantom-dark/70' : 'border-gray-200 bg-white/70'
            }`}>
              <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'explore' && 'Explore'}
                {activeTab === 'activity' && 'Activity'}
                {activeTab === 'profile' && 'Profile'}
              </h1>
            </header>
          )}

          {/* Main content area */}
          {isHome ? (
            <div className="flex-1 px-5 pt-4 pb-24">
              {/* Stats bar */}
              <div className="flex items-center gap-3 mb-5 animate-[fadeInUp_0.5s_ease_0.1s_both]">
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors duration-500 ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                  <TrendingUp className={`w-3.5 h-3.5 ${isDark ? 'text-phantom-secondary-b' : 'text-emerald-600'}`} />
                  <span className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Live</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors duration-500 ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                  <Zap className={`w-3.5 h-3.5 ${isDark ? 'text-phantom-primary-light' : 'text-blue-600'}`} />
                  <span className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Top Volume</span>
                </div>
                <div className="flex-1" />

                {/* Theme toggle */}
                {mounted && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={toggleTheme}
                        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 active:scale-90 ${
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
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className={`text-xs ${isDark ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-700 border-gray-200'}`}>
                      Switch between light and dark themes
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Refresh */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-90 ${
                        isDark ? 'glass-card hover:bg-white/[0.06]' : 'glass-card-light hover:bg-black/[0.04]'
                      }`}
                      aria-label="Refresh markets"
                    >
                      <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isDark ? 'text-phantom-text-secondary' : 'text-gray-500'} ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className={`text-xs ${isDark ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-700 border-gray-200'}`}>
                    Refresh market data from Polymarket
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Loading state */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className="space-y-6"
                  >
                    {/* Skeleton carousel */}
                    <div>
                      <div className={`h-5 w-36 rounded-lg skeleton-shimmer mb-3 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                      <div className="flex gap-3 overflow-hidden">
                        <div className={`flex-shrink-0 w-[85%] h-[220px] rounded-3xl skeleton-shimmer ${isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-gray-100 border border-gray-200'}`} />
                        <div className={`flex-shrink-0 w-[85%] h-[220px] rounded-3xl skeleton-shimmer ${isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-gray-100 border border-gray-200'}`} />
                      </div>
                    </div>
                    {/* Skeleton grid */}
                    <div>
                      <div className={`h-5 w-40 rounded-lg skeleton-shimmer mb-3 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <SkeletonCard key={i} index={i} isDark={isDark} />
                        ))}
                      </div>
                    </div>
                    {/* Skeleton leaderboard */}
                    <div>
                      <div className={`h-5 w-36 rounded-lg skeleton-shimmer mb-3 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                      <div className="space-y-2.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className={`rounded-2xl p-4 skeleton-shimmer ${isDark ? 'bg-white/[0.03]' : 'bg-gray-100'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl skeleton-shimmer ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                              <div className="flex-1 space-y-2">
                                <div className={`h-3.5 w-28 rounded skeleton-shimmer ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                                <div className={`h-3 w-20 rounded skeleton-shimmer ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
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

                    {/* Other events grid */}
                    {otherEvents.length > 0 && (
                      <section className="mb-6 section-fade-in" style={{ animationDelay: '0.15s' }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <TrendingUp className={`w-4 h-4 ${isDark ? 'text-phantom-primary-light' : 'text-blue-600'}`} />
                            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              More Markets
                            </h2>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                isDark ? 'hover:bg-white/10 text-white/30 hover:text-white/50' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                              }`}>
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className={`max-w-[220px] text-xs ${isDark ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-700 border-gray-200'}`}>
                              Other active markets sorted by 24h volume. Tap to see details and trade.
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="space-y-3">
                          {otherEvents.map((event, index) => (
                            <div
                              key={event.id}
                              className="card-2d-enter"
                              style={{ animationDelay: `${index * 60}ms` }}
                            >
                              <EventCard
                                event={event}
                                index={index}
                                onClick={() => setSelectedEvent(event)}
                                isDark={isDark}
                              />
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* If no other events but featured exists */}
                    {otherEvents.length === 0 && featuredEvents.length > 0 && null}

                    {/* End of events indicator */}
                    {events.length > 0 && (
                      <div className="flex flex-col items-center gap-2 pt-4 pb-2 section-fade-in" style={{ animationDelay: '0.25s' }}>
                        <GhostIcon className={`${isDark ? 'text-phantom-primary/20' : 'text-gray-400/40'}`} size={16} />
                        <p className={`text-[11px] ${isDark ? 'text-phantom-text-secondary/40' : 'text-gray-400/60'}`}>
                          You&apos;re all caught up ✅
                        </p>
                      </div>
                    )}

                    {/* Leaderboard */}
                    <div className="section-fade-in" style={{ animationDelay: '0.3s' }}>
                      <LeaderboardSection isDark={isDark} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Non-home tabs */
            <div className="flex-1">
              {activeTab === 'explore' && (
                <PlaceholderTab icon={Search} title="Explore Markets" description="Search and discover prediction markets across all categories" isDark={isDark} />
              )}
              {activeTab === 'activity' && (
                <PlaceholderTab icon={BarChart3} title="Activity Feed" description="Your recent trades, price alerts, and market movements will appear here" isDark={isDark} />
              )}
              {activeTab === 'profile' && (
                <PlaceholderTab icon={User} title="My Profile" description="Account settings, trading stats, and subscription management coming soon" isDark={isDark} />
              )}
            </div>
          )}

          {/* Sticky footer — only on home */}
          {isHome && (
            <footer
              className={`px-5 py-3 border-t backdrop-blur-xl transition-colors duration-500 animate-[fadeIn_0.5s_ease_0.6s_both] ${
                isDark ? 'border-white/[0.04] bg-phantom-dark/70' : 'border-gray-200 bg-white/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GhostIcon className={`${isDark ? 'text-phantom-primary/30' : 'text-gray-400/40'}`} size={14} />
                  <span className={`text-[10px] font-medium ${isDark ? 'text-phantom-text-secondary/30' : 'text-gray-400/50'}`}>Phantom</span>
                </div>
                <span className={`text-[10px] ${isDark ? 'text-phantom-text-secondary/25' : 'text-gray-400/40'}`}>Powered by Polymarket</span>
              </div>
            </footer>
          )}
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
        <PhantomVisionView
          event={visionEvent}
          isOpen={!!visionEvent}
          onClose={() => setVisionEvent(null)}
        />

        {/* Onboarding overlay */}
        <AnimatePresence>
          {showOnboarding && (
            <Onboarding
              onComplete={completeOnboarding}
              telegramUser={user}
            />
          )}
        </AnimatePresence>
      </main>
    </TooltipProvider>
  );
}