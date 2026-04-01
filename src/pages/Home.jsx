import Hero from '../components/Hero'
import StoryBridge from '../components/StoryBridge'
import DaysCounter from '../components/DaysCounter'
import BirthdayWidget from '../components/BirthdayWidget'
import ScrollReveal, { StaggerReveal, StaggerChild } from '../components/ScrollReveal'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const SECTIONS = [
  { label: 'Journey',     desc: 'Four chapters. One story that changed everything.',  path: '/journey',  tag: '01', emoji: '◎' },
  { label: 'Alumni Book', desc: 'Every face. Every voice. Every memory.',             path: '/yearbook', tag: '02', emoji: '✦' },
  { label: 'Media Vault', desc: 'Every frame frozen in time, preserved forever.',     path: '/vault',    tag: '03', emoji: '⊞' },
  { label: 'The Wall',    desc: 'Say what you never said. Make it permanent.',        path: '/wall',     tag: '04', emoji: '✉' },
]

const QUOTES = [
  "Not all classrooms have four walls. Some of them are corridors, canteens, and 2 AM calls.",
  "We didn't realize we were making memories. We just knew we were having the time of our lives.",
]

export default function Home() {
  return (
    <main className="pb-24 md:pb-0">
      <Hero />

      {/* Story bridge */}
      <div className="flex justify-center px-4">
        <StoryBridge
          text="It started with strangers in unfamiliar corridors…"
          sub="August 2024. None of us knew each other's names yet."
        />
      </div>

      {/* Section cards */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <ScrollReveal direction="fade" className="mb-10 md:mb-14">
          <div className="line-yellow opacity-15" />
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4" stagger={0.1}>
          {SECTIONS.map(s => (
            <StaggerChild key={s.path}>
              <Link to={s.path}>
                <motion.div
                  whileHover={{ scale: 1.018, y: -4 }}
                  whileTap={{ scale: 0.982 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="glass hover:border-accent-yellow/16 rounded-2xl p-6 md:p-8 group
                             cursor-pointer hover:bg-white/[0.055] transition-[background,border-color] duration-200
                             hover-glow">
                  <div className="flex items-start justify-between mb-5 md:mb-7">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg md:text-xl opacity-60">{s.emoji}</span>
                      <span className="font-mono text-[8px] text-muted/35 tracking-widest">{s.tag}</span>
                    </div>
                    <motion.span
                      className="font-mono text-xs text-muted/30 group-hover:text-accent-yellow"
                      animate={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.18 }}>→</motion.span>
                  </div>
                  <h3 className="font-archive text-2xl md:text-3xl text-text-primary
                                 group-hover:text-accent-yellow transition-colors duration-200 mb-2">
                    {s.label}
                  </h3>
                  <p className="font-body text-[13px] text-muted/70 leading-relaxed">{s.desc}</p>
                </motion.div>
              </Link>
            </StaggerChild>
          ))}
        </StaggerReveal>
      </section>

      {/* Days counter */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <ScrollReveal direction="up">
          <DaysCounter />
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={0.2}>
          <BirthdayWidget />
        </ScrollReveal>
      </section>

      {/* Bridge to wall */}
      <div className="flex justify-center px-4">
        <StoryBridge text="And ended with things left unsaid…" sub="Go to The Wall. Leave something behind." />
      </div>

      {/* Quote carousel */}
      <section className="max-w-4xl mx-auto px-5 pb-24 md:pb-40 text-center">
        <ScrollReveal direction="up">
          <div className="font-archive text-5xl md:text-7xl text-accent-yellow/8 mb-3 leading-none">"</div>
          <p className="font-display text-lg md:text-2xl italic text-text-primary/35 leading-relaxed max-w-xl mx-auto">
            {QUOTES[0]}
          </p>
          <div className="mt-6 font-mono text-[9px] text-muted/25 tracking-widest">— Batch 2024–26</div>
        </ScrollReveal>
      </section>
    </main>
  )
}
