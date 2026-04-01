import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9 }}
      >
        {/* Big 404 */}
        <div className="font-display text-[clamp(6rem,20vw,14rem)] text-accent-yellow/10 font-light leading-none select-none mb-0">
          404
        </div>

        <div className="-mt-4 mb-8">
          <h1 className="font-display text-3xl md:text-4xl italic text-text-primary/60 mb-3">
            This memory doesn't exist.
          </h1>
          <p className="font-body text-sm text-muted/50 max-w-sm mx-auto">
            The page you're looking for has either been moved, deleted, or never existed in this archive.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-8 h-px bg-accent-yellow/20" />
          <span className="font-mono text-[9px] tracking-widest text-muted/30 uppercase">Lost in the archive</span>
          <div className="w-8 h-px bg-accent-yellow/20" />
        </div>

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(244,196,48,0.25)' }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-3.5 bg-accent-yellow text-bg-primary font-mono text-xs tracking-[0.3em] uppercase hover:bg-soft-yellow transition-colors"
          >
            Go Home →
          </motion.button>
        </Link>
      </motion.div>

      {/* Decorative */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-12 font-mono text-[8px] text-muted/20 tracking-widest uppercase"
      >
        Batch 2024–26 · Memory Archive
      </motion.div>
    </main>
  )
}
