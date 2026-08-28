interface Memo {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

interface ChecklistItem {
  id: string
  memoId?: string
  title: string
  completed: boolean
  reminderAt?: number
  notificationId?: string
  createdAt: number
}

type ChecklistFilter = 'all' | 'active' | 'reminder'

export type { ChecklistFilter, ChecklistItem, Memo }
