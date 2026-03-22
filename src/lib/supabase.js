import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lsbpnfzqwihyhmsfbhxy.supabase.co'
const supabaseKey = 'sb_publishable_JkSJNuDQHnvEeh2KLmxpkw_s8pGpw4o'

export const supabase = createClient(supabaseUrl, supabaseKey)
