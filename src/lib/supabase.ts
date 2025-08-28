import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'Owner' | 'Manager' | 'Cashier' | 'Auditor'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  org_id: string
  created_at: string
}

export interface Organization {
  id: string
  name: string
  owner_id: string
  org_code: string
  passkey: string
  number_of_shops: number
  created_at: string
}

export interface Shop {
  id: string
  name: string
  location: string
  category: string
  org_id: string
  created_at: string
}

// Generate secure random string for org codes and passkeys
export function generateSecureCode(length: number = 25): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  const randomArray = new Uint8Array(length)
  crypto.getRandomValues(randomArray)
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length]
  }
  
  return result
}