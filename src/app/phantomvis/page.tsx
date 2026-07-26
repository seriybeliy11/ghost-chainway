'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useMemo, useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useContext } from 'react';
import { UserContext } from '@/lib/user-context';

const DIFY_CHATFLOW_TOKEN = 'app-5UMx9tU7wkwS5FZFIH4JKDdW';
const DIFY_CHATFLOW_BASE = 'https://udify.app/chatbot';

function PhantomVisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshUser } = useContext(UserContext);
  const [debited, setDebited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventUrl = searchParams.get('url') || '';
  const query = searchParams.get('query') || '';
  const slug = searchParams.get('slug') || '';

  // Debit one generation on mount
  useEffect(() => {
    if (debited || !user?.id) return;

    fetch('/api/debit-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId: user.id, eventSlug: slug, eventQuestion: query }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setDebited(true);
          refreshUser();
        } else {
          setError(data.error || 'Failed to start');
        }
      })
      .catch(() => setError('Network error'));
  }, [debited, user?.id, slug, query, refreshUser]);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    if (eventUrl) params.set('event_url', eventUrl);
    if (query) params.set('userinput.query', query);
    params.set('auto_start', '1');
    return `${DIFY_CHATFLOW_BASE}/${DIFY_CHATFLOW_TOKEN}?${params.toString()}`;
  }, [eventUrl, query]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A1628] p-6">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5 bg-red-500/10 border border-red-500/15">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-[17px] font-bold text-white mb-2">Failed to start</h3>
        <p className="text-[14px] text-white/40 mb-6 text-center">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 rounded-2xl text-white font-semibold text-[14px] cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #057D9F, #03436A)' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!debited) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A1628]">
        <Loader2 className="w-6 h-6 animate-spin text-[#057D9F] mb-3" />
        <p className="text-[14px] text-white/40">Starting Phantom Vision...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A1628]">
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-4 pb-3 backdrop-blur-xl border-b border-white/[0.06] bg-[#0A1628]/90">
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white truncate">Phantom Vision</p>
          <p className="text-[11px] text-white/35">AI Analysis</p>
        </div>
      </div>

      {/* Dify Chatflow iframe */}
      <iframe
        src={iframeSrc}
        className="flex-1 w-full border-0"
        allow="microphone"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
}

export default function PhantomVisPage() {
  return (
    <Suspense>
      <PhantomVisContent />
    </Suspense>
  );
}