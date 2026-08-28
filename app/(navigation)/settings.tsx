import { useFocusEffect } from '@react-navigation/native'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { Settings } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, Platform, Pressable, Text, View } from 'react-native'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { Screen } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SettingsLinkRow, SwitchRow } from '@/components/ui/SwitchRow'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { exportUserData } from '@/services/export'
import { pickAndImportBackup } from '@/services/import'
import {
  canScheduleExactNotifications,
  cancelAllReminders,
  findNotificationPermissionStatus,
  requestNotificationPermissions
} from '@/services/notifications'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { useMemoStore } from '@/stores/memoStore'
import type { LanguagePreference, ThemePreference } from '@/stores/settingsStore'
import { useSettingsStore } from '@/stores/settingsStore'

export default function SettingsScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const email = useAuthStore((state) => state.email)
  const userId = useAuthStore((state) => state.userId)
  const signOut = useAuthStore((state) => state.signOut)
  const deleteAccount = useAuthStore((state) => state.deleteAccount)
  const theme = useSettingsStore((state) => state.theme)
  const language = useSettingsStore((state) => state.language)
  const hideCompleted = useSettingsStore((state) => state.hideCompleted)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const setLanguage = useSettingsStore((state) => state.setLanguage)
  const setHideCompleted = useSettingsStore((state) => state.setHideCompleted)
  const items = useMemoStore((state) => state.items)
  const memos = useMemoStore((state) => state.memos)
  const lists = useMemoStore((state) => state.lists)
  const replaceData = useMemoStore((state) => state.replaceData)
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
    setTheme(order[(order.indexOf(theme) + 1) % order.length])
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

  async function handleExport() {
    await exportUserData({ version: 2, memos, items, lists })
  }

  async function handleImport() {
    const data = await pickAndImportBackup()
    if (!data) {
      return
    }
    replaceData(data)
    Alert.alert(t('settings'), t('importSuccess'))
  }

  async function handleDeleteAccount() {
    Alert.alert(t('deleteAccount'), t('deleteAccountConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteAccount'),
        style: 'destructive',
        onPress: async () => {
          await cancelAllReminders(items)
          const error = await deleteAccount()
          if (error) {
            Alert.alert(t('deleteAccount'), error)
            return
          }
          clearUserData()
          router.replace('/(auth)/login')
        }
      }
    ])
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

        <SwitchRow label={t('hideCompleted')} onValueChange={setHideCompleted} value={hideCompleted} />

        <SettingsLinkRow label={t('notifications')} onPress={requestNotificationPermissions} value={permissionLabel(permissionStatus)} />
        <SettingsLinkRow label={t('trash')} onPress={() => router.push('/trash')} />
        <SettingsLinkRow label={t('exportData')} onPress={handleExport} />
        <SettingsLinkRow label={t('importData')} onPress={handleImport} />

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
            {exactAlarmEnabled !== true ? (
              <Pressable accessibilityRole="button" className="min-h-[44px] justify-center active:opacity-70" onPress={() => Linking.openSettings()}>
                <Text className="text-sm font-semibold" style={{ color: colors.tint }}>
                  {t('openSettings')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <SettingsLinkRow label={t('theme')} onPress={cycleTheme} value={themeLabel(theme)} />
        <SettingsLinkRow label={t('language')} onPress={cycleLanguage} value={language === 'zh' ? '中文' : 'English'} />

        <View
          className="rounded-xl border px-4 py-3"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            {t('about')}
          </Text>
          <Text className="mt-1 text-base font-medium" style={{ color: colors.text }}>
            {t('version')} {Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </View>

        <PrimaryButton label={t('signOut')} onPress={handleSignOut} />
        <PrimaryButton label={t('deleteAccount')} onPress={handleDeleteAccount} />
      </View>
    </Screen>
  )
}
