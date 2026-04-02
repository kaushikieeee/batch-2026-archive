import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import SignaturePad from './SignaturePad'
import { loginUser, changePassword, updateUserProfile, uploadFile } from '../lib/supabase'
import { YearbookSkeleton } from './Skeleton' // useful for 3d look

export default function LoginScreen({ onLogin }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Onboarding state
  const [authUser, setAuthUser] = useState(null)
  
  // LOGIN | INTRO_CINEMATIC | WELCOME | PASSWORD | VIBE_CHECK | SIGNATURE | PROFILE | PRIVACY | DONE
  const [step, setStep] = useState('LOGIN') 
  
  // Password state
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  
  // Profile state
  const [customLinks, setCustomLinks] = useState([])
  const [profile, setProfile] = useState({
    name: '', section: 'CSE-A', role: '', quote: '', bio: '', time_capsule: '', signature_url: '', phone: '', instagram: '', snapchat: '', email: '',
    image: null, accent_color: 'yellow', badge: '✨'
  })
  
  const [imageFile, setImageFile] = useState(null)
  const fileRef = useRef(null)

  const [privacy, setPrivacy] = useState({
    show_phone: false, show_instagram: true, show_snapchat: true, show_email: false, show_linkedin: true
  })

  // Cinematic Typing State
  const introMessage = authUser ? `Hello ${authUser.name || authUser.username}, ${authUser.welcome_message || 'Welcome to the archive.'}` : ''

  useEffect(() => {
    if (step === 'INTRO_CINEMATIC') {
      let interval = setTimeout(() => {
        if (authUser?.personal_letter) {
          setStep('PERSONAL_LETTER')
        } else {
          setStep('PASSWORD')
        }
      }, 4500)
      return () => clearTimeout(interval)
    }
  }, [step, authUser])


  const handleChange = (e, obj, setter) => {
    const { name, value, type, checked } = e.target
    setter({ ...obj, [name]: type === 'checkbox' ? checked : value })
  }

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.')
      return
    }
    setError('')
    setLoading(true)

    const { user, error: err } = await loginUser(username.trim(), password.trim())
    setLoading(false)
    
    if (err || !user) {
      setError('Invalid username or password.')
      return
    }

    if (user.must_change_password) {
      setAuthUser(user)
      if (user.name) setProfile(p => ({ ...p, name: user.name, section: user.section || p.section, role: user.role || p.role, quote: user.quote || p.quote, bio: user.bio || p.bio, phone: user.phone || p.phone, instagram: user.instagram || p.instagram, snapchat: user.snapchat || p.snapchat, email: user.email || p.email, image: user.image || p.image, signature_url: user.signature_url || p.signature_url, time_capsule: user.time_capsule || p.time_capsule }))
      try {
        if (user.website) setCustomLinks(JSON.parse(user.website))
      } catch(e) {}
      let vp = user.visibility_preferences || {};
      if (typeof vp === 'string') { try { vp = JSON.parse(vp); } catch(e) { vp = {}; } }
      setPrivacy({
        show_phone: vp.phone || false, 
        show_instagram: vp.instagram !== false, 
        show_snapchat: vp.snapchat !== false, 
        show_email: vp.email || false, 
        show_linkedin: vp.website !== false
      })
      // Start Cinematic Onboarding
      setStep('INTRO_CINEMATIC')
    } else {
      onLogin(user)
    }
  }

  const handlePasswordSubmit = async () => {
    if (newPass.length < 6) return setError('Password must be at least 6 characters.')
    if (newPass !== confirmPass) return setError('Passwords do not match.')
    setError('')
    setLoading(true)
    const { error: err } = await changePassword(authUser.id, newPass)
    setLoading(false)
    if (err) return setError('Failed to change password: ' + err.message)
    setStep('VIBE_CHECK')
  }

  const handleVibeCheckSubmit = () => {
    setStep('PROFILE')
  }

  const handleProfileSubmit = async () => {
    setStep('SOCIALS')
  }

  const handleSocialsSubmit = async () => {
    setLoading(true)
    let imageUrl = profile.image
    const tid = toast.loading('Uploading assets...')
    
    if (imageFile) {
      const { data, error } = await uploadFile(imageFile)
      if (!error && data) imageUrl = data.publicUrl
    }
    
    const { error } = await updateUserProfile(authUser.id, { ...profile, image: imageUrl, website: JSON.stringify(customLinks.filter(l => l.title && l.url)) })
    setLoading(false)
    toast.dismiss(tid)
    if (error) return setError('Failed to save profile.')
    
    setStep('PRIVACY')
  }

  const handlePrivacySubmit = async () => {
    setLoading(true)
    const payload = {
      ...privacy,
      visibility_preferences: {
        phone: privacy.show_phone,
        email: privacy.show_email,
        instagram: privacy.show_instagram,
        snapchat: privacy.show_snapchat,
        website: privacy.show_linkedin
      }
    };
    const { error } = await updateUserProfile(authUser.id, payload)
    setLoading(false)
    if (error) return setError('Failed to save privacy settings.')

    setStep('DONE')
    toast.success('Archive unlocked!', { icon: '🔓' })
    
    setTimeout(() => {
      console.log("Calling onLogin from setTimeout")
      onLogin({ ...authUser, ...profile, ...privacy, must_change_password: false })
    }, 1800)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  // --- WIZARD RENDERERS ---

  if (step === 'INTRO_CINEMATIC') {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#111111]">
        {/* Yellow radial glow at the center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-accent-yellow/20 blur-[120px]" />
        </div>
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{duration:2, ease: "easeOut"}} className="relative z-10 flex flex-col items-center px-4 w-full">
           {authUser?.welcome_image_url && (
             <motion.img 
                initial={{ opacity:0, y: 10 }} animate={{ opacity:1, y: 0 }} transition={{ delay: 0.5, duration: 1.5 }}
                src={authUser.welcome_image_url} alt="Welcome" 
                className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl mb-8 border-2 border-accent-yellow/40 shadow-[0_0_30px_rgba(244,196,48,0.3)]" 
             />
           )}
           <h2 className="text-3xl md:text-5xl font-archive text-accent-yellow tracking-wide text-center drop-shadow-[0_0_15px_rgba(244,196,48,0.5)]">
             {introMessage}
           </h2>
        </motion.div>
      </div>
    )
  }

  if (step === 'PERSONAL_LETTER') {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0d0d0d] p-4 sm:p-8 overflow-y-auto overflow-x-hidden">
        {/* Aesthetic Background Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[120vw] h-[120vw] max-w-[1000px] max-h-[1000px] rounded-full bg-accent-yellow/5 blur-[150px] opacity-70" />
        </div>
        
        <motion.div initial={{ opacity: 0, y: 40, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="relative w-full max-w-2xl my-8 mx-auto z-10 flex shrink-0">
           
           {/* The Paper */}
           <div className="w-full bg-[#f4f1ea] rounded p-8 sm:p-12 md:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.8),inset_0_0_120px_rgba(139,69,19,0.06)] relative border border-[#e3dcc8]">
             
             {/* Decorative tape / pushpin */}
             <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 w-40 h-10 bg-[#e8e4d5] opacity-90 rotate-[-1.5deg] shadow-sm z-20 backdrop-blur-sm border border-[#dfdacc]" style={{ clipPath: 'polygon(1% 0, 99% 3%, 99% 98%, 0 96%)' }} />
             <div className="absolute bottom-[-12px] right-8 w-24 h-8 bg-[#e8e4d5] opacity-80 rotate-[4deg] shadow-sm z-20 backdrop-blur-sm border border-[#dfdacc]" style={{ clipPath: 'polygon(0 4%, 98% 0, 100% 96%, 3% 100%)' }} />

             {/* Watermark */}
             <div className="absolute top-10 right-10 w-24 h-24 border-4 border-[#8b4513] rounded-full opacity-[0.06] flex items-center justify-center rotate-[-15deg] pointer-events-none hidden sm:flex">
                <span className="font-archive text-2xl text-[#8b4513] uppercase tracking-widest mt-1">2026</span>
             </div>

             <h3 className="font-handwritten text-4xl sm:text-5xl text-[#3b2a1a] mb-10 mt-6 mix-blend-multiply relative z-10 drop-shadow-sm">A letter from the developer</h3>
             
             <div className="font-body text-base sm:text-lg text-[#2a221b] leading-[2.2] space-y-6 whitespace-pre-wrap mix-blend-multiply relative z-10 min-h-[150px]">
                {authUser?.personal_letter}
             </div>
             
             {/* Note Section */}
             <div className="mt-16 pt-8 border-t-[1.5px] border-dashed border-[#8b4513]/20 relative z-10">
               <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                 <div className="flex-1 flex items-start gap-4 p-4 bg-[#8b4513]/[0.04] rounded-xl border border-[#8b4513]/10">
                   <span className="text-xl mt-0.5 opacity-80">📸</span>
                   <p className="font-mono text-[10px] sm:text-xs text-[#5c4033]/80 uppercase tracking-widest leading-loose text-left">
                     <strong className="block mb-1 text-[#3b2a1a]">Screenshot this now.</strong>
                     This letter is permanently sealed. It is uniquely generated for you and will never be rendered on this site again.
                   </p>
                 </div>
                 <button onClick={() => setStep('PASSWORD')} className="shrink-0 w-full sm:w-auto font-mono text-xs sm:text-sm tracking-[0.2em] uppercase px-8 py-5 bg-[#1f1a17] text-[#f4f1ea] rounded hover:bg-[#000000] focus:ring-4 ring-[#8b4513]/20 transition-all hover:scale-105 shadow-2xl duration-300 active:scale-95">
                    I understand →
                 </button>
               </div>
             </div>

           </div>
        </motion.div>
      </div>
    )
  }

  if (step === 'DONE') {
    return (
      <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="text-center">
           <h1 className="text-6xl text-accent-yellow font-archive drop-shadow-[0_0_20px_rgba(244,196,48,0.5)]">ACCESS GRANTED</h1>
           <p className="text-muted font-mono mt-4 tracking-widest">Constructing your digital yearbook...</p>
        </motion.div>
      </motion.div>
    )
  }

  if (step === 'PASSWORD') {
    return (
      <WizardLayout title="Security Check" onNext={handlePasswordSubmit} nextText="Secure Account" loading={loading} error={error} subtitle="Let's start by changing your assigned key">
         <Input label="New Password" type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} />
         <Input label="Confirm Password" type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} />
      </WizardLayout>
    )
  }

  if (step === 'VIBE_CHECK') {
    return (
      <WizardLayout title="The Vibe Check" onNext={handleVibeCheckSubmit} onBack={() => setStep('PASSWORD')} nextText="Continue →" subtitle="Less boring forms, more personality">
         <Input label="Your Campus Role" name="role" placeholder="e.g. Code Ninja, Coffee Addict" value={profile.role} onChange={e => handleChange(e, profile, setProfile)} />
         
         <div className="mb-4">
           <label className="font-mono text-[9px] tracking-[0.3em] text-accent-yellow uppercase block mb-1.5 flex items-center justify-between">
              <span>Draw Your Signature 🖋️</span>
           </label>
           <SignaturePad onSave={(data) => setProfile(p => ({...p, signature_url: data}))} />
           <p className="font-mono text-[10px] sm:text-xs text-accent-yellow/90 mt-4 mb-4 text-center bg-accent-yellow/10 border border-accent-yellow/20 p-3 rounded-lg">💡 Tip: Lock in the signature after you're done, and then press next!</p>
         </div>

         <Input label="Ultimate Survival Tip for Juniors" name="quote" placeholder="Sleep is a myth." value={profile.quote} onChange={e => handleChange(e, profile, setProfile)} />
         
         <div className="mb-4">
           <label className="font-mono text-[9px] tracking-[0.3em] text-accent-yellow uppercase block mb-1.5 flex items-center justify-between">
              <span>Time Capsule 2036 🔮</span>
              <span className="text-muted/40">Locked for 10 years</span>
           </label>
           <textarea placeholder="Where will you be in 10 years? Leave a message for your future self." name="time_capsule" rows={2} className="w-full bg-white/[0.02] border border-accent-yellow/20 focus:border-accent-yellow/60 text-sm px-3 py-2 rounded-xl text-text-primary outline-none transition-all placeholder:text-muted/20" value={profile.time_capsule} onChange={e => handleChange(e, profile, setProfile)} />
         </div>
      </WizardLayout>
    )
  }

  if (step === 'PROFILE') {
    // 3D Holographic Card Preview
    const cardAccent = profile.accent_color === 'yellow' ? '#F4C430' : profile.accent_color === 'rose' ? '#f43f5e' : profile.accent_color === 'cyan' ? '#06b6d4' : '#EAEAEA'
    return (
      <WizardLayout title="Digital Identity" onNext={handleProfileSubmit} onBack={() => setStep('VIBE_CHECK')} loading={loading} error={error} subtitle="Setup your visual representation">
         <div className="flex flex-col items-center gap-4 mb-6">
           <p className="font-archive text-xl md:text-2xl text-white/90 text-center mb-1 text-glow-sm">Upload Profile Photo</p>
           <motion.div 
             whileHover={{ rotateY: 10, rotateX: -10, scale: 1.05 }}
             style={{ perspective: 1000 }}
             className="relative w-28 h-28 rounded-full border-2 p-1 overflow-hidden"
             onClick={() => fileRef.current?.click()}
           >
             <div className="absolute inset-0 rounded-full border-2 border-dashed opacity-50 animate-[spin_10s_linear_infinite]" style={{ borderColor: cardAccent }}></div>
             <div className="w-full h-full rounded-full bg-black/40 overflow-hidden cursor-pointer flex items-center justify-center relative z-10 hover:opacity-80 transition">
                {imageFile ? <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" /> : (profile.image ? <img src={profile.image} className="w-full h-full object-cover"/> : <span className="text-3xl">📸</span>)}
             </div>
           </motion.div>
           <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => e.target.files[0] && setImageFile(e.target.files[0])} />
         </div>
         
         <Input label="Display Name" name="name" placeholder="What should we call you?" value={profile.name} onChange={e => handleChange(e, profile, setProfile)} />
         
         <div className="mb-4">
           <label className="font-mono text-[9px] tracking-[0.3em] text-muted uppercase block mb-1.5">Aura Details</label>
           <div className="flex gap-2">
             {['yellow', 'rose', 'cyan', 'white'].map(c => (
               <button key={c} onClick={() => setProfile({...profile, accent_color: c})} className={`w-8 h-8 rounded-full border-2 opacity-80 hover:opacity-100 transition-all ${profile.accent_color===c ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'border-transparent'}`} style={{ backgroundColor: c === 'yellow' ? '#F4C430' : c === 'rose' ? '#f43f5e' : c === 'cyan' ? '#06b6d4' : '#EAEAEA' }}></button>
             ))}
             <div className="w-px bg-white/10 mx-2 h-8"></div>
             {['✨', '🔥', '👑', '👽', '💀'].map(b => (
                <button key={b} onClick={() => setProfile({...profile, badge: b})} className={`w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border ${profile.badge===b ? 'border-accent-yellow scale-110' : 'border-transparent'}`}>{b}</button>
             ))}
           </div>
         </div>
         
         <p className="font-mono text-[9px] text-muted/40 uppercase mb-3 mt-5">Social Links (Optional)</p>
         <div className="grid grid-cols-2 gap-3">
           <Input label="Insta" name="instagram" placeholder="@user" value={profile.instagram} onChange={e => handleChange(e, profile, setProfile)} />
           <Input label="Snap" name="snapchat" placeholder="@snap" value={profile.snapchat} onChange={e => handleChange(e, profile, setProfile)} />
           <Input label="LinkedIn" name="linkedin" placeholder="url" value={profile.linkedin} onChange={e => handleChange(e, profile, setProfile)} />
           <Input label="Email" name="email" value={profile.email} onChange={e => handleChange(e, profile, setProfile)} />
         </div>
      </WizardLayout>
    )
  }

  if (step === 'SOCIALS') {
    return (
      <WizardLayout title="Social Links" onNext={handleSocialsSubmit} onBack={() => setStep('PROFILE')} loading={loading} error={error} subtitle="Add whatever links you want">
        <p className="font-body text-base md:text-xl text-accent-yellow mb-5 glow-sm font-semibold">Create custom social connections, add unlimited links.</p>
        <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
          {customLinks.map((link, i) => (
            <div key={i} className="flex gap-2 items-center bg-white/[0.02] p-2 rounded-xl border border-white/5">
              <input type="text" placeholder="Platform (e.g. LinkedIn, Twitch)" value={link.title} onChange={e => {
                const newLinks = [...customLinks]
                newLinks[i].title = e.target.value
                setCustomLinks(newLinks)
              }} className="w-1/3 bg-white/[0.04] border border-white/10 px-3 py-2 rounded-lg text-sm focus:border-accent-yellow/40 outline-none" />
              <input type="url" placeholder="https://" value={link.url} onChange={e => {
                const newLinks = [...customLinks]
                newLinks[i].url = e.target.value
                setCustomLinks(newLinks)
              }} className="flex-1 bg-white/[0.04] border border-white/10 px-3 py-2 rounded-lg text-sm focus:border-accent-yellow/40 outline-none" />
              <button title="Remove" onClick={() => setCustomLinks(customLinks.filter((_, idx) => idx !== i))} className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">✕</button>
            </div>
          ))}
        </div>
        <button onClick={() => setCustomLinks([...customLinks, {title: '', url: ''}])} className="w-full py-4 glass border border-dashed border-white/20 hover:border-accent-yellow/40 hover:text-accent-yellow transition-colors rounded-xl font-mono text-[10px] tracking-widest uppercase">
          + Add New Link
        </button>
      </WizardLayout>
    )
  }

  if (step === 'PRIVACY') {
    const handleFunToggle = (mode) => {
      if (mode === 'ghost') {
        setPrivacy({ show_phone: false, show_email: false, show_instagram: false, show_snapchat: false, show_linkedin: false })
      } else if (mode === 'social') {
        setPrivacy({ show_phone: true, show_email: true, show_instagram: true, show_snapchat: true, show_linkedin: true })
      } else if (mode === 'vip') {
        setPrivacy({ show_phone: false, show_email: true, show_instagram: true, show_snapchat: false, show_linkedin: true })
      }
    }
    
    return (
      <WizardLayout title="Access Control" onNext={handlePrivacySubmit} onBack={() => setStep('PROFILE')} nextText="Unlock Archive" loading={loading} error={error} subtitle="Who gets to see your details?">
         
         <div className="grid grid-cols-3 gap-2 mb-6">
           <button onClick={()=>handleFunToggle('ghost')} className="glass py-4 px-2 rounded-xl flex flex-col items-center gap-2 hover:bg-white/5 transition border border-transparent hover:border-white/10">
             <span className="text-2xl">👻</span>
             <span className="font-mono text-[8px] uppercase tracking-widest text-muted">Ghost Mode</span>
           </button>
           <button onClick={()=>handleFunToggle('vip')} className="glass py-4 px-2 rounded-xl flex flex-col items-center gap-2 hover:bg-white/5 transition border border-transparent hover:border-accent-yellow/30 shadow-[0_0_15px_rgba(244,196,48,0.1)]">
             <span className="text-2xl">🕶️</span>
             <span className="font-mono text-[8px] uppercase tracking-widest text-accent-yellow text-center text-nowrap">VIP Status</span>
           </button>
           <button onClick={()=>handleFunToggle('social')} className="glass py-4 px-2 rounded-xl flex flex-col items-center gap-2 hover:bg-white/5 transition border border-transparent hover:border-white/10">
             <span className="text-2xl">🦋</span>
             <span className="font-mono text-[8px] uppercase tracking-widest text-muted whitespace-nowrap text-center">Social Butterfly</span>
           </button>
         </div>

         <div className="space-y-2 relative before:content-[''] before:absolute before:left-[-15px] before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
           <Toggle label="Show Phone Number" name="show_phone" checked={privacy.show_phone} onChange={e => handleChange(e, privacy, setPrivacy)} />
           <Toggle label="Show Instagram" name="show_instagram" checked={privacy.show_instagram} onChange={e => handleChange(e, privacy, setPrivacy)} />
           <Toggle label="Show Snapchat" name="show_snapchat" checked={privacy.show_snapchat} onChange={e => handleChange(e, privacy, setPrivacy)} />
           <Toggle label="Show Email" name="show_email" checked={privacy.show_email} onChange={e => handleChange(e, privacy, setPrivacy)} />
           <Toggle label="Show Custom Links" name="show_linkedin" checked={privacy.show_linkedin} onChange={e => handleChange(e, privacy, setPrivacy)} />
         </div>
      </WizardLayout>
    )
  }

  if (step === 'DONE') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[99998] flex items-center justify-center bg-[#111111] px-4">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        <h2 className="font-archive text-3xl md:text-5xl text-accent-yellow text-glow-sm animate-pulse">
          Opening Archive...
        </h2>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[99998] flex items-center justify-center"
      style={{ background: '#111111' }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse at 35% 50%, rgba(244,196,48,0.05) 0%, transparent 60%)',
            'radial-gradient(ellipse at 65% 50%, rgba(244,196,48,0.07) 0%, transparent 60%)',
          ],
        }}
        transition={{ duration: 7, repeat: Infinity, repeatType: 'mirror' }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <div className="relative z-10 w-full max-w-sm px-6">
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center mb-10"
        >
          <span className="font-mono text-[9px] tracking-[0.4em] text-accent-yellow/50 uppercase block mb-3">
            Private Archive
          </span>
          <h1 className="font-archive text-4xl text-accent-yellow text-glow-sm">
            Batch of 2026
          </h1>
          <div className="w-12 h-px bg-accent-yellow/30 mx-auto mt-4" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="glass border border-accent-yellow/10 rounded-sm p-8 space-y-5"
        >
          <div>
            <label className="font-mono text-[9px] tracking-[0.3em] text-muted uppercase block mb-2">Username</label>
            <input type="text" value={username} onChange={e => { setUsername(e.target.value); setError('') }} onKeyDown={handleKeyDown} placeholder="your username" autoFocus className="w-full bg-bg-primary border border-muted/20 focus:border-accent-yellow/50 text-text-primary font-body text-sm px-4 py-3 rounded-sm placeholder:text-muted/30 outline-none transition-all duration-300 focus:shadow-[0_0_0_1px_rgba(244,196,48,0.15)]" />
          </div>

          <div>
            <label className="font-mono text-[9px] tracking-[0.3em] text-muted uppercase block mb-2">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError('') }} onKeyDown={handleKeyDown} placeholder="••••••••" className="w-full bg-bg-primary border border-muted/20 focus:border-accent-yellow/50 text-text-primary font-body text-sm px-4 py-3 pr-10 rounded-sm placeholder:text-muted/30 outline-none transition-all duration-300 focus:shadow-[0_0_0_1px_rgba(244,196,48,0.15)]" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors text-xs font-mono">{showPass ? 'hide' : 'show'}</button>
            </div>
          </div>

          <AnimatePresence>
            {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-mono text-[10px] text-red-400/80 text-center">{error}</motion.p>}
          </AnimatePresence>

          <motion.button
            onClick={handleLogin} disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
            className={`w-full py-3.5 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300 ${loading ? 'bg-accent-yellow/30 text-accent-yellow cursor-wait' : 'bg-accent-yellow text-bg-primary hover:bg-soft-yellow'}`}
          >
            {loading ? <span className="flex items-center justify-center gap-2"><motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>···</motion.span></span> : 'Enter Archive →'}
          </motion.button>
          
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center font-mono text-[8px] text-muted/25 tracking-widest mt-6 uppercase">
          System operational · authorized personnel only
        </motion.p>
      </div>
    </motion.div>
  )
}

function WizardLayout({ title, subtitle, children, onNext, onBack, nextText, error, loading }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[99998] flex items-center justify-center bg-[#111111] px-4 md:px-12">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      
      {/* Left Back Arrow */}
      {onBack && (
        <button onClick={onBack} disabled={loading} className="hidden md:flex absolute left-4 lg:left-12 z-20 w-16 h-16 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all outline-none border border-white/10 text-white/50 hover:text-white">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-4xl bg-bg-surface border border-accent-yellow/10 rounded-2xl p-6 md:p-12 glass shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="font-archive text-4xl md:text-6xl text-accent-yellow mb-4 text-glow-sm">{title}</h2>
        {subtitle && <p className="font-body text-lg text-muted/90 mb-10 border-l-2 border-accent-yellow/40 pl-4">{subtitle}</p>}
        
        <div className="space-y-4 text-white text-lg">
          {children}
        </div>
        
        {error && <p className="font-mono text-[12px] text-red-400/90 mt-6 text-center p-3 bg-red-500/10 rounded-xl">{error}</p>}
        
        <div className="flex gap-4 mt-10">
          {onBack && (
            <button onClick={onBack} disabled={loading} className="md:hidden flex-1 py-4 bg-white/5 text-white font-mono text-[12px] tracking-widest uppercase rounded-xl hover:bg-white/10 transition-all active:scale-95">
              ← Back
            </button>
          )}
          <button onClick={onNext} disabled={loading} className="flex-[3] py-4 bg-gradient-to-r from-accent-yellow to-yellow-500 text-black font-bold font-mono text-[14px] tracking-widest uppercase rounded-xl hover:shadow-[0_0_20px_rgba(244,196,48,0.4)] disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95">
            {loading ? 'Processing...' : (nextText || 'Continue →')}
          </button>
        </div>
      </motion.div>

      {/* Right Next Arrow - Removed because the bottom absolute button serves as the primary "Continue" action */}
    </motion.div>
  )
}

function Input({ label, name, type = 'text', onChange, value, placeholder }) {
  return (
    <div className="mb-4">
      <label className="font-mono text-[9px] tracking-[0.3em] text-muted uppercase block mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-white/[0.03] border border-white/[0.07] focus:border-accent-yellow/40 focus:bg-white/[0.05] text-text-primary font-body text-sm px-4 py-3 rounded-xl placeholder:text-muted/20 outline-none transition-all" />
    </div>
  )
}

function Toggle({ label, checked, onChange, name }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] cursor-pointer hover:bg-white/[0.03] transition-colors">
      <span className="font-mono tracking-wider text-[10px] text-muted group-hover:text-white transition-colors">{label}</span>
      <div className={`w-10 h-5 rounded-full p-1 transition-colors ${checked ? 'bg-accent-yellow/80 shadow-[0_0_10px_rgba(244,196,48,0.4)]' : 'bg-white/10'}`}>
        <motion.div layout animate={{ x: checked ? 20 : 0 }} className={`w-3 h-3 rounded-full ${checked ? 'bg-bg-primary' : 'bg-muted/40'}`} />
      </div>
      <input type="checkbox" className="hidden" name={name} checked={checked} onChange={onChange} />
    </label>
  )
}