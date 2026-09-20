import { formatSlideValue, toMasterX } from '@/components/auth/SlideCaptcha'

describe('SlideCaptcha coordinates', () => {
  test('formatSlideValue emits x,y for go-captcha check-data', () => {
    expect(formatSlideValue(120.4, 80.2)).toBe('120,80')
  })

  test('toMasterX maps display pixels back to 300px master canvas', () => {
    // Half-width display (150) at midpoint → master x = 150
    expect(toMasterX(75, 150)).toBe(150)
    expect(toMasterX(300, 300)).toBe(300)
  })
})
