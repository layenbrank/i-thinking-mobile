import { Bell, Check, Trash2 } from 'lucide-react-native'
import { memo } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'
import type { ChecklistItem } from '@/types/memo'

interface ChecklistItemRowProps {
  item: ChecklistItem
  onToggle: (id: string) => void
  onPress: (id: string) => void
  onDelete: (id: string) => void
}

function formatReminderTime(timestamp?: number) {
  if (!timestamp) {
    return null
  }
  const date = new Date(timestamp)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

const ChecklistItemRow = memo(function ChecklistItemRow({
  item,
  onToggle,
  onPress,
  onDelete
}: ChecklistItemRowProps) {
  const colors = useThemeColors()
  const reminderLabel = formatReminderTime(item.reminderAt)

  return (
    <View
      className="min-h-[64px] flex-row items-center gap-2 border-b px-4 py-3"
      style={{ borderBottomColor: colors.border, backgroundColor: colors.surface, opacity: item.completed ? 0.65 : 1 }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.completed }}
        accessibilityLabel={item.completed ? `Mark ${item.title} incomplete` : `Mark ${item.title} complete`}
        className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
        hitSlop={4}
        onPress={() => onToggle(item.id)}>
        <View
          className="h-6 w-6 items-center justify-center rounded-md border-2"
          style={{
            borderColor: item.completed ? colors.success : colors.border,
            backgroundColor: item.completed ? colors.success : 'transparent'
          }}>
          {item.completed ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open task ${item.title}`}
        className="min-h-[44px] flex-1 justify-center active:opacity-70"
        onPress={() => onPress(item.id)}>
        <Text
          className="text-base font-medium"
          numberOfLines={2}
          style={{
            color: colors.text,
            textDecorationLine: item.completed ? 'line-through' : 'none'
          }}>
          {item.title}
        </Text>
        {reminderLabel ? (
          <View className="mt-1 flex-row items-center gap-1">
            <Bell size={12} color={colors.reminder} strokeWidth={2} />
            <Text className="text-xs" style={{ color: colors.reminder }}>
              {reminderLabel}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.title}`}
        className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
        hitSlop={4}
        onLongPress={() => onDelete(item.id)}
        onPress={() => onDelete(item.id)}>
        <Trash2 size={18} color={colors.destructive} strokeWidth={1.75} />
      </Pressable>
    </View>
  )
})

export { ChecklistItemRow }
