import { mmkvStorage } from '@/stores/storage'
import type { Session, SignInBody, SignInResult, SignUpBody, StoredUser } from '@/types/auth'
import type { RSF } from '@/types/response'

const USERS_KEY = 'auth:users'
const SESSION_KEY = 'auth:session'
const MOCK_DELAY_MS = 350

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

function readUsers(): StoredUser[] {
  const raw = mmkvStorage.getItem(USERS_KEY)
  if (!raw) {
    return []
  }
  return JSON.parse(raw) as StoredUser[]
}

function writeUsers(users: StoredUser[]) {
  mmkvStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function createToken(userId: string) {
  return `mock-token-${userId}-${Date.now()}`
}

function fail<T>(code: number, message: string): Promise<RSF<T>> {
  return Promise.resolve({ code, message, data: null as T })
}

async function POST_SIGNUP(data: SignUpBody): Promise<RSF<SignInResult>> {
  await delay(MOCK_DELAY_MS)

  const email = data.email.trim().toLowerCase()
  if (!email || !data.password) {
    return fail(400, 'Email and password are required')
  }

  const users = readUsers()
  if (users.some((user) => user.email === email)) {
    return fail(409, 'Email already registered')
  }

  const user: StoredUser = {
    id: `user-${Date.now()}`,
    email,
    password: data.password
  }
  users.push(user)
  writeUsers(users)

  const token = createToken(user.id)
  const session: Session = { token, userId: user.id, email: user.email }
  mmkvStorage.setItem(SESSION_KEY, JSON.stringify(session))

  return {
    code: 0,
    message: 'ok',
    data: { token, id: user.id, email: user.email }
  }
}

async function POST_SIGNIN(data: SignInBody): Promise<RSF<SignInResult>> {
  await delay(MOCK_DELAY_MS)

  const email = data.email.trim().toLowerCase()
  const user = readUsers().find((item) => item.email === email)

  if (!user || user.password !== data.password) {
    return fail(401, 'Invalid email or password')
  }

  const token = createToken(user.id)
  const session: Session = { token, userId: user.id, email: user.email }
  mmkvStorage.setItem(SESSION_KEY, JSON.stringify(session))

  return {
    code: 0,
    message: 'ok',
    data: { token, id: user.id, email: user.email }
  }
}

async function POST_SIGNOUT(): Promise<void> {
  await delay(100)
  mmkvStorage.removeItem(SESSION_KEY)
}

function findSession(): Session | null {
  const raw = mmkvStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }
  return JSON.parse(raw) as Session
}

export { POST_SIGNIN, POST_SIGNOUT, POST_SIGNUP, findSession }
