import type { ChecklistFilter, ChecklistItem, Memo } from '@/types/memo'

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next.getTime()
}

function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next.getTime()
}

function isToday(timestamp?: number) {
  if (!timestamp) {
    return false
  }
  const now = Date.now()
  return timestamp >= startOfDay(new Date(now)) && timestamp <= endOfDay(new Date(now))
}

function isUpcoming(timestamp?: number) {
  if (!timestamp) {
    return false
  }
  return timestamp > endOfDay(new Date())
}

function isOverdue(item: ChecklistItem) {
  const due = item.dueAt ?? item.reminderAt
  if (!due || item.completed) {
    return false
  }
  return due < startOfDay(new Date())
}

function matchesSearch(text: string, query: string) {
  if (!query.trim()) {
    return true
  }
  return text.toLowerCase().includes(query.trim().toLowerCase())
}

function filterMemos(memos: Memo[], query: string, includeDeleted: boolean) {
  return memos
    .filter((memo) => (includeDeleted ? Boolean(memo.deletedAt) : !memo.deletedAt))
    .filter(
      (memo) =>
        matchesSearch(memo.title, query) ||
        matchesSearch(memo.content, query) ||
        memo.tags.some((tag) => matchesSearch(tag, query))
    )
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1
      }
      return b.updatedAt - a.updatedAt
    })
}

function filterChecklistItems(options: {
  items: ChecklistItem[]
  filter: ChecklistFilter
  query: string
  listId?: string
  tag?: string
  hideCompleted: boolean
  includeDeleted: boolean
}) {
  const { items, filter, query, listId, tag, hideCompleted, includeDeleted } = options

  return items
    .filter((item) => !item.parentId)
    .filter((item) => (includeDeleted ? Boolean(item.deletedAt) : !item.deletedAt))
    .filter((item) => (hideCompleted ? !item.completed : true))
    .filter((item) => (listId ? item.listId === listId : true))
    .filter((item) => (tag ? item.tags.includes(tag) : true))
    .filter((item) => {
      if (!query.trim()) {
        return true
      }
      return (
        matchesSearch(item.title, query) || item.tags.some((entry) => matchesSearch(entry, query))
      )
    })
    .filter((item) => {
      const due = item.dueAt ?? item.reminderAt
      if (filter === 'active') {
        return !item.completed
      }
      if (filter === 'reminder') {
        return Boolean(item.reminderAt) && !item.completed
      }
      if (filter === 'today') {
        return isToday(due) && !item.completed
      }
      if (filter === 'upcoming') {
        return isUpcoming(due) && !item.completed
      }
      if (filter === 'overdue') {
        return isOverdue(item)
      }
      if (filter === 'high') {
        return item.priority === 'high' && !item.completed
      }
      return true
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

function findAllTags(memos: Memo[], items: ChecklistItem[]) {
  const tags = new Set<string>()
  memos.forEach((memo) => memo.tags.forEach((tag) => tags.add(tag)))
  items.forEach((item) => item.tags.forEach((tag) => tags.add(tag)))
  return Array.from(tags).sort()
}

function findSubtasks(items: ChecklistItem[], parentId: string) {
  return items.filter((item) => item.parentId === parentId && !item.deletedAt).sort((a, b) => a.sortOrder - b.sortOrder)
}

export {
  filterChecklistItems,
  filterMemos,
  findAllTags,
  findSubtasks,
  isOverdue,
  isToday,
  isUpcoming,
  matchesSearch
}
