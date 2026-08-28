import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, Platform, Pressable, Text, View } from 'react-native'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { Screen } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SettingsLinkRow } from '@/components/ui/SwitchRow'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { useAuthStore } from '@/stores/authStore'
import type { LanguagePreference, ThemePreference } from '@/stores/settingsStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useMemoStore } from '@/stores/memoStore'
import {
  canScheduleExactNotifications,
  cancelAllReminders,
  findNotificationPermissionStatus,
  requestNotificationPermissions
} from '@/services/notifications'
import i18n from '@/i18n'
import { Settings } from 'lucide-react-native'
import { router } from 'expo-router'

export default function SettingsScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const email = useAuthStore((state) => state.email)
  const userId = useAuthStore((state) => state.userId)
  const signOut = useAuthStore((state) => state.signOut)
  const theme = useSettingsStore((state) => state.theme)
  const language = useSettingsStore((state) => state.language)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const setLanguage = useSettingsStore((state) => state.setLanguage)
  const items = useMemoStore((state) => state.items)
  const clearUserData = useMemoStore((state) => state.clearUserData)

  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined')
  const [exactAlarmEnabled, setExactAlarmEnabled] = useState<boolean | null>(null)

  const refreshStatus = useCallback(async () => {
    setPermissionStatus(await findNotificationPermissionStatus())
    setExactAlarmEnabled(await canScheduleExactNotifications())
  }, [])

  useFocusEffect(
    useCallback(() => {
      refreshStatus()
    }, [refreshStatus])
  )

  function permissionLabel(status: typeof permissionStatus) {
    if (status === 'granted') return t('permissionGranted')
    if (status === 'denied') return t('permissionDenied')
    return t('permissionUndetermined')
  }

  function cycleTheme() {
    const order: ThemePreference[] = ['system', 'light', 'dark']
    const index = order.indexOf(theme)
    setTheme(order[(index + 1) % order.length])
  }

  function themeLabel(value: ThemePreference) {
    if (value === 'light') return t('themeLight')
    if (value === 'dark') return t('themeDark')
    return t('themeSystem')
  }

  function cycleLanguage() {
    const next: LanguagePreference = language === 'zh' ? 'en' : 'zh'
    setLanguage(next)
    i18n.changeLanguage(next)
  }

  async function handleRequestPermission() {
    const granted = await requestNotificationPermissions()
    setPermissionStatus(granted ? 'granted' : 'denied')
  }

  async function handleSignOut() {
    Alert.alert(t('signOut'), email ?? '', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('signOut'),
        style: 'destructive',
        onPress: async () => {
          await cancelAllReminders(items)
          await signOut()
          clearUserData()
          if (userId) {
            // storage key remains but session cleared; next login re-hydrates own data
          }
          router.replace('/(auth)/login')
        }
      }
    ])
  }

  return (
    <Screen scroll>
      <SectionHeader icon={Settings} title={t('settings')} description={email ?? ''} />

      <View className="gap-3">
        <View
          className="rounded-xl border px-4 py-3"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            {t('account')}
          </Text>
          <Text className="mt-1 text-base font-medium" style={{ color: colors.text }}>
            {email}
          </Text>
        </View>

        <SettingsLinkRow
          label={t('notifications')}
          onPress={handleRequestPermission}
          value={permissionLabel(permissionStatus)}
        />

        {Platform.OS === 'android' ? (
          <View
            className="gap-2 rounded-xl border px-4 py-3"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
            <Text className="text-base font-medium" style={{ color: colors.text }}>
              {t('exactAlarm')}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {t('exactAlarmHint')}
            </Text>
            <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
              {exactAlarmEnabled === null ? t('permissionUndetermined') : exactAlarmEnabled ? t('permissionGranted') : t('permissionDenied')}
            </Text>
            {exactAlarmEnabled !== true ? (
              <Pressable
                accessibilityRole="button"
                className="min-h-[44px] justify-center active:opacity-70"
                onPress={() => Linking.openSettings()}>
                <Text className="text-sm font-semibold" style={{ color: colors.tint }}>
                  {t('openSettings')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <SettingsLinkRow label={t('theme')} onPress={cycleTheme} value={themeLabel(theme)} />
        <SettingsLinkRow label={t('language')} onPress={cycleLanguage} value={language === 'zh' ? '中文' : 'English'} />

        <PrimaryButton label={t('signOut')} onPress={handleSignOut} />
      </View>
    </Screen>
  )
}
