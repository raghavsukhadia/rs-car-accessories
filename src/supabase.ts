// src/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database' // if this path errors, use '../types/database'

const url  = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

if (!url || !anon) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(url, anon)
