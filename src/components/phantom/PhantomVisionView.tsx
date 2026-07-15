'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useContext } from 'react';
import { ArrowLeft, Copy, Check, AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import GhostIcon from './GhostIcon';
import { UserContext } from '@/lib/user-context';

interface PhantomVisionViewProps {
  isOpen: boolean;
  event: {
    id: string;
    slug: string;
    question: string;
    category?: string;
  } | null;
  onClose: () => void;
}

/* ─── Flying Ghost Particle ─── */
function FlyingGhost({ delay, size, startX, duration }: {
  delay: number;
  size: number;
  startX: number;
  duration: number;
}) {
  return (
    <motion.div
      initial={{ y: '110vh', x: startX, opacity: 0 }}
      animate={{
        y: '-20vh',
        x: startX + (Math.random() - 0.5) * 80,
        opacity: [0, 0.6, 0.4, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className="absolute"
      style={{ willChange: 'transform, opacity' }}
    >
      <GhostIcon size={size} className="text-[#057D9F] opacity-60" />
    </motion.div>
  );
}

/* ─── Loading State ─── */
function LoadingState() {
  const ghosts = [
    { delay: 0, size: 28, startX: 10, duration: 8 },
    { delay: 1.2, size: 18, startX: 30, duration: 10 },
    { delay: 0.6, size: 36, startX: 55, duration: 7 },
    { delay: 2, size: 14, startX: 75, duration: 11 },
    { delay: 0.3, size: 22, startX: 85, duration: 9 },
    { delay: 1.8, size: 16, startX: 45, duration: 12 },
    { delay: 0.9, size: 24, startX: 20, duration: 8.5 },
    { delay: 2.5, size: 12, startX: 65, duration: 10.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {ghosts.map((g, i) => (
        <FlyingGhost key={i} {...g} />
      ))}

      {/* Central pulsing glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-48 h-48 rounded-full bg-[#057D9F]/20 blur-[60px]"
        />
      </div>
    </div>
  );
}

/* ─── Status messages ─── */
const STATUS_MESSAGES = [
  'Scanning the market...',
  'Phantom is analyzing patterns...',
  'Processing prediction data...',
  'Generating insights...',
  'Finalizing vision...',
];

/* ─── Result View ─── */
function ResultView({
  result,
  question,
  onCopy,
  copied,
}: {
  result: string;
  question: string;
  onCopy: () => void;
  copied: boolean;
}) {
  const sections = result.split('\n').filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          <span className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-wider">
            Analysis Complete
          </span>
        </div>
        <h2 className="text-[17px] font-bold text-white leading-snug pr-10">
          {question}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <div className="space-y-3 mt-2">
          {sections.map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('## ')) {
              return <h3 key={i} className="text-[15px] font-bold text-white pt-2">{trimmed.replace('## ', '')}</h3>;
            }
            if (trimmed.startsWith('# ')) {
              return <h3 key={i} className="text-[16px] font-bold text-[#057D9F] pt-1">{trimmed.replace('# ', '')}</h3>;
            }
            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
              return <p key={i} className="text-[14px] font-bold text-white/90">{trimmed.replace(/\*\*/g, '')}</p>;
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
              return (
                <div key={i} className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#057D9F] mt-2 shrink-0" />
                  <p className="text-[14px] text-white/70 leading-relaxed">
                    {renderInlineBold(trimmed.replace(/^[-•]\s*/, ''))}
                  </p>
                </div>
              );
            }
            if (/^\d+\.\s/.test(trimmed)) {
              const num = trimmed.match(/^(\d+)\./)?.[1];
              return (
                <div key={i} className="flex gap-2.5">
                  <span className="text-[14px] font-bold text-[#057D9F] shrink-0">{num}.</span>
                  <p className="text-[14px] text-white/70 leading-relaxed">{renderInlineBold(trimmed.replace(/^\d+\.\s*/, ''))}</p>
                </div>
              );
            }
            return <p key={i} className="text-[14px] text-white/65 leading-relaxed">{renderInlineBold(trimmed)}</p>;
          })}
        </div>
      </div>

      {/* Bottom action */}
      <div className="shrink-0 fixed bottom-0 left-0 right-0 z-10 px-5 py-3 border-t border-white/[0.06] backdrop-blur-2xl bg-[#0A1628]/90"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <button
          onClick={onCopy}
          className="w-full py-3 rounded-2xl text-white font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.97] cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #057D9F, #03436A)' }}
        >
          {copied ? (<><Check className="w-4 h-4" />Copied!</>) : (<><Copy className="w-4 h-4" />Copy Analysis</>)}
        </button>
      </div>
    </motion.div>
  );
}

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={i} className="font-semibold text-white/90">{part.replace(/\*\*/g, '')}</span>;
    }
    return part;
  });
}

export default function PhantomVisionView({
  isOpen,
  event,
  onClose,
}: PhantomVisionViewProps) {
  const { user } = useContext(UserContext);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no_gens'>('loading');
  const [result, setResult] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState(STATUS_MESSAGES[0]);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status !== 'loading') return;
    const interval = setInterval(() => {
      setStatusMsg(prev => {
        const idx = STATUS_MESSAGES.indexOf(prev);
        return STATUS_MESSAGES[(idx + 1) % STATUS_MESSAGES.length];
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== 'loading') return;
    const interval = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const fetchVision = useCallback(async () => {
    if (!event?.slug) return;
    setStatus('loading');
    setResult('');
    setErrorMessage('');
    setElapsed(0);

    try {
      const eventUrl = `https://gamma.polymarket.com/events/${event.slug}`;
      const body: Record<string, string> = { url: eventUrl, eventQuestion: event.question };
      if (user?.id) body.telegramId = String(user.id);

      const res = await fetch('/api/phantom-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok && data.code === 'NO_GENERATIONS') {
        setStatus('no_gens');
        setErrorMessage(data.error || 'No generations left');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      if (data.success && data.outputs) {
        const outputKeys = Object.keys(data.outputs);
        const textKey = outputKeys.find(k =>
          k.toLowerCase().includes('text') ||
          k.toLowerCase().includes('result') ||
          k.toLowerCase().includes('output') ||
          k.toLowerCase().includes('analysis') ||
          k.toLowerCase().includes('response')
        ) || outputKeys[0];

        const text = String(data.outputs[textKey] || JSON.stringify(data.outputs, null, 2));
        setResult(text);
        setStatus('success');
      } else {
        throw new Error('No output received from pipeline');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(msg);
      setStatus('error');
    }
  }, [event?.slug, event?.question, user?.id]);

  useEffect(() => {
    if (isOpen && event) {
      fetchVision();
    }
  }, [isOpen, event, fetchVision]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
  };

  return (
    <AnimatePresence>
      {isOpen && event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-[#0A1628] flex flex-col"
        >
          {status === 'loading' && <LoadingState />}

          {/* Top bar */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="shrink-0 z-10 flex items-center gap-3 px-4 pt-4 pb-3 backdrop-blur-xl border-b border-white/[0.06] bg-[#0A1628]/80"
          >
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white truncate">{event.question}</p>
              <p className="text-[11px] text-white/35">
                {status === 'loading' && `Phantom Vision • ${formatTime(elapsed)}`}
                {status === 'success' && 'Analysis Complete'}
                {status === 'error' && 'Error'}
                {status === 'no_gens' && 'No Generations'}
              </p>
            </div>
            {status === 'loading' && (
              <div className="flex gap-1">
                {[0, 0.3, 0.6].map(d => (
                  <motion.div key={d} animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: d }}
                    className="w-1.5 h-1.5 rounded-full bg-[#057D9F]" />
                ))}
              </div>
            )}
          </motion.div>

          {/* Main content area */}
          <div className="relative z-10 flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {status === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full px-8 text-center">
                  <motion.div
                    animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="mb-8"
                  >
                    <div className="relative">
                      <GhostIcon size={56} className="text-[#057D9F]/70" />
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-[#057D9F]/10 blur-xl"
                      />
                    </div>
                  </motion.div>
                  <motion.p key={statusMsg} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[15px] font-semibold text-white/70 mb-2">{statusMsg}</motion.p>
                  <p className="text-[12px] text-white/30">AI is analyzing this market</p>
                </motion.div>
              )}

              {status === 'success' && (
                <ResultView result={result} question={event.question} onCopy={handleCopy} copied={copied} />
              )}

              {status === 'no_gens' && (
                <motion.div key="no_gens" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full px-8 text-center">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5 bg-amber-500/10 border border-amber-500/15">
                    <CreditCard className="w-7 h-7 text-amber-400/70" />
                  </div>
                  <h3 className="text-[17px] font-bold text-white mb-2">No Generations Left</h3>
                  <p className="text-[14px] text-white/40 mb-6 max-w-[280px] leading-relaxed">
                    {errorMessage}
                  </p>
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-white font-semibold text-[14px] transition-all active:scale-[0.97] cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #057D9F, #03436A)' }}
                  >
                    Go to Profile
                  </button>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full px-8 text-center">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5 bg-red-500/10 border border-red-500/15">
                    <AlertCircle className="w-7 h-7 text-red-400/70" />
                  </div>
                  <h3 className="text-[17px] font-bold text-white mb-2">Vision Failed</h3>
                  <p className="text-[14px] text-white/40 mb-6 max-w-[280px] leading-relaxed">{errorMessage}</p>
                  <button onClick={fetchVision}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-white font-semibold text-[14px] transition-all active:scale-[0.97] cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #057D9F, #03436A)' }}
                  >
                    <RefreshCw className="w-4 h-4" />Retry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}