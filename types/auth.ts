interface SignInBody {
  username: string
  password: string
  captchaKey?: string
  captchaValue?: string
  captchaKind?: string
}

interface SignUpBody {
  username: string
  password: string
  captchaKey?: string
  captchaValue?: string
  captchaKind?: string
}

interface AuthUser {
  id: string
  username: string
  role: string
  status: string
  createdAt: number
  updatedAt: number
}

interface SignInResult extends AuthUser {
  token: string
}

interface Profile extends AuthUser {
  email: string | null
  phone: string | null
  gender: string | null
  birthday: string | null
  age: number | null
}

interface Session {
  token: string
  userId: string
  username: string
}

interface StoredLocalUser {
  id: string
  username: string
  password: string
  createdAt: number
  updatedAt: number
}

export type { AuthUser, Profile, Session, SignInBody, SignInResult, SignUpBody, StoredLocalUser }
