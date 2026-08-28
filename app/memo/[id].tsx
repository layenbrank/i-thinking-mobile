import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'

import { ChecklistItemRow } from '@/components/ui/ChecklistItemRow'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { Screen } from '@/components/ui/Screen'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { useMemoStore } from '@/stores/memoStore'

export default function MemoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const colors = useThemeColors()
  const findMemo = useMemoStore((state) => state.findMemo)
  const updateMemo = useMemoStore((state) => state.updateMemo)
  const findItemsByMemo = useMemoStore((state) => state.findItemsByMemo)
  const toggleChecklistItem = useMemoStore((state) => state.toggleChecklistItem)
  const removeChecklistItem = useMemoStore((state) => state.removeChecklistItem)

  const memo = findMemo(id)
  const [title, setTitle] = useState(memo?.title ?? '')
  const [content, setContent] = useState(memo?.content ?? '')
  const items = findItemsByMemo(id)

  useEffect(() => {
    if (memo) {
      setTitle(memo.title)
      setContent(memo.content)
    }
  }, [memo])

  useEffect(() => {
    if (!memo) {
      Alert.alert(t('memoDetail'), 'Memo not found', [{ text: 'OK', onPress: () => router.back() }])
    }
  }, [memo, t])

  if (!memo) {
    return null
  }

  function handleSave() {
    updateMemo(id, title, content)
    router.back()
  }

  return (
    <Screen scroll>
      <View className="gap-5">
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

        <View className="gap-2">
          <Text className="text-sm font-medium" style={{ color: colors.text }}>
            {t('content')}
          </Text>
          <TextInput
            accessibilityLabel={t('content')}
            className="min-h-[160px] rounded-xl border px-3 py-3 text-base"
            multiline
            onChangeText={setContent}
            placeholder={t('content')}
            placeholderTextColor={colors.textSecondary}
            style={{
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              textAlignVertical: 'top'
            }}
            value={content}
          />
        </View>

        <PrimaryButton label={t('save')} onPress={handleSave} />

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {t('checklist')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('addTask')}
              className="min-h-[44px] justify-center px-2 active:opacity-70"
              onPress={() => router.push({ pathname: '/checklist/new', params: { memoId: id } })}>
              <Text className="text-sm font-semibold" style={{ color: colors.tint }}>
                + {t('addTask')}
              </Text>
            </Pressable>
          </View>

          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onDelete={removeChecklistItem}
              onPress={(itemId) => router.push({ pathname: '/checklist/new', params: { itemId } })}
              onToggle={toggleChecklistItem}
            />
          ))}
        </View>
      </View>
    </Screen>
  )
}
