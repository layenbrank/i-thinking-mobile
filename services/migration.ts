import type { ChecklistItem, Memo, TaskList, UserMemoData } from '@/types/memo'

const DATA_VERSION = 2
const INBOX_LIST_ID = 'inbox'

function createDefaultLists(): TaskList[] {
  const now = Date.now()
  return [
    { id: INBOX_LIST_ID, name: 'Inbox', color: '#1E3A8A', sortOrder: 0, createdAt: now },
    { id: 'work', name: 'Work', color: '#D97706', sortOrder: 1, createdAt: now },
    { id: 'personal', name: 'Personal', color: '#10B981', sortOrder: 2, createdAt: now }
  ]
}

function normalizeMemo(memo: Partial<Memo>, index: number): Memo {
  return {
    id: memo.id ?? `memo-${index}`,
    title: memo.title ?? 'Untitled',
    content: memo.content ?? '',
    tags: memo.tags ?? [],
    isPinned: memo.isPinned ?? false,
    deletedAt: memo.deletedAt,
    createdAt: memo.createdAt ?? Date.now(),
    updatedAt: memo.updatedAt ?? Date.now()
  }
}

function normalizeItem(item: Partial<ChecklistItem>, index: number): ChecklistItem {
  return {
    id: item.id ?? `item-${index}`,
    memoId: item.memoId,
    listId: item.listId ?? INBOX_LIST_ID,
    parentId: item.parentId,
    title: item.title ?? 'Untitled task',
    completed: item.completed ?? false,
    priority: item.priority ?? 'none',
    tags: item.tags ?? [],
    dueAt: item.dueAt,
    reminderAt: item.reminderAt,
    recurrence: item.recurrence,
    notificationId: item.notificationId,
    sortOrder: item.sortOrder ?? index,
    deletedAt: item.deletedAt,
    createdAt: item.createdAt ?? Date.now(),
    completedAt: item.completedAt
  }
}

function migrateUserData(raw: unknown): UserMemoData {
  if (!raw || typeof raw !== 'object') {
    return { version: DATA_VERSION, memos: [], items: [], lists: createDefaultLists() }
  }

  const payload = raw as Partial<UserMemoData> & { memos?: Partial<Memo>[]; items?: Partial<ChecklistItem>[] }

  if (payload.version === DATA_VERSION) {
    return {
      version: DATA_VERSION,
      memos: (payload.memos ?? []).map(normalizeMemo),
      items: (payload.items ?? []).map(normalizeItem),
      lists: payload.lists?.length ? payload.lists : createDefaultLists()
    }
  }

  return {
    version: DATA_VERSION,
    memos: (payload.memos ?? []).map(normalizeMemo),
    items: (payload.items ?? []).map(normalizeItem),
    lists: createDefaultLists()
  }
}

function createEmptyUserData(): UserMemoData {
  return { version: DATA_VERSION, memos: [], items: [], lists: createDefaultLists() }
}

export { createDefaultLists, createEmptyUserData, DATA_VERSION, INBOX_LIST_ID, migrateUserData }
