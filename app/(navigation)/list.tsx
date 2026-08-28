import { router } from 'expo-router'
import { CheckSquare, Plus } from 'lucide-react-native'
import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useShallow } from 'zustand/react/shallow'

import { ChecklistItemRow } from '@/components/ui/ChecklistItemRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchBar } from '@/components/ui/SearchBar'
import { UndoBanner } from '@/components/ui/UndoBanner'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { useMemoStore } from '@/stores/memoStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { ChecklistFilter, ChecklistItem } from '@/types/memo'

const FILTERS: ChecklistFilter[] = ['all', 'today', 'upcoming', 'overdue', 'active', 'high', 'reminder']

export default function ChecklistScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filter = useMemoStore((state) => state.filter)
  const setFilter = useMemoStore((state) => state.setFilter)
  const searchQuery = useMemoStore((state) => state.searchQuery)
  const setSearchQuery = useMemoStore((state) => state.setSearchQuery)
  const lists = useMemoStore((state) => state.lists)
  const activeListId = useMemoStore((state) => state.activeListId)
  const setActiveListId = useMemoStore((state) => state.setActiveListId)
  const hideCompleted = useSettingsStore((state) => state.hideCompleted)
  const filteredItems = useMemoStore(useShallow((state) => state.filteredItems({ hideCompleted })))
  const findSubtasks = useMemoStore((state) => state.findSubtasks)
  const toggleChecklistItem = useMemoStore((state) => state.toggleChecklistItem)
  const softDeleteChecklistItem = useMemoStore((state) => state.softDeleteChecklistItem)
  const restoreChecklistItem = useMemoStore((state) => state.restoreChecklistItem)
  const undoAction = useMemoStore((state) => state.undoAction)
  const clearUndo = useMemoStore((state) => state.clearUndo)

  useEffect(() => {
    if (!undoAction || undoAction.type !== 'item') {
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

  const filterLabel = useCallback(
    (value: ChecklistFilter) => {
      const map: Record<ChecklistFilter, string> = {
        all: t('filterAll'),
        active: t('filterActive'),
        reminder: t('filterReminder'),
        today: t('filterToday'),
        upcoming: t('filterUpcoming'),
        overdue: t('filterOverdue'),
        high: t('filterHigh')
      }
      return map[value]
    },
    [t]
  )

  const handleToggle = useCallback(
    (id: string) => {
      toggleChecklistItem(id)
    },
    [toggleChecklistItem]
  )

  const handlePress = useCallback((id: string) => {
    router.push({ pathname: '/checklist/new', params: { itemId: id } })
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      softDeleteChecklistItem(id)
    },
    [softDeleteChecklistItem]
  )

  const renderItem = useCallback(
    ({ item }: { item: ChecklistItem }) => (
      <ChecklistItemRow
        item={item}
        onDelete={handleDelete}
        onPress={handlePress}
        onToggle={handleToggle}
        onToggleSubtask={handleToggle}
        subtasks={findSubtasks(item.id)}
      />
    ),
    [findSubtasks, handleDelete, handlePress, handleToggle]
  )

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="gap-3 border-b px-4 py-3" style={{ borderBottomColor: colors.border }}>
        <SearchBar
          accessibilityLabel={t('search')}
          onChangeText={setSearchQuery}
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !activeListId }}
              className="min-h-[36px] items-center justify-center rounded-full px-4 active:opacity-70"
              onPress={() => setActiveListId(undefined)}
              style={{
                backgroundColor: !activeListId ? colors.tint : colors.surface,
                borderWidth: 1,
                borderColor: !activeListId ? colors.tint : colors.border
              }}>
              <Text className="text-sm font-semibold" style={{ color: !activeListId ? '#FFFFFF' : colors.textSecondary }}>
                {t('filterAll')}
              </Text>
            </Pressable>
            {lists.map((list) => {
              const isActive = activeListId === list.id
              return (
                <Pressable
                  key={list.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  className="min-h-[36px] items-center justify-center rounded-full px-4 active:opacity-70"
                  onPress={() => setActiveListId(list.id)}
                  style={{
                    backgroundColor: isActive ? list.color : colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? list.color : colors.border
                  }}>
                  <Text className="text-sm font-semibold" style={{ color: isActive ? '#FFFFFF' : colors.textSecondary }}>
                    {list.name}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {FILTERS.map((value) => {
              const isActive = filter === value
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  className="min-h-[36px] items-center justify-center rounded-full px-4 active:opacity-70"
                  onPress={() => setFilter(value)}
                  style={{
                    backgroundColor: isActive ? colors.tint : colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? colors.tint : colors.border
                  }}>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: isActive ? '#FFFFFF' : colors.textSecondary }}>
                    {filterLabel(value)}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </ScrollView>
      </View>

      {undoAction?.type === 'item' ? (
        <UndoBanner
          actionLabel={t('undo')}
          message={t('deleted')}
          onDismiss={clearUndo}
          onUndo={() => restoreChecklistItem(undoAction.id)}
        />
      ) : null}

      <FlatList
        ListEmptyComponent={
          <EmptyState
            actionLabel={t('addTask')}
            description={t('emptyTasksHint')}
            icon={CheckSquare}
            onAction={() => router.push('/checklist/new')}
            title={t('emptyTasks')}
          />
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 80 }}
        data={filteredItems}
        initialNumToRender={16}
        keyExtractor={(item) => item.id}
        maxToRenderPerBatch={16}
        removeClippedSubviews
        renderItem={renderItem}
        windowSize={7}
      />

      <Pressable
        accessibilityRole="button"
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full active:opacity-80"
        onPress={() => router.push('/checklist/new')}
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
