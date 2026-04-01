import Hero from '../components/Hero'
import StoryBridge from '../components/StoryBridge'
import DaysCounter from '../components/DaysCounter'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const sections = [
  { label: 'Journey', desc: 'Four years. One story.', path: '/journey', icon: '📖', tag: '01' },
  { label: 'Yearbook', desc: 'Every face that made it real.', path: '/yearbook', icon: '🧑‍🎓', tag: '02' },
  { label: 'Media Vault', desc: 'Every frame, preserved.', path: '/vault', icon: '🖼️', tag: '03' },
  { label: 'The Wall', desc: 'Say the things left unsaid.', path: '/wall', icon: '💬', tag: '04' },
]

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Story bridge after hero */}
      <div className="flex justify-center">
        <StoryBridge
          text="It started with strangers in unfamiliar corridors…"
          sub="August 2024. None of us knew each other's names yet."
        />
      </div>

      {/* Section cards */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="line-yellow mb-14 opacity-20" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((s, i) => (
            <motion.div
              key={s.path}
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <Link to={s.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass border border-accent-yellow/0 hover:border-accent-yellow/15 p-8 rounded-sm group transition-all duration-400 hover-glow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="font-mono text-[9px] text-muted/40 tracking-widest">{s.tag}</span>
                    <span className="font-mono text-xs text-muted/40 group-hover:text-accent-yellow group-hover:translate-x-1 transition-all duration-300">→</span>
                  </div>
                  <h3 className="font-display text-3xl text-text-primary group-hover:text-accent-yellow transition-colors duration-300 italic mb-2">
                    {s.label}
                  </h3>
                  <p className="font-body text-sm text-muted">{s.desc}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Days counter */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <DaysCounter />
      </section>

      {/* Story bridge before wall */}
      <div className="flex justify-center">
        <StoryBridge
          text="And ended with things left unsaid…"
          sub="Go to The Wall. Leave something behind."
          align="center"
        />
      </div>

      {/* Closing quote */}
      <section className="max-w-4xl mx-auto px-6 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <div className="font-display text-5xl text-text-primary/10 italic mb-6">"</div>
          <p className="font-display text-xl md:text-2xl text-text-primary/40 italic max-w-2xl mx-auto leading-relaxed">
            Not all classrooms have four walls. Some of them are corridors,
            canteens, and 2&nbsp;AM calls.
          </p>
          <div className="mt-6 font-mono text-xs text-muted/30 tracking-widest">— Batch 2024–26</div>
        </motion.div>
      </section>
    </main>
  )
}
