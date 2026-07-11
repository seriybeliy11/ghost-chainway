'use client';

import { motion } from 'framer-motion';

interface SkeletonCardProps {
  index: number;
}

export default function SkeletonCard({ index }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-2xl p-5 space-y-4 pulse-glow"
    >
      {/* Category badge skeleton */}
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer h-5 w-16 rounded-full" />
        <div className="skeleton-shimmer h-4 w-12 rounded-md" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="skeleton-shimmer h-5 w-full rounded-lg" />
        <div className="skeleton-shimmer h-5 w-3/4 rounded-lg" />
      </div>

      {/* Probability bar skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <div className="skeleton-shimmer h-4 w-12 rounded" />
          <div className="skeleton-shimmer h-4 w-12 rounded" />
        </div>
        <div className="h-2.5 rounded-full overflow-hidden skeleton-shimmer" />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-2">
        <div className="skeleton-shimmer h-4 w-24 rounded" />
        <div className="skeleton-shimmer h-4 w-20 rounded" />
      </div>
    </motion.div>
  );
}