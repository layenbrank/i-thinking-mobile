import { create } from 'zustand'

import { POST_SIGNIN, POST_SIGNOUT, POST_SIGNUP, findSession } from '@/api/auth'
import type { SignInBody, SignUpBody } from '@/types/auth'

interface AuthState {
  userId: string | null
  email: string | null
  token: string | null
  isHydrated: boolean
  isLoading: boolean
  hydrate: () => void
  signIn: (data: SignInBody) => Promise<string | null>
  signUp: (data: SignUpBody) => Promise<string | null>
  signOut: () => Promise<void>
}

const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  token: null,
  isHydrated: false,
  isLoading: false,

  hydrate() {
    const session = findSession()
    if (session) {
      set({
        userId: session.userId,
        email: session.email,
        token: session.token,
        isHydrated: true
      })
      return
    }
    set({ isHydrated: true })
  },

  async signIn(data) {
    set({ isLoading: true })
    const result = await POST_SIGNIN(data)
    set({ isLoading: false })
    if (result.code !== 0) {
      return result.message
    }
    set({
      userId: result.data.id,
      email: result.data.email,
      token: result.data.token
    })
    return null
  },

  async signUp(data) {
    set({ isLoading: true })
    const result = await POST_SIGNUP(data)
    set({ isLoading: false })
    if (result.code !== 0) {
      return result.message
    }
    set({
      userId: result.data.id,
      email: result.data.email,
      token: result.data.token
    })
    return null
  },

  async signOut() {
    await POST_SIGNOUT()
    set({ userId: null, email: null, token: null })
  }
}))

export { useAuthStore }
