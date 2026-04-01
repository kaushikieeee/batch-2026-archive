import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GODMODE_USERNAME, loginUser } from '../lib/supabase'

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.')
      return
    }
    setError('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 700))

    const { user, error: err } = await loginUser(username.trim(), password.trim())
    if (err || !user) {
      setError('Invalid username or password.')
      setLoading(false)
      return
    }
    onLogin(user)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
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
      {/* Background glow */}
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

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Header */}
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

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="glass border border-accent-yellow/10 rounded-sm p-8 space-y-5"
        >
          {/* Username */}
          <div>
            <label className="font-mono text-[9px] tracking-[0.3em] text-muted uppercase block mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="your username"
              autoFocus
              className="w-full bg-bg-primary border border-muted/20 focus:border-accent-yellow/50 text-text-primary font-body text-sm px-4 py-3 rounded-sm placeholder:text-muted/30 outline-none transition-all duration-300 focus:shadow-[0_0_0_1px_rgba(244,196,48,0.15)]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="font-mono text-[9px] tracking-[0.3em] text-muted uppercase block mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                className="w-full bg-bg-primary border border-muted/20 focus:border-accent-yellow/50 text-text-primary font-body text-sm px-4 py-3 pr-10 rounded-sm placeholder:text-muted/30 outline-none transition-all duration-300 focus:shadow-[0_0_0_1px_rgba(244,196,48,0.15)]"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors text-xs font-mono"
              >
                {showPass ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[10px] text-red-400/80 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            onClick={handleLogin}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-3.5 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300 ${
              loading
                ? 'bg-accent-yellow/30 text-accent-yellow cursor-wait'
                : 'bg-accent-yellow text-bg-primary hover:bg-soft-yellow'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ···
                </motion.span>
              </span>
            ) : 'Enter Archive →'}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-muted/10" />
            <span className="font-mono text-[9px] text-muted/30">or</span>
            <div className="flex-1 h-px bg-muted/10" />
          </div>

          {/* Guest */}
          <button
            onClick={() => onLogin({ id: 0, username: 'guest' })}
            className="w-full py-3 font-mono text-[10px] tracking-widest text-muted/50 hover:text-muted transition-colors duration-300 uppercase border border-muted/10 hover:border-muted/20"
          >
            Continue as Guest
          </button>
        </motion.div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center font-mono text-[8px] text-muted/25 tracking-widest mt-6 uppercase"
        >
          Supabase connected · godmode user: {GODMODE_USERNAME}
        </motion.p>
      </div>
    </motion.div>
  )
}
