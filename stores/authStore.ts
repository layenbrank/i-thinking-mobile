import { create } from 'zustand'

import { POST_SIGNIN, POST_SIGNOUT, POST_SIGNUP, findSession } from '@/api/auth'
import type { SignInBody, SignUpBody } from '@/types/auth'

interface AuthState {
  userId: string | null
  username: string | null
  token: string | null
  isHydrated: boolean
  isLoading: boolean
  hydrate: () => void
  signIn: (data: SignInBody) => Promise<string | null>
  signUp: (data: SignUpBody) => Promise<string | null>
  signOut: () => Promise<void>
}

const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  username: null,
  token: null,
  isHydrated: false,
  isLoading: false,

  hydrate() {
    const session = findSession()
    if (session) {
      set({
        userId: session.userId,
        username: session.username,
        token: session.token,
        isHydrated: true
      })
      return
    }
    set({ isHydrated: true })
  },

  async signIn(data) {
    set({ isLoading: true })
    try {
      const result = await POST_SIGNIN(data)
      if (!result.success) {
        return result.msg
      }
      set({
        userId: result.data.id,
        username: result.data.username,
        token: result.data.token
      })
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'Sign in failed'
    } finally {
      set({ isLoading: false })
    }
  },

  async signUp(data) {
    set({ isLoading: true })
    try {
      const result = await POST_SIGNUP(data)
      if (!result.success) {
        return result.msg
      }
      set({
        userId: result.data.id,
        username: result.data.username,
        token: result.data.token
      })
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'Sign up failed'
    } finally {
      set({ isLoading: false })
    }
  },

  async signOut() {
    await POST_SIGNOUT(get().token)
    set({ userId: null, username: null, token: null })
  }
}))

export { useAuthStore }
