import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Splash from './components/Splash'
import LoginScreen from './components/LoginScreen'
import MusicPlayer from './components/MusicPlayer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Journey from './pages/Journey'
import Yearbook from './pages/Yearbook'
import Vault from './pages/Vault'
import Wall from './pages/Wall'
import Admin from './pages/Admin'
import MyProfile from './pages/MyProfile'
import Slambook from './pages/Slambook'
import NotFound from './pages/NotFound'

/* ── Page transitions ── */
const pv = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  enter:   { opacity: 1, y:  0, filter: 'blur(0px)', transition: { duration: 0.32, ease: [0.22,1,0.36,1] } },
  exit:    { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.18 } },
}

function AnimatedRoutes({ user, refreshKey }) {
  const loc = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={loc.pathname + "-" + refreshKey} variants={pv} initial="initial" animate="enter" exit="exit" className="relative">
        <Routes location={loc}>
          <Route path="/"         element={<Home user={user} />}     />
          <Route path="/journey"  element={<Journey user={user} />}  />
          <Route path="/yearbook" element={<Yearbook user={user} />} />
          <Route path="/slambook" element={<Slambook user={user} />} />
          <Route path="/vault"    element={<Vault user={user} />}    />
          <Route path="/wall"     element={<Wall user={user} />}     />
          <Route path="/admin"    element={<Admin user={user} />} />
          <Route path="/profile"  element={<MyProfile user={user} />} />
          <Route path="*"         element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-8 px-5 md:block hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <span className="font-archive text-base text-accent-yellow/35">TheArchive</span>
        <p className="font-body text-xs text-muted/20 text-center">Built with love, late nights, and React.</p>
        <span className="font-mono text-[9px] text-muted/18 tracking-widest">2026</span>
      </div>
    </footer>
  )
}

function MainApp() {
  const [phase, setPhase] = useState('splash')
  const [user,  setUser]  = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const navigate = useNavigate()

  /* Lenis smooth scroll */
  useEffect(() => {
    const noMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0
    if (noMotion || isTouch) return
    const lenis = new Lenis({ duration:1.1, smoothWheel:true, wheelMultiplier:0.9 })
    let id
    const raf = t => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy() }
  }, [])

  return (
    <>
      <div id="grain" aria-hidden="true" />
      <div id="vignette" aria-hidden="true" />

      <AnimatePresence>
        {phase === 'splash' && <Splash key="splash" onEnter={() => setPhase('login')} />}
      </AnimatePresence>
      <AnimatePresence>
        {phase === 'login' && <LoginScreen key="login" onLogin={u => { 
          console.log("App receives onLogin callback", u)
          try {
            setUser(u); 
            setPhase('app');
            console.log("Navigating to /")
            navigate('/', { replace: true });
          } catch(err) {
            console.error("Crash during login transition", err);
          }
        }} />}
      </AnimatePresence>
      <AnimatePresence>
        {phase === 'app' && (
          <motion.div key="app" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6 }}
            className="relative min-h-screen flex flex-col bg-bg-primary">
            <Toaster position="top-center" toastOptions={{ style: { background: '#1c1c1c', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.05em' }, success: { iconTheme: { primary: '#facc15', secondary: '#1c1c1c' } } }} />
            <Navbar user={user} onRefresh={() => setRefreshKey(k => k + 1)} />
            <div className="flex-1">
              <AnimatedRoutes user={user} refreshKey={refreshKey} />
            </div>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Root ── */
export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition:true, v7_relativeSplatPath:true }}>
      <ScrollToTop />
      <MainApp />
    </BrowserRouter>
  )
}
