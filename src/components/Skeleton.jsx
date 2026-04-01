import { motion } from 'framer-motion'

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 2.2,
    repeat: Infinity,
    ease: 'linear',
  },
}

const shimmerStyle = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(244,196,48,0.07) 50%, rgba(255,255,255,0.03) 100%)',
  backgroundSize: '200% 100%',
}

function SkeletonBox({ className = '' }) {
  return (
    <motion.div
      animate={shimmer.animate}
      transition={shimmer.transition}
      style={shimmerStyle}
      className={`rounded-sm bg-bg-secondary ${className}`}
    />
  )
}

export function YearbookSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <YearbookCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function YearbookCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2">
      <SkeletonBox className="aspect-[3/4] w-full rounded-2xl" />
      <SkeletonBox className="h-4 w-3/4 mt-2" />
      <SkeletonBox className="h-3 w-1/2" />
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 p-5 bg-bg-secondary/50 rounded-sm" style={{ transform: `rotate(${(i % 3 - 1) * 2}deg)` }}>
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-5/6" />
          <SkeletonBox className="h-3 w-4/6 mt-1" />
          <SkeletonBox className="h-2.5 w-1/3 mt-3" />
        </div>
      ))}
    </div>
  )
}

export function GallerySkeleton() {
  const heights = ['pb-[140%]', 'pb-[60%]', 'pb-[100%]', 'pb-[120%]', 'pb-[75%]', 'pb-[90%]']
  return (
    <div className="masonry-grid">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="masonry-item">
          <SkeletonBox className={`relative w-full ${heights[i % heights.length]}`} />
        </div>
      ))}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-full border border-accent-yellow/20 border-t-accent-yellow"
      />
      <motion.p
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="font-mono text-[10px] tracking-[0.4em] text-muted/40 uppercase"
      >
        Loading
      </motion.p>
    </div>
  )
}
