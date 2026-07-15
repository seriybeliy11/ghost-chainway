'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TooltipAboutProps {
  text: string;
  title?: string;
}

export default function TooltipAbout({ text, title }: TooltipAboutProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="glass inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white/40 hover:text-white/70 cursor-pointer transition-colors duration-200 flex-shrink-0"
          aria-label={title ? `About: ${title}` : 'More info'}
        >
          ?
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={8}
        align="end"
        className="w-64 rounded-xl p-3.5 glass border-white/[0.08] bg-phantom-surface/95 shadow-xl"
      >
        {title && (
          <p className="text-[13px] font-bold text-white/90 mb-1.5">{title}</p>
        )}
        <p className="text-[12px] leading-relaxed text-white/50">{text}</p>
      </PopoverContent>
    </Popover>
  );
}