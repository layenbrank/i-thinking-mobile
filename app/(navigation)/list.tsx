import { FileText } from 'lucide-react-native'
import { FlatList, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { IconBadge } from '@/components/ui/IconBadge'
import { useThemeColors } from '@/components/ui/useThemeColors'

interface ListItem {
  id: number
  title: string
  subtitle: string
}

const DATA: ListItem[] = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  title: `Item ${i + 1}`,
  subtitle: i % 3 === 0 ? 'Priority' : i % 3 === 1 ? 'In review' : 'Archived'
}))

export default function HighPerformanceList() {
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        ListHeaderComponent={
          <View className="flex-row items-center gap-3 border-b px-5 py-4" style={{ borderBottomColor: colors.border, backgroundColor: colors.surface }}>
            <IconBadge icon={FileText} size="md" />
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                Records
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                {DATA.length} rows · virtualized
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        data={DATA}
        initialNumToRender={16}
        keyExtractor={(item) => item.id.toString()}
        maxToRenderPerBatch={16}
        removeClippedSubviews
        renderItem={({ item }) => (
          <View
            className="min-h-[64px] flex-row items-center gap-3 border-b px-5 py-3"
            style={{ borderBottomColor: colors.border, backgroundColor: colors.surface }}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}>
              <Text className="text-xs font-bold" style={{ color: colors.tint }}>
                {String(item.id + 1).padStart(2, '0')}
              </Text>
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {item.title}
              </Text>
              <Text className="mt-0.5 text-sm" style={{ color: colors.textSecondary }}>
                {item.subtitle}
              </Text>
            </View>
          </View>
        )}
        windowSize={7}
      />
    </View>
  )
}
