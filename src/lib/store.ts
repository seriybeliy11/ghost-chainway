import { create } from 'zustand';
import type { UserProfile } from '@/lib/types';

export const POLYMARKET_REF = 'seriybeliy11';
export const getTradeUrl = (slug: string) =>
  `https://polymarket.com/event/${slug}?ref=${POLYMARKET_REF}`;

export type TabId = 'markets' | 'leaderboard' | 'profile' | 'about';

interface UserStore {
  user: UserProfile | null;
  isLoading: boolean;
  isDbReady: boolean;
  activeTab: TabId;
  setUser: (user: UserProfile) => void;
  updateGenerations: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setDbReady: (ready: boolean) => void;
  setActiveTab: (tab: TabId) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  isDbReady: false,
  activeTab: 'markets',

  setUser: (user) => set({ user, isLoading: false, isDbReady: true }),

  updateGenerations: (count) =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: { ...state.user, generationsAvailable: count },
      };
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setDbReady: (isDbReady) => set({ isDbReady }),
  setActiveTab: (activeTab) => set({ activeTab }),

  reset: () => set({ user: null, isLoading: true, isDbReady: false, activeTab: 'markets' }),
}));