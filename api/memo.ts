import { mmkvStorage } from '@/stores/storage'
import { migrateUserData } from '@/services/migration'
import type { RSF } from '@/types/response'
import type {
  ChecklistItem,
  InsertChecklistItemInput,
  Memo,
  TaskList,
  UpdateChecklistItemInput,
  UserMemoData
} from '@/types/memo'

const MOCK_DELAY_MS = 200

function storageKey(userId: string) {
  return `memo:data:${userId}`
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

function readData(userId: string): UserMemoData {
  const raw = mmkvStorage.getItem(storageKey(userId))
  if (!raw) {
    return migrateUserData(null)
  }
  return migrateUserData(JSON.parse(raw))
}

function writeData(userId: string, data: UserMemoData) {
  mmkvStorage.setItem(storageKey(userId), JSON.stringify(data))
}

function fail<T>(code: number, message: string): Promise<RSF<T>> {
  return Promise.resolve({ code, message, data: null as T })
}

async function GET_MEMO_DATA(userId: string): Promise<RSF<UserMemoData>> {
  await delay(MOCK_DELAY_MS)
  return { code: 0, message: 'ok', data: readData(userId) }
}

async function PUT_MEMO_DATA(userId: string, data: UserMemoData): Promise<RSF<UserMemoData>> {
  await delay(MOCK_DELAY_MS)
  writeData(userId, data)
  return { code: 0, message: 'ok', data }
}

async function POST_MEMO(userId: string, title: string, content: string): Promise<RSF<Memo>> {
  await delay(MOCK_DELAY_MS)
  const data = readData(userId)
  const now = Date.now()
  const memo: Memo = {
    id: `memo-${now}`,
    title: title.trim() || 'Untitled',
    content,
    tags: [],
    isPinned: false,
    createdAt: now,
    updatedAt: now
  }
  data.memos.unshift(memo)
  writeData(userId, data)
  return { code: 0, message: 'ok', data: memo }
}

async function PUT_MEMO(
  userId: string,
  id: string,
  patch: Partial<Pick<Memo, 'title' | 'content' | 'tags' | 'isPinned'>>
): Promise<RSF<Memo>> {
  await delay(MOCK_DELAY_MS)
  const data = readData(userId)
  const memo = data.memos.find((entry) => entry.id === id)
  if (!memo) {
    return fail(404, 'Memo not found')
  }
  Object.assign(memo, patch, { updatedAt: Date.now() })
  writeData(userId, data)
  return { code: 0, message: 'ok', data: memo }
}

async function DELETE_MEMO(userId: string, id: string, soft = true): Promise<RSF<null>> {
  await delay(MOCK_DELAY_MS)
  const data = readData(userId)
  if (soft) {
    const memo = data.memos.find((entry) => entry.id === id)
    if (!memo) {
      return fail(404, 'Memo not found')
    }
    memo.deletedAt = Date.now()
  } else {
    data.memos = data.memos.filter((entry) => entry.id !== id)
    data.items = data.items.filter((entry) => entry.memoId !== id)
  }
  writeData(userId, data)
  return { code: 0, message: 'ok', data: null }
}

async function POST_CHECKLIST_ITEM(
  userId: string,
  input: InsertChecklistItemInput
): Promise<RSF<ChecklistItem>> {
  await delay(MOCK_DELAY_MS)
  const data = readData(userId)
  const item: ChecklistItem = {
    id: `item-${Date.now()}`,
    title: input.title.trim() || 'Untitled task',
    memoId: input.memoId,
    listId: input.listId ?? 'inbox',
    parentId: input.parentId,
    completed: false,
    priority: input.priority ?? 'none',
    tags: input.tags ?? [],
    dueAt: input.dueAt,
    reminderAt: input.reminderAt,
    recurrence: input.recurrence,
    sortOrder: data.items.length,
    createdAt: Date.now()
  }
  data.items.unshift(item)
  writeData(userId, data)
  return { code: 0, message: 'ok', data: item }
}

async function PUT_CHECKLIST_ITEM(
  userId: string,
  id: string,
  patch: UpdateChecklistItemInput
): Promise<RSF<ChecklistItem>> {
  await delay(MOCK_DELAY_MS)
  const data = readData(userId)
  const item = data.items.find((entry) => entry.id === id)
  if (!item) {
    return fail(404, 'Item not found')
  }
  if (patch.title !== undefined) item.title = patch.title
  if (patch.memoId !== undefined) item.memoId = patch.memoId
  if (patch.listId !== undefined) item.listId = patch.listId
  if (patch.priority !== undefined) item.priority = patch.priority
  if (patch.tags !== undefined) item.tags = patch.tags
  if (patch.dueAt === null) item.dueAt = undefined
  else if (patch.dueAt !== undefined) item.dueAt = patch.dueAt
  if (patch.reminderAt === null) item.reminderAt = undefined
  else if (patch.reminderAt !== undefined) item.reminderAt = patch.reminderAt
  if (patch.recurrence === null) item.recurrence = undefined
  else if (patch.recurrence !== undefined) item.recurrence = patch.recurrence
  writeData(userId, data)
  return { code: 0, message: 'ok', data: item }
}

async function DELETE_USER_DATA(userId: string): Promise<void> {
  mmkvStorage.removeItem(storageKey(userId))
}

export {
  DELETE_MEMO,
  DELETE_USER_DATA,
  GET_MEMO_DATA,
  POST_CHECKLIST_ITEM,
  POST_MEMO,
  PUT_CHECKLIST_ITEM,
  PUT_MEMO,
  PUT_MEMO_DATA,
  readData,
  writeData
}
