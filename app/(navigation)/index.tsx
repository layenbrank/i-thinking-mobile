import { router } from 'expo-router'
import { BookOpen, Plus, Trash2 } from 'lucide-react-native'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { EmptyState } from '@/components/ui/EmptyState'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { useMemoStore } from '@/stores/memoStore'
import type { Memo } from '@/types/memo'

export default function MemosScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const memos = useMemoStore((state) => state.memos)
  const insertMemo = useMemoStore((state) => state.insertMemo)
  const removeMemo = useMemoStore((state) => state.removeMemo)

  const handleCreate = useCallback(() => {
    const memo = insertMemo(t('newMemo'), '')
    router.push(`/memo/${memo.id}`)
  }, [insertMemo, t])

  const handleDelete = useCallback(
    (memo: Memo) => {
      Alert.alert(t('delete'), memo.title, [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => removeMemo(memo.id)
        }
      ])
    },
    [removeMemo, t]
  )

  const renderItem = useCallback(
    ({ item }: { item: Memo }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open memo ${item.title}`}
        className="min-h-[72px] flex-row items-center gap-3 border-b px-5 py-4 active:opacity-70"
        onLongPress={() => handleDelete(item)}
        onPress={() => router.push(`/memo/${item.id}`)}
        style={{ borderBottomColor: colors.border, backgroundColor: colors.surface }}>
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}>
          <BookOpen size={18} color={colors.tint} strokeWidth={1.75} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-base font-semibold" numberOfLines={1} style={{ color: colors.text }}>
            {item.title}
          </Text>
          <Text className="text-sm" numberOfLines={2} style={{ color: colors.textSecondary }}>
            {item.content || t('emptyMemosHint')}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.title}`}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
          hitSlop={4}
          onPress={() => handleDelete(item)}>
          <Trash2 size={18} color={colors.destructive} strokeWidth={1.75} />
        </Pressable>
      </Pressable>
    ),
    [colors, handleDelete, t]
  )

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="border-b px-5 pb-4 pt-2"
        style={{ borderBottomColor: colors.border, paddingTop: insets.top + 8 }}>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          {t('memos')}
        </Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
          {memos.length} notes
        </Text>
      </View>

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
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => undefined} />}
        renderItem={renderItem}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('newMemo')}
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full active:opacity-80"
        onPress={handleCreate}
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
