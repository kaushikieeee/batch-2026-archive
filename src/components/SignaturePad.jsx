import { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function SignaturePad({ onSave, onClear }) {
  const sigCanvas = useRef(null)

  const handleSave = () => {
    if (sigCanvas.current.isEmpty()) return onSave(null)
    const dataUrl = sigCanvas.current.getCanvas().toDataURL('image/png')
    onSave(dataUrl)
  }

  const handleClear = () => {
    sigCanvas.current.clear()
    if (onClear) onClear()
  }

  return (
    <div className="glass border border-accent-yellow/20 rounded-xl overflow-hidden relative group">
      <div className="absolute top-2 right-2 flex gap-2 z-10 transition duration-300">
        <button onClick={handleClear} className="bg-red-500/20 text-red-300 font-mono text-[9px] px-3 py-1 rounded-sm uppercase tracking-widest hover:bg-red-500/40 transition">
          Clear
        </button>
        <button onClick={handleSave} className="bg-accent-yellow/20 text-accent-yellow font-mono text-[9px] px-3 py-1 rounded-sm uppercase tracking-widest hover:bg-accent-yellow/40 transition flex items-center justify-center">
          Lock In
        </button>
      </div>
      <SignatureCanvas
        ref={sigCanvas}
        penColor="#F4C430"
        onEnd={handleSave}
        canvasProps={{
          className: "w-full h-56 md:h-72 cursor-crosshair",
          style: { background: 'transparent' }
        }}
      />
      <div className="absolute bottom-[20%] left-0 right-0 text-center pointer-events-none opacity-40">
        <span className="font-mono text-[10px] text-muted/30 uppercase tracking-[0.4em] border-b border-muted/20 pb-0.5 inline-block">
          Leave your mark
        </span>
      </div>
    </div>
  )
}
