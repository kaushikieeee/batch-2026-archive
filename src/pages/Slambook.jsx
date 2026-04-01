import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStudents, getDirectMessages, sendDirectMessage, subscribeToMessages, getAllDirectMessagesForAdmin, trackPresence, getGroupMessages, sendGroupMessage, subscribeToGroupMessages } from '../lib/supabase'
import toast from 'react-hot-toast'
import ScrollReveal from '../components/ScrollReveal'

export default function Slambook({ user }) {
  const [showIntro, setShowIntro] = useState(true)
  const [students, setStudents] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [adminMessages, setAdminMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!user ) return
    let presenceRoom;
    let sub;
    let groupSub;

    const load = async () => {
      const { data } = await getStudents()
      if (data) setStudents(data.filter(s => s.id !== user.id && !s.is_admin))
      
      if (user.is_admin) {
        const { data: adminDms } = await getAllDirectMessagesForAdmin()
        if (adminDms) setAdminMessages(adminDms)
        setLoading(false)
        return; // Admins just see the override view.
      }
      setLoading(false)
    }
    load()
    
    // Who's Online Tracking
    presenceRoom = trackPresence(user.id, user.name || user.username, (state) => {
       const u = []
       for (const id in state) {
          u.push(state[id][0])
       }
       setOnlineUsers(u)
    })

    if (!user.is_admin) {
      sub = subscribeToMessages(user.id, (newMsg) => {
         loadMessagesCallback(newMsg)
      })
      groupSub = subscribeToGroupMessages((newMsg) => {
         loadMessagesCallback(newMsg)
      })
    }
    
    return () => {
        if (sub) sub.unsubscribe()
        if (groupSub) groupSub.unsubscribe()
        if (presenceRoom) presenceRoom.unsubscribe() 
    }
  }, [user])

  // Need a ref or similar if selectedUser changes, but simple approach:
  // Re-fetch when a new message arrives intended for us.
  const loadMessagesCallback = (newMsg) => {
    if (!newMsg.receiver_id) {
       toast(`New Group Message!`, { icon: '🌍' })
    } else {
       toast(`New Slambook Message!`, { icon: '💌' })
    }
  }

  // Effect to handle reloading when selected user changes
  useEffect(() => {
     if (selectedUser) {
         loadMessages(selectedUser.id)
     }
  }, [selectedUser])


  const loadMessages = async (peerId) => {
    if (!user) return
    if (peerId === 'group_chat') {
      const { data } = await getGroupMessages()
      if (data) setMessages(data)
      return
    }
    const { data } = await getDirectMessages(user.id, peerId)
    if (data) setMessages(data)
  }

  const handleSelectUser = (peer) => {
    setSelectedUser(peer)
    loadMessages(peer.id)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || !selectedUser) return
    
    const content = input.trim()
    setInput('') // optimistic clear
    
    // Optimistic UI insert
    const optimisticMsg = {
        id: Math.random(),
        sender_id: user.id,
        receiver_id: selectedUser.id === 'group_chat' ? null : selectedUser.id,
        content: content,
        created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimisticMsg])

    let error;
    if (selectedUser.id === 'group_chat') {
      const res = await sendGroupMessage(user.id, content)
      error = res.error
    } else {
      const res = await sendDirectMessage(user.id, selectedUser.id, content)
      error = res.error
    }

    if (error) {
      toast.error('Failed to send.')
      // optionally remove optimistic message
      loadMessages(selectedUser.id) // resync
    } else {
      loadMessages(selectedUser.id) // double check true state
    }
  }

  if (!user ) {
    return <div className="text-center py-40 font-mono text-muted">Please log in to use the Slambook.</div>
  }

  // OMNISCIENT ADMIN VIEW
  if (user.is_admin) {
    return (
      <div className="pt-24 max-w-5xl mx-auto px-4 min-h-screen">
          <h1 className="text-4xl font-archive text-red-500 mb-2">Omniscient View</h1>
          <p className="text-muted/60 font-mono text-[10px] uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Global Peer-to-Peer Intercept</p>
          <div className="space-y-3">
              {adminMessages.map(m => (
                  <div key={m.id} className="glass p-4 rounded-xl border border-white/5 flex gap-4 hover:border-red-500/30 transition-colors">
                      <div className="text-[9px] font-mono text-muted/40 w-16 pt-0.5">{new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                      <div>
                          <div className="mb-1 text-xs font-mono">
                            <span className="text-accent-yellow">{m.sender?.name || 'Unknown'}</span>
                            <span className="text-muted/30 mx-2">→</span>
                            <span className="text-[#06b6d4]">{m.receiver?.name || 'Unknown'}</span>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed">{m.content}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    )
  }

  // STANDARD USER VIEW
  return (
    <div className="pt-[100px] md:pt-24 pb-24 md:pb-0 max-w-6xl mx-auto px-4 min-h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 relative">
       
      {/* Sidebar - Users List */}
      <div className={`md:w-1/3 glass p-5 rounded-2xl flex-col h-[75vh] border border-white/5 relative z-10 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
         <div className="flex justify-between items-end mb-5">
           <h2 className="font-archive text-3xl text-white">Slambook</h2>
           <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[8px] font-mono text-green-400 uppercase tracking-widest">{onlineUsers.length} Online</span>
           </div>
         </div>
         {loading ? <p className="font-mono text-xs text-muted">Decoding graph...</p> : (
           <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
              <button 
                onClick={() => handleSelectUser({id: 'group_chat', name: 'Batch 2026 Room', section: 'Global Hub'})} 
                className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between mb-2 ${selectedUser?.id === 'group_chat' ? 'bg-accent-yellow/20 border border-accent-yellow/50' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-xl border border-accent-yellow/30 shadow-[0_0_10px_rgba(255,215,0,0.1)]">🌍</div>
                  <div>
                    <div className={`text-sm font-bold ${selectedUser?.id === 'group_chat' ? 'text-accent-yellow' : 'text-white'}`}>Batch 2026 Room</div>
                    <div className="text-accent-yellow/50 font-mono text-[9px] uppercase tracking-widest">Global Chat</div>
                  </div>
                </div>
              </button>
              
              {students.map(s => {
                const isOnline = onlineUsers.some(ou => ou.id === s.id)
                return (
                  <button key={s.id} onClick={() => handleSelectUser(s)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${selectedUser?.id === s.id ? 'bg-accent-yellow/10 border border-accent-yellow/30' : 'hover:bg-white/[0.03] border border-transparent'}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-black/40">
                           {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}
                        </div>
                        {isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#111] rounded-full"></div>}
                      </div>
                      <div>
                         <div className={`text-sm font-bold ${selectedUser?.id === s.id ? 'text-accent-yellow' : 'text-white'}`}>{s.name}</div>
                         <div className="text-muted/50 font-mono text-[9px] uppercase tracking-widest">{s.section}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
           </div>
         )}
      </div>

      {/* Chat Area */}
      <div className={`md:w-2/3 glass rounded-2xl flex-col h-[75vh] border border-white/5 relative z-10 overflow-hidden ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
         {selectedUser ? (
           <>
              <div className="bg-white/[0.02] border-b border-white/5 p-4 flex items-center gap-4">
                  <button onClick={() => setSelectedUser(null)} className="md:hidden text-white/50 text-xl pl-1 pr-3 hover:text-white">←</button>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-black/20 border border-white/5 flex-shrink-0">
                     {selectedUser.image ? <img src={selectedUser.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">👤</div>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-archive text-2xl text-white leading-none truncate">{selectedUser.name}</h3>
                    <p className="font-mono text-[9px] text-accent-yellow uppercase tracking-widest mt-1">
                       {onlineUsers.some(ou => ou.id === selectedUser.id) ? 'Online Now' : 'Away'}
                    </p>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col">
                 {messages.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-30"><span className="text-4xl mb-3">💌</span><p className="text-xs font-mono uppercase tracking-widest">No messages yet.</p></div> : null}
                 {messages.map((m, i) => {
                    const isMe = m.sender_id === user.id
                    const senderObj = students.find(s => s.id === m.sender_id)
                    const showSenderName = selectedUser.id === 'group_chat' && !isMe
                    return (
                      <div key={m.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[75%] p-3.5 rounded-2xl ${isMe ? 'bg-accent-yellow text-black rounded-tr-[4px] shadow-[0_0_15px_rgba(244,196,48,0.15)]' : 'bg-white/[0.05] border border-white/10 text-white rounded-tl-[4px]'}`}>
                            {showSenderName && senderObj && (
                              <span className="text-[10px] font-bold text-accent-yellow block mb-1 opacity-80">{senderObj.name}</span>
                            )}
                            <p className="text-sm font-body leading-relaxed">{m.content}</p>
                            <span className={`text-[8px] font-mono mt-2 block ${isMe ? 'text-black/40' : 'text-white/30'}`}>
                               {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                         </div>
                      </div>
                    )
                 })}
              </div>

              <form onSubmit={handleSend} className="p-4 bg-white/[0.01] border-t border-white/5 flex gap-2">
                 <input 
                    type="text" 
                    value={input} 
                    onChange={e=>setInput(e.target.value)} 
                    placeholder={`Message ${selectedUser.name}...`} 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-accent-yellow/50 transition-colors" 
                 />
                 <button 
                    type="submit" 
                    disabled={!input.trim()} 
                    className="bg-accent-yellow text-black px-6 rounded-xl font-bold font-mono text-[10px] tracking-widest uppercase hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(244,196,48,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
                 >
                    Send
                 </button>
              </form>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-muted font-mono bg-white/[0.01]">
             <span className="text-5xl opacity-20 mb-4 animate-pulse">📮</span>
             <span className="text-[10px] uppercase tracking-widest opacity-50">Select a classmate to view your Digital Slambook.</span>
           </div>
         )}
      </div>
      
      {/* Background Decor */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-20 translate-x-1/4 translate-y-1/4">
        <div className="w-[500px] h-[500px] rounded-full bg-accent-yellow/20 blur-[120px]" />
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowIntro(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative z-10 glass max-w-md w-full p-8 rounded-2xl border border-accent-yellow/20 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-accent-yellow/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💌</span>
              </div>
              <h2 className="font-archive text-3xl text-accent-yellow mb-3">The Digital Slambook</h2>
              <p className="font-body text-sm text-muted/80 leading-relaxed mb-8">
                Welcome to your private message space. Click on any classmate to send them a direct, unmoderated message. Tell them what you really thought, share an inside joke, or just say goodbye properly.
              </p>
              <button
                onClick={() => setShowIntro(false)}
                className="w-full py-4 bg-accent-yellow text-bg-primary font-mono text-[10px] tracking-widest uppercase rounded-xl hover:bg-yellow-400 transition-colors"
              >
                I understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
