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

/**
 * Builds a one-letter avatar initial from an email address.
 */
function findAvatarInitial(email: string | null) {
  if (!email) {
    return '?'
  }
  const local = email.split('@')[0]?.trim()
  return (local?.[0] ?? email[0] ?? '?').toUpperCase()
}

export default function SettingsScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const email = useAuthStore((state) => state.email)
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

  function themeLabel(value: ThemePreference) {
    if (value === 'light') return t('themeLight')
    if (value === 'dark') return t('themeDark')
    return t('themeSystem')
  }

  function languageLabel(value: LanguagePreference) {
    return value === 'zh' ? '中文' : 'English'
  }

  function pickTheme() {
    Alert.alert(t('theme'), t('chooseOption'), [
      {
        text: t('themeSystem'),
        onPress: () => setTheme('system')
      },
      {
        text: t('themeLight'),
        onPress: () => setTheme('light')
      },
      {
        text: t('themeDark'),
        onPress: () => setTheme('dark')
      },
      { text: t('cancel'), style: 'cancel' }
    ])
  }

  function pickLanguage() {
    Alert.alert(t('language'), t('chooseOption'), [
      {
        text: '中文',
        onPress: () => {
          setLanguage('zh')
          i18n.changeLanguage('zh')
        }
      },
      {
        text: 'English',
        onPress: () => {
          setLanguage('en')
          i18n.changeLanguage('en')
        }
      },
      { text: t('cancel'), style: 'cancel' }
    ])
  }

  async function handleNotifications() {
    if (permissionStatus === 'undetermined') {
      await requestNotificationPermissions()
      await refreshStatus()
      return
    }

    Alert.alert(t('notifications'), permissionLabel(permissionStatus), [
      {
        text: t('openSettings'),
        onPress: () => Linking.openSettings()
      },
      ...(permissionStatus !== 'granted'
        ? [
            {
              text: t('requestPermission'),
              onPress: async () => {
                await requestNotificationPermissions()
                await refreshStatus()
              }
            }
          ]
        : []),
      { text: t('cancel'), style: 'cancel' as const }
    ])
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

  const avatarInitial = findAvatarInitial(email)

  return (
    <Screen scroll>
      <SectionHeader icon={Settings} title={t('settings')} />

      <View className="gap-3">
        <View
          className="flex-row items-center gap-3 rounded-xl border px-4 py-4"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <View
            accessibilityLabel={t('account')}
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.tint }}>
            <Text className="text-xl font-bold text-white">{avatarInitial}</Text>
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {t('account')}
            </Text>
            <Text className="text-base font-semibold" numberOfLines={1} style={{ color: colors.text }}>
              {email ?? '—'}
            </Text>
          </View>
        </View>

        <SwitchRow label={t('hideCompleted')} onValueChange={setHideCompleted} value={hideCompleted} />

        <SettingsLinkRow
          label={t('notifications')}
          onPress={handleNotifications}
          value={permissionLabel(permissionStatus)}
        />
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

        <SettingsLinkRow label={t('theme')} onPress={pickTheme} value={themeLabel(theme)} />
        <SettingsLinkRow label={t('language')} onPress={pickLanguage} value={languageLabel(language)} />

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
