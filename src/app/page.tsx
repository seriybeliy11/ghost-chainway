'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { RefreshCw, Sun, Moon, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import ProfileHeader from '@/components/phantom/ProfileHeader';
import ProfileMenu from '@/components/phantom/ProfileMenu';
import Onboarding from '@/components/phantom/Onboarding';
import GhostIcon from '@/components/phantom/GhostIcon';
import BottomNavigation, { type TabId } from '@/components/phantom/BottomNavigation';
import TradingOverview from '@/components/phantom/TradingOverview';
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
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedTraderId, setSelectedTraderId] = useState<string | null>(null);
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
      setIsRefreshing(true);
      setTimeout(() => {
        setRefreshKey(k => k + 1);
        setIsRefreshing(false);
      }, 1000);
    }
    pullDistance.current = 0;
    isPulling.current = false;
  }, [isRefreshing]);

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
          {/* Header — glassmorphism, always visible */}
          <header
            className={`shrink-0 px-5 pt-4 pb-3 backdrop-blur-2xl border-b transition-all duration-300 ${
              isDark
                ? 'border-white/[0.06] bg-[#0A1628]/80'
                : 'border-gray-200/80 bg-white/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <ProfileHeader
                user={user}
                isLoading={!user}
                onMenuOpen={() => setIsMenuOpen(true)}
                isDark={isDark}
              />
              <div className="flex items-center gap-2">
                {mounted && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={toggleTheme}
                        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 active:scale-90 ${
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
          </header>

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
                    <TradingOverview key={refreshKey} isDark={isDark} />
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
                    <ProfileView isDark={isDark} />
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
        <TraderDetailModal
          traderId={selectedTraderId}
          isOpen={!!selectedTraderId}
          onClose={() => setSelectedTraderId(null)}
          isDark={isDark}
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