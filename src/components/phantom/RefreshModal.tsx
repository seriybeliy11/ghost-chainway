'use client';

import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const Ghost3D = dynamic(() => import('@/components/phantom/Ghost3D'), {
  ssr: false,
  loading: () => <div className="w-full h-36" />,
});

interface RefreshModalProps {
  isOpen: boolean;
}

export default function RefreshModal({ isOpen }: RefreshModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.7 }}
            className="relative w-72 rounded-3xl overflow-hidden"
          >
            <div
              className="relative backdrop-blur-2xl border p-6 flex flex-col items-center"
              style={{
                background: 'rgba(15,30,51,0.95)',
                borderColor: 'rgba(255,255,255,0.1)',
                boxShadow: '0 24px 80px rgba(57,174,207,0.08)',
              }}
            >
              {/* Static subtle glow */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#39AECF]/8 via-transparent to-[#006363]/4" />

              {/* Ghost 3D */}
              <div className="relative z-10 w-full h-40 -mb-2 rounded-2xl overflow-hidden">
                <Ghost3D />
              </div>

              {/* Text */}
              <div className="relative z-10 text-center">
                <p className="text-sm font-semibold mb-1 text-white/90">
                  Refreshing markets
                </p>
                <p className="text-[11px] animate-pulse text-phantom-text-secondary">
                  Scanning for the hottest events...
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}