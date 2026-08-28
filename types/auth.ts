interface SignInBody {
  email: string
  password: string
}

interface SignUpBody {
  email: string
  password: string
}

interface SignInResult {
  token: string
  id: string
  email: string
}

interface StoredUser {
  id: string
  email: string
  password: string
}

interface Session {
  token: string
  userId: string
  email: string
}

export type { Session, SignInBody, SignInResult, SignUpBody, StoredUser }
