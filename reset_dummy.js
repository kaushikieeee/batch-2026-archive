import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

const envConfig = dotenv.parse(fs.readFileSync('.env.local'))
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY)

async function run() {
  const { error } = await supabase
    .from('users')
    .update({ 
      password: 'dummy123', 
      must_change_password: true,
      image: null,
      signature_url: null,
      website: null,
      dob: null,
      bio: null
    })
    .eq('username', 'dummy')
  
  if (error) console.error(error)
  else console.log('✅ Dummy user successfully reset! You can now log in as dummy / dummy123 again to test the onboarding wizard.')
}
run()
