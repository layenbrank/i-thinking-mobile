import { DELETE_ACCOUNT } from '@/api/auth'
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
  deleteAccount: () => Promise<string | null>
}

const useAuthStore = create<AuthState>((set, get) => ({
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
    try {
      const result = await POST_SIGNIN(data)
      if (result.code !== 0) {
        return result.message
      }
      set({
        userId: result.data.id,
        email: result.data.email,
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
      if (result.code !== 0) {
        return result.message
      }
      set({
        userId: result.data.id,
        email: result.data.email,
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
    await POST_SIGNOUT()
    set({ userId: null, email: null, token: null })
  },

  async deleteAccount() {
    const userId = get().userId
    if (!userId) {
      return 'Not signed in'
    }
    set({ isLoading: true })
    const result = await DELETE_ACCOUNT(userId)
    set({ isLoading: false, userId: null, email: null, token: null })
    if (result.code !== 0) {
      return result.message
    }
    return null
  }
}))

export { useAuthStore }
