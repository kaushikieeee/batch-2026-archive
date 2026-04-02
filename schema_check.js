import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import fs from "fs"
const envConfig = dotenv.parse(fs.readFileSync(".env.local"))
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY)
async function go() {
  const { data, error } = await supabase.from("users").select("*").limit(1)
  if (data && data.length) console.log(Object.keys(data[0]))
  else console.error(error)
}
go()
