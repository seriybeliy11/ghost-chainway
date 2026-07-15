'use client';

import { useEffect, useRef, useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import {
  init,
  mountMiniApp,
  expandViewport,
  isTMA,
  retrieveRawInitData,
  useSignal,
  initDataUser,
  initDataStartParam,
} from '@telegram-apps/sdk-react';

interface TgUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface TelegramSDKContextValue {
  /** True if the SDK has been initialized (init + mountMiniApp called) */
  isReady: boolean;
  /** True if running inside Telegram Mini App */
  isInTelegram: boolean;
  /** Raw initData string from Telegram (for server-side validation) */
  rawInitData: string | undefined;
  /** start_param from deep link (e.g. referral code) */
  startParam: string | undefined;
  /** Parsed user from initData */
  user: TgUser | undefined;
  /** Manually retry auth with current initData */
  sendAuthRequest: (rawInitData: string) => Promise<{ user: TgUser } | null>;
  /** Auth error message */
  authError: string | null;
  /** Whether auth request is in flight */
  isAuthenticating: boolean;
}

const TelegramSDKContext = createContext<TelegramSDKContextValue>({
  isReady: false,
  isInTelegram: false,
  rawInitData: undefined,
  startParam: undefined,
  user: undefined,
  sendAuthRequest: async () => null,
  authError: null,
  isAuthenticating: false,
});

export function useTelegramSDK() {
  return useContext(TelegramSDKContext);
}

export function TelegramSDKProvider({ children }: { children: ReactNode }) {
  const initCalledRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isInTelegram, setIsInTelegram] = useState(false);
  const [rawInitData, setRawInitData] = useState<string | undefined>(undefined);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authResult, setAuthResult] = useState<{ user: TgUser } | null>(null);

  // Subscribe to SDK signals for parsed user data
  const sdkUser = useSignal(initDataUser);
  const startParam = useSignal(initDataStartParam);

  // Client-only: detect Telegram, read initData, init SDK
  useEffect(() => {
    // Detect if running inside Telegram Mini App
    let inTg = false;
    try {
      inTg = isTMA();
    } catch {
      // not in Telegram
    }
    setIsInTelegram(inTg);

    if (!inTg) return;

    // Read raw initData from URL (synchronous)
    try {
      const raw = retrieveRawInitData();
      setRawInitData(raw || undefined);
    } catch {
      // no init data
    }

    // Initialize the SDK (bridge, mount, expand)
    if (!initCalledRef.current) {
      initCalledRef.current = true;
      try {
        const cleanup = init();
        mountMiniApp();
        expandViewport();
        setIsReady(true);
        return cleanup;
      } catch (e) {
        console.warn('[TelegramSDK] Init error:', e);
      }
    }
  }, []);

  // Convert SDK user signal to our format
  const user: TgUser | undefined = sdkUser
    ? {
        id: sdkUser.id,
        first_name: sdkUser.firstName,
        last_name: sdkUser.lastName || undefined,
        username: sdkUser.username || undefined,
        photo_url: sdkUser.photoUrl || undefined,
        language_code: sdkUser.languageCode || undefined,
      }
    : undefined;

  // Send auth request to backend
  const sendAuthRequest = useCallback(async (initDataStr: string) => {
    if (!initDataStr) return null;
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: initDataStr }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const u: TgUser = {
          id: data.user.id,
          first_name: data.user.firstName,
          last_name: data.user.lastName || undefined,
          username: data.user.username || undefined,
          photo_url: data.user.photoUrl || undefined,
          language_code: data.user.languageCode || undefined,
        };
        setAuthResult({ user: u });
        return { user: u };
      }
      setAuthError(data.error || `Auth failed (${res.status})`);
      return null;
    } catch {
      setAuthError('Network error');
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Auto-authenticate when we have rawInitData and are in Telegram
  useEffect(() => {
    if (!isInTelegram || !rawInitData || authResult) return;
    sendAuthRequest(rawInitData);
  }, [isInTelegram, rawInitData, authResult, sendAuthRequest]);

  return (
    <TelegramSDKContext.Provider
      value={{
        isReady,
        isInTelegram,
        rawInitData,
        startParam: startParam || undefined,
        user: authResult?.user ?? user,
        sendAuthRequest,
        authError,
        isAuthenticating,
      }}
    >
      {children}
    </TelegramSDKContext.Provider>
  );
}