import type { ChecklistItem, Recurrence } from '@/types/memo'

function computeNextTimestamp(from: number, recurrence: Recurrence) {
  const date = new Date(from)
  const interval = recurrence.interval || 1

  if (recurrence.frequency === 'daily') {
    date.setDate(date.getDate() + interval)
  } else if (recurrence.frequency === 'weekly') {
    date.setDate(date.getDate() + 7 * interval)
  } else {
    date.setMonth(date.getMonth() + interval)
  }

  return date.getTime()
}

function createNextRecurrenceItem(completed: ChecklistItem): ChecklistItem | null {
  if (!completed.recurrence) {
    return null
  }

  const base = completed.dueAt ?? completed.reminderAt ?? Date.now()
  const nextDue = computeNextTimestamp(base, completed.recurrence)
  const nextReminder = completed.reminderAt ? computeNextTimestamp(completed.reminderAt, completed.recurrence) : undefined

  return {
    ...completed,
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    completed: false,
    completedAt: undefined,
    notificationId: undefined,
    dueAt: nextDue,
    reminderAt: nextReminder,
    createdAt: Date.now()
  }
}

export { computeNextTimestamp, createNextRecurrenceItem }
