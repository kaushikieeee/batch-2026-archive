import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

const ASPECT_HEIGHTS = {
  tall: 'pb-[145%]',
  wide: 'pb-[62%]',
  square: 'pb-[100%]',
}

const YEAR_GRADIENTS = {
  '1st yr': 'from-yellow-900/20 via-bg-secondary to-bg-secondary',
  '2nd yr': 'from-amber-800/15 via-bg-secondary to-bg-secondary',
  '3rd yr': 'from-yellow-700/12 via-bg-secondary to-bg-secondary',
  '4th yr': 'from-amber-600/15 via-bg-secondary to-bg-secondary',
}

function LazyImage({ src, alt, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '100px' })
  const [loaded, setLoaded] = useState(false)

  return (
    <div ref={ref} className={`absolute inset-0 ${className}`}>
      {inView && src && (
        <motion.img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      )}
    </div>
  )
}

function MediaPlaceholder({ item }) {
  const gradient = YEAR_GRADIENTS[item.year] || 'from-bg-secondary to-bg-primary'
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col items-end justify-end p-3`}>
      <span className="font-mono text-[8px] text-muted/30 tracking-widest">{item.year}</span>
    </div>
  )
}

function Lightbox({ items, index, onClose, onPrev, onNext }) {
  const item = items[index]
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.96)' }}
      onClick={onClose}
    >
      {/* Nav buttons */}
      <button
        onClick={e => { e.stopPropagation(); onPrev() }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted hover:text-accent-yellow transition-colors font-mono text-xl z-10"
        aria-label="Previous"
      >←</button>
      <button
        onClick={e => { e.stopPropagation(); onNext() }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted hover:text-accent-yellow transition-colors font-mono text-xl z-10"
        aria-label="Next"
      >→</button>
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-muted hover:text-accent-yellow transition-colors font-mono text-lg z-10"
        aria-label="Close"
      >✕</button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-widest text-muted/40">
        {index + 1} / {items.length}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(4px)' }}
          transition={{ duration: 0.35 }}
          className="max-w-3xl w-full mx-16 md:mx-24"
          onClick={e => e.stopPropagation()}
        >
          {item.src ? (
            <img src={item.src} alt={item.caption} className="w-full object-contain max-h-[72vh] rounded-sm" />
          ) : (
            <div className={`w-full ${ASPECT_HEIGHTS[item.aspect] || 'pb-[75%]'} relative bg-bg-secondary rounded-sm overflow-hidden`}>
              <MediaPlaceholder item={item} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl opacity-10 mb-4">📷</div>
                  <p className="font-body text-sm text-muted/50">{item.caption}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="font-body text-sm text-text-primary/60">{item.caption}</p>
            <span className="font-mono text-[9px] text-accent-yellow/50 border border-accent-yellow/15 px-2.5 py-1 rounded-full">
              {item.year}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// Need useEffect in Lightbox
import { useEffect } from 'react'

function GalleryItem({ item, index, onClick }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 9) * 0.05 }}
      className="masonry-item cursor-pointer group"
      onClick={() => onClick(index)}
    >
      <div className={`relative overflow-hidden bg-bg-secondary rounded-sm ${ASPECT_HEIGHTS[item.aspect] || 'pb-[75%]'}`}>
        {/* Image or placeholder */}
        {item.src ? (
          <LazyImage src={item.src} alt={item.caption} className="group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <MediaPlaceholder item={item} />
        )}

        {/* Hover dark overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-400" />

        {/* Caption on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-350">
          <p className="font-body text-xs text-white/90 leading-snug">{item.caption}</p>
        </div>

        {/* Zoom icon on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
            <span className="text-white/70 text-xs">⊕</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Gallery({ items }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const prev = () => setLightboxIndex(i => (i - 1 + items.length) % items.length)
  const next = () => setLightboxIndex(i => (i + 1) % items.length)

  return (
    <>
      <div className="masonry-grid">
        {items.map((item, i) => (
          <GalleryItem key={item.id} item={item} index={i} onClick={setLightboxIndex} />
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={items}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </>
  )
}
