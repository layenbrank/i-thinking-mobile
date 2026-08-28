import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Text, TextInput, View } from 'react-native'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ReminderPicker } from '@/components/ui/ReminderPicker'
import { Screen } from '@/components/ui/Screen'
import { SecondaryButton } from '@/components/ui/PrimaryButton'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { requestNotificationPermissions } from '@/services/notifications'
import { useMemoStore } from '@/stores/memoStore'

export default function ChecklistFormScreen() {
  const { itemId, memoId } = useLocalSearchParams<{ itemId?: string; memoId?: string }>()
  const { t } = useTranslation()
  const colors = useThemeColors()
  const items = useMemoStore((state) => state.items)
  const insertChecklistItem = useMemoStore((state) => state.insertChecklistItem)
  const updateChecklistItem = useMemoStore((state) => state.updateChecklistItem)

  const existing = itemId ? items.find((item) => item.id === itemId) : undefined
  const [title, setTitle] = useState(existing?.title ?? '')
  const [reminderAt, setReminderAt] = useState<number | undefined>(existing?.reminderAt)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setReminderAt(existing.reminderAt)
    }
  }, [existing])

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert(t('addTask'), t('titleRequired'))
      return
    }

    setIsSaving(true)

    if (reminderAt) {
      const granted = await requestNotificationPermissions()
      if (!granted) {
        Alert.alert(t('notifications'), t('permissionDenied'))
        setIsSaving(false)
        return
      }
    }

    if (existing) {
      await updateChecklistItem(existing.id, { title, reminderAt })
    } else {
      await insertChecklistItem(title, memoId, reminderAt)
    }

    setIsSaving(false)
    router.back()
  }

  return (
    <Screen scroll>
      <View className="gap-5">
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          {existing ? t('editTask') : t('addTask')}
        </Text>

        <View className="gap-2">
          <Text className="text-sm font-medium" style={{ color: colors.text }}>
            {t('title')}
          </Text>
          <TextInput
            accessibilityLabel={t('title')}
            className="min-h-[48px] rounded-xl border px-3 py-3 text-base"
            onChangeText={setTitle}
            placeholder={t('title')}
            placeholderTextColor={colors.textSecondary}
            style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }}
            value={title}
          />
        </View>

        <ReminderPicker
          clearLabel={t('clearReminder')}
          label={t('reminder')}
          onChange={setReminderAt}
          value={reminderAt}
        />

        <PrimaryButton label={t('save')} loading={isSaving} onPress={handleSave} />
        <SecondaryButton label={t('cancel')} onPress={() => router.back()} />
      </View>
    </Screen>
  )
}
