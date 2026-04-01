import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import MessageCard from '../components/MessageCard'
import StoryBridge from '../components/StoryBridge'
import { mockMessages } from '../lib/mockData'
import { postMessage, getMessages } from '../lib/supabase'

// Note tones for variety
const NOTE_TONES = [
  '#f5f0e8', '#f0ede0', '#ede8d5', '#f2eed8',
  '#eef0e8', '#f0ece8',  // slight green/pink tones
]

function WallNote({ message, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  const rotation = message.rotation ?? ((index % 5) - 2) * 1.5
  const noteColor = NOTE_TONES[index % NOTE_TONES.length]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.7, rotate: rotation * 2, y: 30 }}
      animate={inView ? { opacity: 1, scale: 1, rotate: rotation, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 8) * 0.07, type: 'spring', stiffness: 140, damping: 18 }}
      whileHover={{
        scale: 1.06,
        rotate: 0,
        zIndex: 20,
        boxShadow: '6px 8px 28px rgba(0,0,0,0.6)',
        transition: { duration: 0.2 }
      }}
      className="relative cursor-default"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Tape */}
      <div
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-9 h-5 z-10 opacity-80"
        style={{ background: 'rgba(244,196,48,0.55)', borderRadius: '1px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
      />

      {/* Note body */}
      <div
        className="relative p-5 pt-6 min-h-[120px] shadow-[3px_4px_16px_rgba(0,0,0,0.5)]"
        style={{ background: noteColor }}
      >
        {/* Lined paper effect */}
        <div className="absolute inset-x-5 top-9 bottom-4 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 22px, rgba(0,0,0,0.06) 22px, rgba(0,0,0,0.06) 23px)',
        }} />

        <p
          className="relative text-gray-700 leading-relaxed text-[15px]"
          style={{ fontFamily: '"Caveat", "Segoe Print", cursive, sans-serif' }}
        >
          {message.message}
        </p>

        {message.name && (
          <div className="relative mt-3 pt-2 border-t border-black/8">
            <span className="text-xs text-gray-500 italic" style={{ fontFamily: '"Caveat", cursive' }}>
              — {message.name}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Wall() {
  const [messages, setMessages] = useState(mockMessages)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [sortNewest, setSortNewest] = useState(true)

  useEffect(() => {
    const loadMessages = async () => {
      const { data, error: fetchError } = await getMessages()
      if (!fetchError && Array.isArray(data)) {
        setMessages(data)
      }
    }
    loadMessages()
  }, [])

  const handleSubmit = async () => {
    if (!text.trim()) { setError('Write something first.'); return }
    setError('')
    setSubmitting(true)

    // Optimistic update — add immediately before "server" response
    const optimistic = {
      id: `opt-${Date.now()}`,
      name: name.trim() || 'Anonymous',
      message: text.trim(),
      created_at: new Date().toISOString(),
      rotation: (Math.random() * 6 - 3),
      optimistic: true,
    }
    setMessages(prev => [optimistic, ...prev])
    setName('')
    setText('')

    const { data, error: postErr } = await postMessage({ name: optimistic.name, message: optimistic.message })
    if (postErr) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setError('Could not post right now. Try again.')
      setSubmitting(false)
      return
    }

    const saved = data?.[0]
    setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...saved, optimistic: false } : m))

    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2500)
  }

  const sorted = [...messages].sort((a, b) =>
    sortNewest
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at)
  )

  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9 }}
          >
            <span className="font-mono text-[10px] tracking-[0.4em] text-accent-yellow/60 uppercase">Leave Your Words</span>
            <h1 className="font-display text-6xl md:text-7xl text-accent-yellow text-glow mt-3 mb-5 italic">The Wall</h1>
            <div className="line-yellow max-w-xs mx-auto mb-6" />
            <p className="font-body text-sm text-muted max-w-md mx-auto leading-relaxed">
              Say the things you always meant to say. Stick a note. Make it permanent.
            </p>
          </motion.div>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="glass border border-accent-yellow/10 rounded-sm p-8 max-w-xl mx-auto mb-20 hover-glow"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-accent-yellow/10 rounded-sm flex items-center justify-center text-base">📝</div>
            <h2 className="font-display text-2xl italic text-text-primary">Post a Note</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-mono text-[9px] tracking-[0.3em] text-muted/60 uppercase block mb-2">
                Your Name <span className="text-muted/35">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && e.shiftKey === false && document.getElementById('msg-textarea')?.focus()}
                placeholder="Anonymous"
                maxLength={40}
                className="w-full bg-bg-primary border border-muted/15 focus:border-accent-yellow/40 text-text-primary font-body text-sm px-4 py-3 rounded-sm placeholder:text-muted/25 focus:outline-none transition-all focus:shadow-[0_0_0_1px_rgba(244,196,48,0.1)]"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-[0.3em] text-muted/60 uppercase block mb-2">
                Message <span className="text-accent-yellow/60">*</span>
              </label>
              <textarea
                id="msg-textarea"
                value={text}
                onChange={e => { setText(e.target.value); setError('') }}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit() }}
                placeholder="Four years in a few words…"
                maxLength={300}
                rows={4}
                className="w-full bg-bg-primary border border-muted/15 focus:border-accent-yellow/40 text-text-primary font-body text-sm px-4 py-3 rounded-sm placeholder:text-muted/25 focus:outline-none transition-all resize-none focus:shadow-[0_0_0_1px_rgba(244,196,48,0.1)]"
              />
              <div className="flex justify-between mt-1 items-center">
                <AnimatePresence>
                  {error && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="font-mono text-[9px] text-red-400"
                    >
                      {error}
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="font-mono text-[8px] text-muted/30 ml-auto">
                  {text.length}/300 · Ctrl+Enter to post
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02, boxShadow: submitting ? 'none' : '0 0 20px rgba(244,196,48,0.2)' }}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-3.5 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300 ${
                submitted
                  ? 'bg-green-800/30 text-green-400 border border-green-500/25'
                  : submitting
                  ? 'bg-accent-yellow/25 text-accent-yellow/80 cursor-wait'
                  : 'bg-accent-yellow text-bg-primary hover:bg-soft-yellow'
              }`}
            >
              {submitted ? '✓ Note stuck to the wall' : submitting ? (
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>
                  Posting···
                </motion.span>
              ) : 'Post Note →'}
            </motion.button>
          </div>
        </motion.div>

        {/* Wall header */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <div className="line-yellow flex-1 opacity-15" />
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="font-mono text-[9px] text-muted/50 tracking-widest whitespace-nowrap">
              {messages.length} NOTES
            </span>
            <button
              onClick={() => setSortNewest(!sortNewest)}
              className="font-mono text-[8px] tracking-widest text-muted/30 hover:text-muted transition-colors uppercase"
            >
              {sortNewest ? '↓ Newest' : '↑ Oldest'}
            </button>
          </div>
          <div className="line-yellow flex-1 opacity-15" />
        </div>

        {/* Notes grid — masonry-inspired with stagger */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-8">
          <AnimatePresence>
            {sorted.map((msg, i) => (
              <div key={msg.id} className="break-inside-avoid mb-8">
                <WallNote message={msg} index={i} />
              </div>
            ))}
          </AnimatePresence>
        </div>

        {messages.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-3xl italic text-muted/30">Be the first to leave a note.</p>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-20 text-center">
          <p className="font-mono text-[8px] text-muted/20 tracking-widest">
            Messages synced with Supabase
          </p>
        </div>
      </div>
    </main>
  )
}
