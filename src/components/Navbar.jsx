import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { isGodmodeUser } from '../lib/supabase'

const NAV = [
  { label: 'Journey',     path: '/journey',  icon: '◎' },
  { label: 'Alumni',      path: '/yearbook', icon: '✦' },
  { label: 'Vault',       path: '/vault',    icon: '⊞' },
  { label: 'Slambook',    path: '/slambook', icon: '✉' },
  { label: 'My Profile',  path: '/profile',  icon: '👤' },
]

const ADMIN_NAV = { label: 'Admin', path: '/admin', icon: '⚑' }

// Mobile bottom nav (4 tabs)
function MobileNav({ location, links }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden mobile-nav safe-area-pb">
      <div className="flex items-center justify-around px-2 py-3">
        {links.map(link => {
          const active = location.pathname === link.path
          return (
            <Link key={link.path} to={link.path}
              className="flex flex-col items-center gap-1 min-w-[60px] py-1">
              <motion.div
                animate={{ scale: active ? 1.15 : 1 }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base transition-colors ${
                  active ? 'bg-accent-yellow text-bg-primary' : 'text-muted'
                }`}>
                {link.icon}
              </motion.div>
              <span className={`font-mono text-[8px] tracking-wider transition-colors ${
                active ? 'text-accent-yellow' : 'text-muted/50'
              }`}>{link.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function Navbar({ user }) {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isAdmin = isGodmodeUser(user)
  const links = isAdmin ? [...NAV, ADMIN_NAV] : NAV

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      {/* ── Desktop floating pill ── */}
      <motion.div
        initial={{ y: -80, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.4, 0.64, 1] }}
        className="fixed top-5 inset-x-0 z-50 hidden md:flex justify-center"
      >
        <div className={`navbar-pill ${scrolled ? 'navbar-pill-scrolled' : ''} 
                         transition-all duration-500 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 py-2`}>

          {/* Left: Logo */}
          <div className="flex justify-start">
            <Link to="/" className="flex items-center gap-2 px-3 py-1.5 rounded-full
              hover:bg-white/[0.04] transition-colors">
              <div className="w-5 h-5 rounded-full bg-accent-yellow flex items-center justify-center flex-shrink-0">
                <span className="text-bg-primary text-[9px] font-bold font-mono">A</span>
              </div>
              <span className="font-archive text-[13px] text-accent-yellow text-glow-sm whitespace-nowrap">TheArchive</span>
            </Link>
          </div>

          {/* Center: Nav links */}
          <div className="flex items-center gap-1 justify-center">
            <div className="w-px h-4 bg-white/[0.08] mx-1" />
            {links.map(link => {
              const active = location.pathname === link.path
              return (
                <Link key={link.path} to={link.path}
                  className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                             font-body text-[12px] transition-all duration-200 whitespace-nowrap"
                  style={{ color: active ? '#111112' : '#777780' }}>
                  {active && (
                    <motion.div layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-accent-yellow"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                  <span className="relative z-10 transition-colors duration-200
                    hover:text-text-primary" style={{ color: active ? '#111112' : '' }}>
                    {link.label}
                  </span>
                </Link>
              )
            })}
            <div className="w-px h-4 bg-white/[0.08] mx-1" />
          </div>

          {/* Right: User / year */}
          <div className="flex justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-accent-yellow/10 border border-accent-yellow/20
                              flex items-center justify-center">
                <span className="text-accent-yellow font-mono text-[8px]">
                  {user?.id !== 0 ? user?.username?.[0]?.toUpperCase() : '?'}
                </span>
              </div>
              <span className="font-mono text-[9px] text-muted/50 tracking-wider">
                {user?.id !== 0 ? `@${user?.username}` : 'guest'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Mobile top bar (logo only) ── */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 md:hidden
                   flex items-center justify-between px-5 py-4
                   backdrop-blur-2xl bg-bg-primary/80 border-b border-white/[0.05]">
        <Link to="/">
          <span className="font-archive text-xl text-accent-yellow text-glow-sm">TheArchive</span>
        </Link>
        <div className="badge">2024–26</div>
      </motion.div>

      {/* ── Mobile bottom nav ── */}
      <MobileNav location={location} links={links} />
    </>
  )
}
