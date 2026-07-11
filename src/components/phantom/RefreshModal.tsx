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
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-72 rounded-3xl overflow-hidden"
          >
            {/* Glass container */}
            <div className="relative bg-[#0D0D24]/95 backdrop-blur-2xl border border-white/[0.1] shadow-[0_24px_80px_rgba(64,108,255,0.12)] p-6 flex flex-col items-center">
              {/* Background glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-b from-phantom-primary/10 via-transparent to-phantom-secondary-a/5"
                />
              </div>

              {/* Ghost 3D */}
              <div className="relative z-10 w-full h-40 -mb-2">
                <Ghost3D />
              </div>

              {/* Text */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative z-10 text-center"
              >
                <p className="text-sm font-semibold text-white/90 mb-1">
                  Refreshing markets
                </p>
                <motion.p
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[11px] text-phantom-text-secondary"
                >
                  Scanning for the hottest events...
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}