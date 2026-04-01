import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env vars: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const GODMODE_USERNAME = 'Kaushik S'
export const GODMODE_PASSWORD = 'rashmika_av@124'

const MOD_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

// ── Auth helpers ──────────────────────────────────────────
export async function loginUser(username, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single()
  if (error && /public\.users|schema cache|does not exist/i.test(error.message || '')) {
    if (username === GODMODE_USERNAME && password === GODMODE_PASSWORD) {
      return {
        user: {
          id: 'local-godmode',
          username: GODMODE_USERNAME,
          password: GODMODE_PASSWORD,
          is_admin: true,
        },
        error: null,
      }
    }
  }
  if (error) return { user: null, error }
  return { user: data, error: null }
}

export function isGodmodeUser(user) {
  return Boolean(
    user &&
    user.username === GODMODE_USERNAME &&
    user.password === GODMODE_PASSWORD
  )
}

export async function ensureGodmodeUser() {
  const basePayload = {
    username: GODMODE_USERNAME,
    password: GODMODE_PASSWORD,
  }

  let result = await supabase
    .from('users')
    .upsert({ ...basePayload, is_admin: true, must_change_password: false }, { onConflict: 'username' })
    .select()

  // Support older schemas that do not yet have the is_admin column.
  if (result.error && /is_admin/i.test(result.error.message || '')) {
    result = await supabase
      .from('users')
      .upsert(basePayload, { onConflict: 'username' })
      .select()
  }

  if (result.error && /public\.users|schema cache|does not exist/i.test(result.error.message || '')) {
    return {
      data: null,
      error: new Error('Supabase table "users" is missing. Run the SQL in supabase/create_users_table.sql first.'),
    }
  }

  return { data: result.data, error: result.error }
}

// ── Messages ──────────────────────────────────────────────
export async function getMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('status', MOD_STATUS.APPROVED)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function postMessage({ name, message }) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      name: name || 'Anonymous',
      message,
      created_at: new Date().toISOString(),
      status: MOD_STATUS.APPROVED,
      reviewed_at: null,
      reviewed_by: null,
    }])
    .select()
  return { data, error }
}

// ── Media ─────────────────────────────────────────────────
import imageCompression from 'browser-image-compression'

export async function uploadFile(file, bucket = 'batchof2026') {
  try {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true
    }
    const compressedFile = await imageCompression(file, options)
    
    const fileExt = compressedFile.name.split('.').pop() || 'jpg'
    const fileName = `${Math.random().toString(36).substring(7)}-${Date.now()}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile)

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return { data: { publicUrl: data.publicUrl }, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function getMedia(year = null) {
  let query = supabase
    .from('media')
    .select('*')
    .eq('status', MOD_STATUS.APPROVED)
    .order('created_at', { ascending: false })
  if (year) query = query.eq('year', year)
  const { data, error } = await query
  return { data, error }
}

export async function postMedia({ type, url, year }) {
  const { data, error } = await supabase
    .from('media')
    .insert([{
      type: type || 'image',
      url,
      year: year || 'All',
      status: MOD_STATUS.APPROVED,
      reviewed_at: null,
      reviewed_by: null,
      created_at: new Date().toISOString(),
    }])
    .select()
  return { data, error }
}

// ── Yearbook ──────────────────────────────────────────────
export async function getStudents() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name')
  return { data, error }
}

export async function postStudent(payload) {
  const { data, error } = await supabase
    .from('users')
    .insert([payload])
    .select()
  return { data, error }
}

export async function updateUserProfile(id, payload) {
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', id)
    .select()
  return { data, error }
}

export async function deleteUserProfileData(id) {
  const defaultPayload = {
    name: 'Anonymous Student',
    section: null,
    role: null,
    quote: null,
    bio: null,
    phone: null,
    instagram: null,
    snapchat: null,
    linkedin: null,
    email: null,
    image: null,
    signature_url: null,
    time_capsule: null,
  };
  const { data, error } = await supabase
    .from('users')
    .update(defaultPayload)
    .eq('id', id)
    .select()
  return { data, error }
}

export async function changePassword(id, newPassword) {
  const { data, error } = await supabase
    .from('users')
    .update({ password: newPassword, must_change_password: false })
    .eq('id', id)
    .select()
  return { data, error }
}

export async function getStudentMessages(studentId) {
  const { data, error } = await supabase
    .from('student_messages')
    .select('*')
    .eq('student_id', studentId)
    .eq('status', MOD_STATUS.APPROVED)
  return { data, error }
}

export async function postStudentMessage({ studentId, message, author }) {
  const { data, error } = await supabase
    .from('student_messages')
    .insert([{
      student_id: studentId,
      message,
      author: author || 'Anonymous',
      status: MOD_STATUS.APPROVED,
      reviewed_at: null,
      reviewed_by: null,
      created_at: new Date().toISOString(),
    }])
    .select()
  return { data, error }
}

// ── Admin: users ─────────────────────────────────────────
export async function getAdminUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('username')
  return { data, error }
}

export async function createSingleUser(payload) {
  const { data, error } = await supabase
    .from('users')
    .insert([payload])
    .select()
  return { data, error }
}

export async function createUsersBulk(rows) {
  const { data, error } = await supabase
    .from('users')
    .insert(rows)
    .select()
  return { data, error }
}

// ── Admin: moderation ────────────────────────────────────
export async function getAllMessagesForAdmin(status = 'all') {
  let query = supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)
  const { data, error } = await query
  return { data, error }
}

export async function reviewMessage({ id, status, adminUsername }) {
  const { data, error } = await supabase
    .from('messages')
    .update({
      status,
      reviewed_by: adminUsername || 'admin',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
  return { data, error }
}

export async function getAllMediaForAdmin(status = 'all') {
  let query = supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)
  const { data, error } = await query
  return { data, error }
}

export async function reviewMedia({ id, status, adminUsername }) {
  const { data, error } = await supabase
    .from('media')
    .update({
      status,
      reviewed_by: adminUsername || 'admin',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
  return { data, error }
}

export async function getAllStudentMessagesForAdmin(status = 'all') {
  let query = supabase
    .from('student_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)
  const { data, error } = await query
  return { data, error }
}

export async function reviewStudentMessage({ id, status, adminUsername }) {
  const { data, error } = await supabase
    .from('student_messages')
    .update({
      status,
      reviewed_by: adminUsername || 'admin',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
  return { data, error }
}

export { MOD_STATUS }

// ====== DIRECT MESSAGES LOGIC (SLAMBOOK) ======

export async function getDirectMessages(myId, peerId) {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${myId},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${myId})`)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function sendDirectMessage(senderId, receiverId, content) {
  const { data, error } = await supabase
    .from('direct_messages')
    .insert([{ sender_id: senderId, receiver_id: receiverId, content }])
    .select()
  return { data, error }
}

export async function getGroupMessages() {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .is('receiver_id', null)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function sendGroupMessage(senderId, content) {
  const { data, error } = await supabase
    .from('direct_messages')
    .insert([{ sender_id: senderId, receiver_id: null, content }])
    .select()
  return { data, error }
}

export function subscribeToGroupMessages(callback) {
  return supabase.channel(`group_chat`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'direct_messages',
      filter: 'receiver_id=is.null' 
    }, payload => {
       callback(payload.new)
    })
    .subscribe()
}

export async function getAllDirectMessagesForAdmin() {
  const { data, error } = await supabase
    .from('direct_messages')
    .select(`
      id,
      content,
      created_at,
      sender:users!direct_messages_sender_id_fkey(name),
      receiver:users!direct_messages_receiver_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
  return { data, error }
}

export function subscribeToMessages(myId, callback) {
  return supabase.channel(`dms_${myId}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'direct_messages',
      filter: `receiver_id=eq.${myId}` 
    }, payload => {
       callback(payload.new)
    })
    .subscribe()
}

export function trackPresence(userId, name, callback) {
  const room = supabase.channel('online_users', { config: { presence: { key: userId.toString() } } })
  
  room.on('presence', { event: 'sync' }, () => {
     const state = room.presenceState()
     callback(state)
  }).subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
       await room.track({ id: userId, name: name, online_at: new Date().toISOString() })
    }
  })

  return room
}

