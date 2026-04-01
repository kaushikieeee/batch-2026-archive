import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env vars: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Auth helpers ──────────────────────────────────────────
export async function loginUser(username, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single()
  if (error) return { user: null, error }
  return { user: data, error: null }
}

// ── Messages ──────────────────────────────────────────────
export async function getMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function postMessage({ name, message }) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ name: name || 'Anonymous', message, created_at: new Date().toISOString() }])
    .select()
  return { data, error }
}

// ── Media ─────────────────────────────────────────────────
export async function getMedia(year = null) {
  let query = supabase.from('media').select('*').order('created_at', { ascending: false })
  if (year) query = query.eq('year', year)
  const { data, error } = await query
  return { data, error }
}

// ── Yearbook ──────────────────────────────────────────────
export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('name')
  return { data, error }
}

export async function getStudentMessages(studentId) {
  const { data, error } = await supabase
    .from('student_messages')
    .select('*')
    .eq('student_id', studentId)
  return { data, error }
}
