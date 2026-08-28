import FontAwesome from '@expo/vector-icons/FontAwesome'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Redirect, Stack, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-reanimated'

import { useAppColorScheme } from '@/components/useAppColorScheme'
import { useAuthStore } from '@/stores/authStore'
import { subscribeMemoPersistence, useMemoStore } from '@/stores/memoStore'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  ensureAndroidChannel,
  rescheduleAllPending,
  subscribeNotificationResponse
} from '@/services/notifications'

import '@/i18n'
import i18n from '@/i18n'
import '../global.css'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(navigation)'
}

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

function AuthGate({ children }: { children: ReactNode }) {
  const segments = useSegments()
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const userId = useAuthStore((state) => state.userId)
  const memoHydrated = useMemoStore((state) => state.isHydrated)

  useEffect(() => {
    useAuthStore.getState().hydrate()
    useSettingsStore.getState().hydrate()
    ensureAndroidChannel()
  }, [])

  useEffect(() => {
    const language = useSettingsStore.getState().language
    i18n.changeLanguage(language)
  }, [])

  useEffect(() => {
    if (userId && !memoHydrated) {
      useMemoStore.getState().hydrate(userId)
      rescheduleAllPending(useMemoStore.getState().items)
      return subscribeMemoPersistence(userId)
    }
    return undefined
  }, [userId, memoHydrated])

  useEffect(() => {
    return subscribeNotificationResponse(({ itemId, memoId }) => {
      if (memoId) {
        router.push(`/memo/${memoId}`)
        return
      }
      if (itemId) {
        router.push({ pathname: '/checklist/new', params: { itemId } })
      }
    })
  }, [router])

  if (!isHydrated) {
    return null
  }

  const inAuthGroup = segments[0] === '(auth)'

  if (!userId && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />
  }

  if (userId && inAuthGroup) {
    return <Redirect href="/(navigation)" />
  }

  return children
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

function RootLayoutNav() {
  const colorScheme = useAppColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGate>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(navigation)" options={{ headerShown: false }} />
          <Stack.Screen
            name="memo/[id]"
            options={{
              title: 'Memo',
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="checklist/new"
            options={{
              title: 'Task',
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="trash"
            options={{
              title: 'Trash',
              presentation: 'modal'
            }}
          />
        </Stack>
      </AuthGate>
    </ThemeProvider>
  )
}
