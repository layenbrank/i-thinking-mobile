import { mmkvStorage } from '@/stores/storage'
import { useMemoStore } from '@/stores/memoStore'

jest.mock('@/services/notifications', () => ({
  scheduleItemReminder: jest.fn(async () => 'mock-notification-id'),
  cancelItemReminder: jest.fn(async () => undefined)
}))

describe('memoStore', () => {
  const userId = 'test-user'

  beforeEach(() => {
    mmkvStorage.removeItem(`memo:data:${userId}`)
    useMemoStore.setState({
      memos: [],
      items: [],
      lists: [],
      filter: 'all',
      searchQuery: '',
      isHydrated: false,
      undoAction: null
    })
  })

  test('insertMemo adds memo to state', () => {
    const memo = useMemoStore.getState().insertMemo('Hello', 'World')
    expect(useMemoStore.getState().memos).toHaveLength(1)
    expect(memo.title).toBe('Hello')
  })

  test('filteredItems respects today filter', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    await useMemoStore.getState().insertChecklistItem({
      title: 'Future',
      dueAt: tomorrow.getTime()
    })
    useMemoStore.getState().setFilter('upcoming')
    expect(useMemoStore.getState().filteredItems()).toHaveLength(1)
  })

  test('hydrate loads migrated data', () => {
    mmkvStorage.setItem(
      `memo:data:${userId}`,
      JSON.stringify({
        memos: [{ id: 'm1', title: 'Saved', content: '', createdAt: 1, updatedAt: 1 }],
        items: []
      })
    )
    useMemoStore.getState().hydrate(userId)
    expect(useMemoStore.getState().memos[0].title).toBe('Saved')
    expect(useMemoStore.getState().lists.length).toBeGreaterThan(0)
  })
})
