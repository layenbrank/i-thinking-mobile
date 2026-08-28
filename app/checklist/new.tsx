import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Text, TextInput, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { ListPicker } from '@/components/ui/ListPicker'
import { PriorityPicker } from '@/components/ui/PriorityPicker'
import { PrimaryButton, SecondaryButton } from '@/components/ui/PrimaryButton'
import { RecurrencePicker } from '@/components/ui/RecurrencePicker'
import { ReminderPicker } from '@/components/ui/ReminderPicker'
import { Screen } from '@/components/ui/Screen'
import { TagPicker } from '@/components/ui/TagPicker'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { requestNotificationPermissions } from '@/services/notifications'
import { INBOX_LIST_ID } from '@/services/migration'
import { useMemoStore } from '@/stores/memoStore'
import type { Priority, Recurrence } from '@/types/memo'

export default function ChecklistFormScreen() {
  const { itemId, memoId } = useLocalSearchParams<{ itemId?: string; memoId?: string }>()
  const { t } = useTranslation()
  const colors = useThemeColors()
  const items = useMemoStore((state) => state.items)
  const lists = useMemoStore((state) => state.lists)
  const tags = useMemoStore(useShallow((state) => state.findTags()))
  const insertChecklistItem = useMemoStore((state) => state.insertChecklistItem)
  const updateChecklistItem = useMemoStore((state) => state.updateChecklistItem)

  const existing = itemId ? items.find((item) => item.id === itemId) : undefined
  const [title, setTitle] = useState(existing?.title ?? '')
  const [listId, setListId] = useState(existing?.listId ?? INBOX_LIST_ID)
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'none')
  const [selectedTags, setSelectedTags] = useState<string[]>(existing?.tags ?? [])
  const [dueAt, setDueAt] = useState<number | undefined>(existing?.dueAt)
  const [reminderAt, setReminderAt] = useState<number | undefined>(existing?.reminderAt)
  const [recurrence, setRecurrence] = useState<Recurrence | undefined>(existing?.recurrence)
  const [isSaving, setIsSaving] = useState(false)

  const priorityLabels = useMemo(
    () => ({
      none: t('priorityNone'),
      low: t('priorityLow'),
      medium: t('priorityMedium'),
      high: t('priorityHigh')
    }),
    [t]
  )

  const recurrenceLabels = useMemo(
    () => ({
      daily: t('recurrenceDaily'),
      weekly: t('recurrenceWeekly'),
      monthly: t('recurrenceMonthly')
    }),
    [t]
  )

  useEffect(() => {
    if (!existing) {
      return
    }
    setTitle(existing.title)
    setListId(existing.listId)
    setPriority(existing.priority)
    setSelectedTags(existing.tags)
    setDueAt(existing.dueAt)
    setReminderAt(existing.reminderAt)
    setRecurrence(existing.recurrence)
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
      await updateChecklistItem(existing.id, {
        title,
        listId,
        priority,
        tags: selectedTags,
        dueAt: dueAt ?? null,
        reminderAt: reminderAt ?? null,
        recurrence: recurrence ?? null
      })
    } else {
      await insertChecklistItem({
        title,
        memoId,
        listId,
        priority,
        tags: selectedTags,
        dueAt,
        reminderAt,
        recurrence
      })
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
            className="h-12 rounded-xl border px-3 text-base"
            onChangeText={setTitle}
            placeholder={t('title')}
            placeholderTextColor={colors.textSecondary}
            style={{
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              textAlignVertical: 'center',
              paddingVertical: 0
            }}
            value={title}
          />
        </View>

        <ListPicker label={t('list')} lists={lists} onChange={setListId} value={listId} />
        <PriorityPicker label={t('priority')} labels={priorityLabels} onChange={setPriority} value={priority} />
        <TagPicker
          label={t('tags')}
          onChange={setSelectedTags}
          selected={selectedTags}
          suggestions={tags}
          tags={['work', 'personal', 'urgent']}
        />
        <ReminderPicker
          clearLabel={t('clearDueDate')}
          label={t('dueDate')}
          onChange={setDueAt}
          value={dueAt}
        />
        <ReminderPicker
          clearLabel={t('clearReminder')}
          label={t('reminder')}
          onChange={setReminderAt}
          value={reminderAt}
        />
        <RecurrencePicker
          frequencyLabels={recurrenceLabels}
          label={t('recurrence')}
          noneLabel={t('recurrenceNone')}
          onChange={setRecurrence}
          value={recurrence}
        />

        <PrimaryButton label={t('save')} loading={isSaving} onPress={handleSave} />
        <SecondaryButton label={t('cancel')} onPress={() => router.back()} />
      </View>
    </Screen>
  )
}
