import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rbgpndbfywmdrnfttzdp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZ3BuZGJmeXdtZHJuZnR0emRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDExMjMsImV4cCI6MjA3NjExNzEyM30.1Q7sli3450CFPf3JMKK2J6CCeJacaq2TElC6TkN01Wk'

export const supabase = createClient(supabaseUrl, supabaseKey)
