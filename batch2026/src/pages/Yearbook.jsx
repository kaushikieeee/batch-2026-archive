import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import YearbookCard from '../components/YearbookCard'
import ProfileUploadModal from '../components/ProfileUploadModal'
import { YearbookSkeleton } from '../components/Skeleton'
import { mockStudents } from '../lib/mockData'

const sections = ['All', 'CSE-A', 'CSE-B', 'CSE-C']

export default function Yearbook() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [students, setStudents] = useState(mockStudents)
  const [loading] = useState(false) // set true when fetching from Supabase

  const filtered = students.filter(s => {
    const matchSection = filter === 'All' || s.section === filter
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    return matchSection && matchSearch
  })

  const handleNewProfile = (newStudent) => {
    setStudents(prev => [newStudent, ...prev])
  }

  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9 }}
          >
            <span className="font-mono text-[10px] tracking-[0.4em] text-accent-yellow/60 uppercase">Class of 2026</span>
            <h1 className="font-display text-6xl md:text-7xl text-accent-yellow text-glow mt-3 mb-5 italic">Alumni Book</h1>
            <div className="line-yellow max-w-xs mx-auto mb-6" />
            <p className="font-body text-sm text-muted">
              {students.length} faces. Countless memories.
              <span className="block mt-1 text-muted/40">Click any card to view full profile · leave a message.</span>
            </p>
          </motion.div>
        </div>

        {/* Controls row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-10"
        >
          {/* Section pills */}
          <div className="flex gap-2 flex-wrap justify-center">
            {sections.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`relative font-mono text-[10px] tracking-widest px-4 py-2 transition-all duration-300 rounded-full ${
                  filter === s ? 'text-bg-primary' : 'text-muted hover:text-text-primary border border-muted/15 hover:border-accent-yellow/20'
                }`}
              >
                {filter === s && (
                  <motion.div
                    layoutId="year-pill"
                    className="absolute inset-0 bg-accent-yellow rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{s}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-bg-secondary border border-muted/12 focus:border-accent-yellow/35 text-text-primary font-body text-sm px-4 py-2 rounded-sm placeholder:text-muted/25 focus:outline-none w-40 sm:w-48 transition-colors"
            />

            {/* Add profile button */}
            <motion.button
              onClick={() => setShowUpload(true)}
              whileHover={{ scale: 1.04, boxShadow: '0 0 16px rgba(244,196,48,0.2)' }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 bg-accent-yellow text-bg-primary font-mono text-[10px] tracking-widest px-4 py-2.5 uppercase hover:bg-soft-yellow transition-colors flex-shrink-0"
            >
              <span>+</span>
              <span className="hidden sm:inline">Add Profile</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <YearbookSkeleton />
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            <AnimatePresence>
              {filtered.map((student, i) => (
                <motion.div
                  key={student.id}
                  layout
                  initial={{ opacity: 0, scale: 0.88, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: i * 0.03 }}
                >
                  <YearbookCard student={student} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl italic text-muted/30">No results found.</p>
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="font-mono text-[8px] text-muted/20 tracking-widest uppercase">
            Connect Supabase · students table · Supabase Storage for photos
          </p>
        </div>
      </div>

      {/* Profile Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <ProfileUploadModal
            onClose={() => setShowUpload(false)}
            onSubmit={handleNewProfile}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
