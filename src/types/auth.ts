import { User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  loading: boolean
}

export interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
} 