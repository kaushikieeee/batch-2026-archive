import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

const envConfig = dotenv.parse(fs.readFileSync('.env'))
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY)

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { query: `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_socials JSONB DEFAULT '[]'::jsonb;
  ` })
  console.log(error || 'Custom socials column added if not exists')
}
run()
