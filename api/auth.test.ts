import { mmkvStorage } from '@/stores/storage'
import { POST_SIGNIN, POST_SIGNOUT, POST_SIGNUP } from '@/api/auth'

describe('auth api', () => {
  beforeEach(() => {
    mmkvStorage.removeItem('auth:users')
    mmkvStorage.removeItem('auth:session')
  })

  test('POST_SIGNUP registers and signs in', async () => {
    const result = await POST_SIGNUP({ email: 'test@example.com', password: 'secret1' })
    expect(result.code).toBe(0)
    expect(result.data.email).toBe('test@example.com')
  })

  test('POST_SIGNUP rejects duplicate email', async () => {
    await POST_SIGNUP({ email: 'dup@example.com', password: 'secret1' })
    const result = await POST_SIGNUP({ email: 'dup@example.com', password: 'secret2' })
    expect(result.code).toBe(409)
  })

  test('POST_SIGNIN validates credentials', async () => {
    await POST_SIGNUP({ email: 'user@example.com', password: 'secret1' })
    const ok = await POST_SIGNIN({ email: 'user@example.com', password: 'secret1' })
    const bad = await POST_SIGNIN({ email: 'user@example.com', password: 'wrong' })
    expect(ok.code).toBe(0)
    expect(bad.code).toBe(401)
  })

  test('POST_SIGNOUT clears session', async () => {
    await POST_SIGNUP({ email: 'out@example.com', password: 'secret1' })
    await POST_SIGNOUT()
    expect(mmkvStorage.getItem('auth:session')).toBeNull()
  })
})
