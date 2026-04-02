import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

const ASPECT_HEIGHTS = {
  tall:   'pb-[145%]',
  wide:   'pb-[62%]',
  square: 'pb-[100%]',
}

const BG_MAP = {
  '1st yr': 'from-yellow-900/20',
  '2nd yr': 'from-amber-800/15',
  '3rd yr': 'from-yellow-700/10',
  '4th yr': 'from-amber-600/12',
}

/* ── Lazy image or video that fades in once visible ── */
function LazyImage({ src, alt }) {
  const ref   = useRef(null)
  const isVideo = typeof src === 'string' && (src.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || src.toLowerCase().includes('video'))
  // Images load once and stay. Videos unload when out of view to save mobile RAM.
  const shown = useInView(ref, { once: !isVideo, margin: '300px' })
  const [ok, setOk] = useState(false)

  return (
    <div ref={ref} className="absolute inset-0 transition-colors bg-bg-secondary/10">
      {shown && (
        isVideo ? (
          <motion.video
            src={src}
            autoPlay muted loop playsInline
            onLoadedData={() => setOk(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: ok ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
          />
        ) : (
          <motion.img
            src={src} alt={alt}
            loading="lazy" decoding="async"
            onLoad={() => setOk(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: ok ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
          />
        )
      )}
    </div>
  )
}

/* ── Placeholder shown while real images are absent ── */
function Placeholder({ item }) {
  const from = BG_MAP[item.year] || 'from-bg-secondary'
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${from} via-bg-secondary to-bg-secondary`}>
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <span className="text-5xl select-none">📷</span>
      </div>
      <span className="absolute bottom-2 right-3 font-mono text-[8px] text-muted/30 tracking-wider">
        {item.year}
      </span>
    </div>
  )
}

/* ── Lightbox ── */
function Lightbox({ items, index, onClose, onPrev, onNext }) {
  const item = items[index]

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose, onPrev, onNext])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.97)' }}
      onClick={onClose}
    >
      {/* Controls */}
      <button onClick={e => { e.stopPropagation(); onPrev() }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center
                   text-muted hover:text-accent-yellow transition-colors font-mono text-xl z-10"
        aria-label="Previous">←</button>
      <button onClick={e => { e.stopPropagation(); onNext() }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center
                   text-muted hover:text-accent-yellow transition-colors font-mono text-xl z-10"
        aria-label="Next">→</button>
      <button onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 bg-black/40 hover:bg-black/80 rounded-full text-white/90 hover:text-accent-yellow transition-all font-mono text-2xl z-[400] flex items-center justify-center backdrop-blur-md border border-white/10"
        aria-label="Close">✕</button>
      <div className="absolute top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-widest text-muted/35">
        {index + 1} / {items.length}
      </div>

      {/* Media */}
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.93, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1,    filter: 'blur(0px)' }}
          exit={{   opacity: 0, scale: 1.04,  filter: 'blur(4px)' }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl w-full mx-14 md:mx-24"
          onClick={e => e.stopPropagation()}
        >
          {item.src
            ? (item.src?.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || item.src?.toLowerCase().includes('video'))
              ? <video src={item.src} autoPlay controls loop playsInline className="w-full object-contain max-h-[74vh] rounded-sm" />
              : <img src={item.src} alt={item.caption} className="w-full object-contain max-h-[74vh] rounded-sm" />
            : (
              <div className={`w-full ${ASPECT_HEIGHTS[item.aspect] || 'pb-[75%]'} relative bg-bg-secondary rounded-sm overflow-hidden`}>
                <Placeholder item={item} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-body text-sm text-muted/40 px-4 text-center">{item.caption}</p>
                </div>
              </div>
            )
          }
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="font-body text-sm text-text-primary/50">{item.caption}</p>
            <span className="flex-shrink-0 font-mono text-[9px] text-accent-yellow/50
                             border border-accent-yellow/15 px-2.5 py-1 rounded-full">
              {item.year}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Single masonry cell ── */
function GalleryItem({ item, index, onClick }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 9) * 0.04 }}
      className="masonry-item cursor-pointer group"
      onClick={() => onClick(index)}
    >
      <div className={`relative overflow-hidden bg-bg-secondary rounded-sm ${ASPECT_HEIGHTS[item.aspect] || 'pb-[75%]'}`}>
        {item.src ? <LazyImage src={item.src} alt={item.caption} /> : <Placeholder item={item} />}

        {/* Hover veil */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-400" />

        {/* Caption */}
        <div className="absolute inset-x-0 bottom-0 p-3
                        translate-y-2 opacity-0
                        group-hover:translate-y-0 group-hover:opacity-100
                        transition-all duration-300 ease-out">
          <p className="font-body text-xs text-white/85 leading-snug drop-shadow">{item.caption}</p>
        </div>

        {/* Expand icon */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white/60 text-[10px]">⊕</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main export ── */
export default function Gallery({ items }) {
  const [idx, setIdx] = useState(null)

  if (!items.length) return (
    <div className="text-center py-20">
      <p className="font-display text-xl italic text-muted/30">No items for this year.</p>
    </div>
  )

  return (
    <>
      <div className="masonry-grid">
        {items.map((item, i) => (
          <GalleryItem key={item.id} item={item} index={i} onClick={setIdx} />
        ))}
      </div>

      <AnimatePresence>
        {idx !== null && (
          <Lightbox
            items={items} index={idx}
            onClose={() => setIdx(null)}
            onPrev={() => setIdx(i => (i - 1 + items.length) % items.length)}
            onNext={() => setIdx(i => (i + 1) % items.length)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
