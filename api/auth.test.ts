import { POST_SIGNIN, POST_SIGNUP, findSession } from '@/api/auth'
import { mmkvStorage } from '@/stores/storage'

describe('local auth api', () => {
  beforeEach(() => {
    mmkvStorage.removeItem('auth:users')
    mmkvStorage.removeItem('auth:session')
  })

  test('signs up and signs in locally', async () => {
    const signup = await POST_SIGNUP({ username: 'alice', password: 'secret1' })
    expect(signup.success).toBe(true)
    expect(signup.data.username).toBe('alice')
    expect(findSession()?.username).toBe('alice')

    mmkvStorage.removeItem('auth:session')
    const signin = await POST_SIGNIN({ username: 'alice', password: 'secret1' })
    expect(signin.success).toBe(true)
    expect(signin.data.token).toContain('local-token')
  })

  test('rejects duplicate username', async () => {
    await POST_SIGNUP({ username: 'bob', password: 'secret1' })
    const again = await POST_SIGNUP({ username: 'bob', password: 'secret1' })
    expect(again.success).toBe(false)
  })
})
