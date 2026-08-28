type Priority = 'none' | 'low' | 'medium' | 'high'
type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly'

interface Recurrence {
  frequency: RecurrenceFrequency
  interval: number
}

interface TaskList {
  id: string
  name: string
  color: string
  sortOrder: number
  createdAt: number
}

interface Memo {
  id: string
  title: string
  content: string
  tags: string[]
  isPinned: boolean
  deletedAt?: number
  createdAt: number
  updatedAt: number
}

interface ChecklistItem {
  id: string
  memoId?: string
  listId: string
  parentId?: string
  title: string
  completed: boolean
  priority: Priority
  tags: string[]
  dueAt?: number
  reminderAt?: number
  recurrence?: Recurrence
  notificationId?: string
  sortOrder: number
  deletedAt?: number
  createdAt: number
  completedAt?: number
}

type ChecklistFilter =
  | 'all'
  | 'active'
  | 'reminder'
  | 'today'
  | 'upcoming'
  | 'overdue'
  | 'high'

interface UserMemoData {
  version: number
  memos: Memo[]
  items: ChecklistItem[]
  lists: TaskList[]
}

interface InsertChecklistItemInput {
  title: string
  memoId?: string
  listId?: string
  parentId?: string
  dueAt?: number
  reminderAt?: number
  priority?: Priority
  tags?: string[]
  recurrence?: Recurrence
}

interface UpdateChecklistItemInput {
  title?: string
  memoId?: string
  listId?: string
  dueAt?: number | null
  reminderAt?: number | null
  priority?: Priority
  tags?: string[]
  recurrence?: Recurrence | null
}

export type {
  ChecklistFilter,
  ChecklistItem,
  InsertChecklistItemInput,
  Memo,
  Priority,
  Recurrence,
  RecurrenceFrequency,
  TaskList,
  UpdateChecklistItemInput,
  UserMemoData
}
