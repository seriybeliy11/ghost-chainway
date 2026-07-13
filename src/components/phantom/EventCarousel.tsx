'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { TrendingUp, Clock, Flame, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import type { PolymarketEvent } from './EventCard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Referral link for Trade on Polymarket
const POLYMARKET_REFERRAL_BASE = 'https://polymarket.com/event/';

interface EventCarouselProps {
  events: PolymarketEvent[];
  onEventClick: (event: PolymarketEvent) => void;
}

export default function EventCarousel({ events, onEventClick }: EventCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [checkScroll]);

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.clientWidth * 0.85;
    scrollRef.current.scrollTo({ left: index * (cardWidth + 12), behavior: 'smooth' });
    setActiveIndex(index);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Ended';
    if (diffDays <= 1) return '24h';
    if (diffDays <= 7) return `${diffDays}d`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (events.length === 0) return null;

  return (
    <section className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Featured Markets
          </h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 text-white/30 hover:text-white/50">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[220px] text-xs bg-gray-800 text-gray-200 border-gray-700">
              Top markets by 24h trading volume. Swipe to see more featured events.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map((event, index) => {
            const yesPrice = parseFloat(event.outcomePrices?.[0] || '0') * 100;
            const noPrice = 100 - yesPrice;
            const volume24h = parseFloat(event.volume24hr || '0');
            const isVeryHot = volume24h > 2000000;
            const isHot = volume24h > 500000;

            const yesColor = yesPrice > 65
              ? 'from-emerald-400 to-emerald-500'
              : yesPrice > 40
                ? 'from-blue-400 to-cyan-400'
                : 'from-orange-400 to-red-400';

            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="flex-shrink-0 w-[85%] snap-start cursor-pointer active:scale-[0.98] transition-transform duration-150"
              >
                <div
                  className={`relative rounded-3xl overflow-hidden h-[220px] sm:h-[240px] transition-shadow duration-300 border border-white/[0.08] hover:border-white/[0.15] hover:shadow-[0_8px_40px_rgba(57,174,207,0.08)]`}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-[#0a2035]/90 via-[#0d1a33]/85 to-[#0A1628]`}>
                    <div className={`absolute -top-12 -left-12 w-40 h-40 rounded-full blur-2xl bg-phantom-primary/15`} />
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl bg-phantom-secondary-a/10`} />
                    <div className={`absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/75`} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-5">
                    {/* Top badges */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border bg-white/[0.06] border-white/[0.08] text-white/60`}>
                        {event.category || 'Market'}
                      </span>
                      {isHot && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md border ${
                          isVeryHot
                            ? 'bg-red-500/25 border-red-500/30'
                            : 'bg-orange-500/20 border-orange-500/25'
                        }`}>
                          <Flame className={`w-3 h-3 ${isVeryHot ? 'text-red-400' : 'text-orange-400'}`} />
                          <span className={`text-[10px] font-bold ${isVeryHot ? 'text-red-300' : 'text-orange-300'}`}>
                            {isVeryHot ? 'Blazing' : 'Hot'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Question */}
                    <div className="flex-1 flex items-center">
                      <h3 className={`text-[17px] font-bold leading-snug line-clamp-2 drop-shadow-lg text-white/95`}>
                        {event.question}
                      </h3>
                    </div>

                    {/* Bottom stats */}
                    <div className="space-y-3">
                      {/* Probability display */}
                      <div className="flex items-end justify-between">
                        <div>
                          <span className={`text-2xl font-extrabold leading-none ${
                            yesPrice > 65 ? 'text-emerald-400'
                              : yesPrice > 40 ? 'text-blue-400'
                              : 'text-orange-400'
                          }`}>
                            {yesPrice.toFixed(0)}<span className="text-sm font-bold">%</span>
                          </span>
                          <span className={`text-[10px] font-semibold ml-1.5 text-white/40`}>
                            {event.outcomes?.[0] || 'Yes'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-extrabold leading-none text-teal-400`}>
                            {noPrice.toFixed(0)}<span className="text-sm font-bold">%</span>
                          </span>
                          <span className={`text-[10px] font-semibold mr-1.5 text-white/40`}>
                            {event.outcomes?.[1] || 'No'}
                          </span>
                        </div>
                      </div>

                      {/* Probability bar */}
                      <div className={`h-2 rounded-full overflow-hidden flex bg-white/8`}>
                        <div
                          className={`h-full rounded-l-full bg-gradient-to-r ${yesColor} transition-all duration-700 ease-out`}
                          style={{ width: `${yesPrice}%` }}
                        />
                        <div
                          className={`h-full rounded-r-full transition-all duration-700 ease-out bg-gradient-to-r from-teal-400 to-cyan-500`}
                          style={{ width: `${noPrice}%` }}
                        />
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-1 text-white/40`}>
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-[11px] font-semibold">{formatVolume(volume24h)}</span>
                          <span className={`text-[9px] text-white/20`}>/24h</span>
                        </div>
                        <div className={`flex items-center gap-1 text-white/40`}>
                          <Clock className="w-3 h-3" />
                          <span className="text-[11px] font-medium">{formatDate(event.endDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation arrows */}
        {canScrollLeft && (
          <button
            onClick={(e) => { e.stopPropagation(); scrollToIndex(Math.max(0, activeIndex - 1)); }}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-20 transition-all duration-200 bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:bg-black/80 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={(e) => { e.stopPropagation(); scrollToIndex(Math.min(events.length - 1, activeIndex + 1)); }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-20 transition-all duration-200 bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:bg-black/80 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Dots indicator */}
        {events.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {events.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? `w-5 bg-phantom-primary`
                    : `w-1.5 bg-white/20`
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}