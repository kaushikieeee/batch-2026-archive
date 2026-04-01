import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function StoryBridge({ text, sub, align = 'center' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const alignClass = {
    center: 'text-center mx-auto',
    left: 'text-left',
    right: 'text-right ml-auto',
  }[align]

  return (
    <div ref={ref} className={`py-20 px-6 max-w-2xl ${alignClass}`}>
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={inView ? { opacity: 1, scaleX: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="w-8 h-px bg-accent-yellow/40 mb-6 mx-auto"
        style={{ transformOrigin: align === 'right' ? 'right' : 'left' }}
      />

      <motion.p
        initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
        animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-2xl md:text-3xl italic text-text-primary/50 leading-relaxed"
      >
        {text}
      </motion.p>

      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-body text-sm text-muted mt-4"
        >
          {sub}
        </motion.p>
      )}
    </div>
  )
}
