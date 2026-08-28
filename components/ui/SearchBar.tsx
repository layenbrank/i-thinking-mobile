import { Search, X } from 'lucide-react-native'
import { Pressable, TextInput, View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  accessibilityLabel: string
}

function SearchBar({ value, onChangeText, placeholder, accessibilityLabel }: SearchBarProps) {
  const colors = useThemeColors()

  return (
    <View
      className="min-h-[48px] flex-row items-center gap-2 rounded-xl border px-3"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
      <Search size={18} color={colors.textSecondary} strokeWidth={1.75} />
      <TextInput
        accessibilityLabel={accessibilityLabel}
        className="flex-1 py-3 text-base"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        style={{ color: colors.text }}
        value={value}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          hitSlop={4}
          onPress={() => onChangeText('')}>
          <X size={16} color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  )
}

export { SearchBar }
