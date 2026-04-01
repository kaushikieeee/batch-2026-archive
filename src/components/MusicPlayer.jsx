import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Generates a soft ambient drone via Web Audio API (no file needed).
// To use a real file instead, replace createDrone() with:
//   const audio = new Audio('/music/ambient.mp3')
//   audio.loop = true; audio.volume = vol; audio.play()

function createDrone(ctx) {
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.connect(ctx.destination)

  const freqs = [110, 138.6, 165, 220, 277.2]
  freqs.forEach((freq, i) => {
    const osc    = ctx.createOscillator()
    const gain   = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    const lfo    = ctx.createOscillator()
    const lfoG   = ctx.createGain()

    osc.type = i % 2 === 0 ? 'sine' : 'triangle'
    osc.frequency.value = freq
    osc.detune.value    = (Math.random() - 0.5) * 10

    filter.type           = 'lowpass'
    filter.frequency.value = 900

    gain.gain.value = 0.042 / freqs.length

    lfo.frequency.value  = 0.04 + i * 0.018
    lfoG.gain.value      = 0.012
    lfo.connect(lfoG)
    lfoG.connect(gain.gain)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(master)

    osc.start(); lfo.start()
  })

  return master
}

export default function MusicPlayer() {
  const [playing,     setPlaying]     = useState(false)
  const [volume,      setVolume]      = useState(0.28)
  const [showVolume,  setShowVolume]  = useState(false)
  const [fading,      setFading]      = useState(false)
  const ctxRef   = useRef(null)
  const masterRef = useRef(null)

  const ramp = (target, secs) => {
    if (!masterRef.current || !ctxRef.current) return
    const g = masterRef.current.gain
    const t = ctxRef.current.currentTime
    g.cancelScheduledValues(t)
    g.setValueAtTime(g.value, t)
    g.linearRampToValueAtTime(target, t + secs)
  }

  const toggle = () => {
    if (playing) {
      setFading(true)
      ramp(0, 2)
      setTimeout(() => { setFading(false); setPlaying(false) }, 2100)
    } else {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
      if (!masterRef.current) masterRef.current = createDrone(ctxRef.current)
      ramp(volume, 2.5)
      setPlaying(true)
    }
  }

  // Live volume
  useEffect(() => {
    if (playing && !fading) ramp(volume, 0.3)
  }, [volume])

  // Cleanup
  useEffect(() => () => ctxRef.current?.close(), [])

  return (
    <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end gap-2 select-none">

      {/* Volume slider */}
      <AnimatePresence>
        {showVolume && playing && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1   }}
            exit={{   opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            className="glass border border-accent-yellow/10 rounded-sm px-4 py-3 flex flex-col items-center gap-2"
          >
            <span className="font-mono text-[8px] tracking-widest text-muted/50 uppercase">Volume</span>
            <input type="range" min="0" max="1" step="0.04"
              value={volume} onChange={e => setVolume(+e.target.value)}
              className="w-24" style={{ accentColor: '#F4C430' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        onClick={toggle}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{   scale: 0.9 }}
        title={playing ? 'Pause ambient' : 'Play ambient'}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
          playing
            ? 'bg-accent-yellow shadow-[0_0_18px_rgba(244,196,48,0.55)]'
            : 'glass border border-accent-yellow/20 hover:border-accent-yellow/50'
        }`}
      >
        {playing && !fading && [1.7, 2.3].map((s, k) => (
          <motion.div key={k}
            animate={{ scale: [1, s], opacity: [0.35, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: k * 0.55 }}
            className="absolute inset-0 rounded-full bg-accent-yellow"
          />
        ))}
        <span className={`relative z-10 text-sm ${playing ? 'text-bg-primary' : 'text-accent-yellow'}`}>
          {playing ? (fading ? '◌' : '♪') : '♫'}
        </span>
      </motion.button>

      {/* Waveform bars when playing */}
      <AnimatePresence>
        {playing && !fading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-end gap-[3px] h-4">
            {[0, 1, 2, 1, 0].map((base, i) => (
              <motion.div key={i}
                animate={{ scaleY: [0.3 + base * 0.2, 1.2 - base * 0.1, 0.3 + base * 0.2] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.14 }}
                className="w-0.5 bg-accent-yellow/50 rounded-full origin-bottom"
                style={{ height: '100%' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
