import { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

// Batch start date: June 21, 2024
const BATCH_START = new Date('2024-06-21T00:00:00')
const BATCH_END = new Date('2026-03-16T00:00:00')

function pad(n) { return String(n).padStart(2, '0') }

function useLiveCountdown() {
  const [state, setState] = useState(() => compute())

  function compute() {
    const rawNow = new Date()
    const now = rawNow > BATCH_END ? BATCH_END : rawNow; // freeze at BATCH_END
    const sinceStart = Math.floor((now - BATCH_START) / 1000)
    const days = Math.floor(sinceStart / 86400)
    const hours = Math.floor((sinceStart % 86400) / 3600)
    const mins = Math.floor((sinceStart % 3600) / 60)
    const secs = sinceStart % 60
    return { days, hours, mins, secs }
  }

  useEffect(() => {
    const t = setInterval(() => setState(compute()), 1000)
    return () => clearInterval(t)
  }, [])

  return state
}

function Digit({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        key={value}
        initial={{ opacity: 0.4, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="font-display text-3xl md:text-4xl text-accent-yellow text-glow-sm tabular-nums"
      >
        {pad(value)}
      </motion.div>
      <span className="font-mono text-[8px] tracking-[0.3em] text-muted/50 uppercase">{label}</span>
    </div>
  )
}

export default function DaysCounter() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const { days, hours, mins, secs } = useLiveCountdown()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="glass border border-accent-yellow/10 rounded-sm p-8 md:p-10 text-center max-w-2xl mx-auto"
    >
      <span className="font-mono text-[9px] tracking-[0.4em] text-accent-yellow/50 uppercase block mb-3">
        Since it all began
      </span>
      <p className="font-display text-xl  text-text-primary/50 mb-8">
        {days.toLocaleString()} days of becoming who we are.
      </p>

      {/* Live clock */}
      <div className="flex items-center justify-center gap-6 md:gap-10 mb-8">
        <Digit label="Days" value={days % 10000} />
        <span className="text-accent-yellow/20 text-2xl font-light pb-4">:</span>
        <Digit label="Hours" value={hours} />
        <span className="text-accent-yellow/20 text-2xl font-light pb-4">:</span>
        <Digit label="Mins" value={mins} />
        <span className="text-accent-yellow/20 text-2xl font-light pb-4">:</span>
        <Digit label="Secs" value={secs} />
      </div>

      <div className="line-yellow opacity-20 mb-5" />

      <p className="font-body text-xs text-muted/50 leading-relaxed">
        Started <span className="text-accent-yellow/40">Jun 21, 2024</span>
        {' '}· The chapter is <span className="text-accent-yellow/60">complete</span>
      </p>
    </motion.div>
  )
}
