import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ⚠️  Passwords stored as plaintext – localhost only, NOT production safe

const SECTIONS = ['CSE-A', 'CSE-B', 'CSE-C', 'Other']

function Field({ label, required, children }) {
  return (
    <div>
      <label className="font-mono text-[9px] tracking-[0.3em] text-muted/60 uppercase block mb-1.5">
        {label} {required && <span className="text-accent-yellow/60">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full bg-bg-primary border border-muted/15 focus:border-accent-yellow/40 text-text-primary font-body text-sm px-3.5 py-2.5 rounded-sm placeholder:text-muted/25 outline-none transition-all duration-300 focus:shadow-[0_0_0_1px_rgba(244,196,48,0.1)]'

export default function ProfileUploadModal({ onClose, onSubmit }) {
  const [step, setStep] = useState(1) // 1=info 2=social 3=done
  const [form, setForm] = useState({
    name: '', section: 'CSE-A', role: '', quote: '',
    phone: '', instagram: '', linkedin: '', image: null, imagePreview: null,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const clearErr = (key) => setErrors(e => { const n = { ...e }; delete n[key]; return n })

  const validateStep1 = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.quote.trim()) e.quote = 'A quote is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErrors(e => ({ ...e, image: 'Max 5MB' })); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      set('image', file)
      set('imagePreview', ev.target.result)
      clearErr('image')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))

    // In production, upload image to Supabase Storage, then insert student record
    // const { data: imgData } = await supabase.storage.from('avatars').upload(...)
    // const { data } = await supabase.from('students').insert([{ ...form, image: imgData.publicUrl }])

    const newStudent = {
      id: Date.now(),
      name: form.name.trim(),
      section: form.section,
      role: form.role.trim() || 'Batch 2026',
      quote: form.quote.trim(),
      phone: form.phone.trim() || null,
      instagram: form.instagram.trim() || null,
      linkedin: form.linkedin.trim() || null,
      image: form.imagePreview,
    }

    setSubmitting(false)
    setStep(3)
    setTimeout(() => {
      onSubmit?.(newStudent)
      onClose()
    }, 1800)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(12px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 glass border border-accent-yellow/10 rounded-sm w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-accent-yellow/60 to-transparent" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="font-mono text-[9px] tracking-widest text-accent-yellow/50 uppercase">
                Step {step} of 2
              </span>
              <h2 className="font-display text-2xl italic text-accent-yellow mt-1">
                {step === 1 ? 'Your Profile' : step === 2 ? 'Social Links' : 'Done!'}
              </h2>
            </div>
            <button onClick={onClose} className="text-muted hover:text-accent-yellow transition-colors font-mono text-sm mt-1">✕</button>
          </div>

          {/* Step progress */}
          <div className="flex gap-1.5 mb-7">
            {[1, 2].map(s => (
              <div key={s} className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-accent-yellow' : 'bg-muted/20'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step 1: Basic Info ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Photo upload */}
                <div className="flex gap-4 items-start">
                  <div
                    className="w-20 h-20 rounded-sm bg-bg-primary border border-dashed border-muted/20 hover:border-accent-yellow/30 flex items-center justify-center cursor-pointer flex-shrink-0 overflow-hidden transition-colors duration-300 relative group"
                    onClick={() => fileRef.current?.click()}
                  >
                    {form.imagePreview
                      ? <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      : (
                        <div className="flex flex-col items-center gap-1 text-center">
                          <span className="text-lg opacity-20 group-hover:opacity-40 transition-opacity">📷</span>
                          <span className="font-mono text-[7px] text-muted/40 tracking-wider">Photo</span>
                        </div>
                      )
                    }
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <Field label="Full Name" required>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => { set('name', e.target.value); clearErr('name') }}
                        placeholder="Your name"
                        className={inputClass}
                        maxLength={60}
                      />
                      {errors.name && <p className="font-mono text-[9px] text-red-400 mt-1">{errors.name}</p>}
                    </Field>
                    <Field label="Section">
                      <select
                        value={form.section}
                        onChange={e => set('section', e.target.value)}
                        className={`${inputClass} appearance-none`}
                      >
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>

                <Field label="Your Role / Known As">
                  <input
                    type="text"
                    value={form.role}
                    onChange={e => set('role', e.target.value)}
                    placeholder="e.g. Hackathon Queen, The Chill One, Class Rep..."
                    className={inputClass}
                    maxLength={50}
                  />
                </Field>

                <Field label="Your Quote" required>
                  <textarea
                    value={form.quote}
                    onChange={e => { set('quote', e.target.value); clearErr('quote') }}
                    placeholder="Something that defines you in this batch..."
                    rows={3}
                    maxLength={200}
                    className={`${inputClass} resize-none`}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.quote && <p className="font-mono text-[9px] text-red-400">{errors.quote}</p>}
                    <span className="font-mono text-[8px] text-muted/30 ml-auto">{form.quote.length}/200</span>
                  </div>
                </Field>

                {errors.image && <p className="font-mono text-[9px] text-red-400">{errors.image}</p>}

                <motion.button
                  onClick={() => { if (validateStep1()) setStep(2) }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 bg-accent-yellow text-bg-primary font-mono text-xs tracking-widest uppercase hover:bg-soft-yellow transition-colors"
                >
                  Next →
                </motion.button>
              </motion.div>
            )}

            {/* ── Step 2: Social Links ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <p className="font-body text-sm text-muted/70 mb-5">
                  These are optional — add whatever you want people to see.
                </p>

                <Field label="Phone Number">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted/40">📞</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`${inputClass} pl-9`}
                      maxLength={20}
                    />
                  </div>
                </Field>

                <Field label="Instagram Handle">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted/50">@</span>
                    <input
                      type="text"
                      value={form.instagram}
                      onChange={e => set('instagram', e.target.value.replace('@', ''))}
                      placeholder="username"
                      className={`${inputClass} pl-8`}
                      maxLength={40}
                    />
                  </div>
                </Field>

                <Field label="LinkedIn Profile URL or Username">
                  <input
                    type="text"
                    value={form.linkedin}
                    onChange={e => set('linkedin', e.target.value)}
                    placeholder="your-linkedin-username"
                    className={inputClass}
                    maxLength={80}
                  />
                </Field>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-muted/15 text-muted hover:text-text-primary hover:border-muted/30 font-mono text-xs tracking-widest uppercase transition-colors"
                  >
                    ← Back
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 py-3 font-mono text-xs tracking-widest uppercase transition-all ${
                      submitting
                        ? 'bg-accent-yellow/30 text-accent-yellow cursor-wait'
                        : 'bg-accent-yellow text-bg-primary hover:bg-soft-yellow'
                    }`}
                  >
                    {submitting ? '···' : 'Submit Profile'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Done ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl mb-4"
                >
                  ✨
                </motion.div>
                <h3 className="font-display text-2xl italic text-accent-yellow mb-2">You're in the book.</h3>
                <p className="font-body text-sm text-muted">Your profile has been added to the batch.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
