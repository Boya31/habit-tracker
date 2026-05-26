import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://paotuzzpmrgvcnksxayq.supabase.co'
const supabaseKey = 'sb_publishable_p_yneB2T9YSmeho11T50yA_2gXxmG39' 

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)