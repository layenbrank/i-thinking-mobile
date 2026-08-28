import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'

import { ChecklistItemRow } from '@/components/ui/ChecklistItemRow'
import { TagPicker } from '@/components/ui/TagPicker'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { useMemoStore } from '@/stores/memoStore'

export default function MemoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const colors = useThemeColors()
  const findMemo = useMemoStore((state) => state.findMemo)
  const updateMemo = useMemoStore((state) => state.updateMemo)
  const findItemsByMemo = useMemoStore((state) => state.findItemsByMemo)
  const findSubtasks = useMemoStore((state) => state.findSubtasks)
  const toggleChecklistItem = useMemoStore((state) => state.toggleChecklistItem)
  const softDeleteChecklistItem = useMemoStore((state) => state.softDeleteChecklistItem)
  const insertSubtask = useMemoStore((state) => state.insertSubtask)
  const tags = useMemoStore((state) => state.findTags())

  const memo = findMemo(id)
  const [title, setTitle] = useState(memo?.title ?? '')
  const [content, setContent] = useState(memo?.content ?? '')
  const [selectedTags, setSelectedTags] = useState<string[]>(memo?.tags ?? [])
  const [subtaskDraft, setSubtaskDraft] = useState<{ parentId: string; text: string } | null>(null)
  const [savedHint, setSavedHint] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const items = findItemsByMemo(id)

  useEffect(() => {
    if (memo) {
      setTitle(memo.title)
      setContent(memo.content)
      setSelectedTags(memo.tags)
    }
  }, [memo])

  useEffect(() => {
    if (!memo) {
      Alert.alert(t('memoDetail'), 'Memo not found', [{ text: 'OK', onPress: () => router.back() }])
    }
  }, [memo, t])

  useEffect(() => {
    if (!memo) {
      return undefined
    }
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
    }
    saveTimer.current = setTimeout(() => {
      updateMemo(id, { title, content, tags: selectedTags })
      setSavedHint(true)
      setTimeout(() => setSavedHint(false), 1500)
    }, 800)
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
      }
    }
  }, [content, id, memo, selectedTags, title, updateMemo])

  if (!memo) {
    return null
  }

  return (
    <View className="flex-1 px-5 py-4" style={{ backgroundColor: colors.background }}>
      {savedHint ? (
        <Text className="mb-2 text-xs font-medium" style={{ color: colors.success }}>
          {t('autoSaved')}
        </Text>
      ) : null}

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

        <TagPicker
          label={t('tags')}
          onChange={setSelectedTags}
          selected={selectedTags}
          suggestions={tags}
          tags={['idea', 'meeting', 'project']}
        />

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {t('checklist')}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="min-h-[44px] justify-center px-2 active:opacity-70"
              onPress={() => router.push({ pathname: '/checklist/new', params: { memoId: id } })}>
              <Text className="text-sm font-semibold" style={{ color: colors.tint }}>
                + {t('addTask')}
              </Text>
            </Pressable>
          </View>

          {items.map((item) => (
            <View key={item.id} className="gap-2">
              <ChecklistItemRow
                item={item}
                onDelete={softDeleteChecklistItem}
                onPress={(itemId) => router.push({ pathname: '/checklist/new', params: { itemId } })}
                onToggle={toggleChecklistItem}
                onToggleSubtask={toggleChecklistItem}
                subtasks={findSubtasks(item.id)}
              />
              <Pressable
                accessibilityRole="button"
                className="min-h-[40px] justify-center pl-12 active:opacity-70"
                onPress={() => setSubtaskDraft({ parentId: item.id, text: '' })}>
                <Text className="text-sm font-semibold" style={{ color: colors.tint }}>
                  + {t('addSubtask')}
                </Text>
              </Pressable>
              {subtaskDraft?.parentId === item.id ? (
                <View className="flex-row items-center gap-2 pl-12">
                  <TextInput
                    accessibilityLabel={t('addSubtask')}
                    autoFocus
                    className="min-h-[40px] flex-1 rounded-lg border px-3 py-2 text-sm"
                    onChangeText={(text) => setSubtaskDraft({ parentId: item.id, text })}
                    placeholder={t('addSubtask')}
                    placeholderTextColor={colors.textSecondary}
                    style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }}
                    value={subtaskDraft.text}
                  />
                  <Pressable
                    accessibilityRole="button"
                    className="min-h-[40px] justify-center px-3 active:opacity-70"
                    onPress={async () => {
                      if (subtaskDraft.text.trim()) {
                        await insertSubtask(item.id, subtaskDraft.text.trim())
                      }
                      setSubtaskDraft(null)
                    }}>
                    <Text className="text-sm font-semibold" style={{ color: colors.tint }}>
                      {t('save')}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
