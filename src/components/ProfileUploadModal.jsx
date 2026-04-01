import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SignaturePad from './SignaturePad'

const SECTIONS = ['CSE-A', 'CSE-B', 'CSE-C', 'Other']
const COLORS   = ['yellow','rose','violet','cyan','green','white']
const COLOR_MAP = {
  yellow: '#F4C430', rose: '#f43f5e', violet: '#7c3aed',
  cyan: '#06b6d4',  green: '#22c55e', white:  '#EAEAEA',
}
const BADGES = ['🔥','🎵','⚡','💎','🌙','✨','🎨','🚀','💫','🧠','📚','🏆']

const input = 'w-full bg-white/[0.04] border border-white/[0.07] focus:border-accent-yellow/40 text-text-primary font-body text-sm px-4 py-3 rounded-xl placeholder:text-muted/25 outline-none transition-all focus:bg-white/[0.06]'

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="font-mono text-[9px] tracking-[0.3em] text-muted/55 uppercase block mb-1.5">
        {label} {required && <span className="text-accent-yellow/50">*</span>}
      </label>
      {children}
      {error && <p className="font-mono text-[9px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}

const STEPS = ['Profile', 'Style', 'Socials', 'Signature']

export default function ProfileUploadModal({ onClose, onSubmit, initialData }) {
  const [step, setStep] = useState(0)
  const isEdit = !!initialData
  
  const [form, setForm] = useState({
    name: initialData?.name || '',
    section: initialData?.section || 'CSE-A',
    role: initialData?.role || '',
    quote: initialData?.quote || '',
    bio: initialData?.bio || '',
    time_capsule: initialData?.time_capsule || '',
    signature_url: initialData?.signature_url || '',
    phone: initialData?.phone || '',
    instagram: initialData?.instagram || '',
    snapchat: initialData?.snapchat || '',
    linkedin: initialData?.linkedin || '',
    email: initialData?.email || '',
    image: initialData?.image || null, // Will hold URL if existing
    imagePreview: initialData?.image || null,
    accentColor: initialData?.accent_color || 'yellow', // using snake_case as per DB sometimes, but let's default to standard
    badge: initialData?.badge || '🔥',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]             = useState(false)
  const imgRef    = useRef(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const clrErr = k => setErrors(e => { const n={...e}; delete n[k]; return n })

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Required'
    if (!form.quote.trim()) e.quote = 'Required'
    setErrors(e); return !Object.keys(e).length
  }

  const handleImage = (e) => {
    const f = e.target.files?.[0]; if (!f) return
    if (f.size > 8e6) { setErrors(p => ({...p, image:'Max 8MB'})); return }
    const r = new FileReader()
    r.onload = ev => { set('image', f); set('imagePreview', ev.target.result); clrErr('image') }
    r.readAsDataURL(f)
  }

  const submit = async () => {
    if (!validate()) { setStep(0); return }
    setSubmitting(true)
    try {
      await onSubmit?.({
        name: form.name.trim(), section: form.section,
        role: form.role.trim() || 'Batch 2026',
        quote: form.quote.trim(), bio: form.bio.trim(),
        phone: form.phone.trim()||null, 
        instagram: form.instagram.trim()||null, 
        snapchat: form.snapchat?.trim()||null, 
        email: form.email?.trim()||null, 
        linkedin: form.linkedin.trim()||null,
        time_capsule: form.time_capsule?.trim()||null,
        signature_url: form.signature_url || null,
        imageFile: form.image, // Actual File object
        imagePreview: form.imagePreview, // Base64 fallback if needed
        accentColor: form.accentColor, badge: form.badge,
      })
      setSubmitting(false); setDone(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      setSubmitting(false)
      // Error handling can be added here
    }
  }

  const accent = COLOR_MAP[form.accentColor] || '#F4C430'

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />

      <motion.div
        initial={{ opacity:0, y:60, filter:'blur(12px)' }}
        animate={{ opacity:1, y:0,  filter:'blur(0px)'  }}
        exit={{   opacity:0, y:40                        }}
        transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
        className="relative z-10 w-full sm:max-w-lg max-h-[94vh] overflow-y-auto
                   bg-[#16161a] rounded-t-3xl sm:rounded-3xl border border-white/[0.08]"
        onClick={e => e.stopPropagation()}>

        {/* Pull handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* Accent bar */}
        <div className="h-1 mx-5 mt-3 sm:mt-4 rounded-full transition-all duration-500"
             style={{ background: accent, boxShadow:`0 0 20px ${accent}55` }} />

        {done ? (
          <div className="py-16 text-center">
            <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:0.5 }}
              className="text-5xl mb-4">{form.badge}</motion.div>
            <h3 className="font-archive text-2xl mb-2" style={{color:accent}}>You're in the book.</h3>
            <p className="font-body text-sm text-muted/60">Your profile has been added.</p>
          </div>
        ) : (
          <div className="p-5 md:p-7">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="font-mono text-[9px] tracking-widest text-muted/40 uppercase">
                  Step {step+1} of {STEPS.length}
                </span>
                <h2 className="font-archive text-2xl mt-0.5" style={{color:accent}}>{STEPS[step]}</h2>
              </div>
              <button onClick={onClose}
                className="text-muted/40 hover:text-muted transition-colors font-mono text-sm mt-1">✕</button>
            </div>

            {/* Progress */}
            <div className="flex gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <motion.div key={i}
                  animate={{ opacity: i <= step ? 1 : 0.2 }}
                  className="h-0.5 flex-1 rounded-full transition-all duration-400"
                  style={{ background: i <= step ? accent : '#333' }} />
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── Step 0: Profile ── */}
              {step === 0 && (
                <motion.div key="s0" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                  transition={{duration:0.25}} className="space-y-4">

                  {/* Photo + name side by side */}
                  <div className="flex gap-3.5 items-start">
                    <div className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden cursor-pointer
                                    border-2 border-dashed border-white/10 hover:border-white/20
                                    flex items-center justify-center transition-colors group bg-white/[0.03]"
                         onClick={() => imgRef.current?.click()}>
                      {form.imagePreview
                        ? <img src={form.imagePreview} alt="" className="w-full h-full object-cover" />
                        : <div className="text-center">
                            <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity mb-0.5">📷</div>
                            <span className="font-mono text-[7px] text-muted/30">Photo</span>
                          </div>
                      }
                      <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <Field label="Full Name" required error={errors.name}>
                        <input type="text" value={form.name} placeholder="Your name"
                          onChange={e=>{set('name',e.target.value);clrErr('name')}}
                          className={input} maxLength={60} />
                      </Field>
                      <Field label="Section">
                        <select value={form.section} onChange={e=>set('section',e.target.value)}
                          className={`${input} appearance-none`}>
                          {SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>

                  <Field label="Known As / Role">
                    <input type="text" value={form.role} placeholder="e.g. Hackathon King, The Vibe, Class Rep…"
                      onChange={e=>set('role',e.target.value)} className={input} maxLength={50} />
                  </Field>

                  <Field label="Your Quote" required error={errors.quote}>
                    <textarea value={form.quote} rows={3} maxLength={200}
                      onChange={e=>{set('quote',e.target.value);clrErr('quote')}}
                      placeholder="Something that defines you in this batch…"
                      className={`${input} resize-none`} />
                    <span className="font-mono text-[8px] text-muted/25 float-right mt-1">{form.quote.length}/200</span>
                  </Field>

                  <Field label="Bio (optional)">
                    <textarea value={form.bio} rows={2} maxLength={300}
                      onChange={e=>set('bio',e.target.value)}
                      placeholder="A little more about you…"
                      className={`${input} resize-none`} />
                  </Field>
                </motion.div>
              )}

              {/* ── Step 1: Style ── */}
              {step === 1 && (
                <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                  transition={{duration:0.25}} className="space-y-6">

                  {/* Accent color */}
                  <div>
                    <p className="font-mono text-[9px] tracking-widest text-muted/55 uppercase mb-3">Card Accent Color</p>
                    <div className="flex gap-3 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c} onClick={() => set('accentColor', c)}
                          className={`color-swatch ${form.accentColor===c?'active':''}`}
                          style={{ background: COLOR_MAP[c] }}
                          title={c} />
                      ))}
                    </div>
                  </div>

                  {/* Badge emoji */}
                  <div>
                    <p className="font-mono text-[9px] tracking-widest text-muted/55 uppercase mb-3">Profile Badge</p>
                    <div className="flex gap-2 flex-wrap">
                      {BADGES.map(b => (
                        <button key={b} onClick={() => set('badge', b)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                            form.badge===b
                              ? 'bg-accent-yellow/20 border border-accent-yellow/40 scale-110'
                              : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07]'
                          }`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.06]">
                    <p className="font-mono text-[8px] text-muted/30 uppercase mb-3 tracking-widest">Preview</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                           style={{ background:`${accent}18`, border:`1px solid ${accent}30` }}>
                        <span className="font-archive text-xl" style={{color:accent}}>
                          {form.name ? form.name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'AB'}
                        </span>
                      </div>
                      <div>
                        <div className="font-archive text-base" style={{color:accent}}>
                          {form.name || 'Your Name'} <span className="text-sm">{form.badge}</span>
                        </div>
                        <div className="font-mono text-[9px] text-muted/50">{form.section}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Socials ── */}
              {step === 2 && (
                <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                  transition={{duration:0.25}} className="space-y-5">
                  <p className="font-body text-sm text-muted/55">All optional — share what you're comfortable with.</p>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Phone Number">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted/40">📞</span>
                        <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)}
                          placeholder="+91 98765 43210" maxLength={20}
                          className={`${input} pl-9`} />
                      </div>
                    </Field>

                    <Field label="Email">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted/40">✉️</span>
                        <input type="email" value={form.email} onChange={e=>set('email',e.target.value)}
                          placeholder="Your email" maxLength={50}
                          className={`${input} pl-9`} />
                      </div>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Instagram">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted/40">@</span>
                        <input type="text" value={form.instagram}
                          onChange={e=>set('instagram',e.target.value.replace('@',''))}
                          placeholder="username" maxLength={40}
                          className={`${input} pl-8`} />
                      </div>
                    </Field>

                    <Field label="Snapchat">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted/40">👻</span>
                        <input type="text" value={form.snapchat}
                          onChange={e=>set('snapchat',e.target.value)}
                          placeholder="username" maxLength={40}
                          className={`${input} pl-8`} />
                      </div>
                    </Field>
                  </div>

                  <Field label="LinkedIn">
                    <input type="text" value={form.linkedin} onChange={e=>set('linkedin',e.target.value)}
                      placeholder="linkedin.com/in/your-profile" maxLength={80}
                      className={input} />
                  </Field>
                </motion.div>
              )}

              {/* ── Step 4: Signature ── */}
              {step === 3 && (
                <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                  transition={{duration:0.25}} className="space-y-5">
                  <p className="font-body text-sm text-muted/55 mb-2">Leave your mark! Your digital signature will appear on your Yearbook card.</p>
                  
                  <Field label="Digital Signature">
                    <SignaturePad onSave={(data) => set('signature_url', data)} />
                    {form.signature_url && (
                        <div className="mt-3 flex items-center justify-between px-3 py-2 bg-[#F4C430]/10 rounded-lg border border-[#F4C430]/20">
                          <span className="font-mono text-[9px] text-[#F4C430] uppercase tracking-widest">Signature Locked</span>
                          <span className="text-[12px]">✨</span>
                        </div>
                    )}
                  </Field>

                  <div className="pt-4 border-t border-white/5">
                    <Field label="Time Capsule 2036 🔮 (Hidden for 10 years)">
                      <textarea value={form.time_capsule} onChange={e=>set('time_capsule', e.target.value)}
                        placeholder="Where will you be in 10 years? (Only you... or future you... will see this)"
                        rows={3} maxLength={500} className={`${input} resize-none`} />
                    </Field>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-7">
              {step > 0 && (
                <button onClick={() => setStep(s=>s-1)}
                  className="flex-1 py-3.5 rounded-xl border border-white/[0.08] text-muted
                             hover:text-text-primary hover:border-white/14 font-mono text-[10px]
                             tracking-widest uppercase transition-all">
                  ← Back
                </button>
              )}
              <motion.button
                onClick={step < STEPS.length-1 ? () => { if(step===0 && !validate()) return; setStep(s=>s+1) } : submit}
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3.5 rounded-xl font-mono text-[10px] tracking-widest uppercase
                           transition-all disabled:opacity-50"
                style={{ background: accent, color: form.accentColor==='rose'||form.accentColor==='violet' ? '#fff' : '#111' }}>
                {submitting ? '···'
                  : step < STEPS.length-1 ? 'Next →'
                  : 'Add to Archive ✦'}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
