import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { getStudentMessages, postStudentMessage } from '../lib/supabase'

const ACCENT_COLORS = {
  yellow: { bg: '#F4C430', text: '#111', glow: 'rgba(244,196,48,0.35)' },
  rose:   { bg: '#f43f5e', text: '#fff', glow: 'rgba(244,63,94,0.35)' },
  violet: { bg: '#7c3aed', text: '#fff', glow: 'rgba(124,58,237,0.35)' },
  cyan:   { bg: '#06b6d4', text: '#111', glow: 'rgba(6,182,212,0.35)' },
  green:  { bg: '#22c55e', text: '#111', glow: 'rgba(34,197,94,0.35)' },
  white:  { bg: '#EAEAEA', text: '#111', glow: 'rgba(234,234,234,0.2)' },
}

/* ── Profile modal ─────────────────────────────────────── */
function StudentModal({ student, onClose }) {
  const [msgText, setMsgText]   = useState('')
  const [msgs, setMsgs]         = useState([])
  const [posting, setPosting]   = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [postStatus, setPostStatus] = useState('')
  const [activeTab, setActiveTab] = useState('about') // about | messages
  const accent = ACCENT_COLORS[student.accentColor] || ACCENT_COLORS.yellow

  useEffect(() => {
    const load = async () => {
      setLoadingMsgs(true)
      const { data, error } = await getStudentMessages(student.id)
      if (!error && Array.isArray(data)) {
        setMsgs(data.map(item => item.message))
      }
      setLoadingMsgs(false)
    }
    load()
  }, [student.id])

  const post = async () => {
    if (!msgText.trim()) return
    setPosting(true)
    const toastId = toast.loading('Sending your memo to admin...')
    const { error } = await postStudentMessage({
      studentId: student.id,
      message: msgText.trim(),
      author: 'Anonymous',
    })

    if (error) {
      toast.error('Failed to submit memo: ' + error.message, { id: toastId })
      setPosting(false)
      return
    }

    toast.success('Sent! It will appear once approved.', { id: toastId })
    setMsgText('')
    setPosting(false)
  }

  return createPortal((
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, y: 60, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0,  filter: 'blur(0px)'  }}
        exit={{   opacity: 0, y: 40                         }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-[98vw] max-w-6xl h-[94vh] max-h-[94vh]
             bg-[#16161a] rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Pull handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* Accent top bar */}
        <div className="h-1 mx-4 mt-2 sm:mt-0 rounded-full"
             style={{ background: accent.bg, boxShadow: `0 0 20px ${accent.glow}` }} />

        <div className="p-5 md:p-7 h-[calc(94vh-18px)] overflow-y-auto relative">
          {/* Close — universal */}
          <button onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full glass bg-black/40 border border-white/10
                       text-white hover:text-accent-yellow transition-all font-mono text-lg
                       flex items-center justify-center">✕</button>

          {/* Header */}
          <div className="flex gap-4 mb-5 items-start">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden flex-shrink-0
                            flex items-center justify-center"
                 style={{ background: `${accent.bg}18`, border: `1px solid ${accent.bg}30` }}>
              {student.image
                ? <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                : <span className="font-archive text-2xl md:text-3xl select-none"
                         style={{ color: accent.bg }}>
                    {(student.name || 'AB').split(' ').map(n => n[0]).join('').slice(0,2)}
                  </span>
              }
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-archive text-xl md:text-2xl leading-tight"
                  style={{ color: accent.bg }}>{student.name}</h3>
              {student.role && (
                <span className="inline-block mt-1.5 font-mono text-[9px] tracking-wider px-2.5 py-0.5 rounded-full border"
                      style={{ color: accent.bg, borderColor: `${accent.bg}30` }}>
                  {student.role}
                </span>
              )}
            </div>
          </div>

          {/* Profile details */}
          <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="font-mono text-[8px] tracking-widest text-muted/40 uppercase mb-2">Profile Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { label: 'Name', val: student.name },
                  { label: 'Role', val: student.role },
                  { label: 'Birthdate', val: student.dob, id: 'dob' },
                  { label: 'Phone', val: student.phone, id: 'phone' },
                  { label: 'Instagram', val: student.instagram ? `@${student.instagram}` : '', id: 'instagram' },
                  { label: 'Snapchat', val: student.snapchat ? `@${student.snapchat}` : '', id: 'snapchat' },
                  { label: 'Email', val: student.email, id: 'email', col2: true },
                ].map(f => {
                  const vis = typeof student.visibility_preferences === 'string' 
                            ? JSON.parse(student.visibility_preferences)
                            : (student.visibility_preferences || {});
                  if (!f.val) return null; // Don't show empty fields
                  const isVisible = f.id ? vis[f.id] !== false : true;
                  return (
                    <div key={f.label} className={`rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2 ${f.col2 ? 'col-span-1 md:col-span-2' : ''}`}>
                      <p className="font-mono text-[9px] text-muted/50">{f.label}</p>
                      <p className={`font-body text-sm ${isVisible ? 'text-text-primary/80' : 'text-muted/40 italic'} truncate`}>
                        {isVisible ? f.val : 'Hidden by user'}
                      </p>
                    </div>
                  );
                })}
            </div>
            
            {student.signature_url && (
              <div className="mt-4 pt-4 border-t border-white/[0.05] flex flex-col items-center">
                <p className="font-mono text-[8px] tracking-widest text-muted/40 uppercase mb-3">Digital Signature</p>
                <img src={student.signature_url} alt="Signature" className="h-16 object-contain opacity-80" />
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 rounded-xl bg-white/[0.04]">
            {['about', 'messages'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-lg font-mono text-[9px] tracking-widest uppercase transition-all"
                style={{
                  background: activeTab === tab ? accent.bg : 'transparent',
                  color: activeTab === tab ? accent.text : '#777780',
                }}>
                {tab === 'messages' ? `Messages (${msgs.length})` : 'About'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <motion.div key="about" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.22 }}>
                {/* Quote */}
                <div className="mb-4 pl-3 border-l-2" style={{ borderColor: `${accent.bg}60` }}>
                  <p className="font-display text-base italic text-text-primary/65">"{student.quote || 'No quote added yet.'}"</p>
                </div>

                {/* Bio */}
                {student.bio && (
                  <p className="font-body text-sm text-muted/70 leading-relaxed mb-4">{student.bio}</p>
                )}

                {/* Digital Signature */}
                {student.signature_url && (
                  <div className="my-6 pt-4 border-t border-white/5 opacity-80 mix-blend-screen flex items-end justify-between">
                    <img 
                      src={student.signature_url} 
                      alt={`${student.name}'s signature`} 
                      className="h-16 w-auto object-contain opacity-90 transition-transform duration-500 hover:scale-105" 
                      style={{ filter: 'drop-shadow(0 0 2px rgba(244,196,48,0.5))' }}
                    />
                    <span className="font-mono text-[8px] text-muted/30 uppercase tracking-[0.3em] mb-2 mr-2">Verified</span>
                  </div>
                )}

                {/* Social links */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(() => {
                      const vis = typeof student.visibility_preferences === 'string' 
                                ? JSON.parse(student.visibility_preferences)
                                : (student.visibility_preferences || {});
                      
                      const links = [];
                      if (student.instagram && vis['instagram'] !== false) {
                        links.push({ id: 'instagram', url: `https://instagram.com/${student.instagram}`, label: `IG @${student.instagram}` });
                      }
                      if (student.snapchat && vis['snapchat'] !== false) {
                        links.push({ id: 'snapchat', url: `https://snapchat.com/add/${student.snapchat}`, label: `SC @${student.snapchat}` });
                      }
                      
                      if (student.website && vis['website'] !== false) {
                        try {
                          const parsed = JSON.parse(student.website);
                          if (Array.isArray(parsed)) {
                            parsed.forEach((l, i) => {
                              if (l.url) links.push({ id: `custom_${i}`, url: l.url, label: `${l.title || 'Link'} ↗` });
                            });
                          }
                        } catch (e) {
                          // Not a JSON array, just a regular website
                          links.push({ id: 'website', url: student.website, label: 'Website ↗' });
                        }
                      }

                      return links.map(link => (
                        <a key={link.id} href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noreferrer"
                           className="font-mono text-[9px] tracking-wider text-muted hover:text-accent-yellow border border-white/[0.08] hover:border-accent-yellow/30 px-3 py-1.5 rounded-full transition-colors">
                          {link.label}
                        </a>
                      ));
                    })()}
                  </div>
                </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div key="msgs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.22 }}>
                {/* Leave message input */}
                <div className="flex gap-2 mb-3">
                  <input type="text" value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && post()}
                    placeholder={`Say something to ${(student.name || 'someone').split(' ')[0]}…`}
                    className="flex-1 bg-white/[0.04] border border-white/[0.07] focus:border-accent-yellow/35
                               text-text-primary font-body text-sm px-3 py-2.5 rounded-xl
                               placeholder:text-muted/30 outline-none transition-colors" />
                  <motion.button onClick={post} disabled={posting}
                    whileTap={{ scale: 0.9 }}
                    className="px-4 py-2.5 rounded-xl font-mono text-[10px] tracking-wider
                               transition-colors flex-shrink-0"
                    style={{ background: accent.bg, color: accent.text }}>
                    {posting ? '…' : 'Post'}
                  </motion.button>
                </div>

                {postStatus && (
                  <p className="font-mono text-[10px] text-muted/70 mb-2">{postStatus}</p>
                )}

                {/* Messages list */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {loadingMsgs && <p className="font-mono text-[10px] text-muted/50">Loading approved memos...</p>}
                  {msgs.map((msg, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white/[0.04] rounded-xl p-3">
                      <p className="font-body text-sm text-text-primary/70">{msg}</p>
                    </motion.div>
                  ))}
                  {!loadingMsgs && msgs.length === 0 && (
                    <p className="font-mono text-[10px] text-muted/50">No approved memos yet.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  ), document.body)
}

/* ── Card ──────────────────────────────────────────────── */
export default function YearbookCard({ student }) {
  const [open, setOpen] = useState(false)
  const accent = ACCENT_COLORS[student.accentColor] || ACCENT_COLORS.yellow

  return (
    <>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="yearbook-card cursor-pointer group relative"
        onClick={() => setOpen(true)}>

        {/* Photo container */}
        <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-3 bg-bg-secondary">
          {student.image
            ? <img src={student.image} alt={student.name}
                   className="yearbook-img w-full h-full object-cover" />
            : (
              <div className="yearbook-img w-full h-full flex items-center justify-center"
                   style={{ background: `${accent.bg}12` }}>
                <span className="font-archive text-5xl select-none transition-colors duration-500"
                      style={{ color: `${accent.bg}40` }}>
                  {(student.name || 'AB').split(' ').map(n=>n[0]).join('').slice(0,2)}
                </span>
              </div>
            )
          }

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-350" />

          {/* View profile label */}
          <div className="absolute inset-x-0 bottom-3 text-center
                          translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                          transition-all duration-300">
            <span className="font-mono text-[9px] tracking-widest text-white/75 uppercase">View Profile</span>
          </div>

          {/* Accent dot */}
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
               style={{ background: accent.bg, boxShadow: `0 0 6px ${accent.glow}` }} />

          {/* Signature overlay (only in grid view) */}
          {student.signature_url && (
            <div className="absolute bottom-6 inset-x-0 flex justify-center z-10 pointer-events-none drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
              <img src={student.signature_url} alt="Signature" className="h-10 sm:h-12 object-contain opacity-90 transition-transform hover:scale-105" />
            </div>
          )}

        </div>

        {/* Info */}
        <h4 className="font-archive text-base md:text-lg leading-tight transition-colors duration-200"
            style={{ color: accent.bg }}>
          {student.name}
        </h4>
        {student.role && (
          <p className="font-body text-[11px] text-muted/40 mt-0.5 truncate">{student.role}</p>
        )}
      </motion.div>

      <AnimatePresence>
        {open && <StudentModal student={student} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
