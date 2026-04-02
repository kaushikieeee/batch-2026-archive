import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

const envConfig = dotenv.parse(fs.readFileSync('.env.local'))
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY)

async function run() {
  const { data: mediaItems, error: mediaError } = await supabase.from('media').select('*').limit(1)
  if (mediaError) console.error(mediaError)
  else console.log('media columns:', Object.keys(mediaItems[0] || {}))

  // And let's try calling reviewMedia logic
  if(mediaItems && mediaItems.length > 0) {
     const { data, error } = await supabase.from('media').update({
        status: 'approved',
        reviewed_by: 'admin',
        reviewed_at: new Date().toISOString(),
      }).eq('id', mediaItems[0].id).select()
     console.log('Update result:', { data, error })
  }
}
run()
