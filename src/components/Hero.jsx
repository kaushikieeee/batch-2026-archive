import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

const MotionLink = motion.create(Link)
// const WORDS = [] // Removed scrolling text as requested

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 4,
}))

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full bg-accent-yellow"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-12, 12, -12], opacity: [0.08, 0.35, 0.08] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

const up = {
  hidden: { opacity: 0, y: 44, filter: 'blur(12px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

export default function Hero() {
  const ref = useRef(null)
  // Removed scrolling text state and effect

  return (
    <section ref={ref} className="hero-section">
      {/* Animated bg gradient */}
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ background: [
          'radial-gradient(ellipse at 25% 40%, rgba(244,196,48,0.09) 0%, transparent 55%)',
          'radial-gradient(ellipse at 75% 55%, rgba(244,196,48,0.12) 0%, transparent 55%)',
          'radial-gradient(ellipse at 50% 30%, rgba(244,196,48,0.08) 0%, transparent 55%)',
        ]}}
        transition={{ duration: 9, repeat: Infinity, repeatType: 'mirror' }}
      />

      <FloatingParticles />

      {/* Vertical line top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 md:h-28
                      bg-gradient-to-b from-transparent via-accent-yellow/20 to-transparent" />

      {/* Content — plain div for centering, no Framer Motion */}
      <div className="hero-center">
        <div className="text-center px-5 max-w-5xl w-full">

          {/* Label */}
          <div className="flex items-center justify-center gap-3 mb-8 md:mb-10">
            <div className="w-8 md:w-12 h-px bg-accent-yellow/30" />
            <span className="font-mono text-[9px] md:text-[10px] tracking-[0.4em] text-accent-yellow/60 uppercase">Batch 2024–2026</span>
            <div className="w-8 md:w-12 h-px bg-accent-yellow/30" />
          </div>

          {/* Main title */}
          <h1 className="font-archive text-[clamp(3.2rem,13vw,9.5rem)] text-accent-yellow text-glow leading-none mb-4 md:mb-5">
            TheArchive
          </h1>

          {/* Subtitle */}
          <p className="font-display text-[clamp(0.95rem,2.5vw,1.2rem)] italic text-text-primary/35 mb-7 md:mb-8 tracking-wide">
            2024–2026 · a thousand moments · one story
          </p>

          {/* Removed scrolling word animation */}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <MotionLink to="/journey"
              whileHover={{ scale: 1.04, boxShadow: '0 0 36px rgba(244,196,48,0.38)' }}
              whileTap={{ scale: 0.96 }}
              className="relative w-full sm:w-auto px-8 md:px-11 py-3.5 md:py-4 bg-accent-yellow text-bg-primary
                         font-body font-semibold text-xs tracking-[0.28em] uppercase overflow-hidden rounded-sm text-center">
              <motion.div className="absolute inset-0 bg-soft-yellow"
                initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.25 }} style={{ transformOrigin: 'left' }} />
              <span className="relative z-10">Start the Journey</span>
            </MotionLink>

            <MotionLink to="/wall"
              whileHover={{ scale: 1.04, borderColor: 'rgba(244,196,48,0.55)' }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto px-8 md:px-11 py-3.5 md:py-4 border border-accent-yellow/22
                         text-text-primary font-body text-xs tracking-[0.28em] uppercase
                         transition-all duration-300 rounded-sm text-center glass">
              Leave a Message
            </MotionLink>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
        className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-2">
        <span className="font-mono text-[8px] tracking-[0.4em] text-muted/50 uppercase">Scroll To Explore</span>
        <motion.div animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-7 bg-gradient-to-b from-accent-yellow/40 to-transparent" />
      </motion.div>

      {/* Corner labels */}
      <div className="absolute top-32 left-5 hidden lg:block font-mono text-[7px] text-accent-yellow/10 tracking-[0.4em] rotate-90 origin-left select-none">MEMORY ARCHIVE</div>
      <div className="absolute top-32 right-5 hidden lg:block font-mono text-[7px] text-accent-yellow/10 tracking-[0.4em] -rotate-90 origin-right select-none">2024 – 2026</div>
    </section>
  )
}
