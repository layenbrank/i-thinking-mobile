import { router } from 'expo-router'
import { Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, Text, View } from 'react-native'

import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { useMemoStore } from '@/stores/memoStore'
import type { ChecklistItem, Memo } from '@/types/memo'

export default function TrashScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const memos = useMemoStore((state) => state.filteredMemos(true)).filter((memo) => memo.deletedAt)
  const items = useMemoStore((state) => state.filteredItems({ includeDeleted: true })).filter((item) => item.deletedAt)
  const restoreMemo = useMemoStore((state) => state.restoreMemo)
  const purgeMemo = useMemoStore((state) => state.purgeMemo)
  const restoreChecklistItem = useMemoStore((state) => state.restoreChecklistItem)
  const purgeChecklistItem = useMemoStore((state) => state.purgeChecklistItem)

  const rows: Array<{ kind: 'memo' | 'item'; data: Memo | ChecklistItem }> = [
    ...memos.map((memo) => ({ kind: 'memo' as const, data: memo })),
    ...items.map((item) => ({ kind: 'item' as const, data: item }))
  ]

  return (
    <Screen scroll={false}>
      <SectionHeader icon={Trash2} title={t('trash')} description={`${rows.length}`} />
      <FlatList
        ListEmptyComponent={
          <EmptyState description={t('emptyTasksHint')} icon={Trash2} title={t('emptyTasks')} />
        }
        data={rows}
        keyExtractor={(row) => `${row.kind}-${row.data.id}`}
        renderItem={({ item: row }) => (
          <View
            className="mb-2 flex-row items-center justify-between rounded-xl border px-4 py-3"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
            <View className="flex-1 pr-3">
              <Text className="text-xs uppercase" style={{ color: colors.textSecondary }}>
                {row.kind}
              </Text>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {'title' in row.data ? row.data.title : ''}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                className="min-h-[40px] justify-center px-3 active:opacity-70"
                onPress={() =>
                  row.kind === 'memo' ? restoreMemo(row.data.id) : restoreChecklistItem(row.data.id)
                }>
                <Text className="text-sm font-semibold" style={{ color: colors.tint }}>
                  {t('undo')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="min-h-[40px] justify-center px-3 active:opacity-70"
                onPress={() =>
                  row.kind === 'memo' ? purgeMemo(row.data.id) : purgeChecklistItem(row.data.id)
                }>
                <Text className="text-sm font-semibold" style={{ color: colors.destructive }}>
                  {t('delete')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <Pressable
        accessibilityRole="button"
        className="mt-4 min-h-[48px] items-center justify-center active:opacity-70"
        onPress={() => router.back()}>
        <Text className="text-base font-semibold" style={{ color: colors.tint }}>
          {t('cancel')}
        </Text>
      </Pressable>
    </Screen>
  )
}
