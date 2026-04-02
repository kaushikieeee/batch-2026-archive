import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import YearbookCard from '../components/YearbookCard'
import ProfileUploadModal from '../components/ProfileUploadModal'
import { YearbookCardSkeleton } from '../components/Skeleton'
import ScrollReveal, { StaggerReveal, StaggerChild } from '../components/ScrollReveal'
import { getStudents, postStudent, uploadFile, updateUserProfile, deleteUserProfileData } from '../lib/supabase'

const SECTIONS = ['All', 'CSE-A', 'CSE-B', 'CSE-C']

export default function Yearbook({ user }) {
  const [filter,     setFilter]     = useState('All')
  const [search,     setSearch]     = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [editMode,   setEditMode]   = useState(false)
  const [editProfileData, setEditProfileData] = useState(null)
  const [students,   setStudents]   = useState([])
  const [loading,    setLoading]    = useState(true)

  const loadStudents = async () => {
    setLoading(true)
    const { data } = await getStudents()
    if (data) setStudents(data)
    setLoading(false)
  }

  useEffect(() => { loadStudents() }, [])

  const openEditProfile = () => {
     if (!user) return toast.error("Please login to edit your profile.")
     const myProfile = students.find(s => s.id === user.id) || user
     setEditProfileData(myProfile)
     setEditMode(true)
     setShowUpload(true)
  }

  const handleProfileDelete = async () => {
    if (!user) return
    const tid = toast.loading('Deleting your profile...')
    try {
      const { error } = await deleteUserProfileData(user.id)
      if (error) throw error
      toast.success('Profile wiped successfully', { id: tid })
      setShowUpload(false)
      setEditMode(false)
      setEditProfileData(null)
      await loadStudents()
    } catch (err) {
      toast.error('Failed to wipe profile: ' + err.message, { id: tid })
    }
  }

  const handleProfileSubmit = async (profileData) => {
    const tid = toast.loading('Uploading profile...')
    let imageUrl = editMode && editProfileData ? editProfileData.image : null

    // If they explicitly removed the photo in edit mode
    if (editMode && !profileData.imageFile && !profileData.imagePreview) {
      imageUrl = null;
    }

    if (profileData.imageFile) {
      toast.loading('Uploading photo to batchof2026 bucket...', { id: tid })
      const { data, error } = await uploadFile(profileData.imageFile, 'batchof2026')
      if (error) {
        toast.error('Failed to upload image: ' + error.message, { id: tid })
        throw error
      }
      imageUrl = data.publicUrl
    } else if (!imageUrl && !editMode) {
      imageUrl = 'https://api.dicebear.com/7.x/notionists/svg?seed=' + encodeURIComponent(profileData.name)
    }

    toast.loading('Saving profile data...', { id: tid })
    
    // We update the user record directly
    const studentData = {
      name: profileData.name,
      section: profileData.section,
      role: profileData.role,
      quote: profileData.quote,
      bio: profileData.bio,
      time_capsule: profileData.time_capsule || null,
      signature_url: profileData.signature_url || null,
      phone: profileData.phone || null,
      instagram: profileData.instagram || null,
      snapchat: profileData.snapchat || null,
      linkedin: profileData.linkedin || null,
      email: profileData.email || null,
      image: imageUrl,
      accent_color: profileData.accentColor,
      badge: profileData.badge
    }

    if (editMode) {
      const { error } = await updateUserProfile(user.id, studentData)
      if (error) {
        toast.error('Failed to update profile: ' + error.message, { id: tid })
        throw error
      }
      toast.success('Profile updated!', { id: tid })
    } else {
      const { error } = await postStudent(studentData) // For admins creating someone or fallback.
      if (error) {
        toast.error('Failed to create profile: ' + error.message, { id: tid })
        throw error
      }
      toast.success('Profile added to Yearbook!', { id: tid })
    }

    setShowUpload(false)
    setEditMode(false)
    setEditProfileData(null)
    await loadStudents()
  }

  const filtered = useMemo(() => {
    return students.filter(s =>
      (filter === 'All' || s.section === filter) &&
      (
        (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.section || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.role || '').toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [students, filter, search])

  return (
    <main className="min-h-screen pt-20 md:pt-28 pb-28 md:pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Header */}
        <ScrollReveal direction="up" className="text-center mb-10 md:mb-14">
          <span className="font-mono text-[10px] tracking-[0.4em] text-accent-yellow/55 uppercase">Class of 2026</span>
          <h1 className="font-archive text-5xl md:text-7xl text-accent-yellow text-glow mt-3 mb-4">Alumni Book</h1>
          <div className="line-yellow max-w-xs mx-auto mb-5" />
          <p className="font-body text-sm text-muted/70">
            {students.length} faces · Countless memories
            <span className="block mt-1 text-muted/35 text-xs">Tap any card to view profile · leave a message</span>
          </p>
        </ScrollReveal>

        {/* Controls */}
        <ScrollReveal direction="up" delay={0.1}
          className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-8 md:mb-10">

          <div className="flex items-center justify-end gap-2 w-full">
            <input type="text" placeholder="Search…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 sm:w-44 bg-white/[0.04] border border-white/[0.08] focus:border-accent-yellow/35
                         text-text-primary font-body text-sm px-4 py-2.5 rounded-xl
                         placeholder:text-muted/25 outline-none transition-colors" />
            {(!user || user.is_admin) && (
              <motion.button onClick={() => setShowUpload(true)}
                whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                className="flex items-center gap-2 bg-accent-yellow text-bg-primary font-mono text-[10px]
                           tracking-widest px-4 py-2.5 rounded-xl uppercase hover:bg-soft-yellow
                           transition-colors flex-shrink-0">
                <span>+</span>
                <span className="hidden sm:inline">Add Profile</span>
              </motion.button>
            )}
          </div>
        </ScrollReveal>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          <AnimatePresence>
            {(loading ? Array(10).fill(null) : filtered).map((student, i) => (
              loading ? (
                <motion.div key={'skel-'+i} layout
                  initial={{ opacity:0, scale:0.88, filter:'blur(4px)' }}
                  animate={{ opacity:1, scale:1, filter:'blur(0px)' }}
                  exit={{ opacity:0, scale:0.85 }}
                  transition={{ duration:0.38, delay: Math.min(i * 0.04, 0.4) }}>
                  <YearbookCardSkeleton />
                </motion.div>
              ) : (
                <motion.div key={student.id} layout
                  initial={{ opacity:0, scale:0.88, filter:'blur(4px)' }}
                  animate={{ opacity:1, scale:1, filter:'blur(0px)' }}
                  exit={{ opacity:0, scale:0.85 }}
                  transition={{ duration:0.38, delay: Math.min(i * 0.04, 0.4) }}>
                  <YearbookCard student={student} />
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl italic text-muted/25">No results found.</p>
          </div>
        )}

      </div>

      <AnimatePresence>
        {showUpload && (
          <ProfileUploadModal
            onClose={() => { setShowUpload(false); setEditMode(false); setEditProfileData(null); }}
            onSubmit={handleProfileSubmit}
            onDelete={editMode ? () => {
              if(window.confirm('Are you heavily sure you want to wipe your profile? This cannot be undone.')){
                handleProfileDelete()
              }
            } : undefined}
            initialData={editMode ? editProfileData : null}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
