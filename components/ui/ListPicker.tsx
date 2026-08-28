import { Pressable, Text, View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'
import type { TaskList } from '@/types/memo'

interface ListPickerProps {
  label: string
  lists: TaskList[]
  value: string
  onChange: (listId: string) => void
}

function ListPicker({ label, lists, value, onChange }: ListPickerProps) {
  const colors = useThemeColors()

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium" style={{ color: colors.text }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {lists.map((list) => {
          const isActive = value === list.id
          return (
            <Pressable
              key={list.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              className="min-h-[36px] items-center justify-center rounded-full px-3 active:opacity-70"
              onPress={() => onChange(list.id)}
              style={{
                backgroundColor: isActive ? list.color : colors.surface,
                borderWidth: 1,
                borderColor: isActive ? list.color : colors.border
              }}>
              <Text className="text-sm font-medium" style={{ color: isActive ? '#FFFFFF' : colors.textSecondary }}>
                {list.name}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export { ListPicker }
