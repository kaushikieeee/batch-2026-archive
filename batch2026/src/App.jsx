import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Splash from './components/Splash'
import LoginScreen from './components/LoginScreen'
import MusicPlayer from './components/MusicPlayer'
import Home from './pages/Home'
import Journey from './pages/Journey'
import Yearbook from './pages/Yearbook'
import Vault from './pages/Vault'
import Wall from './pages/Wall'
import NotFound from './pages/NotFound'

// ── Custom cursor — auto-disabled on touch devices ────────
function Cursor() {
  const cursorRef = useRef(null)
  const glowRef = useRef(null)
  const pos = useRef({ x: -999, y: -999 })
  const glowPos = useRef({ x: -999, y: -999 })
  const raf = useRef(null)
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

  useEffect(() => {
    if (isMobile) return
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
    }
    const animate = () => {
      glowPos.current.x += (pos.current.x - glowPos.current.x) * 0.07
      glowPos.current.y += (pos.current.y - glowPos.current.y) * 0.07
      if (glowRef.current) {
        glowRef.current.style.left = Math.round(glowPos.current.x) + 'px'
        glowRef.current.style.top = Math.round(glowPos.current.y) + 'px'
      }
      raf.current = requestAnimationFrame(animate)
    }
    window.addEventListener('mousemove', move, { passive: true })
    raf.current = requestAnimationFrame(animate)
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf.current) }
  }, [isMobile])

  if (isMobile) return null
  return (
    <>
      <div id="cursor" ref={cursorRef} />
      <div id="cursor-glow" ref={glowRef} />
    </>
  )
}

// ── Page transitions ──────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' },
  enter: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.28 } },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/yearbook" element={<Yearbook />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/wall" element={<Wall />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Footer ────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-accent-yellow/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-display text-lg italic text-accent-yellow/40">Batch 2024–26</span>
          <p className="font-mono text-[8px] text-muted/25 mt-1 tracking-widest uppercase">Memory Archive · Localhost Edition</p>
        </div>
        <p className="font-body text-xs text-muted/20 text-center">Built with love, late nights, and React.</p>
        <div className="font-mono text-[9px] text-muted/20 tracking-widest">2026</div>
      </div>
    </footer>
  )
}

// ── Root App ──────────────────────────────────────────────
export default function App() {
  const [appPhase, setAppPhase] = useState('splash') // splash | login | app
  const [user, setUser] = useState(null)

  return (
    <BrowserRouter>
      {/* Atmosphere */}
      <div id="grain" aria-hidden="true" />
      <div id="vignette" aria-hidden="true" />
      <Cursor />

      {/* Splash screen */}
      <AnimatePresence>
        {appPhase === 'splash' && (
          <Splash key="splash" onEnter={() => setAppPhase('login')} />
        )}
      </AnimatePresence>

      {/* Login */}
      <AnimatePresence>
        {appPhase === 'login' && (
          <LoginScreen key="login" onLogin={(u) => { setUser(u); setAppPhase('app') }} />
        )}
      </AnimatePresence>

      {/* Main app */}
      <AnimatePresence>
        {appPhase === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="min-h-screen flex flex-col bg-bg-primary"
          >
            <Navbar user={user} />
            <div className="flex-1">
              <AnimatedRoutes />
            </div>
            <Footer />
            {/* Floating music player */}
            <MusicPlayer />
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserRouter>
  )
}
