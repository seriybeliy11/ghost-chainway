'use client';

import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const Ghost3D = dynamic(() => import('@/components/phantom/Ghost3D'), {
  ssr: false,
  loading: () => <div className="w-full h-36" />,
});

interface RefreshModalProps {
  isOpen: boolean;
  isDark?: boolean;
}

export default function RefreshModal({ isOpen, isDark = true }: RefreshModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
            className="relative w-72 rounded-3xl overflow-hidden"
          >
            <div
              className="relative backdrop-blur-2xl border p-6 flex flex-col items-center transition-colors duration-300"
              style={{
                background: isDark
                  ? 'rgba(13,13,36,0.95)'
                  : 'rgba(255,255,255,0.92)',
                borderColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.08)',
                boxShadow: isDark
                  ? '0 24px 80px rgba(115,255,228,0.08)'
                  : '0 24px 80px rgba(0,0,0,0.08)',
              }}
            >
              {/* Background glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute inset-0 transition-colors duration-300 ${
                    isDark
                      ? 'bg-gradient-to-b from-[#73FFE4]/10 via-transparent to-[#6A00FF]/5'
                      : 'bg-gradient-to-b from-[#73FFE4]/8 via-transparent to-[#7C3AED]/4'
                  }`}
                />
              </div>

              {/* Ghost 3D — white bg wrapper in light mode for contrast */}
              <div
                className={`relative z-10 w-full h-40 -mb-2 rounded-2xl overflow-hidden transition-colors duration-300 ${
                  isDark ? '' : 'bg-white/80'
                }`}
              >
                <Ghost3D />
              </div>

              {/* Text */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative z-10 text-center"
              >
                <p className={`text-sm font-semibold mb-1 transition-colors duration-300 ${
                  isDark ? 'text-white/90' : 'text-gray-800'
                }`}>
                  Refreshing markets
                </p>
                <motion.p
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className={`text-[11px] transition-colors duration-300 ${
                    isDark ? 'text-phantom-text-secondary' : 'text-gray-500'
                  }`}
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