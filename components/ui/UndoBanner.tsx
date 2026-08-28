import { Pressable, Text, View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'

interface UndoBannerProps {
  message: string
  actionLabel: string
  onUndo: () => void
  onDismiss: () => void
}

function UndoBanner({ message, actionLabel, onUndo, onDismiss }: UndoBannerProps) {
  const colors = useThemeColors()

  return (
    <View
      className="mx-4 mb-3 flex-row items-center justify-between rounded-xl px-4 py-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
      <Text className="flex-1 text-sm" style={{ color: colors.text }}>
        {message}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        className="min-h-[44px] justify-center px-2 active:opacity-70"
        onPress={onUndo}>
        <Text className="text-sm font-semibold" style={{ color: colors.tint }}>
          {actionLabel}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        className="min-h-[44px] justify-center px-2 active:opacity-70"
        onPress={onDismiss}>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          ×
        </Text>
      </Pressable>
    </View>
  )
}

export { UndoBanner }
