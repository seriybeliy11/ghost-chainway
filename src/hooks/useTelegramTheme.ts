'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface ThemeColors {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  button_color?: string;
  button_text_color?: string;
  accent_color?: string;
}

const DEFAULT_DARK: ThemeColors = {
  bg_color: '#070714',
  secondary_bg_color: '#0D0D24',
  text_color: 'rgba(255, 255, 255, 0.9)',
  hint_color: 'rgba(255, 255, 255, 0.5)',
  button_color: '#406CFF',
  button_text_color: '#FFFFFF',
  accent_color: '#73FFE4',
};

export function useTelegramTheme() {
  const [isTMA, setIsTMA] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_DARK);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { retrieveLaunchParams } = await import('@tma.js/sdk');
        const params = retrieveLaunchParams();
        if (params.themeParams && mounted) {
          const tp = params.themeParams as Record<string, { value: string }>;
          const mapped: ThemeColors = {};
          const keyMap: Record<string, keyof ThemeColors> = {
            bgColor: 'bg_color',
            secondaryBgColor: 'secondary_bg_color',
            textColor: 'text_color',
            hintColor: 'hint_color',
            buttonColor: 'button_color',
            buttonTextColor: 'button_text_color',
            accentColor: 'accent_color',
          };

          for (const [tmaKey, ourKey] of Object.entries(keyMap)) {
            const val = tp[tmaKey]?.value;
            if (val) mapped[ourKey] = val;
          }

          if (Object.keys(mapped).length > 0 && mounted) {
            setColors({ ...DEFAULT_DARK, ...mapped });
            setIsTMA(true);
          }
        }
      } catch {
        // Not in Telegram — use defaults
      }
    };

    init();
    return () => { mounted = false; };
  }, []);

  return { isTMA, colors };
}

export function useViewportHeight() {
  const [height, setHeight] = useState<number | null>(() => {
    if (typeof window !== 'undefined') return window.innerHeight;
    return null;
  });

  const handleResize = useCallback(() => {
    setHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return height;
}

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    const clamped = Math.min(distance * 0.5, 80);
    setPullDist(clamped);
    if (clamped > 10) {
      setIsPulling(true);
    }
  }, [isRefreshing]);

  const onTouchEnd = useCallback(async () => {
    if (pullDist > 50 && !isRefreshing) {
      setIsRefreshing(true);
      setIsPulling(false);
      setPullDist(0);
      await onRefresh();
      setIsRefreshing(false);
    } else {
      setIsPulling(false);
      setPullDist(0);
    }
  }, [onRefresh, isRefreshing, pullDist]);

  return { isPulling, isRefreshing, pullDistance: pullDist, onTouchStart, onTouchMove, onTouchEnd };
}