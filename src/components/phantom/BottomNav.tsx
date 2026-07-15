'use client';

import { TrendingUp, Trophy, User, HelpCircle } from 'lucide-react';
import { useUserStore, type TabId } from '@/lib/store';

interface BottomNavProps {
  onProfileOpen: () => void;
  onAboutOpen: () => void;
}

const tabs: { id: TabId; label: string; icon: typeof TrendingUp; action?: 'profile' | 'about' }[] = [
  { id: 'markets', label: 'Markets', icon: TrendingUp },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User, action: 'profile' },
  { id: 'about', label: 'About', icon: HelpCircle, action: 'about' },
];

export default function BottomNav({ onProfileOpen, onAboutOpen }: BottomNavProps) {
  const activeTab = useUserStore((s) => s.activeTab);
  const setActiveTab = useUserStore((s) => s.setActiveTab);

  const handleTabPress = (tab: (typeof tabs)[number]) => {
    if (tab.action === 'profile') {
      onProfileOpen();
      return;
    }
    if (tab.action === 'about') {
      onAboutOpen();
      return;
    }
    setActiveTab(tab.id);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/[0.06] bottom-nav-safe"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map((tab) => {
          const isActive = tab.id === 'markets' || tab.id === 'leaderboard'
            ? activeTab === tab.id
            : false;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabPress(tab)}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px] cursor-pointer transition-all duration-200 press-effect"
            >
              <tab.icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive
                    ? 'text-phantom-secondary-b'
                    : 'text-white/30 hover:text-white/50'
                }`}
              />
              <span
                className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-white/80' : 'text-white/30'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-4 h-[3px] rounded-full bg-phantom-secondary-b" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}