import { createHash } from 'crypto'

import { hashPassword, isHashedPassword, verifyPassword } from '@/services/password'

describe('password', () => {
  test('hashes and verifies passwords', async () => {
    const stored = await hashPassword('secret1')
    expect(isHashedPassword(stored)).toBe(true)
    expect(await verifyPassword('secret1', stored)).toBe(true)
    expect(await verifyPassword('wrong', stored)).toBe(false)
  })

  test('verifies legacy salt:digest format', async () => {
    const salt = 'abcd'
    const digest = createHash('sha256').update(`${salt}:secret1`).digest('hex')
    const legacy = `${salt}:${digest}`
    expect(isHashedPassword(legacy)).toBe(true)
    expect(await verifyPassword('secret1', legacy)).toBe(true)
    expect(await verifyPassword('wrong', legacy)).toBe(false)
  })
})
