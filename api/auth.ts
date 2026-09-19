import { API_PATHS, API_SUCCESS_CODE, CAPTCHA_PLACEHOLDER } from '@/constants/api'
import { findAuthMode } from '@/constants/config'
import { ApiError, isApiSuccess, requestJson } from '@/api/http'
import { hashPassword, isHashedPassword, verifyPassword } from '@/services/password'
import { mmkvStorage } from '@/stores/storage'
import type {
  Profile,
  Session,
  SignInBody,
  SignInResult,
  SignUpBody,
  StoredLocalUser
} from '@/types/auth'
import type { RSF } from '@/types/response'

const USERS_KEY = 'auth:users'
const SESSION_KEY = 'auth:session'

function envelope<T>(data: T, msg = 'ok'): RSF<T> {
  return {
    code: API_SUCCESS_CODE,
    success: true,
    msg,
    data,
    timestamp: Date.now()
  }
}

function fail<T>(code: number, msg: string): RSF<T> {
  return {
    code,
    success: false,
    msg,
    data: null as T,
    timestamp: Date.now()
  }
}

function readUsers(): StoredLocalUser[] {
  const raw = mmkvStorage.getItem(USERS_KEY)
  if (!raw) {
    return []
  }
  return JSON.parse(raw) as StoredLocalUser[]
}

function writeUsers(users: StoredLocalUser[]) {
  mmkvStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function writeSession(session: Session) {
  mmkvStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearSession() {
  mmkvStorage.removeItem(SESSION_KEY)
}

function findSession(): Session | null {
  const raw = mmkvStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }
  return JSON.parse(raw) as Session
}

function withCaptcha(body: SignInBody | SignUpBody) {
  return {
    username: body.username.trim(),
    password: body.password,
    captchaKey: body.captchaKey ?? CAPTCHA_PLACEHOLDER.captchaKey,
    captchaValue: body.captchaValue ?? CAPTCHA_PLACEHOLDER.captchaValue,
    captchaKind: body.captchaKind
  }
}

async function POST_SIGNUP_LOCAL(data: SignUpBody): Promise<RSF<SignInResult>> {
  const username = data.username.trim()
  if (!username || !data.password) {
    return fail(400001, 'Username and password are required')
  }

  const users = readUsers()
  if (users.some((user) => user.username === username)) {
    return fail(409001, 'Username already registered')
  }

  const now = Date.now()
  const user: StoredLocalUser = {
    id: `local-${now}`,
    username,
    password: await hashPassword(data.password),
    createdAt: now,
    updatedAt: now
  }
  users.push(user)
  writeUsers(users)

  const token = `local-token-${user.id}`
  writeSession({ token, userId: user.id, username: user.username })

  return envelope({
    token,
    id: user.id,
    username: user.username,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  })
}

async function POST_SIGNIN_LOCAL(data: SignInBody): Promise<RSF<SignInResult>> {
  const username = data.username.trim()
  const user = readUsers().find((item) => item.username === username)
  if (!user || !(await verifyPassword(data.password, user.password))) {
    return fail(401001, 'Invalid username or password')
  }

  if (!isHashedPassword(user.password)) {
    user.password = await hashPassword(data.password)
    writeUsers(readUsers().map((entry) => (entry.id === user.id ? user : entry)))
  }

  const token = `local-token-${user.id}`
  writeSession({ token, userId: user.id, username: user.username })

  return envelope({
    token,
    id: user.id,
    username: user.username,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  })
}

async function POST_SIGNUP(data: SignUpBody): Promise<RSF<SignInResult>> {
  if (findAuthMode() === 'local') {
    return POST_SIGNUP_LOCAL(data)
  }

  try {
    const result = await requestJson<SignInResult>(API_PATHS.AUTH_SIGNUP, {
      method: 'POST',
      body: withCaptcha(data)
    })
    if (isApiSuccess(result.code) && result.data?.token) {
      writeSession({
        token: result.data.token,
        userId: result.data.id,
        username: result.data.username
      })
    }
    return result
  } catch (error) {
    if (error instanceof ApiError) {
      return fail(error.code, error.message)
    }
    return fail(500000, error instanceof Error ? error.message : 'Sign up failed')
  }
}

async function POST_SIGNIN(data: SignInBody): Promise<RSF<SignInResult>> {
  if (findAuthMode() === 'local') {
    return POST_SIGNIN_LOCAL(data)
  }

  try {
    const result = await requestJson<SignInResult>(API_PATHS.AUTH_SIGNIN, {
      method: 'POST',
      body: withCaptcha(data)
    })
    if (isApiSuccess(result.code) && result.data?.token) {
      writeSession({
        token: result.data.token,
        userId: result.data.id,
        username: result.data.username
      })
    }
    return result
  } catch (error) {
    if (error instanceof ApiError) {
      return fail(error.code, error.message)
    }
    return fail(500000, error instanceof Error ? error.message : 'Sign in failed')
  }
}

async function POST_SIGNOUT(token?: string | null): Promise<RSF<null>> {
  if (findAuthMode() === 'remote' && token) {
    try {
      await requestJson<null>(API_PATHS.AUTH_SIGNOUT, {
        method: 'POST',
        token
      })
    } catch {
      // Local session is cleared regardless of remote outcome.
    }
  }
  clearSession()
  return envelope(null)
}

async function GET_PROFILE(token: string): Promise<RSF<Profile>> {
  if (findAuthMode() === 'local') {
    const session = findSession()
    if (!session || session.token !== token) {
      return fail(401000, 'Unauthorized')
    }
    const user = readUsers().find((item) => item.id === session.userId)
    if (!user) {
      return fail(401000, 'Unauthorized')
    }
    return envelope({
      id: user.id,
      username: user.username,
      role: 'USER',
      status: 'ACTIVE',
      email: null,
      phone: null,
      gender: null,
      birthday: null,
      age: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  }

  return requestJson<Profile>(API_PATHS.AUTH_PROFILE, { token })
}

export { GET_PROFILE, POST_SIGNIN, POST_SIGNOUT, POST_SIGNUP, findSession }
