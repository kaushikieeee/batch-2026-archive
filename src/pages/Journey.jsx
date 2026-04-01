import { motion } from 'framer-motion'
import Timeline from '../components/Timeline'
import StoryBridge from '../components/StoryBridge'
import ScrollReveal from '../components/ScrollReveal'
import { mockTimeline } from '../lib/mockData'

export default function Journey() {
  return (
    <main className="min-h-screen flex flex-col pt-20 md:pt-0 pb-28 md:pb-0">
      {/* Hero panel */}
      <div className="min-h-[50vh] md:min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center px-5 py-16 md:py-0 relative">
        <ScrollReveal direction="up" className="max-w-3xl w-full text-center">
          <span className="font-mono text-[10px] tracking-[0.4em] text-accent-yellow/55 uppercase">Our Story</span>
          <h1 className="font-archive text-5xl md:text-7xl text-accent-yellow text-glow mt-3 mb-4">The Journey</h1>
          <div className="line-yellow max-w-xs mx-auto mb-5" />
          <p className="font-body text-sm text-muted/60 leading-relaxed max-w-sm mx-auto">
            Four years of growth, chaos, friendship and discovery — told in chapters.
          </p>
        </ScrollReveal>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 flex flex-col items-center justify-center"
        >
          <span className="font-mono text-[8px] tracking-[0.4em] text-muted/50 uppercase mb-2">Scroll To Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-accent-yellow/50 to-transparent"
          />
        </motion.div>
      </div>

      <div className="flex justify-center px-4">
        <StoryBridge text="It started with strangers in unfamiliar corridors…" align="center" />
      </div>

      <Timeline items={mockTimeline} />

      <div className="flex justify-center px-4">
        <StoryBridge
          text="And now we carry it all with us. Everywhere."
          sub="The journey doesn't end here. It just changes shape."
          align="center"
        />
      </div>
    </main>
  )
}
