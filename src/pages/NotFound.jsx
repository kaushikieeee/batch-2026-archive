import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 text-center pt-20 md:pt-0">
      <motion.div initial={{ opacity:0, y:24, filter:'blur(10px)' }}
                  animate={{ opacity:1, y:0, filter:'blur(0px)'   }}
                  transition={{ duration:0.8 }}>
        <div className="font-archive text-[clamp(6rem,20vw,14rem)] text-accent-yellow/8 leading-none select-none">404</div>
        <div className="-mt-4 mb-8">
          <h1 className="font-archive text-3xl md:text-4xl text-text-primary/50 mb-3">This memory doesn't exist.</h1>
          <p className="font-body text-sm text-muted/40 max-w-xs mx-auto">
            The page you're looking for has been moved, deleted, or never existed in this archive.
          </p>
        </div>
        <Link to="/">
          <motion.button whileHover={{ scale:1.04, boxShadow:'0 0 24px rgba(244,196,48,0.25)' }}
                         whileTap={{ scale:0.97 }}
            className="px-10 py-3.5 bg-accent-yellow text-bg-primary font-mono text-xs
                       tracking-[0.3em] uppercase hover:bg-soft-yellow transition-colors rounded-sm">
            Go Home →
          </motion.button>
        </Link>
      </motion.div>
      <p className="absolute bottom-10 font-mono text-[8px] text-muted/18 tracking-widest uppercase">
        TheArchive · 2024–26
      </p>
    </main>
  )
}
