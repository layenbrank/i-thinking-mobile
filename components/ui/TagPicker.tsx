import { Pressable, Text, View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'

interface TagPickerProps {
  label: string
  tags: string[]
  selected: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

function TagPicker({ label, tags, selected, onChange, suggestions = [] }: TagPickerProps) {
  const colors = useThemeColors()
  const options = Array.from(new Set([...suggestions, ...selected, ...tags]))

  function toggleTag(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((entry) => entry !== tag))
      return
    }
    onChange([...selected, tag])
  }

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium" style={{ color: colors.text }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((tag) => {
          const isActive = selected.includes(tag)
          return (
            <Pressable
              key={tag}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              className="min-h-[36px] items-center justify-center rounded-full px-3 active:opacity-70"
              onPress={() => toggleTag(tag)}
              style={{
                backgroundColor: isActive ? colors.tint : colors.surface,
                borderWidth: 1,
                borderColor: isActive ? colors.tint : colors.border
              }}>
              <Text className="text-sm font-medium" style={{ color: isActive ? '#FFFFFF' : colors.textSecondary }}>
                #{tag}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export { TagPicker }
