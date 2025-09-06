import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url) {
  throw new Error('VITE_SUPABASE_URL is required')
}
if (!anon) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required')
}

export const supabase = createClient<Database>(url, anon)

