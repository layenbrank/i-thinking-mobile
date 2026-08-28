import { fireEvent, render, waitFor } from '@testing-library/react-native'

import LoginScreen from '@/app/(auth)/login'

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  Link: ({ children }: { children: React.ReactNode }) => children
}))

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (state: { signIn: jest.Mock; isLoading: boolean }) => unknown) =>
    selector({
      signIn: jest.fn(async () => 'Invalid email or password'),
      isLoading: false
    })
}))

describe('LoginScreen', () => {
  test('shows validation error on empty submit', async () => {
    const { getByText } = render(<LoginScreen />)

    fireEvent.press(getByText('登录'))

    await waitFor(() => {
      expect(getByText('邮箱格式不正确')).toBeTruthy()
    })
  })
})
