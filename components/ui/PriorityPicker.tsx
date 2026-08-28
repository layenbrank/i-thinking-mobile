import { Pressable, Text, View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'
import type { Priority } from '@/types/memo'

interface PriorityPickerProps {
  label: string
  value: Priority
  onChange: (priority: Priority) => void
  labels: Record<Priority, string>
}

const PRIORITIES: Priority[] = ['none', 'low', 'medium', 'high']

function priorityColor(priority: Priority, colors: ReturnType<typeof useThemeColors>) {
  if (priority === 'high') return colors.destructive
  if (priority === 'medium') return colors.reminder
  if (priority === 'low') return colors.secondary
  return colors.textSecondary
}

function PriorityPicker({ label, value, onChange, labels }: PriorityPickerProps) {
  const colors = useThemeColors()

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium" style={{ color: colors.text }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {PRIORITIES.map((priority) => {
          const isActive = value === priority
          const tint = priorityColor(priority, colors)
          return (
            <Pressable
              key={priority}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              className="min-h-[36px] items-center justify-center rounded-full px-3 active:opacity-70"
              onPress={() => onChange(priority)}
              style={{
                backgroundColor: isActive ? tint : colors.surface,
                borderWidth: 1,
                borderColor: isActive ? tint : colors.border
              }}>
              <Text className="text-sm font-medium" style={{ color: isActive ? '#FFFFFF' : colors.textSecondary }}>
                {labels[priority]}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export { PriorityPicker }
