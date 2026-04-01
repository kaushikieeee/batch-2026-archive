import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Gallery from '../components/Gallery'
import VaultSplash from '../components/VaultSplash'
import { mockMedia } from '../lib/mockData'

const FILTERS = ['All', '1st yr', '2nd yr', '3rd yr', '4th yr']

export default function Vault() {
  const [entered, setEntered] = useState(false)
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? mockMedia : mockMedia.filter(m => m.year === active)

  if (!entered) {
    return (
      <main className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <VaultSplash onEnter={() => setEntered(true)} />
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-mono text-[10px] tracking-[0.4em] text-accent-yellow/60 uppercase">Every Moment</span>
            <h1 className="font-display text-6xl md:text-7xl text-accent-yellow text-glow mt-3 mb-5 italic">Media Vault</h1>
            <div className="line-yellow max-w-xs mx-auto mb-6" />
            <p className="font-body text-sm text-muted max-w-md mx-auto">
              Four years of frames. Upload your photos and they'll live here forever.
            </p>
          </motion.div>
        </div>

        {/* Filter bar with animated pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 flex-wrap justify-center mb-10"
        >
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`relative font-mono text-[10px] tracking-widest px-5 py-2 transition-all duration-300 ${
                active === f ? 'text-bg-primary' : 'text-muted hover:text-text-primary'
              }`}
            >
              {active === f && (
                <motion.div
                  layoutId="vault-pill"
                  className="absolute inset-0 bg-accent-yellow rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </motion.div>

        <div className="flex items-center gap-3 mb-8">
          <div className="line-yellow flex-1 opacity-20" />
          <span className="font-mono text-[9px] text-muted tracking-widest whitespace-nowrap">{filtered.length} ITEMS</span>
          <div className="line-yellow flex-1 opacity-20" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Gallery items={filtered} />
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 glass border border-dashed border-accent-yellow/15 rounded-sm p-10 text-center hover:border-accent-yellow/30 transition-colors duration-300"
        >
          <div className="text-3xl mb-4 opacity-30">📤</div>
          <p className="font-display text-xl italic text-text-primary/40 mb-2">Have photos from the batch?</p>
          <p className="font-body text-sm text-muted mb-5">Connect Supabase storage to enable uploads</p>
          <button className="font-mono text-xs tracking-widest text-accent-yellow/40 border border-accent-yellow/15 px-6 py-2 hover:border-accent-yellow/40 hover:text-accent-yellow transition-colors duration-300">
            Coming Soon
          </button>
        </motion.div>
      </div>
    </main>
  )
}
