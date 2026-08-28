import { router } from 'expo-router'
import { BookOpen, Pin, Plus, Trash2 } from 'lucide-react-native'
import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, FlatList, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useShallow } from 'zustand/react/shallow'

import { EmptyState } from '@/components/ui/EmptyState'
import { SearchBar } from '@/components/ui/SearchBar'
import { TagPicker } from '@/components/ui/TagPicker'
import { UndoBanner } from '@/components/ui/UndoBanner'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { useMemoStore } from '@/stores/memoStore'
import type { Memo } from '@/types/memo'

export default function MemosScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchQuery = useMemoStore((state) => state.searchQuery)
  const setSearchQuery = useMemoStore((state) => state.setSearchQuery)
  const activeTag = useMemoStore((state) => state.activeTag)
  const setActiveTag = useMemoStore((state) => state.setActiveTag)
  const memos = useMemoStore(useShallow((state) => state.filteredMemos()))
  const tags = useMemoStore(useShallow((state) => state.findTags()))
  const insertMemo = useMemoStore((state) => state.insertMemo)
  const softDeleteMemo = useMemoStore((state) => state.softDeleteMemo)
  const restoreMemo = useMemoStore((state) => state.restoreMemo)
  const togglePinMemo = useMemoStore((state) => state.togglePinMemo)
  const undoAction = useMemoStore((state) => state.undoAction)
  const clearUndo = useMemoStore((state) => state.clearUndo)

  useEffect(() => {
    if (!undoAction || undoAction.type !== 'memo') {
      return undefined
    }
    if (undoTimer.current) {
      clearTimeout(undoTimer.current)
    }
    undoTimer.current = setTimeout(() => clearUndo(), 5000)
    return () => {
      if (undoTimer.current) {
        clearTimeout(undoTimer.current)
      }
    }
  }, [undoAction, clearUndo])

  const handleCreate = useCallback(() => {
    const memo = insertMemo(t('newMemo'), '')
    router.push(`/memo/${memo.id}`)
  }, [insertMemo, t])

  const handleDelete = useCallback(
    (memo: Memo) => {
      softDeleteMemo(memo.id)
    },
    [softDeleteMemo]
  )

  const renderItem = useCallback(
    ({ item }: { item: Memo }) => (
      <Pressable
        accessibilityRole="button"
        className="min-h-[72px] flex-row items-center gap-3 border-b px-5 py-4 active:opacity-70"
        onLongPress={() => togglePinMemo(item.id)}
        onPress={() => router.push(`/memo/${item.id}`)}
        style={{ borderBottomColor: colors.border, backgroundColor: colors.surface }}>
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}>
          <BookOpen size={18} color={colors.tint} strokeWidth={1.75} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            {item.isPinned ? <Pin size={14} color={colors.reminder} strokeWidth={2} /> : null}
            <Text className="flex-1 text-base font-semibold" numberOfLines={1} style={{ color: colors.text }}>
              {item.title}
            </Text>
          </View>
          <Text className="text-sm" numberOfLines={2} style={{ color: colors.textSecondary }}>
            {item.content || t('emptyMemosHint')}
          </Text>
          {item.tags.length > 0 ? (
            <Text className="text-xs" numberOfLines={1} style={{ color: colors.textSecondary }}>
              {item.tags.map((tag) => `#${tag}`).join(' ')}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
          hitSlop={4}
          onPress={() => handleDelete(item)}>
          <Trash2 size={18} color={colors.destructive} strokeWidth={1.75} />
        </Pressable>
      </Pressable>
    ),
    [colors, handleDelete, togglePinMemo, t]
  )

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="gap-3 border-b px-5 pb-4 pt-2"
        style={{ borderBottomColor: colors.border, paddingTop: insets.top + 8 }}>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          {t('memos')}
        </Text>
        <SearchBar
          accessibilityLabel={t('search')}
          onChangeText={setSearchQuery}
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
        />
        {tags.length > 0 ? (
          <TagPicker
            label={t('tags')}
            onChange={(selected) => setActiveTag(selected[0])}
            selected={activeTag ? [activeTag] : []}
            suggestions={tags}
            tags={tags}
          />
        ) : null}
      </View>

      {undoAction?.type === 'memo' ? (
        <UndoBanner
          actionLabel={t('undo')}
          message={t('deleted')}
          onDismiss={clearUndo}
          onUndo={() => restoreMemo(undoAction.id)}
        />
      ) : null}

      <FlatList
        ListEmptyComponent={
          <EmptyState
            actionLabel={t('newMemo')}
            description={t('emptyMemosHint')}
            icon={BookOpen}
            onAction={handleCreate}
            title={t('emptyMemos')}
          />
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 80 }}
        data={memos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <Pressable
        accessibilityRole="button"
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full active:opacity-80"
        onPress={handleCreate}
        style={{
          backgroundColor: colors.tint,
          marginBottom: insets.bottom,
          elevation: 4
        }}>
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>
    </View>
  )
}
