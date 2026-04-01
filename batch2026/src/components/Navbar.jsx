import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Journey', path: '/journey' },
  { label: 'Alumni Book', path: '/yearbook' },
  { label: 'Media Vault', path: '/vault' },
  { label: 'The Wall', path: '/wall' },
]

export default function Navbar({ user }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0, filter: 'blur(8px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'backdrop-blur-md bg-bg-primary/80 border-b border-accent-yellow/8 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group">
            <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col leading-none">
              <span className="font-display text-xl text-accent-yellow text-glow-sm tracking-wide italic">Batch 2026</span>
              <span className="font-mono text-[8px] text-muted/60 tracking-[0.3em] uppercase mt-0.5">Memory Archive</span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link key={link.path} to={link.path} className="relative group">
                  <span className={`font-body text-sm tracking-wide transition-colors duration-300 ${
                    isActive ? 'text-accent-yellow' : 'text-muted hover:text-text-primary'
                  }`}>
                    {link.label}
                  </span>
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-px bg-accent-yellow"
                    initial={false}
                    animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                    whileHover={{ scaleX: 1, opacity: 0.4 }}
                    transition={{ duration: 0.25 }}
                    style={{ transformOrigin: 'left' }}
                  />
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {user && user.id !== 0 && (
              <span className="font-mono text-[9px] text-muted/40 tracking-widest">
                @{user.username}
              </span>
            )}
            {user && user.id === 0 && (
              <span className="font-mono text-[9px] text-muted/30 tracking-widest">Guest</span>
            )}
            <span className="font-mono text-[9px] text-accent-yellow/50 tracking-[0.25em] border border-accent-yellow/15 px-3 py-1 rounded-full">
              2024 – 26
            </span>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} className="block w-6 h-px bg-accent-yellow" />
            <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className="block w-6 h-px bg-accent-yellow" />
            <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} className="block w-6 h-px bg-accent-yellow" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 backdrop-blur-md bg-bg-primary/90 border-b border-accent-yellow/8 py-6 px-8 md:hidden"
          >
            <div className="flex flex-col gap-5">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    to={link.path}
                    className={`font-display text-2xl italic ${
                      location.pathname === link.path ? 'text-accent-yellow' : 'text-text-primary/70'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
