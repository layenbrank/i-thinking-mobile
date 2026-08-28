import { create } from 'zustand'

import { readData, writeData } from '@/api/memo'
import {
  filterChecklistItems,
  filterMemos,
  findAllTags,
  findSubtasks
} from '@/services/memoFilters'
import { createNextRecurrenceItem } from '@/services/recurrence'
import { cancelItemReminder, scheduleItemReminder } from '@/services/notifications'
import { INBOX_LIST_ID, migrateUserData } from '@/services/migration'
import type {
  ChecklistFilter,
  ChecklistItem,
  InsertChecklistItemInput,
  Memo,
  Priority,
  TaskList,
  UpdateChecklistItemInput,
  UserMemoData
} from '@/types/memo'

interface UndoAction {
  type: 'memo' | 'item'
  id: string
}

interface MemoState {
  memos: Memo[]
  items: ChecklistItem[]
  lists: TaskList[]
  filter: ChecklistFilter
  searchQuery: string
  activeListId: string | undefined
  activeTag: string | undefined
  isHydrated: boolean
  undoAction: UndoAction | null
  hydrate: (userId: string) => void
  replaceData: (data: UserMemoData) => void
  setFilter: (filter: ChecklistFilter) => void
  setSearchQuery: (query: string) => void
  setActiveListId: (listId: string | undefined) => void
  setActiveTag: (tag: string | undefined) => void
  insertMemo: (title: string, content: string) => Memo
  updateMemo: (id: string, patch: Partial<Pick<Memo, 'title' | 'content' | 'tags' | 'isPinned'>>) => void
  togglePinMemo: (id: string) => void
  softDeleteMemo: (id: string) => UndoAction
  restoreMemo: (id: string) => void
  purgeMemo: (id: string) => void
  findMemo: (id: string) => Memo | undefined
  filteredMemos: (includeDeleted?: boolean) => Memo[]
  insertChecklistItem: (input: InsertChecklistItemInput) => Promise<ChecklistItem>
  updateChecklistItem: (id: string, patch: UpdateChecklistItemInput) => Promise<void>
  toggleChecklistItem: (id: string) => Promise<void>
  softDeleteChecklistItem: (id: string) => Promise<UndoAction>
  restoreChecklistItem: (id: string) => Promise<void>
  purgeChecklistItem: (id: string) => Promise<void>
  insertSubtask: (parentId: string, title: string) => Promise<ChecklistItem>
  findItemsByMemo: (memoId: string) => ChecklistItem[]
  findSubtasks: (parentId: string) => ChecklistItem[]
  filteredItems: (options?: { hideCompleted?: boolean; includeDeleted?: boolean }) => ChecklistItem[]
  findTags: () => string[]
  clearUndo: () => void
  clearUserData: () => void
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

async function syncReminder(item: ChecklistItem, previousId: string) {
  await cancelItemReminder(previousId)
  if (item.reminderAt && item.reminderAt > Date.now() && !item.completed) {
    const notificationId = await scheduleItemReminder(item)
    return { ...item, notificationId }
  }
  return { ...item, notificationId: undefined }
}

const useMemoStore = create<MemoState>((set, get) => ({
  memos: [],
  items: [],
  lists: [],
  filter: 'all',
  searchQuery: '',
  activeListId: undefined,
  activeTag: undefined,
  isHydrated: false,
  undoAction: null,

  hydrate(userId) {
    const data = migrateUserData(readData(userId))
    set({
      memos: data.memos,
      items: data.items,
      lists: data.lists,
      isHydrated: true
    })
  },

  replaceData(data) {
    set({
      memos: data.memos,
      items: data.items,
      lists: data.lists.length ? data.lists : migrateUserData(null).lists
    })
  },

  setFilter(filter) {
    set({ filter })
  },

  setSearchQuery(query) {
    set({ searchQuery: query })
  },

  setActiveListId(listId) {
    set({ activeListId: listId })
  },

  setActiveTag(tag) {
    set({ activeTag: tag })
  },

  insertMemo(title, content) {
    const now = Date.now()
    const memo: Memo = {
      id: createId('memo'),
      title: title.trim() || 'Untitled',
      content,
      tags: [],
      isPinned: false,
      createdAt: now,
      updatedAt: now
    }
    set({ memos: [memo, ...get().memos] })
    return memo
  },

  updateMemo(id, patch) {
    set({
      memos: get().memos.map((memo) =>
        memo.id === id
          ? {
              ...memo,
              ...patch,
              title: patch.title !== undefined ? patch.title.trim() || 'Untitled' : memo.title,
              updatedAt: Date.now()
            }
          : memo
      )
    })
  },

  togglePinMemo(id) {
    set({
      memos: get().memos.map((memo) =>
        memo.id === id ? { ...memo, isPinned: !memo.isPinned, updatedAt: Date.now() } : memo
      )
    })
  },

  softDeleteMemo(id) {
    set({
      memos: get().memos.map((memo) =>
        memo.id === id ? { ...memo, deletedAt: Date.now(), updatedAt: Date.now() } : memo
      ),
      undoAction: { type: 'memo', id }
    })
    return { type: 'memo', id }
  },

  restoreMemo(id) {
    set({
      memos: get().memos.map((memo) =>
        memo.id === id ? { ...memo, deletedAt: undefined, updatedAt: Date.now() } : memo
      ),
      undoAction: null
    })
  },

  purgeMemo(id) {
    set({
      memos: get().memos.filter((memo) => memo.id !== id),
      items: get().items.filter((item) => item.memoId !== id)
    })
  },

  findMemo(id) {
    return get().memos.find((memo) => memo.id === id && !memo.deletedAt)
  },

  filteredMemos(includeDeleted = false) {
    let result = filterMemos(get().memos, get().searchQuery, includeDeleted)
    if (get().activeTag) {
      result = result.filter((memo) => memo.tags.includes(get().activeTag!))
    }
    return result
  },

  async insertChecklistItem(input) {
    const item: ChecklistItem = {
      id: createId('item'),
      title: input.title.trim() || 'Untitled task',
      memoId: input.memoId,
      listId: input.listId ?? get().activeListId ?? INBOX_LIST_ID,
      parentId: input.parentId,
      completed: false,
      priority: input.priority ?? 'none',
      tags: input.tags ?? [],
      dueAt: input.dueAt,
      reminderAt: input.reminderAt,
      recurrence: input.recurrence,
      sortOrder: get().items.length,
      createdAt: Date.now()
    }

    let next = item
    if (item.reminderAt && item.reminderAt > Date.now()) {
      next = await syncReminder(item, item.id)
    }

    set({ items: [next, ...get().items] })
    return next
  },

  async updateChecklistItem(id, patch) {
    const items = get().items
    const current = items.find((item) => item.id === id)
    if (!current) {
      return
    }

    let next: ChecklistItem = {
      ...current,
      ...patch,
      title: patch.title !== undefined ? patch.title.trim() || 'Untitled task' : current.title,
      dueAt: patch.dueAt === null ? undefined : patch.dueAt ?? current.dueAt,
      reminderAt: patch.reminderAt === null ? undefined : patch.reminderAt ?? current.reminderAt,
      recurrence: patch.recurrence === null ? undefined : patch.recurrence ?? current.recurrence
    }

    if (patch.reminderAt !== undefined || patch.dueAt !== undefined) {
      next = await syncReminder(next, current.id)
    }

    set({ items: items.map((item) => (item.id === id ? next : item)) })
  },

  async toggleChecklistItem(id) {
    const items = get().items
    const current = items.find((item) => item.id === id)
    if (!current) {
      return
    }

    const completed = !current.completed
    let next: ChecklistItem = {
      ...current,
      completed,
      completedAt: completed ? Date.now() : undefined
    }

    if (completed) {
      await cancelItemReminder(current.id)
      next = { ...next, notificationId: undefined }

      const recurring = createNextRecurrenceItem(current)
      if (recurring) {
        const scheduled = recurring.reminderAt
          ? await syncReminder(recurring, recurring.id)
          : recurring
        set({
          items: [scheduled, ...items.map((item) => (item.id === id ? next : item))]
        })
        return
      }
    } else if (current.reminderAt && current.reminderAt > Date.now()) {
      next = await syncReminder(next, current.id)
    }

    set({ items: items.map((item) => (item.id === id ? next : item)) })
  },

  async softDeleteChecklistItem(id) {
    await cancelItemReminder(id)
    set({
      items: get().items.map((item) => (item.id === id ? { ...item, deletedAt: Date.now() } : item)),
      undoAction: { type: 'item', id }
    })
    return { type: 'item', id }
  },

  async restoreChecklistItem(id) {
    const item = get().items.find((entry) => entry.id === id)
    if (!item) {
      return
    }
    let next: ChecklistItem = { ...item, deletedAt: undefined }
    if (next.reminderAt && next.reminderAt > Date.now() && !next.completed) {
      next = { ...(await syncReminder(next, id)), deletedAt: undefined }
    }
    set({
      items: get().items.map((entry) => (entry.id === id ? next : entry)),
      undoAction: null
    })
  },

  async purgeChecklistItem(id) {
    await cancelItemReminder(id)
    set({ items: get().items.filter((item) => item.id !== id && item.parentId !== id) })
  },

  async insertSubtask(parentId, title) {
    const parent = get().items.find((item) => item.id === parentId)
    return get().insertChecklistItem({
      title,
      parentId,
      listId: parent?.listId,
      memoId: parent?.memoId,
      priority: parent?.priority ?? 'none',
      tags: parent?.tags ?? []
    })
  },

  findItemsByMemo(memoId) {
    return get()
      .items.filter((item) => item.memoId === memoId && !item.parentId && !item.deletedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  findSubtasks(parentId) {
    return findSubtasks(get().items, parentId)
  },

  filteredItems(options) {
    return filterChecklistItems({
      items: get().items,
      filter: get().filter,
      query: get().searchQuery,
      listId: get().activeListId,
      tag: get().activeTag,
      hideCompleted: options?.hideCompleted ?? false,
      includeDeleted: options?.includeDeleted ?? false
    })
  },

  findTags() {
    return findAllTags(get().memos, get().items)
  },

  clearUndo() {
    set({ undoAction: null })
  },

  clearUserData() {
    set({
      memos: [],
      items: [],
      lists: [],
      isHydrated: false,
      undoAction: null,
      searchQuery: '',
      activeListId: undefined,
      activeTag: undefined
    })
  }
}))

function subscribeMemoPersistence(userId: string) {
  return useMemoStore.subscribe((state, prev) => {
    if (
      state.memos !== prev.memos ||
      state.items !== prev.items ||
      state.lists !== prev.lists
    ) {
      writeData(userId, {
        version: 2,
        memos: state.memos,
        items: state.items,
        lists: state.lists
      })
    }
  })
}

export { subscribeMemoPersistence, useMemoStore }
