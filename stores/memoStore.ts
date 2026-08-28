import { create } from 'zustand'

import { cancelItemReminder, scheduleItemReminder } from '@/services/notifications'
import { mmkvStorage } from '@/stores/storage'
import type { ChecklistFilter, ChecklistItem, Memo } from '@/types/memo'

interface MemoState {
  memos: Memo[]
  items: ChecklistItem[]
  filter: ChecklistFilter
  isHydrated: boolean
  hydrate: (userId: string) => void
  setFilter: (filter: ChecklistFilter) => void
  insertMemo: (title: string, content: string) => Memo
  updateMemo: (id: string, title: string, content: string) => void
  removeMemo: (id: string) => void
  findMemo: (id: string) => Memo | undefined
  insertChecklistItem: (title: string, memoId?: string, reminderAt?: number) => Promise<ChecklistItem>
  updateChecklistItem: (
    id: string,
    patch: Partial<Pick<ChecklistItem, 'title' | 'reminderAt' | 'memoId'>>
  ) => Promise<void>
  toggleChecklistItem: (id: string) => Promise<void>
  removeChecklistItem: (id: string) => Promise<void>
  findItemsByMemo: (memoId: string) => ChecklistItem[]
  filteredItems: () => ChecklistItem[]
  clearUserData: () => void
}

function storageKey(userId: string) {
  return `memo:data:${userId}`
}

function readData(userId: string): { memos: Memo[]; items: ChecklistItem[] } {
  const raw = mmkvStorage.getItem(storageKey(userId))
  if (!raw) {
    return { memos: [], items: [] }
  }
  return JSON.parse(raw) as { memos: Memo[]; items: ChecklistItem[] }
}

function writeData(userId: string, memos: Memo[], items: ChecklistItem[]) {
  mmkvStorage.setItem(storageKey(userId), JSON.stringify({ memos, items }))
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const useMemoStore = create<MemoState>((set, get) => ({
  memos: [],
  items: [],
  filter: 'all',
  isHydrated: false,

  hydrate(userId) {
    const data = readData(userId)
    set({ memos: data.memos, items: data.items, isHydrated: true })
  },

  setFilter(filter) {
    set({ filter })
  },

  insertMemo(title, content) {
    const now = Date.now()
    const memo: Memo = {
      id: createId('memo'),
      title: title.trim() || 'Untitled',
      content,
      createdAt: now,
      updatedAt: now
    }
    const memos = [memo, ...get().memos]
    set({ memos })
    return memo
  },

  updateMemo(id, title, content) {
    const memos = get().memos.map((memo) =>
      memo.id === id ? { ...memo, title: title.trim() || 'Untitled', content, updatedAt: Date.now() } : memo
    )
    set({ memos })
  },

  removeMemo(id) {
    const items = get().items.filter((item) => item.memoId !== id)
    const memos = get().memos.filter((memo) => memo.id !== id)
    set({ memos, items })
  },

  findMemo(id) {
    return get().memos.find((memo) => memo.id === id)
  },

  async insertChecklistItem(title, memoId, reminderAt) {
    const item: ChecklistItem = {
      id: createId('item'),
      title: title.trim() || 'Untitled task',
      memoId,
      completed: false,
      reminderAt,
      createdAt: Date.now()
    }

    if (reminderAt && reminderAt > Date.now()) {
      const notificationId = await scheduleItemReminder(item)
      item.notificationId = notificationId
    }

    const items = [item, ...get().items]
    set({ items })
    return item
  },

  async updateChecklistItem(id, patch) {
    const items = get().items
    const current = items.find((item) => item.id === id)
    if (!current) {
      return
    }

    let next: ChecklistItem = { ...current, ...patch }

    if (patch.reminderAt !== undefined) {
      await cancelItemReminder(current.id)
      if (patch.reminderAt && patch.reminderAt > Date.now() && !next.completed) {
        const notificationId = await scheduleItemReminder(next)
        next = { ...next, notificationId }
      } else {
        next = { ...next, notificationId: undefined }
      }
    }

    set({
      items: items.map((item) => (item.id === id ? next : item))
    })
  },

  async toggleChecklistItem(id) {
    const items = get().items
    const current = items.find((item) => item.id === id)
    if (!current) {
      return
    }

    const completed = !current.completed
    let next: ChecklistItem = { ...current, completed }

    if (completed) {
      await cancelItemReminder(current.id)
      next = { ...next, notificationId: undefined }
    } else if (current.reminderAt && current.reminderAt > Date.now()) {
      const notificationId = await scheduleItemReminder(next)
      next = { ...next, notificationId }
    }

    set({
      items: items.map((item) => (item.id === id ? next : item))
    })
  },

  async removeChecklistItem(id) {
    await cancelItemReminder(id)
    set({ items: get().items.filter((item) => item.id !== id) })
  },

  findItemsByMemo(memoId) {
    return get().items.filter((item) => item.memoId === memoId)
  },

  filteredItems() {
    const { items, filter } = get()
    if (filter === 'active') {
      return items.filter((item) => !item.completed)
    }
    if (filter === 'reminder') {
      return items.filter((item) => item.reminderAt && !item.completed)
    }
    return items
  },

  clearUserData() {
    set({ memos: [], items: [], isHydrated: false })
  }
}))

function persistMemoStore(userId: string) {
  const { memos, items } = useMemoStore.getState()
  writeData(userId, memos, items)
}

function subscribeMemoPersistence(userId: string) {
  return useMemoStore.subscribe((state, prev) => {
    if (state.memos !== prev.memos || state.items !== prev.items) {
      writeData(userId, state.memos, state.items)
    }
  })
}

export { subscribeMemoPersistence, useMemoStore }
