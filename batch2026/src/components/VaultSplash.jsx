import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VaultSplash({ onEnter }) {
  const [leaving, setLeaving] = useState(false)

  const handleEnter = () => {
    setLeaving(true)
    setTimeout(onEnter, 700)
  }

  const lines = [
    'Moments That Defined Us',
    'Meet Our Class',
    'Frames We'll Never Forget',
  ]

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.7 }}
          className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20"
        >
          {/* Floating quote cycle */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-4"
          >
            <span className="font-mono text-[10px] tracking-[0.4em] text-accent-yellow/50 uppercase">
              Archive Access
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl md:text-7xl text-accent-yellow text-glow italic leading-tight mb-6"
          >
            Moments That
            <br />
            <span className="text-text-primary/70 not-italic font-light">Defined Us.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="font-body text-base text-muted max-w-xs mx-auto leading-relaxed mb-12"
          >
            Every photograph holds a version of us we were still becoming.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
          >
            <motion.button
              onClick={handleEnter}
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(244,196,48,0.3)' }}
              whileTap={{ scale: 0.96 }}
              className="group relative px-12 py-4 border border-accent-yellow/40 text-accent-yellow font-mono text-xs tracking-[0.3em] uppercase overflow-hidden hover:border-accent-yellow transition-colors duration-300"
            >
              <motion.div
                className="absolute inset-0 bg-accent-yellow"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />
              <span className="relative z-10 group-hover:text-bg-primary transition-colors duration-300">
                Enter the Archive
              </span>
            </motion.button>
          </motion.div>

          {/* Decorative dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex gap-2 mt-12"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-accent-yellow/40"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
