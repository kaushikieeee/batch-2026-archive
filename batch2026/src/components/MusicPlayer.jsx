import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Free-to-use ambient tracks (via Pixabay / royalty-free) ──
// Replace with your own audio file in /public/music/ for best results
const TRACKS = [
  {
    title: 'Soft Piano',
    artist: 'Ambient',
    // Using a web audio generated tone as placeholder — swap with real file
    src: null,
  },
]

// Generate a soft ambient drone using Web Audio API
function createAmbientNode(ctx) {
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.connect(ctx.destination)

  const freqs = [110, 138.6, 165, 220, 277.2]
  const oscs = freqs.map((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = i % 2 === 0 ? 'sine' : 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    // Slight detune for warmth
    osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, ctx.currentTime)

    gain.gain.setValueAtTime(0.04 / freqs.length, ctx.currentTime)

    // Slow LFO tremolo
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.setValueAtTime(0.05 + i * 0.02, ctx.currentTime)
    lfoGain.gain.setValueAtTime(0.015, ctx.currentTime)
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)
    lfo.start()

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    osc.start()

    return { osc, gain, lfo }
  })

  return { master, oscs }
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [showVolume, setShowVolume] = useState(false)
  const [fading, setFading] = useState(false)
  const ctxRef = useRef(null)
  const nodesRef = useRef(null)

  const startAmbient = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    if (!nodesRef.current) {
      nodesRef.current = createAmbientNode(ctxRef.current)
    }
    // Fade in
    const ctx = ctxRef.current
    nodesRef.current.master.gain.cancelScheduledValues(ctx.currentTime)
    nodesRef.current.master.gain.setValueAtTime(
      nodesRef.current.master.gain.value, ctx.currentTime
    )
    nodesRef.current.master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2.5)
    setFading(false)
  }

  const stopAmbient = () => {
    if (!nodesRef.current || !ctxRef.current) return
    const ctx = ctxRef.current
    setFading(true)
    nodesRef.current.master.gain.cancelScheduledValues(ctx.currentTime)
    nodesRef.current.master.gain.setValueAtTime(
      nodesRef.current.master.gain.value, ctx.currentTime
    )
    nodesRef.current.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
    setTimeout(() => setFading(false), 2100)
  }

  const toggle = () => {
    if (playing) {
      stopAmbient()
      setPlaying(false)
    } else {
      startAmbient()
      setPlaying(true)
    }
  }

  // Update volume live
  useEffect(() => {
    if (!nodesRef.current || !ctxRef.current || !playing) return
    const ctx = ctxRef.current
    nodesRef.current.master.gain.cancelScheduledValues(ctx.currentTime)
    nodesRef.current.master.gain.setValueAtTime(
      nodesRef.current.master.gain.value, ctx.currentTime
    )
    nodesRef.current.master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.3)
  }, [volume, playing])

  // Cleanup
  useEffect(() => {
    return () => {
      if (ctxRef.current) ctxRef.current.close()
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end gap-2">
      {/* Volume slider */}
      <AnimatePresence>
        {showVolume && playing && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="glass border border-accent-yellow/10 rounded-sm px-4 py-3 flex flex-col items-center gap-2"
          >
            <span className="font-mono text-[8px] tracking-widest text-muted/50 uppercase">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-24 accent-yellow-400"
              style={{ accentColor: '#F4C430' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={toggle}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        title={playing ? 'Pause ambient music' : 'Play ambient music'}
        className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ${
          playing
            ? 'bg-accent-yellow shadow-[0_0_20px_rgba(244,196,48,0.5)]'
            : 'glass border border-accent-yellow/20 hover:border-accent-yellow/50'
        }`}
      >
        {/* Pulse rings when playing */}
        {playing && !fading && (
          <>
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-accent-yellow"
            />
            <motion.div
              animate={{ scale: [1, 2.4], opacity: [0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              className="absolute inset-0 rounded-full bg-accent-yellow"
            />
          </>
        )}

        {/* Icon */}
        <span className={`relative z-10 text-sm ${playing ? 'text-bg-primary' : 'text-accent-yellow'}`}>
          {playing ? (fading ? '◌' : '♪') : '♫'}
        </span>
      </motion.button>

      {/* Label */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scaleY: playing ? [0.4, 1.2, 0.4] : 0.4 }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                className="w-0.5 h-3 bg-accent-yellow/50 rounded-full origin-bottom"
              />
            ))}
            <span className="font-mono text-[8px] text-muted/40 tracking-widest ml-1">AMBIENT</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
