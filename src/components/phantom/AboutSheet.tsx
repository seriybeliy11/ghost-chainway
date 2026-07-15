'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ExternalLink } from 'lucide-react';

interface AboutSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  { emoji: '🔥', text: 'Hot markets from Polymarket' },
  { emoji: '👁️', text: 'Phantom Vision AI analysis' },
  { emoji: '👑', text: 'Trader leaderboards' },
  { emoji: '🎮', text: 'Gamified profile with badges' },
];

export default function AboutSheet({ isOpen, onClose }: AboutSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[80vh] rounded-t-3xl bg-phantom-surface/98 border-t border-white/[0.08] p-0"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/15" />
        </div>

        <SheetHeader className="px-6 pb-2">
          <SheetTitle className="text-center">
            <span className="gradient-text text-2xl font-extrabold">Phantom</span>
          </SheetTitle>
          <SheetDescription className="text-center text-[11px] text-white/30">
            v0.2.0
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-8 space-y-5">
          {/* Description */}
          <p className="text-[14px] leading-relaxed text-white/60 text-center">
            Your ghostly companion for Polymarket. We surface the hottest prediction markets, analyze them with AI, and track the best traders — so you can make smarter bets.
          </p>

          {/* Features */}
          <div className="space-y-2.5">
            {features.map((f) => (
              <div
                key={f.emoji}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]"
              >
                <span className="text-[16px] flex-shrink-0">{f.emoji}</span>
                <span className="text-[13px] font-medium text-white/75">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Made with love */}
          <p className="text-[12px] text-center text-white/30">
            Made with ❤️ for prediction market traders
          </p>
          <p className="text-[11px] text-center text-white/20">
            Built on Telegram Mini Apps
          </p>

          {/* Social links */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <a
              href="https://t.me/phantom_tma"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-phantom-primary-light hover:text-phantom-secondary-b transition-colors duration-200"
            >
              Telegram
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/phantom-tma"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-phantom-primary-light hover:text-phantom-secondary-b transition-colors duration-200"
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}