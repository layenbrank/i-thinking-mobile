import { router } from 'expo-router'
import { CheckSquare, Plus } from 'lucide-react-native'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ChecklistItemRow } from '@/components/ui/ChecklistItemRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { useMemoStore } from '@/stores/memoStore'
import type { ChecklistFilter, ChecklistItem } from '@/types/memo'

const FILTERS: ChecklistFilter[] = ['all', 'active', 'reminder']

export default function ChecklistScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const filter = useMemoStore((state) => state.filter)
  const setFilter = useMemoStore((state) => state.setFilter)
  const filteredItems = useMemoStore((state) => state.filteredItems())
  const toggleChecklistItem = useMemoStore((state) => state.toggleChecklistItem)
  const removeChecklistItem = useMemoStore((state) => state.removeChecklistItem)

  const filterLabel = useCallback(
    (value: ChecklistFilter) => {
      if (value === 'active') return t('filterActive')
      if (value === 'reminder') return t('filterReminder')
      return t('filterAll')
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
      removeChecklistItem(id)
    },
    [removeChecklistItem]
  )

  const renderItem = useCallback(
    ({ item }: { item: ChecklistItem }) => (
      <ChecklistItemRow item={item} onDelete={handleDelete} onPress={handlePress} onToggle={handleToggle} />
    ),
    [handleDelete, handlePress, handleToggle]
  )

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-row gap-2 border-b px-4 py-3" style={{ borderBottomColor: colors.border }}>
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
        accessibilityLabel={t('addTask')}
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full active:opacity-80"
        onPress={() => router.push('/checklist/new')}
        style={{
          backgroundColor: colors.tint,
          marginBottom: insets.bottom,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4
        }}>
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>
    </View>
  )
}
