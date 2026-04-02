import YearbookCard from '../components/YearbookCard';
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  GODMODE_PASSWORD,
  GODMODE_USERNAME,
  MOD_STATUS,
  createSingleUser,
  ensureGodmodeUser,
  getAdminUsers,
  getAllMediaForAdmin,
  getAllMessagesForAdmin,
  getAllStudentMessagesForAdmin,
  isGodmodeUser,
  reviewMedia,
  reviewMessage,
  reviewStudentMessage,
  deleteUser,
  passwordResetAdmin,
} from '../lib/supabase'

const TABS = ['Users', 'Messages', 'Photos', 'Memos', 'Overview']

function StatusPill({ status }) {
  const map = {
    pending: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
    approved: 'bg-green-500/15 text-green-200 border-green-400/30',
    rejected: 'bg-red-500/15 text-red-200 border-red-400/30',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] border font-mono uppercase tracking-wider ${map[status] || 'border-white/20 text-muted'}`}>
      {status || 'unknown'}
    </span>
  )
}

export default function Admin({ user }) {
  const isAdmin = isGodmodeUser(user)

  const [tab, setTab] = useState('Users')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [photos, setPhotos] = useState([])
  const [memos, setMemos] = useState([])

  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', section: '', role: '', dob: '', welcome_message: '', personal_letter: '' })

  const [showPasswords, setShowPasswords] = useState(false)
  const [userSearch, setUserSearch] = useState('')

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const lower = userSearch.toLowerCase();
    return users.filter(u => 
      (u.username?.toLowerCase() || '').includes(lower) ||
      (u.name?.toLowerCase() || '').includes(lower) ||
      (u.section?.toLowerCase() || '').includes(lower)
    );
  }, [users, userSearch]);

  const downloadUsersCSV = () => {
    const headers = ['Username', 'Name', 'Section', 'Role', 'Password']
    const rows = filteredUsers.map(u => [
      `"${(u.username || '').replace(/"/g, '""')}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.section || '').replace(/"/g, '""')}"`,
      `"${(u.role || '').replace(/"/g, '""')}"`,
      `"${(showPasswords ? u.password : '***').replace(/"/g, '""')}"`
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users_backup.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const counts = useMemo(() => ({
    pendingMessages: messages.filter(x => x.status === MOD_STATUS.PENDING).length,
    pendingPhotos: photos.filter(x => x.status === MOD_STATUS.PENDING).length,
    pendingMemos: memos.filter(x => x.status === MOD_STATUS.PENDING).length,
    users: users.length,
  }), [messages, photos, memos, users])

  const loadUsers = async () => {
    const { data, error: err } = await getAdminUsers()
    if (err) throw err
    setUsers(data || [])
  }

  const loadMessages = async (status = statusFilter) => {
    const { data, error: err } = await getAllMessagesForAdmin(status)
    if (err) throw err
    setMessages(data || [])
  }

  const loadPhotos = async (status = statusFilter) => {
    const { data, error: err } = await getAllMediaForAdmin(status)
    if (err) throw err
    setPhotos(data || [])
  }

  const loadMemos = async (status = statusFilter) => {
    const { data, error: err } = await getAllStudentMessagesForAdmin(status)
    if (err) throw err
    setMemos(data || [])
  }

  const reloadActiveTab = async () => {
    setLoading(true)
    setError('')
    try {
      if (tab === 'Users') await loadUsers()
      if (tab === 'Messages') await loadMessages()
      if (tab === 'Photos') await loadPhotos()
      if (tab === 'Memos') await loadMemos()
      if (tab === 'Overview') {
        await Promise.all([
          loadUsers(),
          loadMessages('all'),
          loadPhotos('all'),
          loadMemos('all'),
        ])
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    reloadActiveTab()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter, isAdmin])

  const createOne = async () => {
    if (!newUser.username.trim() || !newUser.password.trim()) return
    setLoading(true)
    setError('')
    try {
      const { error: err } = await createSingleUser({
        username: newUser.username.trim(),
        password: newUser.password.trim(),
        name: newUser.name.trim() || null,
        section: newUser.section.trim() || null,
        role: newUser.role.trim() || null,
        dob: newUser.dob ? newUser.dob : null,
        welcome_message: newUser.welcome_message.trim() || null,
        personal_letter: newUser.personal_letter?.trim() || null,
      })
      if (err) throw err
      setNewUser({ username: '', password: '', name: '', section: '', role: '', dob: '', welcome_message: '', personal_letter: '' })
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Could not create user.')
    } finally {
      setLoading(false)
    }
  }

  const createOrResetGodmode = async () => {
    setLoading(true)
    setError('')
    try {
      const { error: err } = await ensureGodmodeUser()
      if (err) throw err
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Could not create/reset godmode user.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Are you absolutely sure you want to delete the user "${username}"?\nThis deletes all their messages and uploads too!`)) return
    setLoading(true)
    setError('')
    try {
      const { error: err } = await deleteUser(id)
      if (err) throw err
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Could not delete user.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (id, username) => {
    const newPwd = window.prompt(`Enter a new temporary password for "${username}":`)
    if (!newPwd || !newPwd.trim()) return
    setLoading(true)
    setError('')
    try {
      const { error: err } = await passwordResetAdmin(id, newPwd.trim())
      if (err) throw err
      await loadUsers()
      alert(`Password for ${username} reset successfully.`)
    } catch (err) {
      setError(err.message || 'Could not reset password.')
    } finally {
      setLoading(false)
    }
  }

  const moderate = async (type, id, status) => {
    setLoading(true)
    setError('')
    try {
      if (type === 'messages') {
        const { error: err } = await reviewMessage({ id, status, adminUsername: user?.username })
        if (err) throw err
        await loadMessages()
      }
      if (type === 'photos') {
        const { error: err } = await reviewMedia({ id, status, adminUsername: user?.username })
        if (err) throw err
        await loadPhotos()
      }
      if (type === 'memos') {
        const { error: err } = await reviewStudentMessage({ id, status, adminUsername: user?.username })
        if (err) throw err
        await loadMemos()
      }
    } catch (err) {
      setError(err.message || 'Moderation failed.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen pt-28 pb-24 px-6">
        <div className="max-w-3xl mx-auto glass border border-red-500/20 rounded-2xl p-8 text-center">
          <h1 className="font-archive text-4xl text-red-300">Access denied</h1>
          <p className="font-body text-sm text-muted mt-3">
            Only admin accounts can open this panel.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-28 pb-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <span className="font-mono text-[10px] tracking-[0.35em] text-accent-yellow/60 uppercase">Control Center</span>
          <h1 className="font-archive text-5xl md:text-6xl text-accent-yellow text-glow mt-2">Admin Panel</h1>
          <p className="font-body text-sm text-muted/70 mt-3 max-w-2xl">
            Godmode moderation for users, photos, wall notes, and student memos. New content stays pending until you approve it.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
          <div className="glass rounded-xl border border-white/10 p-4">
            <div className="font-mono text-[9px] text-muted/50 uppercase tracking-wider">Users</div>
            <div className="font-archive text-3xl text-text-primary mt-1">{counts.users}</div>
          </div>
          <div className="glass rounded-xl border border-amber-400/20 p-4">
            <div className="font-mono text-[9px] text-muted/50 uppercase tracking-wider">Pending messages</div>
            <div className="font-archive text-3xl text-amber-200 mt-1">{counts.pendingMessages}</div>
          </div>
          <div className="glass rounded-xl border border-amber-400/20 p-4">
            <div className="font-mono text-[9px] text-muted/50 uppercase tracking-wider">Pending photos</div>
            <div className="font-archive text-3xl text-amber-200 mt-1">{counts.pendingPhotos}</div>
          </div>
          <div className="glass rounded-xl border border-amber-400/20 p-4">
            <div className="font-mono text-[9px] text-muted/50 uppercase tracking-wider">Pending memos</div>
            <div className="font-archive text-3xl text-amber-200 mt-1">{counts.pendingMemos}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full font-mono text-[10px] tracking-widest uppercase border transition-colors ${
                tab === t
                  ? 'bg-accent-yellow text-bg-primary border-accent-yellow'
                  : 'border-white/15 text-muted hover:text-text-primary'
              }`}
            >
              {t}
            </button>
          ))}

          {(tab === 'Messages' || tab === 'Photos' || tab === 'Memos') && (
            <div className="ml-auto flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase border ${statusFilter === s ? 'border-accent-yellow text-accent-yellow' : 'border-white/15 text-muted'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 font-mono text-xs">
            {error}
          </div>
        )}

        {tab === 'Users' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass border border-white/10 rounded-2xl p-5">
                <h2 className="font-archive text-2xl text-text-primary mb-4">Create user</h2>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={newUser.username}
                      onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))}
                      placeholder="Username"
                      className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      value={newUser.password}
                      onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                      placeholder="Password"
                      className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    value={newUser.name}
                    onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                    placeholder="Full Name (optional)"
                    className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      value={newUser.section}
                      onChange={e => setNewUser(p => ({ ...p, section: e.target.value }))}
                      placeholder="Section"
                      className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      value={newUser.role}
                      onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                      placeholder="Role"
                      className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted/60 mb-1 ml-1">Custom Welcome Message (Optional)</label>
                    <textarea
                      value={newUser.welcome_message}
                      onChange={e => setNewUser(p => ({ ...p, welcome_message: e.target.value }))}
                      placeholder="Short intro cinematic text"
                      className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary h-12 resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted/60 mb-1 ml-1 flex items-center justify-between">
                       Personal Template Letter (Optional) <span className="text-accent-yellow/60">Reads fully customized</span>
                    </label>
                    <textarea
                      value={newUser.personal_letter}
                      onChange={e => setNewUser(p => ({ ...p, personal_letter: e.target.value }))}
                      placeholder="A long-form letter only this user will see during onboarding... (e.g. My dear friend...)"
                      className="w-full bg-bg-primary border border-white/10 focus:border-accent-yellow/40 rounded-lg px-3 py-2 text-sm text-text-primary h-24 resize-y font-body whitespace-pre-wrap"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted/60 mb-1 ml-1">Birthdate (Optional)</label>
                    <input
                      type="date"
                      value={newUser.dob || ''}
                      onChange={e => setNewUser(p => ({ ...p, dob: e.target.value }))}
                      className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary/70"
                    />
                  </div>
                  <button
                    onClick={createOne}
                    disabled={loading || !newUser.username.trim() || !newUser.password.trim()}
                    className="w-full py-2.5 mt-2 rounded-lg bg-accent-yellow text-bg-primary font-mono text-xs tracking-widest uppercase disabled:opacity-50"
                  >
                    Create user
                  </button>
                </div>
              </div>

              <div className="glass border border-white/10 rounded-2xl p-5">
                <h2 className="font-archive text-2xl text-text-primary mb-4">Godmode account</h2>
                <p className="font-body text-xs text-muted/70 mb-3">
                  Use this one-click action to create or reset your owner login directly in Supabase.
                </p>
                <div className="rounded-xl border border-accent-yellow/30 bg-accent-yellow/10 p-3 space-y-1">
                  <p className="font-mono text-[10px] text-accent-yellow/90 uppercase tracking-wider">Username: {GODMODE_USERNAME}</p>
                  <p className="font-mono text-[10px] text-accent-yellow/90 uppercase tracking-wider">Password: {GODMODE_PASSWORD}</p>
                </div>
                <button
                  onClick={createOrResetGodmode}
                  disabled={loading}
                  className="mt-4 w-full py-2.5 rounded-lg bg-accent-yellow text-bg-primary font-mono text-xs tracking-widest uppercase disabled:opacity-50"
                >
                  Create / reset godmode user
                </button>
              </div>
            </div>

            <div className="glass border border-red-400/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-archive text-xl text-red-200">Passwords (sensitive)</h3>
                <button
                  onClick={() => setShowPasswords(v => !v)}
                  className="font-mono text-[10px] uppercase tracking-wider text-red-100 border border-red-300/30 rounded-full px-3 py-1"
                >
                  {showPasswords ? 'Hide passwords' : 'Show passwords'}
                </button>
              </div>
              <p className="font-body text-xs text-red-100/80">Visible for admin control only.</p>
            </div>

            <div className="glass border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10 flex-wrap gap-4">
                 <input 
                   type="text"
                   value={userSearch}
                   onChange={e => setUserSearch(e.target.value)}
                   placeholder="Search users..."
                   className="bg-bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-accent-yellow/40 w-full md:w-64"
                 />
                 <button onClick={downloadUsersCSV} className="font-mono text-[10px] uppercase tracking-wider text-green-200 border border-green-500/30 rounded-full px-3 py-1 bg-green-500/10 hover:bg-green-500/20 transition-colors">
                    Export CSV
                 </button>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 bg-white/5 border-b border-white/10 font-mono text-[10px] uppercase tracking-widest text-muted/70 sticky top-0 z-10 backdrop-blur-xl">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Username</div>
                <div className="col-span-6">Password & Settings</div>
              </div>
              <div className="max-h-[500px] overflow-auto relative">
                {filteredUsers.map((u, idx) => (
                  <details key={u.id} className="group border-b border-white/[0.04]">
                    <summary className="grid grid-cols-12 px-4 py-3 text-sm cursor-pointer hover:bg-white/[0.02]">
                      <div className="col-span-1 text-muted flex items-center gap-2">
                        <span className="text-[8px] opacity-50 group-open:rotate-90 transition-transform">▶</span>
                        {idx + 1}
                      </div>
                      <div className="col-span-5 flex items-center gap-3">
                        {u.image ? (
                          <img src={u.image} alt="" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-muted font-mono">{u.username?.substring(0,2) || '??'}</div>
                        )}
                        <div>
                          <div className="font-mono text-text-primary">{u.username}</div>
                          {u.name && <div className="text-[9px] text-muted uppercase tracking-wider">{u.name} — {u.section || 'No'}</div>}
                        </div>
                      </div>
                      <div className="col-span-6 font-mono text-accent-yellow/90 flex items-center justify-between">
                        <span>{showPasswords ? u.password : '••••••••'}</span>
                        {u.is_admin && <span className="bg-red-500/20 text-red-200 border border-red-500/50 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold">Admin</span>}
                      </div>
                    </summary>
                    <div className="px-4 pb-4 pt-1 ml-10 text-xs text-muted-foreground">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                               <div className="text-[10px] text-muted/60 uppercase tracking-widest mb-1">Quote & Bio</div>
                               {u.quote && <div className="italic text-accent-yellow mb-1">"{u.quote}"</div>}
                               {u.bio && <div>{u.bio}</div>}
                               {!u.quote && !u.bio && <div className="text-white/20">Not provided</div>}
                             </div>
                             <div>
                               <div className="text-[10px] text-muted/60 uppercase tracking-widest mb-1">Time Capsule</div>
                               {u.time_capsule ? <div className="font-mono text-[10px] whitespace-pre-wrap">{u.time_capsule}</div> : <div className="text-white/20">No capsule sealed</div>}
                             </div>
                          </div>
                          
                          {u.personal_letter && (
                            <div className="pt-4 border-t border-white/5">
                              <div className="text-[10px] text-muted/60 uppercase tracking-widest mb-3">Onboarding Letter Design Preview</div>
                              <div className="bg-bg-secondary/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden max-w-sm">
                                {/* Decorative tape/pin */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-white/5 -translate-y-1/2 rotate-2 backdrop-blur-3xl shadow-sm z-20" />
                                <h3 className="font-handwritten text-2xl text-accent-yellow mb-4">A letter for you...</h3>
                                <div className="font-body text-sm text-text-primary/90 leading-relaxed whitespace-pre-wrap">
                                   {u.personal_letter}
                                </div>
                              </div>
                            </div>
                          )}

                          {(u.signature_url || u.email || u.phone || u.instagram || u.snapchat || u.website || u.linkedin || u.youtube || u.github || u.x_twitter) && (
                            <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-[10px] text-muted/60 uppercase tracking-widest mb-1">Socials & Contact</div>
                                <div className="space-y-1 font-mono text-[10px] [&>div]:flex [&>div]:gap-2">
                                   {u.email && <div><span className="text-muted">EMAIL:</span>{u.email}</div>}
                                   {u.phone && <div><span className="text-muted">PHONE:</span>{u.phone}</div>}
                                   {u.instagram && <div><span className="text-muted">IG:</span>{u.instagram}</div>}
                                   {u.snapchat && <div><span className="text-muted">SNAP:</span>{u.snapchat}</div>}
                                   {u.linkedin && <div><span className="text-muted">IN:</span>{u.linkedin}</div>}
                                   {u.youtube && <div><span className="text-muted">YT:</span>{u.youtube}</div>}
                                   {u.github && <div><span className="text-muted">Git:</span>{u.github}</div>}
                                   {u.x_twitter && <div><span className="text-muted">X:</span>{u.x_twitter}</div>}
                                   {u.website && <div><span className="text-muted">Web:</span><span className="truncate max-w-[120px]">{u.website}</span></div>}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-muted/60 uppercase tracking-widest mb-2">Digital Signature</div>
                                {u.signature_url ? (
                                  <div className="bg-white/5 p-2 rounded w-fit">
                                    <img src={u.signature_url} className="h-4 object-contain invert opacity-70" alt="signature" />
                                  </div>
                                ) : <div className="text-white/20">No signature recorded</div>}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 border-l border-white/5 pl-6 pt-1">
                           <div className="text-[10px] text-muted/60 uppercase tracking-widest mb-1">Public Profile</div>
                           <div className="w-full max-w-[140px]">
                              <YearbookCard student={{...u, accentColor: u.accent_color}} />
                           </div>
                           <div className="text-[9px] text-muted leading-tight max-w-[140px]">
                              Click the card to open and preview the user's public modal.
                           </div>

                           <div className="w-full pt-4 mt-auto">
                              <div className="text-[10px] text-red-400/60 uppercase tracking-widest mb-2 border-t border-red-500/20 pt-2">Danger Zone (Admin Actions)</div>
                              <div className="flex flex-col gap-2 w-full max-w-[140px]">
                                 <button onClick={() => handleResetPassword(u.id, u.username)} className="text-left w-full px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-mono bg-orange-500/10 text-orange-200 border border-orange-500/20 hover:bg-orange-500/20 transition-all text-center">Reset Pwd</button>
                                 <button onClick={() => handleDeleteUser(u.id, u.username)} disabled={u.is_admin} className="text-left w-full px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-mono bg-red-500/10 text-red-200 border border-red-500/20 hover:bg-red-500/20 transition-all text-center disabled:opacity-30 disabled:cursor-not-allowed">Delete User</button>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
                {users.length === 0 && <div className="p-6 text-sm text-muted">No users found.</div>}
              </div>
            </div>
          </motion.section>
        )}

        {tab === 'Messages' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {messages.map(item => (
              <div key={item.id} className="glass border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-body text-sm text-text-primary">{item.message}</div>
                    <div className="mt-2 font-mono text-[10px] text-muted/60 uppercase tracking-wider">by {item.name || 'Anonymous'}</div>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <div className="flex gap-2 mt-3">
                  <button disabled={loading} onClick={() => moderate('messages', item.id, MOD_STATUS.APPROVED)} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-green-500/20 text-green-200 border border-green-400/30 disabled:opacity-50">Approve</button>
                  <button disabled={loading} onClick={() => moderate('messages', item.id, MOD_STATUS.REJECTED)} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-red-500/20 text-red-200 border border-red-400/30 disabled:opacity-50">Reject</button>
                </div>
              </div>
            ))}
            {messages.length === 0 && <div className="text-sm text-muted">No message rows for this filter.</div>}
          </motion.section>
        )}

        {tab === 'Photos' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {photos.map(item => (
              <div key={item.id} className="glass border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-body text-sm text-text-primary">{item.caption || 'Untitled photo'}</div>
                    <div className="mt-1 font-mono text-[10px] text-muted/60 uppercase tracking-wider">{item.year || 'unknown year'}</div>
                    <a href={item.src} target="_blank" rel="noreferrer" className="font-mono text-xs text-accent-yellow/80 hover:text-accent-yellow">Open photo URL</a>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <div className="flex gap-2 mt-3">
                  <button disabled={loading} onClick={() => moderate('photos', item.id, MOD_STATUS.APPROVED)} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-green-500/20 text-green-200 border border-green-400/30 disabled:opacity-50">Approve</button>
                  <button disabled={loading} onClick={() => moderate('photos', item.id, MOD_STATUS.REJECTED)} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-red-500/20 text-red-200 border border-red-400/30 disabled:opacity-50">Reject</button>
                </div>
              </div>
            ))}
            {photos.length === 0 && <div className="text-sm text-muted">No photo rows for this filter.</div>}
          </motion.section>
        )}

        {tab === 'Memos' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {memos.map(item => (
              <div key={item.id} className="glass border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-body text-sm text-text-primary">{item.message}</div>
                    <div className="mt-2 font-mono text-[10px] text-muted/60 uppercase tracking-wider">author: {item.author || 'Anonymous'}</div>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <div className="flex gap-2 mt-3">
                  <button disabled={loading} onClick={() => moderate('memos', item.id, MOD_STATUS.APPROVED)} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-green-500/20 text-green-200 border border-green-400/30 disabled:opacity-50">Approve</button>
                  <button disabled={loading} onClick={() => moderate('memos', item.id, MOD_STATUS.REJECTED)} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-red-500/20 text-red-200 border border-red-400/30 disabled:opacity-50">Reject</button>
                </div>
              </div>
            ))}
            {memos.length === 0 && <div className="text-sm text-muted">No memo rows for this filter.</div>}
          </motion.section>
        )}

        {tab === 'Overview' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass p-6 text-center border border-accent-yellow/20 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.06)]">
              <p className="font-archive text-3xl text-accent-yellow mb-2 text-glow">Godmode Dashboard</p>
              <p className="font-body text-sm text-muted/80 max-w-lg mx-auto">
                You have absolute control over the platform. Monitor all content flows and approve or reject submissions from the tabs above.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center border border-text-primary/10 transition-transform hover:scale-105 duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-text-primary/5 opacity-0 hover:opacity-100 transition-opacity" />
                <span className="text-5xl font-archive text-text-primary mb-2 relative z-10">{counts.users}</span>
                <span className="font-mono text-[11px] tracking-widest text-muted/60 uppercase relative z-10">Total Users</span>
              </div>
              
              <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center border border-amber-400/20 shadow-[inset_0_0_15px_rgba(251,191,36,0.07)] transition-transform hover:scale-105 duration-300 relative overflow-hidden cursor-pointer"
                   onClick={() => { setTab('Messages'); setStatusFilter('pending') }}>
                <div className="absolute inset-0 bg-amber-400/5 opacity-0 hover:opacity-100 transition-opacity" />
                <span className="text-5xl font-archive text-amber-200 mb-2 relative z-10">{counts.pendingMessages}</span>
                <span className="font-mono text-[11px] tracking-widest text-amber-200/60 uppercase relative z-10">Pending Notes</span>
              </div>
              
              <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center border border-amber-400/20 shadow-[inset_0_0_15px_rgba(251,191,36,0.07)] transition-transform hover:scale-105 duration-300 relative overflow-hidden cursor-pointer"
                   onClick={() => { setTab('Photos'); setStatusFilter('pending') }}>
                <div className="absolute inset-0 bg-amber-400/5 opacity-0 hover:opacity-100 transition-opacity" />
                <span className="text-5xl font-archive text-amber-200 mb-2 relative z-10">{counts.pendingPhotos}</span>
                <span className="font-mono text-[11px] tracking-widest text-amber-200/60 uppercase relative z-10">Pending Photos</span>
              </div>
              
              <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center border border-amber-400/20 shadow-[inset_0_0_15px_rgba(251,191,36,0.07)] transition-transform hover:scale-105 duration-300 relative overflow-hidden cursor-pointer"
                   onClick={() => { setTab('Memos'); setStatusFilter('pending') }}>
                <div className="absolute inset-0 bg-amber-400/5 opacity-0 hover:opacity-100 transition-opacity" />
                <span className="text-5xl font-archive text-amber-200 mb-2 relative z-10">{counts.pendingMemos}</span>
                <span className="font-mono text-[11px] tracking-widest text-amber-200/60 uppercase relative z-10">Pending Memos</span>
              </div>
            </div>
          </motion.section>
        )}

        {loading && <p className="mt-4 font-mono text-xs text-muted/60">Syncing with database...</p>}
      </div>
    </main>
  )
}
