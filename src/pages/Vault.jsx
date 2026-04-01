import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Gallery from '../components/Gallery'
import VaultSplash from '../components/VaultSplash'
import ScrollReveal from '../components/ScrollReveal'
import { mockMedia } from '../lib/mockData'
import { getMedia, postMedia, uploadFile } from '../lib/supabase'

const FILTERS = ['All', '1st yr', '2nd yr', '3rd yr', '4th yr']

export default function Vault() {
  const [entered, setEntered] = useState(false)
  const [active,  setActive]  = useState('All')
  const [items, setItems] = useState(mockMedia)
  
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFileState, setUploadFileState] = useState(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFileState(e.target.files[0])
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadFileState) return toast.error('Please select an image file first.')
    
    setIsUploading(true)
    const tid = toast.loading('Uploading to bucket...')
    
    const { data: uploadData, error: uploadErr } = await uploadFile(uploadFileState)
    if (uploadErr) {
      setIsUploading(false)
      return toast.error('Upload failed: ' + uploadErr.message, { id: tid })
    }
    
    toast.loading('Saving media data...', { id: tid })
    const { error: postErr } = await postMedia({
      type: uploadFileState.type.startsWith('video') ? 'video' : 'image',
      url: uploadData.publicUrl,
      year: uploadTitle || 'Untitled',
      caption: uploadTitle || '',
    })
    
    setIsUploading(false)
    if (postErr) {
      toast.error('Failed to post: ' + postErr.message, { id: tid })
    } else {
      toast.success('Photo submitted for admin approval!', { id: tid })
      setUploadFileState(null)
      setShowUpload(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      const { data, error } = await getMedia()
      if (!error && Array.isArray(data) && data.length) {
        setItems(data)
      }
    }
    load()
  }, [])

  const filtered = active === 'All' ? items : items.filter(m => m.year === active)

  if (!entered) {
    return (
      <main className="min-h-screen pt-20 md:pt-28 pb-24 md:pb-20 flex items-center justify-center">
        <VaultSplash onEnter={() => setEntered(true)} />
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-20 md:pt-28 pb-28 md:pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        <ScrollReveal direction="up" className="text-center mb-10 md:mb-14">
          <span className="font-mono text-[10px] tracking-[0.4em] text-accent-yellow/55 uppercase">Every Moment</span>
          <h1 className="font-archive text-5xl md:text-7xl text-accent-yellow text-glow mt-3 mb-4">Media Vault</h1>
          <div className="line-yellow max-w-xs mx-auto mb-5" />
          <p className="font-body text-sm text-muted/60 max-w-sm mx-auto">
            Four years of frames. Upload your photos and they'll live here forever.
          </p>
        </ScrollReveal>

        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3 flex-1">
            <div className="line-yellow flex-1 opacity-15" />
            <span className="font-mono text-[9px] text-muted/40 tracking-widest whitespace-nowrap">{filtered.length} ITEMS</span>
            <div className="line-yellow flex-1 opacity-15" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            transition={{ duration:0.28 }}>
            <Gallery items={filtered} />
          </motion.div>
        </AnimatePresence>

        {/* Upload CTA */}
        <ScrollReveal direction="up" delay={0.2} className="mt-16 md:mt-20">
          <div onClick={() => setShowUpload(true)} className="glass border border-dashed border-accent-yellow/12 rounded-2xl p-8 md:p-10 text-center
                          hover:border-accent-yellow/25 transition-colors duration-300 cursor-pointer">
            <div className="text-3xl mb-3 opacity-25">📤</div>
            <p className="font-archive text-xl text-text-primary/35 mb-2">Have photos from the batch?</p>
            <p className="font-body text-sm text-muted/40 mb-5">Click here to upload. Media travels into a pending queue.</p>
            <span className="badge cursor-pointer hover:border-accent-yellow/35 transition-colors">Admin approval required</span>
          </div>
        </ScrollReveal>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-bg-surface border border-accent-yellow/15 p-6 rounded-2xl relative shadow-2xl glass">
            <button onClick={() => setShowUpload(false)} disabled={isUploading}
              className="absolute top-4 right-4 text-muted/50 hover:text-text-primary text-xl">&times;</button>
            <h2 className="font-archive text-2xl text-accent-yellow mb-2">Upload Memory</h2>
            <p className="font-body text-xs text-muted/60 mb-6">File gets pushed to <span className="font-mono text-[10px] text-accent-yellow/70">batchof2026</span> bucket.</p>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <div
                className="border border-dashed border-accent-yellow/20 rounded-xl p-6 text-center cursor-pointer hover:border-accent-yellow/40 transition-colors"
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/mp4,video/quicktime" onChange={handleFileChange} />
                {uploadFileState ? (
                  <p className="font-body text-sm text-accent-yellow/80">{uploadFileState.name}</p>
                ) : (
                  <p className="font-body text-sm text-muted/60">Tap to select photo/video from device</p>
                )}
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest text-muted/50 mb-2 uppercase">Title / Caption</label>
                <input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} disabled={isUploading}
                  placeholder="A memory worth saving..."
                  className="w-full py-3 px-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-text-primary
                             focus:border-accent-yellow/40 focus:bg-white/[0.05] outline-none transition-all font-body" />
              </div>
              
              <p className="font-mono text-[8px] text-muted/40 uppercase tracking-widest text-center mt-1 mb-3">Photos & videos will be compressed to save space</p>

              <div className="pt-2">
                <button type="submit" disabled={isUploading || !uploadFileState}
                  className="w-full py-3 bg-accent-yellow text-bg-primary font-mono text-[11px] tracking-widest uppercase rounded-lg
                             hover:bg-accent-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {isUploading ? 'Uploading...' : 'Submit Media'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  )
}
