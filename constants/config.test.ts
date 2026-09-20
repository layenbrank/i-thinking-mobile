import { Platform } from 'react-native'

import {
  findApiBaseUrl,
  findDevApiBaseUrl,
  isLoopbackHost,
  rewriteLoopbackBaseUrl
} from '@/constants/config'

describe('findApiBaseUrl', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL
  const originalOs = Platform.OS

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv
    }
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOs })
  })

  test('isLoopbackHost recognizes localhost aliases', () => {
    expect(isLoopbackHost('127.0.0.1')).toBe(true)
    expect(isLoopbackHost('localhost')).toBe(true)
    expect(isLoopbackHost('192.168.1.8')).toBe(false)
  })

  test('rewrites loopback to Android emulator gateway', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' })
    expect(rewriteLoopbackBaseUrl('http://127.0.0.1:3000', null)).toBe('http://10.0.2.2:3000')
  })

  test('rewrites loopback to Expo packager LAN host on device', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' })
    expect(rewriteLoopbackBaseUrl('http://127.0.0.1:3000', '192.168.1.8')).toBe(
      'http://192.168.1.8:3000'
    )
  })

  test('keeps explicit non-loopback base URL', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://10.0.0.5:3000/'
    expect(findApiBaseUrl()).toBe('http://10.0.0.5:3000')
  })

  test('findDevApiBaseUrl prefers packager host', () => {
    expect(findDevApiBaseUrl('10.0.0.3')).toBe('http://10.0.0.3:3000')
  })

  test('findDevApiBaseUrl uses Android emulator gateway without packager', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' })
    expect(findDevApiBaseUrl(null)).toBe('http://10.0.2.2:3000')
  })
})
