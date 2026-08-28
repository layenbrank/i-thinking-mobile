import cancelScheduledNotificationAsync from 'expo-notifications/build/cancelScheduledNotificationAsync'
import scheduleNotificationAsync from 'expo-notifications/build/scheduleNotificationAsync'

import {
  cancelItemReminder,
  reminderIdentifier,
  scheduleItemReminder
} from '@/services/notifications'
import type { ChecklistItem } from '@/types/memo'

jest.mock('expo-notifications/build/NotificationsHandler', () => ({
  setNotificationHandler: jest.fn()
}))

jest.mock('expo-notifications/build/NotificationsEmitter', () => ({
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() }))
}))

jest.mock('expo-notifications/build/NotificationPermissions', () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true }))
}))

jest.mock('expo-notifications/build/NotificationPermissions.types', () => ({
  IosAuthorizationStatus: { PROVISIONAL: 3 }
}))

jest.mock('expo-notifications/build/NotificationChannelManager.types', () => ({
  AndroidImportance: { MAX: 7 }
}))

jest.mock('expo-notifications/build/Notifications.types', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' }
}))

jest.mock('expo-notifications/build/setNotificationChannelAsync', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('expo-notifications/build/cancelScheduledNotificationAsync', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('expo-notifications/build/scheduleNotificationAsync', () => ({
  __esModule: true,
  default: jest.fn(async () => 'scheduled-id')
}))

describe('notifications service', () => {
  const item: ChecklistItem = {
    id: 'item-1',
    listId: 'inbox',
    title: 'Buy milk',
    completed: false,
    priority: 'none',
    tags: [],
    sortOrder: 0,
    reminderAt: Date.now() + 60000,
    createdAt: Date.now()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('scheduleItemReminder cancels then schedules with stable id', async () => {
    const id = await scheduleItemReminder(item)
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith(reminderIdentifier('item-1'))
    expect(scheduleNotificationAsync).toHaveBeenCalled()
    expect(id).toBe(reminderIdentifier('item-1'))
  })

  test('cancelItemReminder uses stable identifier', async () => {
    await cancelItemReminder('item-1')
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('reminder-item-1')
  })
})
