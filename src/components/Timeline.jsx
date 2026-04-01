import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

function ParallaxImage({ src, caption }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20])

  return (
    <div ref={ref} className="relative overflow-hidden rounded-sm aspect-video bg-bg-primary mt-5">
      <motion.div style={{ y }} className="absolute inset-0">
        {src ? (
          <img src={src} alt={caption} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-end justify-end p-3 bg-gradient-to-br from-bg-secondary to-bg-primary">
            <span className="font-mono text-[8px] text-muted/20 tracking-wider">{caption}</span>
          </div>
        )}
      </motion.div>
      {caption && src && (
        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
          <p className="font-mono text-[8px] text-white/50 tracking-wider">{caption}</p>
        </div>
      )}
    </div>
  )
}

function TimelineEntry({ item, index }) {
  const isEven = index % 2 === 0

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -50px 0px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
      }}
      className="relative grid grid-cols-[auto_1fr] md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-0 items-start mb-14 md:mb-24"
    >
      {/* Left panel */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
        }}
        className={`hidden md:block pr-6 md:pr-14 ${isEven ? 'block' : 'opacity-0 pointer-events-none'}`}
      >
        {isEven && <TimelineCard item={item} align="right" />}
      </motion.div>

      {/* Center spine */}
      <div className="flex flex-col items-center pt-1.5 px-1 md:px-2 md:col-start-2">
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
          }}
          className="relative"
        >
          <motion.div
            animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-accent-yellow/40"
          />
          <motion.div
            animate={{ scale: [1, 3], opacity: [0.25, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.35 }}
            className="absolute inset-0 rounded-full bg-accent-yellow/20"
          />
          <div className="relative w-4 h-4 rounded-full bg-accent-yellow shadow-[0_0_16px_rgba(244,196,48,0.9)] z-10" />
        </motion.div>
      </div>

      {/* Mobile panel */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
        }}
        className="md:hidden"
      >
        <TimelineCard item={item} align="left" />
      </motion.div>

      {/* Right panel */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: 30 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
        }}
        className={`hidden md:block md:col-start-3 pl-6 md:pl-14 ${!isEven ? 'block' : 'opacity-0 pointer-events-none'}`}
      >
        {!isEven && <TimelineCard item={item} align="left" />}
      </motion.div>
    </motion.div>
  )
}

function TimelineCard({ item, align }) {
  return (
    <div className={`glass border border-accent-yellow/8 hover:border-accent-yellow/20 transition-colors duration-150 rounded-sm p-5 md:p-8 hover-glow ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {/* Tag */}
      <span className="font-mono text-[9px] tracking-[0.35em] text-accent-yellow/50 uppercase">
        {item.tag}
      </span>

      {/* Year */}
      <p className={`font-mono text-[9px] tracking-widest text-muted/40 mt-0.5 mb-3`}>
        {item.year}
      </p>

      {/* Title */}
      <h3 className="font-display text-3xl md:text-4xl text-accent-yellow  mb-4 leading-tight">
        {item.title}
      </h3>

      {/* Body */}
      <p className="font-body text-sm text-muted leading-relaxed">
        {item.body}
      </p>

      {/* Optional image placeholder */}
      {item.image !== undefined && (
        <ParallaxImage src={item.image || null} caption={item.imageCaption || item.year} />
      )}
    </div>
  )
}

export default function Timeline({ items }) {
  return (
    <section className="relative max-w-6xl mx-auto px-4 md:px-6 py-10">

      {/* Vertical line */}
      <div className="absolute left-[10px] md:left-1/2 top-0 bottom-16 w-px md:-translate-x-1/2 timeline-line opacity-25" />

      {items.map((item, i) => (
        <TimelineEntry key={item.year} item={item} index={i} />
      ))}

      {/* End marker */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="w-6 h-6 rounded-full border-2 border-accent-yellow/50 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent-yellow" />
        </div>
        <span className="font-display text-sm  text-muted/40">The story continues…</span>
      </motion.div>
    </section>
  )
}
