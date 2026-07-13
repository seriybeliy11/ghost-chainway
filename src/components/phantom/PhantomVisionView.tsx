'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, AlertCircle, RotateCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import GhostIcon from './GhostIcon';

const Ghost3D = dynamic(() => import('./Ghost3D'), {
  ssr: false,
  loading: () => <div className="w-full h-44" />,
});

interface PhantomVisionViewProps {
  event: {
    slug: string;
    question: string;
    category: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

/* ── Skeleton lines for loading ── */
function VisionSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-3/4 rounded-lg bg-white/8" />
      <div className="h-4 w-full rounded-lg bg-white/6" />
      <div className="h-4 w-5/6 rounded-lg bg-white/8" />
      <div className="h-3 w-2/3 rounded-lg bg-white/5" />
      <div className="h-4 w-full rounded-lg bg-white/6" />
      <div className="h-4 w-4/5 rounded-lg bg-white/8" />
      <div className="h-3 w-3/4 rounded-lg bg-white/5" />
      <div className="h-4 w-full rounded-lg bg-white/6" />
      <div className="h-4 w-2/3 rounded-lg bg-white/8" />
      <div className="h-3 w-5/6 rounded-lg bg-white/5" />
    </div>
  );
}

/* ── Extract text content from Dify outputs ── */
function extractOutputText(outputs: Record<string, unknown>): string {
  // Try common output keys
  const textKeys = ['text', 'result', 'output', 'answer', 'response', 'analysis', 'content'];
  for (const key of textKeys) {
    const val = outputs[key];
    if (typeof val === 'string' && val.trim()) return val;
  }

  // Try first string value in any key
  for (const val of Object.values(outputs)) {
    if (typeof val === 'string' && val.trim()) return val;
  }

  // Fallback: stringify
  return JSON.stringify(outputs, null, 2);
}

/* ── Simple markdown-ish renderer ── */
function RenderOutput({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-3 text-[14px] leading-relaxed text-white/80">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // Heading
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-[16px] font-bold text-white mt-4 mb-1">
              {trimmed.slice(4)}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-[18px] font-bold text-white mt-5 mb-2">
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="text-[20px] font-extrabold text-white mt-5 mb-2">
              {trimmed.slice(2)}
            </h1>
          );
        }

        // Bullet
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-[#73FFE4] mt-0.5 shrink-0">•</span>
              <span>{trimmed.slice(2)}</span>
            </div>
          );
        }

        // Numbered
        if (/^\d+\.\s/.test(trimmed)) {
          const numEnd = trimmed.indexOf('.');
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-[#73FFE4] font-bold shrink-0">{trimmed.slice(0, numEnd + 1)}</span>
              <span>{trimmed.slice(numEnd + 1).trim()}</span>
            </div>
          );
        }

        // Bold
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <p key={i} className="font-bold text-white/95">{trimmed.slice(2, -2)}</p>
          );
        }

        // Separator
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={i} className="border-white/10 my-3" />;
        }

        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
}

/* ── Main component ── */
export default function PhantomVisionView({ event, isOpen, onClose }: PhantomVisionViewProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [output, setOutput] = useState<string>('');
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const runVision = useCallback(async () => {
    if (!event?.slug) return;

    setStatus('loading');
    setOutput('');
    setErrorMsg('');
    setElapsed(0);

    // Elapsed timer
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/phantom-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: event.slug }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const text = extractOutputText(data.outputs || {});
        setOutput(text);
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Pipeline failed');
        setStatus('error');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setErrorMsg('Connection failed. Try again.');
        setStatus('error');
      }
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [event?.slug]);

  useEffect(() => {
    if (isOpen && event?.slug) {
      runVision();
    }
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, event?.slug, runVision]);

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const formatTime = (s: number) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  if (!isOpen || !event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col bg-phantom-dark overflow-hidden"
        >
          {/* Ambient glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full blur-[100px] bg-[#73FFE4]/8" />
            <div className="absolute top-1/3 -right-24 w-48 h-48 rounded-full blur-[100px] bg-phantom-secondary-a/6" />
          </div>

          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-[13px] font-medium text-white/50 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#73FFE4]" />
              <span className="text-[12px] font-bold text-[#73FFE4]">Phantom Vision</span>
            </div>

            {status === 'loading' && (
              <span className="text-[11px] text-white/30 font-mono tabular-nums">
                {formatTime(elapsed)}
              </span>
            )}
            <div className="w-12" />
          </div>

          {/* Event title */}
          <div className="relative z-10 px-5 mb-4">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/25 mb-2 inline-block">
              {event.category}
            </span>
            <h1 className="text-[17px] font-bold leading-snug text-white">
              {event.question}
            </h1>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-white/[0.06] mb-4" />

          {/* Content area */}
          <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-28">
            <AnimatePresence mode="wait">
              {status === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  {/* Ghost loader */}
                  <div className="w-full max-w-[260px] mb-6">
                    <Ghost3D />
                  </div>

                  <p className="text-[13px] font-medium text-white/60 mb-1">
                    Analyzing market data...
                  </p>
                  <p className="text-[11px] text-white/30 mb-6">
                    Phantom Vision is processing the event through the AI pipeline
                  </p>

                  {/* Skeleton content */}
                  <div className="w-full">
                    <VisionSkeleton />
                  </div>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Success header */}
                  <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/[0.06]">
                    <div className="w-6 h-6 rounded-full bg-[#73FFE4]/15 flex items-center justify-center">
                      <Eye className="w-3.5 h-3.5 text-[#73FFE4]" />
                    </div>
                    <span className="text-[12px] font-bold text-[#73FFE4]">Analysis Complete</span>
                    <span className="text-[10px] text-white/25 ml-auto">
                      {formatTime(elapsed)}
                    </span>
                  </div>

                  {/* Output */}
                  <RenderOutput text={output} />
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                  </div>
                  <p className="text-[15px] font-bold text-white/80 mb-2">
                    Analysis Failed
                  </p>
                  <p className="text-[13px] text-white/40 mb-6 max-w-xs">
                    {errorMsg}
                  </p>
                  <button
                    onClick={runVision}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card text-white/70 hover:text-white text-[13px] font-medium transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom bar — sticky */}
          <div className="fixed bottom-0 left-0 right-0 z-20 px-5 py-4 border-t border-white/[0.04] bg-phantom-dark/80 backdrop-blur-xl">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #406CFF, #6A00FF)',
                boxShadow: '0 8px 32px rgba(64,108,255,0.25)',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Markets
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}