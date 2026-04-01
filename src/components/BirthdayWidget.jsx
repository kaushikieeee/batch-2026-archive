import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStudents } from '../lib/supabase'

export default function BirthdayWidget() {
  const [birthdays, setBirthdays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await getStudents()
      if (data) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const withDobs = data
          .filter(d => d.dob && d.visibility_preferences?.dob !== false)
          .map(student => {
            const dobParts = student.dob.split('-')
            if (dobParts.length !== 3) return null
            
            const bMonth = parseInt(dobParts[1], 10) - 1
            const bDay = parseInt(dobParts[2], 10)
            const isToday = bMonth === today.getMonth() && bDay === today.getDate()
            
            const nextBday = new Date(today.getFullYear(), bMonth, bDay)
            if (nextBday < today && !isToday) {
              nextBday.setFullYear(today.getFullYear() + 1)
            }
            
            const daysLeft = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            
            return { ...student, isToday, daysLeft, nextBday }
          })
          .filter(Boolean)

        // Sort by closest birthday
        withDobs.sort((a, b) => a.daysLeft - b.daysLeft)
        setBirthdays(withDobs.slice(0, 4))
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading || birthdays.length === 0) return null

  return (
    <div className="glass border border-accent-yellow/10 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto w-full mt-10 md:mt-24 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-yellow/5 rounded-full blur-3xl" />
      <h3 className="font-archive text-2xl text-accent-yellow mb-5 flex items-center gap-2 relative z-10">
        <span className="text-2xl">🍰</span> Batch Birthdays
        <div className="flex-1 h-px bg-gradient-to-r from-accent-yellow/20 to-transparent ml-4" />
      </h3>
      <div className="space-y-3 relative z-10">
        <AnimatePresence>
          {birthdays.map((b, i) => (
            <motion.div 
              key={b.id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                b.isToday 
                  ? 'bg-accent-yellow/10 border-accent-yellow/40 shadow-[0_0_15px_rgba(244,196,48,0.15)]' 
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <img 
                  src={b.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(b.name)}`} 
                  alt={b.name} 
                  className="w-12 h-12 rounded-full object-cover border border-white/10" 
                />
                <div>
                  <p className="font-body text-base text-text-primary flex flex-col sm:flex-row sm:items-center gap-x-2">
                    {b.name} 
                    {b.isToday && <span className="font-archive mt-0.5 sm:mt-0 text-accent-yellow text-[10px] tracking-widest uppercase bg-accent-yellow/20 px-2 py-0.5 rounded-full w-fit">IT'S TODAY!</span>}
                  </p>
                  <p className="font-mono text-xs text-muted/50 tracking-widest mt-1">
                    {new Date(b.nextBday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                {b.isToday ? (
                  <div className="text-3xl animate-bounce mr-2">🎉</div>
                ) : (
                  <div className="font-mono flex flex-col items-center">
                    <span className="text-xl text-accent-yellow leading-none">{b.daysLeft}</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted/40 mt-1 block">Days Left</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}