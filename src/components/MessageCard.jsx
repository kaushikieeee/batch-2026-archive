import { motion } from 'framer-motion'

const TAPE  = ['rgba(244,196,48,0.7)', 'rgba(244,196,48,0.5)', 'rgba(255,217,90,0.6)']
const NOTES = ['#f5f0e8', '#f0ede0', '#ede8d5', '#f2eed8']

// Standalone card used on the Home page preview or elsewhere.
// The Wall page uses its own inline WallNote component.
export default function MessageCard({ message, index }) {
  const rot   = message.rotation ?? ((index % 3 === 0 ? -1 : 1) * (1 + index % 3))
  const color = NOTES[index % NOTES.length]
  const tape  = TAPE[index % TAPE.length]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rot * 2 }}
      animate={{ opacity: 1, scale: 1,   rotate: rot      }}
      transition={{ duration: 0.5, delay: index * 0.06, type: 'spring', stiffness: 120 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10, transition: { duration: 0.18 } }}
      className="relative cursor-default"
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-5 z-10"
           style={{ background: tape, borderRadius: '1px' }} />
      <div className="sticky-note rounded-sm p-5 pt-6 min-h-[130px]" style={{ background: color }}>
        <p className="font-handwritten text-[15px] leading-relaxed text-gray-700">
          {message.message}
        </p>
        {message.name && (
          <div className="mt-3 pt-2 border-t border-gray-200/60">
            <span className="font-handwritten text-xs text-gray-500">— {message.name}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
