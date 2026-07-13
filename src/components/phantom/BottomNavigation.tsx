'use client';

import { Home, Search, BarChart3, User, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type TabId = 'home' | 'explore' | 'activity' | 'profile';

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isDark?: boolean;
}

const tabs: { id: TabId; icon: typeof Home; label: string; tooltip: string }[] = [
  { id: 'home', icon: Home, label: 'Home', tooltip: 'Main feed with featured markets, events, and leaderboard' },
  { id: 'explore', icon: Search, label: 'Explore', tooltip: 'Search and discover all available prediction markets' },
  { id: 'activity', icon: BarChart3, label: 'Activity', tooltip: 'Your recent trades, alerts, and market movements' },
  { id: 'profile', icon: User, label: 'Profile', tooltip: 'Your account settings, stats, and subscription' },
];

export default function BottomNavigation({ activeTab, onTabChange, isDark = true }: BottomNavigationProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-2xl transition-colors duration-300 ${
          isDark
            ? 'bg-[#0A1628]/85 border-white/[0.06]'
            : 'bg-white/85 border-gray-200'
        }`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around max-w-lg mx-auto h-14">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-all duration-200 relative ${
                      isActive
                        ? (isDark ? 'text-phantom-primary' : 'text-gray-900')
                        : (isDark ? 'text-white/30 hover:text-white/50' : 'text-gray-400 hover:text-gray-600')
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full transition-all duration-300 ${
                        isDark ? 'bg-phantom-primary' : 'bg-gray-900'
                      }`} />
                    )}
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-[10px] font-semibold transition-all duration-200 ${
                      isActive ? (isDark ? 'text-phantom-primary' : 'text-gray-900') : ''
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className={`text-xs ${isDark ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-700 border-gray-200'}`}>
                  {tab.tooltip}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}