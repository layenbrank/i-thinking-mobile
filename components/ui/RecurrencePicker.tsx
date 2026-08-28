import { Pressable, Text, View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'
import type { Recurrence, RecurrenceFrequency } from '@/types/memo'

interface RecurrencePickerProps {
  label: string
  noneLabel: string
  value?: Recurrence
  onChange: (value?: Recurrence) => void
  frequencyLabels: Record<RecurrenceFrequency, string>
}

const FREQUENCIES: RecurrenceFrequency[] = ['daily', 'weekly', 'monthly']

function RecurrencePicker({ label, noneLabel, value, onChange, frequencyLabels }: RecurrencePickerProps) {
  const colors = useThemeColors()

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium" style={{ color: colors.text }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !value }}
          className="min-h-[36px] items-center justify-center rounded-full px-3 active:opacity-70"
          onPress={() => onChange(undefined)}
          style={{
            backgroundColor: !value ? colors.tint : colors.surface,
            borderWidth: 1,
            borderColor: !value ? colors.tint : colors.border
          }}>
          <Text className="text-sm font-medium" style={{ color: !value ? '#FFFFFF' : colors.textSecondary }}>
            {noneLabel}
          </Text>
        </Pressable>
        {FREQUENCIES.map((frequency) => {
          const isActive = value?.frequency === frequency
          return (
            <Pressable
              key={frequency}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              className="min-h-[36px] items-center justify-center rounded-full px-3 active:opacity-70"
              onPress={() => onChange({ frequency, interval: 1 })}
              style={{
                backgroundColor: isActive ? colors.reminder : colors.surface,
                borderWidth: 1,
                borderColor: isActive ? colors.reminder : colors.border
              }}>
              <Text className="text-sm font-medium" style={{ color: isActive ? '#FFFFFF' : colors.textSecondary }}>
                {frequencyLabels[frequency]}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export { RecurrencePicker }
