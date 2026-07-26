'use client';

import { useState, useEffect, useCallback, useContext, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  X, Lock,
  Send, Sparkles, Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import MagicOrb from '@/components/phantom/MagicOrb';
import GhostIcon from '@/components/phantom/GhostIcon';
import BottomNavigation, { type TabId } from '@/components/phantom/BottomNavigation';
import ProfileView from '@/components/phantom/ProfileView';
import PhantomsView from '@/components/phantom/PhantomsView';
import AboutScreen from '@/components/phantom/AboutScreen';
import Onboarding from '@/components/phantom/Onboarding';
import { UserContext } from '@/lib/user-context';

export interface AppUser {
  id: number;
  email?: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  isAuthorized: boolean;
  referrerCode?: string;
  planType?: string;
  generationsLeft?: number;
  totalPurchased?: number;
  totalUsed?: number;
}

/* ── Ask Oracle Modal ────────────────────────────────────── */
function AskOracleModal({
  isOpen,
  onClose,
  onSubmit,
  isAuthorized,
  hasGens,
  onGoProfile,
  onShowPaywall,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (query: string) => void;
  isAuthorized: boolean;
  hasGens: boolean;
  onGoProfile: () => void;
  onShowPaywall: () => void;
}) {
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!query.trim() || submitting) return;
    if (!isAuthorized) { onClose(); onGoProfile(); return; }
    if (!hasGens) { onClose(); onShowPaywall(); return; }
    setSubmitting(true);
    onSubmit(query.trim());
  }, [query, submitting, isAuthorized, hasGens, onClose, onSubmit, onGoProfile, onShowPaywall]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-[440px] mx-4 mb-4 sm:mb-0 rounded-3xl overflow-hidden p-5"
            style={{
              background: 'linear-gradient(145deg, rgba(20,20,55,0.97), rgba(8,8,24,0.99))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 80px rgba(64,108,255,0.2), 0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{ width: '70%', height: 100, background: 'radial-gradient(ellipse at top, rgba(64,108,255,0.2), transparent)', filter: 'blur(25px)' }}
            />

            <div className="relative z-10 flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-phantom-primary/15 border border-phantom-primary/20">
                <Sparkles className="w-5 h-5 text-phantom-primary-light" />
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-white">Ask the Oracle</h3>
                <p className="text-[11px] text-white/30">Ask about any prediction market</p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/[0.08] text-white/40 hover:text-white/70 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative z-10 rounded-2xl bg-white/[0.05] border border-white/[0.08] focus-within:border-phantom-primary/30 transition-colors">
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="Ask about any market, event, or prediction..."
                rows={2}
                className="w-full bg-transparent px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!query.trim() || submitting}
                className="absolute right-3 bottom-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-20"
                style={{
                  background: query.trim() ? 'linear-gradient(135deg, #406CFF, #6A00FF)' : 'rgba(255,255,255,0.06)',
                  boxShadow: query.trim() ? '0 4px 16px rgba(64,108,255,0.4)' : 'none',
                }}
              >
                {submitting
                  ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </motion.div>
                  : <Send className="w-3.5 h-3.5 text-white" />
                }
              </button>
            </div>

            {!isAuthorized && (
              <p className="relative z-10 mt-3 text-[12px] text-amber-400/50 flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Sign in to use the Oracle
              </p>
            )}
            {isAuthorized && !hasGens && (
              <p className="relative z-10 mt-3 text-[12px] text-amber-400/50 flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Purchase generations to unlock
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Home Page ──────────────────────────────────────────────── */
function HomePage() {
  const searchParams = useSearchParams();
  return <HomeContent searchParams={searchParams} />;
}

function HomeContent({ searchParams }: { searchParams: ReturnType<typeof useSearchParams> }) {
  const { user: contextUser } = useContext(UserContext);
  const user = contextUser ? (contextUser as AppUser) : null;
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [askModalKey, setAskModalKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding on first visit (deferred to avoid sync setState in effect)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!localStorage.getItem('phantom_onboarding_seen')) {
          if (!cancelled) setShowOnboarding(true);
        }
      } catch {
        // localStorage unavailable
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    try { localStorage.setItem('phantom_onboarding_seen', '1'); } catch {}
    setShowOnboarding(false);
  }, []);

  const replayOnboarding = useCallback(() => {
    setIsAboutOpen(false);
    setShowOnboarding(true);
  }, []);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) sessionStorage.setItem('phantom_ref', ref);
  }, [searchParams]);

  const hasGens = (user?.generationsLeft ?? 0) > 0;

  // Ask Oracle (custom question)
  const handleAskSubmit = useCallback((query: string) => {
    if (!user?.isAuthorized) { setActiveTab('profile'); setShowAskModal(false); return; }
    if (!hasGens) { setShowPaywall(true); setShowAskModal(false); return; }
    const params = new URLSearchParams({ query });
    window.location.href = `/phantomvis?${params.toString()}`;
  }, [user, hasGens]);

  // Orb click
  const handleOrbClick = useCallback(() => {
    setAskModalKey(k => k + 1);
    setShowAskModal(true);
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <main className="flex flex-col bg-phantom-dark relative min-h-screen">
        {/* ── Background ambient ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.04, 0.07, 0.04] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-phantom-primary/[0.06] blur-[120px]"
          />
          <div className="absolute top-1/3 -right-48 w-[400px] h-[400px] rounded-full blur-[100px] bg-phantom-secondary-a/[0.03]" />
          <div className="absolute bottom-1/4 -left-48 w-[350px] h-[350px] rounded-full blur-[100px] bg-phantom-secondary-b/[0.02]" />
        </div>

        <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
          {/* ── Scrollable area ── */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="pb-24">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* ── Top bar ── */}
                    <div className="px-4 pt-5 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GhostIcon className="text-phantom-secondary-b/60" size={18} />
                          <span className="text-[14px] font-bold text-white/60 tracking-wide">Phantom</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {user?.isAuthorized && hasGens && (
                            <span className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15">
                              {user.generationsLeft} gens
                            </span>
                          )}
                          <button
                            onClick={() => setIsAboutOpen(true)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-white/25 hover:text-white/50 hover:border-white/[0.1] transition-all cursor-pointer"
                          >
                            <GhostIcon size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── The Orb — strictly centered ── */}
                    <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100dvh - 160px)' }}>
                      <MagicOrb onClick={handleOrbClick} />

                      {/* Label */}
                      <div className="mt-5 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-phantom-secondary-b/40" />
                        <span className="text-[11px] font-semibold text-white/20 uppercase tracking-[0.2em]">
                          Tap to ask
                        </span>
                        <div className="w-1 h-1 rounded-full bg-phantom-secondary-b/40" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'phantoms' && (
                  <motion.div key="phantoms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <PhantomsView user={user} />
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <ProfileView user={user} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Sticky footer ── */}
          <footer className="shrink-0 px-5 py-2 border-t backdrop-blur-xl border-white/[0.04] bg-phantom-dark/70">
            <div className="flex items-center justify-between">
              <button onClick={() => setIsAboutOpen(true)} className="flex items-center gap-1.5 cursor-pointer">
                <GhostIcon className="text-phantom-primary/25" size={12} />
                <span className="text-[10px] font-medium text-white/15 hover:text-white/25 transition-colors">Phantom</span>
              </button>
              <span className="text-[10px] text-white/10">Polymarket</span>
            </div>
          </footer>
        </div>

        {/* ── Bottom nav ── */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Ask Oracle modal ── */}
        <AskOracleModal
          key={askModalKey}
          isOpen={showAskModal}
          onClose={() => setShowAskModal(false)}
          onSubmit={handleAskSubmit}
          isAuthorized={user?.isAuthorized ?? false}
          hasGens={hasGens}
          onGoProfile={() => setActiveTab('profile')}
          onShowPaywall={() => setShowPaywall(true)}
        />

        {/* ── Paywall modal ── */}
        <AnimatePresence>
          {showPaywall && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowPaywall(false)} />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative rounded-3xl p-6 max-w-[320px] w-full text-center"
                style={{
                  background: 'linear-gradient(145deg, rgba(20,20,55,0.97), rgba(8,8,24,0.99))',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 0 60px rgba(64,108,255,0.15), 0 24px 80px rgba(0,0,0,0.5)',
                }}
              >
                <div className="w-14 h-14 rounded-2xl bg-phantom-primary/15 border border-phantom-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-phantom-primary" />
                </div>
                <h3 className="text-[17px] font-bold text-white mb-2">Oracle Locked</h3>
                <p className="text-[14px] text-white/35 mb-5 leading-relaxed">
                  Purchase generations in your Profile to unlock AI-powered market analysis
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowPaywall(false); setActiveTab('profile'); }}
                    className="flex-1 py-3 rounded-2xl text-white font-semibold text-[14px] transition-all active:scale-[0.97] cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #406CFF, #6A00FF)' }}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setShowPaywall(false)}
                    className="px-5 py-3 rounded-2xl text-white/30 font-semibold text-[14px] cursor-pointer bg-white/[0.06] border border-white/[0.08]"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── About screen ── */}
        <AboutScreen isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} onReplayStory={replayOnboarding} />
      </main>

      {/* ── Onboarding (first-visit story) ── */}
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>
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
