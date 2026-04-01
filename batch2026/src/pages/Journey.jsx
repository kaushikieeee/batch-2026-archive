import { motion } from 'framer-motion'
import Timeline from '../components/Timeline'
import StoryBridge from '../components/StoryBridge'
import { mockTimeline } from '../lib/mockData'

export default function Journey() {
  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9 }}
        >
          <span className="font-mono text-[10px] tracking-[0.4em] text-accent-yellow/60 uppercase">Our Story</span>
          <h1 className="font-display text-6xl md:text-7xl text-accent-yellow text-glow mt-3 mb-5 italic">The Journey</h1>
          <div className="line-yellow max-w-xs mx-auto mb-6" />
          <p className="font-body text-sm text-muted leading-relaxed max-w-md mx-auto">
            Four years of growth, chaos, friendship and discovery — told in chapters.
          </p>
        </motion.div>
      </div>

      <div className="flex justify-center">
        <StoryBridge text="It started with strangers in unfamiliar corridors…" align="center" />
      </div>

      <Timeline items={mockTimeline} />

      <div className="flex justify-center">
        <StoryBridge
          text="And now we carry it all with us. Everywhere."
          sub="The journey doesn't end here. It just changes shape."
          align="center"
        />
      </div>
    </main>
  )
}
