import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { mockMessages } from '../lib/mockData'
import { postMessage, getMessages } from '../lib/supabase'

const NOTE_COLORS = ['#f5f0e8','#f0ede0','#ede8d5','#f2eed8','#eef0e8','#f0ece8']

/* ── Single sticky note ── */
function WallNote({ message, index }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const rot    = message.rotation ?? ((index % 5) - 2) * 1.6
  const color  = NOTE_COLORS[index % NOTE_COLORS.length]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.75, rotate: rot * 2, y: 24 }}
      animate={inView ? { opacity: 1, scale: 1, rotate: rot, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 130, damping: 18, delay: (index % 8) * 0.06 }}
      whileHover={{ scale: 1.06, rotate: 0, zIndex: 30,
                   boxShadow: '6px 8px 30px rgba(0,0,0,0.65)',
                   transition: { duration: 0.18 } }}
      className="relative cursor-default"
    >
      {/* Tape */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-9 h-5 z-10 opacity-80"
           style={{ background: 'rgba(244,196,48,0.55)', borderRadius: '1px' }} />

      {/* Paper */}
      <div className="relative p-5 pt-6 min-h-[118px] sticky-note"
           style={{ background: color }}>
        {/* Lines */}
        <div className="absolute inset-x-5 top-8 bottom-4 pointer-events-none"
             style={{ backgroundImage: 'repeating-linear-gradient(transparent,transparent 23px,rgba(0,0,0,0.055) 23px,rgba(0,0,0,0.055) 24px)' }} />
        <p className="relative font-handwritten text-[16px] leading-relaxed text-gray-700">
          {message.message}
        </p>
        {message.name && (
          <div className="relative mt-3 pt-2 border-t border-black/[0.07]">
            <span className="font-handwritten text-xs text-gray-500">— {message.name}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

import confetti from 'canvas-confetti'

/* ── Page ── */
export default function Wall() {
  const [messages,   setMessages]   = useState(mockMessages)
  const [name,       setName]       = useState('')
  const [text,       setText]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState('')
  const [sortNew,    setSortNew]    = useState(true)

  useEffect(() => {
    const loadMessages = async () => {
      const { data, error: fetchError } = await getMessages()
      if (!fetchError && Array.isArray(data)) {
        setMessages(data)
      }
    }
    loadMessages()
  }, [])

  const post = async () => {
    if (!text.trim()) { setError('Write something first.'); return }
    setError('')
    setSubmitting(true)

    const toastId = toast.loading('Pinning your note...')
    const nextName = name.trim() || 'Anonymous'
    const nextMessage = text.trim()
    const { error: postErr } = await postMessage({ name: nextName, message: nextMessage })
    
    if (postErr) {
      setError('Could not submit right now.')
      toast.error('Failed to pin note: ' + postErr.message, { id: toastId })
      setSubmitting(false)
      return
    }

    toast.success('Submitted for admin review!', { id: toastId })
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#F4C430', '#FFD95A', '#FFFFFF'] })
    setName(''); setText('')
    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2800)
  }

  const sorted = [...messages].sort((a, b) =>
    sortNew
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at)
  )

  return (
    <main className="min-h-screen pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y:  0, filter: 'blur(0px)'  }}
                      transition={{ duration: 0.8 }}>
            <span className="font-mono text-[10px] tracking-[0.4em] text-accent-yellow/60 uppercase">Leave Your Words</span>
            <h1 className="font-archive text-6xl md:text-7xl text-accent-yellow text-glow mt-3 mb-5">The Wall</h1>
            <div className="line-yellow max-w-xs mx-auto mb-6" />
            <p className="font-body text-sm text-muted max-w-sm mx-auto leading-relaxed">
              Say the things you always meant to say. Stick a note. Make it permanent.
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.7 }}
                    className="glass border border-accent-yellow/10 rounded-sm p-8 max-w-lg mx-auto mb-20 hover-glow">
          <h2 className="font-archive text-2xl text-text-primary mb-6">Post a Note</h2>
          <div className="space-y-4">

            <div>
              <label className="font-mono text-[9px] tracking-[0.3em] text-muted/55 uppercase block mb-1.5">
                Your Name <span className="text-muted/30">(optional)</span>
              </label>
              <input type="text" value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && document.getElementById('wall-msg')?.focus()}
                placeholder="Anonymous" maxLength={40}
                className="w-full bg-bg-primary border border-muted/15 focus:border-accent-yellow/40
                           text-text-primary font-body text-sm px-4 py-3 rounded-sm
                           placeholder:text-muted/25 outline-none transition-all
                           focus:shadow-[0_0_0_1px_rgba(244,196,48,0.1)]" />
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-[0.3em] text-muted/55 uppercase block mb-1.5">
                Message <span className="text-accent-yellow/50">*</span>
              </label>
              <textarea id="wall-msg" value={text} rows={4} maxLength={300}
                onChange={e => { setText(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && e.ctrlKey && post()}
                placeholder="Four years in a few words…"
                className="w-full bg-bg-primary border border-muted/15 focus:border-accent-yellow/40
                           text-text-primary font-body text-sm px-4 py-3 rounded-sm
                           placeholder:text-muted/25 outline-none transition-all resize-none
                           focus:shadow-[0_0_0_1px_rgba(244,196,48,0.1)]" />
              <div className="flex items-center justify-between mt-1">
                <AnimatePresence>
                  {error && (
                    <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="font-mono text-[9px] text-red-400">{error}</motion.span>
                  )}
                </AnimatePresence>
                <span className="font-mono text-[8px] text-muted/30 ml-auto">{text.length}/300 · Ctrl+Enter</span>
              </div>
            </div>

            <motion.button onClick={post} disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
              className={`w-full py-3.5 font-mono text-xs tracking-[0.3em] uppercase transition-all ${
                submitted  ? 'bg-green-800/30 text-green-300 border border-green-500/25'
              : submitting ? 'bg-accent-yellow/25 text-accent-yellow cursor-wait'
              :              'bg-accent-yellow text-bg-primary hover:bg-soft-yellow'
              }`}>
              {submitted  ? '✓ Submitted!'
              : submitting ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>Posting···</motion.span>
              : 'Submit Note →'}
            </motion.button>
          </div>
        </motion.div>

        {/* Wall divider */}
        <div className="flex items-center gap-4 mb-12">
          <div className="line-yellow flex-1 opacity-15" />
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] text-muted/45 tracking-widest whitespace-nowrap">
              {messages.length} NOTES
            </span>
            <button onClick={() => setSortNew(v => !v)}
              className="font-mono text-[8px] text-muted/30 hover:text-muted transition-colors uppercase">
              {sortNew ? '↓ Newest' : '↑ Oldest'}
            </button>
          </div>
          <div className="line-yellow flex-1 opacity-15" />
        </div>

        {/* Notes masonry */}
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
            <p className="font-display text-2xl italic text-muted/30">Be the first.</p>
          </div>
        )}

        <p className="font-mono text-[8px] text-muted/18 tracking-widest text-center mt-20">
          Only admin-approved notes are visible here
        </p>
      </div>
    </main>
  )
}
