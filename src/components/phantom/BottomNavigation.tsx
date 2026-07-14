'use client';

import { BarChart3, Users, Ghost, UserCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type TabId = 'overview' | 'traders' | 'phantoms' | 'profile';

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; icon: typeof Ghost; label: string; tooltip: string }[] = [
  { id: 'overview', icon: BarChart3, label: 'Overview', tooltip: 'Hot prediction markets' },
  { id: 'traders', icon: Users, label: 'Traders', tooltip: 'Top traders list' },
  { id: 'phantoms', icon: Ghost, label: 'Phantoms', tooltip: 'Referral program — earn 10%' },
  { id: 'profile', icon: UserCircle, label: 'Profile', tooltip: 'Subscription and balance' },
];

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-2xl transition-colors duration-300 bg-[#0A1628]/85 border-white/[0.06]`}
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
                    className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-all duration-200 relative active:scale-90 ${
                      isActive
                        ? 'text-phantom-primary'
                        : 'text-white/30 hover:text-white/50'
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full transition-all duration-300 bg-phantom-primary`} />
                    )}
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-[10px] font-semibold transition-all duration-200 ${
                      isActive ? 'text-phantom-primary' : ''
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs bg-[#0F1E33] text-gray-200 border-white/10">
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