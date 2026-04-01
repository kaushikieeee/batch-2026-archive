import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'

// const WORDS = [] // Removed scrolling text as requested

const blurUp = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
  },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.3 } },
}

export default function Hero() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  // Removed scrolling text state and effect

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse at 30% 40%, rgba(244,196,48,0.07) 0%, transparent 60%)',
            'radial-gradient(ellipse at 70% 55%, rgba(244,196,48,0.10) 0%, transparent 60%)',
            'radial-gradient(ellipse at 50% 35%, rgba(244,196,48,0.07) 0%, transparent 60%)',
          ],
        }}
        transition={{ duration: 9, repeat: Infinity, repeatType: 'mirror' }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-28 bg-gradient-to-b from-transparent via-accent-yellow/25 to-transparent" />
      <motion.div
        style={{ y, opacity }}
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        <motion.div variants={blurUp} className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-px bg-accent-yellow/35" />
          <span className="font-mono text-[10px] tracking-[0.45em] text-accent-yellow/65 uppercase">Class of 2026</span>
          <div className="w-12 h-px bg-accent-yellow/35" />
        </motion.div>
        <motion.h1
          variants={blurUp}
          className="font-display text-[clamp(4rem,14vw,9rem)] font-light text-accent-yellow text-glow leading-none mb-2"
        >
          Batch
        </motion.h1>
        <motion.h1
          variants={blurUp}
          className="font-display text-[clamp(3rem,10vw,7rem)] font-light italic text-text-primary/80 leading-none mb-6"
        >
          2024 – 26
        </motion.h1>
        <motion.p
          variants={blurUp}
          className="font-display text-lg md:text-xl italic text-text-primary/40 mb-8 tracking-wide"
        >
          Four years. A thousand moments. One story.
        </motion.p>
        {/* Removed scrolling word animation */}
        <motion.div variants={blurUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/journey">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(244,196,48,0.32)' }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-11 py-4 bg-accent-yellow text-bg-primary font-body font-semibold text-xs tracking-[0.3em] uppercase overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-soft-yellow"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />
              <span className="relative z-10">Start the Journey</span>
            </motion.button>
          </Link>
          <Link to="/wall">
            <motion.button
              whileHover={{ scale: 1.03, borderColor: 'rgba(244,196,48,0.6)' }}
              whileTap={{ scale: 0.97 }}
              className="px-11 py-4 border border-accent-yellow/25 text-text-primary font-body text-xs tracking-[0.3em] uppercase transition-colors duration-300"
            >
              Leave a Message
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[8px] tracking-[0.4em] text-muted/50 uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-accent-yellow/40 to-transparent"
        />
      </motion.div>
      <div className="absolute top-32 left-6 hidden md:block font-mono text-[9px] text-accent-yellow/15 tracking-[0.4em] rotate-90 origin-left select-none">MEMORY ARCHIVE</div>
      <div className="absolute top-32 right-6 hidden md:block font-mono text-[9px] text-accent-yellow/15 tracking-[0.4em] -rotate-90 origin-right select-none">2024 – 2026</div>
    </section>
  )
}
