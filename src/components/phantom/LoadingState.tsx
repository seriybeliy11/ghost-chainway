'use client';

import { motion } from 'framer-motion';
import Ghost3D from './Ghost3D';
import SkeletonCard from './SkeletonCard';

interface LoadingStateProps {
  isInitialLoad?: boolean;
}

export default function LoadingState({ isInitialLoad = true }: LoadingStateProps) {
  return (
    <div className="space-y-6">
      {/* 3D Ghost branding during initial load */}
      {isInitialLoad && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <Ghost3D />
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-center"
          >
            <p className="text-sm font-medium text-phantom-text-secondary">
              Scanning the markets...
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Skeleton cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    </div>
  );
}