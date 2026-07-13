'use client';

import { motion } from 'framer-motion';

interface SkeletonCardProps {
  index: number;
}

const darkBgGradients = [
  'from-phantom-primary/15 via-phantom-secondary-a/10 to-phantom-dark',
  'from-phantom-secondary-a/12 via-phantom-secondary-b/8 to-phantom-dark',
  'from-phantom-secondary-b/10 via-phantom-primary/8 to-phantom-dark',
  'from-phantom-secondary-a/10 via-phantom-primary/15 to-phantom-dark',
];

export default function SkeletonCard({ index }: SkeletonCardProps) {
  const bg = darkBgGradients[index % darkBgGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl overflow-hidden h-[190px] border transition-colors duration-300 border-white/[0.08] pulse-glow`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bg}`}>
        <motion.div
          animate={{ x: [0, 12, -8, 4, 0], y: [0, -8, 12, -4, 0], scale: [1, 1.2, 0.9, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -top-8 -left-8 w-24 h-24 rounded-full blur-xl transition-colors duration-300 bg-white/[0.04]`}
        />
        <motion.div
          animate={{ x: [0, -15, 8, -3, 0], y: [0, 12, -8, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-xl transition-colors duration-300 bg-white/[0.03]`}
        />
        <div className={`absolute inset-0 transition-colors duration-300 bg-gradient-to-b from-black/20 via-black/40 to-black/75`} />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <div className="skeleton-shimmer h-5 w-16 rounded-full" />
          <div className="skeleton-shimmer h-5 w-10 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="skeleton-shimmer h-6 w-12 rounded" />
            <div className="skeleton-shimmer h-6 w-12 rounded" />
          </div>
          <div className="skeleton-shimmer h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <div className="skeleton-shimmer h-3 w-16 rounded" />
            <div className="skeleton-shimmer h-3 w-14 rounded" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}