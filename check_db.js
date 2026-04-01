import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

const envConfig = dotenv.parse(fs.readFileSync('.env'))
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY)

async function check() {
  const { data, error } = await supabase.from('users').select('name, signature_url').not('signature_url', 'is', null)
  console.log(data)
}
check()
