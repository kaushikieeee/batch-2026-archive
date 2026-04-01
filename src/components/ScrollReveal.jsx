import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// Direction presets
const variants = {
  up:    { hidden: { opacity: 0, y: 48, filter: 'blur(8px)' },  show: { opacity: 1, y: 0,  filter: 'blur(0px)' } },
  down:  { hidden: { opacity: 0, y: -36, filter: 'blur(6px)' }, show: { opacity: 1, y: 0,  filter: 'blur(0px)' } },
  left:  { hidden: { opacity: 0, x: -48, filter: 'blur(8px)' }, show: { opacity: 1, x: 0,  filter: 'blur(0px)' } },
  right: { hidden: { opacity: 0, x: 48,  filter: 'blur(8px)' }, show: { opacity: 1, x: 0,  filter: 'blur(0px)' } },
  scale: { hidden: { opacity: 0, scale: 0.85, filter: 'blur(6px)' }, show: { opacity: 1, scale: 1, filter: 'blur(0px)' } },
  fade:  { hidden: { opacity: 0 },                                    show: { opacity: 1 } },
}

export default function ScrollReveal({
  children, direction = 'up', delay = 0, duration = 0.75,
  className = '', once = true, amount = 0.1, as: Tag = 'div'
}) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once, amount, margin: '-40px' })
  const v      = variants[direction]

  return (
    <Tag ref={ref} className={className}>
      <motion.div
        variants={v}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </Tag>
  )
}

// Stagger children wrapper
export function StaggerReveal({ children, className = '', stagger = 0.1, delay = 0 }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger child (use inside StaggerReveal)
export function StaggerChild({ children, direction = 'up', className = '' }) {
  const v = variants[direction]
  return (
    <motion.div variants={v} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  )
}
