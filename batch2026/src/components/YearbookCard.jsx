import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function StudentModal({ student, onClose }) {
  const [msgText, setMsgText] = useState('')
  const [msgs, setMsgs] = useState([
    'Will miss our late nights! 💛',
    'You inspired everyone in the batch.',
    'Best memories with you!',
  ])
  const [posting, setPosting] = useState(false)

  const postMsg = async () => {
    if (!msgText.trim()) return
    setPosting(true)
    await new Promise(r => setTimeout(r, 400))
    setMsgs(prev => [msgText.trim(), ...prev])
    setMsgText('')
    setPosting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 glass rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto border border-accent-yellow/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-1 bg-gradient-to-r from-transparent via-accent-yellow/60 to-transparent" />

        <div className="p-8">
          {/* Close */}
          <button onClick={onClose} className="absolute top-5 right-5 text-muted hover:text-accent-yellow transition-colors font-mono text-sm">✕</button>

          {/* Profile top */}
          <div className="flex gap-5 mb-6">
            <div className="w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 bg-bg-primary flex items-center justify-center">
              {student.image
                ? <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                : <span className="font-display text-3xl text-accent-yellow/30 italic select-none">
                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl text-accent-yellow italic">{student.name}</h3>
              <p className="font-mono text-[10px] text-muted tracking-widest mt-1">{student.section}</p>
              <span className="inline-block mt-2 text-xs font-body text-accent-yellow/60 border border-accent-yellow/20 px-2 py-0.5 rounded-full">
                {student.role}
              </span>
            </div>
          </div>

          {/* Quote */}
          <div className="border-l-2 border-accent-yellow/30 pl-4 mb-6">
            <p className="font-display text-lg italic text-text-primary/70">"{student.quote}"</p>
          </div>

          {/* Contact / Social (if present) */}
          {(student.instagram || student.linkedin || student.phone) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {student.instagram && (
                <a href={`https://instagram.com/${student.instagram}`} target="_blank" rel="noreferrer"
                  className="font-mono text-[9px] tracking-widest text-muted hover:text-accent-yellow border border-muted/20 hover:border-accent-yellow/30 px-3 py-1.5 transition-colors">
                  IG @{student.instagram}
                </a>
              )}
              {student.linkedin && (
                <a href={`https://linkedin.com/in/${student.linkedin}`} target="_blank" rel="noreferrer"
                  className="font-mono text-[9px] tracking-widest text-muted hover:text-accent-yellow border border-muted/20 hover:border-accent-yellow/30 px-3 py-1.5 transition-colors">
                  LinkedIn
                </a>
              )}
              {student.phone && (
                <span className="font-mono text-[9px] tracking-widest text-muted border border-muted/20 px-3 py-1.5">
                  {student.phone}
                </span>
              )}
            </div>
          )}

          <div className="line-yellow opacity-20 mb-6" />

          {/* Messages */}
          <div className="mb-4">
            <p className="font-mono text-[9px] tracking-widest text-muted/60 uppercase mb-3">
              Messages · {msgs.length}
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {msgs.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-bg-primary/60 rounded-sm p-3"
                >
                  <p className="font-body text-sm text-text-primary/70">{msg}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Leave message */}
          <div className="flex gap-2">
            <input
              type="text"
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && postMsg()}
              placeholder="Leave a message..."
              className="flex-1 bg-bg-primary border border-muted/15 focus:border-accent-yellow/40 text-text-primary font-body text-sm px-3 py-2.5 rounded-sm placeholder:text-muted/30 outline-none transition-colors"
            />
            <motion.button
              onClick={postMsg}
              disabled={posting}
              whileTap={{ scale: 0.95 }}
              className="bg-accent-yellow text-bg-primary font-mono text-[10px] tracking-widest px-4 py-2.5 hover:bg-soft-yellow transition-colors disabled:opacity-50"
            >
              {posting ? '…' : 'Post'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function YearbookCard({ student }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className="yearbook-card cursor-pointer group"
        onClick={() => setOpen(true)}
      >
        <div className="relative overflow-hidden bg-bg-secondary rounded-sm aspect-[3/4] mb-3">
          {student.image
            ? <img src={student.image} alt={student.name} className="yearbook-img w-full h-full object-cover" />
            : (
              <div className="yearbook-img w-full h-full flex items-center justify-center bg-bg-secondary">
                <span className="font-display text-5xl text-accent-yellow/15 font-light italic select-none group-hover:text-accent-yellow/35 transition-colors duration-500">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            )
          }
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          <div className="absolute bottom-3 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="font-mono text-[9px] tracking-widest text-accent-yellow/80 uppercase">View Profile</span>
          </div>
        </div>
        <h4 className="font-display text-lg text-accent-yellow font-medium leading-tight">{student.name}</h4>
        <p className="font-mono text-[10px] text-muted tracking-wider mt-0.5">{student.section}</p>
      </motion.div>

      <AnimatePresence>
        {open && <StudentModal student={student} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
