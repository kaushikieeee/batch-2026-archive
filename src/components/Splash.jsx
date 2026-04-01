import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Splash({ onEnter }) {
  const [phase, setPhase] = useState('idle') // idle | leaving

  const handleEnter = () => {
    setPhase('leaving')
    setTimeout(onEnter, 450)
  }

  // Auto-show after brief pause
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {phase !== 'leaving' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#0e0e0e' }}
        >
          {/* Animated radial background */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                'radial-gradient(ellipse at 40% 50%, rgba(244,196,48,0.07) 0%, transparent 65%)',
                'radial-gradient(ellipse at 60% 45%, rgba(244,196,48,0.10) 0%, transparent 65%)',
                'radial-gradient(ellipse at 50% 55%, rgba(244,196,48,0.07) 0%, transparent 65%)',
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror' }}
          />

          {/* Grain on splash too */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Content */}
          <div className="relative z-10 text-center px-6">
            {/* Top line */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="w-16 h-px bg-accent-yellow/40 mx-auto mb-10"
            />

            {/* Year label */}
            <motion.p
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="font-mono text-[10px] tracking-[0.5em] text-accent-yellow/60 uppercase mb-6"
            >
              Class of 2026
            </motion.p>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="font-archive text-[clamp(3.5rem,12vw,8rem)] font-light text-accent-yellow leading-none text-glow mb-4"
            >
              TheArchive
            </motion.h1>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.45, delay: 0.34 }}
              className="font-display text-xl md:text-2xl  text-text-primary/40 mb-14 leading-relaxed"
            >
              A journey we'll always carry.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.44 }}
            >
              <motion.button
                onClick={handleEnter}
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(244,196,48,0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="relative group px-14 py-4 border border-accent-yellow/40 text-accent-yellow font-mono text-xs tracking-[0.35em] uppercase overflow-hidden hover:border-accent-yellow transition-colors duration-300"
              >
                <motion.div
                  className="absolute inset-0 bg-accent-yellow"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.18 }}
                  style={{ transformOrigin: 'left' }}
                />
                <span className="relative z-10 group-hover:text-bg-primary transition-colors duration-300">
                  Enter
                </span>
              </motion.button>
            </motion.div>

            {/* Bottom line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.55 }}
              className="mt-16 w-full max-w-[min(90vw,560px)] mx-auto flex items-center justify-center gap-3"
            >
              <div className="h-px flex-1 min-w-6 bg-muted/20" />
              <span className="font-mono text-[8px] tracking-[0.35em] text-muted/30 uppercase text-center whitespace-nowrap">
                Memory Archive · Localhost Edition
              </span>
              <div className="h-px flex-1 min-w-6 bg-muted/20" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
