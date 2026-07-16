'use client';

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

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

interface UserContextValue {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const initialized = useRef<boolean | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          return;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (initialized.current == null) {
    initialized.current = true;
    refreshUser();
  }

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };