'use client';

import GhostIcon from '@/components/phantom/GhostIcon';

interface MagicOrbProps {
  onClick?: () => void;
}

const ORB_SIZE = 260;
const RING_SIZE = ORB_SIZE + 48;

export default function MagicOrb({ onClick }: MagicOrbProps) {
  const ringPad = (RING_SIZE - ORB_SIZE) / 2;

  return (
    <button
      onClick={onClick}
      className="relative cursor-pointer focus:outline-none group select-none"
      style={{ width: ORB_SIZE, height: ORB_SIZE }}
      aria-label="Consult the Oracle"
    >
      {/* ── Ambient glow (gentle breathing) ── */}
      <div
        className="absolute rounded-full pointer-events-none orb-glow-breathe"
        style={{
          inset: -100,
          background: 'radial-gradient(circle, rgba(64,108,255,0.5) 0%, rgba(106,0,255,0.2) 30%, rgba(0,255,205,0.08) 50%, transparent 70%)',
          filter: 'blur(60px)',
          transformOrigin: 'center',
        }}
      />

      {/* ── Teal glow (slow breathing, offset phase) ── */}
      <div
        className="absolute rounded-full pointer-events-none orb-glow-breathe"
        style={{
          inset: -70,
          background: 'radial-gradient(circle, rgba(0,255,205,0.25) 0%, transparent 55%)',
          filter: 'blur(45px)',
          animationDelay: '2s',
          transformOrigin: 'center',
        }}
      />

      {/* ── Outer ring (slow rotation) ── */}
      <div
        className="absolute pointer-events-none orb-ring-spin"
        style={{
          width: RING_SIZE,
          height: RING_SIZE,
          left: -ringPad,
          top: -ringPad,
          transformOrigin: 'center',
        }}
      >
        <svg className="w-full h-full" viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <defs>
            <linearGradient id="orb-ring-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#406CFF" />
              <stop offset="40%" stopColor="#6A00FF" />
              <stop offset="100%" stopColor="#00FFCD" />
            </linearGradient>
          </defs>
          <circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_SIZE / 2 - 4}
            fill="none"
            stroke="url(#orb-ring-1)"
            strokeWidth="1.5"
            strokeDasharray="10 14"
            opacity="0.35"
          />
        </svg>
      </div>

      {/* ── Inner ring (slow counter-rotation) ── */}
      <div
        className="absolute pointer-events-none orb-ring-spin-rev"
        style={{
          width: RING_SIZE - 20,
          height: RING_SIZE - 20,
          left: -(ringPad - 10),
          top: -(ringPad - 10),
          transformOrigin: 'center',
        }}
      >
        <svg className="w-full h-full" viewBox={`0 0 ${RING_SIZE - 20} ${RING_SIZE - 20}`}>
          <defs>
            <linearGradient id="orb-ring-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7393FF" />
              <stop offset="100%" stopColor="#00FFCD" />
            </linearGradient>
          </defs>
          <circle
            cx={(RING_SIZE - 20) / 2} cy={(RING_SIZE - 20) / 2} r={(RING_SIZE - 20) / 2 - 4}
            fill="none"
            stroke="url(#orb-ring-2)"
            strokeWidth="1"
            strokeDasharray="5 18"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* ── 3 marker dots on ring (slow orbit) ── */}
      <div
        className="absolute pointer-events-none orb-marker-orbit"
        style={{
          width: RING_SIZE,
          height: RING_SIZE,
          left: -ringPad,
          top: -ringPad,
          transformOrigin: 'center',
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 5, height: 5, background: '#406CFF', boxShadow: '0 0 10px rgba(64,108,255,0.6)' }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full"
          style={{ width: 4, height: 4, background: '#00FFCD', boxShadow: '0 0 8px rgba(0,255,205,0.5)' }}
        />
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 4, height: 4, background: '#8F40FF', boxShadow: '0 0 8px rgba(143,64,255,0.5)' }}
        />
      </div>

      {/* ── Conic gradient swirl (slow rotation) ── */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 rounded-full orb-swirl-spin"
          style={{
            background: 'conic-gradient(from 0deg, rgba(64,108,255,0.08), rgba(106,0,255,0.12), rgba(0,255,205,0.06), rgba(143,64,255,0.1), rgba(0,255,205,0.04), rgba(64,108,255,0.08))',
            transformOrigin: 'center',
          }}
        />
      </div>

      {/* ── Sphere body ── */}
      <div className="relative w-full h-full rounded-full overflow-hidden">
        {/* ── Main sphere gradient (3D convexity) ── */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 34% 26%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 8%, transparent 22%),
              radial-gradient(circle at 65% 70%, rgba(0,20,60,0.4) 0%, rgba(0,0,0,0.2) 40%, transparent 70%),
              radial-gradient(ellipse at 30% 75%, rgba(106,0,255,0.12) 0%, transparent 50%),
              radial-gradient(circle at 50% 45%, transparent 20%, rgba(80,120,255,0.15) 45%, rgba(64,108,255,0.35) 65%, rgba(64,30,180,0.25) 80%, rgba(0,0,0,0.3) 100%),
              radial-gradient(circle at 50% 50%, rgba(64,108,255,0.1), rgba(20,10,60,0.15) 50%, rgba(0,0,0,0.15) 100%)
            `,
            boxShadow: '0 0 40px rgba(64,108,255,0.3), 0 0 80px rgba(64,108,255,0.12), inset 0 0 40px rgba(64,108,255,0.15), inset 0 -12px 25px rgba(0,0,0,0.12), inset 0 5px 12px rgba(255,255,255,0.03)',
            border: '1.5px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* ── Specular highlight (top-left) ── */}
          <div
            className="absolute rounded-full"
            style={{
              top: '8%',
              left: '12%',
              width: '40%',
              height: '32%',
              background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.5), rgba(255,255,255,0.15) 40%, transparent 70%)',
              filter: 'blur(6px)',
            }}
          />

          {/* ── Tight specular point ── */}
          <div
            className="absolute rounded-full"
            style={{
              top: '14%',
              left: '20%',
              width: '12%',
              height: '10%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.8), rgba(255,255,255,0.2) 50%, transparent)',
            }}
          />

          {/* ── Secondary highlight (right side) ── */}
          <div
            className="absolute rounded-full"
            style={{
              top: '22%',
              right: '18%',
              width: '10%',
              height: '8%',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.18), transparent 70%)',
              filter: 'blur(3px)',
            }}
          />

          {/* ── Bottom rim light ── */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: '6%',
              right: '15%',
              width: '30%',
              height: '16%',
              background: 'radial-gradient(ellipse, rgba(115,147,255,0.2), transparent 70%)',
            }}
          />

          {/* ── Center: outline ghost icon (subtle pulse) ── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="orb-ghost-pulse group-hover:[animation-play-state:paused]">
              <GhostIcon size={46} outline />
            </div>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] group-hover:text-white/35 transition-all duration-300">
              Phantom
            </span>
          </div>

          {/* ── Bottom glass reflection ── */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: 0,
              left: '18%',
              right: '18%',
              height: '28%',
              background: 'linear-gradient(to top, rgba(255,255,255,0.06), transparent)',
              borderRadius: '0 0 999px 999px',
            }}
          />

          {/* ── Edge light (rim) ── */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, transparent 70%, rgba(255,255,255,0.06) 85%, rgba(255,255,255,0.02) 95%, transparent 100%)',
            }}
          />
        </div>
      </div>
    </button>
  );
}
