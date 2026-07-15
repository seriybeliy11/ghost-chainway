'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { PolymarketEvent } from '@/components/phantom/EventCard';

interface FeaturedCarouselProps {
  events: PolymarketEvent[];
  onSelectEvent: (event: PolymarketEvent) => void;
}

const featuredGradients = [
  'from-[#1a0a3e]/90 via-[#0d1a4a]/85 to-[#070714]',
  'from-[#0a1a3e]/90 via-[#1a0a3e]/85 to-[#070714]',
  'from-[#0a2a2a]/90 via-[#0d1a3e]/85 to-[#070714]',
  'from-[#1a1a0a]/90 via-[#0a1a2a]/85 to-[#070714]',
];

const categoryColors: Record<string, string> = {
  Politics: 'bg-blue-500/20 text-blue-300 border-blue-500/25',
  Crypto: 'bg-purple-500/20 text-purple-300 border-purple-500/25',
  Sports: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25',
  Science: 'bg-violet-500/20 text-violet-300 border-violet-500/25',
  Entertainment: 'bg-pink-500/20 text-pink-300 border-pink-500/25',
  Tech: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/25',
  Economics: 'bg-amber-500/20 text-amber-300 border-amber-500/25',
  World: 'bg-teal-500/20 text-teal-300 border-teal-500/25',
  Trending: 'bg-white/10 text-white/70 border-white/10',
};

function formatVolume(vol: number): string {
  if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
  if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
  return `$${vol.toFixed(0)}`;
}

function getProbColor(pct: number): string {
  if (pct > 65) return 'text-emerald-400';
  if (pct > 40) return 'text-blue-400';
  return 'text-orange-400';
}

export default function FeaturedCarousel({ events, onSelectEvent }: FeaturedCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval>>();

  const featured = events.slice(0, 5);
  const total = featured.length;

  const handleSelect = useCallback((apiInstance: CarouselApi) => {
    if (!apiInstance) return;
    setSelectedIndex(apiInstance.selectedScrollSnap());
  }, []);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (api && !isTouching) {
        api.scrollNext();
      }
    }, 5000);
  }, [api, isTouching]);

  useEffect(() => {
    if (!api) return;
    api.on('select', handleSelect);
    api.on('reInit', handleSelect);
    return () => {
      api.off('select', handleSelect);
      api.off('reInit', handleSelect);
    };
  }, [api, handleSelect]);

  useEffect(() => {
    if (total > 1) {
      startAutoPlay();
      return () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      };
    }
  }, [startAutoPlay, total]);

  const handleTouchStart = () => setIsTouching(true);
  const handleTouchEnd = () => {
    setTimeout(() => setIsTouching(false), 3000);
  };

  if (featured.length === 0) return null;

  return (
    <div className="w-full">
      <Carousel
        setApi={setApi}
        opts={{ align: 'start', loop: total > 2 }}
        className="w-full"
      >
        <CarouselContent
          className="-ml-3"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {featured.map((event, i) => {
            const yesPrice = parseFloat(event.outcomePrices?.[0] || '0') * 100;
            const volume24h = parseFloat(event.volume24hr || '0');
            const catStyle = categoryColors[event.category] || categoryColors['Trending'];

            return (
              <CarouselItem key={event.id} className="pl-3 basis-[85vw]">
                <button
                  onClick={() => onSelectEvent(event)}
                  className="relative w-full h-[180px] rounded-2xl overflow-hidden press-effect cursor-pointer text-left border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300"
                >
                  {/* Gradient bg */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${featuredGradients[i % featuredGradients.length]}`}>
                    <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-2xl bg-phantom-primary/12" />
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl bg-phantom-secondary-a/8" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-4">
                    {/* Top: category + volume badge */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border ${catStyle}`}>
                        {event.category || 'Market'}
                      </span>
                      <span className="text-[10px] font-semibold text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                        📊 {formatVolume(volume24h)}
                      </span>
                    </div>

                    {/* Question */}
                    <h3 className="text-[15px] font-bold leading-snug line-clamp-2 text-white/95 drop-shadow-lg flex-1 flex items-center">
                      {event.question}
                    </h3>

                    {/* Big probability */}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className={`text-[28px] font-extrabold leading-none ${getProbColor(yesPrice)}`}>
                          {yesPrice.toFixed(0)}<span className="text-[14px] font-bold">%</span>
                        </span>
                        <span className="text-[10px] font-semibold ml-1.5 text-white/40">
                          {event.outcomes?.[0] || 'Yes'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Custom dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {featured.map((_, i) => (
            <div
              key={i}
              className={`h-[5px] rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? 'w-5 bg-phantom-secondary-b'
                  : 'w-[5px] bg-white/15'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}