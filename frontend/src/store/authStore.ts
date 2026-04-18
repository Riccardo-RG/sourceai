import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface AuthStore {
  user: User | null
  loading: boolean
  initialized: boolean
  initialize: () => void
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: () => {
    const sb = createClient()
    sb.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, initialized: true })
    })
    sb.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, initialized: true })
    })
  },

  signUp: async (email, password) => {
    set({ loading: true })
    const sb = createClient()
    const { data, error } = await sb.auth.signUp({ email, password })
    set({ loading: false })
    // Supabase returns user: null (no error) when email is already registered
    if (!error && !data.user) {
      return { error: 'Questa email è già registrata. Prova ad accedere o usa Google.' }
    }
    return { error: error?.message ?? null }
  },

  signIn: async (email, password) => {
    set({ loading: true })
    const sb = createClient()
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    set({ loading: false, user: data.user ?? null })
    return { error: error?.message ?? null }
  },

  signInWithGoogle: async () => {
    const sb = createClient()
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  },

  signOut: async () => {
    const sb = createClient()
    await sb.auth.signOut()
    set({ user: null })
  },
}))
