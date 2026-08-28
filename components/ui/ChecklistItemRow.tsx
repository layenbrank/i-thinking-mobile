import { Bell, Check, ChevronDown, ChevronRight, Trash2 } from 'lucide-react-native'
import { memo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'
import { isOverdue } from '@/services/memoFilters'
import type { ChecklistItem, Priority } from '@/types/memo'

interface ChecklistItemRowProps {
  item: ChecklistItem
  subtasks?: ChecklistItem[]
  onToggle: (id: string) => void
  onPress: (id: string) => void
  onDelete: (id: string) => void
  onToggleSubtask?: (id: string) => void
}

function formatTime(timestamp?: number) {
  if (!timestamp) {
    return null
  }
  const date = new Date(timestamp)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

function priorityLabel(priority: Priority) {
  if (priority === 'high') return '!!!'
  if (priority === 'medium') return '!!'
  if (priority === 'low') return '!'
  return null
}

const ChecklistItemRow = memo(function ChecklistItemRow({
  item,
  subtasks = [],
  onToggle,
  onPress,
  onDelete,
  onToggleSubtask
}: ChecklistItemRowProps) {
  const colors = useThemeColors()
  const [expanded, setExpanded] = useState(true)
  const dueLabel = formatTime(item.dueAt ?? item.reminderAt)
  const overdue = isOverdue(item)
  const badge = priorityLabel(item.priority)

  return (
    <View style={{ opacity: item.completed ? 0.65 : 1 }}>
      <View
        className="min-h-[64px] flex-row items-center gap-2 border-b px-4 py-3"
        style={{ borderBottomColor: colors.border, backgroundColor: colors.surface }}>
        {subtasks.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
            onPress={() => setExpanded((value) => !value)}>
            {expanded ? (
              <ChevronDown size={18} color={colors.textSecondary} strokeWidth={1.75} />
            ) : (
              <ChevronRight size={18} color={colors.textSecondary} strokeWidth={1.75} />
            )}
          </Pressable>
        ) : (
          <View className="w-10" />
        )}

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.completed }}
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
          className="min-h-[44px] flex-1 justify-center active:opacity-70"
          onPress={() => onPress(item.id)}>
          <View className="flex-row items-center gap-2">
            {badge ? (
              <Text className="text-xs font-bold" style={{ color: colors.destructive }}>
                {badge}
              </Text>
            ) : null}
            <Text
              className="flex-1 text-base font-medium"
              numberOfLines={2}
              style={{
                color: colors.text,
                textDecorationLine: item.completed ? 'line-through' : 'none'
              }}>
              {item.title}
            </Text>
          </View>
          {dueLabel ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Bell size={12} color={overdue ? colors.destructive : colors.reminder} strokeWidth={2} />
              <Text className="text-xs" style={{ color: overdue ? colors.destructive : colors.reminder }}>
                {dueLabel}
              </Text>
            </View>
          ) : null}
          {item.tags.length > 0 ? (
            <Text className="mt-1 text-xs" numberOfLines={1} style={{ color: colors.textSecondary }}>
              {item.tags.map((tag) => `#${tag}`).join(' ')}
            </Text>
          ) : null}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
          hitSlop={4}
          onPress={() => onDelete(item.id)}>
          <Trash2 size={18} color={colors.destructive} strokeWidth={1.75} />
        </Pressable>
      </View>

      {expanded
        ? subtasks.map((subtask) => (
            <View
              key={subtask.id}
              className="min-h-[52px] flex-row items-center gap-2 border-b px-4 py-2 pl-16"
              style={{ borderBottomColor: colors.border, backgroundColor: colors.background }}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: subtask.completed }}
                className="h-10 w-10 items-center justify-center active:opacity-70"
                onPress={() => onToggleSubtask?.(subtask.id)}>
                <View
                  className="h-5 w-5 items-center justify-center rounded-md border-2"
                  style={{
                    borderColor: subtask.completed ? colors.success : colors.border,
                    backgroundColor: subtask.completed ? colors.success : 'transparent'
                  }}>
                  {subtask.completed ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : null}
                </View>
              </Pressable>
              <Pressable className="flex-1 active:opacity-70" onPress={() => onPress(subtask.id)}>
                <Text
                  className="text-sm"
                  style={{
                    color: colors.text,
                    textDecorationLine: subtask.completed ? 'line-through' : 'none'
                  }}>
                  {subtask.title}
                </Text>
              </Pressable>
            </View>
          ))
        : null}
    </View>
  )
})

export { ChecklistItemRow }
