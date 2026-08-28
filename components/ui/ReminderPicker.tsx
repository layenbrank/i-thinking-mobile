import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Bell, Calendar } from 'lucide-react-native'
import { Platform, Pressable, Text, View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'

interface ReminderPickerProps {
  label: string
  value?: number
  onChange: (timestamp?: number) => void
  clearLabel: string
}

function ReminderPicker({ label, value, onChange, clearLabel }: ReminderPickerProps) {
  const colors = useThemeColors()
  const date = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000)
  const hasReminder = Boolean(value)

  function handleChange(_event: DateTimePickerEvent, selected?: Date) {
    if (selected) {
      onChange(selected.getTime())
    }
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Bell size={18} color={colors.reminder} strokeWidth={1.75} />
        <Text className="text-sm font-medium" style={{ color: colors.text }}>
          {label}
        </Text>
      </View>

      <View
        className="rounded-xl border p-3"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
        <View className="mb-2 flex-row items-center gap-2">
          <Calendar size={16} color={colors.textSecondary} strokeWidth={1.75} />
          <Text className="text-sm" style={{ color: hasReminder ? colors.reminder : colors.textSecondary }}>
            {hasReminder
              ? date.toLocaleString()
              : 'No reminder set'}
          </Text>
        </View>

        <DateTimePicker
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          mode="datetime"
          onChange={handleChange}
          testID="reminder-picker"
          value={date}
        />

        {hasReminder ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={clearLabel}
            className="mt-3 min-h-[44px] items-center justify-center rounded-lg active:opacity-70"
            onPress={() => onChange(undefined)}
            style={{ backgroundColor: colors.background }}>
            <Text className="text-sm font-semibold" style={{ color: colors.destructive }}>
              {clearLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

export { ReminderPicker }
