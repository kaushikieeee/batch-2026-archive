import { motion } from 'framer-motion'

const TAPE_COLORS = [
  'rgba(244,196,48,0.7)',
  'rgba(244,196,48,0.5)',
  'rgba(255,217,90,0.6)',
]

const NOTE_COLORS = [
  '#f5f0e8',
  '#f0ede0',
  '#ede8d5',
  '#f2eed8',
]

export default function MessageCard({ message, index }) {
  const rotation = message.rotation ?? ((index % 3 === 0 ? -1 : 1) * (1 + (index % 3)))
  const noteColor = NOTE_COLORS[index % NOTE_COLORS.length]
  const tapeColor = TAPE_COLORS[index % TAPE_COLORS.length]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotation * 2 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ duration: 0.5, delay: index * 0.06, type: 'spring', stiffness: 120 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10, transition: { duration: 0.2 } }}
      className="relative cursor-default"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Tape */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-5 z-10"
        style={{ background: tapeColor, borderRadius: '1px' }}
      />

      {/* Sticky note */}
      <div
        className="sticky-note rounded-sm p-5 pt-6 min-h-[130px] w-full shadow-xl"
        style={{ background: noteColor }}
      >
        {/* Message text */}
        <p
          className="text-sm leading-relaxed text-gray-700"
          style={{ fontFamily: '"Caveat", "Segoe Print", cursive, sans-serif', fontSize: '15px', lineHeight: '1.5' }}
        >
          {message.message}
        </p>

        {/* Name */}
        {message.name && (
          <div className="mt-3 pt-2 border-t border-gray-200/60">
            <span
              className="text-xs text-gray-500 italic"
              style={{ fontFamily: '"Caveat", cursive, sans-serif' }}
            >
              — {message.name}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
